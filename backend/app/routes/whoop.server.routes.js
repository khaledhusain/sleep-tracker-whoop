const whoopController = require("../controllers/whoop.server.controllers");
const {whoopAuthMiddleware} = require("../middleware/whoopAuthMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

module.exports = function (app) {
  app.route("/whoop/connect")
     .get(authMiddleware.authenticate, whoopController.getConnectUrl);

  app.route("/whoop/callback")
     .get(whoopController.handleCallback);

  app.route("/whoop/status")
     .get(authMiddleware.authenticate, whoopController.getWhoopStatus);

  app.route("/whoop/refresh")
     .get(authMiddleware.authenticate, whoopAuthMiddleware, whoopController.refreshToken);

  app.route("/whoop/sleep")
     .get(authMiddleware.authenticate, whoopAuthMiddleware, whoopController.syncSleep);

  app.route("/whoop/sleep-history")
     .get(authMiddleware.authenticate, whoopController.getSleepHistory);
};