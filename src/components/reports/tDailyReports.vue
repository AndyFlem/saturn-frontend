<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="9">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            {{formatD(reportDate)}}
          </v-card-title>
          <v-card-text class="text-body-1">
            <daily-charts :year="reportDate.year" :month="reportDate.month" :day="reportDate.day" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import { DateTime } from 'luxon'
import { rollup, rollups, sum, groups } from 'd3-array'
import { format } from 'd3'
import { schemeCategory10 } from 'd3-scale-chromatic'
import DailyCharts from '@/components/reports/DailyCharts'

export default {
  name: 'Reports',
  components: {
    ErrorDisp,
    DailyCharts,
  },
  props: [],
  data () {
    return {
      error: null,
    }
  },
  computed: {
    reportDate () {
      return DateTime.local() // DateTime.fromObject({year: 2021, month: 6, day: 15})
    },
    thisMonthLabel () {
      return this.reportDate.toFormat('LLL yyyy')
    },
    lastMonthLabel () {
      return this.reportDate.minus({month: 1}).toFormat('LLL yyyy')
    },
    lastYearLabel () {
      return this.reportDate.minus({year: 1}).toFormat('LLL yyyy')
    }
  },
  created () {},
  methods: {

  },
  watch: {
  }
}
</script>

<style scoped>

</style>
