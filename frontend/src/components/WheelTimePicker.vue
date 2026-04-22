<template>
  <div
    v-show="expanded"
    ref="rootRef"
    tabindex="-1"
    class="wheel-picker outline-none"
    @pointerdown="onPickerPointerDown"
  >
    <div class="wheel-picker__frame">
      <div class="wheel-picker__highlight" aria-hidden="true" />
      <div class="wheel-picker__cols" role="group" :aria-label="ariaLabel">
        <div
          class="wheel-picker__col"
          data-col="hour"
          @wheel.prevent.stop="onWheelCol('hour', $event)"
        >
          <button
            v-for="row in hourRows"
            :key="'h-' + row.delta"
            type="button"
            class="wheel-picker__cell"
            :class="cellClass(row.delta)"
            :aria-selected="row.delta === 0"
            @click="row.delta !== 0 && nudgeHour(row.delta)"
          >
            {{ row.label }}
          </button>
        </div>

        <span class="wheel-picker__colon" aria-hidden="true">:</span>

        <div
          class="wheel-picker__col"
          data-col="minute"
          @wheel.prevent.stop="onWheelCol('minute', $event)"
        >
          <button
            v-for="row in minuteRows"
            :key="'m-' + row.delta"
            type="button"
            class="wheel-picker__cell"
            :class="cellClass(row.delta)"
            :aria-selected="row.delta === 0"
            @click="row.delta !== 0 && nudgeMinute(row.delta)"
          >
            {{ row.label }}
          </button>
        </div>

        <div
          class="wheel-picker__col wheel-picker__col--meridiem"
          data-col="ampm"
          @wheel.prevent.stop="onWheelCol('ampm', $event)"
        >
          <button
            v-for="row in ampmRows"
            :key="'a-' + row.delta"
            type="button"
            class="wheel-picker__cell wheel-picker__cell--meridiem"
            :class="cellClass(row.delta)"
            :aria-selected="row.delta === 0"
            @click="row.delta !== 0 && nudgeAmpm(row.delta)"
          >
            {{ row.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const STEP = 5;
const REPEAT_DELAY_MS = 420;
const REPEAT_STEP_MS = 68;

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
    validator: (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 && n < 24 * 60 && Math.round(n) % STEP === 0;
    },
  },
  expanded: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Time' },
});

const emit = defineEmits(['update:modelValue']);

const rootRef = ref(null);
/** Which column arrow keys adjust: hour, minute, or am/pm */
const focusCol = ref('minute');

