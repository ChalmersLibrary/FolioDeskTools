<template>
  <div class="content">
    <div class="noprint">
      <div class="buttons">
        <span class="btn bottom-margin" @click="getSlips()">Reload paging slips</span>
        Last updated: {{ updatedString }}
      </div>
      <div v-if="requests.length > 0" class="buttons">
        <span class="btn bottom-margin" :class="{active: lib == selectedLibrary}" v-for="lib in libs" :key="lib" @click="select(lib)">{{lib}}</span>
      </div>
    </div>

    <div v-if="finishedLoading && selectedLibrary != ''">
      <div class="noprint bottom-margin">
        <span class="btn" @click="print()">Print</span>
        <label for="separatePages">
          <input
            type="checkbox"
            name="separatePages"
            id="separatePages"
            v-model="separatePages"
          />
          Separate Pages
        </label>
      </div>
      <div class="request avoidPageBreak" v-for="request in requests.filter(request  => request.item.location.libraryName === this.selectedLibrary).sort((a,b) => {
            let location = a.item.location.name.localeCompare(b.item.location.name);
            let callNumber = (a.item.callNumber && b.item.callNumber) ? a.item.callNumber.localeCompare(b.item.callNumber) : -1;
            let suffix = (a.item.callNumberComponents.suffix && b.item.callNumberComponents.suffix) ? a.item.callNumberComponents.suffix.localeCompare(b.item.callNumberComponents.suffix) : -1; 
            return location || callNumber || suffix;
          }
        )" :key="request.id"
      >
        <div>
          <strong>Location:</strong>
          <span>{{ request.item.location.name }}</span>
          <span>{{ request.item.location.libraryName }}</span>
        </div>
        <div>
          <strong>Callnumber:</strong>
          <span>
            {{ request.item.callNumber }}
            {{request.item.callNumberComponents.suffix}}
          </span>
        </div>
        <div>
          <div class="authors">
            <strong>Author/s:</strong>
            <span
              v-for="author in request.instance.contributorNames"
              v-html="author.name" :key="author.name"
            >
            </span>
          </div>
          <strong>Title:</strong> <span>{{ request.instance.title }}</span>
        </div>
        <div>
          <strong>Barcode:</strong>
          <span>{{ request.item.barcode }}</span>
        </div>
        <div>
          <strong>Status:</strong>
          <span>{{ request.item.status }}</span>
        </div>
        <div>
          <strong>ServicePoint:</strong>
          <span>
            {{ request.pickupServicePoint.name }}
          </span>
        </div>
        <div>
          <strong>Requester:</strong>
          <span>
            {{ request.requester.lastName }} {{ request.requester.firstName }} {{ request.requester.middleName }} -- {{ request.requester.patronGroup.group}}
          </span>
        </div>
        <div v-if="separatePages" class="pagebreak"></div>
      </div>
    </div>
    <div v-else-if="selectedLibrary=='' && updated!=null && requests.length>0">Select a library above.</div>
    <div v-else-if="updated!=null">Nothing paged</div>
    <PageHelp />
  </div>
</template>

<script>
export default {
  middleware: 'auth',
  data() {
    return {
      requests: [],
      updated: null,
      finishedLoading: true,
      selectedLibrary: '',
      separatePages: false
    }
  },
  computed: {
    libs() {
      let libraries = [...new Set(this.requests.map(req => req.item.location.libraryName))]
      return libraries
    },
    updatedString() {
      if(this.updated == null ) {
        return 'Never updated'
      } else {
        let d = new Date(this.updated)
        return d.toLocaleTimeString()
      }
    }
  },
  methods: {
    select(lib) {
      this.selectedLibrary=lib
    },
    print() {
      window.print();
    },
    async getSlips() {
      this.updated = Date.now()
      this.finishedLoading = false
      let slips = await this.$axios.$get('/api/getPagingSlips')
      this.requests = slips.filter(request  => request.item.status !== 'Missing')
      this.finishedLoading = true
    }
  },
  mounted() {
    this.getSlips()
  }

}
</script>

<style scoped>
  .btn {
    border: 1px solid black;
    border-radius: 5px;
    padding: .2rem;
    margin-right: .5rem;
    margin-bottom: .5rem;
    cursor: pointer;
  }
  .bottom-margin {
    margin-bottom: 1rem;
  }
  .active {
    background: blue;
    color: white;
  }
  .request {
    margin-bottom: 1rem;
  }
  .authors span:not(:last-child):after {
    content: "; ";
  }
  .buttons {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .request {
    margin-top: 1em;
  }
  @media screen {
    header {
      position: fixed;
      background: white;
      display: block;
      width: 100vw;
    }
    /* .content {
      padding-top: 2em;
    } */
    .warning {
      color: red;
    }
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