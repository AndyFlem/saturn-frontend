<template>
  <!-- Site type charges - sale_site_charge -->
  <v-row v-if="loaded">
  <!-- Each Site Type Group -->
  <v-col cols="12" v-for="(group, i) in Object.values(typeGroups)" :key="i" class="pb-1 pt-5 pl-1 pr-1">
    <span class="text-h5">{{group.siteTypeGroup}}</span>
    <v-row>
      <!-- Each Site Type -->
      <v-col cols="12" md="6" class="pb-0 pt-1" v-for="(type, j) in Object.values(group.types)" :key="i + j">
        <v-expansion-panels :value="null">
          <v-expansion-panel  class="elevation-1 pb-0 mb-0">
            <v-expansion-panel-header class="pb-0 mb-0">
              <!-- Header -->
              <v-container>
              <v-row>
                <v-col cols="8" class="pl-0 pt-1 pb-0">
                  <span class="text-body-1"><b>{{type.site_type}}</b><span v-if="type.graves>1">({{type.graves}})</span></span>
                </v-col>
                <v-col cols="3" class="pt-1 pb-0">
                  <span class="text-body-2"><b>Total: {{formatMInt(burialPrices[type.site_type_ref] + sitePrices[type.site_type_ref])}}</b></span>
                </v-col>
                <v-col cols="1" class="pt-1 pb-0">
                  <template v-slot:actions>
                    <v-icon color="white">
                      $expand
                    </v-icon>
                  </template>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="pt-0 pb-0">
                  <span class="caption">{{type.allow_preneed ? '&nbsp;' : 'No pre-need.'}} {{type.saleable ? '' : 'Not for sale.'}}</span>
                </v-col>
              </v-row>
            </v-container>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <!-- Charges -->
              <v-row>
                <!-- Sale Site Charges -->
                <v-col cols="12" sm="12" color="" class="mb-2 pb-2 pt-2 grey lighten-3">
                  <!-- Each Type Charge -->
                  <div :ref="type.typeCharges.length" :key="i+j+k" v-for="(charge, k) in type.typeCharges">
                    <tariff-charge @delete="typeChargeDelete($event, type, k, 'sale_site')" @update="typeChargeUpdate($event, type, 'sale_site')" :products="products" :charge="charge" :edit-mode="editMode"/>
                  </div>
                  <!-- Add new site chrge-->
                  <v-row v-if="editMode">
                    <v-col cols="4" class="pt-0 pb-0 pl-2">
                          <v-text-field
                            dense
                            persistent-hint
                            class="text-caption"
                            v-model="type.newTypeDescription"
                            hint="Description"
                            type="text"
                          />
                    </v-col>
                    <v-col cols="3" class="pt-0 pb-0 pl-2">
                      <v-select
                        dense
                        :items="products"
                        item-text="description"
                        item-value="product_id"
                        class=""
                        v-model="type.newTypeProductId"
                        hint="Product"
                      ></v-select>
                    </v-col>
                    <v-col cols="4" class="pt-0 pb-0 pl-0">
                          <v-text-field
                            dense
                            persistent-hint
                            class="text-caption"
                            v-model="type.newTypePrice"
                            hint="Price"
                            type="text"
                          />
                    </v-col>
                    <v-col cols="1" class="pt-0 pb-0 pl-0">
                        <v-btn
                          icon
                          class="pt-7 pb-0"
                          color="grey"
                          @click="typeChargeAdd(type, 'sale_site')"
                        >
                          <v-icon>mdi-plus-circle</v-icon>
                        </v-btn>
                    </v-col>
                  </v-row>
                  <!-- Sub totals -->
                  <v-row>
                    <v-col cols="12" class="pt-2 pb-0 pl-2">
                      <b>Site price: {{formatMInt(sitePrices[type.site_type_ref])}}</b>
                    </v-col>
                    <v-col v-if="!tariff.is_current" cols="12" class="pt-0 pb-3 pl-2 text-caption">
                    </v-col>
                  </v-row>
                </v-col>
                <!-- Burial Charges -->
                <v-col cols="12" sm="12" color="" class="pb-2 pt-2 grey lighten-3">
                  <!-- Each Burial Charge -->
                  <div :ref="type.burialCharges.length" :key="'ii' + i+j+k" v-for="(charge, k) in type.burialCharges">
                    <tariff-charge @delete="typeChargeDelete($event, type, k, 'burial')"  @update="typeChargeUpdate($event, type, 'burial')" :products="products" :charge="charge" :edit-mode="editMode"/>
                  </div>
                  <!-- Add new burial charge -->
                  <v-row v-if="editMode">
                    <v-col cols="4" class="pt-0 pb-0 pl-2">
                          <v-text-field
                            dense
                            persistent-hint
                            class="text-caption"
                            v-model="type.newTypeDescription"
                            hint="Description"
                            type="text"
                          />
                    </v-col>
                    <v-col cols="3" class="pt-0 pb-0 pl-2">
                      <v-select
                        dense
                        :items="products"
                        item-text="description"
                        item-value="product_id"
                        class=""
                        v-model="type.newTypeProductId"
                        hint="Product"
                      ></v-select>
                    </v-col>
                    <v-col cols="4" class="pt-0 pb-0 pl-0">
                          <v-text-field
                            dense
                            persistent-hint
                            class="text-caption"
                            v-model="type.newTypePrice"
                            hint="Price"
                            type="text"
                          />
                    </v-col>
                    <v-col cols="1" class="pt-0 pb-0 pl-0">
                        <v-btn
                          icon
                          class="pt-7 pb-0"
                          color="grey"
                          @click="typeChargeAdd(type, 'burial')"
                        ><v-icon>mdi-plus-circle</v-icon></v-btn>
                    </v-col>
                  </v-row>
                  <!-- Sub totals -->
                  <v-row>
                    <v-col cols="12" class="pt-2 pb-0 pl-2">
                      <b>Burial charges: {{formatMInt(burialPrices[type.site_type_ref])}}</b>
                    </v-col>
                    <v-col v-if="!tariff.is_current" cols="12" class="pt-0 pb-3 pl-2 text-caption">
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <!-- Totals -->
              <v-row>
                <v-col cols="12" class="pt-4 pb-0 pl-0">
                </v-col>
                <v-col  v-if="!tariff.is_current" cols="12" class="pt-1 pb-0 pl-0">
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-col>
</v-row>
</template>