function clampTotalMins(m) {
  const n = Math.round(Number(m) / STEP) * STEP;
  return ((n % (24 * 60)) + 24 * 60) % (24 * 60);
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function toParts(totalMins) {
  const t = clampTotalMins(totalMins);
  const h24 = Math.floor(t / 60);
  const min = t % 60;
  const ampm = h24 >= 12 ? 1 : 0;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { h12, min, ampm };
}

function fromParts(h12, min, ampm) {
  let h24;
  if (ampm === 0) {
    h24 = h12 === 12 ? 0 : h12;
  } else {
    h24 = h12 === 12 ? 12 : h12 + 12;
  }
  return clampTotalMins(h24 * 60 + min);
}

function setTotal(mins) {
  emit('update:modelValue', clampTotalMins(mins));
}

const hourRows = computed(() => {
  const { h12 } = toParts(props.modelValue);
  const idx = h12 - 1;
  return [-2, -1, 0, 1, 2].map((delta) => {
    const i = ((idx + delta) % 12 + 12) % 12;
    return { delta, label: String(i + 1) };
  });
});

const minuteRows = computed(() => {
  const { min } = toParts(props.modelValue);
  const idx = min / STEP;
  return [-2, -1, 0, 1, 2].map((delta) => {
    const i = ((idx + delta) % 12 + 12) % 12;
    const m = i * STEP;
    return { delta, label: String(m).padStart(2, '0') };
  });
});

const ampmRows = computed(() => {
  const { ampm } = toParts(props.modelValue);
  return [-2, -1, 0, 1, 2].map((delta) => {
    const v = mod(ampm + delta, 2);
    return { delta, label: v === 0 ? 'AM' : 'PM' };
  });
});

function cellClass(delta) {
  const a = Math.abs(delta);
  return {
    'wheel-picker__cell--center': delta === 0,
    'wheel-picker__cell--near': a === 1,
    'wheel-picker__cell--far': a === 2,
  };
}

function nudgeHour(deltaSteps) {
  const { h12, min, ampm } = toParts(props.modelValue);
  let idx = h12 - 1;
  idx = ((idx + deltaSteps) % 12 + 12) % 12;
  setTotal(fromParts(idx + 1, min, ampm));
}

function nudgeMinute(deltaSteps) {
  const { h12, min, ampm } = toParts(props.modelValue);
  let idx = min / STEP;
  idx = ((idx + deltaSteps) % 12 + 12) % 12;
  setTotal(fromParts(h12, idx * STEP, ampm));
}

function nudgeAmpm(deltaSteps) {
  const { h12, min, ampm } = toParts(props.modelValue);
  setTotal(fromParts(h12, min, mod(ampm + deltaSteps, 2)));
}

function onWheelCol(col, e) {
  if (!props.expanded) return;
  focusCol.value = col;
  const dir = e.deltaY > 0 ? 1 : -1;
  if (col === 'hour') nudgeHour(dir);
  else if (col === 'minute') nudgeMinute(dir);
  else nudgeAmpm(dir);
}

function isThisWheelFocused() {
  const root = rootRef.value;
  if (!root) return false;
  const ae = document.activeElement;
  return ae === root || Boolean(root.contains(ae));
}

function onPickerPointerDown(e) {
  if (!props.expanded) return;
  rootRef.value?.focus({ preventScroll: true });
  const el = e.target.closest?.('[data-col]');
  const c = el?.getAttribute?.('data-col');
  if (c === 'hour' || c === 'minute' || c === 'ampm') focusCol.value = c;
}

function nudgeFocused(dir) {
  const c = focusCol.value;
  if (c === 'hour') nudgeHour(dir);
  else if (c === 'minute') nudgeMinute(dir);
  else nudgeAmpm(dir);
}

let repeatTimeout = null;
let repeatInterval = null;
const pressedDirs = new Map();

function clearRepeat() {
  if (repeatTimeout != null) {
    clearTimeout(repeatTimeout);
    repeatTimeout = null;
  }
  if (repeatInterval != null) {
    clearInterval(repeatInterval);
    repeatInterval = null;
  }
}

function tickHeldKeys() {
  let net = 0;
  for (const d of pressedDirs.values()) net += d;
  if (net === 0) return;
  nudgeFocused(net > 0 ? 1 : -1);
}

function ensureHoldRepeat() {
  if (repeatTimeout != null || repeatInterval != null) return;
  repeatTimeout = setTimeout(() => {
    repeatTimeout = null;
    repeatInterval = setInterval(tickHeldKeys, REPEAT_STEP_MS);
  }, REPEAT_DELAY_MS);
}

function keyToDir(key) {
  if (key === 'ArrowUp' || key === 'w' || key === 'W') return -1;
  if (key === 'ArrowDown' || key === 's' || key === 'S') return 1;
  return 0;
}

function onDocKeyDown(e) {
  if (!props.expanded) return;
  if (!isThisWheelFocused()) return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

  const dir = keyToDir(e.key);
  if (!dir) return;

  e.preventDefault();
  const k = e.key;
  if (pressedDirs.has(k)) return;
  pressedDirs.set(k, dir);
  nudgeFocused(dir);
  ensureHoldRepeat();
}

function onDocKeyUp(e) {
  const k = e.key;
  if (!pressedDirs.has(k)) return;
  pressedDirs.delete(k);
  if (pressedDirs.size === 0) clearRepeat();
}

watch(
  () => props.expanded,
  (open) => {
    if (!open) {
      pressedDirs.clear();
      clearRepeat();
      return;
    }
    focusCol.value = 'minute';
    requestAnimationFrame(() => {
      rootRef.value?.focus({ preventScroll: true });
    });
  }
);

onMounted(() => {
  document.addEventListener('keydown', onDocKeyDown);
  document.addEventListener('keyup', onDocKeyUp);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onDocKeyDown);
  document.removeEventListener('keyup', onDocKeyUp);
  pressedDirs.clear();
  clearRepeat();
});
</script>

<style scoped>
.wheel-picker {
  position: relative;
  margin-top: 0.5rem;
  padding: 0.15rem 0 0.35rem;
}

.wheel-picker__frame {
  position: relative;
  padding: 0.2rem 0.35rem 0.45rem;
}

.wheel-picker__highlight {
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  top: 50%;
  height: 2.45rem;
  transform: translateY(-50%);
  border-radius: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--color-blue-4) 55%, transparent);
  background: color-mix(in srgb, var(--color-blue-2) 55%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, white 8%, transparent);
  pointer-events: none;
  z-index: 0;
}

.wheel-picker__cols {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  gap: 0.15rem;
}

.wheel-picker__col {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08rem;
  padding: 0.1rem;
}

.wheel-picker__col--meridiem {
  flex: 0.85 1 0;
  min-width: 2.75rem;
}

.wheel-picker__colon {
  flex: 0 0 auto;
  align-self: center;
  padding: 0 0.05rem;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1;
  color: color-mix(in srgb, var(--color-grey-2) 90%, white);
  user-select: none;
  margin-top: 0.15rem;
}

.wheel-picker__cell {
  appearance: none;
  border: none;
  background: transparent;
  font-family: inherit;
  width: 100%;
  min-height: 2.05rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 0.5rem;
  padding: 0.15rem 0.25rem;
  transition:
    color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.wheel-picker__cell:focus-visible {
  outline: none;
}

.wheel-picker__cell--far {
  font-size: 0.78rem;
  font-weight: 500;
  color: color-mix(in srgb, var(--color-grey-1) 42%, transparent);
  opacity: 0.52;
  transform: scale(0.94);
}

.wheel-picker__cell--near {
  font-size: 0.92rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--color-grey-2) 65%, var(--color-grey-1));
  opacity: 0.76;
  transform: scale(0.97);
}

.wheel-picker__cell--center {
  font-size: 1.18rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  font-variant-numeric: tabular-nums;
  color: var(--color-white);
  opacity: 1;
  transform: scale(1);
  cursor: default;
  pointer-events: none;
}

.wheel-picker__cell--meridiem.wheel-picker__cell--center {
  letter-spacing: 0.06em;
}

.wheel-picker__cell--meridiem.wheel-picker__cell--far,
.wheel-picker__cell--meridiem.wheel-picker__cell--near {
  font-size: 0.72rem;
  letter-spacing: 0.05em;
}
</style>
