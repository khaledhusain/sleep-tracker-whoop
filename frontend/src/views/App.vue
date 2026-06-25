<template>
  <div class="min-h-dvh bg-blue-2 font-Montserrat text-white antialiased">
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-blue-2 px-4 py-5 shadow-[12px_0_35px_rgba(3,10,40,0.22)]"
      aria-label="Primary navigation"
    >
      <router-link to="/" class="group flex items-center gap-3 px-2">
        <span
          class="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-4/30 bg-blue-3/80 text-purple shadow-md transition group-hover:border-purple/50 group-hover:bg-blue-4/30"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="size-6 drop-shadow-[0_0_8px_rgba(153,163,251,0.4)]" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        <span class="text-lg font-extrabold tracking-wide text-white">Sleep Tracker</span>
      </router-link>

      <nav v-if="isLoggedIn" class="mt-12 space-y-1.5">
        <router-link
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-semibold text-grey-1 transition hover:text-white"
          active-class="!border-transparent !bg-blue-3 !text-white !shadow-none"
        >
          <svg
            v-if="item.icon === 'dashboard'"
            class="size-5 shrink-0 text-purple transition group-hover:text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <svg
            v-else-if="item.icon === 'data'"
            class="size-5 shrink-0 text-[#38bdf8] transition group-hover:text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <ellipse cx="12" cy="5" rx="8" ry="3" />
            <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
          </svg>
          <svg
            v-else
            class="size-5 shrink-0 text-[#34d399] transition group-hover:text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
            <path d="M2 19h21" />
          </svg>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="mt-auto border-t border-blue-4/20 pt-4">
        <router-link
          v-if="isLoggedIn"
          to="/user"
          class="group flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition hover:text-white"
          active-class="!border-transparent !bg-blue-3 !shadow-none"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded-full border border-blue-4/30 bg-blue-3 text-grey-1 transition group-hover:border-purple/50 group-hover:bg-purple group-hover:text-blue-1"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="size-6" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-semibold text-white">{{ userName }}</span>
          </span>
        </router-link>

        <router-link
          v-else
          to="/login"
          class="flex items-center justify-center rounded-xl border border-purple/30 bg-purple/10 px-3 py-2.5 text-sm font-semibold text-purple transition hover:bg-purple/15"
        >
          Sign in
        </router-link>
      </div>
    </aside>

    <main class="ml-60 min-h-dvh w-[calc(100%_-_15rem)] p-3 lg:p-4">
      <div class="flex justify-center">
        <div
          v-if="showMsgs"
          class="fixed top-5 z-50 rounded-lg bg-purple px-4 py-3 font-bold text-blue-1 shadow-lg transition-opacity duration-500"
        >
          {{ messages }}
        </div>
      </div>

      <router-view :class="mainContentClass" />
    </main>
  </div>
</template>

<script>
import { userService } from '@/services/user.service';

export default {
  data() {
    return {
      messages: '',
      showMsgs: false,
      isLoggedIn: false,
      userName: 'Account',
      navigation: [
        { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
        { label: 'Sleep Data', to: '/sleep-entries', icon: 'data' },
        { label: 'Statistics', to: '/statistics', icon: 'statistics' },
      ],
    };
  },
  computed: {
    mainContentClass() {
      if (['/dashboard', '/sleep-entries', '/statistics'].includes(this.$route.path)) {
        return 'flex min-w-0 min-h-[calc(100dvh-1.5rem)] w-full flex-col';
      }
      return 'flex min-w-0 min-h-[calc(100dvh-1.5rem)] w-full flex-col rounded-2xl bg-blue-1 isolation-isolate p-3 sm:p-4';
    },
  },
  methods: {
    syncAuthState() {
      this.isLoggedIn = !!localStorage.getItem('sessionToken');
      if (this.isLoggedIn) {
        this.loadUserName();
      } else {
        this.userName = 'Account';
      }
    },
    loadUserName() {
      userService
        .getInfo()
        .then((user) => {
          const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
          this.userName = fullName || 'Account';
        })
        .catch(() => {
          this.userName = 'Account';
        });
    },
    checkMessages() {
      const msgs = localStorage.getItem('msgs');
      if (!msgs) return;
      this.messages = msgs;
      this.showMsgs = true;
      localStorage.removeItem('msgs');
      setTimeout(() => {
        this.showMsgs = false;
      }, 3000);
    },
  },
  mounted() {
    this.syncAuthState();
    this.checkMessages();
  },
  watch: {
    $route() {
      this.syncAuthState();
      this.checkMessages();
    },
  },
};
</script>
