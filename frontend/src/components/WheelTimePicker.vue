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
          @pointerdown="onColDragStart('hour', $event)"
        >
          <div class="wheel-picker__col-viewport">
            <div class="wheel-picker__col-hinge">
              <div class="wheel-picker__col-track" :style="colTrackStyle('hour')">
            <template v-for="row in hourRows" :key="'h-' + row.delta">
              <div
                v-if="isBufferRow(row.delta)"
                class="wheel-picker__cell"
                :class="cellClass(row.delta)"
                role="presentation"
                aria-hidden="true"
              >
                <span class="wheel-picker__val">{{ row.label }}</span>
              </div>
              <button
                v-else
                type="button"
                class="wheel-picker__cell"
                :class="cellClass(row.delta)"
                :aria-selected="row.delta === 0"
                @click="onHourRowClick(row)"
              >
                <span class="wheel-picker__val">{{ row.label }}</span>
              </button>
            </template>
              </div>
            </div>
          </div>
        </div>

        <span class="wheel-picker__colon" aria-hidden="true">:</span>

        <div
          class="wheel-picker__col"
          data-col="minute"
          @wheel.prevent.stop="onWheelCol('minute', $event)"
          @pointerdown="onColDragStart('minute', $event)"
        >
          <div class="wheel-picker__col-viewport">
            <div class="wheel-picker__col-hinge">
              <div class="wheel-picker__col-track" :style="colTrackStyle('minute')">
            <template v-for="row in minuteRows" :key="'m-' + row.delta">
              <div
                v-if="isBufferRow(row.delta)"
                class="wheel-picker__cell"
                :class="cellClass(row.delta)"
                role="presentation"
                aria-hidden="true"
              >
                <span class="wheel-picker__val">{{ row.label }}</span>
              </div>
              <button
                v-else
                type="button"
                class="wheel-picker__cell"
                :class="cellClass(row.delta)"
                :aria-selected="row.delta === 0"
                @click="onMinuteRowClick(row)"
              >
                <span class="wheel-picker__val">{{ row.label }}</span>
              </button>
            </template>
              </div>
            </div>
          </div>
        </div>

        <div
          class="wheel-picker__col wheel-picker__col--meridiem"
          data-col="ampm"
          @wheel.prevent.stop="onWheelCol('ampm', $event)"
          @pointerdown="onColDragStart('ampm', $event)"
        >
          <div class="wheel-picker__col-viewport">
            <div class="wheel-picker__col-hinge">
              <div class="wheel-picker__col-track" :style="colTrackStyle('ampm')">
            <template v-for="row in ampmLayoutRows" :key="row.key">
              <div
                v-if="row.kind === 'spacer'"
                class="wheel-picker__meridiem-spacer"
                aria-hidden="true"
              />
              <button
                v-else
                type="button"
                class="wheel-picker__cell wheel-picker__cell--meridiem"
                :class="cellClass(row.delta)"
                :aria-selected="row.delta === 0"
                @click="onAmpmRowClick(row)"
              >
                <span class="wheel-picker__val">{{ row.label }}</span>
              </button>
            </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, reactive, nextTick } from 'vue';

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
/** Nudge the next @click on a value cell (after a press-drag) so the release doesn’t add an extra nudge. */
const suppressNextCellClick = ref(false);
/** Pixels of vertical move per nudge: matches wheel (down → +1) like a row. */
const DRAG_NUDGE_PX = 32;
const DRAG_TAP_PX = 6;
/** Must match `.wheel-picker__col-track` transition duration for slot-step animation. */
const SLOT_STEP_MS = 320;

let colDragUnbind = null;

/** Sub-threshold pointer offset (px) for smooth drag; springs to 0 on release. */
const colDragY = reactive({ hour: 0, minute: 0, ampm: 0 });
/** While set, the active column track has no transition so the stack follows the finger. */
const colDragActive = ref(null);

