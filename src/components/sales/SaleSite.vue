<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-card class="mb-1 mt-3 elevation-2">
      <v-card-title :class="`text-body-1 pt-2 pb-2 ${saleSiteBelongsToSale ? 'primary white--text' : 'secondary' }`">
        <div><b>{{saleSite.site_type}}</b></div>
        <v-spacer/>
        <site-map-popup :dark="saleSiteBelongsToSale" v-if="saleSite && hasSite" :site="saleSite" />
        <template v-if="hasSite">
          <router-link :class="saleSiteBelongsToSale ? 'white--text' : 'grey--text text--darken-2'" :to="{ name: 'Site', params: {site_id: saleSite.site_id}}">{{saleSite.site_ref}}</router-link>
        </template>
        <template v-else>
          Site not selected
        </template>
        <v-btn
          icon
          @click="showDeleteSiteForm"
          v-if="sale.sale_status_ref=='DRAFT' && !readonly"
          :disabled="!saleSiteBelongsToSale || burialCount > 0 || pending || eventsCount > 0"
          dark
          title="Remove site from sale."
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pt-2 pb-2 mt-0 text-body-2">
        <div v-if="!saleSiteBelongsToSale" style="min-width:150px;">
          <router-link :to="{name: 'Sale', params: {sale_id: saleSite.sale_id}}">Sale {{saleSite.sale_id}}</router-link>
          &nbsp;({{saleSite.sale_status}})
        </div>
        <template v-if="false && typeCharges && burialCharges">
          <v-row v-if="burialCount < saleSite.graves || saleSiteBelongsToSale"><v-col class="pb-0" cols="12"><b>Burial charges:</b></v-col></v-row>
          <v-row class="text-caption">
            <v-col v-if="burialCount < saleSite.graves || saleSiteBelongsToSale" cols="12" sm="6" md="4">
              <div v-for="charge in burialCharges" :key="charge.sale_line_id">
                {{formatM(charge.price)}}: {{charge.description}}
              </div>
              <div style="min-width:150px;"><b>Total: {{formatM(burialCharge)}}</b></div>
            </v-col>
          </v-row>
          <v-row>
            <v-divider />
          </v-row>
        </template>
        <!--<v-skeleton-loader type="article" v-else/>-->
        <v-row v-if="saleSiteBelongsToSale && (!saleSite.allow_preneed) && burialCount===0">
            <v-col cols="12" sm="6" md="4" class="red--text">
              Site does not allow pre-sale without a burial.
            </v-col>
        </v-row>
        <v-row>
            <v-divider />
          </v-row>
      </v-card-text>
      <v-card-text class="pb-1 pt-1">
        <template v-if="(!hasSite)">
          <v-row>
            <v-col cols="12" md="10" class="pl-10 pr-10 text-body-2">Select site:
              <site-selector v-model="selectedSite" v-on:input="siteSelected" :siteTypeId="saleSite.site_type_id"/>
            </v-col>
          </v-row>
          <v-row>
              <v-divider />
          </v-row>
        </template>
        <v-list v-if="burials">
          <template v-for="indx in (saleSite.graves)">
            <v-list-item :key="indx" class="">
              <v-list-item-content class="pt-1 pb-1">
                <burial-details
                  :burial="burials[indx]"
                  hideHeadstoneSwitch
                  :readonly="readonly"
                  :saleId="sale.sale_id"
                  :graveNo="indx">
                  <template v-slot:actions>
                    <v-row>
                      <v-col cols="12" class="d-flex justify-end align-center">
                    <v-icon
                      class="pt-0 pb-0 ml-2 mt-3"
                      color="primary"
                      title="Delete burial"
                      v-if="!readonly"
                      :disabled="!canEdit(indx)"
                      @click="deleteBurial(indx)"
                    >mdi-delete
                    </v-icon>
                      </v-col>
                    </v-row>
                  </template>
                  <template v-slot:available_actions>
                    <v-row>
                      <v-col cols="12" class="d-flex justify-end pt-0 pb-0 ml-2">
                        <v-btn
                          class="pl-1 pr-1"
                          color="primary"
                          @click="newBurial(indx)"
                          icon
                          :disabled="pending"
                          title="Add new burial for this grave"
                          v-if="sale.sale_status_ref==='DRAFT' && !readonly"
                        >
                          <v-icon>mdi-plus-circle</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </template>
                </burial-details>
              </v-list-item-content>
            </v-list-item>
            <v-divider :key="'g' + indx" />
          </template>
        </v-list>
      </v-card-text>
      <v-card-text>
        <events
          v-if="hasSite"
          @eventAdded="eventAdded"
          @eventDeleted="$emit('eventDeleted')"
          v-model="eventsCount"
          :readonly="readonly"
          :siteId="saleSite.site_id"
          :siteRef="saleSite.site_ref"
          :saleId="sale.sale_id"
          :saleSiteId="saleSite.sale_site_id"
          :tariffId="sale.tariff_id" />
      </v-card-text>
      <v-card-actions v-if="canMoveSite" class="text-h6 pb-5 mr-5 ml-5">
        <v-spacer/>
        <v-btn
          class="mr-3"
          color="primary"
          @click="showMoveForm">Move site</v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog v-if="sale" v-model="moveForm" persistent max-width="800">
      <v-card class="elevation-4">
        <v-card-title class="primary white--text">
          Move site - from {{ saleSite.site_ref }} to:
        </v-card-title>
        <v-card-text class="pt-7">
          <v-row class="">
            <v-col cols="6" class="">
              <site-selector v-model="selectedMoveSite" v-on:input="moveSite" :siteTypeId="saleSite.site_type_id"/>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :disabled="pending" @click="showMoveForm">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteBurialForm" persistent max-width="500">
      <v-card class="elevation-4">
        <v-card-title class="error white--text">
          Delete burial
        </v-card-title>
        <v-card-text class="pt-7">
          Are you sure you want to delete this burial?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :disabled="pending" @click="cancelDeleteBurial">Cancel</v-btn>
          <v-btn color="error" :disabled="pending" @click="confirmDeleteBurial">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteSiteForm" persistent max-width="500">
      <v-card class="elevation-4">
        <v-card-title class="error white--text">
          Remove site from sale
        </v-card-title>
        <v-card-text class="pt-7">
          Are you sure you want to remove this site from the sale?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :disabled="pending" @click="cancelDeleteSite">Cancel</v-btn>
          <v-btn color="error" :disabled="pending" @click="confirmDeleteSite">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SiteMapPopup from '@/components/sites/SiteMapPopup'
