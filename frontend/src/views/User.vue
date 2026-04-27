<template>
    <div>
        <!-- loading -->
        <p v-if="loading">Loading profile…</p>

        <!-- error -->
        <div v-if="error"
            class="text-sm p-2 my-2 bg-blue-4 text-white border-2 border-white rounded sm:text-base flex justify-center">
            {{ error }}
        </div>

        <div class="flex mx-auto w-2/3 flex-col min-h-[12rem]">

            <header class="flex justify-between items-center mt-6 mb-5 flex-wrap gap-4">
                <!-- profile details -->
                <div v-if="user" class="flex items-center">
                    <div class="bg-blue-3/80 p-2 rounded-full shadow-md border border-blue-4/30">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                            class="size-15 text-grey-1">
                            <path fill-rule="evenodd"
                                d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <div class="mx-4 font-extrabold text-2xl tracking-tight text-purple">
                            {{ user.first_name + " " + user.last_name }}
                        </div>
                        <div class="mx-4">{{ user.email }}</div>
                    </div>
                </div>

                <!-- logout -->
                <button @click="logout"
                    class="bg-purple rounded-lg px-5 py-2.5 hover:bg-purple/90 text-sm font-semibold transition-colors">
                    Log out
                </button>
            </header>

            <!-- Account Details Card -->
            <section
                class="rounded-2xl border border-blue-4/30 bg-blue-2/40 p-6 shadow-[0_4px_30px_rgba(3,23,77,0.35)] my-3">
                <h2 class="text-lg font-bold text-purple mb-4">Account Details</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs text-grey-1 uppercase tracking-wide mb-1">First Name</p>
                        <p class="font-semibold">{{ user.first_name }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-grey-1 uppercase tracking-wide mb-1">Last Name</p>
                        <p class="font-semibold">{{ user.last_name }}</p>
                    </div>
                    <div class="sm:col-span-2">
                        <p class="text-xs text-grey-1 uppercase tracking-wide mb-1">Email Address</p>
                        <p class="font-semibold">{{ user.email }}</p>
                    </div>
                </div>
            </section>


            <!-- GDPR / Privacy Notice Card -->
            <section
                class="rounded-2xl border border-blue-4/30 bg-blue-2/40 p-6 shadow-[0_4px_30px_rgba(3,23,77,0.35)] my-3">
                <h2 class="text-lg font-bold text-purple mb-3">Your Data &amp; Privacy</h2>
                <p class="text-sm text-grey-2 mb-3">
                    We collect and process your personal data — including your name, email address, and sleep data
                    retrieved via the Whoop API — with the sole purpose of providing you insights into your sleep
                    through our Sleep Tracker service. Your data
                    is stored securely and will never be shared or sold to any third parties.
                </p>
                <p class="text-sm text-grey-2 mb-3">
                    Under the UK General Data Protection Regulation (UK GDPR), you have the right to access,
                    change, or erase your personal data at any time.
                </p>

            </section>

        </div>
    </div>
</template>

<script>
import { userService } from '@/services/user.service';

export default {

    data() {
        return {
            user: "",
            error: "",
            loading: false

        }
    },
    methods: {
        getUserInfo() {
            this.error = "";
            this.loading = true;

            userService.getInfo()
                .then((user) => {
                    this.user = user;
                    this.error = "";
                    this.loading = false;
                })
                .catch(error => {
                    this.error = error;
                    this.loading = false;
                })
        },
        logout() {
            userService.logout()
                .then(() => {
                    localStorage.setItem("msgs", "Logout successful!");
                    this.$router.push('/');
                })

                .catch(err => {
                    if (err === "Missing session token!") {
                        localStorage.setItem("msgs", "You were already logged out");
                    } else {
                        //gen error
                        localStorage.setItem("msgs", err || "Logout failed");
                    }
                    this.$router.push('/');
                });
        },
    },
    mounted() {
        this.getUserInfo();
    },
}

</script>