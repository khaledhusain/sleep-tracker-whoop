<template>
  <div class="antialiased text-grey-2 bg-blue-2 p-5 font-Montserrat min-h-screen flex flex-col">

    <div class="flex items-center justify-between pb-6 mb-2 border-b border-blue-4/20">

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
          class="font-extrabold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-purple group-hover:from-purple group-hover:to-white transition-all duration-500">
          Sleep Tracker
        </p>

      </router-link>

      <router-link to="/user" class="flex gap-3 relative group">

        <div
          class="bg-blue-3 p-2 rounded-full shadow-md border border-blue-4/30 text-grey-1 group-hover:bg-purple group-hover:text-blue-1 group-hover:border-purple transition-all duration-300 hover:scale-110 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd"
              d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              clip-rule="evenodd" />
          </svg>
        </div>

      </router-link>

    </div>

    <!-- messages -->
    <div class="flex justify-center">
      <div v-if="showMsgs" class=" p-2 px-4 m-8 
        bg-blue-3 text-white rounded transition-opacity duration-500 ease-out">
        {{ messages }}
      </div>
    </div>

    <router-view class="bg-blue-3 rounded-2xl p-6 shadow-lg border border-blue-4/10 flex-grow" />

  </div>
</template>

<script>

export default {
  data() {
    return {
      messages: "",
      showMsgs: true,
    };
  },
  methods: {
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
    this.checkMessages();
  },

  watch: {
    $route() {
      this.checkMessages();
    }
  }

}
</script>