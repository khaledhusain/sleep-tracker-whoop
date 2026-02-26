function millisToHours(ms) {
    return Number((ms / (1000 * 60 * 60)).toFixed(1));
  }
  
  function millisToMinutes(ms) {
    return Math.round(ms / (1000 * 60));
  }
  
  function normaliseSleep(entries) {
    return entries.map((sleep) => {
      const stage = sleep.score.stage_summary;
  
      const totalSleepMillis =
        stage.total_light_sleep_time_milli +
        stage.total_slow_wave_sleep_time_milli +
        stage.total_rem_sleep_time_milli;
  
      return {
        id: sleep.id,
        user_id: sleep.user_id,
        start: sleep.start,
        end: sleep.end,
        nap: sleep.nap,
  
        total_in_bed_hours: millisToHours(stage.total_in_bed_time_milli),
        total_sleep_hours: millisToHours(totalSleepMillis),
        total_awake_minutes: millisToMinutes(stage.total_awake_time_milli),
  
        light_sleep_hours: millisToHours(stage.total_light_sleep_time_milli),
        slow_wave_sleep_hours: millisToHours(stage.total_slow_wave_sleep_time_milli),
        rem_sleep_hours: millisToHours(stage.total_rem_sleep_time_milli),
  
        sleep_performance: sleep.score.sleep_performance_percentage,
        sleep_efficiency: Math.round(sleep.score.sleep_efficiency_percentage),
        sleep_consistency: sleep.score.sleep_consistency_percentage,
  
        respiratory_rate: Number(sleep.score.respiratory_rate.toFixed(1)),
      };
    });
  }
  
  module.exports = {
    millisToHours,
    millisToMinutes,
    normaliseSleep,
  };