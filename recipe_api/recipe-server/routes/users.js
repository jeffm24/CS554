const express = require('express');
const router = express.Router();
const userData = require('../data/user-data');
const passport = require('passport');


router.post('/', (req, res) => {
    userData
        .addUser(req.body.username, req.body.password)
        .then((ok) => {
            res.json({success: 'User successfully added!'});
        })
        .catch((err) => {
            // Something went wrong with the server!
            res.status(500).send({error: err.message});
        });
});

router.post('/session', (req, res) => {
    userData
        .generateSession(req.body.username, req.body.password)
        .then((token) => {
            res.json({success: 'Your token is: ' + token});
        })
        .catch((err) => {
            // Something went wrong with the server!
            res.status(500).send({error: err.message});
        });
});

router.delete('/', passport.authenticate('local', { }), (req, res) => {
    userData
        .deleteUser(req.user.username)
        .then((ok) => {
            res.json({success: 'User successfully deleted!'});
        })
        .catch((err) => {
            // Something went wrong with the server!
            res.status(500).send({error: err.message});
        });
});


module.exports = router;