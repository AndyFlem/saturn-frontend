<template>
  <v-row>
    <v-col cols="12" class="pb-1 pt-1 pl-1 pr-1">
      <v-card>
        <v-card-text>
          <span class="text-h5">Event Charges</span>
          <v-row v-if="loaded">
            <v-col cols="12" md="6" class="pb-0 pt-7" v-for="(type, l) in Object.values(eventTypes)" :key="l">
              <v-card outlined class="">
                <v-card-text>
                  <v-row>
                    <v-col cols="12" class="pl-0 pt-1 pb-0">
                      <span class="text-body-1"><b>{{type.event_type}}</b></span>
                    </v-col>
                  </v-row>
                  <!-- EVENT CHARGES -->
                  <v-row>
                    <v-col cols="12" sm="12" color="" class="mb-5 pb-2 pt-2 grey lighten-3">
                      <div :ref="type.charges.length" :key="l + m" v-for="(charge, m) in type.charges">
                        <tariff-charge @delete="chargeDelete($event, type, m)" @update="chargeUpdate($event)" :products="products" :charge="charge" :edit-mode="editMode"/>
                      </div>
                      <v-row v-if="editMode">
                        <v-col cols="4" class="pt-0 pb-0 pl-2">
                              <v-text-field
                                dense
                                persistent-hint
                                class="text-caption"
                                v-model="type.newDescription"
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
                            v-model="type.newProductId"
                            hint="Product"
                          ></v-select>
                        </v-col>
                        <v-col cols="4" class="pt-0 pb-0 pl-0">
                              <v-text-field
                                dense
                                persistent-hint
                                class="text-caption"
                                v-model="type.newPrice"
                                hint="Price"
                                type="text"
                              />
                        </v-col>
                        <v-col cols="1" class="pt-0 pb-0 pl-0">
                            <v-btn
                              icon
                              class="pt-7 pb-0"
                              color="grey"
                              @click="chargeAdd(type)"
                            ><v-icon>mdi-plus-circle</v-icon></v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row v-if="false">
            <v-col cols="12" sm="10" class="d-flex pt-7">
              <v-text-field
                dense
                class="text-caption mr-3 mt-5"
                v-model="newTypeDescription"
                label="New event type"
                type="text"
              />
            </v-col>
            <v-col cols="12" sm="2" class="d-flex pt-7">
              <v-btn
                icon
                class="mt-6 ml-5 pb-0"
                color="grey"
                @click="typeAdd()"
              ><v-icon>mdi-plus-circle</v-icon></v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

import TariffCharge from './TariffCharge.vue'

export default {
  name: 'TariffEventCharges',
  props: {
    tariff: Object,
    editMode: Boolean
  },
  components: {
    TariffCharge
  },
  data () {
    return {
      eventTypes: {},
      loadCount: 0,
      newTypeDescription: null,
      newTypeMultiple: null,
      newTypeRequired: null,
      products: []
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

    // Get the charges
    this.secureGet('/api/v1/tariffs/' + this.tariff.tariff_id + '/event_charges')
      .then(res => {
        res.data.forEach(chg => {
          chg.showEdit = false
          if (!this.eventTypes[chg.event_type_ref]) {
            this.eventTypes[chg.event_type_ref] = {product_id: chg.product_id, event_type_id: chg.event_type_id, event_type_ref: chg.event_type_ref, event_type: chg.event_type, charges: []}
          }
          const type = this.eventTypes[chg.event_type_ref]
          type.charges.push(chg)
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
    chargeAdd (type) {
      const charge = {event_type_id: type.event_type_id, price: type.newPrice, product_id: type.newProductId, description: type.newDescription, tariff_id: this.tariff.tariff_id}
      this.securePost('/api/v1/event_charges/', charge)
        .then(res => {
          charge.event_charge_id = res.data.event_charge_id
          type.charges.push(charge)

          type.newDescription = null
          type.newPrice = null
          type.newProductId = null
          this.$forceUpdate()
        })
        .catch((error) => { this.error = error })
    },
    chargeUpdate (charge) {
      this.securePut('/api/v1/event_charges/' + charge.event_charge_id, {price: charge.price, description: charge.description, product_id: charge.product_id})

    },
    chargeDelete (charge, type, index) {
      this.secureDelete('/api/v1/event_charges/' + charge.event_charge_id)
        .then(() => {
          type.charges.splice(index, 1)
          this.$forceUpdate()
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>
