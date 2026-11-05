<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            <v-icon color="white" large class="pr-3">mdi-point-of-sale</v-icon>
            <div>Sale&nbsp;no. <span v-if="sale">{{sale.sale_id}}</span></div>
            <v-spacer/>
            <template v-if="sale">
              <v-switch
                dense
                dark
                hide-details
                :disabled="!flagEnabled()"
                :color="sale.flag ? 'red':'white'"
                class="mb-0 pt-0 pb-0 mt-1 mr-7"
                v-model="sale.flag"
                label="Flagged sale?"
                @click="flagged()"
              />
            <v-chip
              v-if="sale"
              v-bind:color="colors.A"
              class="ml-auto mr-2"
            >
              {{sale.sale_status}}
            </v-chip>
            </template>
            <template v-else>
              <v-chip
                color="grey"
              ><span class="text-body-1 font-weight-bold">sale</span></v-chip>
            </template>
          </v-card-title>
          <v-card-text>
            <v-row align="start" justify="space-between" class="mb-5">
              <v-col cols="12" sm="7" class="ml-3 pb-1">
                <customer-details v-model="sale.customer_id" expand/>
              </v-col>
              <v-col v-if="sale" cols="12" sm="4" class="ml-3 pb-1 text-body-1">
                <div>Tariff:<b> {{sale.tariff_name}}</b></div>
                <div>Order Total: <b> <span>{{ formatM(sale.value_order) }}</span></b></div>
                <div>Created: <b> <span>{{ formatD(sale.created_at) }}</span></b></div>
              </v-col>
            </v-row>
            <v-row>
              <v-col v-if="sale" cols="12" class="pt-0 pb-0 d-flex flex-wrap justify-end align-content-end caption">
                <span class="caption"><b>Created:&nbsp;</b>{{formatT(sale.created_at)}}</span>
                <span class="caption"><b>,&nbsp;Updated:&nbsp;</b>{{formatT(sale.updated_at)}}</span>
                <span>
                  <b>, by&nbsp;</b>
                  <router-link v-if="$userCheckPermission('PERM_USERS_VIEW')" :to="{name: 'User', params: {user_id: sale.updated_by_id}}">{{sale.updated_by}}</router-link>
                  <span v-else>{{sale.updated_by}}</span>
                </span>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- SITES BURIALS EVENTS -->
    <v-row v-if="sale" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="secondary pb-2">
            Sites, Burials & Events
          </v-card-title>
          <v-card-text>
            <v-row align="center" justify="center">
              <v-col cols="12" class="pt-0 pb-0">
                <div
                  v-for="(saleSite, ind) in sale.customer_sites"
                  :key="ind">
                  <sale-site
                    :readonly="!$userCheckPermission('PERM_EDIT')"
                    :sale="sale"
                    :saleSite="saleSite"
                    @eventAdded="eventAdded"
                    @eventDeleted="eventDeleted"
                    @deleted="siteRemoved(ind)"
                    @burialDeleted="burialDeleted(ind)" />
                </div>
              </v-col>
            </v-row>
            <v-row align="center" justify="center">
              <v-col cols="12" class="pt-3 pb-0">
                <site-type-select
                  v-if="$userCheckPermission('PERM_EDIT')"
                  ref="siteTypeSelect"
                  v-model="selectedSite"
                  @input="siteAdded"
                  :tariff-id="sale.tariff_id"/>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- DOCUMENTS -->
    <v-row v-if="sale && sale.sale_sites && sale.sale_sites.length > 0" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="secondary pb-2">
            Order Documents
          </v-card-title>
          <v-card-text class="mt-5 text-body-1">
            <template v-for="saleSite in sale.sale_sites">
              <template>
                <v-row :key="'s' + saleSite.sale_site_id">
                  <!-- <v-col cols="12">
                    <div v-if="$userCheckPermission('PERM_EDIT')">
                      <v-icon color="primary" class="pr-3">mdi-download</v-icon>
                      <a @click="generateAgreement(saleSite)">Template sale agreement for {{ saleSite.site_type }}</a>
                    </div>
                  </v-col> -->
                  <v-col cols="12" sm="8" class="pt-0">
                      <document
                        parentObject="sale_site"
                        :error-messages="agreementDocumentErrors"
                        :parentObjectId="saleSite.sale_site_id"
                        documentPropertyRef="AGREEMENT"
                        :customerId="customer_id"
                        v-model="saleSite.agreementDocumentId"
                        :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                        :readonly="!$userCheckPermission('PERM_EDIT')"
                        :label="`Signed sale agreement for ${saleSite.site_type} ${saleSite.site_id ? saleSite.site_ref : ''}`"/>
                  </v-col>
                  <v-col v-if="$userCheckPermission('PERM_SALES_SUPER')" cols="12" sm="4" class="pt-0 d-flex align-center">or&nbsp;&nbsp;&nbsp;
                    <v-switch
                      dense
                      label="Defer agreement upload?"
                      v-model="saleSite.deferAgreement"
                    />
                  </v-col>
                </v-row>
                <v-row :key="'s1' + saleSite.sale_site_id">
                  <v-col cols="12"><v-divider /></v-col>
                </v-row>
              </template>
            </template>
            <!-- <v-row>
              <v-col cols="12" class="pl-5 pb-0">
                <div v-if="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')">
                  <v-icon color="primary" class="pr-3">mdi-download</v-icon>
                  <a @click="generateOrder">Download Order Summary</a>
                  </div>
              </v-col>
            </v-row> -->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- CHARGES AND DISCOUNTS -->
    <v-row v-if="sale" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="secondary pb-2">
            Other Charges and Discounts
          </v-card-title>
          <v-card-text class="text-body-1 ml-5 mr-5">
            <v-row v-if="$userCheckPermission('PERM_EDIT')" class="text-body-1">
              <v-col cols="3" md="2" class="pt-8">
                <b>Other Charges</b>
              </v-col>
              <v-col cols="9" md="8">
                <v-row>
                  <v-col cols="12" class="pt-5 pb-0">
                    <v-select
                      dense
                      clearable
                      :disabled="pending"
                      v-model="additionalCharge"
                      :items="charges"
                      :item-text="additionalChargeDescription"
                      item-value="other_charge_id"
                      @change="addCharge"
                      return-object
                      label="Fixed charge"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-divider/>
            </v-row>
            <v-row  v-if="$userCheckPermission('PERM_EDIT')" class="text-body-1">
              <v-col cols="3" md="2" class="pt-8">
                <b>Adhoc Charges</b>
              </v-col>
              <v-col cols="9" md="8">
                <v-row>
                  <v-col v-if="products" cols="12">
                    <v-select
                      dense
                      clearable
                      :disabled="pending"
                      v-model="adhocProductId"
                      :error-messages="adhocProductIdErrors"
                      :items="products"
                      item-text="description"
                      item-value="product_ref"
                      label="Product"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6" class="pt-0 pb-0">
                    <v-text-field
                    dense
                    v-model="adhocDescription"
                    :error-messages="adhocDescriptionErrors"
                    label="Adhoc charge description"
                    type="text"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3" class="pt-0 pb-0">
                    <v-text-field
                    dense
                    v-model="adhocCharge"
                    :error-messages="adhocErrors"
                    label="Amount"
                    type="text"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2" md="2" class="pt-0">
                    <v-btn
                      small
                      :disabled="pending || !(adhocCharge > 0)"
                      class="mt-4 ml-5"
                      color="primary"
                      @click="addAdhoc()"
                    >
                      Apply Charge
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <template v-if="$userCheckPermission('PERM_SALES_SUPER')">
              <v-row>
                <v-divider/>
              </v-row>
              <v-row>
                <v-col cols="2" md="2" class="pt-7">
                  <div><b>Discounts</b></div>
                </v-col>
                <v-col cols="8" md="6" class="">
                  <v-row>
                    <v-col cols="5" class="pt-0 pb-0">
                      <v-text-field
                      dense
                      v-model="discountPct"
                      label="Discount %"
                      type="text"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="2" class="pt-4 pl-4 pb-0"> or </v-col>
                    <v-col cols="5" class="pt-0 pb-0">
                      <v-text-field
                      dense
                      v-model="discount"
                      :error-messages="discountErrors"
                      label="Discount value"
                      type="text"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" class="pt-0 pb-0">
                      <v-text-field
                      dense
                      v-model="discountDescription"
                      :error-messages="discountDescriptionErrors"
                      label="Discount reason"
                      type="text"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="2" md="2" class="pt-7">
                  <v-btn
                    small
                    :disabled="pending || !(discount && orderValue > 0)"
                    class="mt-4 ml-5"
                    color="primary"
                    @click="addDiscount()"
                  >
                    Apply Discount
                  </v-btn>
                </v-col>
              </v-row>
            </template>
            <div class="mt-5">
              <v-row>
                <v-divider/>
              </v-row>
              <v-row>
                <v-col cols="3" md="2" class="pt-8">
                  <b>Charges Applied</b>
                </v-col>
              </v-row>
              <v-row v-for="(line, ind) in sale.charges" :key="'chr' + line.sale_line_id">
                <v-col cols="12" class="pt-0 pb-0">
                  <v-btn
                    icon
                    small
                    color="primary"
                    v-if="$userCheckPermission('PERM_EDIT')"
                    class="pt-0 pb-0"
                    :disabled="pending"
                    @click="deleteCharge(line.sale_line_id, ind, line.line_value)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  {{line.line_description}}: {{formatM(line.line_value)}}
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- ORDER -->
    <v-row v-if="sale" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="secondary pb-2 mb-5">
            Order
          </v-card-title>
          <v-card-text class="text-body-1">
            <template v-if="lines">
              <v-row v-for="line in lines" :key="line.sale_line_id">
                <v-col cols="10" class="pt-2 pb-1">
                  {{formatLineParent(line)}} - {{line.line_description}}
                </v-col>
                <v-col cols="2" class="pt-2 pb-1 d-flex justify-end">
                  {{formatM(line.line_value)}}
                </v-col>
              </v-row>
            </template>
            <v-skeleton-loader v-else type="article"/>
          </v-card-text>
          <v-card-actions class="pb-5 mr-5 ml-5">
            <span class="text-h6 black--text">Order Total: {{ formatM(orderValue) }}</span>
          </v-card-actions>
          <v-card-text class="pb-5 mr-5 ml-5">
            <v-row class="d-flex justify-end">
              <v-col cols="12" sm="6" md="6" class="d-flex justify-end">
                <template v-if="showOrderDate">
                  <v-menu
                    v-model="menuOrderDate"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        dense
                        v-model="formatOrderDate"
                        label="Order Date"
                        prepend-icon="mdi-calendar"
                        class="mr-10"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="orderDatePick"
                      @input="orderDatePicked"
                      :min="minDate"
                      :max="new Date().toISOString().substr(0, 10)"
                    >
                    </v-date-picker>
                  </v-menu>
                </template>
                <v-switch
                  hide-details
                  v-if="$userCheckPermission('PERM_SALES_SUPER')"
                  :disabled="pending || (canPlace.length > 0)"
                  class="mt-5 mb-5 ml-5"
                  v-model="showOrderDate"
                  label="Custom Order Date"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="d-flex justify-end">
                <v-btn
                  :disabled="pending"
                  v-if="canDelete"
                  class="mr-5"
                  color="red"
                  dark
                  @click="deleteOrderDialog = true">Delete sale</v-btn>
                <v-btn :disabled="pending || (canPlace.length > 0)" color="primary" @click="placeOrder">Place Order</v-btn>
              </v-col>
            </v-row>
            <v-row v-for="(msg,i) in canPlace" :key="i">
              <v-col cols="12" class="pt-0 pb-0 d-flex justify-end">
                <div class="red--text">{{msg}}</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- ADMIN ACTIONS -->
    <v-row v-if="sale && $userCheckPermission('PERM_SALES_SUPER')" align="center" justify="center">
      <v-col v-if="orderValue > 0" cols="12" md="11" lg="8">
          <v-expansion-panels>
            <v-expansion-panel>
            <v-expansion-panel-header class="secondary text-h6">
              Admin Actions
            </v-expansion-panel-header>
            <v-expansion-panel-content class="pt-5">
            <v-row>
              <v-col cols="12" md="3" class="pt-6"><div><b>Tariff</b></div></v-col>
              <v-col cols="12" md="6" class="pt-0 pb-0 d-flex">
                <v-select
                  dense
                  :items="tariffs"
                  item-text="name"
                  item-value="tariff_id"
                  v-model="sale.tariff_id"
                  @change="updateChargesDialog = true"
                ></v-select>
                <v-dialog
                  v-model="updateChargesDialog"
                  persistent
                  max-width="290"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      :disabled="pending"
                      class="ml-10 mt-2"
                      color="primary"
                      v-bind="attrs"
                      small
                      v-on="on">Reapply Tariff</v-btn>
                  </template>
                  <v-card>
                    <v-card-title class="headline">
                      Update charges
                    </v-card-title>
                    <v-card-text>Are you sure you want to reapply the tariff for this sale? Discounts and adhoc charges will be removed from the sale and any burials.</v-card-text>
                    <v-card-actions>
                      <v-spacer/>
                      <v-btn
                        color="primary"
                        text
                        :disabled="pending"
                        @click="updateChargesDialog = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        color="primary"
                        text
                        :disabled="pending"
                        @click="changeTariff"
                      >
                        Confirm
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
            </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-dialog v-model="deleteOrderDialog" max-width="450" persistent>
      <v-card class="elevation-4">
        <v-card-title class="error white--text">Delete Sale</v-card-title>
        <v-card-text class="pt-7">Are you sure you want to delete this sale? This action cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :disabled="pending" @click="deleteOrderDialog = false">Cancel</v-btn>
          <v-btn color="error" :disabled="pending" @click="deleteSale">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- NOTES -->
    <v-row  v-if="sale" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <notes
          v-bind:customerId="sale.customer_id"
          v-bind:objects="sale.objects"
          :forceAdd="addNote"
          :setFlag="flagWithNote"
          v-on:added="noteAdded"
          v-bind:readonly="!$userCheckPermission('PERM_EDIT')"
          v-bind:parentObjectId="sale.sale_id"
          parentObjectType="sale"/>
      </v-col>
    </v-row>
    <!-- DOCUMENTS -->
    <v-row  v-if="sale" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <documents
          v-bind:objects="sale.objects"
          v-bind:email="sale.email"
          :readonly="!$userCheckPermission('PERM_EDIT')"
          ref="documents"
          v-bind:customerId="sale.customer_id"
          :parentObjectId="sale.sale_id"
          parentObjectType="sale"/>
      </v-col>
    </v-row>
    <!-- AUDIT -->
    <v-row  v-if="sale" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <audit parentObjectType="sale" v-bind:parentObjectId="sale.sale_id"/>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import CustomerDetails from '@/components/customer/CustomerDetails'