/** One-row height + gap (px), measured when opened; used for discrete step motion. */
const slotPx = ref(0);
/** Extra translate (px) so the incoming value slides in from the masked ±3 buffer zone. */
const colStepAnim = reactive({ hour: 0, minute: 0, ampm: 0 });
/** Disable transform transition for one frame when snapping back after a step. */
const colStepSnap = reactive({ hour: false, minute: false, ampm: false });
const colStepBusy = reactive({ hour: false, minute: false, ampm: false });
const colStepTimer = reactive({ hour: null, minute: null, ampm: null });
/** `apply` passed to the in-flight step (used if a second nudge arrives before the timeout). */
const colStepPendingApply = { hour: null, minute: null, ampm: null };

function clearColStepAnim(col) {
  const t = colStepTimer[col];
  if (t != null) {
    clearTimeout(t);
    colStepTimer[col] = null;
  }
  colStepAnim[col] = 0;
  colStepBusy[col] = false;
  colStepSnap[col] = false;
  colStepPendingApply[col] = null;
}

function clearAllColStepAnim() {
  clearColStepAnim('hour');
  clearColStepAnim('minute');
  clearColStepAnim('ampm');
}

function measureWheelSlotPx() {
  const root = rootRef.value;
  if (!root) return;
  const track = root.querySelector('[data-col="hour"] .wheel-picker__col-track');
  const cell = root.querySelector('[data-col="hour"] .wheel-picker__cell');
  if (!track || !cell) return;
  const g = parseFloat(getComputedStyle(track).gap || getComputedStyle(track).rowGap) || 0;
  slotPx.value = cell.getBoundingClientRect().height + g;
}

function colTrackStyle(col) {
  const y = colDragY[col] + colStepAnim[col];
  const followFinger = colDragActive.value === col;
  const snap = colStepSnap[col];
  return {
    transform: `translate3d(0, ${-y}px, 0)`,
    transition: followFinger || snap ? 'none' : 'transform 0.32s cubic-bezier(0.2, 0.85, 0.22, 1)',
  };
}

/**
 * Wheel / keyboard / click: slide one row so the new value enters from the clipped ±3 buffer.
 * Drag uses apply* directly so repeated nudges stay in sync with the finger.
 */
function runSlotStepAnim(col, dir, apply) {
  if (colDragActive.value === col) {
    apply();
    return;
  }
  const slot = slotPx.value;
  if (!slot || slot < 8) {
    apply();
    return;
  }
  if (colStepBusy[col]) {
    const pending = colStepPendingApply[col];
    if (colStepTimer[col] != null) {
      clearTimeout(colStepTimer[col]);
      colStepTimer[col] = null;
    }
    colStepAnim[col] = 0;
    colStepBusy[col] = false;
    colStepSnap[col] = false;
    colStepPendingApply[col] = null;
    pending?.();
    apply();
    return;
  }
  colStepBusy[col] = true;
  colStepPendingApply[col] = apply;
  colStepAnim[col] = 0;
  colStepSnap[col] = false;
  nextTick(() => {
    requestAnimationFrame(() => {
      colStepAnim[col] = dir * slot;
      colStepTimer[col] = window.setTimeout(() => {
        colStepTimer[col] = null;
        colStepPendingApply[col] = null;
        colStepSnap[col] = true;
        apply();
        colStepAnim[col] = 0;
        nextTick(() => {
          nextTick(() => {
            colStepSnap[col] = false;
            colStepBusy[col] = false;
          });
        });
      }, SLOT_STEP_MS);
    });
  });
}

function resetColDragVisual() {
  colDragActive.value = null;
  colDragY.hour = 0;
  colDragY.minute = 0;
  colDragY.ampm = 0;
}

