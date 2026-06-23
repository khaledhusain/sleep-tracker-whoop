<template>
  <div class="flex w-full flex-1 flex-col pb-6 [overflow-anchor:none]">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-1.5 sm:gap-2">
      <p
        v-if="error"
        class="mb-3 rounded-xl border border-[#f87171]/40 bg-[#f87171]/10 px-3 py-2 text-sm text-[#fca5a5]"
      >
        {{ error }}
      </p>

      <div
        class="relative grid min-h-[34rem] grid-cols-1 items-start gap-5 max-[900px]:max-h-none min-[901px]:grid-cols-[minmax(0,1fr)_30rem]"
      >
        <div
          v-if="loading && !hasLoadedMonth"
          class="absolute inset-0 z-30 flex min-h-[34rem] flex-col items-center justify-center rounded-2xl border border-blue-4/20 bg-blue-1/85 text-grey-1 backdrop-blur-[2px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-3 border-t-purple" />
          <p class="mt-2 text-sm">Loading month…</p>
        </div>

        <div
          class="min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-blue-4/30 bg-[rgb(3_23_77/0.52)] p-5 shadow-[0_4px_30px_rgba(3,23,77,0.35)]"
        >
          <div ref="monthNav" class="mb-5 flex justify-center [overflow-anchor:none]">
            <div class="flex flex-col items-center gap-1">
              <div class="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  class="rounded-lg border border-blue-4/40 bg-blue-3/50 p-1.5 text-purple transition hover:border-purple/50 hover:bg-blue-4/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple/60 disabled:opacity-40 sm:p-2"
                  :disabled="loading"
                  aria-label="Previous month"
                  @click="shiftMonth(-1)"
                >
                  <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span class="min-w-[7.5rem] text-center text-sm font-semibold tabular-nums text-white sm:min-w-[9rem] sm:text-base">
                  {{ monthTitle }}
                </span>
                <button
                  type="button"
                  class="rounded-lg border border-blue-4/40 bg-blue-3/50 p-1.5 text-purple transition hover:border-purple/50 hover:bg-blue-4/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple/60 disabled:opacity-40 sm:p-2"
                  :disabled="loading"
                  aria-label="Next month"
                  @click="shiftMonth(1)"
                >
                  <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p v-if="monthSummary.label" class="text-[0.7rem] text-grey-1 sm:text-xs">
                {{ monthSummary.label }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-2.5 min-[901px]:gap-3">
            <div
              v-for="wd in weekDays"
              :key="wd"
              class="pb-0.5 text-center text-[0.6rem] font-semibold uppercase tracking-wider text-grey-1 sm:text-[0.65rem]"
            >
              {{ wd }}
            </div>
            <template v-for="(cell, idx) in gridCells" :key="idx">
              <div
                v-if="cell.type === 'pad'"
                class="aspect-square min-h-0 rounded-[10px]"
                aria-hidden="true"
              />
              <button
                v-else
                type="button"
                class="group relative flex aspect-square min-h-0 w-full items-start justify-start overflow-hidden rounded-[10px] border p-1.5"
                :class="cellButtonClass(cell)"
                :title="cell.entry && cellHoverLabel(cell) ? cellHoverLabel(cell) : undefined"
                @click="onDayClick(cell)"
              >
                <span
                  class="relative z-10 text-[0.8125rem] font-extrabold leading-none tracking-[-0.02em] text-inherit [font-variant-numeric:tabular-nums] sm:text-sm"
                  >{{ cell.day }}</span>
                <span
                  v-if="cell.entry && cellHoverLabel(cell)"
                  class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-0.5"
                >
                  <span
                    class="text-center text-[0.65rem] font-bold leading-none text-white opacity-0 [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_10px_rgba(0,0,0,0.55)] [font-variant-numeric:tabular-nums] transition-opacity duration-300 ease-out group-hover:opacity-100"
                    >{{ cellHoverLabel(cell) }}</span>
                </span>
              </button>
            </template>
          </div>

          <div
            class="mt-2.5 flex w-full flex-wrap items-center justify-end gap-1 pb-1 sm:mt-3"
            aria-label="Sleep score colors, low to high"
          >
            <span title="0-29" class="size-3 shrink-0 rounded bg-[#991B1B] sm:size-4" />
            <span title="30-39" class="size-3 shrink-0 rounded bg-[#DC2626] sm:size-4" />
            <span title="40-49" class="size-3 shrink-0 rounded bg-[#F97316] sm:size-4" />
            <span title="50-59" class="size-3 shrink-0 rounded bg-[#CA8A04] sm:size-4" />
            <span title="60-69" class="size-3 shrink-0 rounded bg-[#FACC15] sm:size-4" />
            <span title="70-79" class="size-3 shrink-0 rounded bg-[#16A34A] sm:size-4" />
            <span title="80-89" class="size-3 shrink-0 rounded bg-[#126f35] sm:size-4" />
            <span title="90-100" class="size-3 shrink-0 rounded bg-[#0e5629] sm:size-4" />
          </div>

          <div v-if="!monthHasData" class="mt-2">
            <p
              class="rounded-lg border border-blue-4/20 bg-blue-2/30 py-3 text-center text-xs text-grey-1"
            >
              No sleep data for this month
            </p>
          </div>
        </div>

        <aside
          class="flex w-full min-w-0 flex-col gap-0 overflow-x-hidden rounded-2xl border border-blue-4/30 bg-[rgb(3_23_77/0.52)] p-5 shadow-[0_4px_30px_rgba(3,23,77,0.35)] max-[900px]:static max-[900px]:min-h-0 min-[901px]:max-w-[30rem] min-[901px]:shrink-0 min-[901px]:self-start min-[901px]:sticky min-[901px]:top-5"
        >
          <!-- 1. Header -->
          <header
            class="mb-4 flex flex-col items-start gap-2.5 border-b border-[rgb(109_117_176/0.3)] pb-3.5 min-[480px]:flex-row min-[480px]:items-baseline min-[480px]:justify-between min-[480px]:gap-3"
          >
            <h2
              class="m-0 text-lg font-bold leading-snug tracking-[-0.01em] text-white sm:text-xl"
            >
              {{ selectedDayKey ? selectedDateHeading : 'Day details' }}
            </h2>
          </header>

          <div v-if="!selectedDayKey" class="text-sm leading-[1.45] text-grey-1">
            Choose a date in the calendar to see sleep metrics.
          </div>

          <template v-else-if="!selectedEntry">
            <div class="text-sm leading-[1.45] text-grey-1">
              No sleep logged for this day.
            </div>
          </template>

          <template v-else>
            <!-- 2. Primary metrics (boxed): Score, Duration, Time in bed -->
            <div
              v-if="hasAnyPrimaryMetric"
              :class="primaryMetricsGridClass"
            >
              <div
                v-if="primaryScoreShown"
                class="flex min-w-0 flex-col justify-start rounded-xl border border-[rgb(109_117_176/0.28)] bg-[rgb(31_38_94/0.35)] px-3 py-3 pb-3.5 sm:px-3.5 sm:py-3.5 sm:pb-4"
              >
                <p
                  class="m-0 truncate text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.08em] text-[rgb(197_198_208/0.92)]"
                >
                  Sleep score
                </p>
                <p
                  class="m-0 mt-2.5 text-2xl font-extrabold leading-[1.15] tracking-[-0.02em] text-[rgb(110_231_183)] [font-variant-numeric:tabular-nums] sm:text-[1.65rem]"
                >
                  {{ selectedEntry.sleep_performance_score }}
                </p>
              </div>
              <div
                v-if="primaryDurationShown"
                class="flex min-w-0 flex-col justify-start rounded-xl border border-[rgb(109_117_176/0.28)] bg-[rgb(31_38_94/0.35)] px-3 py-3 pb-3.5 sm:px-3.5 sm:py-3.5 sm:pb-4"
              >
                <p
                  class="m-0 truncate text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.08em] text-[rgb(197_198_208/0.92)]"
                >
                  Sleep duration
                </p>
                <p
                  class="m-0 mt-2.5 text-lg font-bold leading-[1.15] tracking-[-0.02em] text-white [font-variant-numeric:tabular-nums] sm:text-xl"
                >
                  {{ formatDurationHoursMinutes(selectedEntry.total_sleep_duration_minutes) }}
                </p>
              </div>
              <div
                v-if="primaryInBedShown"
                class="flex min-w-0 flex-col justify-start rounded-xl border border-[rgb(109_117_176/0.28)] bg-[rgb(31_38_94/0.35)] px-3 py-3 pb-3.5 sm:px-3.5 sm:py-3.5 sm:pb-4"
              >
                <p
                  class="m-0 truncate text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.08em] text-[rgb(197_198_208/0.92)]"
                >
                  Time in bed
                </p>
                <p
                  class="m-0 mt-2.5 text-lg font-bold leading-[1.15] tracking-[-0.02em] text-white [font-variant-numeric:tabular-nums] sm:text-xl"
                >
                  {{ formatDurationHoursMinutes(selectedEntry.total_in_bed_minutes) }}
                </p>
              </div>
            </div>

            <div
              v-if="bedWakeSub && primaryInBedShown"
              class="mb-4 mt-3 flex flex-col gap-1.5 rounded-xl border border-[rgb(109_117_176/0.22)] bg-[rgb(31_38_94/0.28)] px-3.5 py-[11px]"
            >
              <span
                class="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[rgb(197_198_208/0.8)]"
                >Sleep Window</span>
              <span
                class="break-words text-[0.84rem] font-medium leading-[1.45] tracking-[0.02em] text-[rgb(245_245_245/0.96)] [font-variant-numeric:tabular-nums] sm:text-[0.88rem]"
                >{{ bedWakeSub }}</span>
            </div>

            <!-- 3. Secondary: efficiency & consistency, inline -->
            <div
              v-if="hasSecondaryMetrics"
              class="mb-[18px] grid grid-cols-2 gap-x-4 gap-y-2.5 pb-0.5"
            >
              <p
                v-if="efficiencyShown"
                class="m-0 text-[0.78rem] leading-[1.4] text-[rgb(211_212_222/0.95)]"
              >
                <span
                  class="mb-0.5 block text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-[rgb(197_198_208/0.75)]"
                  >Sleep Efficiency</span>
                <span
                  class="font-semibold text-[rgb(245_245_245/0.95)] [font-variant-numeric:tabular-nums]"
                  >{{ selectedEntry.sleep_efficiency }}%</span>
              </p>
              <p
                v-if="consistencyShown"
                class="m-0 text-[0.78rem] leading-[1.4] text-[rgb(211_212_222/0.95)]"
              >
                <span
                  class="mb-0.5 block text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-[rgb(197_198_208/0.75)]"
                  >Sleep Consistency</span>
                <span
                  class="font-semibold text-[rgb(245_245_245/0.95)] [font-variant-numeric:tabular-nums]"
                  >{{ selectedEntry.sleep_consistency }}%</span>
              </p>
            </div>

            <!-- 4. Sleep stages -->
            <section
              v-if="stageSegments"
              class="mt-0.5 border-t border-[rgb(109_117_176/0.22)] pt-4"
            >
              <h3
                class="mb-3 mt-0 text-[0.68rem] font-semibold uppercase tracking-[0.07em] text-[rgb(197_198_208/0.9)]"
              >
                Sleep stages
              </h3>
              <div class="flex h-3.5 w-full overflow-hidden rounded-full bg-[rgb(109_117_176/0.18)]">
                <div
                  v-for="seg in stageSegments"
                  :key="seg.key"
                  class="h-full min-w-0"
                  :style="{ width: `${seg.widthPct}%`, backgroundColor: seg.color }"
                  :title="`${seg.label} ${formatDurationHoursMinutes(seg.minutes)} (${seg.pct}%)`"
                />
              </div>
              <ul
                class="m-0 mt-3.5 grid list-none grid-cols-2 gap-x-[18px] gap-y-3 p-0 max-[380px]:grid-cols-1"
              >
                <li
                  v-for="seg in stageSegments"
                  :key="seg.label"
                  class="flex min-w-0 items-start gap-2"
                >
                  <span
                    class="mt-[0.35em] h-[7px] w-[7px] shrink-0 rounded-full"
                    :style="{ backgroundColor: seg.color }"
                  />
                  <p class="m-0 min-w-0 text-[0.78rem] leading-[1.45]">
                    <span class="font-semibold text-white">{{ seg.label }}</span>
                    <span class="font-normal text-[rgb(197_198_208/0.55)]"> - </span>
                    <span
                      class="text-[0.74rem] text-[rgb(197_198_208/0.92)] [font-variant-numeric:tabular-nums]"
                    >
                      {{ formatDurationHoursMinutes(seg.minutes) }} · {{ seg.pct }}%
                    </span>
                  </p>
                </li>
              </ul>
            </section>
            <p
              v-else
              class="mt-4 border-t border-[rgb(109_117_176/0.18)] pt-3.5 text-[0.72rem] leading-[1.4] text-[rgb(197_198_208/0.65)]"
            >
              Detailed stage data not available for this entry.
            </p>
          </template>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { fetchSleepData } from '@/services/sleep.service';
import {
  buildDayEntryMap,
  buildMonthGridCells,
  computeMonthSummary,
  monthStartEndDateStrings,
  toLocalDayKey,
  getStageSegments,
  formatDurationHoursMinutes,
  formatTimeRangeLabel,
  formatMinutesAsHm,
} from '@/utils/sleepHeatmap';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const now = new Date();
const viewYear = ref(now.getFullYear());
const viewMonth = ref(now.getMonth());

const loading = ref(true);
const hasLoadedMonth = ref(false);
const error = ref('');
const rawEntries = ref([]);
const dayMap = ref(new Map());
const selectedDayKey = ref(null);
const monthNav = ref(null);
let monthNavViewportTop = null;

const monthTitle = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  })
);

