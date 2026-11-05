<template>
  <v-card class="mb-5">
    <error-disp v-model="error"/>
    <v-card-text class="text-body-1 pt-1 pb-1">
      <v-row>
        <v-col v-if="customer" cols="12" class="d-flex black--text text-h6">
          <router-link :to="{ name: 'Customer', params: { customer_id: customer.customer_id }}">
            <span class="pr-3"><v-icon class="pr-2 pt-0">{{customer.is_corporate ? 'mdi-factory' : 'mdi-account'}}</v-icon><span>{{displayName}}</span></span>
          </router-link>
          <v-btn
            icon
            x-small
            class="pt-5"
            v-if="$userCheckPermission('PERM_EDIT')"
            @click="$router.push({name: 'Edit Customer', params: {customer_id: customer.customer_id}})"
            color="grey"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-spacer/>
          <template>
            <v-chip
              v-if="customer.flag"
              class="mr-2"
              color="red"
            ><span class="text-body-1 font-weight-bold">flag</span></v-chip>
          </template>
        </v-col>
      </v-row>
      <v-row v-if="customer && customer.is_corporate">
        <v-col cols="12" sm="5" class="pt-0 pb-0">{{ customerName }}</v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="5" class="pt-0 pb-0">
          <template v-if="customer">
            <div class="">{{ customer.address1 }} {{ customer.address2 }} {{ customer.address3 }} {{ customer.country }}</div>
            <div>{{ customer.phone1 }} {{ customer.phone2 }}</div>
            <div><a :href="`mailto: ${customer.email}`">{{ customer.email }}</a>{{ customer.no_marketing_email ? ' NO MARKETING ' : '' }}{{ customer.no_transaction_email ? ' NO TRANSACTION' : '' }}</div>
            <div v-if="customer.id_no">ID No. {{ customer.id_no }}</div>
            <div>Customer No. {{ customer.customer_id }}</div>
          </template>
          <v-skeleton-loader
            v-else
            type="article"
          ></v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="7" class="pt-2 pb-0">
          <template v-if="customer">
            <div v-if="customer.sales.length>0">
              Sales: <b><br v-if="customer.sales.length>1"/>
              <span class="ml-3" v-for="(sale, indx) in customer.sales" :key="indx">
                <template v-if="$userCheckPermission('PERM_VIEW')">
                  <router-link v-if="sale.sale_status_ref==='DRAFT'" :to="{name: 'Edit Sale', params: {customer_id: customer.customer_id}}">{{sale.sale_id}}</router-link>
                  <router-link v-else :to="{name: 'Sale', params: {sale_id: sale.sale_id}}">{{sale.sale_id}}</router-link>
                </template>
                <span v-else>{{sale.sale_id}}</span>
                <span class="font-weight-bold" :style="`color:${saleStatusColor(sale.sale_status_ref)};`">({{sale.sale_status}})</span><span v-if="indx < customer.sales.length-1">, </span>
              </span></b>
            </div>
            <div v-if="customer.sites.length>0">
              Sites: <b><br v-if="customer.sales.length>1" />
              <span class="ml-3" v-for="(site, indx) in customer.sites" :key="indx">
                {{site.site_type}}:
                <router-link :to="{name: 'Site', params: {site_id: site.site_id}}">{{site.site_ref}}</router-link>
                <br/>
              </span></b>
            </div>
            <div v-if="customer.burials">
              <span v-if="customer.burials.length>0">Burials: <br v-if="customer.burials.length>1" /></span>
              <span class="ml-3" v-for="(burial, indx) in customer.burials" :key="indx">
                <router-link :to="{name: 'Burial', params: {burial_id: burial.burial_id}}">{{burial.deceased}}</router-link>
                {{formatD(burial.burial_date)}} <span class="font-weight-bold" :style="`color:${burialStatusColor(burial.burial_status_ref)};`">({{burial.burial_status}})</span><br/>
              </span>
            </div>
            <div :class="`${customer.customer_balance<0?'red--text':''}`">
              Outstanding:<b> {{ formatM(customer.customer_balance) }}</b> <span v-if="customer.customer_balance<0">Oldest: {{formatD(customer.oldest_outstanding)}}</span>
              <span v-if="customer.customer_balance>0">(credit)</span>
            </div>
          </template>
          <v-skeleton-loader v-else type="article"></v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-if="customer" cols="12" class="pt-0 pb-0 d-flex flex-wrap justify-end align-content-end caption">
          <span><b>Created:&nbsp;</b>{{formatT(customer.created_at)}}</span>
          <span><b>,&nbsp;Updated:&nbsp;</b>{{formatT(customer.updated_at)}}</span>
          <span v-if="$userCheckPermission('PERM_USERS_VIEW')"><b>, by&nbsp;</b><router-link :to="{name: 'User', params: {user_id: customer.updated_by_id}}">{{customer.updated_by}}</router-link></span>
          <span v-else>{{customer.updated_by}}</span>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

import ErrorDisp from '@/components/shared/Error'

export default {
  name: 'CustomersSearchResult',
  components: {
    ErrorDisp
  },
  props: ['value'],
  data () {
    return {
      customer: null,
      error: null
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: function (newVal) {
        if (newVal == null) return
        this.secureGet('/api/v1/customers/' + newVal + '?type=items')
          .then(res => {
            this.customer = res.data
          })
          .catch((error) => {
            console.log(error)
            this.error = error
          })
      }
    }
  },
  computed: {
    displayName () {
      if (this.customer) {
        if (this.customer.is_corporate) {
          return this.customer.company_name
        } else {
          return this.customerName
        }
      } else {
        return ''
      }
    },
    customerName () {
      let ret = ''
      if (this.customer) {
        if (this.customer.salutation) { ret += this.customer.salutation + ' ' }
        if (this.customer.first_name) { ret += this.customer.first_name + ' ' }
        if (this.customer.middle_name) { ret += this.customer.middle_name + ' ' }
        if (this.customer.last_name) { ret += this.customer.last_name }
      }
      return ret
    }
  },
  methods: {
  }
}
</script>

<style scoped>
</style>
