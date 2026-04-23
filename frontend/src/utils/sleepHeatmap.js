/**
 * Eight quality tiers (t1 best → t8 worst) plus empty.
 * @typedef {'t1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 't8' | 'empty'} HeatTier
 */

/**
 * Local calendar key YYYY-MM-DD from a Date.
 * @param {Date} d
 */
export function toLocalDayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Day key from sleep row `date` field.
 * SQLite / WHOOP often store calendar `YYYY-MM-DD`; parse as that day (no UTC shift).
 * Full ISO timestamps still use local calendar from the instant.
 * @param {string} iso
 */
export function dayKeyFromEntryDate(iso) {
  if (iso == null || iso === '') return null;
  if (typeof iso === 'number' && Number.isFinite(iso)) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return toLocalDayKey(d);
  }
  const s = String(iso).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n)) {
      const d = new Date(n);
      if (!Number.isNaN(d.getTime())) return toLocalDayKey(d);
    }
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return toLocalDayKey(d);
}

/** Monday = 0 … Sunday = 6 */
export function mondayBasedWeekday(d) {
  return (d.getDay() + 6) % 7;
}

/**
 * @param {number} year
 * @param {number} monthIndex 0–11
 * @returns {number} days in month
 */
export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * @param {Record<string, unknown>} row
 */
export function isNapEntry(row) {
  const n = row.nap;
  return n === 1 || n === true || n === '1';
}

/**
 * Pick one main sleep per calendar day (excludes naps before call).
 * @param {Record<string, unknown>[]} rowsSameDay
 */
export function pickPrimarySleepForDay(rowsSameDay) {
  if (!rowsSameDay.length) return null;
  const scored = rowsSameDay.filter(
    (r) => r.sleep_performance_score != null && r.sleep_performance_score !== ''
  );
  if (scored.length) {
    return scored.reduce((best, r) => {
      const sid = Number(r.id) || 0;
      const bid = Number(best.id) || 0;
      return sid >= bid ? r : best;
    });
  }
  return rowsSameDay.reduce((best, r) => {
    const dur = Number(r.total_sleep_duration_minutes) || 0;
    const bdur = Number(best.total_sleep_duration_minutes) || 0;
    if (dur !== bdur) return dur >= bdur ? r : best;
    const sid = Number(r.id) || 0;
    const bid = Number(best.id) || 0;
    return sid >= bid ? r : best;
  });
}

/**
 * WHOOP: score buckets 90–100 …0–29 (t1 … t8).
 * Manual (no score): duration tiers ≥8h down to ≥2h, else under 2h (t1 … t8).
 * @param {Record<string, unknown>} entry
 * @returns {HeatTier}
 */
export function classifySleepTier(entry) {
  if (!entry) return 'empty';

  const scoreRaw = entry.sleep_performance_score;
  const hasScore = scoreRaw != null && scoreRaw !== '' && !Number.isNaN(Number(scoreRaw));

  if (hasScore) {
    const s = Number(scoreRaw);
    if (s >= 90) return 't1';
    if (s >= 80) return 't2';
    if (s >= 70) return 't3';
    if (s >= 60) return 't4';
    if (s >= 50) return 't5';
    if (s >= 40) return 't6';
    if (s >= 30) return 't7';
    return 't8';
  }

  const dur = Number(entry.total_sleep_duration_minutes);
  if (Number.isNaN(dur) || dur <= 0) return 'empty';

  const h = 60;
  if (dur >= 8 * h) return 't1';
  if (dur >= 7 * h) return 't2';
  if (dur >= 6 * h) return 't3';
  if (dur >= 5 * h) return 't4';
  if (dur >= 4 * h) return 't5';
  if (dur >= 3 * h) return 't6';
  if (dur >= 2 * h) return 't7';
  return 't8';
}

/**
 * @param {Record<string, unknown>[]} entries raw API rows (may include naps)
 * @returns {Map<string, Record<string, unknown>>} dayKey -> primary entry
 */
export function buildDayEntryMap(entries) {
  const byDay = new Map();
  const list = Array.isArray(entries) ? entries : [];
  for (const row of list) {
    if (isNapEntry(row)) continue;
    const key = dayKeyFromEntryDate(row.date);
    if (!key) continue;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(row);
  }
  const out = new Map();
  for (const [key, arr] of byDay) {
    const primary = pickPrimarySleepForDay(arr);
    if (primary) out.set(key, primary);
  }
  return out;
}

/**
 * @param {Map<string, Record<string, unknown>>} dayMap
 * @param {number} year
 * @param {number} monthIndex */
