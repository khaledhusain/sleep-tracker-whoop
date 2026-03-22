<template>
    <div>
        <!-- title and icon -->
        <div class="w-full flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-8">
                <path fill-rule="evenodd"
                    d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
                    clip-rule="evenodd" />
            </svg>
            <h1 class="text-2xl font-bold">Welcome back</h1>
            <h2 class="mb-5">Sign in to continue tracking your sleep</h2>
        </div>

        <!-- form -->
        <form @submit.prevent="handleSubmit" class="flex flex-col items-center">
            <div>
                <input
                    class="block bg-grey-3 rounded w-70 p-1.5 placeholder-blue-4 focus:ring-2 focus:ring-blue-4 focus:outline-none text-blue-3"
                    v-model="email" placeholder="Email">
                <div v-show="submitted && !email">Email is required</div>
            </div>

            <br />

            <div>
                <input
                    class="block bg-grey-3 rounded w-70 p-1.5 placeholder-blue-4 focus:ring-2 focus:ring-blue-4 focus:outline-none text-blue-3"
                    v-model="password" placeholder="Password">
                <div v-show="submitted && !password">Password is required</div>
            </div>


            <router-link to="/signup" class="hover:text-purple mt-3">
                Don't have an account? Sign up
            </router-link>

            <button class="bg-blue-4 rounded w-25 py-1 hover:bg-purple my-3" type="submit">
                Login
            </button>

            <!-- error msgs -->
            <div v-if="error">{{ error }}</div>

        </form>
    </div>

</template>

<script>
import EmailValidator from 'email-validator';
import { userService } from '@/services/user.service';

export default {
    data() {
        return {
            email: "",
            password: "",
            submitted: false,
            error: ""
        }
    },
    methods: {
        handleSubmit() {
            this.submitted = true;
            this.error = "";

            const { email, password } = this;

            if (!(email && password)) {
                return;
            }

            if (!(EmailValidator.validate(email))) {
                this.error = "Email must be valid";
                return;
            }

            userService.login(email, password)
                .then(() => {
                    this.submitted = false;
                    this.error = "";
                    //localStorage.setItem("successMsg", "Login successful!");
                    this.$router.push("/");
                })
                .catch(error => {
                    this.error = error;
                    this.submitted = false;
                })
        }
    }
}

</script>