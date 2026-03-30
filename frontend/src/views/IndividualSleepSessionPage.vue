<template>
  <div class="min-h-screen bg-blue-1 text-white relative overflow-hidden flex flex-col font-Montserrat p-6">
    <div class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple rounded-full mix-blend-screen blur-[100px] opacity-20 fixed"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-4 rounded-full mix-blend-screen blur-[100px] opacity-20 fixed"></div>

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
        <div class="flex flex-wrap gap-2">
          <button
            v-for="session in sessions"
            :key="session.id"
            @click="selectSession(session.date)"
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="
              currentSessionDate === session.date
                ? 'bg-purple text-blue-1'
                : 'bg-blue-3 text-grey-2 hover:bg-blue-4 hover:text-white'
            "
          >
            {{ formatSessionButton(session.date) }}
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
            <p class="text-2xl font-bold" :class="getScoreColor(currentSession.sleepScore)">
              {{ currentSession.sleepScore }}%
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Duration</p>
            <p class="text-xl font-bold text-white">{{ formatHours(currentSession.durationHours) }}</p>
          </div>
          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Efficiency</p>
            <p class="text-xl font-bold text-white">{{ currentSession.efficiency }}%</p>
          </div>
          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Bedtime</p>
            <p class="text-xl font-bold text-white">{{ formatTime(currentSession.bedtime) }}</p>
          </div>
          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Wake Up</p>
            <p class="text-xl font-bold text-white">{{ formatTime(currentSession.wakeTime) }}</p>
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
            {{ formatTime(currentSession.bedtime) }} - {{ formatTime(currentSession.wakeTime) }}
          </span>
        </div>

        <div class="overflow-hidden rounded-full bg-blue-3 h-7">
          <div class="flex h-full w-full">
            <div
              v-for="(item, index) in currentSession.timeline"
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
            <p class="mt-2 text-lg font-bold text-white">{{ stage.value }}h</p>
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
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Time to Fall Asleep</p>
            <p class="text-lg font-bold text-white">{{ currentSession.fallAsleepMinutes }} min</p>
          </div>

          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Awakenings</p>
            <p class="text-lg font-bold text-white">{{ currentSession.awakenings }}</p>
          </div>

          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Mood</p>
            <p class="text-lg font-bold text-purple">{{ currentSession.mood }}</p>
          </div>

          <div class="bg-blue-3 p-4 rounded-xl">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Score Label</p>
            <p class="text-lg font-bold text-white">{{ scoreLabel(currentSession.sleepScore) }}</p>
          </div>
        </div>
      </section>

      <section
        v-if="currentSession"
        class="bg-blue-2/30 p-6 rounded-xl border border-blue-4/20 shadow-[0_0_20px_rgba(153,163,251,0.1)]"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-grey-2">Morning Reflection</h2>
          <span class="text-yellow font-semibold">{{ currentSession.mood }}</span>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="bg-blue-3 p-4 rounded-xl text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Energy</p>
            <p class="text-lg font-bold text-white">{{ currentSession.energy }}/10</p>
          </div>
          <div class="bg-blue-3 p-4 rounded-xl text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Stress</p>
            <p class="text-lg font-bold text-white">{{ currentSession.stress }}/10</p>
          </div>
          <div class="bg-blue-3 p-4 rounded-xl text-center">
            <p class="text-grey-1 text-xs uppercase tracking-wider mb-2">Focus</p>
            <p class="text-lg font-bold text-white">{{ currentSession.focus }}/10</p>
          </div>
        </div>

        <div class="bg-blue-3 p-4 rounded-xl">
          <p class="text-grey-2 text-sm leading-relaxed">{{ currentSession.note }}</p>
        </div>

        <div class="flex flex-wrap gap-2 mt-4">
          <span
            v-for="tag in currentSession.tags"
            :key="tag"
            class="bg-blue-4/20 text-grey-2 border border-blue-4/30 px-3 py-1 rounded-full text-xs"
          >
            {{ tag }}
          </span>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import sleepData from '../data/SleepData.js'

export default {
  name: 'IndividualSleepSessionPage',
  data() {
    return {
      sessions: sleepData,
      currentSessionDate: sleepData[0]?.date || ''
    }
  },
  computed: {
    currentSession() {
      return this.sessions.find((s) => s.date === this.currentSessionDate) || null
    },
    sleepStages() {
      if (!this.currentSession) return []
      return [
        { label: 'Deep', value: this.currentSession.deepSleepHours, color: '#99A3FB' },
        { label: 'REM', value: this.currentSession.remHours, color: '#FFE7BF' },
        { label: 'Light', value: this.currentSession.lightSleepHours, color: '#6D75B0' },
        { label: 'Awake', value: this.currentSession.awakeHours, color: '#C5C6D0' }
      ]
    }
  },
  methods: {
    selectSession(date) {
      this.currentSessionDate = date
    },
    formatHours(hours) {
      const wholeHours = Math.floor(hours)
      const minutes = Math.round((hours - wholeHours) * 60)
      return `${wholeHours}h ${minutes}m`
    },
    formatTime(time) {
      const [hours, minutes] = time.split(':').map(Number)
      const suffix = hours >= 12 ? 'PM' : 'AM'
      const convertedHours = hours % 12 || 12
      return `${convertedHours}:${String(minutes).padStart(2, '0')} ${suffix}`
    },
    formatLongDate(date) {
      return new Date(date).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    },
    formatSessionButton(date) {
      return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short'
      })
    },
    scoreLabel(score) {
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
</script> what do i do now