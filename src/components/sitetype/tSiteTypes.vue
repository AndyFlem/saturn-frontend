<template>
  <div v-if="search">
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
          Site Types
          </v-card-title>
          <v-card-text>
            <v-row no-gutters class="mt-5">
              <v-col v-if="site_type_categories" cols="12" class="pb-0">
                <v-select
                  dense
                  @change="doSearch"
                  clearable
                  :items="site_type_categories"
                  item-text="site_type_category"
                  item-value="site_type_category_id"
                  class="mr-3"
                  v-model="search.params.category_id"
                  label="Site Type Category"
                ></v-select>
              </v-col>
              <v-col v-if="site_type_groups" cols="12" class="pb-0">
                <v-select
                  dense
                  @change="doSearch"
                  clearable
                  :items="site_type_groups"
                  item-text="site_type_group"
                  item-value="site_type_group_id"
                  class="mr-3"
                  v-model="search.params.group_id"
                  label="Site Type Group"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="search.params.name"
                    @keyup.enter="doSearch"
                    label="Site Type Name"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" class="pb-0">
                <v-select
                  dense
                  clearable
                  @change="doSearch"
                  :items="[1,2,4,5,9,10]"
                  class="mr-3"
                  v-model="search.params.graves"
                  label="No of Graves"
                ></v-select>
              </v-col>
              <v-col cols="12" class="pb-0">
                <v-switch
                  dense
                  @change="doSearch"
                  class="mr-3"
                  v-model="search.params.saleable"
                  label="Available for sale"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row class="secondary pt-3 mb-4" justify="space-between">
              <v-col cols="12" sm="6" class="pb-0">
                <v-select
                  dense
                  @change="doSearch"
                  :items="orderBys"
                  class="mr-3"
                  v-model="search.params.orderby"
                  label="Order By"
                ></v-select>
              </v-col>
              <v-col cols="12" sm ="6" class="d-flex justify-end pb-3">
                    <v-btn class="mr-3" color="primary" @click="clear">
                      Clear
                      <v-icon right>mdi-close</v-icon>
                    </v-btn>
                    <v-btn color="primary" @click="doSearch">
                      Search
                      <v-icon right dark>mdi-magnify</v-icon>
                    </v-btn>
              </v-col>
            </v-row>
            <v-data-iterator
              v-if="search.siteTypes" :items="search.siteTypes"
              :items-per-page.sync="itemsPerPage"
              :page="search.page"
              @pagination="pageChange"
            >
              <template v-slot:default="props">
                <v-row
                    v-for="item in props.items"
                    :key="item.site_type_id">
                  <v-col cols="12">
                    <site-type-search-result v-model="item.site_type_id"/>
                  </v-col>
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
import SiteTypeSearchResult from './SiteTypeSearchResult.vue'
export default {
  name: 'SiteTypes',
  components: {
    ErrorDisp,
    SiteTypeSearchResult
  },
  data () {
    return {
      itemsPerPageArray: [10, 20, 30],
      itemsPerPage: 30,
      site_type_categories: null,
      site_type_groups: null,
      error: null,
      orderBys: [
        {text: 'Category', value: 'site_type_category, site_type'},
        {text: 'Group', value: 'site_type_group, site_type'},
        {text: 'Name', value: 'site_type'}
      ],
      search: null
    }
  },
  computed: {

  },
  created () {
    this.secureGet('/api/v1/site_type_categories')
      .then(res => {
        this.site_type_categories = res.data
        return this.secureGet('/api/v1/site_type_groups')
      })
      .then((res) => {
        this.site_type_groups = res.data
        if (!this.$root.state.siteTypeSearch) {
          this.$root.state.siteTypeSearch = this.initialSearch()
        }
        this.search = this.$root.state.siteTypeSearch
        this.doSearch()
      })
  },
  methods: {
    pageChange (evt) {
      this.$root.state.siteTypeSearch.page = evt.page
    },
    initialSearch () {
      return {
        page: 1,
        siteTypes: [],
        params: {
          orderby: 'site_type_category, site_type',
          category_id: null,
          name: null,
          graves: null,
          group_id: null,
          saleable: true
        }
      }
    },
    clear () {
      this.search.siteTypes = []
      this.search = this.initialSearch()
      this.$root.state.siteTypeSearch = this.initialSearch()
    },
    doSearch () {
      return this.securePost('/api/v1/site_types/search', this.search.params)
        .then(res => {
          this.search.siteTypes = res.data
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>

<style scoped>
</style>
