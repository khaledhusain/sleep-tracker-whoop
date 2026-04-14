<template>
  <div class="relative w-full h-full min-h-[85vh] flex flex-col items-center justify-center font-Montserrat text-white">
    
    <div class="bg-blue-2/40 backdrop-blur-md p-8 rounded-2xl border border-blue-4/20 shadow-[0_4px_30px_rgba(3,23,77,0.5)] w-full max-w-md flex flex-col items-center z-10">
      
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-purple mb-4">
          <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clip-rule="evenodd" />
      </svg>
      <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple to-white mb-6">Create Account</h1>

      <form @submit.prevent="handleSubmit" class="flex flex-col w-full gap-4">
        
        <div class="flex flex-row gap-4 w-full">
            <div class="w-1/2">
                <input class="w-full bg-blue-3/50 border border-blue-4/30 rounded-xl p-3 placeholder-grey-1 focus:ring-2 focus:ring-purple focus:outline-none text-white transition-all" v-model="firstName" placeholder="First name">
                <div v-show="submitted && !firstName" class="text-yellow text-xs mt-1 ml-1">Required</div>
            </div>
            <div class="w-1/2">
                <input class="w-full bg-blue-3/50 border border-blue-4/30 rounded-xl p-3 placeholder-grey-1 focus:ring-2 focus:ring-purple focus:outline-none text-white transition-all" v-model="lastName" placeholder="Last name">
                <div v-show="submitted && !lastName" class="text-yellow text-xs mt-1 ml-1">Required</div>
            </div>
        </div>

        <div class="w-full">
            <input class="w-full bg-blue-3/50 border border-blue-4/30 rounded-xl p-3 placeholder-grey-1 focus:ring-2 focus:ring-purple focus:outline-none text-white transition-all" v-model="email" placeholder="Email" type="email">
            <div v-show="submitted && !email" class="text-yellow text-xs mt-1 ml-1">Email is required</div>
        </div>

        <div class="w-full">
            <input class="w-full bg-blue-3/50 border border-blue-4/30 rounded-xl p-3 placeholder-grey-1 focus:ring-2 focus:ring-purple focus:outline-none text-white transition-all" v-model="password" placeholder="Password" type="password">
            <div v-show="submitted && !password" class="text-yellow text-xs mt-1 ml-1">Password is required</div>
        </div>

        <div v-if="error" class="text-[#f87171] text-sm text-center bg-blue-3/30 p-2 rounded-lg border border-[#f87171]/30">{{ error }}</div>

        <button class="w-full bg-purple hover:bg-blue-4 text-blue-1 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(153,163,251,0.4)] mt-2 active:scale-95" type="submit">
            Sign Up
        </button>

        <div class="text-center mt-3">
          <router-link to="/login" class="text-sm text-grey-1 hover:text-purple transition-colors">
              Already have an account? Log in
          </router-link>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import emailValidator from 'email-validator';
import { userService } from '@/services/user.service';

export default {
    data() { return { firstName: "", lastName: "", email: "", password: "", submitted: false, error: "" } },
    methods: {
        handleSubmit() {
            this.submitted = true;
            this.error = "";
            const { firstName, lastName, email, password } = this;

            if (!(firstName && lastName && email && password)) return;

            if (!(emailValidator.validate(email))) {
                this.error = "Email must be valid";
                return;
            }

            const passPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@.#&+])[a-zA-Z0-9!@.#&+]{8,16}$/
            if (!(passPattern.test(password))) {
                this.error = "Password must be 8-16 chars containing an uppercase, lowercase, number, and special char";
                return;
            }

            userService.signUp(firstName, lastName, email, password)
                .then(() => {
                    this.error = "";
                    this.$router.push("/login");
                })
                .catch(error => {
                    this.error = error;
                    this.submitted = false;
                })
        }
    }
}
</script>