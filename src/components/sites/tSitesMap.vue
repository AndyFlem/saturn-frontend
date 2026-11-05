<template>
  <v-container fluid fill-height>
    <error-disp v-model="error"/>
    <block-map
      v-on:input="getDetails"
      v-model="selectedSiteId"
      :center="center"
      :zoom="zoom"
      :highlight-geometries="highlightGeometries">
    <v-container>
      <v-card  v-if="site" class="elevation-2 mb-3">
        <v-card-title class="pb-1 pr-0 text-body-1 font-weight-bold align-center">
          <v-row>
            <v-col cols="8" sm="12" lg="4" class="pt-5">
              <span v-if="site">{{ site.site_type }}</span>
              <span v-else>Site</span>
              <v-avatar v-if="site.verified">
              <v-icon>
                mdi-checkbox-marked-circle
              </v-icon>
          </v-avatar>
            </v-col>
            <v-col cols="4" sm="6" lg="4" v-if="site" class="pr-1 pl-1 pt-5 d-flex justify-end">
              <a :href="`https://www.google.com/maps/search/?api=1&query=${siteCentroid(site)[1]},${siteCentroid(site)[0]}`" target="_blank">
                <v-icon class="">mdi-google-maps</v-icon>
              </a>
              <router-link :to="{name:'Site', params: {site_id: site.site_id}}">{{ site.site_ref }}</router-link>
            </v-col>
            <v-col cols="12" sm="6" lg="4" class="pr-10 pb-0 justify-end d-flex">
              <v-chip v-if="site" class="ml-0 text-body-2 font-weight-bold" v-bind:color="siteStatusColor(site)">{{ site.site_status }}</v-chip>
              <v-chip v-else class="ml-0 text-body-2 font-weight-bold" color="grey">site</v-chip>
            </v-col>
            <v-col cols="12" class="pt-0 pb-0"><v-divider /></v-col>
          </v-row>
        </v-card-title>
        <v-card-text class="pb-0 pt-2 pr-0 text-body-2 d-flex flex-wrap">
          <v-row v-if="site" class="">
            <v-col cols="12" class="pt-2 d-flex">
            <v-row align="center">
            <v-switch
              dense
              hide-details
              :disabled="!(!site.verified || $userCheckPermission('PERM_SITES'))"
              :color="site.verified ? 'green':'primary'"
              class="mb-0 pt-0 pb-0 mt-1"
              v-if="site"
              v-model="site.verified"
              @click="verified()"
            /><div class="text-body-2 mr-10">{{site.verified ? 'Verified' : 'Verify site?'}}</div>
              <v-switch
              dense
              hide-details
              class="pl-4 pt-0 pb-0 mt-0 mb-0"
              :disabled="!(!site.flag || $userCheckPermission('PERM_SITES'))"
              :color="site.flag ? 'red':'primary'"
              v-if="site"
              v-model="site.flag"
              @click="flagged()"
            /><div class="text-body-2">Flagged site?</div>
            </v-row>
            </v-col>
            <v-col cols="12" class="pt-0 pb-0"><v-divider /></v-col>
            <v-col cols="12">
              <div v-if="site.ownership_date">
                <b>Owned Since:</b> {{formatD(site.ownership_date)}}
              </div>
              <div v-if="site.sale_customer_id">
                <b>Sale No: </b><router-link v-if="site.sale_status_ref==='DRAFT'" :to="{name: 'Edit Sale', params: {customer_id: site.sale_customer_id}}">{{site.sale_id}}</router-link>
                <router-link v-else :to="{name: 'Sale', params: {sale_id: site.sale_id}}">{{site.sale_id}}</router-link> <span :style="`color:${saleStatusColor(site.sale_status_ref)};`">({{site.sale_status}})</span>
              </div>
            </v-col>
            <v-col v-if="site.sale_customer_id" cols="12">
              <customer-details v-model="site.sale_customer_id" small/>
            </v-col>
          </v-row>
          <v-skeleton-loader
              v-else
              type="article"
          ></v-skeleton-loader>
        </v-card-text>
        <v-card-text>
          <notes
            narrow
            :forceAdd="addNote"
            :objects="[{parentObjectType: 'site', parentObjectId: site.site_id}]"
            :parentObjectId="site.site_id"
            parentObjectType="site"/>
        </v-card-text>
        <v-card-text>
        <photos
          narrow
          :siteId="site.site_id"
          :siteRef="site.site_ref" />
        </v-card-text>
        <v-card-text class="ml-5 pb-1 pt-0" v-if="$userCheckPermission('PERM_SITES') && (site.site_status_ref==='UNSUITABLE' || site.site_status_ref==='UNAVAIL'  || site.site_status_ref==='AVAIL')">
          <v-row>
            <v-col cols="12" md="10" class="pt-0 pb-0">
              <v-select
                dense
                hide-details
                class="mt-0 mb-4"
                :items="unsuitabilities"
                item-text="site_unsuitability"
                item-value="site_unsuitability_id"
                v-model="site.site_unsuitability_id"
                label="Mark site unsuitable"
                @change="doUnsuitable"/>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text class="pb-1 pt-0">
          <v-list v-if="site">
            <template v-for="indx in (site.graves)">
              <v-divider :key="'g' + indx" />
              <v-list-item :key="indx" class="pl-0 pr-0">
                <v-list-item-content class="pt-1 pb-1">
                  <burial-details narrow :burial="burials[indx]" :grave-no="indx"/>
                </v-list-item-content>
              </v-list-item>
              <v-divider :key="'gj' + indx" />
            </template>
          </v-list>
          <v-skeleton-loader
              v-else
              type="list-item-three-line"
            ></v-skeleton-loader>
        </v-card-text>
        <v-card-text class="pb-1 pt-0">
        <template v-if="site">
          <events
            v-if="site"
            readonly
            :siteId="site.site_id"
            :siteRef="site.site_ref" />
        </template>
        <v-skeleton-loader
            v-else
            type="list-item-three-line"
          ></v-skeleton-loader>
        </v-card-text>
      </v-card>
      <v-card  v-if="block_ref" class="elevation-2 mb-3">
        <v-card-title class="pb-1 pr-0 text-body-1 font-weight-bold">
          <v-row>
            <v-col cols="12">
              <span v-if="block_ref">Block: {{ block_ref }}</span>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text v-if="block">
          <v-row v-for="status in Object.keys(statuses)" :key="status" >
            <v-col cols="8" class="pt-0 pb-0">
              <b>{{status}}</b>
            </v-col>
            <v-col cols="4" class="pt-0 pb-0">
              {{formatInt(statuses[status])}} ({{formatDec(statuses[status] / sitesTotal * 100)}}%)
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="8" class="pt-0 pb-0 black--text">
              <b>Total </b>
            </v-col>
            <v-col cols="4" class="pt-0 pb-0 black--text">
              {{formatInt(sitesTotal)}}
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text v-if="block" class="pt-0">
          <template v-for="type in Object.keys(types)">
            <v-row :key="type" >
              <v-col cols="8" class="pt-0 pb-0">
                <b>{{types[type].site_type}}</b>
              </v-col>
              <v-col cols="4" class="pt-0 pb-0">
                {{formatInt(types[type].site_count)}} ({{formatDec(types[type].site_count / sitesTotal * 100)}}%)
              </v-col>
            </v-row>
            <v-row v-for="status in Object.keys(types[type].statuses)" :key="type + status" >
              <v-col cols="8" class="pl-10 pt-0 pb-0">
                <span class="">{{status}}</span>
              </v-col>
              <v-col cols="4" class="pl-10 pt-0 pb-0">
                {{formatInt(types[type].statuses[status])}} ({{formatDec(types[type].statuses[status] / types[type].site_count * 100)}}%)
              </v-col>
            </v-row>
          </template>
          <v-row>
            <v-col cols="8" class="pt-0 pb-0 black--text">
              <b>Total </b>
            </v-col>
            <v-col cols="4" class="pt-0 pb-0 black--text">
              {{formatInt(sitesTotal)}}
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
    </block-map>
  </v-container>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import helpers from '@/services/helpers'
