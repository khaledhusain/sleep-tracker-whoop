const users = require("../controllers/user.server.controllers");

module.exports = function(app){
    app.route("/user")
        .post(users.create_account)// users.create_account
    // app.route("/users/login")
    //     .post() // users.login
    // app.route("logout")
    //     .post() // middleware.authenticate, users.logout
}