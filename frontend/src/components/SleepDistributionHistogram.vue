<template>
  <article class="distribution-chart flex min-w-0 flex-col rounded-xl border border-blue-4/25 bg-blue-1/35 px-4 pb-0 pt-4">
    <div class="flex items-center gap-2">
      <span
        class="grid size-8 place-items-center rounded-lg border text-base"
        :style="{ color: accent, borderColor: `${accent}42`, backgroundColor: `${accent}14` }"
        aria-hidden="true"
      >
        {{ icon === 'moon' ? '☾' : icon === 'sun' ? '☀' : '◷' }}
      </span>
      <h3 class="text-sm font-bold text-white">{{ title }}</h3>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <p class="chart-eyebrow">{{ metricLabel }}</p>
        <p class="mt-1 text-xl font-extrabold tracking-tight" :style="{ color: accent }">
          {{ typicalValue }}
        </p>
      </div>
      <div>
        <p class="chart-eyebrow">{{ consistencyLabel }}</p>
        <p class="mt-1 text-xl font-extrabold tracking-tight text-grey-2">{{ consistency }}</p>
      </div>
    </div>

    <div v-if="buckets.length" class="chart-plot mt-auto" @mouseleave="hoveredKey = null">
      <svg
        class="block h-full w-full overflow-visible"
        :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        :aria-label="`${title} histogram`"
      >
        <defs>
          <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" :stop-color="accent" stop-opacity="1" />
            <stop offset="100%" :stop-color="accent" stop-opacity="0.48" />
          </linearGradient>
          <filter :id="glowId" x="-80%" y="-50%" width="260%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g aria-hidden="true">
          <line
            v-for="line in gridLines"
            :key="line.value"
            :x1="PLOT_LEFT"
            :x2="PLOT_RIGHT"
            :y1="line.y"
            :y2="line.y"
            stroke="rgba(109,117,176,0.18)"
            stroke-width="1"
            stroke-dasharray="4 5"
          />
          <line
            :x1="PLOT_LEFT"
            :x2="PLOT_RIGHT"
            :y1="PLOT_BOTTOM"
            :y2="PLOT_BOTTOM"
            stroke="rgba(109,117,176,0.38)"
            stroke-width="1"
          />
        </g>

        <g
          v-for="bar in chartBars"
          :key="bar.bucket.key"
          class="histogram-bar-group"
          :class="barClass(bar.bucket)"
          role="button"
          tabindex="0"
          :aria-label="`${bar.bucket.rangeLabel}: ${bar.bucket.count} sleeps, ${bar.bucket.percent}%`"
          :aria-pressed="bar.state === 'selected'"
          @mouseenter="hoveredKey = bar.bucket.key"
          @mouseleave="hoveredKey = null"
          @focus="hoveredKey = bar.bucket.key"
          @blur="hoveredKey = null"
          @click="$emit('select', bar.bucket)"
          @keydown.enter.prevent="$emit('select', bar.bucket)"
          @keydown.space.prevent="$emit('select', bar.bucket)"
        >
          <text
            :x="bar.centerX"
            :y="Math.max(17, bar.y - 9)"
            fill="#f5f5f5"
            font-size="11"
            font-weight="700"
            text-anchor="middle"
            class="percentage-label"
          >
            {{ bar.bucket.percent }}%
          </text>
          <rect
            :x="bar.x"
            :y="bar.y"
            :width="bar.width"
            :height="bar.height"
            :rx="bar.radius"
            :fill="`url(#${gradientId})`"
            :stroke="bar.state === 'selected' ? '#f5f5f5' : 'none'"
            :stroke-width="bar.state === 'selected' ? 2.5 : 0"
            :filter="bar.state === 'selected' || bar.state === 'related' ? `url(#${glowId})` : undefined"
            class="histogram-rect"
          />
          <text
            :x="bar.centerX"
            :y="LABEL_Y"
            fill="#c5c6d0"
            font-size="10"
            font-weight="600"
            text-anchor="middle"
            class="time-label"
          >
            {{ bar.bucket.shortLabel }}
          </text>
        </g>
      </svg>

    </div>

    <div
      v-else
      class="mt-3 grid h-56 place-items-center rounded-lg border border-blue-4/15 text-xs text-grey-1"
    >
      No timing data
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue';

