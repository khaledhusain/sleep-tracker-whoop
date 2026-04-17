<template>
  <div class="min-h-full text-white font-Montserrat">
    <div class="mx-auto max-w-[1600px] flex flex-col gap-6">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-purple">Sleep entries</h1>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            @click="loadEntries"
            :disabled="loading"
            class="rounded-lg border border-blue-4/40 bg-blue-3/50 px-4 py-2 text-sm font-semibold text-grey-2 hover:bg-blue-4/30 hover:text-white disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            type="button"
            @click="confirmReset"
            :disabled="loading || resetting || entries.length === 0"
            class="rounded-lg border border-[#f87171]/50 bg-[#f87171]/15 px-4 py-2 text-sm font-semibold text-[#fca5a5] hover:bg-[#f87171]/25 disabled:opacity-50"
          >
            {{ resetting ? 'Resetting…' : 'Reset sleep data' }}
          </button>
        </div>
      </header>

      <p v-if="error" class="rounded-xl border border-[#f87171]/40 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]">
        {{ error }}
      </p>

      <section class="rounded-2xl border border-blue-4/30 bg-blue-1/50 p-6 shadow-[0_4px_30px_rgba(3,23,77,0.35)]">
        <h2 class="text-lg font-bold text-white mb-1">Add sleep manually</h2>
        <form class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end" @submit.prevent="submitManual">
          <div class="flex flex-col gap-1">
            <label for="manual-bedtime" class="text-xs font-semibold uppercase tracking-wide text-grey-1">Bedtime</label>
            <input
              id="manual-bedtime"
              v-model="manualBedtime"
              type="datetime-local"
              required
              class="rounded-lg border border-blue-4/40 bg-blue-2/80 px-3 py-2.5 text-sm text-white outline-none focus:border-purple"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="manual-wake" class="text-xs font-semibold uppercase tracking-wide text-grey-1">Wake time</label>
            <input
              id="manual-wake"
              v-model="manualWake"
              type="datetime-local"
              required
              class="rounded-lg border border-blue-4/40 bg-blue-2/80 px-3 py-2.5 text-sm text-white outline-none focus:border-purple"
            />
          </div>
          <button
            type="submit"
            :disabled="savingManual"
            class="rounded-lg bg-purple px-5 py-2.5 text-sm font-semibold text-blue-1 hover:bg-purple/90 disabled:opacity-50 sm:mb-0"
          >
            {{ savingManual ? 'Saving…' : 'Save entry' }}
          </button>
        </form>
        <p v-if="formError" class="mt-3 text-sm text-[#fca5a5]">{{ formError }}</p>
        <p v-if="formSuccess" class="mt-3 text-sm text-[#4ade80]">{{ formSuccess }}</p>
      </section>

      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-24 text-grey-1"
      >
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-3 border-t-purple" />
        <p class="mt-4 text-sm">Loading entries…</p>
      </div>

      <div
        v-else-if="entries.length === 0"
        class="rounded-2xl border border-blue-4/30 bg-blue-1/40 py-12 text-center text-grey-1"
      >
        No rows in the table yet. Use the form above or sync from WHOOP on the dashboard.
      </div>

      <div
        v-else
        class="overflow-x-auto rounded-xl border border-blue-4/30 bg-blue-1/50 shadow-[0_4px_30px_rgba(3,23,77,0.35)]"
      >
        <p class="border-b border-blue-4/30 bg-blue-2/40 px-4 py-2 text-xs text-grey-1">
          Click a row for sleep stages, efficiency, and recovery metrics.
        </p>
        <table class="w-full min-w-[640px] border-collapse text-center text-xs sm:text-sm">
          <thead>
            <tr class="border-b border-blue-4/40 bg-blue-2/80">
              <th
                v-for="col in SUMMARY_COLUMNS"
                :key="col"
                scope="col"
                @click.stop="onSortClick(col)"
                class="relative whitespace-nowrap px-3 py-3 text-center font-semibold capitalize tracking-wide"
                :class="
                  isSortableColumn(col)
                    ? 'cursor-pointer select-none text-purple hover:text-white'
                    : 'text-purple'
                "
              >
                <span class="relative inline-block">
                  {{ fieldLabel(col) }}
                  <span
                    v-if="isSortableColumn(col)"
                    class="pointer-events-none absolute left-full top-1/2 ml-0.5 inline-flex -translate-y-1/2 items-center text-[0.7rem] leading-none text-inherit"
                    aria-hidden="true"
                  >
                    {{ sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '' }}
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(row, idx) in sortedEntries" :key="rowKey(row, idx)">
              <tr
                role="button"
                tabindex="0"
                @click="toggleRow(rowKey(row, idx))"
                @keydown.enter.prevent="toggleRow(rowKey(row, idx))"
                @keydown.space.prevent="toggleRow(rowKey(row, idx))"
                class="cursor-pointer border-b border-blue-4/20 odd:bg-blue-2/20 hover:bg-blue-3/30"
                :class="{ 'bg-blue-3/25': expandedRowKey === rowKey(row, idx) }"
              >
                <td
                  v-for="col in SUMMARY_COLUMNS"
                  :key="col"
                  class="max-w-[14rem] truncate whitespace-nowrap px-3 py-2.5 text-center text-grey-2"
                  :title="formatCell(row[col], col)"
                >
                  {{ formatCell(row[col], col) }}
                </td>
              </tr>
              <tr
                v-if="expandedRowKey === rowKey(row, idx)"
                class="border-b border-blue-4/20 bg-blue-2/40"
              >
                <td :colspan="SUMMARY_COLUMNS.length" class="px-4 py-3 text-grey-2">
                  <div
                    v-if="!hasAnyExpansionContent(row)"
                    class="text-sm text-grey-1"
                  >
                    No stage or recovery details for this entry.
                  </div>
                  <div v-else class="space-y-4">
                    <div class="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-3">
                      <div
                        v-for="item in sleepStageMetrics(row)"
                        :key="item.key"
                        class="min-w-0"
                      >
                        <div
                          class="mb-1 flex items-baseline justify-between gap-2 text-[0.65rem] font-semibold uppercase tracking-wide text-grey-1"
                        >
                          <span>{{ item.label }}</span>
                          <span
                            class="max-w-[60%] truncate text-right normal-case text-xs font-medium tabular-nums text-white"
                            :title="item.text"
                          >
                            {{ item.text }}
                          </span>
                        </div>
                        <div
                          class="h-1 w-full overflow-hidden rounded-full bg-blue-4/25"
                          role="presentation"
                        >
                          <div
                            class="h-full rounded-full transition-[width] duration-300 ease-out"
                            :style="{ width: `${item.barPct}%`, backgroundColor: item.color }"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-3">
                      <div
                        v-for="item in sleepRecoveryMetrics(row)"
                        :key="item.key"
                        class="min-w-0"
                      >
                        <div
                          class="mb-1 flex items-baseline justify-between gap-2 text-[0.65rem] font-semibold uppercase tracking-wide text-grey-1"
                        >
                          <span>{{ item.label }}</span>
                          <span
                            class="max-w-[60%] truncate text-right normal-case text-xs font-medium tabular-nums text-white"
                            :title="item.text"
                          >
                            {{ item.text }}
                          </span>
                        </div>
                        <div
                          class="h-1 w-full overflow-hidden rounded-full bg-blue-4/25"
                          role="presentation"
                        >
                          <div
                            class="h-full rounded-full transition-[width] duration-300 ease-out"
                            :style="{ width: `${item.barPct}%`, backgroundColor: item.color }"
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="numField(row, 'respiratory_rate') != null"
                      class="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-blue-4/25 pt-3 text-xs"
                    >
                      <span
                        class="text-[0.65rem] font-semibold uppercase tracking-wide text-grey-1"
                      >
                        Respiratory rate
                      </span>
                      <span class="tabular-nums text-white">
                        {{ formatRespiratory(row.respiratory_rate) }}
                      </span>
                    </div>
                    <div
                      v-if="expansionExtras(row).length"
                      class="border-t border-blue-4/25 pt-3 text-xs text-grey-1"
                    >
                      <p class="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wide">
                        Other
                      </p>
                      <ul class="flex flex-col gap-1">
                        <li
                          v-for="item in expansionExtras(row)"
                          :key="item.key"
                          class="flex justify-between gap-4 border-b border-blue-4/15 py-1 last:border-0"
                        >
                          <span class="text-grey-1">{{ fieldLabel(item.key) }}</span>
                          <span class="shrink-0 tabular-nums text-white">
                            {{ formatCell(item.val, item.key) }}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchSleepData, resetAllSleepData, createManualSleep } from '@/services/sleep.service';

