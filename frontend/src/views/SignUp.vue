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
                        v-model="FirstName" placeholder="First name">
                    <div v-show="submitted && !FirstName">First name is required</div>
                </div>
                <div>
                    <input
                        class="block bg-grey-3 rounded p-1.5 placeholder-blue-4 focus:ring-2 focus:ring-blue-4 focus:outline-none text-blue-3"
                        v-model="LastName" placeholder="Last name">
                    <div v-show="submitted && !LastName">Last name is required</div>
                </div>
            </div>

            <br />

            <div>
                <input
                    class="block bg-grey-3 rounded w-101 p-1.5 placeholder-blue-4 focus:ring-2 focus:ring-blue-4 focus:outline-none text-blue-3"
                    v-model="Email" placeholder="Email">
                <div v-show="submitted && !Email">Email is required</div>
            </div>

            <br />

            <div>
                <input
                    class="block bg-grey-3 rounded w-101 p-1.5 placeholder-blue-4 focus:ring-2 focus:ring-blue-4 focus:outline-none text-blue-3"
                    v-model="Password" placeholder="Password">
                <div v-show="submitted && !Password">Password is required</div>
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
import EmailValidator from 'email-validator';

export default {
    data() {
        return {
            FirstName: "",
            LastName: "",
            Email: "",
            Password: "",
            submitted: false,
            error: ""
        }
    },
    methods: {
        handleSubmit() {
            this.submitted = true;
            this.error = "";

            const {FirstName, LastName, Email, Password } = this;

            if (!(FirstName && LastName && Email && Password)) {
                return;
            }

            if (!(EmailValidator.validate(Email))) {
                this.error = "Email must be valid";
                return;
            }
        }
    }
}

</script>