import { createRouter, createWebHistory } from 'vue-router';

import Home from "@/views/Home.vue";
import Login from '@/views/Login.vue';
import SignUp from '@/views/SignUp.vue';
import Dashboard from '@/views/Dashboard.vue';
import SleepEntriesPage from '@/views/SleepEntriesPage.vue';
import User from '@/views/User.vue';
import IndividualSleepSessionPage from '@/views/IndividualSleepSessionPage.vue';
import StatisticsPage from '@/views/StatisticsPage.vue';


const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: SignUp },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/sleep-entries", component: SleepEntriesPage, meta: { requiresAuth: true } },
  { path: "/user", component: User, meta: { requiresAuth: true } },
  { path: "/session", component: IndividualSleepSessionPage},
  { path: "/statistics", component: StatisticsPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

//check login - block movement
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("sessionToken");
  const authRoutes = ["/signup", "/login"];

  if (to.meta.requiresAuth && !token) {
    localStorage.setItem("msgs", "Please login first");
    next("/login");
  } else if (authRoutes.includes(to.path) && token) {
    localStorage.setItem("msgs", "You are already logged in");
    next("/dashboard");
  } else if (["/"].includes(to.path) && token) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
