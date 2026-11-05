<template>
  <v-expansion-panels :flat="flat" class="mb-5">
    <v-expansion-panel >
      <v-expansion-panel-header class="pl-5 pr-2 pb-0 pt-2">
        <v-row v-if="sale" dense align="center">
          <v-col cols="4" sm="4" md="2" order="1" order-md="1" class="pb-0 text-body-1">
            Sale No:&nbsp;<router-link :to="saleLink()">{{ value }}</router-link>
          </v-col>
          <v-col cols="7" sm="7" md="3" order="4" order-md="2" class="pb-0 d-flex align-center text-body-1">
            <router-link v-if="!hideCustomer" :to="{ name: 'Customer', params: { customer_id: sale.customer_id }}">
              <span class="pr-3">
                <v-icon class="pr-2 pt-0 text-h5">mdi-account</v-icon>
                <span class="">{{ sale.salutation }} {{ sale.first_name }} {{ sale.middle_name }} {{ sale.last_name }}</span>
              </span>
            </router-link>
          </v-col>
          <v-col cols="5" sm="5" md="2" order="5" order-md="3" class="pb-0 d-flex align-center">
            <span class="text-body-1" v-if="sale.ordered_at">{{ formatD(sale.ordered_at) }}</span>
            <span class="text-body-1" v-else>{{ formatD(sale.created_at) }}</span>
          </v-col>
          <v-col cols="4" sm="4" md="2" order="2" order-md="4" class="pb-0 d-flex align-center">
            <div
              class="header-value-pill text-body-1"
              :class="+sale.value_outstanding !== 0 ? 'red--text' : 'grey--text text--darken-1'"
            >
              <span v-if="(sale.sale_status_ref!='DRAFT' && sale.sale_status_ref!='UNAUTHORIZED')"><b>{{ formatMInt(sale.value) }}</b><span v-if="sale.value_outstanding!=0"> <span v-if="sale.value_outstanding>0"> outstanding: </span><span v-else> credit: </span>{{ formatMInt(sale.value_outstanding) }}</span></span>
              <span v-else><b>{{ formatMInt(sale.value_order) }}</b></span>
            </div>
          </v-col>
          <v-col cols="4" sm="4" md="3" order="3" order-md="5" class="pb-0 d-flex justify-end align-center">
            <template>
              <v-chip
                v-if="sale.flag"
                class="mr-2"
                small
                color="red"
              ><span class="text-body-1 font-weight-bold">flag</span></v-chip>
            </template>
            <v-chip
              small
              v-if="!noStat"
              v-bind:color="saleStatusColor(sale.sale_status_ref)"
              @click="$router.push({name: 'Sale', params: {sale_id: sale.sale_id}})"
            >
              <span class="text-body-1 font-weight-bold">{{ sale.sale_status}}</span>
            </v-chip>
          </v-col>
        </v-row>
        <v-row v-else dense align="center">
          <v-col cols="12" class="d-flex align-center pb-0 text-body-1">
             Sale No: {{ value }}
            <v-spacer/>
            <v-chip
              color="grey"
              small
            ><span class="text-body-1 font-weight-bold">sale</span></v-chip>
          </v-col>
        </v-row>
      </v-expansion-panel-header>
      <v-expansion-panel-content class="pl-0 pr-0">
        <error-disp v-model="error"/>
        <v-card-text class="text-body-1 pt-1 pb-1 pl-0 pr-0">
          <v-row v-if="sale" dense class="mt-5 mb-5">
            <v-col cols="12"><customer-details v-model="sale.customer_id" /></v-col>
            <v-col cols="12"><b>Tariff: </b>{{sale.tariff_name}}</v-col>
            <v-col cols="12">
              <span v-if="sale.sale_status_ref != 'DRAFT'">
                <b>Ordered on </b>{{ formatD(sale.ordered_at) }}
                <span v-if="sale.sale_status_ref == 'ORDERED'">, age: {{sale.order_age}} days</span>
              </span>
            </v-col>
            <v-col cols="12">
                <div v-if="sale.sale_status_ref != 'DRAFT'">
                  <document
                    cols="12"
                    parentObject="sale"
                    :readonly="true"
                    :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                    :customerId="sale.customer_id"
                    :parentObjectId="sale.sale_id"
                    documentPropertyRef="INVOICE"
                  />
                </div>
            </v-col>
            <v-col cols="12" sm="4" lg="4" class="pb-1 pr-sm-5">
                <v-row no-gutters dense>
                  <v-col cols="8" sm="8" class="">
                    <span>Invoice:</span>
                  </v-col>
                  <v-col cols="4" sm="4" class="text-right">
                    {{ formatM(sale.value_order) }}
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="8" sm="8" class="">
                  <span>Credit Notes:</span>
                  </v-col>
                  <v-col cols="4" sm="4" class="text-right">
                  {{ formatM(-sale.value_credit) }}
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="12">
                  <v-divider/>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="8" sm="8" class="">
                    <span><b>Sale Value:</b></span>
                  </v-col>
                  <v-col cols="4" sm="4" class="text-right">
                    <b>{{ formatM(sale.value) }}</b>
                  </v-col>
                </v-row>
            </v-col>

            <v-col cols="12" sm="4" lg="4" class="pb-1 pl-sm-5">
                <v-row dense>
                  <v-col cols="8" sm="8" class="">
                    <span>Sale Value:</span>
                  </v-col>
                  <v-col cols="4" sm="4" class="text-right">
                    {{ formatM(sale.value) }}
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="8" sm="8" class="">
                    <span>Receipts:</span>
                  </v-col>
                  <v-col cols="4" sm="4" class="text-right">
                    {{ formatM(-sale.value_receipted) }}
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="8" sm="8" class="">
                  <span>Credit Vouchers:</span>
                  </v-col>
                  <v-col cols="4" sm="4" class="text-right">
                  {{ formatM(sale.value_voucher) }}
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="12">
                  <v-divider/>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="8" sm="8" class="">
                    <span><b>Outstanding:</b></span>
                  </v-col>
                  <v-col cols="4" sm="4" class="text-right">
                    <b>{{ formatM(sale.value_outstanding) }}</b>
                  </v-col>
                </v-row>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="pt-0 pb-4">
              <template v-if="sale">
                <div v-if="sale.sale_sites">
                  <span v-if="sale.sale_sites.length>0">Sites: <br v-if="sale.sale_sites.length>1" /></span>
                  <span v-for="(site, indx) in sale.sale_sites" :key="indx">
                    <b>{{site.site_type}}&nbsp;
                    <router-link v-if="site.site_id" :to="{name: 'Site', params: {site_id: site.site_id}}">{{site.site_ref}}</router-link>
                    <span v-else>(Unsited)</span>
                    <br/></b>
                  </span>
                </div>
                <div v-if="sale.burials">
                  <span v-if="sale.burials.length>0">Burials: <br v-if="sale.burials.length>1"/></span>
                  <span v-for="(burial, indx) in sale.burials" :key="indx">
                    <b>
                    <router-link :to="{name: 'Burial', params: {burial_id: burial.burial_id}}">{{burial.deceased}}</router-link> {{formatD(burial.burial_date)}} <span class="font-weight-bold" :style="`color:${burialStatusColor(burial.burial_status_ref)};`">({{burial.burial_status}})</span><br/>
                  </b>
                  </span>
                </div>
                <div v-if="sale.events">
                  <span v-if="sale.events.length>0">Events: <br v-if="sale.events.length>1"/></span>
                  <span v-for="(event, indx) in sale.events" :key="indx">
                    <div v-if="event.event_status_ref!='CANCELLED'">{{formatD(event.event_time)}} <router-link :to="{name: 'Site', params: {site_id: event.site_id}}">{{event.site_ref}}</router-link> <span class="font-weight-bold">{{event.event_type}}</span><br/></div>
                  </span>
                </div>
                <!-- <div v-if="sale && sale.note_count>0">Notes:<b> {{sale.note_count}}</b></div> -->
              </template>
              <template v-else>
                <v-skeleton-loader
                  type="article"
                ></v-skeleton-loader>
              </template>
            </v-col>
          </v-row>
          <v-row>
            <v-col v-if="sale" cols="12" class="pt-0 pb-0 d-flex flex-wrap justify-end align-content-end caption">
              <span class="caption"><b>Created:&nbsp;</b>{{formatT(sale.created_at)}}</span>
              <span v-if="sale.ordered_at" class="caption"><b>, Ordered:&nbsp;</b>{{formatT(sale.ordered_at)}}</span>
              <span v-if="sale.fulfilled_at" class="caption"><b>, Fulfilled:&nbsp;</b>{{formatT(sale.fulfilled_at)}}</span>
              <span class="caption"><b>,&nbsp;Updated:&nbsp;</b>{{formatT(sale.updated_at)}}</span>
              <span>
                <b>, by&nbsp;</b>
                <router-link v-if="$userCheckPermission('PERM_USERS_VIEW')" :to="{name: 'User', params: {user_id: sale.updated_by_id}}">{{sale.updated_by}}</router-link>
                <span v-else>{{sale.updated_by}}</span>
              </span>
            </v-col>
          </v-row>
        </v-card-text>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

