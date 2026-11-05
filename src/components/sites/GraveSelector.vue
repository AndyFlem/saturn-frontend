<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-row>
      <v-col cols="6" md="2" class="pt-0 pb-0">
        <v-select
          :items="blocks"
          item-text="block_ref"
          item-value="block_ref"
          class="mr-3"
          v-model="block_ref"
          @change="blockChange"
          label="Block"
        ></v-select>
      </v-col>
      <v-col cols="6" md="2" class="pt-0 pb-0">
        <v-select
          :disabled="rows.length==0"
          :items="rows"
          class="mr-3"
          v-model="row_no"
          @change="rowChange"
          label="Row"
        ></v-select>
      </v-col>
      <v-col cols="11" md="8" class="pt-0 pb-0">
        <v-select
          :items="sites"
          :item-text="siteLabel"
          :item-value="siteValue"
          :item-disabled="siteDisabled"
          class="mr-3"
          :disabled="sites.length==0"
          return-object
          @change="siteChange"
          v-model="site"
          label="Site"
        ></v-select>
      </v-col>
      <v-col v-if="!noGrave" cols="10" md="8" class="pt-0 pb-0">
        <v-select
          :items="graves"
          :item-text="graveLabel"
          :item-value="graveValue"
          :item-disabled="graveDisabled"
          :disabled="graves.length==0"
          @change="graveChange"
          v-model="grave_no"
          label="Grave"
        ></v-select>
      </v-col>
      <v-col cols="2" md="4">
        <div v-for="message in errorMessages" class="error--text" :key="message">{{message}}</div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
// Used in tBurial for moving a burial and in tBurialForm for a legacy burial
export default {
  name: 'GraveSelector',
  props: {
    customerId: Number,
    currentSiteId: Number,
    currentGraveNo: Number,
    value: Number, // site_id selected,
    errorMessages: Array,
    noGrave: Boolean
  },
  data () {
    return {
      error: null,
      blocks: [],
      rows: [],
      sites: [],
      graves: [],
      site_id: null,
      site: null,
      block_ref: null,
      row_no: null,
      grave_no: null
    }
  },
  mounted () {
    this.secureGet('/api/v1/blocks')
      .then((res) => {
        this.blocks = res.data
        if (this.currentSiteId) {
          this.site_id = this.currentSiteId
          this.grave_no = this.currentGraveNo
          this.getSite()
            .then(() => {
              this.site_no = this.site.site_no
              this.block_ref = this.site.block_ref
              return this.getRows()
            })
            .then(() => {
              this.row_no = this.site.row_no
              return this.getSites()
            })
        }
      })
  },
  methods: {
    getRows () {
      return this.secureGet('/api/v1/blocks/' + this.block_ref + '/rows')
        .then(response => { this.rows = response.data })
        .catch((error) => { this.error = error })
    },
    getSites () {
      return this.secureGet('/api/v1/blocks/' + this.block_ref + '/rows/' + this.row_no)
        .then(response => { this.sites = response.data })
        .catch(error => { this.error = error })
    },
    getSite () {
      return this.secureGet('/api/v1/sites/' + this.site_id)
        .then(response => {
          this.site = response.data
          return this.secureGet('/api/v1/sites/' + this.site_id + '/burials')
        })
        .then(res => {
          this.site.burials = {}
          res.data.forEach(bur => {
            this.site.burials[bur.grave_no] = bur
          })
          this.getGraves()
        })
        .catch(error => { this.error = error })
    },
    getGraves () {
      for (let i = 0; i < this.site.graves; i++) {
        if (this.site.burials[i + 1]) {
          this.$set(this.graves, i, this.site.burials[i + 1])
        } else {
          this.$set(this.graves, i, {grave_no: i + 1})
        }
      }
    },
    blockChange () {
      this.graves = []
      this.sites = []
      this.rows = []
      this.site_id = null
      this.row_no = null
      this.site = null
      this.grave_no = null
      this.$emit('selected', null)
      this.getRows()
    },
    rowChange () {
      this.graves = []
      this.sites = []
      this.site_id = null
      this.site = null
      this.grave_no = null
      this.$emit('selected', null)
      this.getSites()
    },
    siteChange (site) {
      this.site_id = site.site_id
      if (!this.noGrave) {
        this.graves = []
        this.grave_no = null
        this.$emit('selected', null)
        return this.getSite()
      } else {
        this.$emit('selected', {site_id: this.site.site_id})
      }
    },
    graveChange () {
      this.$emit('selected', {site_id: this.site.site_id, grave_no: this.grave_no})
    },
    siteLabel (site) {
      return site.site_no + ' - ' + site.site_type + ' - ' + site.site_status + ((site.sale_customer_id === this.customerId) ? ' - This Customer' : (site.sale_customer_id ? ' - ' + site.sale_customer_name : ''))
    },
    siteValue (site) {
      return site.site_no
    },
    siteDisabled (site) {
      if (site.site_id === this.site_id) return true
      if (site.customer_id === this.customerId) {
        if (site.burial_count < site.graves) { return false } else { return true }
      } else {
        if (site.site_status_ref === 'AVAIL') { return false } else { return true }
      }
    },
    graveLabel (grave) {
      if (grave.burial_status_ref) {
        return 'Grave no ' + grave.grave_no + ': ' + grave.deceased_salutation + ' ' + (grave.deceased_first_name ? grave.deceased_first_name + ' ' : '') + (grave.deceased_middle_name ? grave.deceased_middle_name + ' ' : '') + grave.deceased_last_name
      } else {
        return 'Grave no ' + grave.grave_no
      }
    },
    graveValue (grave) {
      return grave.grave_no
    },
    graveDisabled (grave) {
      if (grave.burial_status_ref) { return true } // Already has a burial
      if (grave.grave_no === this.currentGraveNo && grave.site_id === this.currentSiteId) { return true } // Current grave
      return false
    }
  }
}
</script>

<style scoped>
</style>