const gridCells = computed(() =>
  buildMonthGridCells(viewYear.value, viewMonth.value, dayMap.value)
);

const monthSummary = computed(() =>
  computeMonthSummary(dayMap.value, viewYear.value, viewMonth.value)
);

const monthHasData = computed(() => {
  for (const c of gridCells.value) {
    if (c.type === 'day' && c.entry) return true;
  }
  return false;
});

const selectedEntry = computed(() => {
  if (!selectedDayKey.value) return null;
  return dayMap.value.get(selectedDayKey.value) || null;
});

const selectedDateHeading = computed(() => {
  if (!selectedDayKey.value) return '';
  const [y, m, d] = selectedDayKey.value.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
});

const bedWakeSub = computed(() => {
  const e = selectedEntry.value;
  if (!e) return '';
  return formatTimeRangeLabel(e.bedtime, e.wake_time);
});

const stageSegments = computed(() => {
  const e = selectedEntry.value;
  if (!e) return null;
  return getStageSegments(e);
});

const primaryScoreShown = computed(() => {
  const e = selectedEntry.value;
  if (!e) return false;
  const sc = e.sleep_performance_score;
  return sc != null && sc !== '' && !Number.isNaN(Number(sc));
});

const primaryDurationShown = computed(() => {
  const e = selectedEntry.value;
  if (!e) return false;
  const d = Number(e.total_sleep_duration_minutes);
  return !Number.isNaN(d) && d > 0;
});

