const whoopController = require("../controllers/whoop.server.controllers");
const {whoopAuthMiddleware} = require("../middleware/whoopAuthMiddleware");

module.exports = function (app) {
  app.route("/whoop/connect")
     .get(whoopController.getConnectUrl);

  app.route("/whoop/callback")
     .get(whoopController.handleCallback);

  app.route("/whoop/refresh")
     .get(whoopAuthMiddleware, whoopController.refreshToken);

  app.route("/whoop/sleep")
     .get(whoopAuthMiddleware, whoopController.syncSleep);

   app.route("/whoop/sleep-history")
      .get(whoopController.getSleepHistory);
};