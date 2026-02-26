const userModels = require("../models/user.server.models");

const middleware = (req, res, next) => {
    let token = req.get("X-Authorization");

    userModels.getIdFromToken(token, (err, id) => {
        if(err) return res.status(401).send({
            "error": err,
        })
        if (!id) return res.status(401).send({
            "message": `No user_id found with token: ${token}!`,
        })
        req.user_id = id;
        next();
    })
};

module.exports = {
    authenticate: middleware
};