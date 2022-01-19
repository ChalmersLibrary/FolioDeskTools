<template>
  <div>
    <form @submit.prevent="userLogin">
      <div>
        <label for="username">Username</label>
        <input id="username" type="text" v-model="login.username">
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" type="password" v-model="login.password">
      </div>
      <div>
        <button type="submit">Login</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      login: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async userLogin() {
      try {
        let response = await this.$auth.loginWith('local', { data: this.login })
        if(response.status == 200) {
          // this.$router.push('/')
          window.location='/'
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  }

}
</script>

<style>

</style>