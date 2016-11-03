const recipeRoutes = require("./recipes");
const userRoutes = require('./users');

const constructorMethod = (app) => {
    app.use("/recipes", recipeRoutes);
    app.use('/users', userRoutes);

    app.get("/", (req, res) => {
        res.render("home", {});
    });
    
    app.use("*", (req, res) => {
        res.redirect("/");
    })
};

module.exports = constructorMethod;