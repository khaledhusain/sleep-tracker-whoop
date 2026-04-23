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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-15">
                        <path fill-rule="evenodd"
                            d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                            clip-rule="evenodd" />
                    </svg>
                    <div class="mx-5 font-extrabold text-2xl tracking-tight text-purple">
                        {{ user.first_name + " " + user.last_name }}
                    </div>
                </div>
                <!-- logout -->
                <button @click="logout"
                    class="bg-purple rounded-lg px-5 py-2.5 hover:bg-purple/90 text-sm font-semibold transition-colors">
                    Log out
                </button>
            </header>

            <div>{{ user.email }}</div>

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