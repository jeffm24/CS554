const sha256 = require('sha256');
const uuid = require('node-uuid');
const bcrypt = require('bcrypt-then');
const redis = require('redis');
const Ajv = require('ajv');
const ajv = new Ajv();

// Schemas for validation
const updateProfileSchema = {
    type: "object",
    properties: {
        fName: {type: 'string'},
        lName: {type: 'string'},
        email: {type: 'string'}
    },
    additionalProperties: false
};
const userSchema = {
    type: "object",
    properties: {
        username: {type: 'string'},
        password: {type: 'string'},
        profile: {
            type: "object",
            properties: {
                fName: {type: 'string'},
                lName: {type: 'string'},
                email: {type: 'string'}
            },
            required: ['fName', 'lName', 'email'],
            additionalProperties: false
        }
    },
    required: ['username', 'password', 'profile'],
    additionalProperties: false
};

let exportedMethods = {
    // Adds a new user
    addUser(newUser) {
        // Error checking
        if (!ajv.validate(userSchema, newUser)) {
            return Promise.reject({ status: 400, error: new TypeError('Invalid Arguments.') });
        }

        var client = redis.createClient();

        return new Promise((resolve, reject) => {    
            var userId = sha256(newUser.username);

            client.hget('users', userId, (err, user) => {
                if (err) {
                    client.quit();
                    return reject({ status: 500, error: err });
                } else if (user) {
                    client.quit();
                    return reject({ status: 400, error: new Error('Username already exists.') });
                }

                return resolve(userId);              
            });
        }).then((userId) => {

            return bcrypt.hash(newUser.password, 10).then((hash) => {
                // HSET new user into users with userId as the key
                newUser.password = hash;

                return new Promise((resolve, reject) => {

                    client.hset('users', userId, JSON.stringify(newUser), (err) => {
                        client.quit();
                        
                        if (err) {
                            return reject({ status: 500, error: err });
                        }

                        return resolve({ status: 201, userId: userId });
                    });
                });
            });
        });            
    },
    // Generates a new Session token for an existing user
    generateSession(username, password) {
        // Error checking
        if (!ajv.validate({type: 'string'}, username) || !ajv.validate({type: 'string'}, password)) {
            return Promise.reject({ status: 400, error: new TypeError('Invalid Arguments.') });
        }

        var client = redis.createClient();

        return new Promise((resolve, reject) => {
            var userId = sha256(username);

            client.hget('users', userId, (err, user) => {
                if (err) {
                    client.quit();
                    return reject({ status: 500, error: err });
                } else if (!user) {
                    client.quit();
                    return reject({ status: 400, error: new TypeError('Invalid username.') });
                }

                return resolve({ userId: userId, user: JSON.parse(user) });           
            });
        }).then((data) => {

            return new Promise((resolve, reject) => {
                // Check if session already exists for the user
                client.hgetall('sessions', (err, sessions) => {
                    if (err) {
                        client.quit();
                        return reject({ status: 500, error: err });
                    }

                    if (sessions) {
                        for (let token in sessions) {
                            // If the userId matches the user's id, delete the session token
                            if (sessions[token] === data.userId) {
                                client.hdel('sessions', token);
                                break;
                            }
                        }
                    }

                    return resolve(data);
                });
            });
        }).then((data) => {
            // Check that password is valid and generate Session token if so
            return bcrypt.compare(password, data.user.password).then((valid) => {
                if (!valid) {
                    client.quit();
                    return Promise.reject({ status: 401, error: new Error('Incorrect password.') });
                }

                // Generate Session token, cache it in the sessions hash set mapped to the userId and return it
                return bcrypt.hash(uuid.v4() + username + (new Date()).toString(), 10).then((token) => {
                    
                    return new Promise((resolve, reject) => {
                        client.hset('sessions', token, data.userId, (err) => {
                            client.quit();
                            
                            if (err) {
                                return reject({ status: 500, error: err });
                            }

                            return resolve({ status: 201, token: token });
                        });
                    });
                });
            });
        });            
    },
    // Gets public-facing user data about a specific user given a userId
    getUserData(userId) {

        return new Promise((resolve, reject) => {
            // Error checking
            if (!ajv.validate({type: 'string'}, userId)) {
                return reject({ status: 400, error: new TypeError('Invalid Arguments.') });
            }

            var client = redis.createClient();
                
            client.hget('users', userId, (err, user) => {
                client.quit();

                if (err) {
                    return reject({ status: 500, error: err });
                } else if (!user) {
                    return reject({ status: 400, error: new Error('Invalid userId.') });
                }

                user = JSON.parse(user);
                
                return resolve({ status: 200, userData: {id: userId, username: user.username, profile: user.profile} });             
            });
        });
    },
    // Gets public-facing data for all users
    getAllUserData() {

        return new Promise((resolve, reject) => {
            var client = redis.createClient();
                
            client.hgetall('users', (err, users) => {
                client.quit();

                if (err) {
                    return reject({ status: 500, error: err });
                } 
                
                // Return no content status and no users found message if no users exist
                if (!users) {
                    return resolve({ status: 200, userData: {} });
                }

                // Otherwise parse all users into json and remove private fields before returning
                for (let id in users) {
                    users[id] = JSON.parse(users[id]);
                    delete users[id].password;
                }
                
                return resolve({ status: 200, userData: users });             
            });
        });
    },
    // Updates the profile of the user associated with the given username (must be previously authenticated)
    updateUser(userId, newProfile) {

        if (!ajv.validate(updateProfileSchema, newProfile)) {
            return Promise.reject({ status: 400, error: new TypeError('Invalid Arguments.') });
        } else if (newProfile === {}) {
            // Empty update obj - just return 200 status
            return Promise.resolve({ status: 200 });
        }

        var client = redis.createClient();

        return new Promise((resolve, reject) => {
            client.hget('users', userId, (err, user) => {
                if (err) {
                    client.quit();
                    return reject({ status: 500, error: err });
                }

                return resolve(JSON.parse(user));             
            });
        }).then((user) => {

            // Set updated fields
            for (let field in newProfile) {
                user.profile[field] = newProfile[field];
            }

            // Update the user in redis
            return new Promise((resolve, reject) => {
                client.hset('users', userId, JSON.stringify(user), (err) => {
                    client.quit();
                    
                    if (err) {
                        return reject({ status: 500, error: err });
                    }

                    return resolve({ status: 200, user: user });
                });
            });
        });
    },
    // Deletes the user assoicated with the given username (must be previously authenticated)
    deleteUser(userId) {
        var client = redis.createClient();

        return new Promise((resolve, reject) => {     
            // Delete the user
            client.hdel('users', userId, (err) => {                
                if (err) {
                    client.quit();
                    return reject({ status: 500, error: err });
                }

                return resolve();
            });
        }).then((user) => {
            return new Promise((resolve, reject) => {
                // delete session associated with the user
                client.hgetall('sessions', (err, sessions) => {
                    if (err) {
                        client.quit();
                        return reject({ status: 500, error: err });
                    }

                    if (sessions) {
                        for (let token in sessions) {
                            // If the userId matches the user's id, delete the session token
                            if (sessions[token] === userId) {
                                client.hdel('sessions', token, (err) => {
                                    client.quit();

                                    if (err) {
                                        return reject({ status: 500, error: err });
                                    }

                                    return resolve({status: 200});
                                });
                            }
                        }
                    }
                });
            });
        });   
    }
}

module.exports = exportedMethods;