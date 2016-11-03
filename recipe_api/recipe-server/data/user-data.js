const sha256 = require('sha256');
const uuid = require('node-uuid');
const bcrypt = require('bcrypt-then');
const redis = require('redis');

let exportedMethods = {
    // Adds a new user
    addUser(username, password) {
        var client = redis.createClient();

        return new Promise((resolve, reject) => {
            // Error checking
            if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
                client.quit();
                reject(new TypeError('Invalid Arguments.'));
            }
                
            client.hgetall("users", (err, users) => {
                if (err) {
                    client.quit();
                    reject(err);
                } else {
                    resolve(users);
                }                
            });
        }).then((users) => {
            var userId = sha256(username);

            // Check if username already exists
            if (users && users[userId]) {
                client.quit();
                return Promise.reject(new Error('Username already exists.'));
            } else {
                return Promise.resolve(userId);
            }
        }).then((userId) => {

            return bcrypt.hash(password, 10).then((hash) => {
                // HSET new user into users with userId as the key
                var user = JSON.stringify({
                    username: username,
                    password: hash
                });

                client.hmset('users', userId, user, (err) => {
                    client.quit();
                    
                    if (err) {
                        return Promise.reject(err);
                    } else {
                        return Promise.resolve(true);
                    }
                });
            });
        });            
    },
    // Generates a new Session token for an existing user
    generateSession(username, password) {
        var client = redis.createClient();

        return new Promise((resolve, reject) => {
            // Error checking
            if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
                client.quit();
                reject(new TypeError('Invalid Arguments.'));
            }
                
            client.hgetall("users", (err, users) => {
                if (err) {
                    client.quit();
                    reject(err);
                }

                resolve(users);             
            });
        }).then((users) => {
            var userId = sha256(username);

            // Check if username exists
            if (!users || !users[userId]) {
                client.quit();
                return Promise.reject(new Error('Invalid username.'));
            }

            return Promise.resolve({ userId: userId, user: JSON.parse(users[userId]) });

        }).then((data) => {
            // Check that password is valid and generate Session token if so
            return bcrypt.compare(password, data.user.password).then((valid) => {
                if (!valid) {
                    client.quit();
                    return Promise.reject(new Error('Incorrect password.'));
                }

                // Generate Session token, cache it in the users hash set and return it
                return bcrypt.hash(uuid.v4() + username + (new Date()).toString(), 10).then((token) => {
                    data.user.token = token;

                    return new Promise((resolve, reject) => {
                        client.hmset('users', data.userId, JSON.stringify(data.user), (err) => {
                            client.quit();
                            
                            if (err) {
                                reject(err);
                            }

                            resolve(token);
                        });
                    });
                });
            });
        });            
    },
    // Generates a new Session token for an existing user
    deleteUser(username) {
        var client = redis.createClient();

        return new Promise((resolve, reject) => {                
            client.hgetall("users", (err, users) => {
                if (err) {
                    client.quit();
                    reject(err);
                }

                resolve(users);             
            });
        }).then((users) => {
            var userId = sha256(username);

            return new Promise((resolve, reject) => {
                // "Delete" the user by setting the value at the related userId to ''
                client.hmset('users', userId, '', (err) => {
                    client.quit();
                    
                    if (err) {
                        reject(err);
                    }

                    resolve(true);
                });
            });
        });       
    }
}

module.exports = exportedMethods;