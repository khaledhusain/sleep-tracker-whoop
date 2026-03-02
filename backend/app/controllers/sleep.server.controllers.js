const Joi = require(`joi`);
const sleep = require(`../models/sleep.server.models`);

const create_sleep = (req, res) => {
    const createSleepSchema = Joi.object({
        whoop_record_id: Joi.string().optional(),
        date: Joi.date().iso().required(),
        nap: Joi.boolean().optional(),
        bedtime: Joi.string().isoDate().required(),
        wake_time: Joi.date().iso().greater(Joi.ref("bedtime")).required(),
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

    const { error } = createSleepSchema.validate(req.body);

    if (error) {
        return res.status(400).send({
            "error_message": error.details[0].message,
        })
    }

    sleep.createSleep(req.body, err => {
        if(err) return res.status(500).send({
            "error_message": error.details[0].message,
        })

        if(err == 400) return res.status(400).send("Please provide date/bedtime/waketime");

        return res.status(201).send({
            "message": "Successfully created sleep",
        })
    })
}

const get_all_sleeps = (req, res) => {
    const getAllSleepsSchema = Joi.object({
        start_date: Joi.date().iso().optional(),     
        end_date: Joi.date().iso().optional(),
    }).unknown(false);

    const { error,value } = getAllSleepsSchema.validate(req.query);

    if (error) {
        return res.status(400).send({
            "error_message": error.details[0].message,
        })
    }

    sleep.getAllSleeps(value, (err, rows) => {
        if(err) return res.status(500).json({
            "error_message": err.message || "Internal server error",
        })

        return res.status(200).send(rows);
    })
}

const get_sleep = (req, res) => {
    const getSleepSchema = Joi.object({
        id: Joi.number().integer().positive().required()
    });

    const { error } = getSleepSchema.validate(req.body);
    if (error) {
        return res.status(400).send({
            "error_message": error,
        })
    }
}

const update_sleep = (req, res) => {
    const updateSleepSchema = Joi.object({
        whoop_record_id: Joi.string().optional(),
        date: Joi.date().iso().optional(),
        nap: Joi.boolean().optional(),
        bedtime: Joi.string().isoDate().optional(),
        wake_time: Joi.string().isoDate().optional(),
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
    create_sleep,
    update_sleep
}