/** Shown in the main table; everything else appears after row click. */
const SUMMARY_COLUMNS = [
  'id',
  'date',
  'nap',
  'bedtime',
  'wake_time',
  'total_in_bed_minutes',
  'total_sleep_duration_minutes',
  'sleep_performance_score',
];

const HIDDEN_KEYS = ['whoop_record_id', 'user_id', 'created_at', 'updated_at'];

const DETAIL_KEY_ORDER = [
  'light_sleep_minutes',
  'deep_sleep_minutes',
  'rem_sleep_minutes',
  'awake_minutes',
  'sleep_efficiency',
  'sleep_consistency',
  'respiratory_rate',
];

const EXPANSION_FIXED_KEYS = new Set([
  'light_sleep_minutes',
  'deep_sleep_minutes',
  'rem_sleep_minutes',
  'awake_minutes',
  'sleep_efficiency',
  'sleep_consistency',
  'respiratory_rate',
]);

const STAGE_BAR_CONFIG = [
  { key: 'light_sleep_minutes', label: 'Light', color: 'rgba(125, 211, 252, 0.92)' },
  { key: 'deep_sleep_minutes', label: 'Deep', color: 'rgba(99, 102, 241, 0.92)' },
  { key: 'rem_sleep_minutes', label: 'REM', color: 'rgba(232, 121, 249, 0.92)' },
];

