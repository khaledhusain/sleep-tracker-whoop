const whoopController = require("../controllers/whoop.server.controller");
const {whoopAuthMiddleware} = require("../middleware/whoopAuthMiddleware");

module.exports = function (app) {
  app.route("/connect")
     .get(whoopController.getConnectUrl);

  app.route("/callback")
     .get(whoopController.handleCallback);

  app.route("/refresh")
     .get(whoopAuthMiddleware, whoopController.refreshToken);


  app.route("/sleep")
     .get(whoopAuthMiddleware, whoopController.syncSleep);
};