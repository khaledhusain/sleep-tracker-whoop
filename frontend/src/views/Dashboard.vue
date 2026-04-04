<template>
  <div class="min-h-screen bg-blue-1 text-white relative overflow-hidden flex flex-col font-Montserrat p-6">
    <div class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple rounded-full mix-blend-screen filter blur-[100px] opacity-20 fixed pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-4 rounded-full mix-blend-screen filter blur-[100px] opacity-20 fixed pointer-events-none"></div>

    <div class="z-10 w-full max-w-4xl mx-auto flex flex-col gap-8">
      
      <header class="flex justify-between items-center mt-6">
        <h1 class="text-3xl font-extrabold tracking-tight text-purple">Overview</h1>
        <select v-model="selectedTimeframe" class="bg-blue-2/80 border border-blue-4/30 text-white text-sm rounded-lg p-2.5 outline-none focus:border-purple transition-colors cursor-pointer shadow-sm">
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="year">Past Year</option>
        </select>
      </header>

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-blue-3 border-t-purple rounded-full animate-spin"></div>
        <p class="text-grey-1 mt-4 text-sm animate-pulse">Fetching sleep data...</p>
      </div>

      <div v-else class="flex flex-col gap-8">
        <section>
          <h2 class="text-xl font-bold text-grey-2 mb-4">Last Night</h2>
          
          <div v-if="lastNight" class="bg-blue-2/40 backdrop-blur-sm p-6 rounded-2xl border border-blue-4/20 shadow-[0_4px_30px_rgba(3,23,77,0.5)] transition-all hover:bg-blue-2/50">
            <div class="flex flex-wrap justify-between items-center border-b border-blue-4/20 pb-5 mb-5 gap-4">
              <div>
                <p class="text-grey-1 text-xs uppercase tracking-wider mb-1 font-semibold">Duration</p>
                <p class="text-3xl font-bold text-white">{{ formatDuration(lastNight.total_sleep_duration_minutes) }}</p>
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
                <span>Sleep Stages</span>
                <span>{{ formatDuration(lastNight.light_sleep_minutes + lastNight.deep_sleep_minutes + lastNight.rem_sleep_minutes) }} Recorded</span>
              </div>
              <div class="h-3 w-full bg-blue-3 rounded-full flex overflow-hidden">
                <div class="bg-blue-4 transition-all duration-500" :style="{ width: getStagePercentage(lastNight.light_sleep_minutes, lastNight) + '%' }" title="Light Sleep"></div>
                <div class="bg-purple transition-all duration-500" :style="{ width: getStagePercentage(lastNight.rem_sleep_minutes, lastNight) + '%' }" title="REM Sleep"></div>
                <div class="bg-yellow transition-all duration-500" :style="{ width: getStagePercentage(lastNight.deep_sleep_minutes, lastNight) + '%' }" title="Deep Sleep"></div>
              </div>
              <div class="flex gap-4 mt-2 text-xs font-medium">
                <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-4"></span> <span class="text-grey-1">Light</span></div>
                <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-purple"></span> <span class="text-grey-1">REM</span></div>
                <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow"></span> <span class="text-grey-1">Deep</span></div>
              </div>
            </div>

            <div class="flex justify-between text-sm text-grey-2 bg-blue-3/30 p-3 rounded-lg">
              <span class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                <strong>Bedtime:</strong> {{ formatTime(lastNight.bedtime) }}
              </span>
              <span class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v3a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-3a1 1 0 100 2h3zm-7 4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H1a1 1 0 100 2h3z" clip-rule="evenodd" /></svg>
                <strong>Wake up:</strong> {{ formatTime(lastNight.wake_time) }}
              </span>
            </div>
          </div>
          
          <div v-else class="text-grey-1 text-sm text-center py-10 bg-blue-2/30 rounded-2xl border border-blue-4/20">
            No sleep data recorded for last night. Make sure your device is synced.
          </div>
        </section>

        <section>
          <h2 class="text-xl font-bold text-grey-2 mb-4">Trends ({{ timeframeLabel }})</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div class="bg-blue-2/40 backdrop-blur-sm p-5 rounded-2xl border border-blue-4/20 flex flex-col items-center justify-center text-center hover:bg-blue-2/50 transition-colors">
              <p class="text-grey-1 text-[10px] sm:text-xs uppercase tracking-wider mb-2 font-semibold">Avg Duration</p>
              <p class="text-xl sm:text-2xl font-bold text-white">{{ formatDuration(stats.avgDuration) }}</p>
            </div>

            <div class="bg-blue-2/40 backdrop-blur-sm p-5 rounded-2xl border border-blue-4/20 flex flex-col items-center justify-center text-center hover:bg-blue-2/50 transition-colors">
              <p class="text-grey-1 text-[10px] sm:text-xs uppercase tracking-wider mb-2 font-semibold">Avg Quality</p>
              <p class="text-xl sm:text-2xl font-bold text-purple">{{ stats.avgQuality }}%</p>
            </div>

            <div class="bg-blue-2/40 backdrop-blur-sm p-5 rounded-2xl border border-blue-4/20 flex flex-col items-center justify-center text-center hover:bg-blue-2/50 transition-colors">
              <p class="text-grey-1 text-[10px] sm:text-xs uppercase tracking-wider mb-2 font-semibold">Efficiency</p>
              <p class="text-xl sm:text-2xl font-bold text-yellow">{{ stats.avgEfficiency }}%</p>
            </div>

            <div class="bg-blue-2/40 backdrop-blur-sm p-5 rounded-2xl border border-blue-4/20 flex flex-col items-center justify-center text-center hover:bg-blue-2/50 transition-colors">
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
import { ref, computed, onMounted, watch } from 'vue';
import { fetchWhoopSleepHistory } from '../services/sleep.service';

