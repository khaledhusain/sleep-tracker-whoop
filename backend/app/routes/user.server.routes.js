const users = require("../controllers/user.server.controllers");

module.exports = function(app){
    app.route("/user/create_account")
        .post(users.create_account)// users.create_account
    app.route("/user/login")
        .post(users.login) // users.login
    // app.route("logout")
    //     .post() // middleware.authenticate, users.logout
}