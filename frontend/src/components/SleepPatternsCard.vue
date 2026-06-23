<template>
  <section
    class="sleep-patterns-card rounded-2xl border border-blue-4/25 bg-blue-2/35 p-4 shadow-[0_4px_30px_rgba(3,23,77,0.4)] sm:p-5"
    aria-labelledby="sleep-patterns-heading"
  >
    <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-grey-1">
          Behaviour analysis
        </p>
        <h2 id="sleep-patterns-heading" class="mt-1 text-xl font-bold text-grey-2">
          Sleep Patterns
        </h2>
        <p class="mt-1 max-w-2xl text-xs leading-5 text-grey-1">
          Explore how bedtime, wake time, and sleep duration relate to sleep quality across
          {{ patternSessions.length }} {{ patternSessions.length === 1 ? 'sleep' : 'sleeps' }}
          in the active range.
        </p>
      </div>

      <div ref="rangeControl" class="relative">
        <button
          type="button"
          class="flex min-w-40 items-center justify-between gap-3 rounded-xl border border-blue-4/30 bg-blue-1/45 px-3 py-2.5 text-left text-xs font-semibold text-grey-2 shadow-[0_6px_18px_rgba(3,10,40,0.18)] transition hover:border-purple/45 hover:bg-blue-2/45 hover:text-white"
          :aria-expanded="rangeMenuOpen"
          aria-haspopup="menu"
          @click="rangeMenuOpen = !rangeMenuOpen"
        >
          <span class="flex min-w-0 items-center gap-2">
            <svg class="size-4 shrink-0 text-purple" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path d="M3 5h14M6 10h8M8.5 15h3" />
            </svg>
            <span class="truncate">{{ dateRangeLabel }}</span>
          </span>
          <svg
            class="size-4 shrink-0 text-grey-1 transition-transform"
            :class="{ 'rotate-180': rangeMenuOpen }"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </button>

        <div
          v-if="rangeMenuOpen"
          class="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 rounded-xl border border-blue-4/30 bg-[#0b1747] p-2 shadow-[0_18px_45px_rgba(0,5,35,0.62)]"
          role="menu"
        >
          <button
            v-for="option in dateRangeOptions"
            :key="option.value"
            type="button"
            class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition"
            :class="
              dateRange === option.value
                ? 'bg-purple/15 text-purple'
                : 'text-grey-2 hover:bg-blue-2/55 hover:text-white'
            "
            role="menuitem"
            @click="selectDateRange(option.value)"
          >
            <span>{{ option.label }}</span>
            <svg v-if="dateRange === option.value" class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="m5 10 3 3 7-7" />
            </svg>
          </button>

          <div v-if="dateRange === 'custom'" class="mt-2 border-t border-blue-4/20 px-2 pt-3">
            <div class="grid grid-cols-2 gap-2">
              <label class="text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-grey-1">
                Start
                <input
                  v-model="customStart"
                  type="date"
                  class="mt-1.5 w-full rounded-lg border border-blue-4/30 bg-blue-1/70 px-2 py-2 text-[0.68rem] font-medium text-grey-2 outline-none transition focus:border-purple/60"
                  :max="customEnd || undefined"
                />
              </label>
              <label class="text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-grey-1">
                End
                <input
                  v-model="customEnd"
                  type="date"
                  class="mt-1.5 w-full rounded-lg border border-blue-4/30 bg-blue-1/70 px-2 py-2 text-[0.68rem] font-medium text-grey-2 outline-none transition focus:border-purple/60"
                  :min="customStart || undefined"
                />
              </label>
            </div>
            <p v-if="customRangeError" class="mt-2 text-[0.62rem] text-[#fca5a5]">
              {{ customRangeError }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="grid min-h-80 place-items-center rounded-xl border border-blue-4/20 bg-blue-1/30"
    >
      <div class="h-9 w-9 animate-spin rounded-full border-4 border-blue-3 border-t-purple" />
    </div>

    <div
      v-else-if="!patternSessions.length"
      class="grid min-h-64 place-items-center rounded-xl border border-blue-4/20 bg-blue-1/30 px-6 text-center"
    >
      <div>
        <p class="font-semibold text-grey-2">No sleep pattern data in this range</p>
        <p class="mt-2 text-sm text-grey-1">
          Sleep records need a valid bedtime, wake time, or duration to appear here.
        </p>
      </div>
    </div>

    <Transition v-else name="range-fade" mode="out-in">
    <div :key="rangeRenderKey" class="sleep-patterns-grid">
      <SleepDistributionHistogram
        class="bedtime-chart"
        kind="bedtime"
        title="Bedtime Distribution"
        icon="moon"
        accent="#a78bfa"
        metric-label="Typical Bedtime"
        :buckets="bedtimeBuckets"
        :typical-value="formatClock(typicalBedtime)"
        :consistency="bedtimeConsistency"
        :selected-kind="selection?.kind"
        :selected-key="selection?.key"
        :related-session-ids="relatedSessionIds"
        @select="selectBucket"
      />

      <SleepDistributionHistogram
        class="wake-chart"
        kind="wake"
        title="Wake Time Distribution"
        icon="sun"
        accent="#38bdf8"
        metric-label="Typical Wake Time"
        :buckets="wakeBuckets"
        :typical-value="formatClock(typicalWakeTime)"
        :consistency="wakeConsistency"
        :selected-kind="selection?.kind"
        :selected-key="selection?.key"
        :related-session-ids="relatedSessionIds"
        @select="selectBucket"
      />

      <SleepDurationDistribution
        class="duration-chart"
        accent="#34d399"
        :buckets="durationBuckets"
        :typical-value="formatDuration(overallMetrics.duration)"
        :consistency="durationVariation"
        :selected-kind="selection?.kind"
        :selected-key="selection?.key"
        :related-session-ids="relatedSessionIds"
        @select="selectBucket"
      />

      <aside class="analysis-panel rounded-xl border border-purple/25 bg-blue-1/55 p-5">
        <template v-if="selectedBucket">
          <div class="border-b border-blue-4/20 pb-4">
            <p class="analysis-label">Sleep Pattern Analysis</p>
            <h3 class="mt-1 text-lg font-bold text-white">{{ selectedBucket.rangeLabel }}</h3>
            <p class="mt-1 text-xs text-grey-1">
              {{ selectedSessions.length }}
              {{ selectedSessions.length === 1 ? 'sleep' : 'sleeps' }}
              · {{ selectedBucket.percent }}% of all sleeps
            </p>
          </div>

          <div class="mt-5">
            <p class="analysis-label">Key Metrics</p>
            <dl class="mt-3 grid grid-cols-2 gap-2">
              <div
                v-for="metric in selectedMetricTiles"
                :key="metric.label"
                class="rounded-lg border border-blue-4/20 bg-blue-2/35 p-3"
              >
                <dt class="text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-grey-1">
                  {{ metric.label }}
                </dt>
                <dd class="mt-1 break-words text-sm font-bold text-white">{{ metric.value }}</dd>
              </div>
            </dl>
          </div>

          <div class="mt-5 border-t border-blue-4/20 pt-4">
            <p class="analysis-label">Compared To Overall</p>
            <div class="mt-3 space-y-2">
              <div
                v-for="delta in comparisonRows"
                :key="delta.label"
                class="flex items-center justify-between gap-3 text-xs"
              >
                <span class="text-grey-1">{{ delta.label }}</span>
                <strong :class="deltaClass(delta.value)">{{ delta.value }}</strong>
              </div>
            </div>
          </div>

          <div class="mt-5 border-t border-blue-4/20 pt-4">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-lg border border-blue-4/25 bg-blue-2/35 px-3 py-3 text-left text-xs font-semibold text-grey-2 transition hover:border-purple/45 hover:bg-blue-2/55 hover:text-white"
              @click="recentOpen = true"
            >
              <span>View Recent Sleeps ({{ selectedSessions.length }})</span>
              <svg class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="m7 5 5 5-5 5" />
              </svg>
            </button>
          </div>
        </template>

        <template v-else>
          <p class="analysis-label">Sleep Pattern Analysis</p>
          <h3 class="mt-1 text-lg font-bold text-white">Overall Summary</h3>
          <p class="mt-1 text-xs leading-5 text-grey-1">
            Select any bedtime, wake-time, or duration bar to inspect its performance.
          </p>

          <dl class="mt-5 grid grid-cols-2 gap-3">
            <div
              v-for="summary in overallSummary"
              :key="summary.label"
              class="rounded-lg border border-blue-4/20 bg-blue-2/30 p-3"
            >
              <dt class="text-[0.56rem] font-semibold uppercase tracking-[0.08em] text-grey-1">
                {{ summary.label }}
              </dt>
              <dd class="mt-1 text-sm font-bold" :class="summary.color">{{ summary.value }}</dd>
            </div>
          </dl>
        </template>
      </aside>
    </div>
    </Transition>
  </section>

  <Teleport to="body">
    <div
      v-if="recentOpen && selectedBucket"
      class="recent-modal-backdrop"
      role="presentation"
      @mousedown.self="recentOpen = false"
    >
      <section
        class="recent-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recent-sleeps-heading"
      >
        <header class="flex items-start justify-between gap-4 border-b border-blue-4/20 pb-4">
          <div>
            <p class="analysis-label">Selected Range</p>
            <h3 id="recent-sleeps-heading" class="mt-1 text-lg font-bold text-white">
              Recent Sleeps
            </h3>
            <p class="mt-1 text-xs text-grey-1">
              {{ selectedBucket.rangeLabel }} · {{ selectedSessions.length }}
              {{ selectedSessions.length === 1 ? 'sleep' : 'sleeps' }}
            </p>
          </div>
          <button
            type="button"
            class="grid size-9 shrink-0 place-items-center rounded-lg border border-blue-4/25 bg-blue-2/50 text-grey-1 transition hover:border-purple/50 hover:text-white"
            aria-label="Close recent sleeps"
            @click="recentOpen = false"
          >
            <svg class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </header>

        <div class="mt-4 max-h-[65vh] space-y-2 overflow-y-auto pr-1">
          <article
            v-for="session in selectedSessions"
            :key="session.__patternId"
            class="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] items-center gap-3 rounded-lg border border-blue-4/20 bg-blue-2/35 p-3 text-xs"
          >
            <div>
              <p class="font-semibold text-white">{{ formatSessionDate(session) }}</p>
              <p class="mt-0.5 text-[0.62rem] text-grey-1">Sleep session</p>
            </div>
            <div>
              <p class="recent-label">Bedtime</p>
              <p class="mt-1 font-semibold text-grey-2">{{ formatSessionTime(session.bedtime) }}</p>
            </div>
            <div>
              <p class="recent-label">Sleep Score</p>
              <p class="mt-1 font-semibold text-grey-2">{{ formatPlainScore(session.sleep_performance_score) }}</p>
            </div>
            <div>
              <p class="recent-label">Duration</p>
              <p class="mt-1 font-semibold text-grey-2">
                {{ formatDuration(validNumber(session.total_sleep_duration_minutes)) }}
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import SleepDistributionHistogram from './SleepDistributionHistogram.vue';
import SleepDurationDistribution from './SleepDurationDistribution.vue';

const props = defineProps({
  sessions: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
});

const MAX_BUCKETS = 12;
const selection = ref(null);
const recentOpen = ref(false);
const rangeControl = ref(null);
const rangeMenuOpen = ref(false);
const dateRange = ref('all');
const customStart = ref('');
const customEnd = ref('');

const dateRangeOptions = [
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'All Time', value: 'all' },
  { label: 'Custom Range', value: 'custom' },
];

