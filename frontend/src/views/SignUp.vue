<template>
    <div>
        <!-- title and icon -->
        <div class="w-full flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-8">
                <path fill-rule="evenodd"
                    d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
                    clip-rule="evenodd" />
            </svg>
            <h1 class="text-2xl font-bold mb-5">Sign up</h1>
        </div>

        <!-- form -->
        <form @submit.prevent="handleSubmit" class="flex flex-col items-center">

            <div class="flex flex-row gap-6">
                <div>
                    <input
                        class="block bg-grey-3 rounded p-1.5 placeholder-blue-4 focus:ring-2 focus:ring-blue-4 focus:outline-none text-blue-3"
                        v-model="firstName" placeholder="First name">
                    <div v-show="submitted && !firstName">First name is required</div>
                </div>
                <div>
                    <input
                        class="block bg-grey-3 rounded p-1.5 placeholder-blue-4 focus:ring-2 focus:ring-blue-4 focus:outline-none text-blue-3"
                        v-model="lastName" placeholder="Last name">
                    <div v-show="submitted && !lastName">Last name is required</div>
                </div>
            </div>

            <br />

            <div>
                <input
                    class="block bg-grey-3 rounded w-101 p-1.5 placeholder-blue-4 focus:ring-2 focus:ring-blue-4 focus:outline-none text-blue-3"
                    v-model="email" placeholder="Email">
                <div v-show="submitted && !email">Email is required</div>
            </div>

            <br />

            <div>
                <input
                    class="block bg-grey-3 rounded w-101 p-1.5 placeholder-blue-4 focus:ring-2 focus:ring-blue-4 focus:outline-none text-blue-3"
                    v-model="password" placeholder="Password">
                <div v-show="submitted && !password">Password is required</div>
            </div>

            <router-link to="/login" class="hover:text-purple mt-3">
                Already have an account? Log in
            </router-link>

            <button class="bg-blue-4 rounded w-25 py-1 hover:bg-purple my-3" type="submit">
                Sign up
            </button>

            <!-- error msgs -->
            <div v-if="error">{{ error }}</div>


        </form>
    </div>

</template>

<script>
import emailValidator from 'email-validator';
import { userService } from '@/services/user.service';

export default {
    data() {
        return {
            firstName: "",
            lastName: "",
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

            const { firstName, lastName, email, password } = this;

            if (!(firstName && lastName && email && password)) {
                return;
            }

            if (!(emailValidator.validate(email))) {
                this.error = "Email must be valid";
                return;
            }

            const passPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/
            if (!(passPattern.test(password))) {
                this.error = "Password is not strong enough";
                return;
            }

            userService.signUp(firstName, lastName, email, password)
                .then(() => {
                    //localStorage.setItem("successMsg", "Account created successfully");
                    //this.$router.push("/login");
                    this.error = "";
                })
                .catch(error => {
                    this.error = error;
                    this.submitted = false;
                })
        }
    }
}

</script>