const primaryInBedShown = computed(() => {
  const e = selectedEntry.value;
  if (!e) return false;
  const d = Number(e.total_in_bed_minutes);
  return !Number.isNaN(d) && d > 0;
});

const hasAnyPrimaryMetric = computed(
  () =>
    primaryScoreShown.value || primaryDurationShown.value || primaryInBedShown.value
);

const primaryMetricsGridClass = computed(() => {
  let n = 0;
  if (primaryScoreShown.value) n++;
  if (primaryDurationShown.value) n++;
  if (primaryInBedShown.value) n++;
  const base = 'mb-0 grid min-w-0 items-stretch gap-3';
  if (n <= 1) return `${base} grid-cols-1`;
  if (n === 2) return `${base} grid-cols-2`;
  return `${base} grid-cols-1 min-[520px]:grid-cols-3`;
});

const efficiencyShown = computed(() => {
  const e = selectedEntry.value;
  if (!e) return false;
  const v = e.sleep_efficiency;
  return v != null && v !== '' && !Number.isNaN(Number(v));
});

const consistencyShown = computed(() => {
  const e = selectedEntry.value;
  if (!e) return false;
  const v = e.sleep_consistency;
  return v != null && v !== '' && !Number.isNaN(Number(v));
});

const hasSecondaryMetrics = computed(
  () => efficiencyShown.value || consistencyShown.value
);

