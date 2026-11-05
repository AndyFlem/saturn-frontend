<template>
  <div v-if="search">
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text pt-2 pb-3">Credit Notes</v-card-title>
          <v-card-text>
            <v-row class="mt-5">
              <v-col cols="12" sm="12" class="mb-5">
                <v-chip
                    v-bind:color="search.params.filters.DRAFT ? statusColors.A : 'default'"
                    class="mr-2"
                    @click="filterToggle('DRAFT')"
                  >
                  <span class="text-body-1 font-weight-bold">Draft</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.UNAUTHORIZED ? statusColors.B : 'default'"
                    class="mr-2"
                    @click="filterToggle('UNAUTHORIZED')"
                  >
                  <span class="text-body-1 font-weight-bold">Unauthorized</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.POSTED ? statusColors.C : 'default'"
                    class="mr-2"
                    @click="filterToggle('POSTED')"
                  >
                  <span class="text-body-1 font-weight-bold">Posted</span>
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
            </v-row>
            <v-row no-gutters>
              <v-col cols="4" lg="2">
                <v-text-field
                    class="mr-4"
                    dense
                    clearable
                    v-model="search.params.posted_year"
                    @keyup.enter="doSearch"
                    label="Posted Year"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="4" lg="2">
                <v-select
                  class="mr-4"
                  dense
                  clearable
                  :items="months"
                  @input="postedMonthChange"
                  v-model="search.params.posted_month"
                  @keyup.enter="doSearch"
                  label="Month"
                ></v-select>
              </v-col>
              <v-col cols="4" lg="2">
                <v-select
                  class="mr-0"
                  dense
                  clearable
                  :items="postedDays"
                  @input="doSearch"
                  v-model="search.params.posted_day"
                  @keyup.enter="doSearch"
                  label="Day"
                ></v-select>
              </v-col>
              <v-col cols="0" lg="1"></v-col>
            </v-row>
            <v-row class="secondary pt-1 mb-4" justify="space-between">
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
              <v-col cols="12" md="2" class="text-body-2 pl-10 pt-10">
                <span v-if="search.credits"><b>Total: {{formatInt(search.credits.length)}}</b></span>
              </v-col>
              <v-col cols="12" md="4" class="d-flex justify-end ">
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
              v-if="search.credits" :items="search.credits"
              :items-per-page.sync="itemsPerPage"
              :page="page"
              @pagination="pageChange"
              :loading="loading"
              hide-default-footer
            >
              <template v-slot:default="props">
                <v-row>
                  <v-col
                    v-for="item in props.items"
                    :key="item"
                    cols="12"
                  >
                    <credit-search-result :value="item" />
                  </v-col>
                </v-row>
              </template>
              <template v-slot:footer>
                <v-row class="mt-2 pl-10 pr-10 text-body-2" align="center" justify="center">
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
import ErrorDisp from '@/components/shared/Error'
import CreditSearchResult from '@/components/credit/CreditSearchResult'
import helpers from '@/services/helpers'

export default {
  name: 'tCreditSearch',
  components: {
    CreditSearchResult,
    ErrorDisp
  },
  data () {
    return {
      itemsPerPageArray: [10, 20, 30],
      itemsPerPage: 10,
      error: null,
      loading: null,
      page: 1,
      orderBys: [
        {text: 'Posted date - oldest first', value: 'posted_at ASC'},
        {text: 'Posted date - newest first', value: 'posted_at DESC'},
        {text: 'Customer name', value: 'full_name'},
        {text: 'Value', value: 'value DESC'},
      ],
      search: null
    }
  },
  computed: {
    statusColors: helpers.statusColors,
    months: helpers.monthList,
    numberOfPages () {
      if (this.search.credits) {
        return Math.ceil(this.search.credits.length / this.itemsPerPage)
      } else {
        return 0
      }
    },
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
    postedDays () {
      const days = []
      if (!this.search.params.posted_month) {
        return days
      }
      const month = this.search.params.posted_month
      const year = this.search.params.posted_year
      const daysInMonth = new Date(year, month, 0).getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
      }
      return days
    },
  },
  mounted () {
    if (!this.$root.state.creditSearch) {
      this.$root.state.creditSearch = this.initialSearch()
    }
    this.search = this.$root.state.creditSearch
    this.doSearch()
  },
  methods: {
    updateItemsPerPage (number) {
      this.itemsPerPage = number
    },
    pageChange (evt) {
      if (!this.loading) {
        this.$root.state.creditSearch.page = evt.page
      }
    },
    nextPage () {
      if (this.page + 1 <= this.numberOfPages) this.page += 1
    },
    formerPage () {
      if (this.page - 1 >= 1) this.page -= 1
    },
    initialSearch () {

      const oInitial = {
        page: 1,
        credits: [],
        params: {
          orderby: 'credit_id',
          filters: {DRAFT: true, UNAUTHORIZED: true, POSTED: true},
          customer_name: null,
          created_year: null,
          created_month: null,
          created_day: null,
          posted_year: null,
          posted_month: null,
          posted_day: null,
        }
      }
      if (this.$route.query.requires_auth) {
        oInitial.params.filters = { DRAFT: false, UNAUTHORIZED: true, POSTED: false }
      }
      return oInitial
    },
    clear () {
      this.search.credits = []
      this.search = this.initialSearch()
      this.$root.state.creditSearch = this.initialSearch()
      this.doSearch()
    },
    filterToggle (key) {
      this.search.params.filters[key] = !this.search.params.filters[key]
      this.doSearch()
    },
    createdMonthChange () {
      this.search.params.created_day = null
      this.doSearch()
    },
    postedMonthChange () {
      this.search.params.posted_day = null
      this.doSearch()
    },
    doExport () {
      return this.secureGetXLSX('/api/v1/credits/searchExport', this.search.params)
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          const name = DateTime.now().toFormat('yyyyLLdd_HHmmss') + '_Credits_Export.xlsx'
          link.setAttribute('download', name)
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => { this.error = error })
    },
    doSearch () {
      this.search.credits = []
      this.loading = true
      return this.secureGet('/api/v1/credits/search', this.search.params)
        .then(res => {
          this.search.credits = res.data.map(b => parseInt(b.credit_id))
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