<script>

import Vue from 'vue'
import TariffCharge from './TariffCharge.vue'

export default {
  name: 'TariffSiteCharges',
  props: {
    tariff: Object,
    editMode: Boolean
  },
  components: {
    TariffCharge
  },
  data () {
    return {
      typeGroups: {},
      sitePrices: {},
      burialPrices: {},
      products: [],
      loadCount: 0
    }
  },
  watch: {
  },
  created () {
    // Get the products
    this.secureGet('/api/v1/products')
      .then(res => {
        this.products = res.data
        this.loadCount += 1
      })

    // Get the site charges
    this.secureGet('/api/v1/tariffs/' + this.tariff.tariff_id + '/type_charges')
      .then(res => {
        // Build a data structure for the site charges
        res.data.forEach(chg => {
          chg.showEdit = false
          chg.oldPrice = chg.price
          if (!this.typeGroups[chg.site_type_group_ref]) {
            this.typeGroups[chg.site_type_group_ref] = {siteTypeGroupRef: chg.site_type_group_ref, siteTypeGroup: chg.site_type_group, types: {}}
          }
          const group = this.typeGroups[chg.site_type_group_ref]
          if (!group.types[chg.site_type_ref]) {
            group.types[chg.site_type_ref] = {}
            group.types[chg.site_type_ref].site_type = chg.site_type
            group.types[chg.site_type_ref].site_type_ref = chg.site_type_ref
            group.types[chg.site_type_ref].site_type_id = chg.site_type_id
            group.types[chg.site_type_ref].allow_preneed = chg.allow_preneed
            group.types[chg.site_type_ref].saleable = chg.saleable
            group.types[chg.site_type_ref].typeCharges = []
            group.types[chg.site_type_ref].burialCharges = []
            Vue.set(this.sitePrices, chg.site_type_ref, 0)
            Vue.set(this.burialPrices, chg.site_type_ref, 0)
          }
          if (chg.parent_object === 'sale_site') {
            group.types[chg.site_type_ref].typeCharges.push(chg)
            this.sitePrices[chg.site_type_ref] += parseFloat(chg.price)
          } else {
            group.types[chg.site_type_ref].burialCharges.push(chg)
            this.burialPrices[chg.site_type_ref] += parseFloat(chg.price)
          }
        })
        this.loadCount += 1
      })
  },
  computed: {
    loaded () {
      return this.loadCount === 2
    }
  },
  methods: {
    typeChargeAdd (type, parent) {
      const charge = {price: type.newTypePrice, parent_object: parent, product_id: type.newTypeProductId, description: type.newTypeDescription, site_type_id: type.site_type_id, tariff_id: this.tariff.tariff_id}
      this.securePost('/api/v1/type_charges/', charge)
        .then(res => {
          charge.type_charge_id = res.data.type_charge_id
          if (parent === 'sale_site') {
            this.sitePrices[type.site_type_ref] += parseFloat(charge.price)
            type.typeCharges.push(charge)
          } else {
            this.burialPrices[type.site_type_ref] += parseFloat(charge.price)
            type.burialCharges.push(charge)
          }
          type.newTypeDescription = null
          type.newTypePrice = null
          type.newTypeProductId = null
          this.$forceUpdate()
        })
        .catch((error) => { this.error = error })
    },
    typeChargeUpdate (charge, type, parent) {
      this.securePut('/api/v1/type_charges/' + charge.type_charge_id, {price: charge.price, description: charge.description, product_id: charge.product_id})
        .then(() => {
          if (parent === 'sale_site') {
            const newSitePrice = this.sitePrices[type.site_type_ref] + parseFloat(charge.price) - charge.oldPrice
            this.sitePrices[type.site_type_ref] = newSitePrice
          } else {
            const newBurialPrice = this.burialPrices[type.site_type_ref] + parseFloat(charge.price) - charge.oldPrice
            this.burialPrices[type.site_type_ref] = newBurialPrice
          }
        })
    },
    typeChargeDelete (charge, type, index, parent) {
      this.secureDelete('/api/v1/type_charges/' + charge.type_charge_id)
        .then(() => {
          if (parent === 'sale_site') {
            type.typeCharges.splice(index, 1)
            this.sitePrices[type.site_type_ref] -= parseFloat(charge.price)
          } else {
            type.burialCharges.splice(index, 1)
            this.burialPrices[type.site_type_ref] -= parseFloat(charge.price)
          }
          this.$forceUpdate()
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>
