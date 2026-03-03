const Joi = require("joi");
const sleep = require("../models/sleep.server.models");

const create_sleep = (req, res) => {
  const createSleepSchema = Joi.object({
    whoop_record_id: Joi.string().optional(),
    date: Joi.date().iso().required(),
    nap: Joi.boolean().optional(),
    bedtime: Joi.date().iso().required(),
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
  }).unknown(false);

  const { error, value } = createSleepSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error_message: error.details[0].message });
  }

  const sleepToCreate = {
    ...value,
    user_id: req.user_id,
  };

  sleep.createSleep(sleepToCreate, (err, id) => {
    if (err) {
      return res.status(500).json({
        error_message: err.message || "Internal server error",
      });
    }

    return res.status(201).json({
      message: "Successfully created sleep",
      id,
    });
  });
};

const get_all_sleeps = (req, res) => {
  const getAllSleepsSchema = Joi.object({
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
  }).unknown(false);

  const { error, value } = getAllSleepsSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ error_message: error.details[0].message });
  }

  sleep.getAllSleeps(value || {}, (err, rows) => {
    if (err) {
      return res.status(500).json({
        error_message: err.message || "Internal server error",
      });
    }
    return res.status(200).json(rows);
  });
};

const get_sleep = (req, res) => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required(),
  }).unknown(false);

  const { error, value } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({ error_message: error.details[0].message });
  }

  sleep.getSleep(value.id, (err, row) => {
    if (err) {
      return res.status(500).json({
        error_message: err.message || "Internal server error",
      });
    }
    if (!row) {
      return res.status(404).json({ error_message: "Sleep not found" });
    }
    return res.status(200).json(row);
  });
};

const update_sleep = (req, res) => {
  const paramsSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
  }).unknown(false);

  const bodySchema = Joi.object({
    whoop_record_id: Joi.string().optional(),
    date: Joi.date().iso().optional(),
    nap: Joi.boolean().optional(),

    bedtime: Joi.date().iso().optional(),
    wake_time: Joi.date().iso().optional(),

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
  })
    .min(1)
    .unknown(false);

  const p = paramsSchema.validate(req.params);
  if (p.error) {
    return res.status(400).json({ error_message: p.error.details[0].message });
  }

  const b = bodySchema.validate(req.body);
  if (b.error) {
    return res.status(400).json({ error_message: b.error.details[0].message });
  }

  if (b.value.bedtime && b.value.wake_time) {
    if (new Date(b.value.wake_time) <= new Date(b.value.bedtime)) {
      return res.status(400).json({ error_message: "wake_time must be after bedtime" });
    }
  }

  sleep.updateSleep(p.value.id, req.user_id, b.value, (err, changes) => {
    if (err) {
      return res.status(500).json({
        error_message: err.message || "Internal server error",
      });
    }

    if (!changes) {
      return res.status(404).json({
        error_message: "Sleep not found",
      });
    }

    return res.status(200).json({
      message: "Successfully updated sleep",
    });
  });
};

const delete_sleep = (req, res) => {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required(),
  }).unknown(false);

  const { error, value } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({ error_message: error.details[0].message });
  }

  sleep.deleteSleep(value.id, (err, changes) => {
    if (err) {
      return res.status(500).json({ error_message: err.message || "Internal server error" });
    }
    if (!changes) {
      return res.status(404).json({ error_message: "Sleep not found" });
    }
    return res.status(200).json({ message: "Successfully deleted sleep" });
  });
};

module.exports = {
  get_all_sleeps,
  get_sleep,
  delete_sleep,
  create_sleep,
  update_sleep,
};