defineEmits(['select']);

const props = defineProps({
  kind: String,
  title: String,
  icon: String,
  accent: String,
  buckets: { type: Array, default: () => [] },
  typicalValue: String,
  consistency: String,
  metricLabel: { type: String, default: 'Typical Time' },
  consistencyLabel: { type: String, default: 'Consistency' },
  selectedKind: String,
  selectedKey: String,
  relatedSessionIds: { type: Object, default: () => new Set() },
});

const CHART_WIDTH = 500;
const CHART_HEIGHT = 300;
const PLOT_LEFT = 12;
const PLOT_RIGHT = 488;
const PLOT_TOP = 36;
const PLOT_BOTTOM = 246;
const LABEL_Y = 278;
const MIN_BAR_HEIGHT = 4;

const hoveredKey = ref(null);
const gradientId = computed(() => `sleep-pattern-gradient-${props.kind}`);
const glowId = computed(() => `sleep-pattern-glow-${props.kind}`);

const scaleMax = computed(() => {
  const maximum = Math.max(1, ...props.buckets.map((bucket) => bucket.percent));
  return Math.max(10, Math.ceil(maximum / 10) * 10);
});

function bucketState(bucket) {
  if (!props.selectedKind) return 'default';
  if (props.selectedKind === props.kind) {
    return props.selectedKey === bucket.key ? 'selected' : 'dimmed';
  }
  return [...bucket.sessionIds].some((id) => props.relatedSessionIds.has(id))
    ? 'related'
    : 'dimmed';
}

const chartBars = computed(() => {
  const slotWidth = (PLOT_RIGHT - PLOT_LEFT) / Math.max(1, props.buckets.length);
  const barWidth = Math.min(42, Math.max(12, slotWidth * 0.62));

  return props.buckets.map((bucket, index) => {
    const rawHeight = (bucket.percent / scaleMax.value) * (PLOT_BOTTOM - PLOT_TOP);
    const height = Math.max(MIN_BAR_HEIGHT, rawHeight);
    const centerX = PLOT_LEFT + slotWidth * index + slotWidth / 2;
    return {
      bucket,
      state: bucketState(bucket),
      centerX,
      width: barWidth,
      radius: Math.min(12, barWidth * 0.28),
      x: centerX - barWidth / 2,
      y: PLOT_BOTTOM - height,
      height,
      index,
    };
  });
});

const gridLines = computed(() =>
  [0.5, 1].map((ratio) => ({
    value: scaleMax.value * ratio,
    y: PLOT_BOTTOM - ratio * (PLOT_BOTTOM - PLOT_TOP),
  }))
);

function barClass(bucket) {
  const state = bucketState(bucket);
  return {
    'is-selected': state === 'selected',
    'is-related': state === 'related',
    'is-dimmed': state === 'dimmed',
    'is-hovered': hoveredKey.value === bucket.key,
    'has-hover': hoveredKey.value && hoveredKey.value !== bucket.key,
  };
}

</script>

<style scoped>
.distribution-chart {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.chart-eyebrow {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #c5c6d0;
}

.chart-plot {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 3;
  min-width: 0;
}

.histogram-bar-group {
  cursor: pointer;
  outline: none;
  transition: opacity 160ms ease, filter 160ms ease;
}

.histogram-rect {
  transform-box: fill-box;
  transform-origin: center bottom;
  transition: filter 160ms ease, opacity 160ms ease, transform 160ms ease, stroke-width 160ms ease;
}

.histogram-bar-group.is-hovered .histogram-rect {
  filter: brightness(1.3) saturate(1.15);
  transform: scaleX(1.08);
}

.histogram-bar-group.has-hover,
.histogram-bar-group.is-dimmed {
  opacity: 0.24;
  filter: saturate(0.55);
}

.histogram-bar-group.is-selected,
.histogram-bar-group.is-related {
  opacity: 1;
  filter: brightness(1.15);
}

.histogram-bar-group:focus-visible .histogram-rect {
  stroke: #f5f5f5;
  stroke-width: 3;
}

.percentage-label,
.time-label {
  pointer-events: none;
}

@media (max-width: 480px) {
  .distribution-chart {
    padding: 0.875rem 0.875rem 0.4rem;
  }

  .chart-plot {
    aspect-ratio: 5 / 3;
  }

}
</style>
