<template>
  <v-card v-if="siteTypeCategories">
    <v-alert v-if="error" type="error">{{ error }}</v-alert>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="8" md="6" class="pb-0 pt-0 d-flex">
          <v-select
            label="Purchase new site..."
            v-model="siteTypeCategoryId"
            :items="siteTypeCategories"
            item-value="site_type_category_id"
            item-text="site_type_category"
            @change="categorySelected"
            :disabled="disabled"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <!-- List of types for the category -->
        <v-col cols="12" sm="12" v-for="typ in selectedTypes" :key="typ.site_type_id" md="6">
          <v-card>
            <v-card-title class="secondary text-body-1 pt-3 pb-3">
              <b>{{ typ.site_type }}</b>
              <v-spacer />
              <!-- Add the site type - with no site - to the sale -->
              <v-btn
                color="primary"
                class="mt-7"
                title="Add site type to sale"
                icon
                v-on:click="addSiteType(typ.site_type_id)"
              >
                <v-icon>mdi-plus-circle</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="pt-5">
              <div>{{ typ.description }}</div>
              <div v-if="!typ.allow_preneed">Not available for pre-sale without a burial.</div>
            </v-card-text>
            <v-divider />
            <v-card-text class="pb-0">
              <!-- Charges -->
              <v-row>
                <v-col v-if="typ.siteCharges" cols="6" class="pt-0 pb-0">
                  <div v-for="charge in typ.siteCharges" :key="charge.type_charge_id">
                    {{charge.description}}: {{formatM(charge.price)}}
                  </div>
                  <div><b>Site cost: </b>{{ formatM(typ.siteCharge) }}</div>
                </v-col>
                <v-col v-if="typ.burialCharges" cols="6"  class="pt-0 pb-0">
                  <div v-for="charge in typ.burialCharges" :key="charge.type_charge_id">
                    {{charge.description}}: {{formatM(charge.price)}}
                  </div>
                  <div><b>Burial charge: </b>{{ formatM(typ.burialCharge) }}</div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="pt-0">
                  <div class="pt-2 text-body-2"><b>Total: </b>{{ formatM(typ.siteCharge + typ.burialCharge) }}</div>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-text>
              <!-- Block row site no selector -->
              <site-selector v-model="selectedSite" v-on:input="siteSelected" :siteTypeId="typ.site_type_id"/>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                @click="displayMap(typ.site_type_id)"
                text>Select From Map</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-dialog  v-model="showSelectMap" fullscreen>
          <v-card height="100%">
            <v-toolbar dark color="primary">
              <v-btn icon dark @click="showSelectMap = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>CLOSE
            </v-toolbar>
            <v-card-text>
              <!-- Select by map -->
              <block-map v-if="showSelectMap" v-model="selectedSiteMap" v-on:input="siteSelectedMap" :site-type-id="mapSiteTypeId"/>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

// Included from tSaleNew
import SiteSelector from '@/components/sales/SiteSelector'

export default {
  name: 'SiteTypeSelect',
  props: ['value', 'disabled', 'tariffId'],
  components: {
    BlockMap: () => import(/* webpackChunkName: "blockmap" */ '@/components/sites/Map.vue'),
    SiteSelector
  },
  data () {
    return {
      selectedSite: {},
      selectedSiteMap: null,
      siteTypes: {},
      siteTypeCategories: null,
      selectedTypes: [],
      mapSiteTypeId: null,
      siteTypeCategoryId: null,
      showSelectMap: false,
      siteId: null,
      error: null,
      loaded: false
    }
  },
  watch: {
  },
  methods: {
    addSiteType (siteTypeId) {
      this.$emit('input', {siteTypeId: siteTypeId})
    },
    displayMap (siteTypeId) {
      // console.log('displayMap:', siteTypeId)
      this.mapSiteTypeId = siteTypeId
      this.showSelectMap = true
    },
    reset () {
      this.showSelectMap = false
      this.mapSiteTypeId = null
      this.siteTypeCategoryId = null
      this.selectedTypes = []
    },
    siteSelectedMap () {
      console.log('Map select: ', this.selectedSiteMap)
      this.$emit('input', {siteId: this.selectedSiteMap})
      this.showSelectMap = false
    },
    siteSelected () {
      this.$emit('input', {siteId: this.selectedSite.site_id})
    },
    categorySelected () {
      this.selectedTypes = Object.values(this.siteTypes).filter(t => {
        return (t.site_type_category_id === this.siteTypeCategoryId && t.saleable)
      })
    }
  },
  created () {
    this.secureGet('/api/v1/site_type_categories')
      .then(res => {
        this.siteTypeCategories = res.data
        return this.secureGet('/api/v1/site_types')
      })
      .then(res => {
        res.data.forEach(t => {
          this.siteTypes[t.site_type_id] = t
        })
        return this.secureGet('/api/v1/tariffs/' + this.tariffId + '/type_charges')
      })
      .then(res => {
        res.data.forEach(chg => {
          if (chg.parent_object === 'sale_site') {
            if (!this.siteTypes[chg.site_type_id].siteCharges) {
              this.siteTypes[chg.site_type_id].siteCharges = []
              this.siteTypes[chg.site_type_id].siteCharge = 0
            }
            this.siteTypes[chg.site_type_id].siteCharges.push(chg)
            this.siteTypes[chg.site_type_id].siteCharge += parseFloat(chg.price)
          } else {
            if (!this.siteTypes[chg.site_type_id].burialCharges) {
              this.siteTypes[chg.site_type_id].burialCharges = []
              this.siteTypes[chg.site_type_id].burialCharge = 0
            }
            this.siteTypes[chg.site_type_id].burialCharges.push(chg)
            this.siteTypes[chg.site_type_id].burialCharge += parseFloat(chg.price)
          }
        })
        this.loaded = true
      })
      .catch((error) => { this.error = error })
  }
}
</script>

<style scoped>

</style>
