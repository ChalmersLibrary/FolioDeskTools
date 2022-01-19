<template>
  <div class="user">
    <h2>Pin code reset</h2>
    <label for="barcode">Barcode</label>
    <input ref="barcode" v-model="barcode" type="text" v-on:keyup.enter="getUser" autofocus/>
    <button @click="getUser">Hämta</button>
    <div v-if="user">
      <div>
        Name: {{ user.personal.lastName }} {{ user.personal.firstName }}
        {{ user.personal.middleName }}
      </div>
      <div>Username: {{ user.username }}</div>
      <div>Barcode: {{ user.barcode }}</div>
      <div>Active: {{ user.active }}</div>
      <div>Email: {{ user.personal.email }}</div>
      <div>External system id: {{ user.externalSystemId }}</div>
      <div v-if="pinMessage == null">
        <label for="pin1">Pin</label>
        <input ref="pin1" type="password" v-model="pin1" />
        <span class="warning" v-if="pin1 != null && pin1.length != 6">
          Pin must be six digits.
        </span>
        <span class="warning" v-if="pin1 == user.username.substring(0, 6)">
          Birthday not allowed as pin.
        </span>
        <br />
        <label for="pin2">Pin again</label>
        <input
          ref="pin2"
          type="password"
          v-model="pin2"
          v-on:keyup.enter="changePin()"
        />
        <br />
        <button
          v-if="
            pin1 == pin2 &&
            pin1 !== null &&
            pin1.length == 6 &&
            pin1 != user.username.substring(0, 6)
          "
          @click="changePin()"
        >
          Change pin
        </button>
        <div v-else>Enter matching pin codes.</div>
      </div>
      <div v-else>
        <br />
        {{ pinMessage }} <br />
        <button ref="clear" @click="clear()">Clear</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'auth',
  data() {
    return {
      barcode: null,
      user: null,
      pin1: null,
      pin2: null,
      pinMessage: null
    };
  },
  methods: {
    async getUser() {
      try {
        const user = await this.$axios.$get(`/api/user/${this.barcode}`);
        this.user = user
        // let res = await fetch(`/api/user/${this.barcode}`);
        // this.user =  await res.json();        
      } catch (error) {
        console.log(error.message)
      }
    },
    async changePin() {
      let data = {
        username: this.user.username,
        password: this.pin1
      }
      try {
        await this.$axios.$post('/api/user/changepin', data)        
        // let res = await fetch('/api/user/changepin', options)
        this.pin1 = null
        this.pin2 = null
        this.pinMessage = 'Pin changed successfully'
      } catch (error) {
        console.log(error.message);
        this.pin1 = null
        this.pin2 = null
        this.pinMessage = 'Something went wrong'
      }
    },
    clear() {
      this.user = null
      this.pin1 = null
      this.pin2 = null
      this.pinMessage = null
    }
  },
};
</script>

<style></style>
