<template>
  <div v-if="search">
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text pt-2 pb-3">
            Customers
            <v-spacer/>
          </v-card-title>
          <v-card-text>
            <v-row no-gutters class="mt-5">
              <v-col cols="12" md="6">
                <v-text-field
                    class="mr-10"
                    dense
                    clearable
                    v-model="search.params.first_name"
                    @keyup.enter="doSearch"
                    label="First Name"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                    class="mr-10"
                    dense
                    clearable
                    v-model="search.params.last_name"
                    @keyup.enter="doSearch"
                    label="Last Name or Company Name"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters class="">
              <v-col cols="12" sm="6">
                <v-text-field
                    class="mr-3"
                    dense
                    clearable
                    :error-messages="customerIdErrors"
                    v-model="search.params.id"
                    @keyup.enter="doSearch"
                    label="Customer No"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                    class="mr-3"
                    dense
                    v-model="search.params.id_number"
                    @keyup.enter="doSearch"
                    clearable
                    label="Customer Government Id"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="4" lg="3">
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
              <v-col cols="4" lg="3">
                <v-select
                  class="mr-4"
                  dense
                  clearable
                  :items="months"
                  @input="doSearch"
                  v-model="search.params.created_month"
                  @keyup.enter="doSearch"
                  label="Month"
                ></v-select>
              </v-col>
              <v-col cols="4" lg="3">
                <v-select
                  dense
                  clearable
                  :items="days"
                  v-model="search.params.created_day"
                  @keyup.enter="doSearch"
                  label="Day"
                ></v-select>
              </v-col>
            </v-row>
            <v-row no-gutters class="">
              <v-col cols="12" md="12">
                <v-text-field
                    class="mr-10"
                    dense
                    clearable
                    v-model="search.params.address"
                    @keyup.enter="doSearch"
                    label="Address"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" md="4">
                <v-text-field
                    class="mr-10"
                    dense
                    clearable
                    v-model="search.params.phone"
                    @keyup.enter="doSearch"
                    label="Phone"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                    dense
                    clearable
                    class="mr-10"
                    v-model="search.params.email"
                    @keyup.enter="doSearch"
                    label="Email"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" sm="6" md="4">
                <v-switch
                  v-model="search.params.open_orders"
                  dense
                  hide-details
                  @change="doSearch"
                  label="Customers with open sales?"
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-switch
                  v-model="search.params.no_orders"
                  hide-details
                  dense
                  @change="doSearch"
                  label="Customers with no sales?"
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-switch
                  v-model="search.params.is_corporate"
                  dense
                  hide-details
                  @change="doSearch"
                  label="Corporate Customers?"
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-switch
                  v-model="search.params.is_contractor"
                  dense
                  hide-details
                  @change="doSearch"
                  label="Contractor Customers?"
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-switch
                  v-model="search.params.flag"
                  dense
                  hide-details
                  @change="doSearch"
                  label="Only flagged customers?"
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-switch
                  v-model="search.params.outstanding"
                  dense
                  hide-details
                  @change="doSearch"
                  label="Outstanding payments?"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row class="secondary mt-5 pt-5 mb-4" justify="space-between">
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
                <span v-if="search.customers"><b>Total: {{formatInt(search.customers.length)}}</b></span>
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
              v-if="search.customers"
              :items="search.customers"
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
                    <customer-search-result :value="item" />
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
import CustomerSearchResult from '@/components/customer/CustomerSearchResult'
import ErrorDisp from '@/components/shared/Error'
import helpers from '@/services/helpers'
import { integer } from 'vuelidate/lib/validators'

export default {
  name: 'tCustomerSearch',
  components: {
    CustomerSearchResult,
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
        {text: 'Created', value: 'created_at DESC'},
        {text: 'Updated', value: 'updated_at DESC'},
        {text: 'Oldest outstanding invoice', value: 'oldest_outstanding ASC'},
        {text: 'Unpaid invoices', value: 'outstanding_sum ASC'},
        {text: 'Name', value: 'full_name ASC'},
        {text: 'Customer No', value: 'customer_id ASC'}
      ],
      search: null
    }
  },
  validations: {
    search: {params: {id: {integer}}}
  },
  computed: {
    statusColors: helpers.statusColors,
    months: helpers.monthList,
    days () {
      const days = []
      for (let i = 1; i < 32; i++) { days.push(i) }
      return days
    },
    filteredKeys () {
      return this.keys.filter(key => key !== `Name`)
    },
    customerIdErrors () {
      const errors = []
      if (!this.$v.search.params.id.$dirty) return errors
      !this.$v.search.params.id.integer && errors.push('Customer no. must be a number')
      return errors
    },
    numberOfPages () {
      if (this.search.customers) {
        return Math.ceil(this.search.customers.length / this.itemsPerPage)
      } else {
        return 0
      }
    }
  },
  created () {
    if (!this.$root.state.customerSearch) {
      this.$root.state.customerSearch = this.initialSearch()
    }
    this.search = this.$root.state.customerSearch
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
    pageChange (evt) {
      if (!this.loading) {
        this.$root.state.customerSearch.page = evt.page
      }
    },
    initialSearch () {
      return {
        page: 1,
        customers: [],
        params: {
          orderby: 'created_at DESC',
          first_name: null,
          last_name: null,
          email: null,
          id: null,
          address: null,
          is_corporate: false,
          is_contractor: false,
          phone: null,
          open_orders: false,
          no_orders: false,
          created_year: null,
          created_month: null,
          created_day: null,
          id_number: null,
          flag: false,
          outstanding: false
        }
      }
    },
    clear () {
      this.search.customers = []
      this.search = this.initialSearch()
      this.$root.state.customerSearch = this.initialSearch()
      this.doSearch()
    },
    filterToggle (key) {
      this.search.filters[key] = !this.search.filters[key]
    },
    doExport () {
      return this.secureGetXLSX('/api/v1/customers/searchExport', this.search.params)
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'Customers_Export.xlsx') // or any other extension
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => {
          this.error = error
        })
    },
    doSearch () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.search.customers = []
        this.loading = true
        this.error = null
        return this.secureGet('/api/v1/customers/search', this.search.params)
          .then(res => {
            this.search.customers = res.data.map(b => parseInt(b.customer_id))
            this.page = this.search.page
            this.loading = false
          })
          .catch((error) => { this.error = error })
      }
    },
    customerLink (customer) {
      return '/customer/' + customer.customer_id
    }
  }
}
</script>

<style scoped>
</style>
