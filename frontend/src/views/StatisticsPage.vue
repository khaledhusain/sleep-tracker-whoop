<template>
  <div class="min-h-screen bg-blue-1 text-white relative overflow-hidden flex flex-col font-Montserrat p-6">
    <div class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple rounded-full mix-blend-screen blur-[100px] opacity-20"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-4 rounded-full mix-blend-screen blur-[100px] opacity-20"></div>

    <div class="z-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      <header class="flex justify-between items-center mt-6 mb-4">
        <div>
          <p class="text-grey-1 text-sm">Sleep Tracker</p>
          <h1 class="text-3xl font-extrabold tracking-tight text-purple">Statistics</h1>
        </div>

        <router-link
          to="/session"
          class="bg-purple hover:bg-blue-4 text-blue-1 px-4 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(153,163,251,0.3)]"
        >
          Individual Session
        </router-link>
      </header>

      <section class="bg-blue-2/30 p-6 rounded-xl border border-blue-4/20 shadow-[0_0_20px_rgba(153,163,251,0.1)]">
        <p v-if="isLoading" class="mb-4 text-sm text-grey-1">Loading statistics...</p>
        <p v-else-if="!sessions.length" class="mb-4 text-sm text-grey-1">No sleep sessions available for statistics.</p>
        <h2 class="text-xl font-bold text-grey-2 mb-4">Stats Overview</h2>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-blue-3 p-4 rounded-xl text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Avg Duration</p>
            <p class="text-xl font-bold text-white">{{ avgDuration }}</p>
          </div>

          <div class="bg-blue-3 p-4 rounded-xl text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Avg Score</p>
            <p class="text-xl font-bold text-purple">{{ avgScore }}%</p>
          </div>

          <div class="bg-blue-3 p-4 rounded-xl text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Best Night</p>
            <p class="text-xl font-bold text-white">{{ bestNight }}%</p>
          </div>

          <div class="bg-blue-3 p-4 rounded-xl text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Avg Bedtime</p>
            <p class="text-xl font-bold text-white">{{ averageBedtime() }}</p>
          </div>
        </div>
      </section>

      <section class="bg-blue-2/30 p-6 rounded-xl border border-blue-4/20 shadow-[0_0_20px_rgba(153,163,251,0.1)]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-grey-2">Sleep Quality Trend</h2>
          <span class="text-grey-1 text-sm">Past 7 Days</span>
        </div>

        <div class="h-56 rounded-xl bg-blue-3 p-4">
          <svg viewBox="0 0 100 100" class="h-full w-full overflow-visible">
            <polyline fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" points="0,80 100,80" />
            <polyline fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" points="0,60 100,60" />
            <polyline fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" points="0,40 100,40" />
            <polyline
              fill="none"
              stroke="#99A3FB"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              :points="scorePoints"
            />
            <circle
              v-for="(value, index) in scoreTrend"
              :key="index"
              :cx="(index / Math.max(scoreTrend.length - 1, 1)) * 100"
              :cy="100 - normalizeScore(value)"
              r="2.4"
              fill="#FFE7BF"
            />
          </svg>
        </div>

        <div class="mt-4 grid grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs text-grey-1">
          <span v-for="item in weeklyStats" :key="item.day">{{ item.day }}</span>
        </div>
      </section>

      <section class="bg-blue-2/30 p-6 rounded-xl border border-blue-4/20 shadow-[0_0_20px_rgba(153,163,251,0.1)]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-grey-2">Sleep Duration</h2>
          <span class="text-grey-1 text-sm">Hours</span>
        </div>

        <div class="flex h-56 items-end justify-between gap-3">
          <div
            v-for="item in weeklyStats"
            :key="item.day"
            class="flex flex-1 flex-col items-center gap-2"
          >
            <div class="flex h-40 w-full items-end rounded-xl bg-blue-3 p-1">
              <div
                class="w-full rounded-xl bg-gradient-to-t from-purple to-blue-4"
                :style="{ height: ((item.hours / maxHours) * 100) + '%' }"
              ></div>
            </div>
            <div class="text-center">
              <p class="text-xs text-grey-1">{{ item.day }}</p>
              <p class="text-xs text-white">{{ item.hours }}h</p>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-blue-2/30 p-6 rounded-xl border border-blue-4/20 shadow-[0_0_20px_rgba(153,163,251,0.1)]">
        <h2 class="text-xl font-bold text-grey-2 mb-4">Stage Distribution</h2>

        <div class="space-y-4">
          <div v-for="stage in stagePercents" :key="stage.label">
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="text-grey-2">{{ stage.label }}</span>
              <span class="text-grey-1">{{ stage.percent }}%</span>
            </div>
            <div class="h-3 rounded-full bg-blue-3">
              <div
                class="h-3 rounded-full"
                :style="{ width: stage.percent + '%', backgroundColor: stage.color }"
              ></div>
            </div>
          </div>
        </div>

        <div class="mt-5 rounded-xl bg-blue-3 p-4 text-sm leading-6 text-grey-2">
          More consistent bedtimes and stronger deep sleep are linked with your best rest scores.
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { fetchWhoopSleepHistory } from '../services/sleep.service'

