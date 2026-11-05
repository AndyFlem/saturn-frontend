<template>
  <div>
    <error-disp v-model="error"/>
    <auth-requests />
    <v-row v-if="$userCheckPermission('PERM_VIEW')" align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <burial-schedule-day :close="true" :refresh="scheduleRefresh" />
      </v-col>
    </v-row>
    <v-row v-if="$userCheckPermission('PERM_VIEW')" align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <event-list />
      </v-col>
    </v-row>
    <v-row v-if="$userCheckPermission('PERM_VIEW')" align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <sitework-list />
      </v-col>
    </v-row>
    
    <v-row v-if="$userCheckPermission('PERM_VIEW')" align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-expansion-panels :value="null">
          <v-expansion-panel>
            <v-expansion-panel-header class="primary white--text text-h6 pt-3 pb-3">
              <span class="white--text">
                <router-link :to="{name: 'Sales', query: {filters: 'DRAFT,UNAUTHORIZED,ORDERED,PAID'}}" class="white--text">
                  Open Sales<span v-if="sales">: {{sales.length}}</span>
                </router-link>
              </span>
              <template v-slot:actions><v-icon color="white">$expand</v-icon></template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
                  <v-data-iterator
                    v-if="sales"
                    :items="sales"
                    :page="salesPage"
                    :items-per-page="5"
                  >
                    <template v-slot:default="props">
                      <v-row>
                        <v-col
                          v-for="item in props.items"
                          :key="item"
                          cols="12"
                          class="pt-1 pb-0"
                        >
                          <sale-search-result :value="item" />
                        </v-col>
                      </v-row>
                    </template>
                  </v-data-iterator>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row v-if="$userCheckPermission('PERM_VIEW')" align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-expansion-panels :value="null">
          <v-expansion-panel>
            <v-expansion-panel-header class="primary white--text text-h6 pt-3 pb-3">
              <router-link :to="{name: 'Burials', query: {filters: 'DRAFT,CONFIRMED,UNSITED'}}" class="white--text">
                <span class="white--text">Incomplete Burials<span v-if="burials">: {{burials.length}}</span></span>
              </router-link>                
              <template v-slot:actions><v-icon color="white">$expand</v-icon></template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
            <v-data-iterator
              v-if="burials"
              :items="burials"
              :page="burialsPage"
              :items-per-page="5"
            >
              <template v-slot:default="props">
                <v-row>
                  <v-col
                    v-for="item in props.items"
                    :key="item"
                    cols="12"
                    class="pt-1 pb-0"
                  >
                    <burial-search-result expand :value="item" />
                  </v-col>
                </v-row>
              </template>
            </v-data-iterator>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row v-if="$userCheckPermission('PERM_VIEW')" align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-expansion-panels :value="null">
          <v-expansion-panel>
            <v-expansion-panel-header class="primary white--text text-h6 pt-3 pb-3">
              <router-link :to="{name: 'Burials', query: {filters: 'UNSITED'}}" class="white--text">
                <span class="white--text">Unsited Burials<span v-if="unsitedBurials">: {{unsitedBurials.length}}</span></span>
              </router-link>                
              <template v-slot:actions><v-icon color="white">$expand</v-icon></template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
            <v-data-iterator
              v-if="unsitedBurials"
              :items="unsitedBurials"
              :page="unsitedBurialsPage"
              :items-per-page="5"
            >
              <template v-slot:default="props">
                <v-row>
                  <v-col
                    v-for="item in props.items"
                    :key="item"
                    cols="12"
                    class="pt-1 pb-0"
                  >
                    <burial-search-result expand :value="item" />
                  </v-col>
                </v-row>
              </template>
            </v-data-iterator>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row v-if="$userCheckPermission('PERM_VIEW')" align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-expansion-panels :value="null">
          <v-expansion-panel>
            <v-expansion-panel-header class="primary white--text text-h6 pt-3 pb-3">
              <router-link :to="{name: 'Burials', query: {flagged: 'true'}}" class="white--text">
                <span class="white--text">Flagged Burials<span v-if="flaggedBurials">: {{flaggedBurials.length}}</span></span>
              </router-link>
              <template v-slot:actions><v-icon color="white">$expand</v-icon></template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
            <v-data-iterator
              v-if="flaggedBurials"
              :items="flaggedBurials"
              :page="flaggedBurialsPage"
              :items-per-page="5"
            >
              <template v-slot:default="props">
                <v-row>
                  <v-col
                    v-for="item in props.items"
                    :key="item"
                    cols="12"
                    class="pt-1 pb-0"
                  >
                    <burial-search-result expand :value="item" />
                  </v-col>
                </v-row>
              </template>
            </v-data-iterator>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row v-if="$userCheckPermission('PERM_VIEW')" align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-expansion-panels :value="null">
          <v-expansion-panel>
            <v-expansion-panel-header class="primary white--text text-h6 pt-3 pb-3">
              <router-link :to="{name: 'Sales', query: {flagged: 'true'}}" class="white--text">
                <span class="white--text">Flagged Sales<span v-if="flaggedSales">: {{flaggedSales.length}}</span></span>
              </router-link>
              <template v-slot:actions><v-icon color="white">$expand</v-icon></template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
            <v-data-iterator
              v-if="flaggedSales"
              :items="flaggedSales"
              :page="flaggedSalesPage"
              :items-per-page="5"
            >
              <template v-slot:default="props">
                <v-row>
                  <v-col
                    v-for="item in props.items"
                    :key="item"
                    cols="12"
                    class="pt-1 pb-0"
                  >
                    <sale-search-result :value="item" />
                  </v-col>
                </v-row>
              </template>
            </v-data-iterator>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import BurialSearchResult from '@/components/burials/BurialSearchResult'