function clampTotalMins(m) {
  const n = Math.round(Number(m) / STEP) * STEP;
  return ((n % (24 * 60)) + 24 * 60) % (24 * 60);
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

const HOUR_MINUTE_DELTAS = [-3, -2, -1, 0, 1, 2, 3];

const hourRows = computed(() => {
  const { h12 } = toParts(props.modelValue);
  const idx = h12 - 1;
  return HOUR_MINUTE_DELTAS.map((delta) => {
    const i = ((idx + delta) % 12 + 12) % 12;
    return { delta, label: String(i + 1) };
  });
});

const minuteRows = computed(() => {
  const { min } = toParts(props.modelValue);
  const idx = min / STEP;
  return HOUR_MINUTE_DELTAS.map((delta) => {
    const i = ((idx + delta) % 12 + 12) % 12;
    const m = i * STEP;
    return { delta, label: String(m).padStart(2, '0') };
  });
});

/**
 * Invisible spacers (same as hour/minute row height) + AM/PM in seven rows so the active value lines
 * up with the center highlight, matching the taller hour/minute stacks.
 */
const ampmLayoutRows = computed(() => {
  const { ampm } = toParts(props.modelValue);
  if (ampm === 0) {
    return [
      { kind: 'spacer', key: 'a-sp-0' },
      { kind: 'spacer', key: 'a-sp-1' },
      { kind: 'spacer', key: 'a-sp-2' },
      { kind: 'cell', delta: 0, label: 'AM', key: 'a-am' },
      { kind: 'cell', delta: 1, label: 'PM', key: 'a-pm' },
      { kind: 'spacer', key: 'a-sp-3' },
      { kind: 'spacer', key: 'a-sp-4' },
    ];
  }
  return [
    { kind: 'spacer', key: 'p-sp-0' },
    { kind: 'spacer', key: 'p-sp-1' },
    { kind: 'cell', delta: -1, label: 'AM', key: 'p-am' },
    { kind: 'cell', delta: 0, label: 'PM', key: 'p-pm' },
    { kind: 'spacer', key: 'p-sp-2' },
    { kind: 'spacer', key: 'p-sp-3' },
    { kind: 'spacer', key: 'p-sp-4' },
  ];
});

function isBufferRow(delta) {
  return Math.abs(delta) === 3;
}

function cellClass(delta) {
  if (isBufferRow(delta)) {
    return { 'wheel-picker__cell--buffer': true };
  }
  return {
    'wheel-picker__cell--center': delta === 0,
  };
}

function applyHourDelta(deltaSteps) {
  const { h12, min, ampm } = toParts(props.modelValue);
  let idx = h12 - 1;
  idx = ((idx + deltaSteps) % 12 + 12) % 12;
  setTotal(fromParts(idx + 1, min, ampm));
}

function applyMinuteDelta(deltaSteps) {
  const { h12, min, ampm } = toParts(props.modelValue);
  let idx = min / STEP;
  idx = ((idx + deltaSteps) % 12 + 12) % 12;
  setTotal(fromParts(h12, idx * STEP, ampm));
}

function applyAmpmDelta(deltaSteps) {
  if (deltaSteps === 0) return;
  const { h12, min, ampm } = toParts(props.modelValue);
  if (deltaSteps > 0) {
    if (ampm >= 1) return;
    setTotal(fromParts(h12, min, 1));
    return;
  }
  if (ampm <= 0) return;
  setTotal(fromParts(h12, min, 0));
}

function canNudgeAmpm(deltaSteps) {
  const { ampm } = toParts(props.modelValue);
  if (deltaSteps > 0) return ampm < 1;
  if (deltaSteps < 0) return ampm > 0;
  return false;
}

function nudgeHour(deltaSteps) {
  runSlotStepAnim('hour', deltaSteps, () => applyHourDelta(deltaSteps));
}

function nudgeMinute(deltaSteps) {
  runSlotStepAnim('minute', deltaSteps, () => applyMinuteDelta(deltaSteps));
}

function nudgeAmpm(deltaSteps) {
  if (!canNudgeAmpm(deltaSteps)) return;
  runSlotStepAnim('ampm', deltaSteps, () => applyAmpmDelta(deltaSteps));
}

function onWheelCol(col, e) {
  if (!props.expanded) return;
  focusCol.value = col;
  const dir = e.deltaY > 0 ? 1 : -1;
  if (col === 'hour') nudgeHour(dir);
  else if (col === 'minute') nudgeMinute(dir);
  else nudgeAmpm(dir);
}

function consumeCellClickSuppression() {
  if (suppressNextCellClick.value) {
    suppressNextCellClick.value = false;
    return true;
  }
  return false;
}

function onHourRowClick(row) {
  if (row.delta === 0 || Math.abs(row.delta) !== 1) return;
  if (consumeCellClickSuppression()) return;
  nudgeHour(row.delta);
}

function onMinuteRowClick(row) {
  if (row.delta === 0 || Math.abs(row.delta) !== 1) return;
  if (consumeCellClickSuppression()) return;
  nudgeMinute(row.delta);
}

function onAmpmRowClick(row) {
  if (row.delta === 0 || Math.abs(row.delta) !== 1) return;
  if (consumeCellClickSuppression()) return;
  nudgeAmpm(row.delta);
}

function nudgeColBy(col, dir) {
  if (col === 'hour') applyHourDelta(dir);
  else if (col === 'minute') applyMinuteDelta(dir);
  else applyAmpmDelta(dir);
}

function onColDragStart(col, e) {
  if (e.pointerType === 'touch') return;
  if (e.button !== 0 || !props.expanded) return;
  e.preventDefault();
  focusCol.value = col;
  const colEl = e.currentTarget;
  if (!(colEl instanceof Element)) return;
  const id = e.pointerId;
  colEl.setPointerCapture(id);

  colDragUnbind?.();
  resetColDragVisual();
  colDragActive.value = col;
  colDragY[col] = 0;
  let acc = 0;
  let lastY = e.clientY;
  let totalMove = 0;
  let nudgedByDrag = false;
  const th = DRAG_NUDGE_PX;
  const peOpts = { passive: false, capture: false };
  function onMove(e2) {
    if (e2.pointerId !== id) return;
    e2.preventDefault();
    const dy = e2.clientY - lastY;
    lastY = e2.clientY;
    totalMove += Math.abs(dy);
    // Invert from raw pointer delta: drag up → +1, drag down → -1 (matches wheel / “flick the wheel up”).
    acc -= dy;
    if (col === 'ampm') {
      const { ampm } = toParts(props.modelValue);
      if (ampm === 0) acc = Math.max(0, acc);
      else if (ampm === 1) acc = Math.min(0, acc);
    }
    while (acc >= th) {
      if (col === 'ampm' && !canNudgeAmpm(1)) break;
      nudgeColBy(col, 1);
      acc -= th;
      nudgedByDrag = true;
    }
    while (acc <= -th) {
      if (col === 'ampm' && !canNudgeAmpm(-1)) break;
      nudgeColBy(col, -1);
      acc += th;
      nudgedByDrag = true;
    }
    if (col === 'ampm') {
      const { ampm } = toParts(props.modelValue);
      if (ampm === 0) acc = Math.max(0, acc);
      else if (ampm === 1) acc = Math.min(0, acc);
    }
    colDragY[col] = acc;
  }
  function onEnd(e2) {
    if (e2.pointerId !== id) return;
    if (nudgedByDrag || totalMove > DRAG_TAP_PX) suppressNextCellClick.value = true;
    colDragY[col] = acc;
    colDragActive.value = null;
    nextTick(() => {
      colDragY[col] = 0;
    });
    colEl.removeEventListener('pointermove', onMove, peOpts);
    colEl.removeEventListener('pointerup', onEnd, peOpts);
    colEl.removeEventListener('pointercancel', onEnd, peOpts);
    if (colEl.hasPointerCapture?.(id)) colEl.releasePointerCapture(id);
    colDragUnbind = null;
  }
  colEl.addEventListener('pointermove', onMove, peOpts);
  colEl.addEventListener('pointerup', onEnd, peOpts);
  colEl.addEventListener('pointercancel', onEnd, peOpts);
  colDragUnbind = () => {
    colEl.removeEventListener('pointermove', onMove, peOpts);
    colEl.removeEventListener('pointerup', onEnd, peOpts);
    colEl.removeEventListener('pointercancel', onEnd, peOpts);
    if (colEl.hasPointerCapture?.(id)) colEl.releasePointerCapture(id);
  };
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
      colDragUnbind?.();
      colDragUnbind = null;
      resetColDragVisual();
      clearAllColStepAnim();
      suppressNextCellClick.value = false;
      pressedDirs.clear();
      clearRepeat();
      return;
    }
    focusCol.value = 'minute';
    nextTick(() => {
      requestAnimationFrame(() => {
        measureWheelSlotPx();
        rootRef.value?.focus({ preventScroll: true });
      });
    });
  }
);