function todayKey() {
  return toLocalDayKey(new Date());
}

function isCellToday(cell) {
  if (cell.type !== 'day') return false;
  return cell.dayKey === todayKey();
}

function isCellSelected(cell) {
  if (cell.type !== 'day') return false;
  return cell.dayKey === selectedDayKey.value;
}

function cellHoverLabel(cell) {
  if (cell.type !== 'day' || !cell.entry) return '';
  const e = cell.entry;
  const sc = e.sleep_performance_score;
  if (sc != null && sc !== '' && !Number.isNaN(Number(sc))) {
    return String(sc);
  }
  const fromSleep = formatMinutesAsHm(e.total_sleep_duration_minutes);
  if (fromSleep) return fromSleep;
  return formatMinutesAsHm(e.total_in_bed_minutes);
}

function cellButtonClass(cell) {
  const base =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple/70';
  if (cell.type !== 'day') return base;

  const today = isCellToday(cell);
  const sel = isCellSelected(cell);

  const tier = cell.tier;
  const dayShadowDark =
    '[&>span:first-child]:[text-shadow:0_1px_2px_rgba(0,0,0,0.35),0_0_1px_rgba(0,0,0,0.5)]';
  const tierStyles = {
    t1: `border-white/20 bg-[#0e5629] text-white hover:bg-[#14532d] ${dayShadowDark}`,
    t2: `border-white/25 bg-[#126f35] text-white hover:bg-[#166534] ${dayShadowDark}`,
    t3: `border-white/20 bg-[#16A34A] text-white hover:bg-[#15803d] ${dayShadowDark}`,
    t4:
      `border-black/15 bg-[#FACC15] text-white hover:bg-[#eab308] ${dayShadowDark}`,
    t5:
      `border-black/15 bg-[#CA8A04] text-white hover:bg-[#a16207] ${dayShadowDark}`,
    t6:
      `border-black/15 bg-[#F97316] text-white hover:bg-[#ea580c] ${dayShadowDark}`,
    t7: `border-white/20 bg-[#DC2626] text-white hover:bg-[#b91c1c] ${dayShadowDark}`,
    t8: `border-white/25 bg-[#991B1B] text-white hover:bg-[#7f1d1d] ${dayShadowDark}`,
  };
  const tierCls =
    tierStyles[tier] ??
    `border-blue-4/35 bg-blue-2/90 text-white hover:bg-blue-3/95 ${dayShadowDark}`;

  let ring = '';
  if (sel) {
    ring = 'z-10 !border-[3px] !border-white';
  } else if (today) {
    ring = 'ring-1 ring-white/35 ring-inset';
  }

  return [base, tierCls, ring, 'cursor-pointer'].filter(Boolean).join(' ');
}