import SaleSearchResult from '@/components/sales/SaleSearchResult'
import BurialScheduleDay from '@/components/burials/BurialScheduleDay'
import EventList from '@/components/events/EventList'
import SiteworkList from '@/components/siteworks/SiteworkList'
import ErrorDisp from '@/components/shared/Error'
import AuthRequests from '@/components/users/AuthRequests'

export default {
  name: 'Home',
  components: {
    EventList,
    SiteworkList,
    BurialSearchResult,
    SaleSearchResult,
    BurialScheduleDay,
    ErrorDisp,
    AuthRequests
  },
  props: [],
  data () {
    return {
      sales: null,
      salesPage: 1,
      burials: null,
      burialsPage: 1,
      unsitedBurials: null,
      unsitedBurialsPage: 1,
      flaggedBurials: null,
      flaggedBurialsPage: 1,
      flaggedSales: null,
      flaggedSalesPage: 1,
      flaggedSites: null,
      flaggedSitesPage: 1,
      customers: null,
      customersPage: 1,
      error: null,
      burialCount: 0,
      scheduleRefresh: false
    }
  },
  computed: {
  },
  sockets: {
    audit (val) {
      if (
        (val.primary.object === 'sale' && val.primary.action === 'CREATED') ||
        (val.primary.object === 'sale' && val.primary.action === 'FULFILLED') ||
        (val.primary.object === 'burial' && val.primary.action === 'CONFIRMED') ||
        (val.primary.object === 'burial' && val.primary.action === 'COMPLETED')
      ) {
        this.scheduleRefresh = !this.scheduleRefresh
        if (this.$userCheckPermission('PERM_VIEW')) {
          this.salesSearch()
        }
        if (this.$userCheckPermission('PERM_VIEW')) {
          this.burialSearch()
        }
      }
    }
  },
  mounted () {
    if (this.$userCheckPermission('PERM_VIEW')) {
      this.salesSearch()
    }
    if (this.$userCheckPermission('PERM_VIEW')) {
      this.burialSearch()
    }
    if (this.$userCheckPermission('PERM_VIEW')) {
      this.unsitedBurialSearch()
    }
    if (this.$userCheckPermission('PERM_VIEW')) {
      this.flaggedBurialSearch()
    }
    if (this.$userCheckPermission('PERM_VIEW')) {
      this.flaggedSaleSearch()
    }
  },
  watch: {
  },
  methods: {
    salesSearch () {
      this.sales = null
      this.secureGet('/api/v1/sales/search', {
        orderby: 'updated_at DESC',
        filters: {DRAFT: true, UNAUTHORIZED: true, ORDERED: true, PAID: true, FULFILLED: false}
      })
        .then(res => {
          this.sales = res.data.map(b => b.sale_id)
        })
        .catch(err => { this.error = err })
    },
    burialSearch () {
      this.burials = null
      this.secureGet('/api/v1/burials/search', {
        orderby: 'burial_date ASC',
        filters: {DRAFT: true, CONFIRMED: true, COMPLETE: false, UNSITED: true}
      })
        .then(res => {
          this.burials = res.data.map(b => b.burial_id)
        })
        .catch(err => { this.error = err })
    },
    unsitedBurialSearch () {
      this.unsitedBurials = null
      this.secureGet('/api/v1/burials/search', {
        orderby: 'burial_date ASC',
        filters: {UNSITED: true, CONFIRMED: false, COMPLETE: false, DRAFT: false}
      })
        .then(res => {
          this.unsitedBurials = res.data.map(b => b.burial_id)
        })
        .catch(err => { this.error = err })
    },
    flaggedBurialSearch () {
      this.flaggedBurials = null
      this.secureGet('/api/v1/burials/search', {
        orderby: 'burial_date ASC',
        filters: {DRAFT: true, CONFIRMED: true, COMPLETE: true},
        flag: true
      })
        .then(res => {
          this.flaggedBurials = res.data.map(b => b.burial_id)
        })
        .catch(err => { this.error = err })
    },
    flaggedSaleSearch () {
      this.flaggedSales = null
      this.secureGet('/api/v1/sales/search', {
        orderby: 'updated_at DESC',
        filters: {DRAFT: true, ORDERED: true, PAID: true, FULFILLED: true},
        flagged: true
      })
        .then(res => {
          this.flaggedSales = res.data.map(b => b.sale_id)
        })
        .catch(err => { this.error = err })
    }
  }
}
</script>

<style scoped>

</style>
