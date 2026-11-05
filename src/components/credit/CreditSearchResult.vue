<template>
  <v-card class="mb-5" :flat="flat">
    <error-disp v-model="error"/>
    <v-card-text class="pl-5 pr-2 pt-3 pb-3">
        <v-row v-if="credit" dense >
          <v-col cols="7" sm="4" order="1" order-sm="1" class="pb-0 text-body-1">
            <span v-if="credit" class="">Credit Note No: <router-link :to="{ name: 'Credit Note', params: { credit_id: credit.credit_id } }">{{ credit.credit_id }}</router-link> on Sale No: <router-link :to="{ name: 'Sale', params: { sale_id: credit.sale_id } }">{{ credit.sale_id }}</router-link></span>
          </v-col>
          <v-col cols="6" sm="3" order="4" order-sm="2" class="pb-0 d-flex align-center">
            <customer-details v-if="credit" v-model="credit.customer_id" />
              <v-skeleton-loader
              v-else
              type="article"
            ></v-skeleton-loader>
          </v-col>
          <v-col cols="6" sm="2" order="5" order-sm="3" class="pb-0 d-flex align-center text-body-1">
            <span v-if="credit.posted_at">{{ formatD(credit.posted_at) }}</span>
            <span v-else>{{ formatD(credit.created_at) }}</span>
          </v-col>
          <v-col cols="3" sm="2" order="2" order-sm="4" class="pb-0 d-flex align-center">
            <div
              class="header-value-pill text-body-2"
              :class="credit.credit_status_ref == 'POSTED' ? 'red--text' : 'grey--text text--darken-1'"
            >
              <span><b>{{ formatMInt(credit.value) }}</b></span>
            </div>
          </v-col>
          <v-col cols="2" sm="1" order="3" order-sm="5" class="pb-0 d-flex justify-end align-center">
            <v-chip
              small
              v-if="!noStat"
              v-bind:color="creditStatusColor(credit.credit_status_ref)"
              @click="$router.push({name: 'Credit', params: {credit_id: credit.credit_id}})"
            >
              <span class="text-body-1 font-weight-bold">{{ credit.credit_status}}</span>
            </v-chip>
          </v-col>
        </v-row>
        <v-row v-else dense align="center">
          <v-col cols="12" class="d-flex align-center pb-0 text-body-1">
            Credit Note: {{ value }}
            <v-spacer/>
            <v-chip
              color="grey"
              small
            ><span class="text-body-1 font-weight-bold">credit</span></v-chip>
          </v-col>
        </v-row>

    </v-card-text>
  </v-card>

</template>

<script>
import CustomerDetails from '@/components/customer/CustomerDetails'
import ErrorDisp from '@/components/shared/Error'

export default {
  name: 'CreditSearchResult',
  components: {
    CustomerDetails,
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
      credit: null,
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
      this.secureGet('/api/v1/credits/' + this.value)
        .then(res => {
          this.credit = res.data
        })
        .catch((error) => { this.error = error })
    },
    saleLink () {
      if (this.sale.sale_status_ref === 'DRAFT') {
        return {name: 'New Sale', params: { sale_id: this.sale.sale_id }}
      } else {
        return {name: 'Sale', params: { sale_id: this.sale.sale_id }}
      }
    },
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