function validNumber(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function average(values) {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function standardDeviation(values) {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) return null;
  const mean = average(valid);
  return Math.sqrt(average(valid.map((value) => (value - mean) ** 2)));
}

function parseTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return { hour: date.getHours(), minutes: date.getHours() * 60 + date.getMinutes() };
}

function normalizePercent(value) {
  const number = validNumber(value);
  if (number == null) return null;
  return number > 0 && number <= 1 ? number * 100 : number;
}

const allPatternSessions = computed(() =>
  props.sessions
    .map((session, index) => ({
      ...session,
      __patternId:
        session.id ??
        session.whoop_record_id ??
        `${session.date || 'sleep'}-${session.bedtime || session.wake_time || index}-${index}`,
    }))
    .filter(
      (session) =>
        parseTime(session.bedtime) ||
        parseTime(session.wake_time) ||
        Number.isFinite(validNumber(session.total_sleep_duration_minutes))
    )
);

function sessionDay(session) {
  const value = session.date || session.wake_time || session.bedtime;
  if (!value) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(12, 0, 0, 0);
  return date;
}

function dateInputValue(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function inputDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

const availableDateBounds = computed(() => {
  const dates = allPatternSessions.value.map(sessionDay).filter(Boolean);
  if (!dates.length) return { start: '', end: '' };
  return {
    start: dateInputValue(new Date(Math.min(...dates.map((date) => date.getTime())))),
    end: dateInputValue(new Date(Math.max(...dates.map((date) => date.getTime())))),
  };
});

const customRangeError = computed(() => {
  if (dateRange.value !== 'custom' || !customStart.value || !customEnd.value) return '';
  return customStart.value > customEnd.value ? 'Start date must be before end date.' : '';
});

const patternSessions = computed(() => {
  const source = allPatternSessions.value;
  if (dateRange.value === 'all') return source;

  let start = null;
  let end = null;
  if (dateRange.value === 'custom') {
    start = inputDate(customStart.value);
    end = inputDate(customEnd.value);
    if (!start || !end || start > end) return source;
  } else {
    end = new Date();
    end.setHours(12, 0, 0, 0);
    start = new Date(end);
    start.setDate(start.getDate() - (dateRange.value === 'last7' ? 6 : 29));
  }

  return source.filter((session) => {
    const date = sessionDay(session);
    return date && date >= start && date <= end;
  });
});

function formatRangeDate(value) {
  const date = inputDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const dateRangeLabel = computed(() => {
  if (dateRange.value === 'last7') return 'Last 7 Days';
  if (dateRange.value === 'last30') return 'Last 30 Days';
  if (dateRange.value === 'custom' && customStart.value && customEnd.value && !customRangeError.value) {
    return `${formatRangeDate(customStart.value)} - ${formatRangeDate(customEnd.value)}`;
  }
  return dateRange.value === 'custom' ? 'Custom Range' : 'All Time';
});

const rangeRenderKey = computed(
  () => `${dateRange.value}-${customStart.value}-${customEnd.value}`
);

function selectDateRange(value) {
  dateRange.value = value;
  if (value === 'custom') {
    customStart.value ||= availableDateBounds.value.start;
    customEnd.value ||= availableDateBounds.value.end;
    return;
  }
  rangeMenuOpen.value = false;
}

function clockMean(values) {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) return null;
  const radians = valid.map((minutes) => (minutes / 1440) * Math.PI * 2);
  const x = average(radians.map(Math.cos));
  const y = average(radians.map(Math.sin));
  let angle = Math.atan2(y, x);
  if (angle < 0) angle += Math.PI * 2;
  return (angle / (Math.PI * 2)) * 1440;
}

function circularDistance(a, b) {
  const direct = Math.abs(a - b);
  return Math.min(direct, 1440 - direct);
}

function timeValues(field, source = patternSessions.value) {
  return source.map((session) => parseTime(session[field])?.minutes).filter(Number.isFinite);
}

const typicalBedtime = computed(() => clockMean(timeValues('bedtime')));
const typicalWakeTime = computed(() => clockMean(timeValues('wake_time')));

function formatClock(minutes) {
  if (!Number.isFinite(minutes)) return 'Not recorded';
  const rounded = Math.round(minutes) % 1440;
  const hour24 = Math.floor(rounded / 60);
  const minute = rounded % 60;
  return `${hour24 % 12 || 12}:${String(minute).padStart(2, '0')} ${hour24 >= 12 ? 'PM' : 'AM'}`;
}

function formatHour(hour) {
  const normalized = ((hour % 24) + 24) % 24;
  return `${normalized % 12 || 12} ${normalized >= 12 ? 'PM' : 'AM'}`;
}

function timingRangeLabel(hour) {
  return `${formatHour(hour)} - ${formatHour(hour + 1)}`;
}

function consistencyFor(field, typical) {
  const reported = patternSessions.value
    .map((session) => normalizePercent(session.sleep_consistency))
    .filter(Number.isFinite);
  if (reported.length) return `${Math.round(average(reported))}%`;
  const times = timeValues(field);
  if (!times.length || !Number.isFinite(typical)) return 'Not recorded';
  return `±${Math.round(average(times.map((value) => circularDistance(value, typical))))}m`;
}

const bedtimeConsistency = computed(() => consistencyFor('bedtime', typicalBedtime.value));
const wakeConsistency = computed(() => consistencyFor('wake_time', typicalWakeTime.value));

function bucketMetrics(sessions) {
  return {
    averageScore: average(sessions.map((session) => validNumber(session.sleep_performance_score))),
    averageDuration: average(sessions.map((session) => validNumber(session.total_sleep_duration_minutes))),
  };
}

function createBucket({ key, kind, rangeLabel, shortLabel, sessions, sortValue }) {
  return {
    key,
    kind,
    rangeLabel,
    shortLabel,
    count: sessions.length,
    percent: patternSessions.value.length
      ? Math.round((sessions.length / patternSessions.value.length) * 100)
      : 0,
    ...bucketMetrics(sessions),
    sessionIds: new Set(sessions.map((session) => session.__patternId)),
    sessions,
    sortValue,
  };
}

function buildTimeBuckets(field, kind) {
  const grouped = new Map();
  patternSessions.value.forEach((session) => {
    const time = parseTime(session[field]);
    if (!time) return;
    if (!grouped.has(time.hour)) grouped.set(time.hour, []);
    grouped.get(time.hour).push(session);
  });

  let buckets = [...grouped.entries()].map(([hour, sessions]) =>
    createBucket({
      key: `${kind}-${hour}`,
      kind,
      rangeLabel: timingRangeLabel(hour),
      shortLabel: formatHour(hour),
      sessions,
      sortValue: kind === 'bedtime' && hour < 12 ? hour + 24 : hour,
    })
  );

  if (buckets.length > MAX_BUCKETS) {
    const visible = new Set(
      [...buckets]
        .sort((a, b) => b.count - a.count || a.sortValue - b.sortValue)
        .slice(0, MAX_BUCKETS)
        .map((bucket) => bucket.key)
    );
    buckets = buckets.filter((bucket) => visible.has(bucket.key));
  }
  return buckets.sort((a, b) => a.sortValue - b.sortValue);
}

const durationRanges = [
  { key: 'under-4', min: 0, max: 240, label: '<4h' },
  { key: '4-5', min: 240, max: 300, label: '4-5h' },
  { key: '5-6', min: 300, max: 360, label: '5-6h' },
  { key: '6-7', min: 360, max: 420, label: '6-7h' },
  { key: '7-8', min: 420, max: 480, label: '7-8h' },
  { key: '8-9', min: 480, max: 540, label: '8-9h' },
  { key: '9-plus', min: 540, max: Infinity, label: '9h+' },
];

const bedtimeBuckets = computed(() => buildTimeBuckets('bedtime', 'bedtime'));
const wakeBuckets = computed(() => buildTimeBuckets('wake_time', 'wake'));
const durationBuckets = computed(() =>
  durationRanges
    .map((range, index) => {
      const sessions = patternSessions.value.filter((session) => {
        const duration = validNumber(session.total_sleep_duration_minutes);
        return Number.isFinite(duration) && duration >= range.min && duration < range.max;
      });
      return createBucket({
        key: `duration-${range.key}`,
        kind: 'duration',
        rangeLabel: range.label,
        shortLabel: range.label,
        sessions,
        sortValue: index,
      });
    })
    .filter((bucket) => bucket.count > 0)
);

const bucketCollections = computed(() => ({
  bedtime: bedtimeBuckets.value,
  wake: wakeBuckets.value,
  duration: durationBuckets.value,
}));

const selectedBucket = computed(() => {
  if (!selection.value) return null;
  return (
    bucketCollections.value[selection.value.kind]?.find(
      (bucket) => bucket.key === selection.value.key
    ) || null
  );
});

const selectedSessions = computed(() =>
  [...(selectedBucket.value?.sessions || [])].sort((a, b) => {
    const aTime = new Date(a.wake_time || a.bedtime || a.date || 0).getTime();
    const bTime = new Date(b.wake_time || b.bedtime || b.date || 0).getTime();
    return bTime - aTime;
  })
);

const relatedSessionIds = computed(() => selectedBucket.value?.sessionIds || new Set());

function metricsFor(source) {
  return {
    score: average(source.map((session) => validNumber(session.sleep_performance_score))),
    duration: average(source.map((session) => validNumber(session.total_sleep_duration_minutes))),
    efficiency: average(source.map((session) => normalizePercent(session.sleep_efficiency))),
    bedtime: clockMean(timeValues('bedtime', source)),
    wakeTime: clockMean(timeValues('wake_time', source)),
  };
}

const overallMetrics = computed(() => metricsFor(patternSessions.value));
const selectedMetrics = computed(() => metricsFor(selectedSessions.value));
const durationVariation = computed(() => {
  const deviation = standardDeviation(
    patternSessions.value.map((session) => validNumber(session.total_sleep_duration_minutes))
  );
  return Number.isFinite(deviation) ? `±${formatCompactMinutes(deviation)}` : 'Not recorded';
});

const selectedMetricTiles = computed(() => {
  const metrics = selectedMetrics.value;
  if (selection.value?.kind === 'duration') {
    return [
      { label: 'Average Score', value: formatScore(metrics.score) },
      { label: 'Efficiency', value: formatPercent(metrics.efficiency) },
      { label: 'Typical Bedtime', value: formatClock(metrics.bedtime) },
      { label: 'Typical Wake', value: formatClock(metrics.wakeTime) },
    ];
  }
  return [
    { label: 'Average Score', value: formatScore(metrics.score) },
    { label: 'Average Duration', value: formatDuration(metrics.duration) },
    { label: 'Efficiency', value: formatPercent(metrics.efficiency) },
    {
      label: selection.value?.kind === 'bedtime' ? 'Typical Wake' : 'Typical Bedtime',
      value:
        selection.value?.kind === 'bedtime'
          ? formatClock(metrics.wakeTime)
          : formatClock(metrics.bedtime),
    },
  ];
});

const comparisonRows = computed(() => [
  {
    label: 'Sleep Score',
    value: formatNumberDelta(selectedMetrics.value.score, overallMetrics.value.score),
  },
  {
    label: 'Duration',
    value: formatMinuteDelta(selectedMetrics.value.duration, overallMetrics.value.duration),
  },
  {
    label: 'Efficiency',
    value: formatPercentDelta(selectedMetrics.value.efficiency, overallMetrics.value.efficiency),
  },
]);

const overallSummary = computed(() => [
  { label: 'Typical Bedtime', value: formatClock(typicalBedtime.value), color: 'text-[#a78bfa]' },
  { label: 'Typical Wake Time', value: formatClock(typicalWakeTime.value), color: 'text-[#38bdf8]' },
  { label: 'Average Duration', value: formatDuration(overallMetrics.value.duration), color: 'text-[#34d399]' },
  { label: 'Average Sleep Score', value: formatScore(overallMetrics.value.score), color: 'text-grey-2' },
  { label: 'Bedtime Consistency', value: bedtimeConsistency.value, color: 'text-grey-2' },
  { label: 'Wake Consistency', value: wakeConsistency.value, color: 'text-grey-2' },
]);

function selectBucket(bucket) {
  if (selection.value?.kind === bucket.kind && selection.value?.key === bucket.key) {
    clearSelection();
    return;
  }
  selection.value = { kind: bucket.kind, key: bucket.key };
  recentOpen.value = false;
}

function clearSelection() {
  selection.value = null;
  recentOpen.value = false;
}

watch(
  patternSessions,
  () => {
    if (selection.value && !selectedBucket.value) clearSelection();
  }
);

watch(recentOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});

