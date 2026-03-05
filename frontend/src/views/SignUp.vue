<template>
    <div>
        <!-- form -->
        <form @submit.prevent="handleSubmit" class="flex flex-col items-center">
            <!-- title -->
            <h2 class="text-2xl font-bold mb-5">Sign up</h2>

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