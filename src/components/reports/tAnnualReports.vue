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
              :data="chartYearlySalesDollar"
              :layout="{
                    yaxis: { tickformat:',.3r', title: '$ (000s)' },
                    xaxis: { tickformat:'.0f', dtick: 1 },
                    height: 240,
                    font: {size: 11},
                    margin: {t: 50, b:30, r: 200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Total annual sales value"
              download-title="Annual_sales_value"
            />
            <chart-card
              :data="chartYearlyBurialsGroups"
              :layout="{
                    yaxis: { tickformat:',.0f' },
                    xaxis: { tickformat:'.0f', dtick: 1 },
                    height: 300,
                    font: {size: 11},
                    margin: {t: 50, b:30},
                    bargap :0.15, barmode: 'stack'}"
              caption="Annual burial count by product."
              download-title="Annual_burials"
            />
            <chart-card
              :data="chartYearlyBurialsGroupsRel"
              :layout="{
                    yaxis: { tickformat:'.0%' },
                    xaxis: { tickformat:'.0f', dtick: 1 },
                    height: 270,
                    font: {size: 11},
                    margin: {t: 10, b:60},
                    bargap :0.05, barmode: 'stack'}"
              caption="Proportion of annual burials by product."
              download-title="Annual_burial_proportion"
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
import ChartCard from './ChartCard.vue'

export default {
  name: 'Reports',
  components: {
    ErrorDisp,
    ChartCard,
    Plotly: () => import(/* webpackChunkName: "plotly" */ '@/components/shared/Plotly.vue')
  },
  props: [],
  data () {
    return {
      error: null,
      raw: {},

      chartYearlySales: null,
      chartYearlySalesDollar: null,
      chartYearlyBurialsGroups: null,
      chartYearlyBurialsGroupsRel: null,
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
    const kwachaColor =  '#a569bd'
    const dollarColor = '#16a085'
    const countColor = '#2980b9'

    this.secureGet('/api/v1/site_type_groups')
      .then(res => {
        this.raw.burialsGroups = Object.fromEntries(res.data.map((v, i) => { return [v.site_type_group, v.ordinal] }))
        return this.secureGet('/api/v1/reports/report/yearly_burials')
      })
      .then(res => {
        this.raw.yearlyBurials = res.data

        this.raw.burialsGroupCounts = rollup(this.raw.yearlyBurials, v => sum(v, d => d.burial_count), v => v.site_type_group)
        return this.secureGet('/api/v1/reports/report/yearly_sales')
      })
      .then(res => {
        this.raw.yearlySales = res.data
        this.chartYearlySales = [{
          x: this.raw.yearlySales.map(y => y.year),
          y: this.raw.yearlySales.map(y => y.sale_value / 1000),
          text: this.raw.yearlySales.map(y => format(',.2r')(y.sale_value / 1000)),
          type: 'bar',
          textposition: 'inside',
          marker: {color: kwachaColor},
          hoverinfo: 'y'
        }]

        this.chartYearlySalesDollar = [{
          x: this.raw.yearlySales.map(y => y.year),
          y: this.raw.yearlySales.map(y => y.sale_value_dollar / 1000),
          text: this.raw.yearlySales.map(y => format(',.2r')(y.sale_value_dollar / 1000)),
          type: 'bar',
          textposition: 'inside',
          marker: {color: dollarColor},
          hoverinfo: 'y'
        }]


        this.raw.yearlyBurialsGroups = rollups(
          this.raw.yearlyBurials, v => sum(v, d => d.burial_count), v => v.site_type_group, v => v.year
        ).sort((a, b) => this.raw.burialsGroupCounts.get(b[0]) - this.raw.burialsGroupCounts.get(a[0]))

        this.raw.burialsYearly = rollups(this.raw.yearlyBurials, v => sum(v, d => d.burial_count), v => v.year)
        this.raw.burialsYearlyDict = Object.fromEntries(this.raw.burialsYearly)

        this.chartYearlyBurialsGroups = this.raw.yearlyBurialsGroups.map(grp => {
          return {
            x: grp[1].map(y => y[0]),
            y: grp[1].map(y => y[1]),
            name: grp[0],
            type: 'bar',
            marker: {color: d3colors[this.raw.burialsGroups[grp[0]]], opacity: 1},
            hoverinfo: 'name+y'
          }
        }).concat({
          x: this.raw.burialsYearly.map(v => v[0]),
          y: this.raw.burialsYearly.map(v => v[1]),
          text: this.raw.burialsYearly.map(v => format(',.0f')(v[1])),
          type: 'scatter',
          mode: 'text',
          hoverinfo: 'none',
          marker: {color: countColor},
          showlegend: false,
          textposition: 'top'
        })

        this.chartYearlyBurialsGroupsRel = this.raw.yearlyBurialsGroups.map(grp => {
          return {
            x: grp[1].map(y => y[0]),
            y: grp[1].map(y => y[1] / this.raw.burialsYearlyDict[y[0]]),
            name: grp[0],
            type: 'bar',
            marker: {color: d3colors[this.raw.burialsGroups[grp[0]]], opacity: 1},
            hoverinfo: 'name+y'
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
