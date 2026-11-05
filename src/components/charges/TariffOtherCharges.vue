<template>
  <v-row>
    <v-col cols="12" class="pb-1 pt-1 pl-1 pr-1">
      <v-card>
        <v-card-text>
          <span class="text-h5">Other Charges</span>
          <v-row v-if="loaded">
            <v-col cols="12" md="6" class="pb-0 pt-7" v-for="(group, l) in Object.values(chargeGroups)" :key="l">
              <v-card outlined class="">
                <v-card-text>
                  <v-row>
                      <v-col cols="12" class="pl-0 pt-1 pb-0">
                        <span class="text-body-1"><b>{{group.description}}</b></span>
                      </v-col>
                      <v-col cols="12" class="pl-0 pt-0 pb-6">
                        Required: {{group.required? 'yes' : 'no'}}, Allow multiple: {{group.allow_multiple? 'yes' : 'no'}}
                      </v-col>
                  </v-row>
                  <!-- GROUP CHARGES -->
                  <v-row>
                    <v-col cols="12" sm="12" color="" class="mb-5 pb-2 pt-2 grey lighten-3">
                      <div :ref="group.charges.length" :key="l + m" v-for="(charge, m) in group.charges">
                        <tariff-charge @delete="chargeDelete($event, group, m)" @update="chargeUpdate($event)" :products="products" :charge="charge" :edit-mode="editMode"/>
                      </div>
                      <v-row v-if="editMode">
                        <v-col cols="4" class="pt-0 pb-0 pl-2">
                              <v-text-field
                                dense
                                persistent-hint
                                class="text-caption"
                                v-model="group.newDescription"
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
                            v-model="group.newProductId"
                            hint="Product"
                          ></v-select>
                        </v-col>
                        <v-col cols="4" class="pt-0 pb-0 pl-0">
                              <v-text-field
                                dense
                                persistent-hint
                                class="text-caption"
                                v-model="group.newPrice"
                                hint="Price"
                                type="text"
                              />
                        </v-col>
                        <v-col cols="1" class="pt-0 pb-0 pl-0">
                            <v-btn
                              icon
                              class="pt-7 pb-0"
                              color="grey"
                              @click="chargeAdd(group)"
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
            <v-col cols="12" sm="6" class="d-flex pt-7">
              <v-text-field
                dense
                class="text-caption mr-3 mt-5"
                v-model="newGroupDescription"
                label="New charge group"
                type="text"
              />
            </v-col>
            <v-col cols="12" sm="6" class="d-flex pt-7">
              <v-switch
                class="text-caption mr-3"
                dense
                v-model="newGroupRequired"
                label="Required?"
              />
              <v-switch
                class="text-caption mr-3"
                dense
                v-model="newGroupMultiple"
                label="Allow multiple?"
              />
              <v-btn

              icon
                class="mt-6 ml-5 pb-0"
                color="grey"
                @click="groupAdd()"
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
  name: 'Tariffothers',
  props: {
    tariff: Object,
    editMode: Boolean
  },
  components: {
    TariffCharge
  },
  data () {
    return {
      chargeGroups: {},
      groupCharges: {},
      loadCount: 0,
      newGroupDescription: null,
      newGroupMultiple: null,
      newGroupRequired: null,
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

    // Get the charge groups
    this.secureGet('/api/v1/tariffs/' + this.tariff.tariff_id + '/other_charge_groups')
      .then(res => {
        res.data.forEach(grp => {
          grp.showEdit = false
          if (!this.chargeGroups[grp.other_charge_group_id]) {
            this.chargeGroups[grp.other_charge_group_id] = {
              other_charge_group_id: grp.other_charge_group_id,
              description: grp.description,
              required: grp.required,
              allow_multiple: grp.allow_multiple,
              charges: []
            }
          }
        })
        // Get the charges
        return this.secureGet('/api/v1/tariffs/' + this.tariff.tariff_id + '/other_charges')
      })
      .then(res => {
        res.data.forEach(chg => {
          this.$set(this.groupCharges, chg.other_charge_id, { ...chg })
          this.chargeGroups[chg.other_charge_group_id].charges.push(chg)
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
    chargeAdd (group) {
      const charge = {other_charge_group_id: group.other_charge_group_id, price: group.newPrice, product_id: group.newProductId, description: group.newDescription, tariff_id: this.tariff.tariff_id}
      this.securePost('/api/v1/other_charges/', charge)
        .then(res => {
          charge.other_charge_id = res.data.other_charge_id
          group.charges.push(charge)

          group.newDescription = null
          group.newPrice = null
          group.newProductId = null
          this.$forceUpdate()
        })
        .catch((error) => { this.error = error })
    },
    chargeUpdate (charge) {
      this.securePut('/api/v1/other_charges/' + charge.other_charge_id, {price: charge.price, description: charge.description, product_id: charge.product_id})
    },
    chargeDelete (charge, group, index) {
      this.secureDelete('/api/v1/other_charges/' + charge.other_charge_id)
        .then(() => {
          group.charges.splice(index, 1)
          this.$forceUpdate()
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>