</template>

<script>
import CustomerDetails from '@/components/customer/CustomerDetails'
import ErrorDisp from '@/components/shared/Error'
import Document from '@/components/shared/Document'

export default {
  name: 'SalesSearchResult',
  components: {
    CustomerDetails,
    Document,
    ErrorDisp
  },
  props: {
    value: Number,
    hideCustomer: Boolean,
    flat: Boolean,
    noStat: Boolean
  },
  data () {
    return {
      sale: null,
      error: null
    }
  },
  computed: {
  },
  watch: {
    value: function (val) {
      this.load()
    }
  },
  created () {
    this.load()
  },
  methods: {
    load () {
      this.sale = null
      this.secureGet('/api/v1/sales/' + this.value + '?type=items')
        .then(res => {
          this.sale = res.data
        })
        .catch((error) => { this.error = error })
    },
    saleLink () {
      if (this.sale.sale_status_ref === 'DRAFT') {
        return {name: 'New Sale', params: { sale_id: this.sale.sale_id }}
      } else {
        return {name: 'Sale', params: { sale_id: this.sale.sale_id }}
      }
    }
  }
}
</script>

<style scoped>
.header-value-pill {
  border: 1px solid currentColor;
  border-radius: 9999px;
  display: inline-block;
  line-height: 1.4;
  padding: 2px 10px;
  white-space: nowrap;
}
</style>
