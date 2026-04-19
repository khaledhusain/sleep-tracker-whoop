<template>
  <div class="relative overflow-hidden">
    <div
      class="absolute pointer-events-none top-[-10%] left-[-10%] z-0 h-64 w-64 rounded-full bg-purple/25 blur-[100px]"
      aria-hidden="true"></div>
    <div
      class="absolute pointer-events-none bottom-[-10%] right-[-10%] z-0 h-64 w-64 rounded-full bg-blue-4/25 blur-[100px]"
      aria-hidden="true"></div>

    <div class="relative z-10 flex w-full max-w-4xl flex-col gap-8 mx-auto min-h-[12rem]">

      <header class="flex justify-between items-center mt-6 flex-wrap gap-4">
        <h1 class="text-3xl font-extrabold tracking-tight text-purple">Overview</h1>

        <div class="flex items-center gap-4">
          <button @click="handleSyncData" :disabled="isSyncing || isLoading || whoopStatusLoading || !whoopConnected"
            class="bg-purple hover:bg-purple/80 disabled:opacity-50 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <span v-if="isSyncing"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ isSyncing ? 'Syncing...' : 'Sync WHOOP' }}
          </button>

          <select v-model="selectedTimeframe"
            class="bg-blue-2/80 border border-blue-4/30 text-white text-sm rounded-lg p-2.5 outline-none focus:border-purple transition-colors cursor-pointer shadow-sm">
            <option value="night">Last night</option>
            <option value="week">Last week</option>
            <option value="month">Last month</option>
          </select>
        </div>
      </header>

      <p v-if="connectBanner" class="rounded-xl border border-purple/40 bg-purple/15 px-4 py-3 text-sm text-grey-2">
        {{ connectBanner }}
      </p>

      <section v-if="!whoopStatusLoading && !whoopConnected"
        class="rounded-2xl border border-blue-4/30 bg-blue-2/40 p-6 shadow-[0_4px_30px_rgba(3,23,77,0.35)]">
        <h2 class="text-lg font-bold text-white mb-2">Connect WHOOP</h2>
        <p class="text-grey-1 text-sm leading-relaxed mb-4 max-w-2xl">
          Link your WHOOP account.
        </p>
        <button type="button" @click="startWhoopConnect"
          class="bg-purple hover:bg-purple/90 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-sm">
          Connect WHOOP
        </button>
      </section>

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-blue-3 border-t-purple rounded-full animate-spin"></div>
        <p class="text-grey-1 mt-4 text-sm animate-pulse">Fetching sleep data...</p>
      </div>

      <div v-else class="flex flex-col gap-8">
        <section>
          <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 class="text-xl font-bold text-grey-2">Last night</h2>
            </div>
            <p v-if="lastFetchedAt" class="text-grey-1 text-xs tabular-nums">
              Loaded {{ lastFetchedAt }}
            </p>
          </div>

          <div v-if="lastNight"
            class="bg-blue-2/40 backdrop-blur-sm p-6 rounded-2xl border border-blue-4/20 shadow-[0_4px_30px_rgba(3,23,77,0.5)] transition-all hover:bg-blue-2/50">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-blue-4/20 pb-3">
              <p class="text-sm text-grey-2">
                <span class="text-grey-1">Night</span> · {{ formatLongDate(lastNight.date) || '—' }}
              </p>
              <span v-if="isNap(lastNight)"
                class="rounded-full border border-yellow/40 bg-yellow/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow">
                Nap
              </span>
            </div>
            <div class="flex flex-wrap justify-between items-center border-b border-blue-4/20 pb-5 mb-5 gap-4">
              <div>
                <p class="text-grey-1 text-xs uppercase tracking-wider mb-1 font-semibold">Sleep duration</p>
                <p class="text-3xl font-bold text-white">{{ formatDuration(lastNight.total_sleep_duration_minutes) }}
                </p>
                <p class="text-grey-1 mt-1 text-[10px] leading-snug">
                  WHOOP asleep time (light + deep + REM)—usually a bit shorter than bedtime → wake.
                </p>
              </div>
              <div class="text-right">
                <p class="text-grey-1 text-xs uppercase tracking-wider mb-1 font-semibold">Quality Score</p>
                <p class="text-3xl font-bold" :class="getScoreColor(lastNight.sleep_performance_score)">
                  {{ lastNight.sleep_performance_score || '--' }}%
                </p>
              </div>
            </div>

            <div v-if="hasSleepStages(lastNight)" class="mb-5">
              <div class="flex justify-between text-xs text-grey-1 mb-2">
                <span>Sleep stages (light + deep + REM)</span>
                <span>{{ formatDuration((lastNight.light_sleep_minutes || 0) + (lastNight.deep_sleep_minutes || 0) +
                  (lastNight.rem_sleep_minutes || 0)) }}</span>
              </div>
              <div class="h-3 w-full bg-blue-3 rounded-full flex overflow-hidden">
                <div class="bg-blue-4 transition-all duration-500"
                  :style="{ width: getStagePercentage(lastNight.light_sleep_minutes, lastNight) + '%' }"
                  title="Light Sleep"></div>
                <div class="bg-purple transition-all duration-500"
                  :style="{ width: getStagePercentage(lastNight.rem_sleep_minutes, lastNight) + '%' }"
                  title="REM Sleep"></div>
                <div class="bg-yellow transition-all duration-500"
                  :style="{ width: getStagePercentage(lastNight.deep_sleep_minutes, lastNight) + '%' }"
                  title="Deep Sleep"></div>
              </div>
              <div class="flex gap-4 mt-2 text-xs font-medium">
                <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-4"></span> <span
                    class="text-grey-1">Light</span></div>
                <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-purple"></span> <span
                    class="text-grey-1">REM</span></div>
                <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow"></span> <span
                    class="text-grey-1">Deep</span></div>
              </div>
            </div>

            <div class="flex justify-between text-sm text-grey-2 bg-blue-3/30 p-3 rounded-lg flex-wrap gap-2">
              <span class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                <strong>Bedtime:</strong> {{ formatTime(lastNight.bedtime) }}
              </span>
              <span class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M10 2a1 1 0 011 1v3a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-3a1 1 0 100 2h3zm-7 4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H1a1 1 0 100 2h3z"
                    clip-rule="evenodd" />
                </svg>
                <strong>Wake up:</strong> {{ formatTime(lastNight.wake_time) }}
              </span>
            </div>
          </div>

          <div v-else class="text-grey-1 text-sm text-center py-10 bg-blue-2/30 rounded-2xl border border-blue-4/20">
            No sleep data recorded for last night. Connect WHOOP or click Sync WHOOP (last 30 days).
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold text-grey-2 mb-4">Trends ({{ timeframeLabel }})</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div
              class="bg-blue-2/40 backdrop-blur-sm p-5 rounded-2xl border border-blue-4/20 flex flex-col items-center justify-center text-center hover:bg-blue-2/50 transition-colors">
              <p class="text-grey-1 text-[10px] sm:text-xs uppercase tracking-wider mb-2 font-semibold">Avg Duration</p>
              <p class="text-xl sm:text-2xl font-bold text-white">{{ formatDuration(stats.avgDuration) }}</p>
            </div>

            <div
              class="bg-blue-2/40 backdrop-blur-sm p-5 rounded-2xl border border-blue-4/20 flex flex-col items-center justify-center text-center hover:bg-blue-2/50 transition-colors">
              <p class="text-grey-1 text-[10px] sm:text-xs uppercase tracking-wider mb-2 font-semibold">Avg Quality</p>
              <p class="text-xl sm:text-2xl font-bold text-purple">{{ stats.avgQuality }}%</p>
            </div>

            <div
              class="bg-blue-2/40 backdrop-blur-sm p-5 rounded-2xl border border-blue-4/20 flex flex-col items-center justify-center text-center hover:bg-blue-2/50 transition-colors">
              <p class="text-grey-1 text-[10px] sm:text-xs uppercase tracking-wider mb-2 font-semibold">Efficiency</p>
              <p class="text-xl sm:text-2xl font-bold text-yellow">{{ stats.avgEfficiency }}%</p>
            </div>

            <div
              class="bg-blue-2/40 backdrop-blur-sm p-5 rounded-2xl border border-blue-4/20 flex flex-col items-center justify-center text-center hover:bg-blue-2/50 transition-colors">
              <p class="text-grey-1 text-[10px] sm:text-xs uppercase tracking-wider mb-2 font-semibold">Consistency</p>
              <p class="text-xl sm:text-2xl font-bold text-white">{{ stats.avgConsistency }}%</p>
            </div>

          </div>
        </section>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  fetchWhoopSleepHistory,
  syncWhoopData,
  fetchWhoopStatus,
  fetchWhoopConnectUrl
} from '../services/sleep.service';

