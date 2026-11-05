<template>
  <div v-if="search">
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text pt-2 pb-3">Burials</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-row class="mt-5">
                  <v-col cols="12" class="mb-5">
                    <v-chip
                        v-bind:color="search.params.filters.DRAFT ? statusColors.A : 'default'"
                        class="mr-2"
                        @click="filterToggle('DRAFT')"
                      >
                      <span class="text-body-1 font-weight-bold">Draft</span>
                    </v-chip>
                    <v-chip
                        v-bind:color="search.params.filters.UNSITED ? statusColors.B : 'default'"
                        class="mr-2"
                        @click="filterToggle('UNSITED')"
                      >
                      <span class="text-body-1 font-weight-bold">Unsited</span>
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
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-text-field
                        class="mr-3"
                        dense
                        clearable
                        v-model="search.params.name"
                        @input="doSearch"
                        @keyup.enter="doSearch"
                        label="Deceased or Customer Name"
                        type="text"
                      ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="6">
                    <v-text-field
                        class="mr-3"
                        dense
                        v-model="search.params.burial_id"
                        @keyup.enter="doSearch"
                        clearable
                        label="Burial no"
                        type="text"
                      ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                        class="mr-3"
                        dense
                        v-model="search.params.id_number"
                        @keyup.enter="doSearch"
                        clearable
                        label="Deceased Government Id"
                        type="text"
                      ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="4">
                    <v-text-field
                        class="mr-4"
                        dense
                        clearable
                        @input="fromYearSet"
                        v-model="search.params.burial_from_year"
                        label="Burial From Year"
                        type="text"
                      ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      class="mr-4"
                      dense
                      clearable
                      :items="months"
                      :disabled="!search.params.burial_from_year"
                      @input="fromMonthSet"
                      v-model="search.params.burial_from_month"
                      label="Month"
                    ></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      dense
                      :disabled="!search.params.burial_from_month"
                      @input="fromDaySet"
                      clearable
                      :items="days"
                      v-model="search.params.burial_from_day"
                      label="Day"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="4">
                    <v-text-field
                        class="mr-4"
                        dense
                        clearable
                        @input="toYearSet"
                        v-model="search.params.burial_to_year"
                        label="Burial To Year"
                        type="text"
                      ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      class="mr-4"
                      dense
                      clearable
                      :items="months"
                      :disabled="!search.params.burial_to_year"
                      @input="toMonthSet"
                      v-model="search.params.burial_to_month"
                      label="Month"
                    ></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      dense
                      :disabled="!search.params.burial_to_month"
                      @input="toDaySet"
                      clearable
                      :items="days"
                      v-model="search.params.burial_to_day"
                      label="Day"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="4">
                    <v-text-field
                        class="mr-4"
                        dense
                        clearable
                        v-model="search.params.birth_year"
                        @keyup.enter="doSearch"
                        @input="doSearch"
                        label="Birth Year"
                        type="text"
                      ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      class="mr-4"
                      dense
                      clearable
                      :items="months"
                      v-model="search.params.birth_month"
                      @keyup.enter="doSearch"
                      @input="doSearch"
                      label="Month"
                    ></v-select>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      dense
                      clearable
                      :items="days"
                      @change="doSearch"
                      v-model="search.params.birth_day"
                      @keyup.enter="doSearch"
                      @input="doSearch"
                      label="Day"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <search-site-selector @input="doSearch" v-model="search.params.site" />
                  </v-col>

                </v-row>
              </v-col>
              <v-col cols="12" sm="6" :class="`${$vuetify.breakpoint.smAndUp ? 'mt-10 pl-10' : 'pt-0 pl-5'}`">
                <v-row no-gutters>
                  <v-col cols="12" class="">
                    <v-switch
                      v-model="search.params.cod_is_contagious"
                      class="mt-0"
                      dense
                      hide-details
                      @change="doSearch"
                      label="Contagious burials?"
                    ></v-switch>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-switch
                      v-model="search.params.flag"
                      dense
                      hide-details
                      @change="doSearch"
                      label="Only flagged burials?"
                    ></v-switch>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12" class="pb-10">
                    <v-switch
                      v-model="search.params.legacy_flag"
                      dense
                      hide-details
                      @change="doSearch"
                      label="Legacy flagged burials?"
                    ></v-switch>
                  </v-col>
              <v-col cols="12" lg="10">
                <v-select
                  v-if="undertakers"
                  dense
                  clearable
                  :items="undertakers"
                  label="Undertaker"
                  item-text="name"
                  item-value="contractor_id"
                  v-model="search.params.undertaker_id"
                  @change="doSearch"
                ></v-select>
              </v-col>
              <v-col cols="12" lg="10">
                <v-select
                  v-if="siteTypes"
                  dense
                  clearable
                  :items="siteTypes"
                  label="Site type"
                  :item-text="siteTypeText"
                  item-value="site_type_id"
                  v-model="search.params.site_type_id"
                  @change="doSearch"
                ></v-select>
              </v-col>
                </v-row>
              </v-col>
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
                <span v-if="search.burials"><b>Total: {{formatInt(search.burials.length)}}</b></span>
              </v-col>
              <v-col cols="12" sm="6" md="4" class="d-flex justify-end ">
                    <v-btn class="mr-3 mb-5" color="primary" @click="clear">
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
              v-if="search.burials" :items="search.burials"
              :items-per-page.sync="itemsPerPage"
              :page="page"
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
                    <burial-search-result expand :value="item" />
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
import BurialSearchResult from '@/components/burials/BurialSearchResult'
import ErrorDisp from '@/components/shared/Error'
import SearchSiteSelector from '@/components/sites/SearchSiteSelector'
import helpers from '@/services/helpers'
import { DateTime } from 'luxon'

