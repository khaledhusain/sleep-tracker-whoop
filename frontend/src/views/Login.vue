<template>
    <div>
        <!-- form -->
        <form @submit.prevent="handleSubmit" class="flex flex-col items-center">
            <!-- title -->
            <h2 class="text-2xl font-bold mb-5">Sign in </h2>

            <div>
                <input class="block bg-grey-3 rounded w-70 p-1.5 placeholder-blue-4 focus:ring-2 focus:ring-blue-4 focus:outline-none text-blue-3"
                    v-model="email" placeholder="Email">
                <div v-show="submitted && !email">Email is required</div>
            </div>

            <br />

            <div>
                <input class="block bg-grey-3 rounded w-70 p-1.5 placeholder-blue-4 focus:ring-2 focus:ring-blue-4 focus:outline-none text-blue-3"
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
        }
    }
}

</script>