const sleepData = ref([]);
const selectedTimeframe = ref('week');
const isLoading = ref(true);

const timeframeLabel = computed(() => {
  const map = { week: 'Past 7 Days', month: 'Past 30 Days', year: 'Past Year' };
  return map[selectedTimeframe.value];
});

const lastNight = computed(() => {
  if (!sleepData.value.length) return null;
  return [...sleepData.value].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
});

const stats = computed(() => {
  const data = sleepData.value;
  if (!data.length) return { avgDuration: 0, avgQuality: 0, avgEfficiency: 0, avgConsistency: 0 };

  let totalDuration = 0;
  let totalQuality = 0;
  let totalEfficiency = 0;
  let totalConsistency = 0;

  data.forEach(session => {
    totalDuration += session.total_sleep_duration_minutes || 0;
    totalQuality += session.sleep_performance_score || 0;
    totalEfficiency += session.sleep_efficiency || 0;
    totalConsistency += session.sleep_consistency || 0;
  });

  const count = data.length;

  return {
    avgDuration: Math.floor(totalDuration / count),
    avgQuality: Math.floor(totalQuality / count),
    avgEfficiency: Math.floor(totalEfficiency / count),
    avgConsistency: Math.floor(totalConsistency / count),
  };
});

// Formatting Utilities
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
  if (score >= 85) return 'text-[#4ade80]'; // A subtle green, contrasting nicely with dark blue
  if (score >= 70) return 'text-yellow';
  return 'text-[#f87171]'; // A soft red
};

// Sleep Stage Calculation Logic
const hasSleepStages = (session) => {
  return session.light_sleep_minutes || session.deep_sleep_minutes || session.rem_sleep_minutes;
};

const getStagePercentage = (stageMinutes, session) => {
  if (!stageMinutes) return 0;
  const total = (session.light_sleep_minutes || 0) + (session.deep_sleep_minutes || 0) + (session.rem_sleep_minutes || 0);
  if (total === 0) return 0;
  return (stageMinutes / total) * 100;
};

// Data Loading
const loadData = async () => {
  isLoading.value = true;
  const token = localStorage.getItem('sessionToken');
  
  const now = new Date();
  const cutoffDate = new Date();
  
  if (selectedTimeframe.value === 'week') {
    cutoffDate.setDate(now.getDate() - 7);
  } else if (selectedTimeframe.value === 'month') {
    cutoffDate.setMonth(now.getMonth() - 1);
  } else if (selectedTimeframe.value === 'year') {
    cutoffDate.setFullYear(now.getFullYear() - 1);
  }

  try {
    const allData = await fetchWhoopSleepHistory(token);
    sleepData.value = allData.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= cutoffDate;
    });
  } catch (err) {
    console.error("Failed to load WHOOP data:", err);
    sleepData.value = []; 
  } finally {
    isLoading.value = false;
  }
};

watch(selectedTimeframe, loadData);

onMounted(() => {
  loadData();
});
</script>