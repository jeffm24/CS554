const express = require('express');
const router = express.Router();
const userData = require('../data/user-data');
const redis = require('redis');
const cache = require('express-redis-cache')();
const authenticate = require('../auth').authenticate;

router.post('/', (req, res) => {
    userData
        .addUser(req.body)
        .then((result) => {
            res.status(result.status).json({userId: result.userId});
        })
        .catch((err) => {
            res.status(err.status).send({error: err.error.message});
        });
});

router.post('/session', (req, res) => {
    userData
        .generateSession(req.body.username, req.body.password)
        .then((result) => {
            res.status(result.status).json({authToken: result.token});
        })
        .catch((err) => {
            res.status(err.status).send({error: err.error.message});
        });
});

router.get('/:id',
    // middleware to define cache name 
    function (req, res, next) {
        res.express_redis_cache_name = 'user' + req.params.id + 'Data';
        next();
    },
    // cache middleware (expires in 5 mins)
    cache.route(5 * 60),
    function (req, res) {
        userData
            .getUserData(req.params.id)
            .then((result) => {
                res.status(result.status).json(result.userData);
            })
            .catch((err) => {
                res.status(err.status).send({error: err.error.message});
            });
    }
);

router.get('/',
    // middleware to define cache name 
    function (req, res, next) {
        res.express_redis_cache_name = 'usersData';
        next();
    },
    // cache middleware (expires in 10 mins)
    cache.route(10 * 60),
    function (req, res) {
        userData
            .getAllUserData()
            .then((result) => {
                res.status(result.status).json(result.userData);
            })
            .catch((err) => {
                res.status(err.status).send({error: err.error.message});
            });
    }
);

router.put('/', authenticate, (req, res) => {
    userData
        .updateUser(req.user.username, req.body.newProfile)
        .then((result) => {
            // Recache the user
            var cacheName = 'user' + result.userId + 'Data';
            var userCacheData = JSON.stringify({ 
                id: result.userId,
                username: req.user.username,
                profile: result.newProfile
            });
            
            // refresh the cached entry for the user
            cache.add(cacheName, userCacheData, { expire: 5 * 60, type: 'json' }, (err, added) => {
                res.status(result.status).json({success: result.newProfile});
            });         
        })
        .catch((err) => {
            res.status(err.status).send({error: err.error.message});
        });
});

router.delete('/', authenticate, (req, res) => {
    userData
        .deleteUser(req.user.username)
        .then((result) => {
            res.status(result.status).json({success: 'User successfully deleted!'});
        })
        .catch((err) => {
            res.status(err.status).send({error: err.error.message});
        });
});


module.exports = router;