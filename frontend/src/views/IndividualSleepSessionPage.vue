<template>
  <div class="min-h-screen bg-blue-1 text-white relative overflow-hidden flex flex-col p-6">
    <div class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple rounded-full mix-blend-screen blur-[100px] opacity-20"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-4 rounded-full mix-blend-screen blur-[100px] opacity-20"></div>

    <div class="z-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <header class="flex justify-between items-center mt-6 mb-4">
        <div>
          <p class="text-grey-1 text-sm">Sleep Tracker</p>
          <h1 class="text-3xl font-extrabold tracking-tight text-purple">Individual Session</h1>
        </div>

        <router-link
          to="/statistics"
          class="bg-purple hover:bg-blue-4 text-blue-1 px-4 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(153,163,251,0.3)]"
        >
          Statistics
        </router-link>
      </header>

      <section class="bg-blue-2/30 p-5 rounded-xl border border-blue-4/20 shadow-[0_0_20px_rgba(153,163,251,0.1)]">
        <p v-if="isLoading" class="text-sm text-grey-1">Loading sessions...</p>
        <p v-else-if="!sessions.length" class="text-sm text-grey-1">No sleep sessions found yet.</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="session in sessions"
            :key="session.id || `${session.date}-${session.bedtime}`"
            @click="selectSession(session)"
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="
              currentSessionKey === sessionKey(session)
                ? 'bg-purple text-blue-1'
                : 'bg-blue-3 text-grey-2 hover:bg-blue-4 hover:text-white'
            "
          >
            {{ formatSessionButton(session) }}
          </button>
        </div>
      </section>

      <section
        v-if="currentSession"
        class="bg-blue-2/30 p-6 rounded-xl border border-blue-4/20 shadow-[0_0_20px_rgba(153,163,251,0.1)]"
      >
        <div class="flex justify-between items-center border-b border-blue-4/20 pb-4">
          <div>
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-1">Selected Night</p>
            <h2 class="text-2xl font-bold text-white">{{ formatLongDate(currentSession.date) }}</h2>
          </div>
          <div class="text-right">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-1">Quality</p>
            <p class="text-2xl font-bold" :class="getScoreColor(currentSession.sleep_performance_score)">
              {{ currentSession.sleep_performance_score || '--' }}%
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Duration</p>
            <p class="text-xl font-bold text-white">{{ formatDuration(currentSession.total_sleep_duration_minutes) }}</p>
          </div>
          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Efficiency</p>
            <p class="text-xl font-bold text-white">{{ formatPercent(currentSession.sleep_efficiency) }}</p>
          </div>
          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Bedtime</p>
            <p class="text-xl font-bold text-white">{{ formatTime(currentSession.bedtime) }}</p>
          </div>
          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Wake Up</p>
            <p class="text-xl font-bold text-white">{{ formatTime(currentSession.wake_time) }}</p>
          </div>
        </div>
      </section>

      <section
        v-if="currentSession"
        class="bg-blue-2/30 p-6 rounded-xl border border-blue-4/20 shadow-[0_0_20px_rgba(153,163,251,0.1)]"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-grey-2">Sleep Timeline</h2>
          <span class="text-grey-1 text-sm">
            {{ formatTime(currentSession.bedtime) }} - {{ formatTime(currentSession.wake_time) }}
          </span>
        </div>

        <div class="overflow-hidden rounded-full bg-blue-3 h-7">
          <div class="flex h-full w-full">
            <div
              v-for="(item, index) in timeline"
              :key="index"
              class="h-full"
              :style="{ width: item.width, backgroundColor: item.color }"
            ></div>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div
            v-for="stage in sleepStages"
            :key="stage.label"
            class="bg-blue-3 p-4 rounded-xl"
          >
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: stage.color }"></span>
              <span class="text-grey-2 text-sm">{{ stage.label }}</span>
            </div>
            <p class="mt-2 text-lg font-bold text-white">{{ formatDuration(stage.value) }}</p>
          </div>
        </div>
      </section>

      <section
        v-if="currentSession"
        class="bg-blue-2/30 p-6 rounded-xl border border-blue-4/20 shadow-[0_0_20px_rgba(153,163,251,0.1)]"
      >
        <h2 class="text-xl font-bold text-grey-2 mb-4">Session Breakdown</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Time in Bed</p>
            <p class="text-lg font-bold text-white">{{ formatDuration(currentSession.total_in_bed_minutes) }}</p>
          </div>

          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Awake Time</p>
            <p class="text-lg font-bold text-white">{{ formatDuration(currentSession.awake_minutes) }}</p>
          </div>

          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Consistency</p>
            <p class="text-lg font-bold text-purple">{{ formatPercent(currentSession.sleep_consistency) }}</p>
          </div>

          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Score Label</p>
            <p class="text-lg font-bold text-white">{{ scoreLabel(currentSession.sleep_performance_score) }}</p>
          </div>
        </div>
      </section>

      <section
        v-if="currentSession"
        class="bg-blue-2/30 p-6 rounded-xl border border-blue-4/20 shadow-[0_0_20px_rgba(153,163,251,0.1)]"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-grey-2">Additional Metrics</h2>
          <span class="text-yellow font-semibold">{{ scoreLabel(currentSession.sleep_performance_score) }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="bg-blue-3 p-4 rounded-xl text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Respiratory Rate</p>
            <p class="text-lg font-bold text-white">{{ formatRespiratoryRate(currentSession.respiratory_rate) }}</p>
          </div>
          <div class="bg-blue-3 p-4 rounded-xl text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Nap</p>
            <p class="text-lg font-bold text-white">{{ isNap(currentSession) ? 'Yes' : 'No' }}</p>
          </div>
          <div class="bg-blue-3 p-4 rounded-xl text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Date</p>
            <p class="text-lg font-bold text-white">{{ formatSessionButton(currentSession) }}</p>
          </div>
        </div>

        <div class="bg-blue-3 p-4 rounded-xl">
          <p class="text-grey-2 text-sm leading-relaxed">
            Data is loaded from your synced sleep history.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { fetchWhoopSleepHistory } from '../services/sleep.service'

export default {
  name: 'IndividualSleepSessionPage',
  data() {
    return {
      sessions: [],
      currentSessionKey: '',
      isLoading: true
    }
  },
  computed: {
    currentSession() {
      return this.sessions.find((s) => this.sessionKey(s) === this.currentSessionKey) || null
    },
    sleepStages() {
      if (!this.currentSession) return []
      return [
        { label: 'Deep', value: Number(this.currentSession.deep_sleep_minutes || 0), color: '#99A3FB' },
        { label: 'REM', value: Number(this.currentSession.rem_sleep_minutes || 0), color: '#FFE7BF' },
        { label: 'Light', value: Number(this.currentSession.light_sleep_minutes || 0), color: '#6D75B0' },
        { label: 'Awake', value: Number(this.currentSession.awake_minutes || 0), color: '#C5C6D0' }
      ]
    },
    timeline() {
      const total = this.sleepStages.reduce((sum, item) => sum + item.value, 0);
      if (!total) {
        return [{ width: '100%', color: '#6D75B0' }];
      }
      return this.sleepStages
        .filter((item) => item.value > 0)
        .map((item) => ({
          width: `${(item.value / total) * 100}%`,
          color: item.color,
        }));
    }
  },
  async mounted() {
    await this.loadSessions();
  },
  methods: {
    async loadSessions() {
      this.isLoading = true;
      const token = localStorage.getItem('sessionToken');
      if (!token) {
        this.sessions = [];
        this.currentSessionKey = '';
        this.isLoading = false;
        return;
      }
      try {
        const rows = await fetchWhoopSleepHistory(token);
        const mapped = (Array.isArray(rows) ? rows : [])
          .filter((session) => !this.isNap(session))
          .sort((a, b) => {
            const wa = new Date(a.wake_time || a.bedtime || 0).getTime();
            const wb = new Date(b.wake_time || b.bedtime || 0).getTime();
            return wb - wa;
          });
        this.sessions = mapped;
        this.currentSessionKey = mapped[0] ? this.sessionKey(mapped[0]) : '';
      } catch (error) {
        console.error('Failed to load individual sessions:', error);
        this.sessions = [];
        this.currentSessionKey = '';
      } finally {
        this.isLoading = false;
      }
    },
    isNap(session) {
      const n = session?.nap;
      return n === true || n === 1 || n === '1';
    },
    sessionKey(session) {
      return `${session.id || ''}-${session.date || ''}-${session.bedtime || ''}-${session.wake_time || ''}`
    },
    selectSession(session) {
      this.currentSessionKey = this.sessionKey(session)
    },
    formatDuration(minutes) {
      const n = Number(minutes || 0);
      const h = Math.floor(n / 60);
      const m = Math.round(n % 60);
      return `${h}h ${m}m`;
    },
    formatTime(time) {
      if (!time) return '--:--';
      const date = new Date(time);
      if (Number.isNaN(date.getTime())) return '--:--';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    formatLongDate(date) {
      const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00`) : new Date(date);
      if (Number.isNaN(d.getTime())) return String(date || '');
      return d.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },
    formatSessionButton(session) {
      const date = session?.date;
      const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00`) : new Date(date);
      if (Number.isNaN(d.getTime())) return 'Unknown';
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short'
      })
    },
    formatPercent(value) {
      if (value == null || value === '') return '--';
      let n = Number(value);
      if (Number.isNaN(n)) return '--';
      if (n > 0 && n <= 1) n *= 100;
      return `${Math.round(n)}%`;
    },
    formatRespiratoryRate(value) {
      if (value == null || value === '') return '--';
      const n = Number(value);
      if (Number.isNaN(n)) return '--';
      return `${n.toFixed(1)} rpm`;
    },
    scoreLabel(score) {
      if (score == null || score === '') return 'Unavailable';
      if (score >= 85) return 'Excellent'
      if (score >= 75) return 'Good'
      if (score >= 60) return 'Fair'
      return 'Poor'
    },
    getScoreColor(score) {
      if (!score) return 'text-grey-2'
      if (score >= 85) return 'text-[#4ade80]'
      if (score >= 70) return 'text-yellow'
      return 'text-[#f87171]'
    }
  }
}
</script> 