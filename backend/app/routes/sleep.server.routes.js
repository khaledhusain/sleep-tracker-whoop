const sleep = require("../controllers/sleep.server.controllers");
const authMiddleware = require("../middleware/authMiddleware");

module.exports = function(app){
    app.route("/sleep")
        .get(authMiddleware.authenticate, sleep.get_all_sleeps)

}