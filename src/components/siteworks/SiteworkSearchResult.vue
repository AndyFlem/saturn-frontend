<template>
  <v-card class="mt-3 mb-3">
    <error-disp v-model="error"/>
    <v-card-text class="pt-3 pb-3">
        <template v-if="sitework">
          <v-row no-gutters>
            <v-col cols="6" sm="6" md="4" order="1" order-sm="1" class="pb-0 text-body-1">
              <span v-if="sitework" class="">Work Order: <b><router-link :to="{ name: 'Sitework', params: { sitework_id: sitework.sitework_id } }">{{ sitework.sitework_id }}</router-link></b></span>
            </v-col>
            <v-col cols="12" sm="3" md="4" order="3" order-sm="2" class="pb-0 d-flex align-center text-body-1">
              <span
                v-if="sitework.sitework_time"
                :class="{ 'red--text': isSiteworkOverdue }"
              >Date: <b>{{ formatT(sitework.sitework_time) }}</b></span>
            </v-col>
            <v-col cols="6" sm="3" md="4" order="2" order-sm="3" class="pr-5 d-flex justify-end align-center">
              <v-chip
                small
                class="pr-5"
                v-bind:color="siteworkStatusColor(sitework.sitework_status_ref)"
                @click="$router.push({name: 'Sitework', params: {sitework_id: sitework.sitework_id}})"
              >
                <span class="text-body-1 font-weight-bold">{{ sitework.sitework_status}}</span>
              </v-chip>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col v-if="sitework.sitework_type" class="text-body-1" cols="12" sm="6" md="4">
              Type: <b>{{ sitework.sitework_type }}</b>
            </v-col>
            <v-col v-if="sitework.contractor_name" class="text-body-1" cols="12" sm="6" md="4">
              Contractor: <b>{{ sitework.contractor_name }}</b>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col v-if="site" cols="12" sm="6" md="4" class="text-body-1">
              Site:
              <template>
                <site-map-popup :site="site" />
              </template>
              <router-link class="pt-1 mr-5" v-if="site" :to="{name:'Site', params: {site_id: site.site_id}}">
                {{ site.site_ref }}
              </router-link>
            </v-col>
            <v-col v-if="site" cols="12" sm="6" md="4" class="text-body-1">
              <template v-if="site && site.customer_id">
                <customer-details v-model="site.customer_id"/>
              </template>
            </v-col>
          </v-row>
          <v-row v-if="sitework.description" no-gutters>
            <v-col class="text-body-1" cols="12" sm="6" md="4">
              Description: <b>{{ sitework.description }}</b>
            </v-col>
          </v-row>
          <template v-if="!suppressSiteDetails">

          </template>
        </template>
        <v-row v-else dense align="center">
          <v-col cols="12" class="d-flex align-center pb-0 text-body-1">
            Work Order: {{ value }}
            <v-spacer/>
            <v-chip
              color="grey"
              small
            ><span class="text-body-1 font-weight-bold">order</span></v-chip>
          </v-col>
        </v-row>

    </v-card-text>
  </v-card>

</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import CustomerDetails from '@/components/customer/CustomerDetails'
import { DateTime } from 'luxon'
import SiteMapPopup from '@/components/sites/SiteMapPopup'

export default {
  name: 'SiteworkSearchResult',
  components: {
    ErrorDisp,
    CustomerDetails,
    SiteMapPopup
  },
  props: {
    value: Number,
    suppressSiteDetails: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      sitework: null,
      site: null,
      error: null
    }
  },
  computed: {
    isSiteworkOverdue () {
      if (!this.sitework || !this.sitework.sitework_time) {
        return false
      }

      if (this.sitework.sitework_status_ref === 'COMPLETE') {
        return false
      }

      const siteworkTime = DateTime.fromISO(this.sitework.sitework_time)
      return siteworkTime.isValid && siteworkTime < DateTime.now()
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
      this.sitework = null
      this.site = null
      this.secureGet('/api/v1/siteworks/' + this.value)
        .then(res => {
          this.sitework = res.data

          this.secureGet('/api/v1/sites/' + this.sitework.site_id)
            .then(res => {
              this.site = res.data
            })
            .catch((error) => { this.error = error })
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>

<style scoped>

</style>
