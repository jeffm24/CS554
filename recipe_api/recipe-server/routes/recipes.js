const express = require('express');
const router = express.Router();
const recipeData = require('../../recipe-data');
const uuid = require('node-uuid');
const sha256 = require('sha256');
const authenticate = require('../auth').authenticate;
const cache = require('express-redis-cache')();
const redis = require('redis');

// Middleware to check if requested recipe is cached and return it if so
function checkRecentRecipes(req, res, next) {
    var client = redis.createClient();

    client.lrange('recentRecipes', 0, 10, (err, recipes) => {
        client.quit();

        if (err) {
            res.status(500).send({error: err});
            return;
        }

        recipes = recipes.map((rec) => {
            return JSON.parse(rec);
        });

        var recipe = recipes.filter((rec) => {
            return rec._id === req.params.id;
        })[0];

        if (recipe) {
            res.json(recipe);
            return;
        } else {
            next();
        }
    });
}

router.get("/:id", checkRecentRecipes, (req, res) => {
    recipeData
        .getRecipe(req.params.id)
        .then((recipe) => {
            if (!recipe) {
                res.json({});
            }

            var client = redis.createClient(),
                multi = client.multi();

            multi.rpush('recentRecipes', JSON.stringify(recipe));
            multi.llen('recentRecipes');

            multi.exec((err, results) => {
                if (err) {
                    client.quit();
                    res.status(500).json(err);
                    return;
                }

                // Check if length of the cached recipe list is greater than 10 and pop the last recipe off if it is
                if (results[1] > 10) {
                    client.rpop('recentRecipes', (err, recipe) => {
                        client.quit();

                        if (err) {
                            res.status(500).json(err);
                            return;
                        }

                        res.json(recipe);
                    });
                } else {
                    client.quit();

                    res.json(recipe);
                }
            });                
        })
        .catch(() => {
            // Something went wrong with the server!
            res.sendStatus(500);
        });
});

router.get("/",
    // middleware to define cache name 
    function (req, res, next) {
        res.express_redis_cache_name = 'recipesData';
        next();
    },
    // cache middleware (expires in 1 hr)
    cache.route(60 * 60),
    (req, res) => {
        recipeData
            .getAllRecipes()
            .then((recipeList) => {
                res.json(recipeList);
            })
            .catch(() => {
                // Something went wrong with the server!
                res.sendStatus(500);
            });
    }
);

router.post("/", 
    authenticate, 
    (req, res) => {
        let newRecipe = req.body.recipe;

        newRecipe.creator = req.user.username;
        newRecipe.creatorId = req.user.userId;

        let redisConnection = req
            .app
            .get("redis");

        let messageId = uuid.v4();
        let killswitchTimeoutId = undefined;

        redisConnection.on(`recipe-created:${messageId}`, (insertedRecipe, channel) => {
            redisConnection.off(`recipe-created:${messageId}`);
            redisConnection.off(`recipe-creation-failed:${messageId}`);

            clearTimeout(killswitchTimeoutId);

            // Cache the new recipe for an hour
            var client = redis.createClient(),
                multi = client.multi(),
                cacheName = `recipe${insertedRecipe._id}Data`;

            multi.set(cacheName, JSON.stringify(insertedRecipe));
            multi.expire(cacheName, (60 * 60));

            multi.exec((err, results) => {
                client.quit();

                if (err) {
                    res.status(500).json(err);
                }

                res.json(insertedRecipe);
            });
        });

        redisConnection.on(`recipe-creation-failed:${messageId}`, (error, channel) => {
            res.status(error.status).json(error.error);

            redisConnection.off(`recipe-created:${messageId}`);
            redisConnection.off(`recipe-creation-failed:${messageId}`);

            clearTimeout(killswitchTimeoutId);
        });

        killswitchTimeoutId = setTimeout(() => {
            res
                .status(500)
                .json({error: "Timeout error"})

            redisConnection.off(`recipe-created:${messageId}`);
            redisConnection.off(`recipe-creation-failed:${messageId}`);
            
        }, 5000);

        redisConnection.emit(`create-recipe:${messageId}`, {
            requestId: messageId,
            recipe: newRecipe
        });
    }
);

router.put("/:id", authenticate, (req, res) => {
    let redisConnection = req.app.get("redis");

    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;

    redisConnection.on(`recipe-updated:${messageId}`, (updatedRecipe, channel) => {
        redisConnection.off(`recipe-updated:${messageId}`);
        redisConnection.off(`recipe-update-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);

        // Cache (or re-cache) the updated recipe for an hour
        var client = redis.createClient(),
            multi = client.multi(),
            cacheName = `recipe${updatedRecipe._id}Data`;

        multi.set(cacheName, JSON.stringify(updatedRecipe));
        multi.expire(cacheName, (60 * 60));

        multi.exec((err, results) => {
            client.quit();

            if (err) {
                res.status(500).json(err);
            }

            res.json(updatedRecipe);
        });
    });

    redisConnection.on(`recipe-update-failed:${messageId}`, (error, channel) => {
        res.status(error.status).json(error.error.message);

        redisConnection.off(`recipe-updated:${messageId}`);
        redisConnection.off(`recipe-update-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
    });

    killswitchTimeoutId = setTimeout(() => {
        res.status(500).json({error: "Timeout error"})

        redisConnection.off(`recipe-updated:${messageId}`);
        redisConnection.off(`recipe-update-failed:${messageId}`);
        
    }, 5000);

    redisConnection.emit(`update-recipe:${messageId}`, {
        requestId: messageId,
        newRecipeFields: req.body.newRecipeFields,
        userId: req.user.userId,
        recipeId: req.params.id
    });
});

router.delete("/:id", authenticate, (req, res) => {
    let redisConnection = req.app.get("redis");

    let messageId = uuid.v4();
    let killswitchTimeoutId = undefined;

    redisConnection.on(`recipe-deleted:${messageId}`, (updatedRecipe, channel) => {
        redisConnection.off(`recipe-deleted:${messageId}`);
        redisConnection.off(`recipe-delete-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);

        // Delete the cached recipe
        var client = redis.createClient(),
            cacheName = `recipe${req.params.id}Data`;

        client.del(cacheName, (err) => {
            client.quit();

            if (err) {
                res.status(500).json(err);
            }

            res.json({success: 'Recipe successfully deleted.'});
        });
    });

    redisConnection.on(`recipe-delete-failed:${messageId}`, (error, channel) => {
        res.status(error.status).json(error.error);

        redisConnection.off(`recipe-deleted:${messageId}`);
        redisConnection.off(`recipe-delete-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
    });

    killswitchTimeoutId = setTimeout(() => {
        res.status(500).json({error: "Timeout error"})

        redisConnection.off(`recipe-deleted:${messageId}`);
        redisConnection.off(`recipe-delete-failed:${messageId}`);
        
    }, 5000);

    redisConnection.emit(`delete-recipe:${messageId}`, {
        requestId: messageId,
        userId: req.user.userId,
        recipeId: req.params.id
    });
});

module.exports = router;