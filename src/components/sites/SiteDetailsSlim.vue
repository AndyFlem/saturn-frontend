<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-card class="elevation-0 mb-1">
      <v-card-text class="text-body-1 pt-0 pb-0">
        <v-row align="start">
          <v-col cols="12" md="4" class="text-left align-self-start">
            <div class="d-flex align-center flex-wrap">
              <span class="text-body-1" v-if="site"><b>{{ site.site_type }}</b></span>
              <span v-else>Site</span>
              <v-avatar v-if="site && site.verified" class="ml-2">
                <v-icon>
                  mdi-checkbox-marked-circle
                </v-icon>
              </v-avatar>
            </div>
          </v-col>

          <v-col cols="12" md="4" class="text-left text-md-center align-self-start">
            <template v-if="site && site.customer_id">
              <customer-details v-model="site.customer_id"/>
            </template>
          </v-col>

          <v-col cols="12" md="4" class="text-left text-md-right align-self-start">
            <div class="d-flex align-center flex-wrap justify-start justify-md-end">
              <template v-if="site">
                <site-map-popup :site="site" />
              </template>
              <router-link class="pt-1 mr-5" v-if="site" :to="{name:'Site', params: {site_id: site.site_id}}">
                {{ site.site_ref }}
              </router-link>
              <template v-if="site">
                <v-chip
                  v-if="site.flag"
                  class="mr-2 ml-2"
                  color="red"
                  small
                ><span class="text-body-1 font-weight-bold">flag</span></v-chip>
              </template>
              <v-chip small v-if="site" class="ml-2 text-body-1 font-weight-bold" v-bind:color="siteStatusColor(site)">{{ site.site_status }}</v-chip>
              <v-chip small v-else class="ml-2 text-body-1 font-weight-bold" color="grey">site</v-chip>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <template v-if="site">
        <v-card-text v-if="site.site_unsuitability_id" class="pb-0 pt-2 text-body-1 d-flex flex-wrap">
          <span><b>Unsuitability: </b>{{site.site_unsuitability}}</span>
        </v-card-text>
      </template>
    </v-card>
  </div>
</template>

<script>

import SiteMapPopup from '@/components/sites/SiteMapPopup'
import CustomerDetails from '@/components/customer/CustomerDetails'

export default {
  name: 'SiteDetailsSlim',
  props: ['value'],
  components: {
    SiteMapPopup,
    CustomerDetails
  },
  data () {
    return {
      site: null,
      error: null
    }
  },
  watch: {
    value: function (val) {
      this.load()
    }
  },
  created () {
    this.load()
  },
  methods: {
    load () {
      this.site = null
      if (this.value) {
        this.secureGet('/api/v1/sites/' + this.value)
          .then(res => { this.site = res.data })
          .catch(error => { this.error = error })
      }
    }
  }
}
</script>
