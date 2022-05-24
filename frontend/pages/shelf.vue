<template>
  <div class="shelf">
    <div class="servicePoints noprint">
      <span class="btn" :class="{active: library.id == selectedLibrary}" @click="libSelect(library.id)" v-for="library in libraries" :key="library.id"> {{library.name}} </span>
    </div>
    <div v-if="finishedLoading">
      <div class="buttons">
        <span class="btn bottom-margin" @click="getShelfList()">Reload shelf clearance</span>
        Last updated: {{ updatedString }}
      </div>
      <div v-if="shelfList.length > 0">
        <div class="noprint buttons">
          <span class="btn" @click="print()">Print</span>
        </div>
        <div class="shelfList" v-for="request in sortedShelfList" :key="request.id">
          <strong>Patron name:</strong>
          {{ request.requester.lastName }}, {{ request.requester.firstName
          }}<br />
          <strong>Title:</strong> {{ request.item.title }} ({{
          request.item.barcode }})<br />
          <!-- Exemplar kod: {{ request.item.barcode }}<br /> -->
          <strong>CallNumber:</strong> {{ request.item.callNumber }}
          {{request.item.callNumberComponents.suffix}}<br />
          <strong>Request status:</strong> {{ request.status }} <br />
          <strong>HoldshelfExpiration:</strong>
          {{ request.holdShelfExpirationDate.substring(0, 10) }}
          <br />
        </div>
      </div>
      <div class="shelfList" v-else>
        Nothing to remove from shelf.
      </div>
      <ShelfHelp />
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'auth',
  data() {
    return {
      libraries: null,
      updated: null,
      shelfList: [],
      shelfTotal: null,
      finishedLoading: false,
      selectedLibrary: null
    }
  },
  methods: {
    print() {
      window.print()
    },
    async getShelfList() {
      this.finishedLoading = false;
      this.updated = Date.now()
      this.shelfList = null;
      let shelfList = await this.$axios.$get(`/api/getShelfList/${this.selectedLibrary}`)
      this.shelfList = shelfList.requests;
      this.shelfTotal = shelfList.totalRecords;
      this.finishedLoading = true;
    },
    async getServicePoints() {
      let libraries = await this.$axios.$get('/api/getServicePoints')
      this.libraries = libraries
    },
    libSelect(id) {
      this.selectedLibrary = id;
      this.getShelfList();
    }
  },
  mounted() {
    this.getServicePoints()
  },
  computed: {
    updatedString() {
      if(this.updated == null ) {
        return 'Ej laddat'
      } else {
        let d = new Date(this.updated)
        return d.toLocaleTimeString()
      }
    },
    sortedShelfList() {
      return this.shelfList.sort((a, b) => {
        if (a.requester.lastName < b.requester.lastName) {
          return -1
        }
        if (a.requester.lastName > b.requester.lastName) {
          return 1
        }
        return 0
      })
    }
  }
}
</script>

<style scoped>
  .btn {
    border: 1px solid black;
    border-radius: 5px;
    padding: .2rem;
    margin: .2rem;
    cursor: pointer;
    display: inline-block;
  }

  .shelfList {
    margin-bottom: 1rem;
  }

  .active {
    background: blue;
    color: white;
  }
  .servicePoints {
    display: flex;
  }
  .buttons {
    margin-bottom: 1rem;
  }
  @media print {
    .noprint {
      display: none;
    }
    .avoidPageBreak {
      page-break-inside: avoid;
    }
    .pagebreak {
      page-break-after: always;
    }
  }
</style>