onMounted(() => {
  document.addEventListener('keydown', onDocKeyDown);
  document.addEventListener('keyup', onDocKeyUp);
});

onBeforeUnmount(() => {
  colDragUnbind?.();
  colDragUnbind = null;
  resetColDragVisual();
  clearAllColStepAnim();
  document.removeEventListener('keydown', onDocKeyDown);
  document.removeEventListener('keyup', onDocKeyUp);
  pressedDirs.clear();
  clearRepeat();
});
</script>

<style scoped>
.wheel-picker {
  --wheel-slot: calc(2.05rem + 0.08rem);
  --wheel-viewport-h: calc(5 * 2.05rem + 4 * 0.08rem);
  position: relative;
  margin-top: 0.5rem;
  padding: 0.25rem 0;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}

.wheel-picker__frame {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  /* Viewport shows 5 rows; ±3 buffers sit in the clipped / masked zone above and below. */
  min-height: calc(var(--wheel-viewport-h) + 1.5rem);
  padding: 0.35rem 0.35rem;
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
  flex: 0 0 auto;
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
  padding: 0.1rem;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -webkit-touch-callout: none;
}

/* Clip to five rows; fade top/bottom so values read as emerging from the ±3 buffer layer. */
.wheel-picker__col-viewport {
  overflow: hidden;
  height: var(--wheel-viewport-h);
  width: 100%;
  flex-shrink: 0;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.92) 12%,
    black 22%,
    black 78%,
    rgba(0, 0, 0, 0.92) 88%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.92) 12%,
    black 22%,
    black 78%,
    rgba(0, 0, 0, 0.92) 88%,
    transparent 100%
  );
  mask-size: 100% 100%;
  -webkit-mask-size: 100% 100%;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
}