import BurialDetails from '@/components/burials/BurialDetails'
import Events from '@/components/events/Events'
import SiteSelector from '@/components/sales/SiteSelector'

export default {
  name: 'SaleSite',
  components: {
    SiteMapPopup,
    BurialDetails,
    SiteSelector,
    Events
  },
  props: {
    sale: Object,
    saleSite: Object,
    readonly: Boolean
  },
  data () {
    return {
      selectedSite: null,
      burials: null,
      burialCount: null,
      eventsCount: null,
      burialCharges: [],
      burialCharge: 0,
      typeCharge: 0,
      typeCharges: [],
      error: null,
      pending: false,
      moveForm: false,
      selectedMoveSite: null,
      deleteBurialForm: false,
      selectedBurialGraveNo: null,
      deleteSiteForm: false
    }
  },
  created () {
    this.pending = true
    this.secureGet('/api/v1/sale_sites/' + this.saleSite.sale_site_id + '/burials')
      .then(res => {
        this.burialCount = res.data.length
        this.burials = []
        res.data.forEach(burial => {
          this.burials[burial.grave_no] = burial
        })
        return this.secureGet('/api/v1/tariffs/' + this.sale.tariff_id + '/type_charges?siteTypeId=' + this.saleSite.site_type_id)
      })
      .then(res => {
        res.data.forEach(chg => {
          if (chg.parent_object === 'burial') {
            this.burialCharges.push(chg)
            this.burialCharge += parseFloat(chg.price)
          } else {
            this.typeCharges.push(chg)
            this.typeCharge += parseFloat(chg.price)
          }
        })
        this.pending = false
      })
      .catch((error) => { this.error = error })
  },
  computed: {
    saleSiteBelongsToSale: function () {
      return this.sale.sale_id === this.saleSite.sale_id
    },
    hasSite: function () {
      return this.saleSite.site_id
    },
    canMoveSite: function () {
      if (!this.$userCheckPermission('PERM_SALES_SUPER')) { return false }
      if (!this.saleSiteBelongsToSale) { return false }
      if (this.sale.sale_status_ref !== 'FULFILLED') { return false }
      if (!this.hasSite) { return false }
      if (this.burialCount !== 0) { return false }
      if (this.eventsCount !== 0) { return false }
      return  true
    }
  },
  methods: {
    siteSelected () {
      this.pending = true
      this.securePost('/api/v1/sale_sites/' + this.saleSite.sale_site_id + '/setSite', {site_id: this.selectedSite.site_id})
        .then(() => {
          this.$router.go()
        })
        .catch((error) => { this.error = error })
    },
    eventAdded (evt) {
      this.$emit('eventAdded', evt)
    },
    showDeleteSiteForm () {
      this.deleteSiteForm = true
    },
    cancelDeleteSite () {
      this.deleteSiteForm = false
    },
    confirmDeleteSite () {
      this.deleteSiteForm = false
      this.$emit('deleted')
    },
    deleteBurial (graveNo) {
      this.selectedBurialGraveNo = graveNo
      this.deleteBurialForm = true
    },
    cancelDeleteBurial () {
      this.deleteBurialForm = false
      this.selectedBurialGraveNo = null
    },
    confirmDeleteBurial () {
      if (this.selectedBurialGraveNo === null || !this.burials[this.selectedBurialGraveNo]) {
        this.cancelDeleteBurial()
        return
      }
      this.pending = true
      this.secureDelete('/api/v1/burials/' + this.burials[this.selectedBurialGraveNo].burial_id)
        .then(() => {
          this.cancelDeleteBurial()
          this.$router.go()
        })
        .catch((error) => {
          this.error = error
          this.pending = false
        })
    },
    newBurial (graveNo) {
      this.pending = true
      // Create a new draft burial
      this.securePost('/api/v1/burials', {
        sale_id: this.sale.sale_id,
        sale_site_id: this.saleSite.sale_site_id,
        site_type_id: this.saleSite.site_type_id,
        site_id: this.saleSite.site_id,
        grave_no: graveNo,
        tariff_id: this.sale.tariff_id
      })
        .then(response => {
          // Navigate to the new draft
          this.$router.push({name: 'Edit Burial', params: { burial_id: response.data.burial_id }})
        })
        .catch((error) => { this.error = error })
    },
    canEdit (indx) {
      return (this.burials[indx].burial_status_ref !== 'COMPLETE' && this.sale.sale_status_ref === 'DRAFT' && this.burials[indx].sale_id === this.sale.sale_id)
    },
    showMoveForm () {
      this.moveForm = !this.moveForm
    },
    moveSite() {
      this.pending = true
      this.securePost('/api/v1/sale_sites/' + this.saleSite.sale_site_id + '/moveSite', {newSiteId: this.selectedMoveSite.site_id})
        .then(() => {
          this.$router.go()
        })
        .catch((error) => { this.error = error })
    }
  },
  watch: {}
}
</script>

<style scoped>
</style>
