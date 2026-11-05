<template>
  <div v-if="search">
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text pt-2 pb-3">Sales</v-card-title>
          <v-card-text>
            <v-row no-gutters class="mt-5">
              <v-col cols="12" sm="6">
                <v-chip
                    v-bind:color="search.params.filters.DRAFT ? statusColors.A : 'default'"
                    class="mr-2"
                    @click="filterToggle('DRAFT')"
                  >
                  <span class="text-body-1 font-weight-bold">Draft</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.UNAUTHORIZED ? statusColors.F : 'default'"
                    class="mr-2"
                    @click="filterToggle('UNAUTHORIZED')"
                  >
                  <span class="text-body-1 font-weight-bold">Unauthorized</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.ORDERED ? statusColors.B : 'default'"
                    class="mr-2"
                    @click="filterToggle('ORDERED')"
                  >
                  <span class="text-body-1 font-weight-bold">Ordered</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.PAID ? statusColors.C : 'default'"
                    class="mr-2 mt-2"
                    @click="filterToggle('PAID')"
                  >
                  <span class="text-body-1 font-weight-bold">Paid</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.FULFILLED ? statusColors.D : 'default'"
                    class="mr-2 mt-2"
                    @click="filterToggle('FULFILLED')"
                  >
                  <span class="text-body-1 font-weight-bold">Fulfilled</span>
                </v-chip>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" sm="6" class="">
                <v-text-field
                    class="mr-7"
                    dense
                    v-model="search.params.customer_name"
                    @keyup.enter="doSearch"
                    label="Customer Name"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="0" sm="1"></v-col>
              <v-col cols="12" sm="5" class="">
                <v-switch
                  v-model="search.params.flagged"
                  class="pt-0 mt-10 pb-0"
                  hide-details
                  dense
                  @change="doSearch"
                  label="Only flagged sales?"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="4" lg="2">
                <v-text-field
                    class="mr-4"
                    dense
                    clearable
                    v-model="search.params.created_year"
                    @keyup.enter="doSearch"
                    label="Created Year"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="4" lg="2">
                <v-select
                  class="mr-4"
                  dense
                  clearable
                  :items="months"
                  @input="createdMonthChange"
                  v-model="search.params.created_month"
                  @keyup.enter="doSearch"
                  label="Month"
                ></v-select>
              </v-col>
              <v-col cols="4" lg="2">
                <v-select
                  class="mr-0"
                  dense
                  clearable
                  :items="createdDays"
                  @input="doSearch"
                  v-model="search.params.created_day"
                  @keyup.enter="doSearch"
                  label="Day"
                ></v-select>
              </v-col>
              <v-col cols="0" lg="1"></v-col>
              <v-col cols="12" lg="5" class="">
                <v-switch
                  v-model="search.params.credit_sale"
                  class="pt-0 mt-10 pb-0"
                  hide-details
                  dense
                  @change="doSearch"
                  label="Credit sales?"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="4" lg="2">
                <v-text-field
                    class="mr-4"
                    dense
                    clearable
                    v-model="search.params.ordered_year"
                    @keyup.enter="doSearch"
                    label="Ordered Year"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="4" lg="2">
                <v-select
                  class="mr-4"
                  dense
                  clearable
                  :items="months"
                  @input="orderedMonthChange"
                  v-model="search.params.ordered_month"
                  @keyup.enter="doSearch"
                  label="Month"
                ></v-select>
              </v-col>
              <v-col cols="4" lg="2">
                <v-select
                  class="mr-0"
                  dense
                  clearable
                  :items="orderedDays"
                  @input="doSearch"
                  v-model="search.params.ordered_day"
                  @keyup.enter="doSearch"
                  label="Day"
                ></v-select>
              </v-col>
              <v-col cols="0" lg="1"></v-col>
              <v-col cols="12" sm="5" class="">
                <v-switch
                  v-model="search.params.partial_outstanding"
                  class="pt-0 mt-10 pb-0"
                  hide-details
                  dense
                  @change="doSearch"
                  label="Partial Payment outstanding?"
                ></v-switch>
              </v-col>

            </v-row>
            <v-row no-gutters>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                    class="mr-7"
                    dense
                    v-model="search.params.sale_id"
                    @keyup.enter="doSearch"
                    label="Sale No"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-if="tariffs"
                  dense
                  clearable
                  :items="tariffs"
                  label="Tariff"
                  item-text="name"
                  item-value="tariff_id"
                  v-model="search.params.tariff_id"
                  @change="doSearch"
                ></v-select>
              </v-col>
              <v-col cols="0" lg="1"></v-col>
              <v-col cols="12" sm="5" class="">
                <v-switch
                  v-model="search.params.outstanding"
                  class="pt-0 mt-10 pb-0"
                  hide-details
                  dense
                  @change="doSearch"
                  label="Payment outstanding?"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" lg="6" class="">
                <v-select
                  v-if="users"
                  dense
                  clearable
                  :items="users"
                  label="Order User"
                  item-text="user_name"
                  item-value="user_id"
                  v-model="search.params.ordered_by_user_id"
                  @change="doSearch"
                ></v-select>
              </v-col>
              <v-col cols="0" lg="1"></v-col>

            </v-row>
            <v-row class="secondary pt-5 mb-4 pl-5 pr-5" justify="space-between">
              <v-col cols="12" md="6" class="pb-0">
                <v-select
                  dense
                  @change="doSearch"
                  :items="orderBys"
                  class="mr-3"
                  v-model="search.params.orderby"
                  label="Order By"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="2" :class="`button pt-0 ${$vuetify.breakpoint.mdAndUp ? 'pt-8 pl-10' : ''}`">
                <span v-if="search.sales"><b>Total: {{formatInt(search.sales.length)}}</b></span>
              </v-col>
              <v-col cols="12" sm="6" md="4" class="d-flex justify-end ">
                    <v-btn class="mr-3" color="primary" @click="clear">
                      Clear
                      <v-icon right>mdi-close</v-icon>
                    </v-btn>
                    <v-btn v-if="$userCheckPermission('PERM_ACCOUNTS')" class="mr-3" color="primary" @click="doExport">
                      Export
                      <v-icon right>mdi-export</v-icon>
                    </v-btn>
                    <v-btn color="primary" @click="doSearch">
                      Search
                      <v-icon right dark>mdi-magnify</v-icon>
                    </v-btn>
              </v-col>
            </v-row>
            <v-data-iterator
              v-if="search.sales" :items="search.sales"
              :items-per-page.sync="itemsPerPage"
              :page="page"
              :loading="loading"
              hide-default-footer
            >
              <template v-slot:default="props">
                <template
                    v-for="(item, indx) in props.items"
                    cols="12"
                  >
                    <sale-search-result :key="indx" :value="item"/>
                </template>
              </template>
              <template v-slot:footer>
                <v-row class="mt-2 pl-5 pr-5 text-body-2" align="center" justify="center">
                  <span class="grey--text">Items per page</span>
                  <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn dark text color="primary" class="ml-2" v-bind="attrs" v-on="on">
                        {{ itemsPerPage }}
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item
                        v-for="(number, index) in itemsPerPageArray"
                        :key="index"
                        @click="updateItemsPerPage(number)"
                      >
                        <v-list-item-title>{{ number }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <v-spacer></v-spacer>
                  <span class="mr-4 grey--text">Page {{ page }} of {{ numberOfPages }}</span>
                  <v-btn fab dark x-small color="primary" class="mr-1" @click="formerPage">
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>
                  <v-btn fab dark x-small color="primary" class="ml-1" @click="nextPage">
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                </v-row>
              </template>
            </v-data-iterator>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import SaleSearchResult from '@/components/sales/SaleSearchResult'
import ErrorDisp from '@/components/shared/Error'
import helpers from '@/services/helpers'

export default {
  name: 'Sales',
  components: {
    SaleSearchResult,
    ErrorDisp
  },
  data () {
    return {
      itemsPerPageArray: [10, 40, 100],
      itemsPerPage: 10,
      error: null,
      loading: null,
      tariffs: null,
      page: 1,
      users: null,
      orderBys: [
        {text: 'Order date - oldest first', value: 'ordered_at ASC'},
        {text: 'Order date - newest first', value: 'ordered_at DESC'},
        {text: 'Update date - newest first', value: 'updated_at DESC'},
        {text: 'Update date - oldest first', value: 'updated_at ASC'},
        {text: 'Outstanding payments', value: 'value_outstanding DESC'},
        {text: 'Customer name', value: 'full_name'},
        {text: 'Sale value', value: 'value DESC'},
        {text: 'Sale value - smallest first', value: 'value ASC'}
      ],
      search: null
    }
  },
  computed: {
    statusColors: helpers.statusColors,
    months: helpers.monthList,
    createdDays () {
      const days = []
      if (!this.search.params.created_month) {
        return days
      }
      const month = this.search.params.created_month
      const year = this.search.params.created_year
      const daysInMonth = new Date(year, month, 0).getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
      }
      return days
    },
    orderedDays () {
      const days = []
      if (!this.search.params.ordered_month) {
        return days
      }
      const month = this.search.params.ordered_month
      const year = this.search.params.ordered_year
      const daysInMonth = new Date(year, month, 0).getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
      }
      return days
    },

    filteredKeys () {
      return this.keys.filter(key => key !== `Name`)
    },
    numberOfPages () {
      if (this.search.sales) {
        return Math.ceil(this.search.sales.length / this.itemsPerPage)
      } else {
        return 0
      }
    }
  },
  created () {
    this.secureGet('/api/v1/tariffs')
      .then(res => {
        this.tariffs = res.data
      })
      .catch((error) => { this.error = error })

    this.secureGet('/api/v1/users')
      .then(res => {
        this.users = res.data.sort((a, b) => {
          return a.user_name.localeCompare(b.user_name)
        })
      })
      .catch((error) => { this.error = error })

    this.search = this.initialSearch()
    this.doSearch()
  },
  methods: {
    updateItemsPerPage (number) {
      this.itemsPerPage = number
    },
    nextPage () {
      if (this.page + 1 <= this.numberOfPages) this.page += 1
    },
    formerPage () {
      if (this.page - 1 >= 1) this.page -= 1
    },
    initialSearch () {
      const params = {
        orderby: 'updated_at DESC',
        filters: {DRAFT: true, UNAUTHORIZED: true, ORDERED: true, PAID: false, FULFILLED: false},
        customer_name: null,
        created_year: null,
        created_month: null,
        created_day: null,
        ordered_year: null,
        ordered_month: null,
        ordered_day: null,
        sale_id: null,
        flagged: false,
        partial_outstanding: false,
        outstanding: false,
        ordered_by_user_id: null,
        credit_sale: false,
        tariff_id: null
      }

      if (this.$route.query.requires_auth) {
        params.filters = {DRAFT: false, UNAUTHORIZED: true, ORDERED: false, PAID: false, FULFILLED: false}
      }
      if (this.$route.query.filters) {
        const filters = this.$route.query.filters.split(',')
        params.filters = {
          DRAFT: filters.includes('DRAFT'),
          UNAUTHORIZED: filters.includes('UNAUTHORIZED'),
          ORDERED: filters.includes('ORDERED'),
          PAID: filters.includes('PAID'),
          FULFILLED: filters.includes('FULFILLED')
        }
      }
      if (this.$route.query.flagged) {
        params.flagged = true
        params.filters = {DRAFT: true, UNAUTHORIZED: true, ORDERED: true, PAID: true, FULFILLED: true}
      }
      return {
        page: 1,
        sales: [],
        params: params
      }
    },
    clear () {
      this.search.sales = []
      this.search = this.initialSearch()
      this.doSearch()
    },
    filterToggle (key) {
      this.search.params.filters[key] = !this.search.params.filters[key]
      this.doSearch()
    },
    doExport () {
      return this.secureGetXLSX('/api/v1/sales/searchExport', this.search.params)
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          const name = DateTime.now().toFormat('yyyyLLdd_HHmmss') + '_Sales_Export.xlsx'
          link.setAttribute('download', name) // or any other extension
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => { this.error = error })
    },
    createdMonthChange () {
      this.search.params.created_day = null
      this.doSearch()
    },
    orderedMonthChange () {
      this.search.params.ordered_day = null
      this.doSearch()
    },
    doSearch () {
      this.search.sales = []
      this.loading = true
      return this.secureGet('/api/v1/sales/search', this.search.params)
        .then(res => {
          this.search.sales = res.data.map(b => parseInt(b.sale_id))
          this.page = this.search.page
          this.loading = false
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>

<style scoped>
</style>
