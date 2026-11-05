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
            <chart-card
              :data="chartMonthlySales"
              :layout="{
                    xaxis: { dtick: 'M1' },
                    yaxis: { tickformat:',.3r', title: '$' },
                    height: 220,
                    font: {size: 11},
                    margin: {t: 10, b:30, r: 200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Sales value by user."
              download-title="User_sales_value"
            />
          </v-card-text>
          <v-card-text class="text-body-1">
            <chart-card
              :data="chartMonthlySalesCount"
              :layout="{
                    xaxis: { dtick: 'M1' },
                    yaxis: { tickformat:',.0f', title: 'No.' },
                    height: 220,
                    font: {size: 11},
                    margin: {t: 10, b:30, r: 200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Sales by user."
              download-title="User_sales"
            />
          </v-card-text>
          <v-card-text class="text-body-1">
            <chart-card
              :data="chartMonthlySalesProp"
              :layout="{
                    xaxis: { dtick: 'M1' },
                    yaxis: { tickformat:',.0%', title: '%' },
                    height: 220,
                    font: {size: 11},
                    margin: {t: 10, b:30, r: 200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Proportion of sales value."
              download-title="User_sales_value_proportion"
            />
          </v-card-text>
            <v-card-text class="text-body-1">
            <chart-card
              :data="chartMonthlyValuePerSale"
              :layout="{
                    xaxis: { dtick: 'M1' },
                    yaxis: { tickformat:',.3r', title: '$' },
                    height: 220,
                    font: {size: 11},
                    margin: {t: 10, b:30, r: 200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Average value per sale."
              download-title="User_value_per_sale"
            />
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
import ChartCard from './ChartCard.vue'

export default {
  name: 'Reports',
  components: {
    ErrorDisp,
    DailyCharts,
    ChartCard,
    Plotly: () => import(/* webpackChunkName: "plotly" */ '@/components/shared/Plotly.vue')
  },
  props: [],
  data () {
    return {
      error: null,
      raw: {},

      chartMonthlySales: null,
      chartMonthlySalesProp: null,
      chartMonthlyValuePerSale: null,
      chartMonthlySalesCount: null,
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
  created () {
    var d3colors = schemeCategory10

    this.secureGet('/api/v1/site_type_groups')
      .then(res => {
        return this.secureGet('/api/v1/reports/report/monthly_user_sales?from=' + this.reportDate.minus({year: 1}).toFormat('yyyy-LL-dd'))
      })
      .then(res => {
        this.raw.monthlySales = []
        this.raw.months = []
        res.data.forEach(mnth=>{
          if (!this.raw.monthlySales.find(v=> v.ordered_by_user_id === mnth.ordered_by_user_id)) {
            this.raw.monthlySales.push({
              ordered_by_user_id: mnth.ordered_by_user_id,
              user_name: mnth.user_name,
              sales: []
            })
          }
          if (!this.raw.months.find(v=> v.start === mnth.start)) {
            this.raw.months.push({
              start: mnth.start,
              month: mnth.month,
              year: mnth.year,
              sale_value:0,
              sale_value_dollar:0,
              sale_count:0
            })
          }

          this.raw.months.find(v=> v.start === mnth.start).sale_value += mnth.sale_value
          this.raw.months.find(v=> v.start === mnth.start).sale_value_dollar += mnth.sale_value_dollar
          this.raw.months.find(v=> v.start === mnth.start).sale_count += mnth.sale_count

          this.raw.monthlySales.find(v=> v.ordered_by_user_id === mnth.ordered_by_user_id).sales.push({
            sale_value: mnth.sale_value,
            sale_value_dollar: mnth.sale_value_dollar,
            sale_count: mnth.sale_count,
            start: mnth.start
          })
        })
        this.raw.monthlySales.forEach(mnth=>{
          mnth.total_sale_count = sum(mnth.sales, d=> d.sale_count)
          mnth.total_sale_value_dollar = sum(mnth.sales, d=> d.sale_value_dollar)
          mnth.total_sale_value = sum(mnth.sales, d=> d.sale_value)
        })

        this.chartMonthlySales = this.raw.monthlySales.map(mnth=>{
          return {
            x: mnth.sales.map(y => y.start),
            y: mnth.sales.map(y => y.sale_value_dollar),
            type: 'scatter',
            name: mnth.user_name,
            hoverinfo: 'x+y'
          }
        })
        this.chartMonthlySalesCount = this.raw.monthlySales.map(mnth=>{
          return {
            x: mnth.sales.map(y => y.start),
            y: mnth.sales.map(y => y.sale_count),
            type: 'scatter',
            name: mnth.user_name,
            hoverinfo: 'x+y'
          }
        })

        this.chartMonthlySalesProp = this.raw.monthlySales.map(mnth=>{
          return {
            x: mnth.sales.map(y => y.start),
            y: mnth.sales.map(y => y.sale_value_dollar/this.raw.months.find(v=> v.start === y.start).sale_value_dollar),
            type: 'bar',
            name: mnth.user_name,
            hoverinfo: 'name+y'
          }
        })

        this.chartMonthlyValuePerSale = this.raw.monthlySales.map(mnth=>{
          return {
            x: mnth.sales.map(y => y.start),
            y: mnth.sales.map(y => y.sale_value_dollar/y.sale_count),
            type: 'scatter',
            name: mnth.user_name,
            hoverinfo: 'x+y'
          }
        })
      })

      .catch((error) => { this.error = error })
  },
  methods: {

  },
  watch: {
  }
}
</script>

<style scoped>

</style>
