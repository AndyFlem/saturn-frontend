<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-card class="elevation-2 mb-3">
      <v-card-title class="pb-1">
        <v-row align="center">
          <span v-if="site">{{ site.site_type }}</span>
          <span v-else>Site</span>
          <v-avatar v-if="site && site.verified">
            <v-icon>
              mdi-checkbox-marked-circle
            </v-icon>
          </v-avatar>
        </v-row>
        <v-spacer/>
        <template v-if="site">
          <site-map-popup :site="site" />
        </template>
        <router-link class="mr-5" v-if="showRef && site" :to="{name:'Site', params: {site_id: site.site_id}}">
          {{ site.site_ref }}
        </router-link>
        <template v-if="site">
        <v-chip
            v-if="site.flag"
            class="mr-2 ml-2"
            color="red"
          ><span class="text-body-1 font-weight-bold">flag</span></v-chip></template>
        <v-chip v-if="site" class="ml-2 text-body-1 font-weight-bold" v-bind:color="siteStatusColor(site)">{{ site.site_status }}</v-chip>
        <v-chip v-else class="ml-2 text-body-1 font-weight-bold" color="grey">site</v-chip>
      </v-card-title>
      <template v-if="site">
        <v-card-text v-if="site.site_unsuitability_id" class="pb-0 pt-2 text-body-1 d-flex flex-wrap">
          <span><b>Unsuitability: </b>{{site.site_unsuitability}}</span>
        </v-card-text>
      </template>
      <v-card-text class="pb-0 pt-2 text-body-1 d-flex flex-wrap">
        <v-row v-if="site" class="">
          <v-col v-if="site.site_status_ref=='OWN'" cols="12" class="rounded-lg pa-3">
            <div><b>Owner:  </b></div>
            <div>
              <customer-details v-if="site.sale_customer_id" v-model="site.sale_customer_id"/>
            </div>
            <div>
              Since: {{formatD(site.ownership_date)}}, sale: <router-link :to="{name: 'Sale', params: {sale_id: site.sale_id}}">{{site.sale_id}}</router-link>
            </div>
            <div v-if="site.ownership_date">
              <a class="text-decoration-underline" @click="generateCertificate"><v-icon color="primary" class="pr-3">mdi-download</v-icon>Download Ownership Certificate</a>
            </div>
          </v-col>
          <v-col  v-if="site.site_status_ref=='ORDER'" cols="12" class="rounded-lg pa-3">
            <div><b>On order to: </b></div>
            <div>
              <customer-details v-if="site.sale_customer_id" v-model="site.sale_customer_id"/>
            </div>
            <div>
              Sale: <router-link :to="{name: 'Sale', params: {sale_id: site.sale_id}}">{{site.sale_id}}</router-link> <span :style="`color:${saleStatusColor(site.sale_status_ref)};`">({{site.sale_status}})</span>
            </div>
          </v-col>
        </v-row>
        <v-skeleton-loader
            v-else
            type="article"
        ></v-skeleton-loader>
      </v-card-text>
      <v-card-text class="pb-1 pt-0">
        <v-list v-if="site">
          <template v-for="indx in (site.graves)">
            <v-divider :key="'g' + indx" />
            <v-list-item :key="indx" class="">
              <v-list-item-content class="pt-1 pb-1">
                <burial-details :burial="burials[indx]" :grave-no="indx"/>
              </v-list-item-content>
            </v-list-item>
            <v-divider :key="'gi' + indx" />
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
  </div>
</template>

<script>
import CustomerDetails from '@/components/customer/CustomerDetails'
import BurialDetails from '@/components/burials/BurialDetails'
import Events from '@/components/events/Events'

import SiteMapPopup from '@/components/sites/SiteMapPopup'

export default {
  name: 'SiteDetails',
  props: ['value', 'hide-customer', 'hide-ref', 'reload'],
  components: {
    CustomerDetails,
    SiteMapPopup,
    BurialDetails,
    Events
  },
  data () {
    return {
      site: null,
      burials: [],
      error: null,
      showCustomer: true,
      showRef: true
    }
  },
  watch: {
    reload: function (val) {
      this.load()
    },
    value: function (val) {
      this.load()
    }
  },
  created () {
    if (this.hideCustomer === '') { this.showCustomer = false }
    if (this.hideRef === '') { this.showRef = false }
    this.load()
  },
  methods: {
    load () {
      this.site = null
      if (this.value) {
        this.secureGet('/api/v1/sites/' + this.value)
          .then(res => {
            this.site = res.data
            return this.secureGet('/api/v1/sites/' + this.site.site_id + '/burials')
          })
          .then(res => {
            // Get any burials
            res.data.forEach(burial => {
              this.$set(this.burials, burial.grave_no, burial)
            })
          })
          .catch(error => { this.error = error })
      }
    },
    generateCertificate () {
      new Promise((resolve, reject) => {
        if (!this.site.certificate_document_id) {
          this.securePost('/api/v1/sites/' + this.site.site_id + '/generate_certificate', {user_id: JSON.parse(localStorage.user).user_id})
            .then(() => {
              this.site.certificate_document_id = -1
              resolve()
            })
            .catch((err) => {
              reject(err)
            })
        } else {
          resolve()
        }
      })
        .then(response => {
          const url = this.$config.API_URL + '/asset/sale_site/' + this.site.sale_site_id + '/' + this.site.site_ref + '_Ownership_Certificate.pdf'
          window.open(url, '_blank')
        })
        .catch(error => { this.error = error })
    }
  }
}
</script>

<style scoped>
.ownership-outline {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