/* Shift stack up one slot so δ=-3 and δ=+3 sit just outside the viewport (hidden band). */
.wheel-picker__col-hinge {
  transform: translateY(calc(-1 * var(--wheel-slot)));
}

.wheel-picker__col-track {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 0.08rem;
  will-change: transform;
}

.wheel-picker__col--meridiem {
  flex: 0.85 1 0;
  min-width: 2.75rem;
}

.wheel-picker__colon {
  flex: 0 0 auto;
  align-self: center;
  padding: 0 0.05rem;
  font-size: 1.06rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-white);
  opacity: 1;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
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
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -webkit-touch-callout: none;
  font-size: 1.06rem;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  transform: none;
  color: var(--color-white);
  opacity: 1;
  will-change: color;
  z-index: 0;
  transition: color 0.35s cubic-bezier(0.33, 0, 0.2, 1);
}

.wheel-picker__cell:focus-visible {
  outline: none;
}

.wheel-picker__cell--buffer {
  pointer-events: none;
  cursor: default;
}

.wheel-picker__cell--center {
  z-index: 1;
  cursor: default;
  pointer-events: none;
}

.wheel-picker__val {
  display: inline-block;
  min-width: 1.15ch;
  text-align: center;
}

.wheel-picker__cell--meridiem {
  font-size: 1.06rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.wheel-picker__cell--meridiem.wheel-picker__cell--center {
  letter-spacing: 0.06em;
}

.wheel-picker__meridiem-spacer {
  width: 100%;
  min-height: 2.05rem;
  flex-shrink: 0;
  visibility: hidden;
  pointer-events: none;
  user-select: none;
}

.wheel-picker__col ::selection,
.wheel-picker__colon::selection,
.wheel-picker__cell::selection {
  background: transparent;
  color: inherit;
}
</style>
