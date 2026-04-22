<template>
  <section
    class="add-sleep w-full min-w-0 rounded-2xl border border-blue-4/30 bg-blue-1/50 p-6 shadow-[0_4px_30px_rgba(3,23,77,0.35)]"
  >
    <header class="mb-5 flex items-start justify-between gap-4">
      <h2 class="text-lg font-bold tracking-tight text-white">Add Sleep</h2>
      <button
        type="button"
        class="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-grey-1 transition hover:bg-blue-3/40 hover:text-white"
        @click="onCancel"
      >
        Cancel
      </button>
    </header>

    <div class="mb-5">
      <input
        id="add-sleep-date"
        v-model="sleepDate"
        type="date"
        aria-label="Sleep date"
        class="w-full max-w-[16rem] rounded-xl border border-blue-4/40 bg-blue-2/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-purple [color-scheme:dark]"
      />
    </div>

    <div class="sleep-window rounded-2xl border border-blue-4/35 bg-blue-2/35 p-4 sm:p-5">
      <div class="flex gap-0 sm:gap-1">
        <div class="min-w-0 flex-1">
          <button
            type="button"
            class="flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left transition"
            :class="
              bedPickerOpen
                ? 'bg-blue-3/45 ring-1 ring-purple/50'
                : 'bg-blue-2/25 hover:bg-blue-3/35'
            "
            aria-expanded="bedPickerOpen"
            @click="bedPickerOpen = !bedPickerOpen"
          >
            <span class="min-w-0 flex-1">
              <span class="block text-[0.65rem] font-semibold uppercase tracking-wide text-grey-1">
                Bedtime
              </span>
              <span
                class="mt-1 block text-xl font-semibold tabular-nums tracking-tight text-white sm:text-2xl"
              >
                {{ formatClock(bedMinutes) }}
              </span>
            </span>
            <svg
              class="mt-0.5 size-5 shrink-0 text-blue-4 transition-transform duration-200"
              :class="bedPickerOpen ? 'rotate-0' : '-rotate-180'"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <WheelTimePicker
            v-model="bedMinutes"
            :expanded="bedPickerOpen"
            aria-label="Bedtime"
          />
        </div>

        <div
          class="mx-2 w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-blue-4/45 to-transparent sm:mx-3"
          aria-hidden="true"
        />

        <div class="min-w-0 flex-1">
          <button
            type="button"
            class="flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left transition"
            :class="
              wakePickerOpen
                ? 'bg-blue-3/45 ring-1 ring-purple/50'
                : 'bg-blue-2/25 hover:bg-blue-3/35'
            "
            aria-expanded="wakePickerOpen"
            @click="wakePickerOpen = !wakePickerOpen"
          >
            <span class="min-w-0 flex-1">
              <span class="block text-[0.65rem] font-semibold uppercase tracking-wide text-grey-1">
                Wake time
              </span>
              <span
                class="mt-1 block text-xl font-semibold tabular-nums tracking-tight text-white sm:text-2xl"
              >
                {{ formatClock(wakeMinutes) }}
              </span>
            </span>
            <svg
              class="mt-0.5 size-5 shrink-0 text-blue-4 transition-transform duration-200"
              :class="wakePickerOpen ? 'rotate-0' : '-rotate-180'"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <WheelTimePicker
            v-model="wakeMinutes"
            :expanded="wakePickerOpen"
            aria-label="Wake time"
          />
        </div>
      </div>
    </div>

    <p v-if="formError" class="mt-4 text-sm text-[#fca5a5]">{{ formError }}</p>

    <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-grey-1">
        <span class="text-[0.65rem] font-semibold uppercase tracking-wide text-grey-1/85">Duration</span>
        <span class="ml-2 tabular-nums text-grey-2">{{ durationLabel }}</span>
      </p>
      <button
        type="button"
        :disabled="saving"
        class="rounded-xl bg-purple px-6 py-2.5 text-sm font-semibold text-blue-1 transition hover:bg-purple/90 disabled:opacity-50"
        @click="save"
      >
        {{ saving ? 'Saving…' : 'Save Sleep' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import WheelTimePicker from '@/components/WheelTimePicker.vue';
import { createManualSleep } from '@/services/sleep.service';

const emit = defineEmits(['saved']);

const STEP = 5;

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function clampStepMinutes(m) {
  const n = Math.round(Number(m) / STEP) * STEP;
  const wrapped = ((n % (24 * 60)) + 24 * 60) % (24 * 60);
  return wrapped;
}

const sleepDate = ref(todayYmd());
const bedMinutes = ref(clampStepMinutes(23 * 60));
const wakeMinutes = ref(clampStepMinutes(7 * 60));
const bedPickerOpen = ref(false);
const wakePickerOpen = ref(false);
const saving = ref(false);
const formError = ref('');

function onGlobalKeydown(e) {
  if (e.key !== 'Escape') return;
  if (!bedPickerOpen.value && !wakePickerOpen.value) return;
  e.preventDefault();
  bedPickerOpen.value = false;
  wakePickerOpen.value = false;
}

onMounted(() => document.addEventListener('keydown', onGlobalKeydown, true));
onBeforeUnmount(() => document.removeEventListener('keydown', onGlobalKeydown, true));

function formatClock(mins) {
  const t = clampStepMinutes(mins);
  const h24 = Math.floor(t / 60);
  const m = t % 60;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  const mm = String(m).padStart(2, '0');
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  return `${h12}:${mm} ${suffix}`;
}

function parseYmd(ymd) {
  const [y, mo, d] = ymd.split('-').map((x) => Number(x));
  if (!y || !mo || !d) return null;
  return { y, mo, d };
}

function combineLocal(y, mo, d, mins) {
  const dt = new Date(y, mo - 1, d, Math.floor(mins / 60), mins % 60, 0, 0);
  return dt;
}

const windowPair = computed(() => {
  const p = parseYmd(sleepDate.value);
  if (!p) return null;
  let bedDt = combineLocal(p.y, p.mo, p.d, bedMinutes.value);
  const wakeDt = combineLocal(p.y, p.mo, p.d, wakeMinutes.value);
  if (bedDt.getTime() >= wakeDt.getTime()) {
    bedDt = new Date(bedDt);
    bedDt.setDate(bedDt.getDate() - 1);
  }
  return { bedDt, wakeDt };
});

const durationLabel = computed(() => {
  const pair = windowPair.value;
  if (!pair) return '—';
  const diff = Math.round((pair.wakeDt - pair.bedDt) / 60000);
  if (diff <= 0) return '—';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
});

function onCancel() {
  bedPickerOpen.value = false;
  wakePickerOpen.value = false;
  formError.value = '';
  sleepDate.value = todayYmd();
  bedMinutes.value = clampStepMinutes(23 * 60);
  wakeMinutes.value = clampStepMinutes(7 * 60);
}

async function save() {
  formError.value = '';
  const p = parseYmd(sleepDate.value);
  if (!p) {
    formError.value = 'Choose a sleep date.';
    return;
  }
  const pair = windowPair.value;
  if (!pair) {
    formError.value = 'Choose a sleep date.';
    return;
  }
  const diffMin = Math.round((pair.wakeDt - pair.bedDt) / 60000);
  if (diffMin < 5) {
    formError.value = 'Wake time must be at least 5 minutes after bedtime.';
    return;
  }

  saving.value = true;
  const token = localStorage.getItem('sessionToken');
  try {
    await createManualSleep(token, {
      date: `${sleepDate.value}T12:00:00.000Z`,
      bedtime: pair.bedDt.toISOString(),
      wake_time: pair.wakeDt.toISOString(),
    });
    bedPickerOpen.value = false;
    wakePickerOpen.value = false;
    emit('saved');
  } catch (e) {
    formError.value = e.message || 'Could not save entry.';
  } finally {
    saving.value = false;
  }
}
</script>
