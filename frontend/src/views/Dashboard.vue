<template>
  <div class="min-h-screen bg-blue-1 text-white relative overflow-hidden flex flex-col font-Montserrat p-6">
    <div class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple rounded-full mix-blend-screen filter blur-[100px] opacity-20 fixed"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-4 rounded-full mix-blend-screen filter blur-[100px] opacity-20 fixed"></div>

    <div class="z-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      
      <header class="flex justify-between items-center mt-6 mb-4">
        <h1 class="text-3xl font-extrabold tracking-tight text-purple">Overview</h1>
        <select v-model="selectedTimeframe" class="bg-blue-2/50 border border-blue-4/30 text-white text-sm rounded-lg p-2.5 outline-none focus:border-purple">
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="year">Past Year</option>
        </select>
      </header>

      <section>
        <h2 class="text-xl font-bold text-grey-2 mb-4">Last Night</h2>
        <div v-if="lastNight" class="flex flex-col gap-4 bg-blue-2/30 p-6 rounded-xl border border-blue-4/20 shadow-[0_0_20px_rgba(153,163,251,0.1)]">
          <div class="flex justify-between items-center border-b border-blue-4/20 pb-4">
            <div>
              <p class="text-grey-1 text-xs uppercase tracking-wider mb-1">Duration</p>
              <p class="text-2xl font-bold text-white">{{ formatDuration(lastNight.total_sleep_duration_minutes) }}</p>
            </div>
            <div class="text-right">
              <p class="text-grey-1 text-xs uppercase tracking-wider mb-1">Quality Score</p>
              <p class="text-2xl font-bold" :class="getScoreColor(lastNight.sleep_performance_score)">
                {{ lastNight.sleep_performance_score || '--' }}%
              </p>
            </div>
          </div>
          <div class="flex justify-between text-sm text-grey-2 pt-2">
            <span><strong>Bedtime:</strong> {{ formatTime(lastNight.bedtime) }}</span>
            <span><strong>Wake up:</strong> {{ formatTime(lastNight.wake_time) }}</span>
          </div>
        </div>
        <div v-else class="text-grey-1 text-sm text-center py-6 bg-blue-2/30 rounded-xl border border-blue-4/20">
          No sleep data recorded for last night.
        </div>
      </section>

      <section>
        <h2 class="text-xl font-bold text-grey-2 mb-4">Stats ({{ timeframeLabel }})</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div class="bg-blue-2/30 p-5 rounded-xl border border-blue-4/20 flex flex-col items-center justify-center text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Avg Duration</p>
            <p class="text-2xl font-bold text-white">{{ formatDuration(stats.avgDuration) }}</p>
          </div>

          <div class="bg-blue-2/30 p-5 rounded-xl border border-blue-4/20 flex flex-col items-center justify-center text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Avg Quality</p>
            <p class="text-2xl font-bold text-purple">{{ stats.avgQuality }}%</p>
          </div>

          <div class="bg-blue-2/30 p-5 rounded-xl border border-blue-4/20 flex flex-col items-center justify-center text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Consistency</p>
            <p class="text-2xl font-bold text-white">{{ stats.avgConsistency }}%</p>
            <p class="text-xs text-grey-2 mt-2">
              In bed by {{ formatTime(stats.avgBedtime) }}
            </p>
          </div>

        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { fetchSleepData } from '../services/sleep.service';

const sleepData = ref([]);
const selectedTimeframe = ref('week');

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
  if (!data.length) return { avgDuration: 0, avgQuality: 0, avgConsistency: 0, avgBedtime: null };

  let totalDuration = 0;
  let totalQuality = 0;
  let totalConsistency = 0;
  let bedtimeSum = 0; // Stored as minutes from midnight for averaging

  data.forEach(session => {
    totalDuration += session.total_sleep_duration_minutes || 0;
    totalQuality += session.sleep_performance_score || 0;
    totalConsistency += session.sleep_consistency || 0;

    const bt = new Date(session.bedtime);
    bedtimeSum += (bt.getHours() * 60) + bt.getMinutes();
  });

  const count = data.length;
  
  const avgBedtimeMins = Math.floor(bedtimeSum / count);
  const avgBedtimeDate = new Date();
  avgBedtimeDate.setHours(Math.floor(avgBedtimeMins / 60), avgBedtimeMins % 60, 0);

  return {
    avgDuration: Math.floor(totalDuration / count),
    avgQuality: Math.floor(totalQuality / count),
    avgConsistency: Math.floor(totalConsistency / count),
    avgBedtime: avgBedtimeDate
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

const loadData = async () => {
  const token = localStorage.getItem('sessionToken');

  // --- START FAKE DATA BLOCK ---
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  sleepData.value = [
    {
      id: 1,
      date: today.toISOString(),
      bedtime: new Date(new Date(yesterday).setHours(22, 30, 0)).toISOString(),
      wake_time: new Date(new Date(today).setHours(6, 45, 0)).toISOString(),
      total_sleep_duration_minutes: 495, // 8h 15m
      sleep_performance_score: 92,
      sleep_consistency: 88
    },
    {
      id: 2,
      date: yesterday.toISOString(),
      bedtime: new Date(new Date(today).setDate(today.getDate() - 2)).setHours(23, 15, 0),
      wake_time: new Date(new Date(yesterday).setHours(7, 0, 0)).toISOString(),
      total_sleep_duration_minutes: 465, // 7h 45m
      sleep_performance_score: 75, 
      sleep_consistency: 80
    }
  ];
  return; 
  // --- END FAKE DATA BLOCK ---

  /* COMMENT OUT REAL API CALL TEMPORARILY
  const endDate = new Date();
  const startDate = new Date();
  
  if (selectedTimeframe.value === 'week') startDate.setDate(startDate.getDate() - 7);
  else if (selectedTimeframe.value === 'month') startDate.setMonth(startDate.getMonth() - 1);
  else if (selectedTimeframe.value === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

  try {
    const data = await fetchSleepData(token, startDate, endDate);
    sleepData.value = data;
  } catch (err) {
    console.error(err);
  }
  */
};

watch(selectedTimeframe, loadData);

onMounted(() => {
  loadData();
});
</script>