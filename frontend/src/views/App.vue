<template>
  <div
    class="antialiased text-white bg-blue-2 font-Montserrat flex min-h-dvh flex-col p-5"
  >

    <div
      class="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-blue-4/20 pb-6 pt-1.5"
    >

      <router-link to="/" class="flex items-center gap-3 group">

        <div
          class="bg-blue-3/80 p-2 rounded-xl shadow-md border border-blue-4/30 group-hover:bg-blue-4/40 group-hover:border-purple/50 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
            class="w-7 h-7 text-purple drop-shadow-[0_0_8px_rgba(153,163,251,0.4)]">
            <path fill-rule="evenodd"
              d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
              clip-rule="evenodd" />
          </svg>
        </div>

        <p
          class="font-extrabold text-xl tracking-wide text-transparent bg-clip-text bg-linear-to-r from-white to-purple group-hover:from-purple group-hover:to-white transition-all duration-500">
          Sleep Tracker
        </p>

      </router-link>

      <nav v-if="isLoggedIn" class="flex items-center gap-2 sm:gap-3 sm:pr-37 ">
        <router-link to="/dashboard" active-class="bg-purple text-blue-1 shadow-[0_0_12px_rgba(153,163,251,0.35)]"
          class="rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-grey-2 transition-all hover:border-blue-4/30 hover:bg-blue-3/80 hover:text-white">
          Dashboard
        </router-link>
        <router-link to="/sleep-entries" active-class="bg-purple text-blue-1 shadow-[0_0_12px_rgba(153,163,251,0.35)]"
          class="rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-grey-2 transition-all hover:border-blue-4/30 hover:bg-blue-3/80 hover:text-white">
          Sleep data
        </router-link>
        <router-link to="/statistics" active-class="bg-purple text-blue-1 shadow-[0_0_12px_rgba(153,163,251,0.35)]"
          class="rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-grey-2 transition-all hover:border-blue-4/30 hover:bg-blue-3/80 hover:text-white">
          Statistics
        </router-link>
        <router-link to="/session" active-class="bg-purple text-blue-1 shadow-[0_0_12px_rgba(153,163,251,0.35)]"
          class="rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-grey-2 transition-all hover:border-blue-4/30 hover:bg-blue-3/80 hover:text-white">
          Individual Session
        </router-link>
      </nav>

      <router-link to="/user" class="flex gap-3 relative group">

        <div
          class="bg-blue-3 p-1.5 rounded-full shadow-md border border-blue-4/30 text-grey-1 group-hover:bg-purple group-hover:text-blue-1 group-hover:border-purple transition-all duration-300 hover:scale-110 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
            <path fill-rule="evenodd"
              d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              clip-rule="evenodd" />
          </svg>
        </div>

      </router-link>

    </div>

    <!-- messages -->
    <div class="flex shrink-0 justify-center">
      <div v-if="showMsgs"
        class="absolute z-20 p-3 px-4 m-8 bg-purple  rounded font-bold transition-opacity duration-500 ease-out">
        {{ messages }}
      </div>
    </div>

    <router-view :class="mainContentClass" />
    <!-- Avoid mix-blend-screen on large fixed layers: it can hide the rest of the page on some GPUs/browsers (Windows). -->

  </div>
</template>

<script>

export default {
  data() {
    return {
      messages: "",
      showMsgs: false,
      isLoggedIn: false,
    };
  },
  computed: {
    mainContentClass() {
      return 'flex min-w-0 flex-1 flex-col bg-blue-1 isolation-isolate rounded-2xl p-6';
    },
  },
  methods: {
    syncAuthState() {
      this.isLoggedIn = !!localStorage.getItem("sessionToken");
    },

    checkMessages() {
      const msgs = localStorage.getItem("msgs");
      if (msgs) {
        this.messages = msgs;
        this.showMsgs = true;

        localStorage.removeItem("msgs");

        setTimeout(() => {
          this.showMsgs = false;
        }, 3000);
      }
    }
  },
  mounted() {
    this.syncAuthState();
    this.checkMessages();
  },

  watch: {
    $route() {
      this.syncAuthState();
      this.checkMessages();
    }
  }

}
</script>