const RECOVERY_BAR_COLORS = {
  efficiency: 'rgba(74, 222, 128, 0.92)',
  consistency: 'rgba(45, 212, 191, 0.92)',
  awake: 'rgba(251, 191, 36, 0.92)',
};

/** Stored in minutes; displayed as H:MM (e.g. 6:40). */
const MINUTE_DURATION_KEYS = new Set([
  'total_in_bed_minutes',
  'total_sleep_duration_minutes',
  'light_sleep_minutes',
  'deep_sleep_minutes',
  'rem_sleep_minutes',
  'awake_minutes',
]);

const SORTABLE_COLUMNS = [
  'date',
  'bedtime',
  'wake_time',
  'total_in_bed_minutes',
  'total_sleep_duration_minutes',
  'sleep_performance_score',
];

const entries = ref([]);
const loading = ref(true);
const resetting = ref(false);
const error = ref('');

const manualBedtime = ref('');
const manualWake = ref('');
const savingManual = ref(false);
const formError = ref('');
const formSuccess = ref('');
const expandedRowKey = ref(null);
const sortKey = ref('date');
const sortDir = ref('desc');

const sortedEntries = computed(() => {
  const list = [...entries.value];
  const key = sortKey.value;
  const dir = sortDir.value;
  if (!key || list.length === 0) return list;

  const mult = dir === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    const va = sortComparableValue(a, key);
    const vb = sortComparableValue(b, key);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (va < vb) return -1 * mult;
    if (va > vb) return 1 * mult;
    return 0;
  });
  return list;
});

function isSortableColumn(col) {
  return SORTABLE_COLUMNS.includes(col);
}

function onSortClick(col) {
  if (!isSortableColumn(col)) return;
  if (sortKey.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = col;
    sortDir.value = 'asc';
  }
}

