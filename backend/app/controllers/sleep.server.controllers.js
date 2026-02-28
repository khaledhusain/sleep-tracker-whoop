const joi = require(`joi`);

const get_all_sleeps = (req, res) => {
    const getAllSleepsSchema = Joi.object({
        start_date: Joi.date().iso().optional(),     
        end_date: Joi.date().iso().optional(),
    });

    const { error } = getAllSleepsSchema.validate(req.body)
    if (error) {
        return res.status(400).send({
            "error_message": error,
        })
    }
}

const get_sleep = (req, res) => {
    const getSleepSchema = joi.object({
        id: joi.number().integer().positive().required()
    });

    const { error } = getSleepSchema.validate(req.body)
    if (error) {
        return res.status(400).send({
            "error_message": error,
        })
    }
}

const delete_sleep = (req, res) => {
    const deleteSleepSchema = joi.object({
        id: joi.number().integer().positive().required()
    });

    const { error } = deleteSleepSchema.validate(req.body)
    if (error) {
        return res.status(400).send({
            "error_message": error,
        })
    }
}

module.exports = {
    get_all_sleeps,
    get_sleep,
    delete_sleep,
}