<template>
  <div class="min-h-screen bg-blue-1 text-white relative overflow-hidden flex flex-col items-center justify-center font-Montserrat">
    
    <div class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-4 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
    
    <div class="w-full max-w-md h-full min-h-screen flex flex-col justify-between p-8 z-10">
      
      <div class="flex flex-col items-center mt-12">
        <div class="relative w-24 h-24 mb-6 flex items-center justify-center rounded-full shadow-[0_0_40px_rgba(153,163,251,0.2)] border border-blue-4/30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-white" aria-hidden="true">
           <path fill-rule="evenodd"
           d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
           clip-rule="evenodd" />
          </svg>
        </div>
        
        <h1 class="text-3xl font-extrabold tracking-tight text-center text-purple">
          Restful Sleep Tracker
        </h1>
        <p class="text-grey-1 mt-3 text-center text-sm font-medium">
          Understand your rest.
        </p>
      </div>

      <div class="flex flex-col gap-4 my-8 text-grey-2 text-sm font-medium w-full px-6">
        <div class="flex items-center gap-4 bg-blue-2/30 p-3 rounded-lg border border-blue-4/20">
          <svg class="w-6 h-6 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <span>Track sleep cycles</span>
        </div>
        <div class="flex items-center gap-4 bg-blue-2/30 p-3 rounded-lg border border-blue-4/20">
          <svg class="w-6 h-6 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <span>Analyse sleep trends</span>
        </div>
        <div class="flex items-center gap-4 bg-blue-2/30 p-3 rounded-lg border border-blue-4/20">
          <svg class="w-6 h-6 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span>Wake up refreshed</span>
        </div>
      </div>

      <div class="w-full flex flex-col gap-4 mb-6">
        <router-link to="/login" class="w-full flex items-center justify-center bg-purple hover:bg-blue-4 text-blue-1 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(153,163,251,0.3)]">
          Log In
        </router-link>
        
        <router-link to="/signup" class="w-full flex items-center justify-center bg-transparent hover:bg-blue-2 text-purple py-4 rounded-xl font-bold text-lg transition-all active:scale-95 border-2 border-blue-4 hover:border-purple">
          Sign Up
        </router-link>

        <div class="mt-8 text-center border-t border-blue-3 pt-6">
          <p class="text-[10px] text-grey-2 uppercase tracking-widest mb-2 font-semibold">Developed By</p>
          <p class="text-xs text-grey-1 leading-relaxed">
            Ellis Ollier, Khaled Husain, Joshua Roberts, Favour Omoregie, Abbie Roberts, Tomasz Walesiuk, Ace Blakeburn
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
</script>