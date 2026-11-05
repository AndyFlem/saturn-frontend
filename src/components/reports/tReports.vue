<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="9">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            {{formatD(reportDate)}}
          </v-card-title>
          <v-card-text>
            <v-row class="mt-5 ml-3">
              <v-col cols="4" lg="2">
                <v-select
                  class="mr-4"
                  :items="years"
                  v-if="years"
                  v-model="year"
                  label="From Year"
                  @change="yearSelected"
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text class="text-body-1">

            <!--############################-->
            <h2 class="mt-5">Sales</h2>
            <chart-card
              :data="chartSaleCount"
              :layout="{
                    yaxis: { tickformat:',.3r', title: 'Sales' },
                    height: 200,
                    font: {size: 11},
                    margin: {t: 10, b:30, r: 200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Monthly sales count."
              download-title="Sales_count"
            />
            <chart-card
              :data="chartMonthlySales"
              :layout="{
                    yaxis: { tickformat:',.3r', title: $config.MONEY_SYMBOL + ' (000s)' },
                    height: 240,
                    font: {size: 11},
                    margin: {t: 50, b:30, r: 200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Monthly kwacha sales value."
              download-title="Sale_value_kwacha"
            />
            <chart-card
              :data="chartMonthlySalesDollar"
              :layout="{
                    yaxis: { tickformat:',.3r', title: '$ (000s)' },
                    height: 200,
                    font: {size: 11},
                    margin: {t: 10, b:30, r: 200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Monthly dollar sales value."
              download-title="Sale_value_dollars"
            />
            <chart-card
              :data="chartAvSaleValueKwacha"
              :layout="{
                    yaxis: { tickformat:',.0f', title: 'K' },
                    height: 240,
                    font: {size: 11},
                    margin: {t: 50, b:30, r:200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Average kwacha value of each sale by month."
              download-title="Average_sale_Value_Kwacha"
            />
            <chart-card
              :data="chartAvSaleValue"
              :layout="{
                    yaxis: { tickformat:',.0f', title: '$' },
                    height: 240,
                    font: {size: 11},
                    margin: {t: 50, b:30, r:200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Average dollar value of each sale by month."
              download-title="Average_sale_Value"
            />
            </v-card-text>
            <v-card-text class="text-body-1">
            <!--############################-->
            <h2 class="mt-5">Revenue</h2>
            <chart-card
              :data="chartMonthlyCharges"
              :layout="{
                   yaxis: { tickformat:',.2r', title: '$ (000s)' },
                    height: 240,
                    font: {size: 11},
                    margin: {t: 50, b:30, r:200},
                    bargap :0.15, barmode: 'relative'}"
              caption="Monthly revenue by revenue type."
              download-title="Monthly_revenue_type"
            />
            <chart-card
              :data="chartMonthlyTypeGroupsRevenue"
              :layout="{
                    yaxis: { tickformat:',.2r', title: '$ (000s)' },
                    height: 270,
                    font: {size: 11},
                    margin: {t: 50, b:30, r:200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Monthly site revenue split by product."
              download-title="Monthly_product_revenue"
            />
            <chart-card
              :data="chartMonthlyTypeGroupsRevenueRel"
              :layout="{
                    yaxis: { tickformat:'.0%' },
                    height: 270,
                    font: {size: 11},
                    margin: {t: 50, b:30, r:200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Monthly site revenue split by product."
              download-title="Monthly_product_revenue"
            />
            <chart-card
              :data="chartMonthlyTypeRevenue"
              :layout="{
                    yaxis: { tickformat:',.2r', title: '$ (000s)' },
                    height: 270,
                    font: {size: 11},
                    margin: {t: 50, b:30, r:200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Monthly site revenue split by site type."
              download-title="Monthly_product_revenue"
            />
          </v-card-text>
          <v-card-text class="text-body-1">
            <!--############################-->
            <h2 class="mt-5">Burials</h2>
            <chart-card
              :data="chartMonthlyBurialsGroups"
              :layout="{
                    yaxis: { tickformat:',.0f' },
                    height: 270,
                    font: {size: 11},
                    margin: {t: 50, b:30},
                    bargap :0.15, barmode: 'stack'}"
              caption="Monthly burials by product."
              download-title="Monthly_burials"
            />
            <chart-card
              :data="chartMonthlyBurialsGroupsRel"
              :layout="{
                    yaxis: { tickformat:'.0%' },
                    height: 270,
                    font: {size: 11},
                    margin: {t: 50, b:30},
                    bargap :0.15, barmode: 'stack'}"
              caption="Proportion of monthly burials by product."
              download-title="Monthly_burial_proportion"
            />
            <chart-card
              :data="chartMonthlyBurialAvs"
              :layout="{
                    yaxis: { tickformat:',.1f' },
                    height: 240,
                    font: {size: 11},
                    margin: {t: 50, b:30, r:200},
                    bargap :0.15, barmode: 'stack'}"
              caption="Average number of burials completed per day by month."
              download-title="Average_burials_per_day"
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
      years: [2016,2017,2018,2019,2020,2021,2022,2023],
      year: 2021,

      chartMonthlySales: null,
      chartMonthlySalesDollar: null,
      chartMonthlyBurialsGroups: null,
      chartMonthlyBurialsGroupsRel: null,
      chartMonthlyBurialAvs: null,
      chartMonthlyCharges: null,
      chartMonthlyTypeGroupsRevenue: null,
      chartMonthlyTypeGroupsRevenueRel: null,
      chartMonthlyTypeRevenue: null,

      chartAvSaleValue: null,
      chartAvSaleValueKwacha: null,
      chartSaleCount:null,

      chartBurialsGroups: null
    }
  },
  computed: {
    fromDate () {
      return this.year + '-01-01'
    },
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
    this.load()
  },
  methods: {
    yearSelected() {
      this.load()
    },
    load() {
    var d3colors = schemeCategory10
    const kwachaColor =  '#a569bd'
    const dollarColor = '#16a085'
    const countColor = '#2980b9'

    this.secureGet('/api/v1/site_type_groups')
      .then(res => {
        this.raw.typeGroups = Object.fromEntries(res.data.map((v, i) => { return [v.site_type_group, v.ordinal] }))
        return this.secureGet('/api/v1/site_types')
      })
      .then(res => {
        this.raw.types = Object.fromEntries(res.data.sort((a, b) => a.group_ordinal - b.group_ordinal).map((v, i) => { return [v.site_type, v] }))
        return this.secureGet('/api/v1/reports/report/yearly_burials')
      })
      .then(res => {
        this.raw.yearlyBurials = res.data
        this.raw.burialsGroupCounts = rollup(this.raw.yearlyBurials, v => sum(v, d => d.burial_count), v => v.site_type_group)
        return this.secureGet('/api/v1/reports/report/monthly_burials_avs?from=' + this.fromDate)
      })
      .then(res => {
        this.raw.monthlyBurialAvs = res.data
        return this.secureGet('/api/v1/reports/report/monthly_sales?from=' + this.fromDate)
      })
      .then(res => {
        this.raw.monthlySales = res.data
        this.chartMonthlySales =
         [{
           x: this.raw.monthlySales.map(y => y.start),
           y: this.raw.monthlySales.map(y => y.sale_value / 1000),
           type: 'bar',
           name: 'Kwacha sale value (000s)',
           marker: {color: kwachaColor},
           hoverinfo: 'x+y'
         }]
        this.chartMonthlySalesDollar =
         [{
           x: this.raw.monthlySales.map(y => y.start),
           y: this.raw.monthlySales.map(y => y.sale_value_dollar / 1000),
           type: 'bar',
           name: 'Dollar sale value',
           marker: {color: dollarColor},
           hoverinfo: 'x+y'
         }]
        this.chartMonthlyBurialAvs =
         [{
           x: this.raw.monthlyBurialAvs.map(y => y.start),
           y: this.raw.monthlyBurialAvs.map(y => y.daily_burials),
           type: 'bar',
           name: 'Burials',
           marker: {color: countColor},
           hoverinfo: 'x+y'
         }]
         this.chartSaleCount =
         [{
           x: this.raw.monthlySales.map(y => y.start),
           y: this.raw.monthlySales.map(y => y.sale_count),
           type: 'bar',
           name: 'Sale count',
           marker: {color: countColor},
           hoverinfo: 'x+y'
         }]
         this.chartAvSaleValue =
         [{
           x: this.raw.monthlySales.map(y => y.start),
           y: this.raw.monthlySales.map(y => y.sale_value_dollar / y.sale_count),
           type: 'bar',
           name: 'Dollar sale value',
           marker: {color: dollarColor},
           hoverinfo: 'x+y'
         }]
         this.chartAvSaleValueKwacha =
         [{
           x: this.raw.monthlySales.map(y => y.start),
           y: this.raw.monthlySales.map(y => y.sale_value / y.sale_count),
           type: 'bar',
           name: 'Kwacha sale value',
           marker: {color: kwachaColor},
           hoverinfo: 'x+y'
         }]
        return this.secureGet('/api/v1/reports/report/monthly_burials?from=' + this.fromDate)
      })
      .then(res => {
        this.raw.monthlyBurials = res.data

        this.raw.monthlyBurialsGroups = rollups(
          res.data, v => sum(v, d => d.burial_count), v => v.site_type_group, v => v.start
        ).sort((a, b) => this.raw.burialsGroupCounts.get(b[0]) - this.raw.burialsGroupCounts.get(a[0]))

        this.raw.burialsMonthly = rollups(res.data, v => sum(v, d => d.burial_count), v => v.start)

        this.chartMonthlyBurialsGroups = this.raw.monthlyBurialsGroups.map(grp => {
          return {
            x: grp[1].map(y => y[0]),
            y: grp[1].map(y => y[1]),
            name: grp[0],
            marker: {color: d3colors[this.raw.typeGroups[grp[0]]], opacity: 1},
            type: 'bar',
            hoverinfo: 'name+y'
          }
        }).concat({
          x: this.raw.burialsMonthly.map(v => v[0]),
          y: this.raw.burialsMonthly.map(v => v[1]),
          text: this.raw.burialsMonthly.map(v => format(',.0f')(v[1])),
          type: 'scatter',
          mode: 'none',
          hoverinfo: 'x+y',
          showlegend: false,
          textposition: 'top'
        })

        let totalsDict = Object.fromEntries(this.raw.burialsMonthly.map(v => { return [v[0], v[1]] }))
        this.chartMonthlyBurialsGroupsRel = this.raw.monthlyBurialsGroups.map(grp => {
          return {
            x: grp[1].map(y => y[0]),
            y: grp[1].map(y => y[1] / totalsDict[y[0]]),
            name: grp[0],
            marker: {color: d3colors[this.raw.typeGroups[grp[0]]], opacity: 1},
            type: 'bar',
            hoverinfo: 'name+y'
          }
        })

        return this.secureGet('/api/v1/reports/report/monthly_sale_type_groups?from=' + this.fromDate)
      })
      .then(res => {
        this.raw.monthlyTypeGroupCharges = res.data

        return this.secureGet('/api/v1/reports/report/monthly_burial_charges?from=' + this.fromDate)
      })
      .then(res => {
        this.raw.monthlyBurialCharges = res.data
        return this.secureGet('/api/v1/reports/report/monthly_sale_charges?from=' + this.fromDate)
      })
      .then(res => {
        this.raw.monthlySaleCharges = res.data
        return this.secureGet('/api/v1/reports/report/monthly_event_charges?from=' + this.fromDate)
      })
      .then(res => {
        this.raw.monthlyEventCharges = res.data

        this.raw.monthlyTotalTypeCharges = rollups(
          this.raw.monthlyTypeGroupCharges,
          v => { return {start: v[0].start, year: v[0].year, value: sum(v, t => t.value), value_dollar: sum(v, t => t.value_dollar)} },
          v => v.start
        )
        this.raw.monthlyTotalBurialCharges = rollups(
          this.raw.monthlyBurialCharges,
          v => { return {start: v[0].start, year: v[0].year, value: sum(v, t => t.value), value_dollar: sum(v, t => t.value_dollar)} },
          v => v.start
        )
        this.raw.monthlyTotalEventCharges = rollups(
          this.raw.monthlyEventCharges,
          v => { return {start: v[0].start, year: v[0].year, value: sum(v, t => t.value), value_dollar: sum(v, t => t.value_dollar)} },
          v => v.start
        )

        this.chartMonthlyCharges = [{
          x: this.raw.monthlyTotalTypeCharges.map(y => y[1].start),
          y: this.raw.monthlyTotalTypeCharges.map(y => y[1].value_dollar / 1000),
          name: 'Site Charges',
          type: 'bar',
          marker: {color: d3colors[9], opacity: 1},
          hoverinfo: 'name+x+y'
        }, {
          x: this.raw.monthlyTotalBurialCharges.map(y => y[1].start),
          y: this.raw.monthlyTotalBurialCharges.map(y => y[1].value_dollar / 1000),
          name: 'Burial Charges',
          type: 'bar',
          marker: {color: d3colors[8], opacity: 1},
          hoverinfo: 'name+x+y'
        }, {
          x: this.raw.monthlySaleCharges.map(y => y.start),
          y: this.raw.monthlySaleCharges.map(y => y.value_dollar / 1000),
          name: 'Other Charges / Discounts',
          type: 'bar',
          marker: {color: d3colors[7], opacity: 1},
          hoverinfo: 'name+x+y'
        }, {
          x: this.raw.monthlyEventCharges.map(y => y.start),
          y: this.raw.monthlyEventCharges.map(y => y.value_dollar / 1000),
          name: 'Event Charges',
          type: 'bar',
          marker: {color: d3colors[3], opacity: 1},
          hoverinfo: 'name+x+y'
        }
        ]
        this.raw.monthlyTypeGroupChargesGroups = groups(this.raw.monthlyTypeGroupCharges, v => v.site_type_group).sort((a, b) => this.raw.burialsGroupCounts.get(b[0]) - this.raw.burialsGroupCounts.get(a[0]))
        this.raw.monthlyTotalTypeChargesDict = Object.fromEntries(this.raw.monthlyTotalTypeCharges.map(v => { return [v[1].start, v[1].value_dollar] }))

        this.chartMonthlyTypeGroupsRevenue = this.raw.monthlyTypeGroupChargesGroups.map(grp => {
          return {
            y: grp[1].map((v, i) => v.value_dollar /1000),
            x: grp[1].map(v => v.start),
            name: grp[0],
            marker: {color: d3colors[this.raw.typeGroups[grp[0]]], opacity: 1},
            type: 'bar',
            hoverinfo: 'name+y'
          }
        })
        this.chartMonthlyTypeGroupsRevenue.push({
          x: this.raw.monthlyTotalTypeCharges.map(y => y[1].start),
          y: this.raw.monthlyTotalTypeCharges.map(y => y[1].value_dollar / 1000),
          name: 'Total',
          type: 'scatter',
          mode: 'markers',
          marker: {size: 3, color: 'grey'},
          hoverinfo: 'y'
        })

        this.chartMonthlyTypeGroupsRevenueRel = this.raw.monthlyTypeGroupChargesGroups.map(grp => {
          return {
            y: grp[1].map((v, i) => v.value_dollar / this.raw.monthlyTotalTypeChargesDict[v.start]),
            x: grp[1].map(v => v.start),
            name: grp[0],
            marker: {color: d3colors[this.raw.typeGroups[grp[0]]], opacity: 1},
            type: 'bar',
            hoverinfo: 'y'
          }
        })
        return this.secureGet('/api/v1/reports/report/monthly_sale_types?from=' + this.fromDate)
      })
      .then(res => {
        this.raw.monthlyTypeCharges = res.data
        this.raw.monthlyTypeChargesGroups = groups(this.raw.monthlyTypeCharges, v => v.site_type)
        this.chartMonthlyTypeRevenue = this.raw.monthlyTypeChargesGroups.map(grp => {
          return {
            y: grp[1].map((v, i) => v.value_dollar /1000),
            x: grp[1].map(v => v.start),
            name: grp[0],
            marker: {color: d3colors[this.raw.typeGroups[grp[0]]], opacity: 1},
            type: 'bar',
            hoverinfo: 'name+y'
          }
        })
      })

      .catch((error) => { this.error = error })
    },
  },
  watch: {
  }
}
</script>

<style scoped>

</style>