const route = useRoute();
const router = useRouter();

const whoopConnected = ref(false);
const whoopStatusLoading = ref(true);
const connectBanner = ref('');

/** YYYY-MM-DD for a session row (local calendar day; avoids UTC shifting date-only strings). */
function sessionDayKey(session) {
  const d = session?.date;
  if (!d) return '';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) {
    return d.slice(0, 10);
  }
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return '';
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function ymdDaysAgo(days) {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() - days);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const day = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** SQLite / JSON may use 0, 1, "0", "1", or boolean—must not use !nap (breaks for string "0"). */
function isNap(session) {
  const n = session?.nap;
  return n === true || n === 1 || n === '1';
}

/**
 * Latest main sleep: non-naps only, highest wake_time.
 * Avoids picking today's nap when sorting only by calendar `date`.
 */
function pickLatestMainSleep(rows) {
  if (!rows.length) return null;
  const mains = rows.filter((s) => !isNap(s));
  const pool = mains.length ? mains : rows;
  return [...pool].sort((a, b) => {
    const wa = new Date(a.wake_time || a.bedtime || 0).getTime();
    const wb = new Date(b.wake_time || b.bedtime || 0).getTime();
    return wb - wa;
  })[0];
}

function formatLongDate(raw) {
  if (!raw) return '';
  const d = typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const allSleepData = ref([]);
const selectedTimeframe = ref('week');
const isLoading = ref(true);
const isSyncing = ref(false);
const lastFetchedAt = ref('');

const timeframeLabel = computed(() => {
  const map = { night: 'Last night', week: 'Last 7 days', month: 'Last 30 days' };
  return map[selectedTimeframe.value];
});

/** Latest main sleep from full history — not driven by the trends dropdown. */
const lastNight = computed(() => pickLatestMainSleep(allSleepData.value));

const trendSessions = computed(() => {
  const all = allSleepData.value;
  if (!all.length) return [];

  const tf = selectedTimeframe.value;
  if (tf === 'night') {
    const latest = pickLatestMainSleep(all);
    return latest ? [latest] : [];
  }

  const days = tf === 'week' ? 7 : 30;
  const cutoffStr = ymdDaysAgo(days);
  return all.filter((s) => sessionDayKey(s) >= cutoffStr && !isNap(s));
});

const stats = computed(() => {
  const data = trendSessions.value;
  if (!data.length) return { avgDuration: 0, avgQuality: 0, avgEfficiency: 0, avgConsistency: 0 };

  let durSum = 0;
  let durN = 0;
  let qualSum = 0;
  let qualN = 0;
  let effSum = 0;
  let effN = 0;
  let conSum = 0;
  let conN = 0;

  data.forEach((session) => {
    const m = session.total_sleep_duration_minutes;
    if (m != null && m > 0) {
      durSum += m;
      durN += 1;
    }
    if (session.sleep_performance_score != null) {
      qualSum += session.sleep_performance_score;
      qualN += 1;
    }
    if (session.sleep_efficiency != null) {
      effSum += session.sleep_efficiency;
      effN += 1;
    }
    if (session.sleep_consistency != null) {
      conSum += session.sleep_consistency;
      conN += 1;
    }
  });

  return {
    avgDuration: durN ? Math.floor(durSum / durN) : 0,
    avgQuality: qualN ? Math.floor(qualSum / qualN) : 0,
    avgEfficiency: effN ? Math.floor(effSum / effN) : 0,
    avgConsistency: conN ? Math.floor(conSum / conN) : 0,
  };
});

const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getScoreColor = (score) => {
  if (!score) return 'text-grey-2';
  if (score >= 85) return 'text-[#4ade80]';
  if (score >= 70) return 'text-yellow';
  return 'text-[#f87171]';
};

const hasSleepStages = (session) => {
  return session.light_sleep_minutes || session.deep_sleep_minutes || session.rem_sleep_minutes;
};

const getStagePercentage = (stageMinutes, session) => {
  if (!stageMinutes) return 0;
  const total = (session.light_sleep_minutes || 0) + (session.deep_sleep_minutes || 0) + (session.rem_sleep_minutes || 0);
  if (total === 0) return 0;
  return (stageMinutes / total) * 100;
};

const loadWhoopStatus = async () => {
  whoopStatusLoading.value = true;
  const token = localStorage.getItem('sessionToken');
  try {
    const { connected } = await fetchWhoopStatus(token);
    whoopConnected.value = !!connected;
  } catch (err) {
    console.error('WHOOP status:', err);
    whoopConnected.value = false;
  } finally {
    whoopStatusLoading.value = false;
  }
};

const loadData = async () => {
  isLoading.value = true;
  const token = localStorage.getItem('sessionToken');

  try {
    const rows = await fetchWhoopSleepHistory(token);
    allSleepData.value = Array.isArray(rows) ? [...rows] : [];
    lastFetchedAt.value = new Date().toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch (err) {
    console.error("Failed to load WHOOP data:", err);
    allSleepData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const startWhoopConnect = async () => {
  const token = localStorage.getItem('sessionToken');
  try {
    const { authUrl } = await fetchWhoopConnectUrl(token);
    window.location.href = authUrl;
  } catch (err) {
    console.error(err);
    alert('Could not start WHOOP connection. Make sure you are logged in and the server is running.');
  }
};

const handleSyncData = async () => {
  isSyncing.value = true;
  const token = localStorage.getItem('sessionToken');

  try {
    const syncResult = await syncWhoopData(token);
    console.log(`Synced ${syncResult.inserted} entries!`);

    await loadData();

  } catch (err) {
    console.error("Error syncing data:", err);
    alert("Failed to sync WHOOP data. Please check your connection or re-authenticate.");
  } finally {
    isSyncing.value = false;
  }
};

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    loadData();
  }
}

onMounted(async () => {
  document.addEventListener('visibilitychange', onVisibilityChange);
  await Promise.all([loadData(), loadWhoopStatus()]);

  if (route.query.whoop === 'connected') {
    if (route.query.sync_error === '1') {
      connectBanner.value =
        'WHOOP connected, but the automatic import failed. Press Sync WHOOP below to try again (last 30 days).';
    } else {
      const n = route.query.imported;
      connectBanner.value =
        n !== undefined && n !== ''
          ? `WHOOP connected. Imported ${n} sleep sessions from the last 30 days.`
          : 'WHOOP connected. Your last 30 days of sleep were imported.';
    }
    await loadWhoopStatus();
    await loadData();
  } else if (route.query.whoop === 'error') {
    connectBanner.value =
      'WHOOP connection did not finish. Please try again or check your WHOOP app credentials.';
  }

  if (route.query.whoop) {
    router.replace({ path: route.path, query: {} });
  }
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange);
});
</script>