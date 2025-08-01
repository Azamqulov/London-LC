<template>
  <v-app :class="themeClass" style="height: 100vh; scrollbar-width: 5px">
    <!-- Sidebar -->
    <v-navigation-drawer app v-model="sidebarVisible">
      <v-list>
        <v-list-item>
          <v-list-item-content class="rounded m-auto text-center">
            <router-link to="/">
              <v-img src="../assets/images/logo.png" alt="Smart Academy Logo" max-width="200" class="mx-auto"
                transition="scale-transition"></v-img>
            </router-link>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="mt-20"></v-divider>
        <v-list-item class="mt-4 mx-3" v-for="item in menuItems" :key="item.title" :to="item.link" link>
          <v-list-item-icon class="d-flex gap-2 text-2xl">
            <v-icon class="mr-2">{{ item.icon }}</v-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-icon>
        </v-list-item>
      </v-list>
      <v-btn @click="logout" class="w-full bg-red-700 mx-3"
        style="position: absolute; bottom: 10px; background: red; width: 90%">
        <v-icon color="white">mdi-logout</v-icon>
      </v-btn>
      <v-btn icon @click="toggleSidebar" class="h-8 w-5 rounded" style="
          position: absolute;
          top: 8.5%;
          right: -36px;
          z-index: 10;
          width: 35px;
        ">
        <v-icon>{{
          sidebarVisible ? "mdi-chevron-left" : "mdi-chevron-right"
        }}</v-icon>
      </v-btn>
    </v-navigation-drawer>

    <!-- Navbar -->

    <v-app-bar app>
      <v-btn @click="toggleTheme">
        <v-icon>{{
          currentTheme === "dark"
            ? "mdi-white-balance-sunny"
            : "mdi-moon-waning-crescent"
        }}</v-icon>
      </v-btn>

      <!-- Profile Section -->
      <v-spacer></v-spacer>
      <v-avatar color="blue" class="rounded-full mr-4">
        <router-link to="/admin/admin">
          <v-btn text color="surface">{{ profileInitial }}</v-btn>
        </router-link>
      </v-avatar>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="overflow-y-scroll" style="height: 100vh">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      sidebarVisible: true, // Sidebar boshlang‘ich holati
      menuItems: [
        { title: "Home", icon: "mdi-home", link: "/admin/home" },
        {
          title: "Teacher",
          icon: "mdi-account",
          link: "/admin/teacher",
        },
        {
          title: "Student",
          icon: "mdi-account-circle",
          link: "/admin/student",
        },
        {
          title: "Payment",
          icon: "mdi-credit-card",
          link: "/admin/payment",
        },
        // { title: "Dasboard", icon: "mdi-view", link: "/admin/dashboard" },
        {
          title: "Dasboard",
          icon: "mdi-widgets",
          link: "/admin/admin",
        },
      ],
      currentUser: localStorage.getItem("teacherName"), // Get Teacher Name from localStorage
      profileImage: "../assets/images/profile-placeholder.jpg", // Profile image path
      currentTheme: localStorage.getItem("theme") || "light", // Default
    };
  },
  computed: {
    // First letter of the user's name
    profileInitial() {
      return this.currentUser.charAt(0).toUpperCase();
    },
  },
  methods: {
    toggleTheme() {
      const newTheme = this.currentTheme === "dark" ? "light" : "dark"; // Yangi tema tanlash
      this.currentTheme = newTheme; // Tema holatini yangilash
      localStorage.setItem("theme", newTheme); // Yangi tema holatini localStorage'ga saqlash

      // Vuetify'ni yangilash
      this.$vuetify.theme.global.name = newTheme; // Vuetify'ning global tema nomini yangilash
    },
    logout() {
      localStorage.removeItem("userRole");
      this.$router.push("/"); // Logout qilganda Login sahifasiga o'tish
    },
    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible; // Sidebarni holatini almashtirish
    },
  },
  mounted() {
    // Saqlangan tema holatini olish
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      this.currentTheme = savedTheme;
      this.$vuetify.theme.dark = savedTheme === "dark"; // Vuetify-ning theme.dark holatini yangilash
    }
  },
};
</script>

<style>
.dark-mode {
  background-color: #203b37;
  /* Dark background */
  color: #ffffff;
  /* Light text color */
}

.light-mode {
  background-color: #ffffff;
  /* Light background */
  color: #000000;
  /* Dark text color */
}

.v-btn {
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar {
  background-color: gray;
  width: 3px;
}

::-webkit-scrollbar-thumb {
  background: #111827;
}

.v-avatar img {
  width: 40px;
  height: 40px;
  object-fit: cover;
}
</style>
