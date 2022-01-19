<template>
  <div class="menu noprint">
    <NuxtLink class="menu-btn" to="/">Start</NuxtLink>
    <span v-if="this.$auth.loggedIn">
      <NuxtLink class="menu-btn" to="/user">Pin reset</NuxtLink>
      <NuxtLink class="menu-btn" to="/page">Paging slips</NuxtLink>
      <NuxtLink class="menu-btn" to="/shelf">Shelf clearance</NuxtLink>
      <span class="menu-btn" @click="logout">Logout</span>
    </span>
    <span v-else>
      <NuxtLink class="menu-btn" to="/login">Login</NuxtLink>
    </span>
  </div>
</template>

<style scoped>
.menu {
  margin-bottom: 1em;
}
.menu-btn {
  padding: .2rem;
  border: 1px solid;
  border-radius: 7px;
  text-decoration: none;
  cursor: pointer;
}
</style>

<script>
export default {
  methods: {
    logout() {
      this.$auth.strategy.token.reset()
      window.location = '/'
    }
  }
}
</script>