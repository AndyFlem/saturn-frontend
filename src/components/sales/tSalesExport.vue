<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Sales Export Batches
          </v-card-title>
          <v-card-text class="mt-5 pl-10 mb-0 pb-0 text-body-1">
            <v-row>
              <v-col cols="12" md="4" lg="3">
                <v-select
                  v-model="selectedYear"
                  :items="years"
                  label="Year"
                  dense
                  outlined
                  hide-details
                />
              </v-col>
            </v-row>
            <template v-if="loaded">
              <v-row>
                <v-col cols="12"  v-for="(month,i) in months" :key="month.month_name">
                  <v-card elevation="2">
                    <v-card-title class="secondary text-body-1">
                      <b>{{monthList[month.month - 1].text}} {{ month.year }}</b>
                    </v-card-title>
                    <v-card-text>
                      <v-row v-if="month.sales_count>0 || month.receipts_count>0 || month.credits_count>0 || month.vouchers_count>0">
                        <v-col cols="12" class="pb-1">
                          <b>Unbatched transactions:</b>
                        </v-col>
                        <v-col cols="12" class="pl-5 pt-1 pb-1">
                            Sales: {{ month.sales_count }}
                        </v-col>
                        <v-col cols="12" class="pl-5 pt-1 pb-1">
                            Receipts: {{ month.receipts_count }}
                        </v-col>
                        <v-col cols="12" class="pl-5  pt-1 pb-1">
                            Credit Notes: {{ month.credits_count }}
                        </v-col>
                        <v-col cols="12" class="pl-5 pt-1 pb-1">
                            Credit Vouchers: {{ month.vouchers_count }}
                        </v-col>
                        <v-col cols="12" class="">
                          <template v-if="!monthIsCurrent(month) && $userCheckPermission('PERM_ACCOUNTS_SUPER')" cols="12">
                            <v-btn  @click="createBatch(month)" small color="primary" class="white--text">Batch</v-btn>
                          </template>
                        </v-col>
                      </v-row>
                      <v-row v-else>
                        <v-col cols="12" class="pb-1">
                          <b>No transactions to batch.</b>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" class="pb-1">
                          <b>Existing batches:</b>
                        </v-col>
                        <template v-if="month.batches.length>0">
                          <v-col cols="12" class="pl-5 pt-1 pb-1" v-for="batch in month.batches" :key="batch.batch_name">
                            <v-row no-gutters>
                              <col cols="12" sm="4" md="2" class="pl-3 pr-3">
                                 <b>Batch No: </b> {{ batch.export_batch_id }}
                              </col>
                              <col cols="12" sm="4" md="2" class="pl-3 pr-3">
                                 <b>Created: </b> {{ formatD(batch.created_at) }}
                              </col>
                              <col cols="12" sm="4" md="2" class="pl-3 pr-3">
                                 <b>Batch Name: </b> {{ batch.batch_name }}
                              </col>
                              </v-row>
                              <v-row no-gutters>
                              <col cols="12" class="pl-3 pr-3">
                                 {{ batch.sale_count }} sales, {{ batch.receipt_count }} receipts, {{ batch.credit_count }} credit notes, {{ batch.voucher_count }} credit vouchers
                              </col>
                              </v-row>
                              <v-row no-gutters>
                              <col cols="12" class="pl-3 pr-3">
                                <v-btn @click="exportBatch(batch)" small text color="primary" class="white--text mr-5">Download</v-btn>
                              </col>
                            </v-row>
                            <v-row no-gutters>
                              <col cols="12" class="pl-3 pr-3">
                                <v-divider class="mt-2 mb-2"/>
                              </col>
                            </v-row>
                          </v-col>
                        </template>
                        <v-col cols="12" v-else class="pl-5 pt-1 pb-1">
                          None
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import helpers from '@/services/helpers'

export default {
  name: 'SalesExport',
  components: {
    ErrorDisp
  },
  data () {
    const currentYear = new Date().getFullYear()
    return {
      error: null,
      months: null,
      loaded: false,
      selectedYear: currentYear,
      years: Array.from({ length: currentYear - 2019 + 1 }, (_, index) => 2019 + index)
    }
  },
  created () {
    this.loadBatches()
  },
  watch: {
    selectedYear () {
      this.loadBatches()
    }
  },
  computed: {
    monthList: helpers.monthList,
    curMonth () {
      const now = new Date()
      return (now.getMonth() +1) + ' ' + now.getFullYear()
    }
  },
  methods: {
    monthIsCurrent (month) {
      const now = new Date()
      console.log(month.year, month.month, now.getFullYear(), (now.getMonth() + 1))
      const ret = (month.year === now.getFullYear()) && month.month === (now.getMonth() + 1)
      console.log(ret)
      return ret
    },
    async loadBatches () {
      this.loaded = false
      this.error = null

      try {
        if (this.selectedYear) {
          const monthsRes = await this.secureGet('/api/v1/batches_months/' + this.selectedYear)
          this.months = monthsRes.data
          //this.months.shift()
          this.months = this.months.map(v => {
            v.batches = []
            return v
          })

          const batchesRes = await this.secureGet('/api/v1/batches/' + this.selectedYear)
          batchesRes.data.forEach(batch => {
            const month = this.months.find(v => v.month_name === batch.month_name)
            if (month) {
              month.batches.push(batch)
            }
          })

          this.loaded = true
        }
      } catch (err) {
        this.error = err
      }
    },
    exportBatch (batch) {
      this.$http.securedXLSX.post('/api/v1/batches/excel/' + batch.export_batch_id)
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'Batch_' + batch.batch_name + '.xlsx') // or any other extension
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => { this.error = error })
    },
    createBatch (month) {
      this.securePost('/api/v1/batches/' + month.year + '/' + month.month)
        .then(res => {
          if (res.data) {
            this.months.filter(v => v.month_name === res.data.month_name)[0].batches.push(res.data)
            this.months.filter(v => v.month_name === res.data.month_name)[0].sales_count = 0
            this.months.filter(v => v.month_name === res.data.month_name)[0].receipts_count = 0
            this.months.filter(v => v.month_name === res.data.month_name)[0].vouchers_count = 0
            this.months.filter(v => v.month_name === res.data.month_name)[0].credits_count = 0
          }
        })
        .catch(err => {
          this.error = err
        })
    }
  }
}
</script>

<style scoped>

</style>