function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return 'Not recorded';
  const rounded = Math.max(0, Math.round(minutes));
  return `${Math.floor(rounded / 60)}h ${String(rounded % 60).padStart(2, '0')}m`;
}

function formatCompactMinutes(minutes) {
  const rounded = Math.max(0, Math.round(minutes));
  return rounded < 60 ? `${rounded}m` : `${Math.floor(rounded / 60)}h ${rounded % 60}m`;
}

function formatScore(value) {
  return Number.isFinite(value) ? String(Math.round(value)) : 'Not recorded';
}

function formatPlainScore(value) {
  const number = validNumber(value);
  return Number.isFinite(number) ? Math.round(number) : 'N/A';
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${Math.round(value)}%` : 'Not recorded';
}

function signedRounded(value, suffix = '') {
  if (!Number.isFinite(value)) return 'Not recorded';
  const rounded = Math.round(value);
  if (rounded === 0) return `0${suffix}`;
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)}${suffix}`;
}

function formatNumberDelta(selected, overall) {
  return Number.isFinite(selected) && Number.isFinite(overall)
    ? signedRounded(selected - overall)
    : 'Not recorded';
}

function formatMinuteDelta(selected, overall) {
  return Number.isFinite(selected) && Number.isFinite(overall)
    ? signedRounded(selected - overall, 'm')
    : 'Not recorded';
}

