<template>
  <div>
    <error-disp v-model="error"/>
    <chart-card
      :data="chartDailyCum"
      :layout="{
            yaxis: { title:'Burials', tickformat:',.0f'},
            height: 240,
            font: {size: 11},
            margin: {l:50, t: 10, b:30}
            }"
      caption="Cumulative number of burials for the current month, previous month and same month in the previous year."
      download-title="Cumulative_burials"
    />
    <chart-card
      :data="chartDailyCumSales"
      :layout="{
            yaxis: { tickformat:',.0f', title: '$000s'},
            height: 240,
            font: {size: 11},
            margin: {l:50, t: 10, b:30}
            }"
      caption="Cumulative dollar sales value for all products for the current month, previous month and same month in the previous year."
      download-title="Cumulative_sales"
    />
    <chart-card
      :data="chartDailyBurialsGroups"
      :layout="{
            yaxis: { tickformat:',.0f' },
            height: 300,
            font: {size: 11},
            margin: {l:50, t: 10, b:30, r: 200},
            bargap :0.15, barmode: 'stack'}"
      caption="Daily burials by site type for the previous month."
      download-title="Daily_Burials_by_Type"
    />
    <chart-card
      :data="chartDailySales"
      :layout="{
            yaxis: { tickformat:',.3r', title: $config.MONEY_SYMBOL + ' (000s)' },
            height: 240,
            font: {size: 11},
            margin: {l:50, t: 10, b:30, r: 200},
            bargap :0.15, barmode: 'stack'}"
      caption="Daily kwacha sales value for the previous month."
      download-title="Daily_Sales_Kwacha"
    />
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import ChartCard from './ChartCard.vue'
import { DateTime } from 'luxon'
import { rollup, rollups, sum, mean } from 'd3-array'
import { format } from 'd3'
import { schemeCategory10 } from 'd3-scale-chromatic'


