const users = require("../controllers/user.server.controllers");
const authMiddleware = require("../middleware/authMiddleware");

module.exports = function(app){
    app.route("/user/create_account")
        .post(users.create_account);
    app.route("/user/login")
        .post(users.login);
    app.route("/user/logout")
        .post(authMiddleware.authenticate, users.logout);
    app.route("/user/info")
        .get(users.get_info)
}