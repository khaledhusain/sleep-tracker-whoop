const users = require("../models/user.server.models");
const joi = require('joi');

const create_account = (req, res) => {
    const schema = joi.object({
        first_name: joi.string()
            .required(),

        last_name: joi.string()
            .required(),

        email: joi.string()
            .required()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'co'] } }),

        password: joi.string()
            .min(8)
            .max(16)
            .pattern(new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!_@.#&+]{8,16}$'))
            .required(),
    })

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({
            "error_message": error,
        })
    }

    users.addNewUser(req.body, (err, id) => {
        if (err) {
            if (err.errno === 19) {
                return res.status(400).send({
                    "error_message": "Email already exists!",
                });
            }
            return res.status(500).send({
                "error": err,
            });
        }
        return res.status(201).send({
            "user_id": id,
        });
    })
}

module.exports = {
    create_account: create_account,
}