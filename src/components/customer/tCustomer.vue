<template>
  <div>
    <error-disp v-model="error"/>
    <!-- CUSTOMER DETAILS -->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <template v-if="customer">
            <v-card-title class="primary white--text">
              <v-icon :class="customer.flag?'red--text':''" color="white" large class="pr-3">mdi-account</v-icon>
              <span v-if="customer.is_corporate==true" class="pt-0 pb-1">{{ customer.company_name }}{{customer.is_contractor ? ' (Contractor)' : ''}}</span>
              <span :class="customer.flag?'red--text':''" v-else>{{ customer.salutation }} {{ customer.first_name }} {{ customer.middle_name }} {{ customer.last_name }}</span>
              <v-spacer/>
              <v-switch
                dense
                dark
                hide-details
                :disabled="!flagEnabled()"
                :color="customer.flag ? 'red':'white'"
                class="mb-0 pt-0 pb-0 mt-1 mr-7"
                v-model="customer.flag"
                label="Flagged customer?"
                @click="flagged()"
              />
              <span>Customer no. {{customer.customer_id}}</span>
            </v-card-title>
            <v-card-subtitle v-if="customer.is_corporate==true" class="primary white--text" >
              <span>{{ customer.salutation }} {{ customer.first_name }}  {{ customer.middle_name }} {{ customer.last_name }}</span>
            </v-card-subtitle>
            <v-card-text class="mt-5 ml-3 text-body-1">
              <v-row>
                <v-col cols="12" sm="6" md="4" class="pt-1 pb-0">
                  <div><b> Address</b></div>
                  <div>{{ customer.address1 }}</div>
                  <div>{{ customer.address2 }}</div>
                  <div>{{ customer.address3 }}</div>
                  <div>{{ customer.country }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pt-1 pb-0">
                  <div v-if="customer.tax_id">Tax Id: <b>{{customer.tax_id}}</b></div>
                  <div v-if="customer.id_no">Id No: <b>{{ customer.id_no }}</b></div>
                  <div v-if="customer.phone1">Phone 1: <b>{{ customer.phone1 }}</b></div>
                  <div v-if="customer.phone2">Phone 2: <b>{{ customer.phone2 }}</b></div>
                  <div v-if="customer.email">Email: <b><a :href="'mailto:' + customer.email">{{ customer.email }}</a></b></div>
                  <div v-if="customer.no_marketing_email" class="caption"><b>NO MARKETING EMAIL</b></div>
                  <div v-if="customer.no_transaction_email" class="caption"><b>NO TRANSACTION EMAIL</b></div>
                  <div v-if="customer.legacy_id">Legacy Id: <b>{{ customer.legacy_id }}</b></div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="d-flex">
                  <v-spacer />
                  <v-btn
                    class="mr-4"
                    color="primary"
                    v-on:click="$router.push({ name: 'Edit Customer', params: { customer_id: customer.customer_id }})"
                    v-if="$userCheckPermission('PERM_EDIT')"
                  >
                  Edit
                  </v-btn>
                  <v-btn
                    class="mr-4"
                    color="primary"
                    v-on:click="deleteCustomer"
                    :disabled="deleteDisabled"
                    v-if="$userCheckPermission('PERM_EDIT')"
                  >
                  Delete
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </template>
          <template v-else>
            <v-card-title class="primary white--text">
              <v-icon color="white" large class="pr-3">mdi-account</v-icon>
              Customer
              <v-spacer/>
            </v-card-title>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- STATEMENT -->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card>
          <v-card-title class="secondary pb-2">
            Statement
            <v-spacer />
            <v-btn
              v-if="customer && false"
                color="primary"
                @click="generateStatement"
              >
                Download
            </v-btn>
          </v-card-title>
          <v-card-text v-if="customer" class="text-body-1">
            <v-row>
              <v-col>
                <b>Date</b>
              </v-col>
              <v-col>
                <b>Item</b>
              </v-col>
              <v-col>
                <b>Value</b>
              </v-col>
              <v-col>
                <b>Balance</b>
              </v-col>
            </v-row>
            <v-row v-for="(line, i) in statement" :key="i">
              <v-col>
                {{formatT(line.date)}}
              </v-col>
              <v-col>
                <router-link :to="{name: 'Sale', params: { sale_id: line.sale_id }}">{{line.narrative}}</router-link>
              </v-col>
              <v-col>
                {{formatMInt(line.value)}}
              </v-col>
              <v-col>
                {{formatMInt(line.balance)}}
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <span class="text-body-1"><b><span v-if="customer.customer_balance>0">Credit </span>Balance: <span>{{ formatMInt(customer.customer_balance) }}</span></b></span>
              </v-col>
            </v-row>
          </v-card-text>
          <v-skeleton-loader
              v-else
              type="article"
            ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <!-- SALES -->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card>
          <v-card-title class="secondary pb-2">
            Sales
            <v-spacer/>
              <v-btn
                color="primary"
                icon
                title="Add a new Sale"
                @click="addSale"
                v-if="canAddSale"
              >
              <v-icon>mdi-plus-circle</v-icon>
              </v-btn>
          </v-card-title>
          <v-card-text v-if="sales" class="mt-0 pt-0">
            <template v-if="sales.length>0">
              <div v-for="sale in sales" :key="sale.sale_id">
                <v-row dense>
                  <v-col cols="12">
                    <sale-search-result :value="sale.sale_id" hide-customer flat/>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="12" class="pb-0 pt-0">
                    <v-divider/>
                  </v-col>
                </v-row>
              </div>
              <v-row>
                <v-col cols="12" class="text-body-1">
                  <span><b>Total: </b><span>{{formatM(customer.value_order)}}</span></span>
                </v-col>
              </v-row>
            </template>
            <div v-else class="pt-3 text-body-1">
              None
            </div>
          </v-card-text>
          <v-skeleton-loader
              v-else
              type="article"
            ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <!-- RECEIPTS -->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="secondary pb-2">
            Receipts
            <v-spacer/>
          </v-card-title>
          <v-card-text class="text-body-1">
            <template v-if="receipts">
              <template v-if="receipts.length>0">
                <div v-for="(receipt, indx) in receipts" :key="indx">
                  <v-row class="pt-5 pl-3">
                    <v-col cols="12" v-if="receipt.receipt_customer_id !== receipt.sale_customer_id" class="pt-0 pb-0">
                      <span class="pl-2">Paid by: </span>
                      <v-icon class="pr-2 pt-0 text-h5">mdi-account</v-icon>
                      <router-link :to="{name: 'Customer', params: {customer_id: receipt.receipt_customer_id}}">
                        {{ receipt.receipt_customer_id }} - {{ receipt.salutation }} {{ receipt.first_name }} {{ receipt.last_name }}
                      </router-link>
                    </v-col>
                    <v-col cols="6" sm="4" md="3" class="pt-0 pb-0">
                      <span class="ml-3">{{formatD(receipt.receipt_at)}}</span>
                    </v-col>
                    <v-col cols="3" sm="2" md="3" class="pt-0 pb-0"><span>{{receipt.payment_type}} {{receipt.payment_mode}}</span></v-col>
                    <v-col cols="3" sm="2" md="3" class="pt-0 pb-0"><span>{{formatM(receipt.value)}}</span></v-col>
                    <v-col cols="12" sm="4" md="3" class="pt-0 pb-0">
                      <document
                        cols="12"
                        parentObject="receipt"
                        :readonly="true"
                        :download="$userCheckPermission('PERM_ACCOUNTS')"
                        :customerId="customer.customer_id"
                        :parentObjectId="receipt.receipt_id"
                        documentPropertyRef="RECEIPT"
                        />
                    </v-col>
                    <v-col v-if="receipt.note" cols="12" class="text-body-2 pl-5 pt-0 pb-0"><span>{{receipt.note}}</span></v-col>
                  </v-row>
                  <v-row><v-col cols="12"  class="pt-1 pb-0"><v-divider/></v-col></v-row>
                </div>
                <v-row>
                  <v-col cols="12" class="pt-4">
                    <span><b>Total: </b><span>{{formatM(customer.value_receipt)}}</span></span>
                  </v-col>
                </v-row>
              </template>
              <div v-else class="pt-3 text-body-1">
                None
              </div>
            </template>
            <v-skeleton-loader
                v-else
                type="article"
              ></v-skeleton-loader>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

     <!-- RECEIPTS ON OTHER CUSTOMER'S SALES -->
    <v-row v-if="customerReceipts && customerReceipts.length>0" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card>
          <v-card-title class="secondary pb-2">
            Receipts on Other Customer's Sales
          </v-card-title>
          <v-card-text class="text-body-1">
            <div v-for="receipt in customerReceipts" :key="receipt.receipt_id">
              <v-row class="pt-5 pl-3">
                <v-col cols="12">
                  <sale-search-result :value="receipt.sale_id"/>
                </v-col>
                <v-col cols="12" v-if="receipt.receipt_customer_id !== receipt.sale_customer_id" class="pt-0 pb-0">
                  <span class="pl-2">Paid by: </span>
                  <v-icon class="pr-2 pt-0 text-h5">mdi-account</v-icon>
                  <router-link :to="{name: 'Customer', params: {customer_id: receipt.receipt_customer_id}}">
                    {{ receipt.receipt_customer_id }} - {{ receipt.salutation }} {{ receipt.first_name }} {{ receipt.last_name }}
                  </router-link>
                </v-col>
                <v-col cols="6" sm="4" md="3" class="pt-0 pb-0">
                  <span class="ml-3">{{formatD(receipt.receipt_at)}}</span>
                </v-col>
                <v-col cols="3" sm="2" md="3" class="pt-0 pb-0"><span>{{receipt.payment_type}} {{receipt.payment_mode}}</span></v-col>
                <v-col cols="3" sm="2" md="3" class="pt-0 pb-0"><span>{{formatM(receipt.value)}}</span></v-col>
                <v-col cols="12" sm="4" md="3" class="pt-0 pb-0">
                  <document
                    cols="12"
                    parentObject="receipt"
                    :readonly="true"
                    :download="$userCheckPermission('PERM_ACCOUNTS')"
                    :customerId="customer.customer_id"
                    :parentObjectId="receipt.receipt_id"
                    documentPropertyRef="RECEIPT"
                    />
                </v-col>
                <v-col v-if="receipt.note" cols="12" class="text-body-2 pl-5 pt-0 pb-0"><span>{{receipt.note}}</span></v-col>
              </v-row>
              <v-row><v-col cols="12"  class="pt-1 pb-0"><v-divider/></v-col></v-row>
            </div>
            <v-row>
              <v-col cols="12" class="pt-4">
                <span><b>Total: </b><span>{{formatM(customerReceiptTotal)}}</span></span>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- CREDIT NOTES -->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card>
          <v-card-title class="secondary pb-2">
            Credit Notes
          </v-card-title>
          <v-card-text v-if="credits" class="text-body-1">
            <template v-if="credits.length>0">
              <div
                v-for="credit in credits"
                :key="credit.credit_id">
                  <v-row class="pt-5 pl-3">
                    <v-col cols="8" sm="6" md="3" class="pt-0 pb-0">
                      <v-chip
                        small
                        class="text-body-1 font-weight-bold"
                        v-bind:color="creditStatusColor(credit.credit_status_ref)"
                      >{{ credit.credit_status }}</v-chip>
                      <span v-if="credit.credit_status_ref=='POSTED'" class="pl-2 pt-4">{{ formatD(credit.posted_at) }}</span>
                    </v-col>
                    <v-col cols="4" sm="3" md="2" class="pt-0 pb-0">
                      {{ formatM(credit.value) }}
                    </v-col>
                    <v-col cols="5" sm="3" md="3" class="pt-0 pb-0">
                      <router-link :to="creditLink(credit)">
                      Credit Note {{credit.credit_id}}
                      </router-link>
                    </v-col>
                    <v-col cols="7" sm="12" md="3" class="pt-0 pb-0">
                      <document
                        cols="12"
                        parentObject="credit"
                        :readonly="true"
                        v-if="credit.credit_status_ref=='POSTED'"
                        :download="$userCheckPermission('PERM_ACCOUNTS')"
                        :customerId="customer.customer_id"
                        :parentObjectId="credit.credit_id"
                        documentPropertyRef="CREDIT_NOTE"
                        />
                    </v-col>
                    <v-col cols="12" class="text-body-2 pt-0 pb-0 pl-5"><span>{{credit.description}}</span></v-col>
                  </v-row>
                  <v-row><v-col cols="12"  class="pt-1 pb-0"><v-divider/></v-col></v-row>
              </div>
              <v-row>
                <v-col cols="12" class="">
                  <span><b>Total: </b><span>{{formatM(customer.value_credit)}}</span></span>
                </v-col>
              </v-row>
            </template>
            <template v-else><v-row><v-col>None</v-col></v-row></template>
          </v-card-text>
          <v-skeleton-loader
              v-else
              type="article"
            ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <!-- CREDIT VOUCHERS -->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="secondary pb-2">
            Credit Vouchers
            <v-spacer/>
          </v-card-title>
          <v-card-text class="text-body-1">
            <template v-if="vouchers">
              <template v-if="vouchers.length>0">
                <div v-for="(voucher, indx) in vouchers" :key="indx">
                  <v-row class="pt-5 pl-3">
                    <v-col cols="6" sm="3" md="2" class="pt-0 pb-0">
                      <span class="pl-2 ">{{formatD(voucher.voucher_at)}}</span>
                    </v-col>
                    <v-col cols="6" sm="3" md="2" class="pt-0 pb-0">Ref: {{voucher.external_ref}}</v-col>
                    <v-col cols="6" sm="3" md="2" class="pt-0 pb-0">{{formatM(voucher.value)}}</v-col>
                    <v-col cols="6" sm="3" md="4" class="pt-0 pb-0">
                      <document
                        cols="12"
                        parentObject="voucher"
                        :readonly="true"
                        :download="$userCheckPermission('PERM_ACCOUNTS')"
                        :customerId="customer.customer_id"
                        :parentObjectId="voucher.voucher_id"
                        documentPropertyRef="CREDIT_VOUCHER"
                        />
                    </v-col>
                    <v-col v-if="voucher.note" cols="12" class="text-body-2 pt-0 pb-0 pl-5"><span>{{voucher.note}}</span></v-col>
                  </v-row>
                  <v-row><v-col cols="12"  class="pt-1 pb-0"><v-divider/></v-col></v-row>
                </div>
                <v-row>
                  <v-col cols="12" class="">
                    <span><b>Total: </b><span>{{formatM(customer.value_voucher)}}</span></span>
                  </v-col>
                </v-row>
              </template>
              <div v-else class="pt-3 text-body-1">
                None
              </div>
            </template>
            <v-skeleton-loader
                v-else
                type="article"
              ></v-skeleton-loader>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- SITES -->
    <v-row v-if="sites.length>0" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card>
          <v-card-title class="secondary pb-2">
            Sites
            <v-spacer />
            <v-alert v-if="success" type="success">{{success}}</v-alert>
            <v-btn
              color="primary"
              text
              @click="emailCertificates"
              v-if="showEmailCerts"
              title="Email customer site certificates"
              :disabled="!enableEmailCerts"
            >
              <v-icon>mdi-email</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="customer" class="pt-5">
            <div v-for="(site, indx) in sites" :key="indx">
              <v-row>
                <v-col v-if="site.site_id" cols="12" class="">
                  <site-details-slim :value="site.site_id"/>
                </v-col>
                <v-col v-else cols="12" class="">
                  <v-card class="elevation-0 mb-1">
                    <v-card-text class="text-body-1 pt-0 pb-0 d-flex align-items-center">
                      <v-row align="center">
                        <span class="text-body-1"><b>{{ site.site_type }} (unsited)</b></span>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-row><v-col cols="12" class="pt-1 pb-0"><v-divider/></v-col></v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- SITE WORKS -->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card>
          <v-card-title class="secondary pb-2">
            Site Works
          </v-card-title>
          <v-card-text v-if="siteworks" class="pt-5">
            <template v-if="siteworks.length > 0">
              <div v-for="sitework in siteworks" :key="sitework.sitework_id">
                <sitework-search-result :value="sitework.sitework_id" />
              </div>
            </template>
            <div v-else class="pt-3 text-body-1">
              None
            </div>
          </v-card-text>
          <v-skeleton-loader
            v-else
            type="article"
          ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <!-- NOTES -->
    <v-row  v-if="customer" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <notes
          :customerId="customer.customer_id"
          :objects="childObjs"
          :readonly="!$userCheckPermission('PERM_EDIT')"
          :forceAdd="addNote"
          :setFlag="flagWithNote"
          v-on:added="noteAdded"
          :parentObjectId="customer.customer_id"
          parentObjectType="customer"/>
      </v-col>
    </v-row>

    <!-- DOCUMENTS -->
    <v-row  v-if="customer" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <documents
          :email="customer.email"
          :customerId="customer.customer_id"
          :readonly="!$userCheckPermission('PERM_EDIT')"
          :objects="childObjs"
          :parentObjectId="customer_id"
          parentObjectType="customer"/>
      </v-col>
    </v-row>

    <!-- ADMIN ACTIONS -->
    <v-row v-if="$userCheckPermission('PERM_SALES_SUPER')" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header class="secondary text-h6 pb-2">
              Admin Actions
            </v-expansion-panel-header>
            <v-expansion-panel-content v-if="customer" class="pt-5">
              <v-row>
                <v-col cols="12">
                  <v-btn
                    class="mr-4 mb-3"
                    color="primary"
                    v-if="canAddSale"
                    v-on:click="legacySiteDialog=true"
                  >
                  Add a Legacy Site
                  </v-btn>
                  <v-dialog v-model="legacySiteDialog" persistent max-width="800">
                    <v-card class="elevation-4">
                      <v-card-title class="primary white--text">
                        Add a legacy site
                      </v-card-title>
                      <v-card-text class="pt-3">
                        <v-row class="align-end">
                          <v-col cols="12">
                            <grave-selector :no-grave="true" @selected="siteSelected" :customer-id="customer.customer_id" />
                          </v-col>
                        </v-row>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="closeLegacySiteDialog()">Cancel</v-btn>
                        <v-btn color="primary" :disabled="!(site_id)" @click="addLegacySite()">Add</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-btn
                    class="mr-4 mb-3"
                    color="primary"
                    v-if="canAddSale"
                    v-on:click="$router.push({name: 'New Burial', query: {legacy: true, customer_id: customer.customer_id}} )"
                  >
                  Add a Legacy Burial
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <!-- AUDIT -->
    <v-row  v-if="customer" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <audit parentObjectType="customer" v-bind:parentObjectId="customer.customer_id"/>
      </v-col>
    </v-row>

    <!-- CREATION/UPDATE INFO -->
    <v-row v-if="customer" align="center" justify="center" no-gutters>
      <v-col cols="12" class="pt-5 pb-0 d-flex flex-wrap justify-end align-content-end caption">
        <span><b>Created:&nbsp;</b>{{formatT(customer.created_at)}}</span>
        <span><b>,&nbsp;Updated:&nbsp;</b>{{formatT(customer.updated_at)}}</span>
        <span>
          <b>, by&nbsp;</b>
          <router-link v-if="$userCheckPermission('PERM_USERS_VIEW')" :to="{name: 'User', params: {user_id: customer.updated_by_id}}">{{customer.updated_by}}</router-link>
          <span v-else>{{customer.updated_by}}</span>
        </span>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import SaleSearchResult from '@/components/sales/SaleSearchResult'
import Documents from '@/components/shared/Documents'
import Audit from '@/components/shared/Audit'
import SiteDetailsSlim from '@/components/sites/SiteDetailsSlim'
import ErrorDisp from '@/components/shared/Error'
import Notes from '@/components/notes/Notes'
import GraveSelector from '@/components/sites/GraveSelector'
import Document from '@/components/shared/Document'
import SiteworkSearchResult from '@/components/siteworks/SiteworkSearchResult'

export default {
  name: 'tCustomer',
  components: {
    SaleSearchResult,
    Documents,
    Audit,
    SiteDetailsSlim,
    ErrorDisp,
    Notes,
    GraveSelector,
    Document,
    SiteworkSearchResult
  },
  data () {
    return {
      customer_id: null,
      customer: null,
      site_id: null,
      sales: [],
      sites: [],
      burials: [],
      statement: [],
      receipts: null,
      customerReceipts: null,
      vouchers: null,
      credits: null,
      siteworks: null,
      error: null,
      success: null,
      childObjs: null,
      addNote: false,
      flagWithNote: false,
      legacySiteDialog: false
    }
  },
  watch: {
    '$route.params.customer_id': function () {
      this.load()
    }
  },
  computed: {
    deleteDisabled: function () {
      if (!this.customer) { return true }
      if (this.customer.sales_count === 0) { return false }
      return true
    },
    canAddSale: function () {
      if (!this.customer) { return false }
      if (!this.$userCheckPermission('PERM_EDIT')) { return false }
      if (this.customer.flag) { return false }
      if (this.sales.some(sale => sale.sale_status_ref === 'UNAUTHORIZED')) { return false }
      if (this.sales.some(sale => sale.sale_status_ref === 'DRAFT')) { return false }
      return true
    },
    showEmailCerts: function () {
      if (!this.customer) { return false }
      if (!this.sites) { return false }
      if (!this.$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')) { return false }

      return this.sites.some(s => {
        return s.owner_customer_id === this.customer.customer_id
      })
    },
    enableEmailCerts: function () {
      if (!this.customer) { return false }
      if (!this.customer.email) { return false }
      if (this.customer.no_transaction_email) { return false }
      return true
    },
    customerReceiptTotal: function () {
      if (!this.customerReceipts) { return 0 }
      return this.customerReceipts.reduce((total, receipt) => total + receipt.value, 0)
    },
  },
  mounted () {
    this.load()
  },
  methods: {
    load () {
      let obs = []
      if (this.$route.params.customer_id) {
        this.customer_id = parseInt(this.$route.params.customer_id)
        this.secureGet('/api/v1/customers/' + this.customer_id) // + '?type=items')
          .then(res => {
            this.customer = res.data
            obs = [{parentObjectType: 'customer', parentObjectId: this.customer_id}]
            return Promise.all([
              this.secureGet('/api/v1/customers/' + this.customer_id + '/sales')
                .then(res => {
                  this.sales = res.data
                  this.sales.forEach(sale => {
                    obs.push({parentObjectType: 'sale', parentObjectId: sale.sale_id})
                  })
                }),
              this.secureGet('/api/v1/customers/' + this.customer_id + '/sale_sites')
                .then(res => {
                  this.sites = res.data
                  this.sites.forEach(site => {
                    obs.push({parentObjectType: 'site', parentObjectId: site.site_id})
                    obs.push({parentObjectType: 'sale_site', parentObjectId: site.sale_site_id})
                  })
                }),
              this.secureGet('/api/v1/customers/' + this.customer_id + '/burials')
                .then(res => {
                  this.burials = res.data
                  this.burials.forEach(burial => {
                    obs.push({parentObjectType: 'burial', parentObjectId: burial.burial_id})
                  })
                }),
              this.secureGet('/api/v1/customers/' + this.customer_id + '/statement')
                .then(res => {
                  this.statement = res.data
                }),
              // Receipts
              this.secureGet('/api/v1/customers/' + this.customer_id + '/receipts')
                .then(res => {
                  this.receipts = res.data
                  this.receipts.forEach(receipt => {
                    obs.push({parentObjectType: 'receipt', parentObjectId: receipt.receipt_id})
                  })
                }),
              // Receipts on other customers sales
              this.secureGet('/api/v1/customers/' + this.customer_id + '/others_receipts')
                .then(res => {
                  this.customerReceipts = res.data
                  this.customerReceipts.forEach(receipt => {
                    obs.push({parentObjectType: 'receipt', parentObjectId: receipt.receipt_id})
                  })
                }),
              this.secureGet('/api/v1/customers/' + this.customer_id + '/credits')
                .then(res => {
                  this.credits = res.data
                  this.credits.forEach(credit => {
                    obs.push({parentObjectType: 'credit', parentObjectId: credit.credit_id})
                  })
                }),
              this.secureGet('/api/v1/customers/' + this.customer_id + '/vouchers')
                .then(res => {
                  this.vouchers = res.data
                  this.vouchers.forEach(voucher => {
                    obs.push({parentObjectType: 'voucher', parentObjectId: voucher.voucher_id})
                  })
                }),
              this.secureGet('/api/v1/customers/' + this.customer_id + '/siteworks')
                .then(res => {
                  this.siteworks = res.data
                  this.siteworks.forEach(sitework => {
                    obs.push({parentObjectType: 'sitework', parentObjectId: sitework.sitework_id})
                  })
                })
            ])
          })
          .then(() => {
            this.childObjs = obs
          })
          .catch(err => { this.error = err })
      }
    },
    addSale () {
      // Add a new sale
      return this.securePost('/api/v1/sales', {customer_id: this.customer_id})
        .then(res => {
          const saleId = res.data.sale_id
          this.$router.push({ name: 'New Sale', params: { sale_id: saleId }})
        })
        .catch(err => { this.error = err })
    },
    siteSelected (val) {
      if (val) {
        this.site_id = val.site_id
      }
    },
    closeLegacySiteDialog () {
      this.legacySiteDialog = false
      this.site_id = null
    },
    addLegacySite() {
      console.log(this.site_id, this.grave_no)
      this.securePost('/api/v1/sale_sites/legacy', {customerId: this.customer_id, siteId: this.site_id})
        .then(() => {
          this.$router.go()
        })
        .catch(err => { this.error = err })

    },
    generateStatement () {

    },
    receiptHref (receipt) {
      return this.$config.API_URL + '/asset/receipt/' + receipt.receipt_id + '/' + receipt.filename
    },
    flagged () {
      if (this.customer.flag) {
        this.flagWithNote = true
        this.addNote = true
      } else {
        this.securePut('/api/v1/customers/' + this.customer.customer_id + '/flag')
          .then(() => {
            return true
          })
          .catch((error) => { this.error = error })
      }
    },
    flagEnabled () {
      if (this.customer.flag) {
        return this.$userCheckPermission('PERM_SALES_SUPER')
      } else {
        return (this.$userCheckPermission('PERM_EDIT') || this.$userCheckPermission('PERM_SALES_SUPER'))
      }
    },
    noteAdded () {
      this.addNote = false
      this.flagWithNote = false
    },
    deleteCustomer () {
      this.secureDelete('/api/v1/customers/' + this.customer_id)
        .then(() => {
          this.$router.push('/customers')
        })
        .catch(err => { this.error = err })
    },
    emailCertificates () {
      this.secureGet('/api/v1/customers/' + this.customer_id + '/email_certificates')
        .then(() => {
          this.success = 'Email sent'
          setTimeout(() => { this.success = null }, 4000)
        })
        .catch(err => { this.error = err })
    },
    creditLink (credit) {
      if (credit.credit_status_ref === 'DRAFT') {
        return {name: 'New Credit Note', params: {credit_id: credit.credit_id}}
      } else {
        return {name: 'Credit Note', params: {credit_id: credit.credit_id}}
      }
    },
    creditHref (credit) {
      return this.$config.API_URL + '/asset/credit/' + credit.credit_id + '/' + credit.filename
    },
  }
}
</script>

<style scoped>

</style>
