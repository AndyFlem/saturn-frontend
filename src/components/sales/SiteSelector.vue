<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-row>
      <v-col cols="12" sm="6" md="3" class="pt-2 pb-0">
        <v-select
          :items="blocks"
          item-text="block_ref"
          item-value="block_ref"
          v-model="block"
          return-object
          @change="newBlockChange"
          label="Block"
          dense
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="pt-2 pb-0">
        <v-select
          :disabled="rows.length==0"
          :items="rows"
          :item-text="rowLabel"
          :item-value="rowValue"
          v-model="row"
          return-object
          @change="newRowChange"
          label="Row"
          dense
        ></v-select>
      </v-col>
      <v-col cols="12" sm="12" md="5" class="pt-2 pb-0 d-flex">
        <v-select
          :items="sites"
          :item-text="siteLabel"
          :item-value="siteValue"
          :item-disabled="siteDisabled"
          :disabled="sites.length==0"
          return-object
          v-model="site"
          label="Site"
          dense
        ></v-select>
        <v-btn
          color="primary"
          class="mt-2"
          icon
          :disabled="!site"
          v-on:click="doSelect"
        >
          <v-icon>mdi-plus-circle</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>

// Used in SiteTypeSelect (select site during sale drafting), SaleSite (set site for sale site added to sale without site) and SaleSite (move preneed site)
export default {
  name: 'SiteSelector',
  props: ['value', 'siteTypeId'],
  components: {
  },
  data () {
    return {
      error: null,
      blocks: [],
      rows: [],
      sites: [],
      block: null,
      row: null,
      site: null
    }
  },
  created () {
    if (this.siteTypeId) {
      return this.secureGet('/api/v1/site_types/' + this.siteTypeId + '/blocks_avialable')
        .then((res) => {
          this.blocks = res.data
        })
        .catch((error) => { this.error = error })
    } else {
      return this.secureGet('/api/v1/blocks?saleable=true')
        .then((res) => {
          this.blocks = res.data
        })
        .catch((error) => { this.error = error })
    }
  },
  computed: {

  },
  methods: {
    doSelect () {
      this.$emit('input', {site_ref: this.site.site_ref, block_id: this.block.block_id, block_ref: this.block.block_ref, row_no: this.row.row_no, site_id: this.site.site_id, site_no: this.site.site_no})
      this.sites = []
      this.rows = []
      this.row = null
      this.site = null
      this.block = null
    },
    newBlockChange () {
      this.sites = []
      this.rows = []
      this.row = null
      this.site = null
      this.getRows()
    },
    newRowChange () {
      this.sites = []
      this.site = null
      this.getSites()
    },
    getRows () {
      let url = '/api/v1/blocks/' + this.block.block_ref + '/rows_available'
      if (this.siteTypeId) {
        url = url + '?site_type_id=' + this.siteTypeId
      }
      return this.secureGet(url)
        .then(response => { this.rows = response.data })
        .catch((error) => { this.error = error })
    },
    getSites () {
      let url = '/api/v1/blocks/' + this.block.block_ref + '/rows/' + this.row.row_no
      if (this.siteTypeId) {
        url = url + '?site_type_id=' + this.siteTypeId
      }
      return this.secureGet(url)
        .then(response => { this.sites = response.data })
        .catch((error) => { this.error = error })
    },
    siteLabel (site) {
      return site.site_ref + (!this.siteTypeId ? (' - ' + site.site_type + ' ') : '') + (site.site_status_ref !== 'AVAIL' ? ' (not available)' : '')
    },
    siteValue (site) {
      return site.site_no
    },
    rowLabel (row) {
      return 'Row ' + row.row_no
    },
    rowValue (row) {
      return row.row_no
    },
    siteDisabled (site) {
      return !(site.site_status_ref === 'AVAIL')
    }
  }
}
</script>

<style scoped>
</style>
