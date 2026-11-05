<template>
  <div v-if="search">
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text pt-2 pb-3">Sites</v-card-title>
          <v-card-text>
            <v-row class="mt-5">
              <v-col cols="12" sm="12" class="mb-5">
                <v-chip
                    v-bind:color="search.params.filters.UNAVAIL ? statusColors.A : 'default'"
                    class="mr-2"
                    @click="filterToggle('UNAVAIL')"
                  >
                  <span class="text-body-1 font-weight-bold">Unavailable</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.AVAIL ? statusColors.B : 'default'"
                    class="mr-2"
                    @click="filterToggle('AVAIL')"
                  >
                  <span class="text-body-1 font-weight-bold">Available</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.ORDER ? statusColors.C : 'default'"
                    class="mr-2"
                    @click="filterToggle('ORDER')"
                  >
                  <span class="text-body-1 font-weight-bold">Ordered</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.OWN ? statusColors.D : 'default'"
                    class="mr-2"
                    @click="filterToggle('OWN')"
                  >
                  <span class="text-body-1 font-weight-bold">Owned</span>
                </v-chip>
                <v-chip
                    v-bind:color="search.params.filters.UNSUITABLE ? statusColors.E : 'default'"
                    class="mr-2"
                    @click="filterToggle('UNSUITABLE')"
                  >
                  <span class="text-body-1 font-weight-bold">Unsuitable</span>
                </v-chip>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="4" class="">
                <v-switch
                  v-model="search.params.flag"
                  class="pt-0 mt-10 pb-0"
                  hide-details
                  dense
                  @change="doSearch"
                  label="Flagged sites?"
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="4" class="">
                <v-switch
                  v-model="search.params.verified"
                  class="pt-0 mt-10 pb-0"
                  hide-details
                  dense
                  @change="doSearch"
                  label="Verified sites?"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="5" md="3">
                <v-text-field
                    class="mr-3"
                    dense
                    v-model="search.params.site_ref"
                    @keyup.enter="doSearch"
                    clearable
                    label="Site Ref"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="5" md="3">
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
            <v-row no-gutters>
              <v-col cols="12" lg="6">
                <search-site-selector @input="doSearch" v-model="search.params.site" />
              </v-col>
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
                <span v-if="search.sites"><b>Total: {{formatInt(search.sites.length)}}</b></span>
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
              v-if="search.sites" :items="search.sites"
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
                    <site-details :value="item" />
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
import SearchSiteSelector from '@/components/sites/SearchSiteSelector'
// import SiteSearchResult from '@/components/sites/SiteSearchResult'
import SiteDetails from '@/components/sites/SiteDetails'
import helpers from '@/services/helpers'

export default {
  name: 'tSiteSearch',
  components: {
    SearchSiteSelector,
    // SiteSearchResult,
    SiteDetails,
    ErrorDisp
  },
  data () {
    return {
      // colors: {DRAFT: this.statusColors().A, CONFIRMED: this.statusColors().C, COMPLETE: this.statusColors().D},
      itemsPerPageArray: [10, 20, 30],
      itemsPerPage: 10,
      error: null,
      loading: null,
      page: 1,
      siteTypes: null,
      orderBys: [
        {text: 'Site', value: 'block_ref, row_no, site_no'}
      ],
      search: null
    }
  },
  computed: {
    statusColors: helpers.statusColors,
    numberOfPages () {
      if (this.search.sites) {
        return Math.ceil(this.search.sites.length / this.itemsPerPage)
      } else {
        return 0
      }
    }
  },
  mounted () {
    this.secureGet('/api/v1/site_types')
      .then(res => {
        this.siteTypes = res.data
      })
      .catch((error) => { this.error = error })
    if (!this.$root.state.siteSearch) {
      this.$root.state.siteSearch = this.initialSearch()
    }
    this.search = this.$root.state.siteSearch
    this.doSearch()
  },
  methods: {
    siteTypeText (val) {
      return val.site_type_group + ' - ' + val.site_type
    },
    updateItemsPerPage (number) {
      this.itemsPerPage = number
    },
    pageChange (evt) {
      if (!this.loading) {
        this.$root.state.siteSearch.page = evt.page
      }
    },
    nextPage () {
      if (this.page + 1 <= this.numberOfPages) this.page += 1
    },
    formerPage () {
      if (this.page - 1 >= 1) this.page -= 1
    },
    initialSearch () {
      return {
        page: 1,
        sites: [],
        params: {
          orderby: 'block_ref, row_no, site_no',
          filters: {UNAVAIL: true, AVAIL: true, ORDER: true, OWN: true, UNSUITABLE: true},
          site_ref: null,
          site: {block_ref: null, row_no: null, site_no: null},
          flag: false,
          site_type_id: null
        }
      }
    },
    clear () {
      this.search.sites = []
      this.search = this.initialSearch()
      this.$root.state.siteSearch = this.initialSearch()
      this.doSearch()

    },
    filterToggle (key) {
      this.search.params.filters[key] = !this.search.params.filters[key]
      this.doSearch()
    },
    doExport () {
      return this.secureGetXLSX('/api/v1/sites/searchExport', this.search.params)
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          const name = DateTime.now().toFormat('yyyyLLdd_HHmmss') + '_Sites_Export.xlsx'
          link.setAttribute('download', name)
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => { this.error = error })
    },
    doSearch () {
      this.search.sites = []
      this.loading = true
      return this.secureGet('/api/v1/sites/search', this.search.params)
        .then(res => {
          this.search.sites = res.data.map(b => parseInt(b.site_id))
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
