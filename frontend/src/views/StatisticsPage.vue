<template>
  <div class="relative flex min-h-screen flex-col overflow-hidden text-white">
    <div class="relative z-10 flex w-full flex-col gap-8">
      <header class="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-purple">Statistics</h1>
        </div>


      </header>

      <p
        v-if="loadError"
        class="rounded-xl border border-[#f87171]/40 bg-[#f87171]/10 px-4 py-3 text-sm text-[#fca5a5]"
      >
        {{ loadError }}
      </p>

      <section aria-labelledby="statistics-overview">
        <div class="mb-4 flex items-end justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-grey-1">Last Week's Overview</p>
          </div>
          <span v-if="isLoading" class="text-xs text-grey-1">Updating metrics…</span>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <article
            v-for="kpi in kpis"
            :key="kpi.label"
            class="flex min-h-44 flex-col rounded-2xl border border-blue-4/25 bg-blue-1 p-4 shadow-[0_4px_30px_rgba(3,23,77,0.35)]"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-full border"
                :class="kpi.iconClass"
                aria-hidden="true"
              >
                <svg v-if="kpi.icon === 'score'" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                <svg v-else-if="kpi.icon === 'duration'" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12h18v7H3zM5 12V8h3a4 4 0 0 1 4 4M3 7v12" />
                </svg>
                <svg v-else-if="kpi.icon === 'consistency'" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
                <svg v-else-if="kpi.icon === 'debt'" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 16a4 4 0 0 1 1-7.87A6 6 0 0 1 17.5 10 3.5 3.5 0 1 1 18 17H6" />
                </svg>
                <svg v-else class="size-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 2.5c.3 2.8-1.1 4.3-2.6 5.9-1.4 1.5-2.9 3-2.9 5.6 0 1.1.4 2.1 1 2.8-.1-1.9.8-3.1 1.8-4.2.8-.9 1.7-1.8 1.9-3.2 2.2 1.7 3.8 4 3.8 6.8 0 .4 0 .8-.1 1.2 1.2-1.1 2-2.8 2-4.7 0-4.2-2.3-7.8-4.9-10.2Z" />
                  <path d="M12.2 13.1c-.4 1-1.2 1.7-1.7 2.5-.5.7-.7 1.4-.5 2.3.3 1.4 1.5 2.4 3 2.4 1.8 0 3.2-1.4 3.2-3.2 0-1.7-1.1-3.2-2.6-4.4 0 1-.5 1.7-1.4 2.4.2-.7.2-1.3 0-2Z" />
                </svg>
              </div>
              <p class="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-grey-1">
                {{ kpi.label }}
              </p>
            </div>

            <p class="mt-3 text-2xl font-extrabold tracking-tight" :class="kpi.color">
              {{ kpi.value }}
            </p>

            <p
              v-if="!kpi.isStreak"
              class="mt-1.5 min-h-5 text-[0.68rem] font-medium"
              :class="kpi.trendClass"
            >
              {{ kpi.trend }}
            </p>

            <svg
              v-if="!kpi.isStreak"
              class="mt-auto h-9 w-full overflow-visible pt-2"
              viewBox="0 0 120 28"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                v-if="kpi.sparkPath"
                :d="kpi.sparkPath"
                fill="none"
                :stroke="kpi.sparkColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
              />
            </svg>

            <div
              v-else
              class="mt-auto flex w-full items-end justify-between gap-2 pt-5"
              aria-label="Sleep logged over the past five days"
            >
              <div
                v-for="day in kpi.streakDays"
                :key="day.dayKey"
                class="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <svg
                  v-if="day.logged"
                  class="size-6 text-[#fb923c] drop-shadow-[0_0_7px_rgba(251,146,60,0.5)]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13.5 2.5c.3 2.8-1.1 4.3-2.6 5.9-1.4 1.5-2.9 3-2.9 5.6 0 1.1.4 2.1 1 2.8-.1-1.9.8-3.1 1.8-4.2.8-.9 1.7-1.8 1.9-3.2 2.2 1.7 3.8 4 3.8 6.8 0 .4 0 .8-.1 1.2 1.2-1.1 2-2.8 2-4.7 0-4.2-2.3-7.8-4.9-10.2Z" />
                  <path d="M12.2 13.1c-.4 1-1.2 1.7-1.7 2.5-.5.7-.7 1.4-.5 2.3.3 1.4 1.5 2.4 3 2.4 1.8 0 3.2-1.4 3.2-3.2 0-1.7-1.1-3.2-2.6-4.4 0 1-.5 1.7-1.4 2.4.2-.7.2-1.3 0-2Z" />
                </svg>
                <span
                  v-else
                  class="size-5 rounded-full border-2 border-blue-4/60 bg-transparent"
                  aria-hidden="true"
                />
                <span class="text-[0.58rem] font-semibold uppercase tracking-wide text-grey-1">
                  {{ day.shortLabel }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <SleepPatternsCard :sessions="sessions" :is-loading="isLoading" />

      <section
        class="overflow-hidden rounded-2xl border border-blue-4/25 bg-blue-2/35 p-5 shadow-[0_4px_30px_rgba(3,23,77,0.4)] sm:p-6"
        aria-labelledby="trend-heading"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-grey-1">
              Performance trend
            </p>
            <h2 id="trend-heading" class="mt-1 text-xl font-bold text-grey-2">
              {{ chartMode === 'score' ? 'Sleep Score' : 'Sleep Duration' }}
            </h2>
          </div>

          <div class="flex rounded-xl border border-blue-4/30 bg-blue-1/50 p-1">
            <button
              v-for="option in chartOptions"
              :key="option.value"
              type="button"
              class="rounded-lg px-4 py-2 text-xs font-semibold transition"
              :class="
                chartMode === option.value
                  ? 'bg-purple text-blue-1 shadow-sm'
                  : 'text-grey-1 hover:bg-blue-3/60 hover:text-white'
              "
              @click="chartMode = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div
          v-if="isLoading"
          class="mt-6 flex h-80 items-center justify-center rounded-xl border border-blue-4/20 bg-blue-1/35"
        >
          <div class="h-9 w-9 animate-spin rounded-full border-4 border-blue-3 border-t-purple" />
        </div>

        <div
          v-else-if="chartValues.length < 2"
          class="mt-6 flex h-80 items-center justify-center rounded-xl border border-blue-4/20 bg-blue-1/35 px-6 text-center text-sm text-grey-1"
        >
          At least two recorded nights are needed to draw this trend.
        </div>

        <div v-else class="mt-6">
          <div
            class="relative h-[22rem] w-full overflow-hidden rounded-xl border border-blue-4/20 bg-blue-1/35 px-2 py-3 sm:px-4"
            @mouseleave="clearChartHover"
          >
            <svg
              class="h-full w-full overflow-visible"
              viewBox="0 0 1000 320"
              preserveAspectRatio="none"
              role="img"
              :aria-label="`${chartMode === 'score' ? 'Sleep score' : 'Sleep duration'} trend for the last 30 days`"
            >
              <defs>
                <linearGradient id="statistics-area-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#99A3FB" stop-opacity="0.28" />
                  <stop offset="100%" stop-color="#99A3FB" stop-opacity="0" />
                </linearGradient>
              </defs>

              <g v-for="grid in chartGrid" :key="grid.label">
                <line
                  x1="58"
                  x2="982"
                  :y1="grid.y"
                  :y2="grid.y"
                  stroke="rgba(109,117,176,0.22)"
                  stroke-width="1"
                  stroke-dasharray="4 6"
                />
                <text
                  x="46"
                  :y="grid.y + 4"
                  fill="#C5C6D0"
                  font-size="11"
                  text-anchor="end"
                >
                  {{ grid.label }}
                </text>
              </g>

              <line
                x1="58"
                x2="982"
                :y1="averageLineY"
                :y2="averageLineY"
                stroke="#FFE7BF"
                stroke-width="1.5"
                stroke-dasharray="7 6"
                opacity="0.8"
              />

              <path :d="chartAreaPath" fill="url(#statistics-area-gradient)" />
              <polyline
                :points="chartPolyline"
                fill="none"
                stroke="#99A3FB"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
              />

              <g v-if="hoveredPoint" class="pointer-events-none">
                <line
                  :x1="CHART_LEFT"
                  :x2="CHART_RIGHT"
                  :y1="hoveredPoint.y"
                  :y2="hoveredPoint.y"
                  stroke="#99A3FB"
                  stroke-width="1.5"
                  stroke-dasharray="7 7"
                  opacity="0.72"
                  vector-effect="non-scaling-stroke"
                />

                <rect
                  x="8"
                  :y="hoveredYAxisLabelY"
                  width="40"
                  height="19"
                  rx="6"
                  fill="#1F265E"
                  stroke="rgba(153,163,251,0.5)"
                />
                <text
                  x="28"
                  :y="hoveredYAxisLabelY + 13"
                  fill="#F5F5F5"
                  font-size="9"
                  font-weight="700"
                  text-anchor="middle"
                >
                  {{ formatChartAxisValue(hoveredPoint.value) }}
                </text>

              </g>

              <g
                v-for="point in chartPoints"
                :key="point.dayKey"
                class="transition-opacity duration-150"
                :opacity="hoveredPoint && hoveredPoint.dayKey !== point.dayKey ? 0.3 : 1"
              >
                <circle
                  :cx="point.x"
                  :cy="point.y"
                  r="14"
                  fill="transparent"
                  style="cursor: default"
                  @mouseenter="scheduleChartHover(point.dayKey)"
                  @mouseleave="clearChartHover"
                />
                <circle
                  :cx="point.x"
                  :cy="point.y"
                  :r="hoveredPoint?.dayKey === point.dayKey ? 3 : 0"
                  :fill="hoveredPoint?.dayKey === point.dayKey ? '#99A3FB' : '#03174D'"
                  :stroke="hoveredPoint?.dayKey === point.dayKey ? '#F5F5F5' : '#99A3FB'"
                  :stroke-width="hoveredPoint?.dayKey === point.dayKey ? 2.5 : 2"
                  class="pointer-events-none"
                  vector-effect="non-scaling-stroke"
                />
              </g>

              <g v-if="bestPoint && !hoveredPoint" class="pointer-events-none">
                <circle
                  :cx="bestPoint.x"
                  :cy="bestPoint.y"
                  r="9"
                  fill="#4ade80"
                  stroke="#03174D"
                  stroke-width="4"
                  vector-effect="non-scaling-stroke"
                />
                <text
                  :x="bestPoint.x"
                  :y="Math.max(17, bestPoint.y - 17)"
                  fill="#4ade80"
                  font-size="11"
                  font-weight="700"
                  text-anchor="middle"
                >
                  Best
                </text>
              </g>

              <g v-if="worstPoint && !hoveredPoint" class="pointer-events-none">
                <circle
                  :cx="worstPoint.x"
                  :cy="worstPoint.y"
                  r="9"
                  fill="#f87171"
                  stroke="#03174D"
                  stroke-width="4"
                  vector-effect="non-scaling-stroke"
                />
                <text
                  :x="worstPoint.x"
                  :y="Math.min(298, worstPoint.y + 24)"
                  fill="#f87171"
                  font-size="11"
                  font-weight="700"
                  text-anchor="middle"
                >
                  Lowest
                </text>
              </g>

              <text
                v-for="label in xAxisLabels"
                :key="label.dayKey"
                :x="label.x"
                y="313"
                fill="#C5C6D0"
                font-size="11"
                text-anchor="middle"
              >
                {{ label.label }}
              </text>
            </svg>

            <div
              v-if="hoveredPoint"
              class="pointer-events-none absolute z-20 min-w-32 rounded-lg border border-blue-4/40 bg-blue-2/95 px-3 py-2 shadow-[0_9px_24px_rgba(3,10,40,0.45)] backdrop-blur-md"
              :style="hoveredTooltipStyle"
            >
              <p class="text-[0.52rem] font-semibold uppercase tracking-[0.12em] text-grey-1">
                {{ chartMode === 'score' ? 'Sleep score' : 'Sleep duration' }}
              </p>
              <p class="mt-0.5 text-xl font-extrabold tracking-tight text-white">
                {{ formatChartValue(hoveredPoint.value) }}
              </p>
              <div class="mt-1.5 border-t border-blue-4/25 pt-1.5">
                <p class="text-[0.65rem] font-medium text-grey-2">{{ hoveredPoint.fullLabel }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        class="overflow-hidden rounded-2xl border border-blue-4/25 bg-blue-2/35 p-5 shadow-[0_4px_30px_rgba(3,23,77,0.4)] sm:p-6"
        aria-labelledby="calendar-heading"
      >
        <div class="mb-5">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-grey-1">
            Sleep Calendar
          </p>
          <h2 id="calendar-heading" class="mt-1 text-xl font-bold text-grey-2">
            Heatmap
          </h2>
        </div>

        <HeatmapPage />
      </section>

      <section aria-labelledby="insights-heading" class="pb-6">
        <div class="mb-4">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-grey-1">
            Analysis
          </p>
          <h2 id="insights-heading" class="mt-1 text-xl font-bold text-grey-2">
            Insights from your data
          </h2>
        </div>

        <div v-if="isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            v-for="n in 4"
            :key="n"
            class="h-36 animate-pulse rounded-2xl border border-blue-4/20 bg-blue-1"
          />
        </div>

        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article
            v-for="insight in insights"
            :key="insight.title"
            class="rounded-2xl border border-blue-4/25 bg-blue-1 p-5 shadow-[0_4px_24px_rgba(3,23,77,0.28)]"
          >
            <div class="flex items-start gap-4">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg"
                :class="insight.iconClass"
                aria-hidden="true"
              >
                {{ insight.icon }}
              </div>
              <div>
                <h3 class="font-bold text-white">{{ insight.title }}</h3>
                <p class="mt-2 text-sm leading-6 text-grey-1">{{ insight.body }}</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import HeatmapPage from './HeatmapPage.vue';
import SleepPatternsCard from '../components/SleepPatternsCard.vue';
import { fetchWhoopSleepHistory } from '../services/sleep.service';
import { buildDayEntryMap, toLocalDayKey } from '../utils/sleepHeatmap';

const TARGET_SLEEP_MINUTES = 8 * 60;
const CHART_LEFT = 58;
const CHART_RIGHT = 982;
const CHART_TOP = 18;
const CHART_BOTTOM = 286;

const sessions = ref([]);
const isLoading = ref(true);
const loadError = ref('');
const chartMode = ref('score');
const hoveredDayKey = ref(null);
let chartHoverTimer = null;
let chartAnimationFrame = null;

const chartOptions = [
  { label: 'Score', value: 'score' },
  { label: 'Duration', value: 'duration' },
];

function validNumber(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return '—';
  const rounded = Math.max(0, Math.round(minutes));
  return `${Math.floor(rounded / 60)}h ${String(rounded % 60).padStart(2, '0')}m`;
}

function formatDurationDifference(minutes) {
  if (!Number.isFinite(minutes)) return '—';
  const rounded = Math.max(0, Math.round(minutes));
  if (rounded < 60) return `${rounded}m`;
  return formatDuration(rounded);
}

function formatDateLabel(dayKey, options = { day: 'numeric', month: 'short' }) {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', options);
}

const dayEntryMap = computed(() => buildDayEntryMap(sessions.value));

const last30Days = computed(() => {
  const days = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  for (let index = 29; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const dayKey = toLocalDayKey(date);
    days.push({
      date,
      dayKey,
      entry: dayEntryMap.value.get(dayKey) || null,
    });
  }
  return days;
});

const recordedLast30 = computed(() =>
  last30Days.value.map((day) => day.entry).filter(Boolean)
);

const current7Days = computed(() => last30Days.value.slice(-7));
const previous7Days = computed(() => last30Days.value.slice(-14, -7));

function valuesForDays(days, key, transform = (value) => value) {
  return days
    .map((day) => {
      const value = validNumber(day.entry?.[key]);
      return value == null ? null : transform(value);
    });
}

const scoreValues = computed(() =>
  recordedLast30.value
    .map((entry) => validNumber(entry.sleep_performance_score))
    .filter((value) => value != null)
);

const durationValues = computed(() =>
  recordedLast30.value
    .map((entry) => validNumber(entry.total_sleep_duration_minutes))
    .filter((value) => value != null && value > 0)
);

const consistencyValues = computed(() =>
  recordedLast30.value
    .map((entry) => {
      const value = validNumber(entry.sleep_consistency);
      if (value == null) return null;
      return value > 0 && value <= 1 ? value * 100 : value;
    })
    .filter((value) => value != null)
);

const current7ScoreValues = computed(() =>
  valuesForDays(current7Days.value, 'sleep_performance_score')
);
const previous7ScoreValues = computed(() =>
  valuesForDays(previous7Days.value, 'sleep_performance_score')
);
const current7DurationValues = computed(() =>
  valuesForDays(current7Days.value, 'total_sleep_duration_minutes')
);
const previous7DurationValues = computed(() =>
  valuesForDays(previous7Days.value, 'total_sleep_duration_minutes')
);
const current7ConsistencyValues = computed(() =>
  valuesForDays(current7Days.value, 'sleep_consistency', (value) =>
    value > 0 && value <= 1 ? value * 100 : value
  )
);
const previous7ConsistencyValues = computed(() =>
  valuesForDays(previous7Days.value, 'sleep_consistency', (value) =>
    value > 0 && value <= 1 ? value * 100 : value
  )
);

const averageScore = computed(() => average(current7ScoreValues.value));
const averageDuration = computed(() => average(current7DurationValues.value));
const averageConsistency = computed(() => average(current7ConsistencyValues.value));

const currentStreak = computed(() => {
  const map = dayEntryMap.value;
  if (!map.size) return 0;

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  let cursor = new Date(today);
  if (!map.has(toLocalDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const entry = map.get(toLocalDayKey(cursor));
    if (!entry) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
});

function smoothSparklinePath(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (valid.length < 2) return '';
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = Math.max(1, max - min);
  const points = valid.map((value, index) => {
      const x = (index / (valid.length - 1)) * 120;
      const y = 23 - ((value - min) / range) * 18;
      return { x, y };
    });

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midpointX = (current.x + next.x) / 2;
    path += ` C ${midpointX} ${current.y}, ${midpointX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

function comparisonTrend(currentValues, previousValues, formatter) {
  const current = average(currentValues);
  const previous = average(previousValues);
  if (current == null || previous == null) {
    return {
      text: 'Not enough comparison data',
      className: 'text-grey-1',
    };
  }
  const difference = current - previous;
  if (Math.abs(difference) < 0.5) {
    return {
      text: '→ No change vs previous 7 days',
      className: 'text-grey-1',
    };
  }
  return {
    text: `${difference > 0 ? '↑' : '↓'} ${formatter(Math.abs(difference))} vs previous 7 days`,
    className: difference > 0 ? 'text-[#4ade80]' : 'text-[#fca5a5]',
  };
}

const kpis = computed(() => [
  (() => {
    const trend = comparisonTrend(
      current7ScoreValues.value,
      previous7ScoreValues.value,
      (value) => `${Math.round(value)}%`
    );
    return {
      label: 'Average Sleep Score',
      value: averageScore.value == null ? '—' : `${Math.round(averageScore.value)}%`,
      color: 'text-white',
      icon: 'score',
      iconClass: 'border-purple/35 bg-purple/15 text-purple',
      trend: trend.text,
      trendClass: trend.className,
      sparkPath: smoothSparklinePath(current7ScoreValues.value),
      sparkColor: '#99A3FB',
    };
  })(),
  (() => {
    const trend = comparisonTrend(
      current7DurationValues.value,
      previous7DurationValues.value,
      (value) => formatDurationDifference(value)
    );
    return {
      label: 'Average Duration',
      value: formatDuration(averageDuration.value),
      color: 'text-white',
      icon: 'duration',
      iconClass: 'border-[#60a5fa]/35 bg-[#2563eb]/15 text-[#60a5fa]',
      trend: trend.text,
      trendClass: trend.className,
      sparkPath: smoothSparklinePath(current7DurationValues.value),
      sparkColor: '#60a5fa',
    };
  })(),
  (() => {
    const trend = comparisonTrend(
      current7ConsistencyValues.value,
      previous7ConsistencyValues.value,
      (value) => `${Math.round(value)}%`
    );
    return {
      label: 'Consistency',
      value:
        averageConsistency.value == null ? '—' : `${Math.round(averageConsistency.value)}%`,
      color: 'text-white',
      icon: 'consistency',
      iconClass: 'border-[#4ade80]/35 bg-[#16a34a]/15 text-[#4ade80]',
      trend: trend.text,
      trendClass: trend.className,
      sparkPath: smoothSparklinePath(current7ConsistencyValues.value),
      sparkColor: '#4ade80',
    };
  })(),
  {
    label: 'Sleep Debt',
    value: '-',
    color: 'text-grey-2',
    icon: 'debt',
    iconClass: 'border-yellow/35 bg-yellow/10 text-yellow',
    trend: 'Calculation pending',
    trendClass: 'text-grey-1',
    sparkPath: '',
    sparkColor: '#f59e0b',
  },
  (() => {
    return {
      label: 'Current Streak',
      value: `${currentStreak.value} ${currentStreak.value === 1 ? 'night' : 'nights'}`,
      color: 'text-white',
      icon: 'streak',
      iconClass: 'border-[#fb923c]/35 bg-[#f97316]/15 text-[#fb923c]',
      isStreak: true,
      streakDays: current7Days.value.slice(-5).map((day) => ({
        dayKey: day.dayKey,
        logged: !!day.entry,
        label: formatDateLabel(day.dayKey, { weekday: 'short', day: 'numeric' }),
        shortLabel: formatDateLabel(day.dayKey, { weekday: 'short' }),
      })),
    };
  })(),
]);

const chartScale = computed(() => {
  if (chartMode.value === 'score') {
    return { min: 0, max: 100, ticks: [100, 75, 50, 25, 0] };
  }
  const maxDuration = Math.max(...durationValues.value, TARGET_SLEEP_MINUTES);
  const maxHours = Math.max(10, Math.ceil(maxDuration / 60));
  return {
    min: 0,
    max: maxHours * 60,
    ticks: [maxHours * 60, maxHours * 45, maxHours * 30, maxHours * 15, 0],
  };
});

function chartX(index) {
  return CHART_LEFT + (index / 29) * (CHART_RIGHT - CHART_LEFT);
}

function chartY(value) {
  const { min, max } = chartScale.value;
  const ratio = (value - min) / Math.max(1, max - min);
  return CHART_BOTTOM - ratio * (CHART_BOTTOM - CHART_TOP);
}

const targetChartPoints = computed(() =>
  last30Days.value
    .map((day, index) => {
      const raw =
        chartMode.value === 'score'
          ? validNumber(day.entry?.sleep_performance_score)
          : validNumber(day.entry?.total_sleep_duration_minutes);
      if (raw == null || (chartMode.value === 'duration' && raw <= 0)) return null;
      return {
        dayKey: day.dayKey,
        value: raw,
        x: chartX(index),
        y: chartY(raw),
        axisDate: formatDateLabel(day.dayKey),
        fullLabel: formatDateLabel(day.dayKey, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      };
    })
    .filter(Boolean)
);

const chartPoints = ref([]);

watch(
  targetChartPoints,
  (nextPoints) => {
    if (chartAnimationFrame) {
      cancelAnimationFrame(chartAnimationFrame);
      chartAnimationFrame = null;
    }

    const previousByDay = new Map(
      chartPoints.value.map((point) => [point.dayKey, point])
    );
    const animatedTargets = nextPoints.map((point) => ({
      ...point,
      startY: previousByDay.get(point.dayKey)?.y ?? point.y,
    }));

    const duration = 150;
    const startedAt = performance.now();

    const animate = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      chartPoints.value = animatedTargets.map(({ startY, ...point }) => ({
        ...point,
        y: startY + (point.y - startY) * eased,
      }));

      if (progress < 1) {
        chartAnimationFrame = requestAnimationFrame(animate);
      } else {
        chartAnimationFrame = null;
      }
    };

    chartAnimationFrame = requestAnimationFrame(animate);
  },
  { immediate: true }
);

const hoveredPoint = computed(() => {
  if (!hoveredDayKey.value) return null;
  return chartPoints.value.find((point) => point.dayKey === hoveredDayKey.value) || null;
});

const hoveredYAxisLabelY = computed(() => {
  if (!hoveredPoint.value) return 0;
  return Math.min(CHART_BOTTOM - 10, Math.max(4, hoveredPoint.value.y - 9.5));
});

const hoveredTooltipStyle = computed(() => {
  if (!hoveredPoint.value) return {};
  const left = `${(hoveredPoint.value.x / 1000) * 100}%`;
  const top = `${Math.min(82, Math.max(12, (hoveredPoint.value.y / 320) * 100))}%`;
  const translateX = hoveredPoint.value.x > 760 ? '-108%' : '12px';
  return {
    left,
    top,
    transform: `translate(${translateX}, -50%)`,
  };
});

const chartValues = computed(() => chartPoints.value.map((point) => point.value));
const chartAverage = computed(() => average(chartValues.value));
const averageLineY = computed(() => chartY(chartAverage.value || 0));
const chartPolyline = computed(() =>
  chartPoints.value.map((point) => `${point.x},${point.y}`).join(' ')
);
const chartAreaPath = computed(() => {
  if (!chartPoints.value.length) return '';
  const first = chartPoints.value[0];
  const last = chartPoints.value[chartPoints.value.length - 1];
  return `M ${first.x} ${CHART_BOTTOM} L ${chartPoints.value
    .map((point) => `${point.x} ${point.y}`)
    .join(' L ')} L ${last.x} ${CHART_BOTTOM} Z`;
});

const bestPoint = computed(() => {
  if (!chartPoints.value.length) return null;
  return chartPoints.value.reduce((best, point) => (point.value > best.value ? point : best));
});

const worstPoint = computed(() => {
  if (!chartPoints.value.length) return null;
  return chartPoints.value.reduce((worst, point) =>
    point.value < worst.value ? point : worst
  );
});

const chartGrid = computed(() =>
  chartScale.value.ticks.map((value) => ({
    value,
    y: chartY(value),
    label: chartMode.value === 'score' ? String(Math.round(value)) : `${Math.round(value / 60)}h`,
  }))
);

const xAxisLabels = computed(() =>
  last30Days.value
    .map((day, index) => ({
      ...day,
      index,
      x: chartX(index),
      label: formatDateLabel(day.dayKey),
    }))
    .filter((day) => day.index === 0 || day.index === 29 || day.index % 5 === 0)
);

function formatChartValue(value) {
  if (!Number.isFinite(value)) return '—';
  return chartMode.value === 'score' ? `${Math.round(value)}%` : formatDuration(value);
}

function formatChartAxisValue(value) {
  if (!Number.isFinite(value)) return '—';
  if (chartMode.value === 'score') return String(Math.round(value));
  const hours = value / 60;
  return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)}h`;
}

function scheduleChartHover(dayKey) {
  if (chartHoverTimer) clearTimeout(chartHoverTimer);
  chartHoverTimer = setTimeout(() => {
    hoveredDayKey.value = dayKey;
    chartHoverTimer = null;
  }, 50);
}

function clearChartHover() {
  if (chartHoverTimer) {
    clearTimeout(chartHoverTimer);
    chartHoverTimer = null;
  }
  hoveredDayKey.value = null;
}

function stopChartAnimation() {
  if (chartAnimationFrame) {
    cancelAnimationFrame(chartAnimationFrame);
    chartAnimationFrame = null;
  }
}

function bedtimeMinutes(entry) {
  if (!entry?.bedtime) return null;
  const date = new Date(entry.bedtime);
  if (Number.isNaN(date.getTime())) return null;
  let minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < 12 * 60) minutes += 24 * 60;
  return minutes;
}

const insights = computed(() => {
  const result = [];
  const scores = scoreValues.value;
  const durations = durationValues.value;

  if (scores.length >= 4) {
    const midpoint = Math.floor(scores.length / 2);
    const earlier = average(scores.slice(0, midpoint));
    const recent = average(scores.slice(midpoint));
    const difference = Math.round(recent - earlier);
    result.push({
      icon: difference >= 0 ? '↗' : '↘',
      title: difference >= 0 ? 'Sleep score is trending upward' : 'Sleep score has softened',
      body: `Your recent average is ${Math.abs(difference)} point${
        Math.abs(difference) === 1 ? '' : 's'
      } ${difference >= 0 ? 'higher' : 'lower'} than the first half of this 30-day window.`,
      iconClass:
        difference >= 0
          ? 'border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80]'
          : 'border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]',
    });
  } else {
    result.push({
      icon: '↗',
      title: 'More score data is needed',
      body: 'Record at least four scored nights to unlock a meaningful 30-day score trend.',
      iconClass: 'border-purple/30 bg-purple/10 text-purple',
    });
  }

  if (durations.length) {
    const avg = average(durations);
    const gap = TARGET_SLEEP_MINUTES - avg;
    result.push({
      icon: gap > 0 ? '◷' : '✓',
      title: gap > 0 ? 'Your average is below the 8-hour target' : 'You are meeting the duration target',
      body:
        gap > 0
          ? `You average ${formatDuration(avg)}, leaving a typical nightly gap of ${formatDuration(
              gap
            )}.`
          : `You average ${formatDuration(avg)}, which meets or exceeds the 8-hour reference target.`,
      iconClass:
        gap > 0
          ? 'border-yellow/30 bg-yellow/10 text-yellow'
          : 'border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80]',
    });
  }

  const bedtimes = recordedLast30.value.map(bedtimeMinutes).filter((value) => value != null);
  if (bedtimes.length >= 3) {
    const mean = average(bedtimes);
    const meanDeviation = average(bedtimes.map((value) => Math.abs(value - mean)));
    result.push({
      icon: '≈',
      title: meanDeviation <= 30 ? 'Your bedtime is highly regular' : 'Bedtime regularity can improve',
      body: `Your bedtime varies by about ${Math.round(
        meanDeviation
      )} minutes from your 30-day average. Keeping that variation below 30 minutes supports a stronger routine.`,
      iconClass:
        meanDeviation <= 30
          ? 'border-[#6ee7b7]/30 bg-[#6ee7b7]/10 text-[#6ee7b7]'
          : 'border-blue-4/40 bg-blue-4/10 text-purple',
    });
  }

  if (bestPoint.value && worstPoint.value) {
    result.push({
      icon: '★',
      title: `${formatDateLabel(bestPoint.value.dayKey)} was your strongest night`,
      body: `Your best ${chartMode.value === 'score' ? 'score' : 'duration'} was ${formatChartValue(
        bestPoint.value.value
      )}. Your lowest was ${formatChartValue(worstPoint.value.value)} on ${formatDateLabel(
        worstPoint.value.dayKey
      )}.`,
      iconClass: 'border-purple/30 bg-purple/10 text-purple',
    });
  }

  if (!result.length) {
    result.push({
      icon: 'i',
      title: 'Start building your sleep history',
      body: 'Add or sync sleep sessions to generate trend, duration, consistency, and streak insights.',
      iconClass: 'border-purple/30 bg-purple/10 text-purple',
    });
  }

  return result.slice(0, 4);
});

async function loadSessions() {
  isLoading.value = true;
  loadError.value = '';
  const token = localStorage.getItem('sessionToken');
  if (!token) {
    sessions.value = [];
    isLoading.value = false;
    return;
  }

  try {
    const rows = await fetchWhoopSleepHistory(token);
    sessions.value = Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Failed to load statistics sessions:', error);
    sessions.value = [];
    loadError.value = 'Statistics could not be loaded. Check that the server is running and try again.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadSessions);
onBeforeUnmount(() => {
  clearChartHover();
  stopChartAnimation();
});
</script>
