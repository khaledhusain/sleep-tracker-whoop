<template>

  <div class="relative min-h-[85vh] overflow-hidden flex flex-col items-center justify-center shadow-inner">

    <div
      class="absolute top-[-10%] left-[-10%] w-72 h-72 bg-purple rounded-full mix-blend-screen filter blur-[100px] opacity-25 animate-pulse">
    </div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-blue-4 rounded-full mix-blend-screen filter blur-[100px] opacity-25 animate-pulse"
      style="animation-delay: 2s;"></div>

    <div class="w-full max-w-md flex flex-col justify-between p-6 z-10 h-full">

      <div class="flex flex-col items-center mt-12">
        <div
          class="relative w-28 h-28 mb-6 flex items-center justify-center rounded-full shadow-[0_0_40px_rgba(153,163,251,0.2)] border border-blue-4/40 bg-blue-2/30 backdrop-blur-sm animate-[bounce_3s_infinite]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-white"
            aria-hidden="true">
            <path fill-rule="evenodd"
              d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
              clip-rule="evenodd" />
          </svg>
        </div>

        <h1
          class="text-4xl font-extrabold tracking-tight text-center text-transparent bg-clip-text bg-linear-to-r from-purple to-white pb-1">
          Restful
        </h1>
        <h2 class="text-xl font-bold tracking-widest uppercase text-center text-blue-4 mb-3">
          Sleep Tracker
        </h2>
        <p class="text-grey-1 text-center text-sm font-medium px-4 leading-relaxed">
          Understand your rest. Optimise your recovery. Wake up refreshed.
        </p>
      </div>

      <div class="flex flex-col gap-4 my-8 text-grey-3 text-sm font-medium w-full">
        <div
          class="flex items-center gap-4 bg-blue-2/40 backdrop-blur-md p-4 rounded-xl border border-blue-4/20 shadow-lg hover:bg-blue-2/60 hover:scale-[1.02] transition-all duration-300">
          <div class="bg-blue-3 p-2 rounded-lg shadow-inner">
            <svg class="w-5 h-5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <span class="tracking-wide">Track sleep cycles</span>
        </div>

        <div
          class="flex items-center gap-4 bg-blue-2/40 backdrop-blur-md p-4 rounded-xl border border-blue-4/20 shadow-lg hover:bg-blue-2/60 hover:scale-[1.02] transition-all duration-300">
          <div class="bg-blue-3 p-2 rounded-lg shadow-inner">
            <svg class="w-5 h-5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
              </path>
            </svg>
          </div>
          <span class="tracking-wide">Analyse sleep trends</span>
        </div>

        <div
          class="flex items-center gap-4 bg-blue-2/40 backdrop-blur-md p-4 rounded-xl border border-blue-4/20 shadow-lg hover:bg-blue-2/60 hover:scale-[1.02] transition-all duration-300">
          <div class="bg-blue-3 p-2 rounded-lg shadow-inner">
            <svg class="w-5 h-5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
              </path>
            </svg>
          </div>
          <span class="tracking-wide">Wake up refreshed</span>
        </div>
      </div>

      <div class="w-full flex flex-col gap-4">
        <router-link to="/login"
          class="w-full flex items-center justify-center bg-purple hover:bg-blue-4 text-blue-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(153,163,251,0.4)] active:scale-95">
          Log In
        </router-link>

        <router-link to="/signup"
          class="w-full flex items-center justify-center bg-blue-2/20 backdrop-blur-sm hover:bg-blue-2 text-purple py-4 rounded-xl font-bold text-lg transition-all duration-300 active:scale-95 border border-blue-4 hover:border-purple">
          Sign Up
        </router-link>
      </div>

      <div class="mt-8 text-center pt-4 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <p class="text-[10px] text-purple uppercase tracking-widest mb-1 font-semibold">Developed By</p>
        <p class="text-xs text-grey-1 leading-relaxed">
          Ellis, Khaled, Joshua, Favour, Abbie, Tomasz, Ace
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
@keyframes bounce {

  0%,
  100% {
    transform: translateY(-5%);
  }

  50% {
    transform: translateY(5%);
  }
}
</style>