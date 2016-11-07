const redis = require('redis');

let exportedMethods = {
    // Token authentication middleware
    authenticate(req, res, next) {
        var client = redis.createClient();
        var authToken = req.get('Auth-Token');

        client.hget('sessions', authToken, (err, userId) => {
            if (err) {
                res.status(500).send({error: err});
                return;
            }

            // Check auth-token
            if (!userId) {
                res.status(400).send({error: 'Invalid auth-token.'});
                return;
            }

            client.hget('users', userId, (err, user) => {
                if (err) {
                    client.quit();

                    res.status(500).send({error: err});
                    return;
                } else if (!user) {
                    client.hdel('sessions', authToken);
                    client.quit();

                    res.status(500).send({error: 'User no longer exists.'});
                    return;
                }

                client.quit();

                user = JSON.parse(user);

                req.user = {username: user.username, userId: userId};

                next();
            });
        });
    }
};

module.exports = exportedMethods;