export default {
  name: 'Burials',
  components: {
    BurialSearchResult,
    SearchSiteSelector,
    ErrorDisp
  },
  data () {
    return {
      // colors: {DRAFT: this.statusColors().A, CONFIRMED: this.statusColors().C, COMPLETE: this.statusColors().D},
      itemsPerPageArray: [10, 20, 30],
      itemsPerPage: 10,
      error: null,
      loading: null,
      siteTypes: null,
      page: 1,
      orderBys: [
        {text: 'Deceased', value: 'deceased'},
        {text: 'Created', value: 'created_at DESC'},
        {text: 'Updated', value: 'updated_at DESC'},
        {text: 'Burial date', value: 'burial_date DESC'},
        {text: 'Burial date - earliest first', value: 'burial_date ASC'},
        {text: 'Birth date', value: 'deceased_birth_date DESC'},
        {text: 'Site', value: 'block_ref, row_no, site_no'}
      ],
      undertakers: null,
      search: null
    }
  },
  computed: {
    statusColors: helpers.statusColors,
    months: helpers.monthList,
    days () {
      const days = []
      for (let i = 1; i < 32; i++) { days.push(i) }
      return days
    },
    numberOfPages () {
      if (this.search.burials) {
        return Math.ceil(this.search.burials.length / this.itemsPerPage)
      } else {
        return 0
      }
    }
  },
  mounted () {
    this.secureGet('/api/v1/undertakers')
      .then(res => {
        this.undertakers = res.data
      })
      .catch((error) => { this.error = error })

    this.secureGet('/api/v1/site_types')
      .then(res => {
        this.siteTypes = res.data
      })
      .catch((error) => { this.error = error })

    this.search = this.initialSearch()
    
    this.doSearch()
  },
  methods: {
    siteTypeText (val) {
      return val.site_type_group + ' - ' + val.site_type
    },
    updateItemsPerPage (number) {
      this.itemsPerPage = number
    },
    nextPage () {
      if (this.page + 1 <= this.numberOfPages) this.page += 1
    },
    formerPage () {
      if (this.page - 1 >= 1) this.page -= 1
    },
    fromYearSet (val) {
      if (val) {
        if (val > 1900) {
          this.search.params.burial_from_month = 1
          this.search.params.burial_from_day = 1
        }
      } else {
        this.search.params.burial_from_month = null
        this.search.params.burial_from_day = null
      }
    },
    fromMonthSet (val) {
      if (val) {
        this.search.params.burial_from_day = 1
      } else {
        this.search.params.burial_from_day = null
        this.search.params.burial_from_year = null
      }
    },
    fromDaySet (val) {
      if (!val) {
        this.search.params.burial_from_month = null
        this.search.params.burial_from_year = null
      }
      this.doSearch()
    },
    toYearSet (val) {
      if (val) {
        if (val > 1900) {
          this.search.params.burial_to_month = 12
          this.search.params.burial_to_day = 31
        }
      } else {
        this.search.params.burial_to_day = null
        this.search.params.burial_to_month = null
      }
    },
    toMonthSet (val) {
      if (val) {
        this.search.params.burial_to_day = DateTime.fromObject({year: this.search.params.burial_to_year, month: val, day: 1}).endOf('month').day
      } else {
        this.search.params.burial_to_day = null
        this.search.params.burial_to_year = null
      }
    },
    toDaySet (val) {
      if (!val) {
        this.search.params.burial_to_month = null
        this.search.params.burial_to_year = null
      }
      this.doSearch()
    },
    initialSearch () {
      const params = {
        orderby: 'burial_date DESC',
        filters: {DRAFT: true, CONFIRMED: true, UNSITED: true, COMPLETE: false},
        name: null,
        site: {block_ref: null, row_no: null, site_no: null},
        burial_from_year: null,
        burial_from_month: null,
        burial_from_day: null,
        burial_to_year: null,
        burial_to_month: null,
        burial_to_day: null,
        birth_year: null,
        birth_month: null,
        birth_day: null,
        id_number: null,
        burial_id: null,
        flag: false,
        legacy_flag: false,
        cod_is_contagious: false,
        undertaker_id: null,
        site_type_id: null
      }      

      if (this.$route.query.filters) {
        const filters = this.$route.query.filters.split(',')
        params.filters = {
          DRAFT: filters.includes('DRAFT'),
          CONFIRMED: filters.includes('CONFIRMED'),
          UNSITED: filters.includes('UNSITED'),
          COMPLETE: filters.includes('COMPLETE')
        }
      }
      if (this.$route.query.flagged) {
        params.flag = true
        params.filters = {DRAFT: true,CONFIRMED: true,UNSITED: true,COMPLETE: true}
      }
      return {
        page: 1,
        burials: [],
        params: params
      }      
    },
    clear () {
      this.search.burials = []
      this.search = this.initialSearch()
      this.doSearch()
    },
    filterToggle (key) {
      this.search.params.filters[key] = !this.search.params.filters[key]
      this.doSearch()
    },
    doExport () {
      return this.secureGetXLSX('/api/v1/burials/searchExport', this.search.params)
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          const name = DateTime.now().toFormat('yyyyLLdd_HHmmss') + '_Burials_Export.xlsx'
          link.setAttribute('download', name)
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => { this.error = error })
    },
    doSearch () {
      this.search.burials = []
      this.loading = true

      return this.secureGet('/api/v1/burials/search', this.search.params)
        .then(res => {
          this.search.burials = res.data.map(b => parseInt(b.burial_id))
          this.page = this.search.page
          this.loading = false
        })
        .catch((error) => { this.error = error })
    },
    burialLink (burial) {
      return '/burial/' + burial.burial_id
    }
  }
}
</script>

<style scoped>
</style>
