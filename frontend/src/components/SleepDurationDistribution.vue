<template>
  <article class="duration-distribution min-w-0 rounded-xl border border-blue-4/25 bg-blue-1/35 px-4 pb-2 pt-4">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex items-center gap-2">
        <span
          class="grid size-8 place-items-center rounded-lg border text-base"
          :style="{ color: accent, borderColor: `${accent}42`, backgroundColor: `${accent}14` }"
          aria-hidden="true"
        >
          ◷
        </span>
        <h3 class="text-sm font-bold text-white">Sleep Duration Distribution</h3>
      </div>

      <div class="flex gap-6">
        <div>
          <p class="chart-eyebrow">Typical Duration</p>
          <p class="mt-1 text-lg font-extrabold tracking-tight" :style="{ color: accent }">
            {{ typicalValue }}
          </p>
        </div>
        <div>
          <p class="chart-eyebrow">Variation</p>
          <p class="mt-1 text-lg font-extrabold tracking-tight text-grey-2">
            {{ consistency }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="buckets.length"
      class="mt-3 space-y-1"
      @mouseleave="hoveredKey = null"
    >
      <button
        v-for="bucket in buckets"
        :key="bucket.key"
        type="button"
        class="duration-row"
        :class="rowClass(bucket)"
        :aria-label="`${bucket.rangeLabel}: ${bucket.count} sleeps, ${bucket.percent}%`"
        :aria-pressed="bucketState(bucket) === 'selected'"
        @focus="hoveredKey = bucket.key"
        @blur="hoveredKey = null"
        @click="$emit('select', bucket)"
      >
        <span class="duration-label">{{ bucket.shortLabel }}</span>

        <span class="duration-track">
          <span
            class="duration-fill"
            :style="{
              width: `${barWidth(bucket)}%`,
              '--duration-accent': accent,
            }"
            @mouseenter="hoveredKey = bucket.key"
            @mouseleave="hoveredKey = null"
          />
        </span>

        <span class="duration-percent">{{ bucket.percent }}%</span>

      </button>
    </div>

    <div
      v-else
      class="mt-3 grid h-40 place-items-center rounded-lg border border-blue-4/15 text-xs text-grey-1"
    >
      No duration data
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue';

defineEmits(['select']);

const props = defineProps({
  buckets: { type: Array, default: () => [] },
  accent: { type: String, default: '#34d399' },
  typicalValue: String,
  consistency: String,
  selectedKind: String,
  selectedKey: String,
  relatedSessionIds: { type: Object, default: () => new Set() },
});

const hoveredKey = ref(null);
const scaleMax = computed(() =>
  Math.max(10, Math.ceil(Math.max(1, ...props.buckets.map((bucket) => bucket.percent)) / 10) * 10)
);

function bucketState(bucket) {
  if (!props.selectedKind) return 'default';
  if (props.selectedKind === 'duration') {
    return props.selectedKey === bucket.key ? 'selected' : 'dimmed';
  }
  return [...bucket.sessionIds].some((id) => props.relatedSessionIds.has(id))
    ? 'related'
    : 'dimmed';
}

function rowClass(bucket) {
  const state = bucketState(bucket);
  return {
    'is-selected': state === 'selected',
    'is-related': state === 'related',
    'is-dimmed': state === 'dimmed',
    'is-hovered': hoveredKey.value === bucket.key,
    'has-hover': hoveredKey.value && hoveredKey.value !== bucket.key,
  };
}

function barWidth(bucket) {
  return Math.max(2, (bucket.percent / scaleMax.value) * 100);
}

</script>

<style scoped>
.duration-distribution {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.chart-eyebrow {
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #c5c6d0;
}

.duration-row {
  position: relative;
  display: grid;
  grid-template-columns: 3.75rem minmax(0, 1fr) 2.75rem;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 2.2rem;
  border-radius: 0.6rem;
  padding: 0.2rem 0.45rem;
  text-align: left;
  outline: none;
  transition: opacity 160ms ease, filter 160ms ease, background-color 160ms ease;
}

.duration-row:focus-visible {
  background: rgba(43, 49, 102, 0.34);
}

.duration-label,
.duration-percent {
  color: #d3d4de;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
}

.duration-percent {
  text-align: right;
}

.duration-track {
  display: block;
  height: 1rem;
  overflow: visible;
}

.duration-fill {
  display: block;
  height: 100%;
  border-radius: 0.35rem;
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--duration-accent) 42%, #03174d),
      var(--duration-accent)
    );
  box-shadow: 0 0 10px color-mix(in srgb, var(--duration-accent) 14%, transparent);
  transform-origin: left center;
  transition: width 220ms ease, filter 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.duration-row.is-hovered .duration-fill {
  filter: brightness(1.25) saturate(1.12);
  transform: scaleY(1.08);
  box-shadow: 0 0 14px color-mix(in srgb, var(--duration-accent) 28%, transparent);
}

.duration-row.has-hover,
.duration-row.is-dimmed {
  opacity: 0.25;
  filter: saturate(0.55);
}

.duration-row.is-selected,
.duration-row.is-related {
  opacity: 1;
  filter: brightness(1.12);
}

.duration-row.is-selected {
  background: rgba(52, 211, 153, 0.08);
}

.duration-row.is-selected .duration-fill,
.duration-row.is-related .duration-fill {
  box-shadow: 0 0 16px color-mix(in srgb, var(--duration-accent) 34%, transparent);
}

.duration-row.is-selected .duration-fill {
  outline: 2px solid rgba(245, 245, 245, 0.82);
  outline-offset: 0;
}

@media (max-width: 480px) {
  .duration-distribution {
    padding: 0.875rem 0.875rem 0.5rem;
  }

  .duration-row {
    grid-template-columns: 3.25rem minmax(0, 1fr) 2.5rem;
    gap: 0.5rem;
  }

}
</style>