export function computeMonthSummary(dayMap, year, monthIndex) {
  const keys = [];
  for (let d = 1; d <= daysInMonth(year, monthIndex); d++) {
    const dk = toLocalDayKey(new Date(year, monthIndex, d));
    if (dayMap.has(dk)) keys.push(dk);
  }
  if (keys.length === 0) {
    return { kind: 'none', label: '' };
  }

  let scored = 0;
  let scoreSum = 0;
  let durSum = 0;
  let durCount = 0;

  for (const dk of keys) {
    const e = dayMap.get(dk);
    const sc = e.sleep_performance_score;
    if (sc != null && sc !== '' && !Number.isNaN(Number(sc))) {
      scored++;
      scoreSum += Number(sc);
    }
    const dur = Number(e.total_sleep_duration_minutes);
    if (!Number.isNaN(dur) && dur > 0) {
      durSum += dur;
      durCount++;
    }
  }

  const dataDays = keys.length;
  const enoughScore =
    scored >= 2 && scored / Math.max(1, dataDays) >= 0.5;

  if (enoughScore) {
    const avg = Math.round(scoreSum / scored);
    return { kind: 'score', label: `Avg score: ${avg}%` };
  }

  if (durCount > 0) {
    const avgMin = Math.round(durSum / durCount);
    const h = Math.floor(avgMin / 60);
    const m = avgMin % 60;
    return { kind: 'duration', label: `Avg duration: ${h}h ${String(m).padStart(2, '0')}m` };
  }

  return { kind: 'none', label: '' };
}

/**
 * Build flat list of cells for calendar (leading nulls + days + trailing nulls).
 * @param {number} year
 * @param {number} monthIndex
 * @param {Map<string, Record<string, unknown>>} dayMap full map or month-filtered
 */
export function buildMonthGridCells(year, monthIndex, dayMap) {
  const dim = daysInMonth(year, monthIndex);
  const first = new Date(year, monthIndex, 1);
  const lead = mondayBasedWeekday(first);
  const cells = [];

  for (let i = 0; i < lead; i++) {
    cells.push({ type: 'pad' });
  }

  for (let day = 1; day <= dim; day++) {
    const date = new Date(year, monthIndex, day);
    const key = toLocalDayKey(date);
    const entry = dayMap.get(key) || null;
    cells.push({
      type: 'day',
      day,
      date,
      dayKey: key,
      entry,
      tier: entry ? classifySleepTier(entry) : 'empty',
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ type: 'pad' });
  }

  return cells;
}

/**
 * @param {number} minutes
 */
export function formatDurationHoursMinutes(minutes) {
  if (minutes == null || Number.isNaN(Number(minutes))) return '—';
  const n = Math.max(0, Math.floor(Number(minutes)));
  const h = Math.floor(n / 60);
  const m = n % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/** Compact duration for heatmap hover, e.g. 342 → "5:42". */
export function formatMinutesAsHm(minutes) {
  if (minutes == null || Number.isNaN(Number(minutes))) return '';
  const n = Math.max(0, Math.floor(Number(minutes)));
  const h = Math.floor(n / 60);
  const m = n % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/**
 * @param {string|null} iso
 */
export function formatTimeRangeLabel(bedIso, wakeIso) {
  if (!bedIso || !wakeIso) return '';
  const a = new Date(bedIso);
  const b = new Date(wakeIso);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return '';
  const opts = { hour: 'numeric', minute: '2-digit' };
  return `${a.toLocaleString(undefined, opts)} – ${b.toLocaleString(undefined, opts)}`;
}

/**
 * Stage segments for stacked bar; returns null if no stage data.
 * @param {Record<string, unknown>} entry
 */
export function getStageSegments(entry) {
  if (!entry) return null;
  const light = Number(entry.light_sleep_minutes);
  const deep = Number(entry.deep_sleep_minutes);
  const rem = Number(entry.rem_sleep_minutes);
  const awake = Number(entry.awake_minutes);
  const parts = [
    { key: 'light', label: 'Light Sleep', minutes: light, color: 'rgba(125, 211, 252, 0.95)' },
    { key: 'deep', label: 'Deep Sleep', minutes: deep, color: 'rgba(99, 102, 241, 0.95)' },
    { key: 'rem', label: 'REM Sleep', minutes: rem, color: 'rgba(232, 121, 249, 0.95)' },
    { key: 'awake', label: 'Awake', minutes: awake, color: 'rgba(100, 116, 139, 0.85)' },
  ];
  const valid = parts.filter((p) => !Number.isNaN(p.minutes) && p.minutes > 0);
  const total = valid.reduce((s, p) => s + p.minutes, 0);
  if (total <= 0) return null;
  return parts.map((p) => {
    const m = Number.isNaN(p.minutes) || p.minutes < 0 ? 0 : p.minutes;
    const pct = Math.round((m / total) * 100);
    return {
      ...p,
      minutes: m,
      pct,
      widthPct: (m / total) * 100,
    };
  });
}

/**
 * Inclusive local calendar bounds as `YYYY-MM-DD` for API filters.
 * (DB stores WHOOP `date` as date-only; full ISO query strings break SQLite text compare.)
 */
export function monthStartEndDateStrings(year, monthIndex) {
  const pad = (n) => String(n).padStart(2, '0');
  const start = `${year}-${pad(monthIndex + 1)}-01`;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const end = `${year}-${pad(monthIndex + 1)}-${pad(lastDay)}`;
  return { start, end };
}
