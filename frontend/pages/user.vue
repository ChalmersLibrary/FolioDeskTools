<template>
  <div class="user">
    <h2>PIN code reset</h2>
    <label for="barcode">Barcode</label>
    <input ref="barcode" v-model="barcode" autocomplete="off" type="text" v-on:keyup.enter="getUser" autofocus/>
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
      <div v-if="user.pwdReset && user.active == true">
        <label for="pin1">Pin</label>
        <input ref="pin1" type="password" autocomplete="off" v-model="pin1" />
        <span class="warning" v-if="pin1 != null && pin1.length != 6">
          Pin must be six digits.
        </span>
        <span class="warning" v-if="pin1 == user.username.substring(0, 6)">
          Birthday not allowed as pin.
        </span>
        <br />
        <label for="pin2">Pin again</label>
        <input ref="pin2" type="password" v-model="pin2" autocomplete="off" v-on:keyup.enter="changePin()" />
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
      <br />
      <div class="pinMessageOk" v-if="pinMessageOk">{{ pinMessageOk }}</div>
      <div class="pinMessage" v-if="pinMessage">
        {{ pinMessage }}
      </div>
      <button ref="clear" @click="clear()">Clear</button>
    </div>
    <div v-else-if="searched">
      User not found.
    </div>
    <PinHelp />
  </div>
</template>

<script>
import PinHelp from "~/components/PinHelp.vue";
export default {
    middleware: "auth",
    data() {
        return {
            barcode: null,
            user: null,
            pin1: null,
            pin2: null,
            pinMessage: null,
            searched: false
        };
    },
    methods: {
        async getUser() {
          this.pinMessage = null
          this.searched = true
          try {
              const user = await this.$axios.$get(`/api/user/${this.barcode}`);
              this.user = user;
              if(user.pwdReset == false) {
                this.pinMessage = "Pin reset not allowed"
              }
              if(user.active != true) {
                this.pinMessage = "User not active"
              }
          }
          catch (error) {
              this.user = null
              console.log(error.message);
          }
        },
        async changePin() {
          if(this.pin1 == this.pin2) {
            let data = {
                username: this.user.username,
                password: this.pin1
            };
            try {
                await this.$axios.$post("/api/user/changepin", data);
                this.pin1 = null;
                this.pin2 = null;
                this.pinMessageOk = "Pin changed successfully";
                this.pinMessage="";
            }
            catch (error) {
                console.log(error.message);
                this.pin1 = null;
                this.pin2 = null;
                this.pinMessage = "Something went wrong";
            }
          } else {
            this.pinMessage = "Pin codes don't match!"
            this.pinMessageOk = ""
          }
        },
        clear() {
            this.barcode = null;
            this.user = null;
            this.pin1 = null;
            this.pin2 = null;
            this.pinMessage = null;
            this.searched = false;
        }
    },
    components: { PinHelp }
};
</script>

<style>
  ::-ms-reveal {
    display: none;
  }
  .pinMessage {
    color: red;
  }
  .pinMessageOk {
    color: green;
  }
</style>
