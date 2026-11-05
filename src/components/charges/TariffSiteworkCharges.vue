<template>
  <v-row>
    <v-col cols="12" class="pb-1 pt-1 pl-1 pr-1">
      <v-card>
        <v-card-text>
          <error-disp v-model="error"/>
          <span class="text-h5">Site Work Charges</span>
          <v-row v-if="loaded">
            <v-col cols="12" md="6" class="pb-0 pt-7" v-for="type in orderedSiteTypes" :key="type.site_type_id">
              <v-card outlined>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" class="pl-0 pt-1 pb-0">
                      <span class="text-body-1"><b>{{ type.site_type }}</b></span>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" class="mb-5 pb-2 pt-2 grey lighten-3">
                      <div v-for="(charge, index) in type.charges" :key="charge.sitework_charge_id || index">
                        <v-row v-if="!charge.showEdit" class="text-caption bottom-border pl-0 mr-2">
                          <v-col v-if="editMode" cols="2" class="pt-0 pb-0 pl-2">
                            <v-btn icon class="pt-0 pb-0" @click="chargeDelete(charge, type, index)" color="grey">
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                            <v-btn icon class="pt-0 pb-0" @click="editCharge(charge)" color="grey">
                              <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                          </v-col>
                          <v-col :cols="editMode ? '4' : '6'" class="pt-2 pb-0 pl-2">
                            <span>{{ charge.description }}</span>
                          </v-col>
                          <v-col cols="3" class="pt-2 pb-0 pl-2">
                            <span>Price: {{ formatMInt(charge.price) }}</span>
                          </v-col>
                          <v-col cols="3" class="pt-2 pb-0 pl-2">
                            <span>Express: {{ formatMInt(charge.surcharge_express) }}</span>
                          </v-col>
                        </v-row>

                        <v-row v-else>
                          <v-col cols="12" class="d-flex pt-0 pb-0 pl-2">
                            <v-btn icon class="pt-0 pb-0" @click="chargeUpdate(charge)" color="green">
                              <v-icon>mdi-check</v-icon>
                            </v-btn>
                            <v-btn icon class="pt-0 pb-0" @click="cancelEdit(charge)" color="red">
                              <v-icon>mdi-cancel</v-icon>
                            </v-btn>
                            <v-text-field
                              dense
                              hide-details
                              class="text-caption"
                              v-model="charge.description"
                              type="text"
                            />
                          </v-col>
                          <v-col cols="6" class="pt-0 pb-0 pl-2">
                            <v-text-field
                              dense
                              hide-details
                              class="text-caption"
                              v-model="charge.price"
                              hint="Price"
                              type="number"
                            />
                          </v-col>
                          <v-col cols="6" class="pt-0 pb-0 pl-2">
                            <v-text-field
                              dense
                              hide-details
                              class="text-caption"
                              v-model="charge.surcharge_express"
                              hint="Express surcharge"
                              type="number"
                            />
                          </v-col>
                        </v-row>
                      </div>

                      <v-row v-if="editMode && type.charges.length === 0">
                        <v-col cols="5" class="pt-0 pb-0 pl-2">
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
                          <v-text-field
                            dense
                            persistent-hint
                            class="text-caption"
                            v-model="type.newPrice"
                            hint="Price"
                            type="number"
                          />
                        </v-col>
                        <v-col cols="3" class="pt-0 pb-0 pl-2">
                          <v-text-field
                            dense
                            persistent-hint
                            class="text-caption"
                            v-model="type.newSurchargeExpress"
                            hint="Express"
                            type="number"
                          />
                        </v-col>
                        <v-col cols="1" class="pt-0 pb-0 pl-0">
                          <v-btn
                            icon
                            class="pt-7 pb-0"
                            color="grey"
                            @click="chargeAdd(type)"
                          >
                            <v-icon>mdi-plus-circle</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import Vue from 'vue'
import ErrorDisp from '@/components/shared/Error'

export default {
  name: 'TariffSiteworkCharges',
  props: {
    tariff: Object,
    editMode: Boolean
  },
  components: {
    ErrorDisp
  },
  data () {
    return {
      siteTypes: {},
      loaded: false,
      error: null
    }
  },
  computed: {
    orderedSiteTypes () {
      return Object.values(this.siteTypes).sort((a, b) => {
        return (a.site_type || '').localeCompare(b.site_type || '')
      })
    }
  },
  async created () {
    try {
      const [siteTypesRes, chargesRes] = await Promise.all([
        this.secureGet('/api/v1/site_types'),
        this.secureGet('/api/v1/tariffs/' + this.tariff.tariff_id + '/sitework_charges')
      ])

      siteTypesRes.data.forEach(type => {
        Vue.set(this.siteTypes, type.site_type_id, {
          site_type_id: type.site_type_id,
          site_type: type.site_type,
          charges: [],
          newDescription: null,
          newPrice: null,
          newSurchargeExpress: null
        })
      })

      chargesRes.data.forEach(chg => {
        if (!this.siteTypes[chg.site_type_id]) {
          Vue.set(this.siteTypes, chg.site_type_id, {
            site_type_id: chg.site_type_id,
            site_type: 'Site Type ' + chg.site_type_id,
            charges: [],
            newDescription: null,
            newPrice: null,
            newSurchargeExpress: null
          })
        }

        this.siteTypes[chg.site_type_id].charges.push({
          ...chg,
          showEdit: false,
          oldDescription: chg.description,
          oldPrice: chg.price,
          oldSurchargeExpress: chg.surcharge_express
        })
      })

      this.loaded = true
    } catch (error) {
      this.error = error
    }
  },
  methods: {
    editCharge (charge) {
      charge.showEdit = true
      this.$forceUpdate()
    },
    async chargeAdd (type) {
      try {
        const charge = {
          tariff_id: this.tariff.tariff_id,
          site_type_id: type.site_type_id,
          description: type.newDescription,
          price: type.newPrice || 0,
          surcharge_express: type.newSurchargeExpress || 0
        }

        const res = await this.securePost('/api/v1/sitework_charges/', charge)
        type.charges.push({
          ...charge,
          sitework_charge_id: res.data.sitework_charge_id,
          showEdit: false,
          oldDescription: charge.description,
          oldPrice: charge.price,
          oldSurchargeExpress: charge.surcharge_express
        })

        type.newDescription = null
        type.newPrice = null
        type.newSurchargeExpress = null
        this.$forceUpdate()
      } catch (error) {
        this.error = error
      }
    },
    async chargeUpdate (charge) {
      try {
        await this.securePut('/api/v1/sitework_charges/' + charge.sitework_charge_id, {
          description: charge.description,
          price: charge.price,
          surcharge_express: charge.surcharge_express
        })

        charge.oldDescription = charge.description
        charge.oldPrice = charge.price
        charge.oldSurchargeExpress = charge.surcharge_express
        charge.showEdit = false
      } catch (error) {
        this.error = error
      }
    },
    cancelEdit (charge) {
      charge.description = charge.oldDescription
      charge.price = charge.oldPrice
      charge.surcharge_express = charge.oldSurchargeExpress
      charge.showEdit = false
    },
    async chargeDelete (charge, type, index) {
      try {
        await this.secureDelete('/api/v1/sitework_charges/' + charge.sitework_charge_id)
        type.charges.splice(index, 1)
        this.$forceUpdate()
      } catch (error) {
        this.error = error
      }
    }
  }
}
</script>
