import { createRouter, createWebHistory } from 'vue-router'
import IndividualSleepSessionPage from '@/views/IndividualSleepSessionPage.vue'
import StatisticsPage from '@/views/StatisticsPage.vue'

const routes = [
  { path: '/', redirect: '/session' },
  { path: '/session', component: IndividualSleepSessionPage },
  { path: '/statistics', component: StatisticsPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router