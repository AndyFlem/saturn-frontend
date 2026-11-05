<template>
<div class="customer-details-left">
  <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
  <v-expansion-panels :value="expand?0:null" v-if="customer" flat class="compact-panels">
    <v-expansion-panel  flat class="compact-panel-item">
      <v-expansion-panel-header class="text-body-1 compact-header">
        <template v-if="customer.is_corporate">
          <v-row dense>
            <v-col cols="12" class="">
              <v-icon small class="pr-2">mdi-factory</v-icon>
              <router-link :to="{ name: 'Customer', params: { customer_id: customer.customer_id }}">
              <span class="pt-0 pb-1 pr-5">{{ customer.company_name }}{{customer.is_contractor ? ' (Contractor)' : ''}}</span>
              </router-link>
              <!-- <v-btn
                icon
                x-small
                v-if="$userCheckPermission('PERM_EDIT')"
                @click="$router.push({name: 'Edit Customer', params: {customer_id: customer.customer_id}})"
                color="grey"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn> -->
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" class="pt-0 pb-0">
              <span class="pr-3">{{ customer.salutation }} {{ customer.first_name }} {{ customer.middle_name }} {{ customer.last_name }}</span>
            </v-col>
          </v-row>
        </template>
        <v-row v-else dense>
          <v-col cols="12" class="pt-0 pb-0">
            <v-chip v-if="customer.flag" class="mr-2" color="red"><span class="text-body-1 font-weight-bold">flag</span></v-chip>
            <v-icon v-else small class="pr-2">mdi-account</v-icon>
            <router-link :to="{ name: 'Customer', params: { customer_id: customer.customer_id }}">
            <span :class="`pr-3 ${customer.flag?'':''}`">{{ customer.salutation }} {{ customer.first_name }} {{ customer.middle_name }} {{ customer.last_name }}</span>
            </router-link>
            <!-- <v-btn
              icon
              x-small
              v-if="$userCheckPermission('PERM_EDIT')"
              @click="$router.push({name: 'Edit Customer', params: {customer_id: customer.customer_id}})"
              color="grey"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn> -->
          </v-col>
        </v-row>
      </v-expansion-panel-header>
      <v-expansion-panel-content class="text-body-1">

          <v-row dense>
            <v-col cols="12" class="pt-0 pb-0">
              <span class="">{{ customer.address1 }} {{ customer.address2 }} {{ customer.address3 }} {{ customer.country }}</span>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" class="pt-0 pb-0">
              <div>{{ customer.phone1 }} {{ customer.phone2 }}</div>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" class="pt-0 pb-0">
              <div><a :href="`mailto: ${customer.email}`">{{ customer.email }}{{ customer.no_marketing_email ? ' NO MARKETING ' : '' }}{{ customer.no_transaction_email ? ' NO TRANSACTION' : '' }}</a></div>
            </v-col>
          </v-row>
          <v-row v-if="customer.id_no" dense>
            <v-col cols="12" class="pt-0 pb-0">
              <div>ID no. {{customer.id_no}}</div>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" class="pt-0 pb-0">
              <div>Customer no. {{ customer.customer_id }}</div>
            </v-col>
          </v-row>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
  <v-skeleton-loader
    v-else
    type="article"
  ></v-skeleton-loader>
</div>
</template>

<script>
export default {
  name: 'CustomerDetails',

  props: {
    value: Number,
    expand: Boolean,
    small: Boolean
  },
  data () {
    return {
      customer: null,
      error: null,
      smallText: false
    }
  },
  created () {
    if (this.small === '') { this.smallText = true }
  },
  watch: {
    value: {
      immediate: true,
      handler: function (newVal) {
        if (newVal == null) return
        this.secureGet('/api/v1/customers/' + newVal)
          .then(res => {
            this.customer = res.data
          })
          .catch((error) => { this.error = error })
      }
    }
  }
}
</script>

<style scoped>
.customer-details-left {
  text-align: left;
}

.compact-panels {
  display: inline-block;
  max-width: 100%;
  width: auto;
  text-align: left;
}

.compact-panels::v-deep .v-expansion-panels {
  width: auto;
}

.compact-panel-item {
  max-width: 100%;
  width: auto;
}

.compact-header {
  display: inline-flex !important;
  justify-content: flex-start !important;
  margin: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  width: auto !important;
}

.compact-header::v-deep .v-expansion-panel-header__icon {
  margin-left: 6px !important;
  margin-right: 0 !important;
  order: 0;
}

.compact-header::v-deep .v-expansion-panel-header__icon .v-icon {
  font-size: 18px;
}

.compact-header::v-deep .v-expansion-panel-header__content {
  flex: 0 1 auto;
  line-height: 1.2;
  margin: 0 !important;
  justify-content: flex-start !important;
  text-align: left !important;
}

.compact-header::v-deep .v-row {
  flex: 0 0 auto;
  margin: 0 !important;
  width: auto;
  justify-content: flex-start !important;
  text-align: left !important;
}

.compact-header::v-deep .v-col {
  flex: 0 0 auto;
  max-width: none;
  padding-left: 0 !important;
  padding-right: 0 !important;
  width: auto;
  text-align: left !important;
}

</style>
