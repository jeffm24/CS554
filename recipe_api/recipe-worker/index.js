const recipeData = require("../recipe-data");
const redis = require('redis');
const fetch = require('node-fetch');

const NRP = require('node-redis-pubsub');
const config = {
    port: 6379, // Port of your locally running Redis server
    scope: 'recipes' // Use a scope to prevent two NRPs from sharing messages
};

const redisConnection = new NRP(config); // This is the NRP client

// Note, this is really bad.
const pixabayApiKey = "3432196-710f5c9e1d0f75f6c0aa4a34a";
const basePixabayUrl = `https://pixabay.com/api/?key=${pixabayApiKey}&safesearch=true&q=`;

redisConnection.on('create-recipe:*', (data, channel) => {
    let messageId = data.requestId;

    recipeData
        .addRecipe(data.recipe)
        .then((newRecipe) => {
            return fetch(`${basePixabayUrl}${newRecipe.title}`).then((res) => {
                return res.json();
            }).then((response) => {
                return response
                    .hits
                    .map(x => x.previewURL)
                    .slice(0, 5);
            }).then((hits) => {
                return recipeData
                    .addImagesToRecipe(newRecipe._id, hits)
                    .then((recipeWithUrls) => {
                        return recipeData
                            .findRecipesWithIngredients(recipeWithUrls.ingredients.map(x => x.systemTitle))
                            .then(recipeList => {

                                let recipeListExceptCurrent = recipeList.filter(x => x._id !== newRecipe._id);

                                //console.log(recipeListExceptCurrent);
                                // Perform logic here Go through entire recipe list Calculate the percentage
                                // matched for each. Compose an array of data calls to setup the percentage
                                // matched Add all, then resolve to recipeWithUrls
                                return recipeWithUrls;
                            });
                    })
            }).then((recipeWithUrls) => {
                redisConnection.emit(`recipe-created:${messageId}`, recipeWithUrls);
            }).catch(error => {
                redisConnection.emit(`recipe-creation-failed:${messageId}`, error);
            });
        }).catch(error => {
            redisConnection.emit(`recipe-creation-failed:${messageId}`, error);
        });
});

redisConnection.on('update-recipe:*', (data, channel) => {
    let messageId = data.requestId;

    recipeData
        .updateRecipe(data.userId, data.recipeId, data.newRecipeFields)
        .then((newRecipe) => {
            return fetch(`${basePixabayUrl}${newRecipe.title}`).then((res) => {
                return res.json();
            }).then((response) => {
                return response
                    .hits
                    .map(x => x.previewURL)
                    .slice(0, 5);
            }).then((hits) => {
                return recipeData
                    .addImagesToRecipe(newRecipe._id, hits)
                    .then((recipeWithUrls) => {
                        return recipeData
                            .findRecipesWithIngredients(recipeWithUrls.ingredients.map(x => x.systemTitle))
                            .then(recipeList => {

                                let recipeListExceptCurrent = recipeList.filter(x => x._id !== newRecipe._id);

                                //console.log(recipeListExceptCurrent);
                                // Perform logic here Go through entire recipe list Calculate the percentage
                                // matched for each. Compose an array of data calls to setup the percentage
                                // matched Add all, then resolve to recipeWithUrls
                                return recipeWithUrls;
                            });
                    })
            }).then((recipeWithUrls) => {
                redisConnection.emit(`recipe-updated:${messageId}`, recipeWithUrls);
            }).catch(error => {
                redisConnection.emit(`recipe-update-failed:${messageId}`, error);
            });
        }).catch(error => {
            redisConnection.emit(`recipe-update-failed:${messageId}`, error);
        });
});

redisConnection.on('delete-recipe:*', (data, channel) => {
    let messageId = data.requestId;

    recipeData
        .deleteRecipe(data.userId, data.recipeId)
        .then((ok) => {
            redisConnection.emit(`recipe-deleted:${messageId}`, data.recipeId);
        }).catch(error => {
            redisConnection.emit(`recipe-delete-failed:${messageId}`, error);
        });
});