import SiteTypeSelect from '@/components/sales/SiteTypeSelect'
import SaleSite from '@/components/sales/SaleSite'
import Audit from '@/components/shared/Audit'
import Documents from '@/components/shared/Documents'
import Document from '@/components/shared/Document'
import ErrorDisp from '@/components/shared/Error'
import { DateTime } from 'luxon'

import helpers from '@/services/helpers'
import { required, requiredUnless, numeric, minValue } from 'vuelidate/lib/validators'
import Notes from '@/components/notes/Notes'

const maxDiscount = (value, vm) => {
  if (value && vm.sale) {
    return parseFloat(value) <= parseFloat(vm.orderValue)
  } else {
    return true
  }
}

export default {
  name: 'tSaleNew',
  components: {
    CustomerDetails,
    SiteTypeSelect,
    Documents,
    Document,
    SaleSite,
    Audit,
    ErrorDisp,
    Notes
  },
  data () {
    return {
      error: null, // Overall error
      //customer_id: null,
      sale: null, // Main sale object includes sale.customer_sites, sale.sale_sites, sale.burials, sale.events, sale.objects
      lines: null,
      orderValue: null,
      selectedSite: null,
      resetTypeSiteSelect: false,
      charges: [], // List of available sale charges for selection
      products: null,
      discountPct: null,
      discount: null,
      discountDescription: null,
      orderDate: DateTime.now().toISO(),
      orderDatePick: DateTime.now().toISODate(),
      showOrderDate: false,
      menuOrderDate: false,
      adhocCharge: null,
      adhocDescription: null,
      adhocProductId: null,
      deleteOrderDialog: false,
      updateChargesDialog: false,
      tariffs: [],
      additionalCharge: null,
      addNote: false,
      pending: false,
      flagWithNote: false,
      minDate: null
    }
  },
  validations: {
    sale: {
      sale_sites: {
        $each: {
          agreementDocumentId: { required: requiredUnless(vm => vm.deferAgreement) }
        }
      }
    },
    discount: {
      numeric,
      minValue: minValue(0),
      maxDiscount
    },
    discountDescription: {
      required
    },
    adhocCharge: {
      numeric,
      minValue: minValue(0)
    },
    adhocDescription: {
      required
    },
    adhocProductId: {
      required
    }
  },
  created () {
    this.load()
  },
  computed: {
    colors: helpers.statusColors,
    discountErrors () {
      const errors = []
      if (!this.$v.discount.$dirty) return errors
      !this.$v.discount.numeric && errors.push('Discount must be a number.')
      !this.$v.discount.minValue && errors.push('Discount must be grater than zero.')
      !this.$v.discount.maxDiscount && errors.push('Discount must be less than the sale price.')
      return errors
    },
    discountDescriptionErrors () {
      const errors = []
      if (!this.$v.discountDescription.$dirty) return errors
      !this.$v.discountDescription.required && errors.push('Discount description is required.')
      return errors
    },
    adhocErrors () {
      const errors = []
      if (!this.$v.adhocCharge.$dirty) return errors
      !this.$v.adhocCharge.numeric && errors.push('Charge must be a number.')
      !this.$v.adhocCharge.minValue && errors.push('Charge must be grater than zero.')
      return errors
    },
    adhocProductIdErrors () {
      const errors = []
      if (!this.$v.adhocProductId.$dirty) return errors
      !this.$v.adhocProductId.required && errors.push('Product is required.')
      return errors
    },
    adhocDescriptionErrors () {
      const errors = []
      if (!this.$v.adhocDescription.$dirty) return errors
      !this.$v.adhocDescription.required && errors.push('Charge description is required.')
      return errors
    },
    agreementDocumentErrors () {
      const errors = []
      if (!this.$v.sale.sale_sites.$each.$iter) return errors
      Object.values(this.$v.sale.sale_sites.$each.$iter).forEach(s => {
        if (!s.agreementDocumentId.$dirty) { return }
        if (!s.agreementDocumentId.required) { errors.push('An uploaded sale agreement is required for each site.') }
      })
      return errors
    },
    formatOrderDate () {
      if (this.orderDate) {
        return this.formatD(this.orderDate)
      } else {
        return ''
      }
    },
    canPlace () {
      let ret = []
      if (!this.sale) {
        ret = ['No sale selected.']
        return ret
      }
      if (!this.lines) {
        ret = ['No sale lines added yet.']
        return ret
      }
      if (!this.$userCheckPermission('PERM_EDIT')) {
        ret = [`Don't have permission to place this order.`]
        return ret
      }
      if (this.lines.length === 0) {
        ret.push('No products ordered.')
      }
      if (this.sale.burials) {
        if (this.sale.burials.some(burial => burial.burial_status_ref === 'DRAFT')) {
          ret.push(`Can't place order with draft burials.`)
        }
      }
      this.sale.sale_sites.forEach(site => {
        if (!site.allow_preneed && site.burial_count === 0) {
          ret.push(`${site.site_type} cannot be ordered without a burial.`)
        }
      })
      return ret
    },
    canDelete () {
      if (!this.sale) { return false }
      if (!this.$userCheckPermission('PERM_SALES_SUPER')) { return false }
      if (this.sale.burials) {
        if (this.sale.burials.some(burial => burial.burial_status_ref === 'COMPLETE')) {
          return false
        }
      }
      return true
    }
  },
  methods: {
    // Data
    load () {
      this.pending = true
      // Get tariffs
      this.secureGet('/api/v1/tariffs')
        .then(res => {
          this.tariffs = res.data.filter(t => { return t.is_available })
        })
        .catch((error) => { this.error = error })

      // Need to be sent in a sale id
      if (this.$route.params.sale_id) {
        //this.customer_id = parseInt(this.$route.params.customer_id)
        // Get the sale

        //this.secureGet('/api/v1/customers/' + this.customer_id + '/sales/draft')
        this.secureGet('/api/v1/sales/' + this.$route.params.sale_id + '?type=items')
          .then(res => {
            if (res.data) {
              // Check sale is in draft status
              if (res.data.sale_status_ref !== 'DRAFT') {
                this.$router.replace({name: 'Sale', params: { sale_id: res.data.sale_id }})
                return
              }
              this.sale = res.data
            } else {
              // Error - no sale returned
              this.error = 'Sale not found.'
            }
          })
          .then(() => {
            return this.reloadLines()
          })
          .then(() => {
            this.pending = false
            // Get the minimum date for Sales, Receipts and Vouchers
            this.secureGet('/api/v1/sales/min_date')
              .then(res => {
                this.minDate = res.data.minDate
              })

            // Sale charges
            this.secureGet('/api/v1/tariffs/' + this.sale.tariff_id + '/other_charges?parent=sale')
              .then(res => {
                this.charges = res.data
              })
            // Products
            this.secureGet('/api/v1/products?adhoc=true')
              .then(res => {
                this.products = res.data
              })
          })
          .catch((error) => { this.error = error })
      }
    },
    reloadLines () {
      this.lines = null
      return this.secureGet('/api/v1/sales/' + this.sale.sale_id + '/lines')
        .then(res => {
          this.lines = res.data
          this.orderValue = this.lines.reduce((a, b) => a + b.line_value, 0)
        })
        .catch((error) => { this.error = error })
    },
    // Sale and order
    placeOrder () {
      this.$v.sale.$touch()
      if (!this.$v.sale.$invalid) {
        this.pending = true
        this.securePost('/api/v1/sales/' + this.sale.sale_id + '/place', {date_override: this.sale.date_override, ordered_at: this.orderDate})
          .then(() => {
            this.$router.replace('/sale/' + this.sale.sale_id)
          })
          .catch((error) => {
            this.placeOrderConfirm = false
            this.error = error
          })
      }
    },
    deleteSale () {
      this.deleteOrderDialog = false
      this.pending = true
      this.secureDelete('/api/v1/sales/' + this.sale.sale_id, {user_id: JSON.parse(localStorage.user).user_id})
        .then(() => {
          this.$router.replace({name: 'Customer', params: {customer_id: this.sale.customer_id}})
        })
        .catch((error) => { this.error = error })
    },
    // Tariff and charges
    changeTariff () {
      this.pending = true
      this.updateChargesDialog = false
      this.securePut('/api/v1/sales/' + this.sale.sale_id + '/change_tariff', {tariff_id: this.sale.tariff_id})
        .then(() => {
          this.$router.go()
        })
        .catch((error) => { this.error = error })
    },
    addAdhoc (val) {
      this.$v.adhocCharge.$touch()
      this.$v.adhocDescription.$touch()
      this.$v.adhocProductId.$touch()
      if (!this.$v.adhocCharge.$invalid && !this.$v.adhocDescription.$invalid && !this.$v.adhocProductId.$invalid) {
        this.addAddhocDisc({value: parseFloat(this.adhocCharge), description: 'Charge: ' + this.adhocDescription, product_ref: this.adhocProductId})
      }
    },
    addDiscount () {
      this.$v.discount.$touch()
      this.$v.discountDescription.$touch()
      if (!this.$v.discount.$invalid && !this.$v.discountDescription.$invalid) {
        this.addAddhocDisc({value: -parseFloat(this.discount), description: 'Discount: ' + this.discountDescription, product_ref: 'DISCOUNT'})
      }
    },
    addAddhocDisc (val) {
      this.pending = true
      let newLine = null

      this.securePost('/api/v1/sales/' + this.sale.sale_id + '/charge', val)
        .then(res => {
          newLine = res.data
          this.sale.charges.push({sale_line_id: newLine.sale_line_id, line_value: val.value, line_description: val.description})
          return this.reloadLines()
        })
        .then(() => {
          this.pending = false
          this.discountDescription = null
          this.discountPct = null
          this.discount = null
          this.adhocCharge = null
          this.adhocDescription = null
          this.adhocProductId = null
          this.$v.$reset()
        })
        .catch((error) => { this.error = error })
    },
    addCharge (val) {
      if (val) {
        this.pending = true
        this.securePost('/api/v1/sales/' + this.sale.sale_id + '/charge', {other_charge_id: val.other_charge_id})
          .then(res => {
            this.additionalCharge = 0
            val.sale_line_id = res.data.sale_line_id
            this.sale.charges.push({sale_line_id: res.data.sale_line_id, line_value: val.price, line_description: val.description})
            return this.reloadLines()
          })
          .then(() => {
            this.pending = false
          })
          .catch((error) => { this.error = error })
      }
    },
    deleteCharge (saleLineId, index, price) {
      this.pending = true
      this.secureDelete('/api/v1/sales/' + this.sale.sale_id + '/charge/' + saleLineId)
        .then(() => {
          this.sale.charges.splice(index, 1)
          let discountSum = 0
          this.sale.charges.forEach(c => {
            if (c.line_value < 0) { discountSum += c.line_value }
          })
          return this.reloadLines()
        })
        .then(() => {
          this.pending = false
        })
        .catch((error) => { this.error = error })
    },
    // Documents
    generateOrder () {
      // this.securePost(
      //   '/api/v1/sales/' + this.sale.sale_id + '/generate_order', {user_id: JSON.parse(localStorage.user).user_id})
      //   .then(() => {
      //     const url = this.$config.API_URL + '/asset/sale/' + this.sale.sale_id + '/' + this.sale.sale_id + '_Order_Summary.pdf'
      //     window.open(url, '_blank')
      //     this.$refs.documents.reloadDocuments()
      //   })
      //   .catch((error) => { this.error = error })
    },
    generateAgreement (saleSite) {
      // return this.securePost(
      //   '/api/v1/sale_sites/' + saleSite.sale_site_id + '/generate_agreement', {user_id: JSON.parse(localStorage.user).user_id})
      //   .then(() => {
      //     const url = this.$config.API_URL + '/asset/sale_site/' + saleSite.sale_site_id + '/' + saleSite.ssale_id + '_' + saleSite.sale_site_id + '_Unsigned_Sale_Agreement.pdf'
      //     window.open(url, '_blank')
      //     this.$refs.documents.reloadDocuments()
      //   })
      //   .catch((error) => { this.error = error })
    },
    // Events
    eventAdded (evt) {
      this.sale.events.push(evt)
      return this.reloadLines()
    },
    eventDeleted () {
      return this.reloadLines()
    },
    // Sub component handlers
    burialDeleted (ids) {

    },
    siteRemoved (ind) {
      this.$refs.siteTypeSelect.reset()
      this.secureDelete('/api/v1/sale_sites/' + this.sale.customer_sites[ind].sale_site_id)
        .then(() => {
          this.$router.go()
        })
        .catch((error) => { this.error = error })
    },
    siteAdded () {
      // A site has been selected
      this.$refs.siteTypeSelect.reset()

      let url, obj

      if (this.selectedSite.siteId) {
        url = '/api/v1/sales/' + this.sale.sale_id + '/saleSiteWithSite'
        obj = {site_id: this.selectedSite.siteId, tariff_id: this.sale.tariff_id}
      } else {
        url = '/api/v1/sales/' + this.sale.sale_id + '/saleSiteWithSiteType'
        obj = {site_type_id: this.selectedSite.siteTypeId, tariff_id: this.sale.tariff_id}
      }

      // Create the Sale Site
      this.securePost(url, obj)
        .then((response) => {
          // Retreive the newly created Sale Site
          return this.secureGet('/api/v1/sale_sites/' + response.data.sale_site_id)
        })
        .then(response => {
          // this.sites.push(response.data)
          this.sale.sale_sites.push(response.data)
          this.sale.customer_sites.push(response.data)
          return this.reloadLines()
        })
        .catch((error) => { this.error = error })
    },
    // Other
    orderDatePicked () {
      this.orderDate = this.orderDatePick
      this.menuOrderDate = false
      this.sale.date_override = true
    },
    flagged () {
      if (this.sale.flag) {
        this.flagWithNote = true
        this.addNote = true
      } else {
        this.securePut('/api/v1/sales/' + this.sale.sale_id + '/flag')
          .then(() => {
            return true
          })
          .catch((error) => { this.error = error })
      }
    },
    flagEnabled () {
      if (this.sale.flag) {
        return this.$userCheckPermission('PERM_SALES_SUPER')
      } else {
        return (this.$userCheckPermission('PERM_EDIT') || this.$userCheckPermission('PERM_SALES_SUPER'))
      }
    },
    noteAdded () {
      this.addNote = false
      this.flagWithNote = false
    },
    // Helpers
    formatLineParent (line) {
      switch (line.parent_object) {
        case 'sale':
          return 'Sale'
        case 'sale_site':
          let saleSite = null
          this.sale.sale_sites.forEach(ste => {
            if (ste.sale_site_id === line.parent_object_id) { saleSite = ste }
          })
          if (saleSite.site_id) {
            return 'Site - ' + saleSite.site_ref
          } else {
            return 'Site - ' + saleSite.site_type
          }
        case 'event':
          let event = null
          this.sale.events.forEach(evt => {
            if (evt.event_id === line.parent_object_id) { event = evt }
          })
          if (!event) { return 'Event' }
          return 'Event - ' + event.event_type + ' ' + this.formatT(event.event_time)
        case 'burial':
          let burial = null
          this.sale.burials.forEach(bur => {
            if (bur.burial_id === line.parent_object_id) { burial = bur }
          })
          return 'Burial - ' + burial.deceased
      }
    },
    additionalChargeDescription (itm) {
      return this.formatM(itm.price) + ' - ' + itm.description
    }
  },
  watch: {
    discountPct: function (val) {
      if (parseFloat(val)) {
        this.discount = parseFloat(this.orderValue) * (parseFloat(val) / 100)
      } else {
        this.discount = null
      }
    }
  }
}
</script>

<style scoped>

</style>
