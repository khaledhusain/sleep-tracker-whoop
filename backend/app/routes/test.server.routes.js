const test = require("../controllers/test.server.controllers")

module.exports = function(app){
    app.route("/test")
        .get(test.test)
}