function onDayClick(cell) {
  if (cell.type !== 'day') return;
  selectedDayKey.value = cell.dayKey;
}

function shiftMonth(delta) {
  monthNavViewportTop = monthNav.value?.getBoundingClientRect().top ?? null;
  const d = new Date(viewYear.value, viewMonth.value + delta, 1);
  viewYear.value = d.getFullYear();
  viewMonth.value = d.getMonth();
}

async function restoreMonthNavViewportPosition() {
  if (monthNavViewportTop == null || !monthNav.value) return;

  await nextTick();
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const currentTop = monthNav.value.getBoundingClientRect().top;
  const scrollCorrection = currentTop - monthNavViewportTop;
  if (Math.abs(scrollCorrection) > 0.5) {
    window.scrollBy({ top: scrollCorrection, left: 0, behavior: 'auto' });
  }
  monthNavViewportTop = null;
}

function syncSelectionToMonth() {
  const tk = todayKey();
  const [ty, tm] = tk.split('-').map(Number);
  if (ty === viewYear.value && tm - 1 === viewMonth.value) {
    selectedDayKey.value = tk;
    return;
  }
  selectedDayKey.value = null;
}

async function loadMonth() {
  error.value = '';
  loading.value = true;
  const token = localStorage.getItem('sessionToken');
  const { start, end } = monthStartEndDateStrings(viewYear.value, viewMonth.value);
  try {
    const rows = await fetchSleepData(token, start, end);
    rawEntries.value = Array.isArray(rows) ? rows : [];
    dayMap.value = buildDayEntryMap(rawEntries.value);
  } catch (e) {
    error.value = e.message || 'Could not load sleep data.';
    rawEntries.value = [];
    dayMap.value = new Map();
  } finally {
    loading.value = false;
    hasLoadedMonth.value = true;
  }
}

watch([viewYear, viewMonth], async () => {
  await loadMonth();
  syncSelectionToMonth();
  await restoreMonthNavViewportPosition();
});

onMounted(async () => {
  await loadMonth();
  syncSelectionToMonth();
});
</script>

