const joi = require(`joi`);

const get_all_sleeps = (req, res) => {
    
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
const update_sleep = (req, res) => {
    
}

module.exports = {
    get_all_sleeps,
    get_sleep,
    delete_sleep,
    update_sleep
}