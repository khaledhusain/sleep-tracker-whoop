const Joi = require(`joi`);

const create_sleep = (req, res) => {
    const createSleepSchema = Joi.object({
        whoop_record_id: Joi.string().optional(),
        date: Joi.date().iso().required(),
        nap: Joi.boolean().optional(),
        bedtime: Joi.string().isoDate().required(),
        wake_time: Joi.string().isoDate().required(),
        total_in_bed_minutes: Joi.number().integer().min(0).optional(),
        total_sleep_duration_minutes: Joi.number().integer().min(0).optional(),
        light_sleep_minutes: Joi.number().integer().min(0).optional(),
        deep_sleep_minutes: Joi.number().integer().min(0).optional(),
        rem_sleep_minutes: Joi.number().integer().min(0).optional(),
        awake_minutes: Joi.number().integer().min(0).optional(),
        sleep_performance_score: Joi.number().integer().min(0).optional(),
        sleep_efficiency: Joi.number().integer().min(0).optional(),
        sleep_consistency: Joi.number().integer().min(0).optional(),
        respiratory_rate: Joi.number().optional(),
    });

    const { error } = getAllSleepsSchema.validate(req.body);
    if (error) {
        return res.status(400).send({
            "error_message": error,
        })
    }
}

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
    const getSleepSchema = Joi.object({
        id: Joi.number().integer().positive().required()
    });

    const { error } = getSleepSchema.validate(req.body)
    if (error) {
        return res.status(400).send({
            "error_message": error,
        })
    }
}

const delete_sleep = (req, res) => {
    const deleteSleepSchema = Joi.object({
        id: Joi.number().integer().positive().required()
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
    create_sleep
}