export default {
  name: 'StatisticsPage',
  data() {
    return {
      sessions: [],
      isLoading: true
    }
  },
  async mounted() {
    await this.loadSessions()
  },
  computed: {
    weeklyStats() {
      return [...this.sessions]
        .sort((a, b) => {
          const wa = new Date(a.wake_time || a.bedtime || 0).getTime()
          const wb = new Date(b.wake_time || b.bedtime || 0).getTime()
          return wb - wa
        })
        .slice(0, 7)
        .reverse()
        .map((s) => ({
        day: this.dayShort(s.date),
        hours: Math.round((Number(s.total_sleep_duration_minutes || 0) / 60) * 10) / 10,
        score: Number(s.sleep_performance_score || 0)
      }))
    },
    avgScore() {
      return Math.round(this.average(this.sessions.map((s) => Number(s.sleep_performance_score || 0))))
    },
    avgDuration() {
      return this.formatDuration(this.average(this.sessions.map((s) => Number(s.total_sleep_duration_minutes || 0))))
    },
    bestNight() {
      const best = [...this.sessions].sort((a, b) => Number(b.sleep_performance_score || 0) - Number(a.sleep_performance_score || 0))[0]
      return best ? Number(best.sleep_performance_score || 0) : 0
    },
    scoreTrend() {
      return this.weeklyStats.map((item) => item.score)
    },
    scorePoints() {
      return this.scoreTrend
        .map((value, index) => {
          const x = (index / Math.max(this.scoreTrend.length - 1, 1)) * 100
          const y = 100 - this.normalizeScore(value)
          return `${x},${y}`
        })
        .join(' ')
    },
    maxHours() {
      return Math.max(...this.weeklyStats.map((d) => d.hours), 1)
    },
    stagePercents() {
      if (!this.sessions.length) return []
      const latest = [...this.sessions]
        .sort((a, b) => {
          const wa = new Date(a.wake_time || a.bedtime || 0).getTime()
          const wb = new Date(b.wake_time || b.bedtime || 0).getTime()
          return wb - wa
        })[0]
      const stages = [
        { label: 'Deep', value: Number(latest.deep_sleep_minutes || 0), color: '#99A3FB' },
        { label: 'REM', value: Number(latest.rem_sleep_minutes || 0), color: '#FFE7BF' },
        { label: 'Light', value: Number(latest.light_sleep_minutes || 0), color: '#6D75B0' },
        { label: 'Awake', value: Number(latest.awake_minutes || 0), color: '#C5C6D0' }
      ]
      const total = stages.reduce((sum, s) => sum + s.value, 0) || 1
      return stages.map((stage) => ({
        ...stage,
        percent: Math.round((stage.value / total) * 100)
      }))
    }
  },
  methods: {
    async loadSessions() {
      this.isLoading = true
      const token = localStorage.getItem('sessionToken')
      if (!token) {
        this.sessions = []
        this.isLoading = false
        return
      }
      try {
        const rows = await fetchWhoopSleepHistory(token)
        this.sessions = (Array.isArray(rows) ? rows : []).filter((session) => !this.isNap(session))
      } catch (error) {
        console.error('Failed to load statistics sessions:', error)
        this.sessions = []
      } finally {
        this.isLoading = false
      }
    },
    isNap(session) {
      const n = session?.nap
      return n === true || n === 1 || n === '1'
    },
    average(values) {
      if (!values.length) return 0
      return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length
    },
    formatDuration(minutes) {
      const wholeHours = Math.floor(minutes / 60)
      const mins = Math.round(minutes % 60)
      return `${wholeHours}h ${mins}m`
    },
    normalizeScore(score) {
      const safe = Number(score || 0)
      if (Number.isNaN(safe)) return 0
      return Math.max(0, Math.min(100, safe))
    },
    dayShort(date) {
      const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00`) : new Date(date)
      if (Number.isNaN(d.getTime())) return '--'
      return d.toLocaleDateString('en-GB', { weekday: 'short' })
    },
    timeToDecimal(time) {
      if (!time) return null
      const d = new Date(time)
      if (Number.isNaN(d.getTime())) return null
      return d.getHours() + d.getMinutes() / 60
    },
    averageBedtime() {
      const values = this.sessions.map((s) => {
        const decimal = this.timeToDecimal(s.bedtime)
        if (decimal == null) return null
        return decimal < 12 ? decimal + 24 : decimal
      }).filter((v) => v != null)
      if (!values.length) return '--:--'
      const avg = this.average(values)
      const normalized = avg >= 24 ? avg - 24 : avg
      const hours = Math.floor(normalized)
      const minutes = Math.round((normalized - hours) * 60)
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
  }
}
</script>