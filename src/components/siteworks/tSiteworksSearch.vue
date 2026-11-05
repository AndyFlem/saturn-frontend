<template>
  <div v-if="search">
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text pt-2 pb-3">Site Works</v-card-title>
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
                    v-bind:color="search.params.filters.CONFIRMED ? statusColors.C : 'default'"
                    class="mr-2"
                    @click="filterToggle('CONFIRMED')"
                  >
                  <span class="text-body-1 font-weight-bold">Confirmed</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.COMPLETE ? statusColors.D : 'default'"
                    class="mr-2"
                    @click="filterToggle('COMPLETE')"
                  >
                  <span class="text-body-1 font-weight-bold">Complete</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.CANCELLED ? statusColors.E : 'default'"
                    class="mr-2"
                    @click="filterToggle('CANCELLED')"
                  >
                  <span class="text-body-1 font-weight-bold">Cancelled</span>
                </v-chip>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" sm="5" md="3">
                <v-select
                  v-if="contractors"
                  dense
                  clearable
                  :items="contractors"
                  label="Contractor"
                  item-text="name"
                  item-value="contractor_id"
                  v-model="search.params.contractor_id"
                  @change="doSearch"
                ></v-select>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" sm="5" md="3" class="pr-5">
                <v-select
                  v-if="siteworkTypes"
                  dense
                  clearable
                  :items="siteworkTypes"
                  label="Sitework Type"
                  item-text="sitework_type"
                  item-value="sitework_type_id"
                  v-model="search.params.sitework_type_id"
                  @change="doSearch"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="4" class="pl-5">
                <v-switch
                  v-model="search.params.overdue"
                  class=""
                  hide-details
                  dense
                  @change="doSearch"
                  label="Overdue?"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" sm="6" class="">
                <v-text-field
                    class="mr-7"
                    dense
                    v-model="search.params.customer_name"
                    @keyup.enter="doSearch"
                    label="Site Owner Name"
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
                    v-model="search.params.sitework_year"
                    @keyup.enter="doSearch"
                    label="Work Year"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="4" lg="2">
                <v-select
                  class="mr-4"
                  dense
                  clearable
                  :items="months"
                  @input="siteworkMonthChange"
                  v-model="search.params.sitework_month"
                  @keyup.enter="doSearch"
                  label="Month"
                ></v-select>
              </v-col>
              <v-col cols="4" lg="2">
                <v-select
                  class="mr-0"
                  dense
                  clearable
                  :items="siteworkDays"
                  @input="doSearch"
                  v-model="search.params.sitework_day"
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
                <span v-if="search.siteworks"><b>Total: {{formatInt(search.siteworks.length)}}</b></span>
              </v-col>
              <v-col cols="12" md="4" class="d-flex justify-end ">
                    <v-btn class="mr-3" color="primary" @click="clear">
                      Clear
                      <v-icon right>mdi-close</v-icon>
                    </v-btn>
                    <v-btn v-if="$userCheckPermission('PERM_WORKS')" class="mr-3" color="primary" @click="doExport">
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
              v-if="search.siteworks" :items="search.siteworks"
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
                    :key="item.sitework_id"
                    cols="12"
                  >
                    <sitework-search-result :value="item" />
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
import SiteworkSearchResult from '@/components/siteworks/SiteworkSearchResult'
import helpers from '@/services/helpers'

export default {
  name: 'tSiteworksSearch',
  components: {
    SiteworkSearchResult,
    ErrorDisp
  },
  data () {
    return {
      contractors: null,
      siteworkTypes: null,
      itemsPerPageArray: [10, 20, 30],
      itemsPerPage: 10,
      error: null,
      loading: null,
      page: 1,
      orderBys: [
        {text: 'Work order no', value: 'sitework_id DESC'},
        {text: 'Works date - oldest first', value: 'sitework_time ASC'},
        {text: 'Works date - newest first', value: 'sitework_time DESC'},
        {text: 'Customer name', value: 'full_name'},
      ],
      search: null
    }
  },
  computed: {
    statusColors: helpers.statusColors,
    months: helpers.monthList,
    numberOfPages () {
      if (this.search.siteworks) {
        return Math.ceil(this.search.siteworks.length / this.itemsPerPage)
      } else {
        return 0
      }
    },
    siteworkDays () {
      const days = []
      if (!this.search.params.sitework_month) {
        return days
      }
      const month = this.search.params.sitework_month
      const year = this.search.params.sitework_year
      const daysInMonth = new Date(year, month, 0).getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
      }
      return days
    },
  },
  mounted () {
    // Get the list of sitework types for the dropdown
    this.secureGet('/api/v1/sitework_types')
      .then(res => {
        this.siteworkTypes = res.data
      })
      .catch((error) => { this.error = error })

    // Get the list of contractors for the dropdown
    this.secureGet('/api/v1/sitework_contractors')
      .then(res => {
        this.contractors = res.data
      })
      .catch((error) => { this.error = error })

    if (!this.$root.state.siteworkSearch) {
      this.$root.state.siteworkSearch = this.initialSearch()
    }
    this.search = this.$root.state.siteworkSearch
    this.doSearch()
  },
  methods: {
    updateItemsPerPage (number) {
      this.itemsPerPage = number
    },
    pageChange (evt) {
      if (!this.loading) {
        this.$root.state.siteworkSearch.page = evt.page
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
        siteworks: [],
        params: {
          orderby: 'sitework_id',
          filters: { DRAFT: true, CONFIRMED: true, COMPLETE: false, CANCELLED: false },
          customer_name: null,
          sitework_year: null,
          sitework_month: null,
          sitework_day: null,
          contractor_id: null,
          sitework_type_id: null,
          overdue: false
        }
      }
      return oInitial
    },
    clear () {
      this.search.siteworks = []
      this.search = this.initialSearch()
      this.$root.state.siteworkSearch = this.initialSearch()
      this.doSearch()
    },
    filterToggle (key) {
      this.search.params.filters[key] = !this.search.params.filters[key]
      this.doSearch()
    },
    siteworkMonthChange () {
      this.search.params.sitework_day = null
      this.doSearch()
    },
    doExport () {
      return this.secureGetXLSX('/api/v1/siteworks/searchExport', this.search.params)
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          const name = DateTime.now().toFormat('yyyyLLdd_HHmmss') + '_Siteworks_Export.xlsx'
          link.setAttribute('download', name) // or any other extension
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => { this.error = error })
    },
    doSearch () {
      this.search.siteworks = []
      this.loading = true
      return this.secureGet('/api/v1/siteworks/search', this.search.params)
        .then(res => {
          this.search.siteworks = res.data.map(b => parseInt(b.sitework_id))
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
