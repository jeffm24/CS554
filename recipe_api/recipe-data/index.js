const recipeCollection = require("./recipeCollection");
const uuid = require('node-uuid');
const Ajv = require('ajv');
const ajv = new Ajv();

// Schemas
const updateRecipeSchema = {
    type: "object",
    properties: {
        title: {type: 'string'},
        ingredients: {
            type: 'array',
            items: [
                {
                    type: 'object',
                    properties: {
                        displayTitle: {type: 'string'},
                        description: {type: 'string'},
                        quantity: {type: 'string'},
                        unit: {type: 'string'}
                    },
                    required: ['displayTitle', 'description', 'quantity', 'unit'],
                    additionalProperties: false
                }
            ]
        },
        description: {type: 'string'},
        steps: {
            type: 'array',
            items: [
                {type: 'string'}
            ]
        }
    },
    additionalProperties: false
};
const recipeSchema = {
    type: "object",
    properties: {
        title: {type: 'string'},
        ingredients: {
            type: 'array',
            items: [
                {
                    type: 'object',
                    properties: {
                        displayTitle: {type: 'string'},
                        description: {type: 'string'},
                        quantity: {type: 'string'},
                        unit: {type: 'string'}
                    },
                    required: ['displayTitle', 'description', 'quantity', 'unit'],
                    additionalProperties: false
                }
            ]
        },
        description: {type: 'string'},
        steps: {
            type: 'array',
            items: [
                {type: 'string'}
            ]
        },
        creator: {type: 'string'},
        creatorId: {type: 'string'}
    },
    required: ['title', 'ingredients', 'description', 'steps', 'creator', 'creatorId'],
    additionalProperties: false
};

let exportedMethods = {
    getAllRecipes() {
        return recipeCollection().then((recipes) => {
            return recipes.find().toArray();
        });
    },
    getRecipe(id) {
        if (!ajv.validate({type: 'string'}, id)) {
            return Promise.reject({ status: 400, error: new TypeError('Invalid Arguments.') });
        }

        return recipeCollection().then((recipes) => {
            return recipes.findOne({_id: id});
        });
    },
    addRecipe(recipe) {       
        if (!ajv.validate(recipeSchema, recipe)) {
            return Promise.reject({ status: 400, error: new TypeError('Invalid Arguments.') });
        }

        return recipeCollection().then((recipes) => {
            recipe.ingredients.forEach(ingredient => {
                ingredient.systemTitle = ingredient.displayTitle.toString();
            });

            recipe._id = uuid.v4();
            recipe.relatedIngredients = [];
            recipe.imageUrls = [];      
            
            return recipes.insertOne(recipe)
        }).then((recipe) => {
            return this.getRecipe(recipe.insertedId);
        });
    },
    updateRecipe(userId, recipeId, newRecipeFields) {
        if (!ajv.validate({type: 'string'}, recipeId) || !ajv.validate(updateRecipeSchema, newRecipeFields)) {
            return Promise.reject({ status: 400, error: new TypeError('Invalid Arguments.') });
        }

        console.log(newRecipeFields);

        var collection;

        return recipeCollection().then((recipes) => {

            collection = recipes;
            return collection.find({_id: recipeId, creatorId: userId}).count();

        }).then((recipeCount) => {
            if (!recipeCount) {
                return Promise.reject({ status: 400, error: new Error('Invalid recipeId.') });
            }

            newRecipeFields.relatedIngredients = [];
            newRecipeFields.imageUrls = [];  

            return collection.update({_id: recipeId, creatorId: userId}, {$set: newRecipeFields});
        }).then(() => {
            return this.getRecipe(recipeId);
        });
    },
    deleteRecipe(userId, recipeId) {
        if (!ajv.validate({type: 'string'}, recipeId)) {
            return Promise.reject({ status: 400, error: new TypeError('Invalid Arguments.') });
        }

        var collection;

        return recipeCollection().then((recipes) => {

            collection = recipes;
            return collection.find({_id: recipeId, creatorId: userId}).count();

        }).then((recipeCount) => {
            if (!recipeCount) {
                return Promise.reject({ status: 400, error: new Error('Invalid recipeId.') });
            }

            return collection.remove({_id: recipeId, creatorId: userId});
        }).then(() => {
            return Promise.resolve(true);
        });
    },
    createRecipeRelationship(firstRecipe, firstMatchAmount, secondRecipe, secondMatchAmount) {
        return recipeCollection().then((recipes) => {
            return recipes.updateOne({
                _id: firstRecipe
            }, {
                $addToSet: {
                    relatedRecipes: {
                        _id: secondRecipe,
                        amount: firstMatchAmount
                    }
                }
            }).then(() => {
                recipes.updateOne({
                    _id: secondRecipe
                }, {
                    $addToSet: {
                        relatedRecipes: {
                            _id: firstRecipe,
                            amount: secondMatchAmount
                        }
                    }
                })
            }).then(() => {
                return recipes.find({
                    _id: [firstRecipe, secondRecipe]
                })
            });
        });
    },
    findRecipesWithIngredient(systemTitle) {
        return recipeCollection().then((recipes) => {
            return recipes
                .find({"ingredients.systemTitle": systemTitle})
                .toArray()
        });
    },
    findRecipesWithIngredients(systemTitles) {
        return recipeCollection().then((recipes) => {
            return recipes
                .find({
                "ingredients.systemTitle": {
                    $in: systemTitles
                }
            })
                .toArray()
        });
    },
    addImagesToRecipe(recipeId, imageUrlArray) {
        return recipeCollection().then((recipes) => {
            return recipes.updateOne({
                _id: recipeId
            }, {
                $addToSet: {
                    imageUrls: {
                        $each: imageUrlArray
                    }
                }
            }).then(() => {
                return this.getRecipe(recipeId);
            });
        });
    }
}

module.exports = exportedMethods;