import CustomerDetails from '@/components/customer/CustomerDetails'
import BurialDetails from '@/components/burials/BurialDetails'
import Notes from '@/components/notes/Notes'
import Photos from '@/components/photos/Photos'
import Events from '@/components/events/Events'

// Included in SiteMapPopup.vue and index.js
export default {
  name: 'tSitesMap',
  props: {
    siteId: Number,
    center: Array,
    zoom: Number,
    highlightGeometries: Array
  },
  components: {
    BlockMap: () => import(/* webpackChunkName: "blockmap" */ '@/components/sites/Map.vue'),
    ErrorDisp,
    CustomerDetails,
    BurialDetails,
    Notes,
    Photos,
    Events
  },
  data () {
    return {
      error: null,
      selectedSiteId: null,
      site: null,
      block_ref: null,
      block: null,
      unsuitabilities: [],
      burials: {},
      types: {},
      statuses: {},
      sitesTotal: 0,
      notes: null,
      addNote: false
    }
  },
  watch: {
  },
  computed: {
  },
  created () {
    // If created with a value then select and zoom to that site
    if (this.siteId) {
      this.selectedSiteId = this.siteId
      this.load()
    }
  },
  beforeDestroy () {
  },
  methods: {
    siteCentroid (site) {
      return JSON.parse(site.centroid_json).coordinates
    },
    flagged () {
      if (this.site.flag) { this.addNote = !this.addNote }
      this.securePut('/api/v1/sites/' + this.site.site_id + '/flag')
        .then(() => {
          this.reloadDetails = !this.reloadDetails
        })
        .catch((error) => { this.error = error })
    },
    verified () {
      this.$http.secured.put('/api/v1/sites/' + this.site.site_id + '/verify')
        .then(() => {
          this.reloadDetails = !this.reloadDetails
        })
        .catch((error) => { this.error = error })
    },
    doUnsuitable () {
      this.securePut('/api/v1/sites/' + this.site.site_id + '/unsuitability', {site_unsuitability_id: this.site.site_unsuitability_id})
        .then(res => {
          this.site.site_status_ref = res.data.site_status_ref
          this.site.site_status = res.data.site_status
          if (this.site.site_unsuitability_id) {
            this.unsuitabilities.unshift({site_unsuitability_id: null, site_unsuitability: 'CLEAR UNSUITABILITY'})
          } else {
            this.unsuitabilities.shift()
          }
        })
        .catch((error) => { this.error = error })
    },
    getDetails () {
      this.load()
    },
    loadBlock () {
      this.block = null
      this.statuses = {}
      this.types = {}
      this.sitesTotal = 0
      this.secureGet('/api/v1/blocks/' + this.block_ref + '/statuses')
        .then(res => {
          this.block = res.data
          this.block.forEach(rw => {
            if (!this.statuses[rw.site_status]) { this.statuses[rw.site_status] = 0 }
            this.statuses[rw.site_status] += rw.site_count

            if (!this.types[rw.site_type_ref]) { this.types[rw.site_type_ref] = { site_type: rw.site_type, statuses: {}, site_count: 0 } }
            const type = this.types[rw.site_type_ref]
            if (!type.statuses[rw.site_status]) { type.statuses[rw.site_status] = 0 }
            type.statuses[rw.site_status] += rw.site_count
            type.site_count += rw.site_count
            this.sitesTotal += rw.site_count
          })
        })
        .catch((error) => { this.error = error })
    },
    load () {
      this.site = null
      this.block = null
      this.block_ref = null
      this.burials = {}

      this.securePost('/api/v1/notes/get', {objects: [{parentObjectType: 'site', parentObjectId: this.selectedSiteId}]})
        .then(response => {
          this.notes = response.data
        })
        .catch((error) => { this.error = error })

      this.secureGet('/api/v1/sites/' + this.selectedSiteId)
        .then(res => {
          this.site = res.data
          this.block_ref = this.site.block_ref
          this.loadBlock()
          this.secureGet('/api/v1/unsuitability')
            .then(uns => {
              this.unsuitabilities = uns.data
              if (this.site.site_unsuitability_id) {
                this.unsuitabilities.unshift({site_unsuitability_id: null, site_unsuitability: 'CLEAR UNSUITABILITY'})
              }
            })
          return this.secureGet('/api/v1/sites/' + this.selectedSiteId + '/burials')
        })
        .then(res => {
          // Get any burials
          res.data.forEach(burial => {
            this.$set(this.burials, burial.grave_no, burial)
          })
        })
        .catch((error) => { this.error = error })
    },
    siteStatusColor (site) {
      switch (site.site_status_ref) {
        case 'UNAVAIL':
          return helpers.statusColors().A
        case 'AVAIL':
          return helpers.statusColors().B
        case 'ORDER':
          return helpers.statusColors().C
        case 'OWN':
          return helpers.statusColors().D
        case 'UNSUITABLE':
          return helpers.statusColors().E
      }
    },
    saleStatusColor (ref) {
      switch (ref) {
        case 'DRAFT':
          return helpers.statusColors().A
        case 'ORDERED':
          return helpers.statusColors().B
        case 'PAID':
          return helpers.statusColors().C
        case 'FULFILLED':
          return helpers.statusColors().D
      }
    }
  }
}
</script>

<style scoped>

</style>
