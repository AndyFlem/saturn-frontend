<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Monthly Schedules
          </v-card-title>
          <v-card-text>
            <v-row class="mt-5 ml-3">
              <v-col cols="4" lg="2">
                <v-select
                  class="mr-4"
                  :items="years"
                  v-if="years && allMonths"
                  item-text="year"
                  item-value="year"
                  v-model="year"
                  label="Year"
                  @change="yearSelected"
                ></v-select>
              </v-col>
              <v-col cols="4" lg="2">
                <v-select
                  class="mr-4"
                  v-if="years && allMonths"
                  :disabled="!year"
                  :items="months"
                  v-model="month"
                  label="Month"
                  @change="monthSelected"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-card>
                  <v-card-text v-if="monthReport">
                  <v-row>
                    <v-col v-if="month" cols="12" class="pl-3 pb-0">
                      <div>
                        <v-icon color="primary" class="pr-3">mdi-download</v-icon>
                        <a @click="generateExcel">Download Monthly Schedule</a>
                      </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6" class="pl-3 pb-0">
                      <b>Burials: </b>{{monthReport.burials}}
                    </v-col>
                    <v-col cols="12" md="6" class="pl-3 pb-0">
                      <b>Sites Sold: </b>{{monthReport.sites_sold}}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6" class="pl-3 pb-0">
                      <b>Sales Created: </b>{{monthReport.sales_created}}
                    </v-col>
                    <v-col cols="12" md="6" class="pl-3 pb-0">
                      <b>Sales Ordered: </b>{{monthReport.sales_ordered}}
                    </v-col>
                    <v-col cols="12" md="6" class="pl-3 pb-0">
                      <b>Sales Paid: </b>{{monthReport.sales_paid}}
                    </v-col>
                    <v-col cols="12" md="6" class="pl-3 pb-0">
                      <b>Sales Fulfilled: </b>{{monthReport.sales_fulfilled}}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6" class="pl-3 pb-0">
                      <b>Value Ordered: </b>{{formatMInt(monthReport.value_ordered)}} ({{formatDollar(monthReport.value_ordered_dollar)}})
                    </v-col>
                    <v-col cols="12" md="6" class="pl-3 pb-0">
                      <b>Value Receipted: </b>{{formatMInt(monthReport.value_receipted)}} ({{formatDollar(monthReport.value_receipted_dollar)}})
                    </v-col>
                  </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text>
            <daily-charts :year="year" :month="month" :day="day" monthly="true"/>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import DailyCharts from '@/components/reports/DailyCharts'
import { DateTime } from 'luxon'

export default {
  name: 'MonthlyReport',
  components: {
    ErrorDisp,
    DailyCharts
  },
  props: [],
  data () {
    return {
      error: null,
      year: null,
      month: null,
      years: null,
      months: [],
      allMonths: null,
      monthReport: null,
      day: null
    }
  },
  computed: {
  },
  created () {
    this.secureGet('/api/v1/reports/report/years')
      .then(res => {
        this.years = res.data.map(v => v.year).sort((a, b) => b - a)
      })
      .catch((error) => { this.error = error })
    this.secureGet('/api/v1/reports/report/months?to=' + DateTime.local().startOf('month').minus({month: 1}).toISODate())
      .then(res => {
        this.allMonths = res.data
      })
      .catch((error) => { this.error = error })
  },
  methods: {
    yearSelected () {
      this.month = null
      this.day = null
      this.months = this.allMonths.filter(v => v.year === this.year).map(v => v.month).sort((a, b) => b - a)
    },
    monthSelected () {
      this.day = DateTime.fromObject({year: this.year, month: this.month, day: 1}).endOf('month').day
      this.secureGet('/api/v1/reports/month_report/' + this.year + '/' + this.month)
        .then(response => {
          this.monthReport = response.data
        })
    },
    generateExcel () {
      this.$http.securedXLSX.post('/api/v1/reports/export_month/' + this.year + '/' + this.month)
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'MP_Schedule_' + this.year + '_' + this.month + '.xlsx') // or any other extension
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => { this.error = error })
    }
  },
  watch: {
  }
}
</script>

<style scoped>

</style>