function sortComparableValue(row, key) {
  const raw = row[key];
  if (raw === null || raw === undefined) return null;
  if (
    key === 'total_in_bed_minutes' ||
    key === 'total_sleep_duration_minutes' ||
    key === 'sleep_performance_score'
  ) {
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  }
  if (key === 'date' || key === 'bedtime' || key === 'wake_time') {
    const t = new Date(raw).getTime();
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

function rowKey(row, idx) {
  return row.id != null ? String(row.id) : `idx-${idx}`;
}

function toggleRow(key) {
  expandedRowKey.value = expandedRowKey.value === key ? null : key;
}

function detailEntries(row) {
  const keys = Object.keys(row).filter(
    (k) => !HIDDEN_KEYS.includes(k) && !SUMMARY_COLUMNS.includes(k)
  );
  keys.sort((a, b) => {
    const ia = DETAIL_KEY_ORDER.indexOf(a);
    const ib = DETAIL_KEY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return keys.map((k) => ({ key: k, val: row[k] }));
}

function numField(row, key) {
  const v = row[key];
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function sleepStageBaseMinutes(row) {
  const total = numField(row, 'total_sleep_duration_minutes');
  if (total != null && total > 0) return total;
  const sum =
    (numField(row, 'light_sleep_minutes') || 0) +
    (numField(row, 'deep_sleep_minutes') || 0) +
    (numField(row, 'rem_sleep_minutes') || 0);
  return sum > 0 ? sum : null;
}

function sleepStageMetrics(row) {
  const base = sleepStageBaseMinutes(row);
  return STAGE_BAR_CONFIG.map(({ key, label, color }) => {
    const mins = numField(row, key);
    const hm = formatMinutesAsHm(mins);
    const pct =
      mins != null && base != null && base > 0 ? Math.round((mins / base) * 100) : null;
    const text = pct != null ? `${hm} (${pct}%)` : hm;
    const barPct = pct != null ? Math.min(100, Math.max(0, pct)) : 0;
    return { key, label, color, text, barPct, hasValue: mins != null };
  });
}

function sleepRecoveryMetrics(row) {
  const eff = numField(row, 'sleep_efficiency');
  const cons = numField(row, 'sleep_consistency');
  const effInt = eff != null ? Math.round(Math.min(100, Math.max(0, eff))) : null;
  const consInt = cons != null ? Math.round(Math.min(100, Math.max(0, cons))) : null;
  const effText = effInt != null ? `${effInt}%` : '—';
  const consText = consInt != null ? `${consInt}%` : '—';

  const awakeM = numField(row, 'awake_minutes');
  const inBed = numField(row, 'total_in_bed_minutes');
  const awakeHm = formatMinutesAsHm(awakeM);
  const awakePct =
    awakeM != null && inBed != null && inBed > 0 ? Math.round((awakeM / inBed) * 100) : null;
  const awakeText = awakePct != null ? `${awakeHm} (${awakePct}%)` : awakeHm;
  const awakeBar = awakePct != null ? Math.min(100, Math.max(0, awakePct)) : 0;

  return [
    {
      key: 'sleep_efficiency',
      label: 'Sleep Efficiency',
      text: effText,
      barPct: effInt != null ? effInt : 0,
      color: RECOVERY_BAR_COLORS.efficiency,
      hasValue: eff != null,
    },
    {
      key: 'sleep_consistency',
      label: 'Sleep Consistency',
      text: consText,
      barPct: consInt != null ? consInt : 0,
      color: RECOVERY_BAR_COLORS.consistency,
      hasValue: cons != null,
    },
    {
      key: 'awake_minutes',
      label: 'Time Awake',
      text: awakeText,
      barPct: awakeBar,
      color: RECOVERY_BAR_COLORS.awake,
      hasValue: awakeM != null,
    },
  ];
}

function formatRespiratory(val) {
  if (val == null) return '—';
  const n = Number(val);
  if (Number.isNaN(n)) return '—';
  const s = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `${s} rpm`;
}

function expansionExtras(row) {
  return detailEntries(row).filter((item) => !EXPANSION_FIXED_KEYS.has(item.key));
}

function hasAnyExpansionContent(row) {
  if (expansionExtras(row).length) return true;
  if (numField(row, 'respiratory_rate') != null) return true;
  return (
    sleepStageMetrics(row).some((m) => m.hasValue) ||
    sleepRecoveryMetrics(row).some((m) => m.hasValue)
  );
}

function localNightDateIso(bed) {
  const y = bed.getFullYear();
  const m = String(bed.getMonth() + 1).padStart(2, '0');
  const day = String(bed.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}T12:00:00.000Z`;
}

async function submitManual() {
  formError.value = '';
  formSuccess.value = '';
  if (!manualBedtime.value || !manualWake.value) {
    formError.value = 'Set both bedtime and wake time.';
    return;
  }
  const bed = new Date(manualBedtime.value);
  const wake = new Date(manualWake.value);
  if (Number.isNaN(bed.getTime()) || Number.isNaN(wake.getTime())) {
    formError.value = 'Invalid date or time.';
    return;
  }
  if (wake.getTime() <= bed.getTime()) {
    formError.value = 'Wake time must be after bedtime.';
    return;
  }

  savingManual.value = true;
  const token = localStorage.getItem('sessionToken');
  try {
    await createManualSleep(token, {
      date: localNightDateIso(bed),
      bedtime: bed.toISOString(),
      wake_time: wake.toISOString()
    });
    manualWake.value = '';
    manualBedtime.value = '';
    await loadEntries();
    formSuccess.value = 'Saved. It should appear in the table below.';
    setTimeout(() => {
      formSuccess.value = '';
    }, 4000);
  } catch (e) {
    formError.value = e.message || 'Could not save entry.';
  } finally {
    savingManual.value = false;
  }
}

function humanizeKey(k) {
  return String(k).replace(/_/g, ' ');
}

function fieldLabel(key) {
  const k = String(key);
  if (MINUTE_DURATION_KEYS.has(k)) {
    return humanizeKey(k.replace(/_minutes$/, ''));
  }
  return humanizeKey(k);
}

function formatNap(val) {
  if (val === null || val === undefined) return '—';
  if (val === 1 || val === true || val === '1') return 'Yes';
  if (val === 0 || val === false || val === '0') return 'No';
  return String(val);
}

/** Renders total minutes as H:MM (e.g. 400 → 6:40). */
function formatMinutesAsHm(val) {
  if (val === null || val === undefined) return '—';
  const n = Number(val);
  if (Number.isNaN(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(Math.floor(n));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}:${String(m).padStart(2, '0')}`;
}

function formatCell(val, key) {
  if (key === 'nap') return formatNap(val);
  if (MINUTE_DURATION_KEYS.has(key)) return formatMinutesAsHm(val);
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val);
  if (key === 'date') {
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
    }
  }
  if (key === 'bedtime' || key === 'wake_time') {
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    }
  }
  return String(val);
}

async function loadEntries() {
  error.value = '';
  loading.value = true;
  const token = localStorage.getItem('sessionToken');
  try {
    const rows = await fetchSleepData(token);
    entries.value = Array.isArray(rows) ? rows : [];
  } catch (e) {
    error.value = e.message || 'Could not load sleep entries.';
    entries.value = [];
  } finally {
    loading.value = false;
  }
}

async function confirmReset() {
  if (
    !confirm(
      'Delete ALL sleep entries for your account? This cannot be undone. You can sync WHOOP again from the dashboard.'
    )
  ) {
    return;
  }
  resetting.value = true;
  error.value = '';
  const token = localStorage.getItem('sessionToken');
  try {
    const result = await resetAllSleepData(token);
    localStorage.setItem('msgs', result.message || 'Sleep data reset.');
    await loadEntries();
  } catch (e) {
    error.value = e.message || 'Reset failed.';
  } finally {
    resetting.value = false;
  }
}

onMounted(loadEntries);
</script>