function formatPercentDelta(selected, overall) {
  return Number.isFinite(selected) && Number.isFinite(overall)
    ? signedRounded(selected - overall, '%')
    : 'Not recorded';
}

function deltaClass(value) {
  if (value.startsWith('+')) return 'font-bold text-[#4ade80]';
  if (value.startsWith('−')) return 'font-bold text-[#fca5a5]';
  return 'font-bold text-grey-2';
}

function formatSessionDate(session) {
  const value = session.date || session.wake_time || session.bedtime;
  if (!value) return 'Date not recorded';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date not recorded';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatSessionTime(value) {
  const parsed = parseTime(value);
  return parsed ? formatClock(parsed.minutes) : 'Time not recorded';
}

function closeOnEscape(event) {
  if (event.key !== 'Escape') return;
  recentOpen.value = false;
  rangeMenuOpen.value = false;
}

function closeRangeOnOutsideClick(event) {
  if (rangeControl.value && !rangeControl.value.contains(event.target)) {
    rangeMenuOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('keydown', closeOnEscape);
  document.addEventListener('mousedown', closeRangeOnOutsideClick);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', closeOnEscape);
  document.removeEventListener('mousedown', closeRangeOnOutsideClick);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.sleep-patterns-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(20rem, 1.2fr);
  grid-template-areas:
    "bedtime wake analysis"
    "duration duration analysis";
  gap: 0.75rem;
  align-items: stretch;
}

.bedtime-chart {
  grid-area: bedtime;
}

.wake-chart {
  grid-area: wake;
}

.duration-chart {
  grid-area: duration;
}

.analysis-panel {
  grid-area: analysis;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.analysis-label,
.recent-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #c5c6d0;
}

.recent-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(1, 7, 30, 0.78);
  backdrop-filter: blur(8px);
}

.recent-modal {
  width: min(48rem, 100%);
  max-height: min(48rem, calc(100vh - 3rem));
  overflow: hidden;
  border: 1px solid rgba(153, 163, 251, 0.32);
  border-radius: 1rem;
  background: #0b1747;
  padding: 1.25rem;
  box-shadow: 0 24px 80px rgba(0, 4, 28, 0.72);
}

.range-fade-enter-active,
.range-fade-leave-active {
  transition: opacity 140ms ease, transform 140ms ease;
}

.range-fade-enter-from,
.range-fade-leave-to {
  opacity: 0;
  transform: translateY(3px);
}

@media (max-width: 1023px) {
  .sleep-patterns-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "bedtime"
      "wake"
      "duration"
      "analysis";
  }
}

@media (max-width: 640px) {
  .sleep-patterns-card {
    padding: 1rem;
  }

  .analysis-panel {
    padding: 1rem;
  }

  .recent-modal-backdrop {
    padding: 0.75rem;
  }

  .recent-modal {
    padding: 1rem;
  }

  .recent-modal article {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