export default {
  name: 'DailyCharts',
  components: {
    ErrorDisp,
    ChartCard,
    Plotly: () => import(/* webpackChunkName: "plotly" */ '@/components/shared/Plotly.vue')
  },
  props: ['year', 'month', 'day', 'monthly'],
  data () {
    return {
      error: null,
      raw: {},
      burialForecast: null,
      saleForecast: null,
      saleDollarForecast: null,

      chartDailySales: null,
      chartDailyBurialsGroups: null,
      chartDailyCum: null,
      chartDailyCumSales: null
    }
  },
  computed: {
    reportDate () {
      return DateTime.fromObject({year: this.year, month: this.month, day: this.day})
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
  mounted () {
    if (this.month) {
      this.generate()
    }
  },
  methods: {
    generate () {
      var d3colors = schemeCategory10
      const kwachaColor =  '#a569bd'
      const dollarColor = '#16a085'
      const countColor = '#2980b9'

      // Site type groups
      this.secureGet('/api/v1/site_type_groups')
        .then(res => {
          this.raw.burialsGroups = Object.fromEntries(res.data.map((v, i) => { return [v.site_type_group, v.ordinal] }))
        })

      // Daily sales
      this.secureGet('/api/v1/reports/report/daily_sales?from=' + this.reportDate.startOf('month').minus({months: 1}).toISODate() + '&to=' + this.reportDate.toISODate())
        .then(res => {
          this.raw.dailySalesThis = res.data.filter(v => v.year === this.reportDate.year && v.month === this.reportDate.month)
          this.raw.dailySalesPrevious = res.data.filter(v => v.year === this.reportDate.minus({month: 1}).year && v.month === this.reportDate.minus({month: 1}).month)

          this.chartDailySales =
         [{
           x: this.raw.dailySalesThis.map(y => y.start),
           y: this.raw.dailySalesThis.map(y => y.sale_value / 1000),
           marker: {color: kwachaColor},
           type: 'bar',
           name:'This Month (000s)',
           hoverinfo: 'x+y',
           showlegend: false
         },
         {
           x: this.raw.dailySalesPrevious.map(y => y.start),
           y: this.raw.dailySalesPrevious.map(y => y.sale_value / 1000),
           marker: {color: '#d2b4de'},
           type: 'bar',
           name:'Previous Month (000s)',
           hoverinfo: 'x+y',
           showlegend: false
         }
         ]
          // Daily burials this month and last year
          return this.secureGet('/api/v1/reports/report/daily_burials?from=' + this.reportDate.startOf('month').minus({months: 1}).toISODate() + '&to=' + this.reportDate.toISODate())
        })
        .then(res => {
          this.raw.dailyBurials = res.data
          this.raw.burialsGroupCounts = rollup(this.raw.dailyBurials, v => sum(v, d => d.burial_count), v => v.site_type_group)
          this.raw.dailyBurialsThis = this.raw.dailyBurials.filter(v => v.year === this.reportDate.year && v.month === this.reportDate.month)
          this.raw.dailyBurialsPrevious = this.raw.dailyBurials.filter(v => v.year === this.reportDate.minus({month: 1}).year && v.month === this.reportDate.minus({month: 1}).month)

          return this.secureGet('/api/v1/reports/report/daily_burials?from=' + this.reportDate.startOf('month').minus({months: 12}).toISODate() + '&to=' + this.reportDate.startOf('month').minus({months: 11}).minus({day: 1}).toISODate())
        })
        .then(res => {
          this.raw.dailyBurialsLast = res.data

          this.raw.dailyBurialsGroupsThis = rollups(
            this.raw.dailyBurialsThis, v => sum(v, d => d.burial_count), v => v.site_type_group, v => v.start
          ).sort((a, b) => this.raw.burialsGroupCounts.get(b[0]) - this.raw.burialsGroupCounts.get(a[0]))

          this.raw.dailyBurialsGroupsPrevious = rollups(
            this.raw.dailyBurialsPrevious, v => sum(v, d => d.burial_count), v => v.site_type_group, v => v.start
          ).sort((a, b) => this.raw.burialsGroupCounts.get(b[0]) - this.raw.burialsGroupCounts.get(a[0]))

          this.raw.burialsDaily = rollups(this.raw.dailyBurials, v => sum(v, d => d.burial_count), v => v.start)
          this.raw.burialsDailyThis = rollups(this.raw.dailyBurialsThis, v => sum(v, d => d.burial_count), v => v.start)
          this.raw.burialsDailyPrevious = rollups(this.raw.dailyBurialsPrevious, v => sum(v, d => d.burial_count), v => v.start)
          this.raw.burialsDailyLast = rollups(this.raw.dailyBurialsLast, v => sum(v, d => d.burial_count), v => v.start)

          this.raw.burialsAvThis = mean(this.raw.burialsDailyThis, v => v[1])
          this.raw.burialsAvPrevious = mean(this.raw.burialsDailyPrevious, v => v[1])

          this.raw.burialForecast = this.raw.burialsAvThis * this.reportDate.daysInMonth
          this.raw.saleForecastDollar = mean(this.raw.dailySalesThis.map(y => y.sale_value_dollar / 1000)) * this.reportDate.daysInMonth

          let cum0 = 0
          let cum1 = 0
          let cum2 = 0

          let tmpC = [
            {
              x: this.raw.burialsDailyThis.map(v => DateTime.fromISO(v[0]).day),
              y: this.raw.burialsDailyThis.map(v => {
                cum1 += v[1]
                return cum1
              }),
              line: {color: 'red', width: 3},
              marker: {size: 7},
              type: 'scatter',
              mode: 'lines+markers',
              name: this.thisMonthLabel
            },
            {
              x: this.raw.burialsDailyPrevious.map(v => DateTime.fromISO(v[0]).day),
              y: this.raw.burialsDailyPrevious.map(v => {
                cum0 += v[1]
                return cum0
              }),
              line: {color: 'steelblue', width: 2},
              type: 'scatter',
              mode: 'lines',
              name: this.lastMonthLabel
            },
            {
              x: this.raw.burialsDailyLast.map(v => DateTime.fromISO(v[0]).day),
              y: this.raw.burialsDailyLast.map(v => {
                cum2 += v[1]
                return cum2
              }),
              line: {color: 'grey', width: 2},
              type: 'scatter',
              mode: 'lines',
              name: this.lastYearLabel
            }
          ]

          if (this.monthly !== 'true') {
            tmpC.push({
              x: [this.reportDate.daysInMonth],
              y: [this.raw.burialForecast],
              name: 'Forecast - ' + format(',.0f')(this.raw.burialForecast),
              mode: 'markers',
              marker: {size: 10, color: 'black'}
            })
          }
          this.chartDailyCum = tmpC

          let tmp = this.raw.dailyBurialsGroupsThis.map((grp, i) => {
            return {
              x: grp[1].map(v => v[0]),
              y: grp[1].map(v => v[1]),
              marker: {color: d3colors[this.raw.burialsGroups[grp[0]]], opacity: 1},
              name: grp[0],
              type: 'bar',
              hoverinfo: 'name+y' }
          })
          tmp = tmp.concat(
            this.raw.dailyBurialsGroupsPrevious.map((grp, i) => {
              return {
                x: grp[1].map(y => y[0]),
                y: grp[1].map(y => y[1]),
                name: grp[0],
                showlegend: false,
                marker: {color: d3colors[this.raw.burialsGroups[grp[0]]], opacity: 0.7},
                type: 'bar',
                hoverinfo: 'name+y' }
            })
          )
          tmp = tmp.concat({
            x: this.raw.burialsDaily.map(v => v[0]),
            y: this.raw.burialsDaily.map(v => v[1]),
            text: this.raw.burialsDaily.map(v => format(',.0f')(v[1])),
            type: 'scatter',
            mode: 'none',
            hoverinfo: 'x+y',
            noexport: true,
            showlegend: false,
            textposition: 'top'
          })
          tmp = tmp.concat({
            x: [this.reportDate.startOf('month').minus({month: 1}).toISODate(), this.reportDate.startOf('month').toISODate()],
            y: [this.raw.burialsAvPrevious, this.raw.burialsAvPrevious],
            line: {color: 'grey'},
            type: 'scatter',
            noexport: true,
            mode: 'lines',
            hoverinfo: 'none',
            name: 'Av: ' + format('.1f')(this.raw.burialsAvPrevious)
          })
          tmp = tmp.concat({
            x: [this.reportDate.startOf('month').toISODate(), this.reportDate.toISODate()],
            y: [this.raw.burialsAvThis, this.raw.burialsAvThis],
            line: {color: 'black'},
            type: 'scatter',
            noexport: true,
            mode: 'lines',
            hoverinfo: 'none',
            name: 'Av: ' + format('.1f')(this.raw.burialsAvThis)
          })
          this.chartDailyBurialsGroups = tmp
          // Daily sales this month and last year
          return this.secureGet('/api/v1/reports/report/daily_sales?from=' + this.reportDate.startOf('month').minus({months: 1}).toISODate() + '&to=' + this.reportDate.toISODate())
        })
        .then(res => {
          this.raw.dailySales = res.data
          this.raw.dailySalesThis = this.raw.dailySales.filter(v => v.year === this.reportDate.year && v.month === this.reportDate.month)
          this.raw.dailySalesPrevious = this.raw.dailySales.filter(v => v.year === this.reportDate.minus({month: 1}).year && v.month === this.reportDate.minus({month: 1}).month)

          return this.secureGet('/api/v1/reports/report/daily_sales?from=' + this.reportDate.startOf('month').minus({months: 12}).toISODate() + '&to=' + this.reportDate.startOf('month').minus({months: 11}).minus({day: 1}).toISODate())
        })
        .then(res => {
          this.raw.dailySalesLast = res.data

          this.raw.salesDaily = rollups(this.raw.dailySales, v => sum(v, d => d.sale_value_dollar / 1000), v => v.start)
          this.raw.salesDailyThis = rollups(this.raw.dailySalesThis, v => sum(v, d => d.sale_value_dollar / 1000), v => v.start)
          this.raw.salesDailyPrevious = rollups(this.raw.dailySalesPrevious, v => sum(v, d => d.sale_value_dollar / 1000), v => v.start)
          this.raw.salesDailyLast = rollups(this.raw.dailySalesLast, v => sum(v, d => d.sale_value_dollar / 1000), v => v.start)

          let cum0 = 0
          let cum1 = 0
          let cum2 = 0

          let tmp2 = [
            {
              x: this.raw.salesDailyThis.map(v => DateTime.fromISO(v[0]).day),
              y: this.raw.salesDailyThis.map(v => {
                cum1 += v[1]
                return cum1
              }),
              line: {color: 'red', width: 3},
              marker: {size: 7},
              type: 'scatter',
              mode: 'lines+markers',
              name: this.thisMonthLabel
            },
            {
              x: this.raw.salesDailyPrevious.map(v => DateTime.fromISO(v[0]).day),
              y: this.raw.salesDailyPrevious.map(v => {
                cum0 += v[1]
                return cum0
              }),
              line: {color: 'steelblue', width: 2},
              type: 'scatter',
              mode: 'lines',
              name: this.lastMonthLabel
            },
            {
              x: this.raw.salesDailyLast.map(v => DateTime.fromISO(v[0]).day),
              y: this.raw.salesDailyLast.map(v => {
                cum2 += v[1]
                return cum2
              }),
              line: {color: 'grey', width: 2},
              type: 'scatter',
              mode: 'lines',
              name: this.lastYearLabel
            }
          ]
          if (this.monthly !== 'true') {
            tmp2 = tmp2.concat({
              x: [this.reportDate.daysInMonth],
              y: [this.raw.saleForecastDollar],
              name: 'Forecast ' + format(',.0f')(this.raw.saleForecastDollar),
              mode: 'markers',
              marker: {size: 10, color: 'black'}
            })
          }
          this.chartDailyCumSales = tmp2
        })

        .catch((error) => { this.error = error })
    }
  },
  watch: {
    month: function () {
      if (this.month) {
        this.generate()
      }
    }
  }
}
</script>
