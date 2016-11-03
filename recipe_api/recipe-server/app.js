const express = require("express");
const bodyParser = require("body-parser");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const redis = require('redis');
const sha256 = require('sha256');
const bcrypt = require('bcrypt-then');
const app = express();
const static = express.static(__dirname + '/public');

const configRoutes = require("./routes");

const exphbs = require('express-handlebars');

const Handlebars = require('handlebars');

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === "number") 
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
            
            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    },
    partialsDir: ['views/partials/']
});

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the
    // request's method To be that method; so if they post _method=PUT you can now
    // allow browsers to POST to a route that gets rewritten in this middleware to a
    // PUT route
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }

    // let the next middleware run:
    next();
};

app.set('redis', require("./redis-connection"));

app.use("/public", static);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);
app.use(passport.initialize());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new LocalStrategy({ usernameField: 'username', passwordField: 'password', passReqToCallback: true, session: false },
    function(req, username, password, done) {
        
        var client = redis.createClient();
        var authToken = req.get('Auth-Token');

        client.hgetall('users', (err, users) => {
            client.quit();

            if (err) {
                return done(err);
            } 

            var userId = sha256(username);

            // Check Username
            if (!users[userId]) {
                return done(null, false, { message: 'Invalid username.' });
            }

            var user = JSON.parse(users[userId]);

            // Check auth-token
            if (authToken !== user.token) {
                return done(null, false, { message: 'Invalid auth-token.' });
            }

            // Check password
            return bcrypt.compare(password, user.password).then((valid) => {
                if (!valid) {
                    return done(null, false, { message: 'Incorrect password.' });
                }

                return done(null, user);
            });
        });
    }
));


app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});