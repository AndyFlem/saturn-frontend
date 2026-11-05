<template>
  <div>
    <error-disp v-model="error"/>

    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Exchange Rates
          </v-card-title>
          <v-card-text class="mt-5 pl-5 text-body-1">
            <template v-for="(rate, indx) in rates">
              <v-row no-gutters :key="indx">
                <v-col cols="4">
                  {{monthText(rate)}}
                </v-col>
                <v-col v-if="!rate.edit" cols="8" class="pt-0 pb-0">
                  <v-btn
                    icon
                    class="pt-0 pb-0"
                    @click="rateClick(rate)"
                    color="grey"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  {{formatRate(rate.rate)}}
                </v-col>
                <v-col v-else cols="8" class="d-flex pt-0 pb-0 pl-2">
                  <v-btn
                      icon
                      class="pt-0 pb-0"
                      @click="rateUpdate(rate)"
                      color="green"
                    >
                      <v-icon>mdi-check</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    class="pt-0 pb-0"
                    @click="rate.edit = false; $forceUpdate();"
                    color="red"
                  >
                    <v-icon>mdi-cancel</v-icon>
                  </v-btn>
                  <v-text-field
                      dense
                      hide-details
                      class="text-caption"
                      v-model="rate.rate"
                      type="text"
                    />
                </v-col>
              </v-row>
            </template>
          </v-card-text>
          <v-card-actions class="pb-3 pr-5">
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import { DateTime } from 'luxon'
import {format} from 'd3'

export default {
  name: 'ExchangeRates',
  components: {
    ErrorDisp
  },
  props: [],
  data () {
    return {
      error: null,
      rates: null
    }
  },
  computed: {
  },
  created () {
    this.secureGet('/api/v1/rates')
      .then(res => {
        this.rates = res.data
      })
      .catch(err => { this.error = err })
  },
  watch: {
  },
  methods: {
    rateClick (rate) {
      this.rates.forEach(rte => {
        rte.edit = false
      })
      rate.edit = true
      this.$forceUpdate()
    },
    rateUpdate (rate) {
      this.securePut('/api/v1/rates/' + rate.year + '/' + rate.month, {rate: rate.rate})
        .then(res => {
          this.rates.forEach(rte => {
            rte.edit = false
          })
          this.$forceUpdate()
        })
        .catch(err => { this.error = err })
    },
    monthText (rate) {
      const dt = DateTime.local(rate.year, rate.month, 1)
      return dt.toFormat('LLL yyyy')
    },
    formatRate (rate) {
      return format(',.2f')(rate)
    }
  }
}
</script>

<style scoped>

</style>
