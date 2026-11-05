<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-row no-gutter justify="start">
      <v-col cols="4" class="pt-0 pb-0">
        <v-select
          dense
          :items="blocks"
          clearable
          class="mr-3"
          v-model="address.block_ref"
          :disabled="!loaded"
          @change="blockSelected"
          label="Block"
        ></v-select>
      </v-col>
      <v-col cols="4" class="pt-0 pb-0">
        <v-select
          dense
          :disabled="rows.length==0"
          :items="rows"
          clearable
          class="mr-3"
          v-model="address.row_no"
          @change="rowSelected"
          label="Row"
        ></v-select>
      </v-col>
      <v-col cols="4" class="pt-0 pb-0">
        <v-select
          dense
          :items="sites"
          :disabled="sites.length==0"
          clearable
          class="mr-3"
          v-model="address.site_no"
          @change="siteSelected"
          label="Site"
        ></v-select>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'SearchSiteSelector',
  props: ['value'],
  data () {
    return {
      error: null,
      counts: null,
      blocks: [],
      rows: [],
      sites: [],
      address: {
        block_ref: null,
        row_no: null,
        site_no: null
      },
      loaded: false
    }
  },
  methods: {
    emitAddress () {
      this.$emit('input', this.address)
    },
    blockSelected () {
      this.rows = Object.keys(this.counts[this.address.block_ref].rows)
      this.address.row_no = null
      this.address.site_no = null
      this.emitAddress()
    },
    rowSelected (event) {
      this.sites = []
      this.site_no = null
      let i
      for (i = 0; i < this.counts[this.address.block_ref].rows[this.address.row_no]; i++) {
        if (i !== 12) {
          this.sites.push(i + 1)
        }
      }
      this.emitAddress()
    },
    siteSelected () {
      this.emitAddress()
    }
  },
  mounted () {
    this.secureGet('/api/v1/blocksrowssites')
      .then(res => {
        this.counts = {}
        res.data.forEach(row => {
          if (!this.counts[row.block_ref]) {
            this.counts[row.block_ref] = {}
            this.counts[row.block_ref].rows = []
            this.counts[row.block_ref].block_ref = row.block_ref
          }
          this.counts[row.block_ref].rows[row.row_no] = row.max_site_no
        })
        this.blocks = Object.values(this.counts).map(b => { return {text: b.block_ref, value: b.block_ref} })
        this.loaded = true
      })
      .catch((error) => { this.error = error })
  }
}
</script>

<style scoped>
</style>
