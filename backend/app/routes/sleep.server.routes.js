const sleep = require("../controllers/sleep.server.controllers");
const authMiddleware = require("../middleware/authMiddleware");

module.exports = function(app){
    app.route("/sleep")
        .get(authMiddleware.authenticate, sleep.get_all_sleeps)
        .post(authMiddleware.authenticate, sleep.create_sleep)
    app.route("/sleep/:id")
        .get(authMiddleware.authenticate, sleep.get_sleep)
        .delete(authMiddleware.authenticate, sleep.delete_sleep)
}