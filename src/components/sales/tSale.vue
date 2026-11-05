<template>
  <div>
    <error-disp v-model="error"/>
    <!--SALE-->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            <v-icon color="white" large class="pr-3">mdi-point-of-sale</v-icon>
            <span>Sale&nbsp;no. <span v-if="sale">{{sale.sale_id}}</span></span>
            <v-spacer/>
            <template v-if="sale">
              <v-switch
                dense
                dark
                hide-details
                :disabled="!flagEnabled() || pending"
                :color="sale.flag ? 'red':'white'"
                class="mb-0 pt-0 pb-0 mt-1 mr-7"
                v-model="sale.flag"
                label="Flagged sale?"
                @click="flagged()"
              />
              <v-chip
                v-if="sale"
                v-bind:color="saleStatusColor(sale.sale_status_ref)"
                class="ml-auto mr-2"
              >
                <span class="text-body-1 font-weight-bold">{{sale.sale_status}}</span>
              </v-chip>
            </template>
            <template v-else>
              <v-chip
                color="grey"
              ><span class="text-body-1 font-weight-bold">sale</span></v-chip>
            </template>
          </v-card-title>
          <v-card-text class="text-body-1">
            <template v-if="sale">
              <v-row class="ml-5">
                <v-col cols="12" sm="6"class="pb-1">
                  <customer-details expand v-model="sale.customer_id"/>
                </v-col>
                <v-col cols="12" sm="6" class="pb-1">
                  <div>Tariff:<b> {{sale.tariff_name}}</b></div>
                  <div v-if="sale.ordered_at">Ordered:&nbsp;<b>
                    <span>{{ formatD(sale.ordered_at) }}</span>
                    <span v-if="sale.sale_status_ref==='ORDER'">({{sale.order_age}} days)</span>
                  </b></div>
                  <div v-if="sale.export_batch_id">Export Batch:<b> {{ sale.export_batch_id }}</b></div>
                  <div v-if="sale.invoice_no">Invoice No:<b> {{ sale.invoice_no }}</b></div>
                  <div v-if="sale.is_legacy"><b>Legacy sale</b></div>
                  <div v-if="sale.legacy_receipt_nos">Legacy receipt nos: <b>{{sale.legacy_receipt_nos}}</b></div>
                  <div>
                    <document
                      cols="12"
                      parentObject="sale"
                      :readonly="true"
                      :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                      :customerId="sale.customer_id"
                      :parentObjectId="sale.sale_id"
                      documentPropertyRef="INVOICE"
                    />
                  </div>
                  <div>
                    <document
                      cols="12"
                      parentObject="sale"
                      :readonly="true"
                      :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                      :customerId="sale.customer_id"
                      :parentObjectId="sale.sale_id"
                      documentPropertyRef="ORDER"
                    />
                  </div>
                </v-col>
              </v-row>
              <v-row class="mt-5 mb-5 ml-5">
                <v-col cols="12" sm="5" md="4" xl="3"  class="pb-1 pr-5">
                    <v-row dense>
                      <v-col cols="7" class="">
                        <span>Invoice:</span>
                      </v-col>
                      <v-col cols="5" class="text-right">
                        {{ formatMInt(sale.value_order) }}
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col cols="7" class="">
                      <span>Credit Notes:</span>
                      </v-col>
                      <v-col cols="5" class="text-right">
                      {{ formatMInt(-sale.value_credit) }}
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col cols="12">
                      <v-divider/>
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col cols="7" class="">
                        <span><b>Sale Value:</b></span>
                      </v-col>
                      <v-col cols="5" class="text-right">
                        <b>{{ formatMInt(sale.value) }}</b>
                      </v-col>
                    </v-row>
                </v-col>
                <v-col cols="0" sm="1"></v-col>
                <v-col cols="12" sm="5" md="4" xl="3" class="pb-1 pl-5">
                    <v-row dense>
                      <v-col cols="7" class="">
                        <span>Sale Value:</span>
                      </v-col>
                      <v-col cols="5" class="text-right">
                        {{ formatMInt(sale.value) }}
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col cols="7" class="">
                        <span>Receipts:</span>
                      </v-col>
                      <v-col cols="5" class="text-right">
                        {{ formatMInt(-sale.value_receipted) }}
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col cols="7" class="">
                      <span>Credit Vouchers:</span>
                      </v-col>
                      <v-col cols="5" class="text-right">
                      {{ formatMInt(sale.value_voucher) }}
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col cols="12">
                      <v-divider/>
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col cols="7" class="">
                        <span><b>Outstanding:</b></span>
                      </v-col>
                      <v-col cols="5" class="text-right">
                        <b>{{ formatMInt(sale.value_outstanding) }}</b>
                      </v-col>
                    </v-row>
                </v-col>
              </v-row>
            </template>
            <v-skeleton-loader
              v-else
              type="article"
            ></v-skeleton-loader>
          </v-card-text>
          <v-card-actions class="text-h6 pb-5 mr-5 ml-5">
            <v-spacer/>
            <v-btn
              :disabled="!canCancel || pending"
              v-if="sale && sale.sale_status_ref=='ORDERED' && $userCheckPermission('PERM_SALES_SUPER')"
              class="mr-3"
              color="primary"
              @click="unplaceSale">Cancel order</v-btn>
          </v-card-actions>
          <v-row v-if="sale">
            <v-col cols="12" class="pr-5 pt-0 pb-0 d-flex flex-wrap justify-end align-content-end caption">
              <span class="caption"><b>Created:&nbsp;</b>{{formatT(sale.created_at)}}</span>
              <span v-if="sale.ordered_at" class="caption"><b>, Ordered:&nbsp;</b>{{formatT(sale.ordered_at)}}</span>
              <span v-if="sale.fulfilled_at" class="caption"><b>, Fulfilled:&nbsp;</b>{{formatT(sale.fulfilled_at)}}</span>
              <span class="caption"><b>,&nbsp;Updated:&nbsp;</b>{{formatT(sale.updated_at)}}</span>
              <span>
                <b>, by&nbsp;</b>
                <router-link v-if="$userCheckPermission('PERM_USERS_VIEW')" :to="{name: 'User', params: {user_id: sale.updated_by_id}}">{{sale.updated_by}}</router-link>
                <span v-else>{{sale.updated_by}}</span>
              </span>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!--ORDER-->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="secondary pb-2 mb-5">
            Invoice
          </v-card-title>
          <template v-if="sale && lines">
          <v-card-text class="text-body-1">
            <v-row v-for="line in lines" :key="line.sale_line_id">
              <v-col cols="10" class="pt-2 pb-1">
                {{formatLineParent(line)}} - {{line.line_description}}
              </v-col>
              <v-col cols="2" class="pt-2 pb-1 d-flex justify-end">
                {{formatM(line.line_value)}}
              </v-col>
            </v-row>
            <v-row class="">
              <v-col cols="10" class="pt-2 pb-1">
                <b>Invoice Total:</b>
              </v-col>
              <v-col cols="2" class="pt-2 pb-1 d-flex justify-end">
                <b>{{formatM(sale.value_order) }}</b>
              </v-col>
            </v-row>
          </v-card-text>
          </template>
          <v-skeleton-loader
              v-else
              type="article"
            ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <!-- SALE SITES -->
    <template v-if="sale && sale.sale_sites && sale.sale_sites.length>0">
      <v-row align="center" justify="center">
        <v-col cols="12" md="11" lg="8">
          <v-card class="elevation-4">
            <v-card-title class="secondary pb-2">
              Sites
            </v-card-title>
            <v-card-text class="pt-5">
              <div v-for="(site, indx) in sale.sale_sites" :key="indx">
                <v-row>
                  <v-col v-if="site.site_id" cols="12" class="">
                    <site-details-slim :value="site.site_id"/>
                  </v-col>
                  <template v-else>
                    <v-col cols="12" md="3" class="pl-5">
                      <span class="text-body-1 pl-3"><b>{{ site.site_type }} (unsited)</b></span>
                    </v-col>
                    <v-col cols="12" md="7" class="pl-5">Select site:
                      <site-selector v-model="site.selectedSite" v-on:input="siteSelected(site)" :siteTypeId="site.site_type_id"/>
                    </v-col>
                  </template>
                </v-row>
                <v-row><v-col cols="12" class="pt-1 pb-0"><v-divider/></v-col></v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- BURIALS -->
    <template v-if="sale && sale.burials && sale.burials.length>0">
      <v-row align="center" justify="center">
        <v-col cols="12" md="11" lg="8">
          <v-card class="elevation-4">
            <v-card-title class="secondary pb-2">
              Burials
            </v-card-title>
              <v-card-text class="">
                <v-row v-for="(burial, indx) in sale.burials" :key="indx">
                  <v-col cols="12" class="">
                    <burial-search-result  :value="burial.burial_id" flat/>
                  </v-col>
                </v-row>
              </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- EVENTS -->
    <template v-if="sale && sale.events && sale.events.length>0">
      <v-row align="center" justify="center">
        <v-col cols="12" md="11" lg="8">
          <v-card class="elevation-4">
            <v-card-title class="secondary pb-2">
              Events
            </v-card-title>
              <v-card-text class="mt-10 pr-10 text-body-2">
                <v-row v-for="(event, indx) in sale.events" :key="indx">
                  <v-col cols="12" class="pl-5 pt-0 pb-1">
                    <event-details :value="event.event_id" flat />
                  </v-col>
                </v-row>
              </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!--RECEIPTS-->
    <template>
      <v-row align="center" justify="center">
        <v-col cols="12" md="11" lg="8">
          <v-card class="elevation-4">
            <v-card-title class="secondary pb-2">
              Receipts
              <v-spacer/>
              <v-btn
                v-if="sale && $userCheckPermission('PERM_ACCOUNTS') && sale.sale_status_ref=='ORDERED'"
                icon
                title="Add a new receipt for sale."
                :disabled="pending || !canAddReceipt"
                color="primary"
                @click="receiptForm = true"
              >
                <v-icon>mdi-plus-circle</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="text-body-1">
              <template v-if="sale">
                <div v-if="sale.receipts &&sale.receipts.length>0" v-for="(receipt, indx) in sale.receipts" :key="indx">
                  <v-row class="pt-5 pl-3">
                    <v-col cols="12" v-if="receipt.receipt_customer_id !== receipt.sale_customer_id" class="pt-0 pb-0">
                      <span class="pl-2">Paid by: </span>
                      <v-icon class="pr-2 pt-0 text-h5">mdi-account</v-icon>
                      <router-link :to="{name: 'Customer', params: {customer_id: receipt.receipt_customer_id}}">
                        {{ receipt.receipt_customer_id }} - {{ receipt.salutation }} {{ receipt.first_name }} {{ receipt.last_name }}
                      </router-link>
                    </v-col>
                    <v-col cols="6" sm="4" md="3" class="pt-0 pb-0">
                      <v-icon
                        v-if="$userCheckPermission('PERM_ACCOUNTS_SUPER') && receipt.export_batch_id==null"
                        :disabled="pending || !canDeleteVoucherReceipt"
                        color="primary"
                        class="text-h5"
                        @click="deleteReceipt(receipt, indx)"
                      >
                        mdi-delete
                      </v-icon>
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
                        :customerId="sale.customer_id"
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
                    <span><b>Total: </b><span v-if="!pending">{{formatM(sale.value_receipted)}}</span></span>
                  </v-col>
                </v-row>
              </template>
              <v-skeleton-loader
                  v-else
                  type="article"
                ></v-skeleton-loader>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <sale-receipt-form
      v-if="sale"
      v-model="receiptForm"
      :sale="sale"
      @added="receiptAdded"
      :min-date="minDate"
    />

    <!-- CREDIT NOTES -->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card>
          <v-card-title class="secondary pb-2">
            Credit Notes
            <v-spacer/>
              <v-btn
                color="primary"
                icon
                title="New Credit Note"
                @click="createCreditNote"
                v-if="$userCheckPermission('PERM_ACCOUNTS_SUPER')"
                :disabled="!canAddCredit || pending"
              >
                <v-icon>mdi-plus-circle</v-icon>
              </v-btn>
          </v-card-title>
          <template v-if="sale">
            <v-card-text class="text-body-1">
              <div v-if="sale.credits && sale.credits.length>0">
                <div
                  v-for="credit in sale.credits"
                  :key="credit.credit_id"
                >
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
                        :customerId="sale.customer_id"
                        :parentObjectId="credit.credit_id"
                        documentPropertyRef="CREDIT_NOTE"
                        />
                    </v-col>
                    <v-col cols="12" class="text-body-2 pt-0 pb-0 pl-5"><span>{{credit.description}}</span></v-col>
                  </v-row>
                  <v-row><v-col cols="12"  class="pt-1 pb-0"><v-divider/></v-col></v-row>
                </div>
                <v-row>
                  <v-col cols="12">
                    <span><b>Total: </b><span>{{formatM(sale.value_credit)}}</span></span>
                  </v-col>
                </v-row>
              </div>
              <div v-else>None</div>
            </v-card-text>
          </template>
          <v-skeleton-loader
              v-else
              type="article"
            ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <!-- CREDIT VOUCHERS -->
     <template v-if="(sale && sale.vouchers && sale.vouchers.length>0) || canAddVoucher">
      <v-row align="center" justify="center">
        <v-col cols="12" md="11" lg="8">
          <v-card class="elevation-4">
            <v-card-title class="secondary pb-2">
              Credit Vouchers
              <v-spacer/>
              <v-btn
                v-if="$userCheckPermission('PERM_ACCOUNTS_SUPER')"
                icon
                title="Add a new credit voucher for sale."
                :disabled="!canAddVoucher || pending"
                color="primary"
                @click="voucherForm = true"
              >
                <v-icon>mdi-plus-circle</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="text-body-1">
              <template v-if="sale">
                <div v-if="sale.vouchers && sale.vouchers.length>0" v-for="(voucher, indx) in sale.vouchers" :key="indx">
                  <v-row class="pt-5 pl-3">
                    <v-col cols="6" sm="3" md="2" class="pt-0 pb-0">
                      <v-icon
                        v-if="$userCheckPermission('PERM_ACCOUNTS_SUPER') && voucher.export_batch_id==null"
                        :disabled="pending || !canDeleteVoucherReceipt"
                        color="primary"
                        class="text-h5"
                        @click="deleteVoucher(voucher, indx)"
                      >
                        mdi-delete
                      </v-icon>
                      <span class="pl-2 ">{{formatD(voucher.credit_at)}}</span>
                    </v-col>
                    <v-col cols="6" sm="3" md="2" class="pt-0 pb-0">Ref: {{voucher.external_ref}}</v-col>
                    <v-col cols="6" sm="3" md="2" class="pt-0 pb-0">{{formatM(voucher.value)}}</v-col>
                    <v-col cols="6" sm="3" md="4" class="pt-0 pb-0">
                      <document
                        cols="12"
                        parentObject="voucher"
                        :readonly="true"
                        :download="$userCheckPermission('PERM_ACCOUNTS')"
                        :customerId="sale.customer_id"
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
                    <span><b>Total: </b><span v-if="!pending">{{formatM(sale.value_voucher)}}</span></span>
                  </v-col>
                </v-row>
              </template>
              <v-skeleton-loader
                  v-else
                  type="article"
                ></v-skeleton-loader>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <sale-voucher-form
      v-if="sale"
      v-model="voucherForm"
      :sale="sale"
      @added="voucherAdded"
      :min-date="minDate"
    />

    <!--AUTHORISATION-->
    <v-row v-if="sale && sale.authorization_request" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-expansion-panels v-model="expandAuth">
          <v-expansion-panel>
            <v-expansion-panel-header :class="`${sale.sale_status_ref=='UNAUTHORIZED' ? 'orange' : 'secondary'} text-h6 pb-2`">
              Authorisation
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <template v-if="sale">
                <v-card-text class="text-body-1">
                  <v-row class="pt-2" align="center">
                    <v-col cols="12" class="pb-1">
                      Required for: <b>{{ sale.authorization_request.description }}</b>
                    </v-col>
                    <v-col cols="12" class="">
                      {{ sale.authorization_request.authorizations_made }} of {{ sale.authorization_request.authorizations_total }} authorisations provided
                    </v-col>
                  </v-row>
                  <v-row no-gutters v-for="auth in sale.authorization_request.authorizations" :key="auth.authorization_id">
                    <v-col cols="6" md="4">{{formatT(auth.authorized_at)}}</v-col>
                    <v-col cols="6" md="4">{{auth.first_name}} {{auth.last_name}}</v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    color="orange"
                    dark
                    :disabled="pending"
                    v-if="canAuthorize"
                    @click="authorize"
                  >
                    Authorise
                  </v-btn>
                </v-card-actions>
              </template>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <!--NOTES-->
    <v-row  v-if="sale" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <notes
          v-bind:customerId="sale.customer_id"
          v-bind:objects="sale.objects"
          v-bind:readonly="!$userCheckPermission('PERM_EDIT')"
          :forceAdd="addNote"
          :setFlag="flagWithNote"
          v-on:added="noteAdded"
          v-bind:parentObjectId="sale.sale_id"
          parentObjectType="sale"/>
      </v-col>
    </v-row>

    <!--DOCUMENTS-->
    <v-row  v-if="sale" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <documents
          ref="documents"
          v-bind:objects="sale.objects"
          v-bind:email="sale.email"
          v-bind:readonly="!$userCheckPermission('PERM_EDIT')"
          v-bind:customerId="sale.customer_id"
          v-bind:parentObjectId="sale.sale_id"
          parentObjectType="sale"/>
      </v-col>
    </v-row>

    <!--AUDIT-->
    <v-row  v-if="sale" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <audit parentObjectType="sale" v-bind:parentObjectId="sale.sale_id"/>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import CustomerDetails from '@/components/customer/CustomerDetails'
import SiteDetailsSlim from '@/components/sites/SiteDetailsSlim'
import BurialSearchResult from '@/components/burials/BurialSearchResult'
import EventDetails from '@/components/events/EventDetails'
import SaleReceiptForm from '@/components/sales/SaleReceiptForm'
import SaleVoucherForm from '@/components/sales/SaleVoucherForm'
import SiteSelector from '@/components/sales/SiteSelector'
import helpers from '@/services/helpers'
import Audit from '@/components/shared/Audit'
import Document from '@/components/shared/Document'
import Documents from '@/components/shared/Documents'
import ErrorDisp from '@/components/shared/Error'
import Notes from '@/components/notes/Notes'

export default {
  name: 'Sale',
  components: {
    CustomerDetails,
    Audit,
    Documents,
    ErrorDisp,
    Document,
    Notes,
    SiteDetailsSlim,
    BurialSearchResult,
    EventDetails,
    SaleReceiptForm,
    SaleVoucherForm,
    SiteSelector
  },
  data () {
    return {
      error: null,
      sale: null,
      lines: null,
      receiptForm: false,
      addNote: false,
      pending: false,
      flagWithNote: false,
      customerCredits: null,
      voucherForm: false,
      minDate: null
    }
  },
  mounted () {
    this.load()
  },
  watch: {
    '$route.params.sale_id': function () {
      this.load()
    }
  },
  computed: {
    colors: helpers.statusColors,
    expandAuth() {
      if (!this.sale) { return false }
      if (this.sale.sale_status_ref === 'UNAUTHORIZED') return 0
    },
    hasOpenCredit() {
      if (!this.sale) { return false }
      const openCredits = this.sale.credits.filter(credit => credit.credit_status_ref !== 'POSTED')
      return openCredits.length > 0
    },
    canCancel () {
      //if (!this.$check)
      if (!this.sale) { return false }
      if (this.sale.sale_status_ref !== 'ORDERED') { return false }
      if (this.sale.value_receipted > 0) { return false }
      if (this.sale.value_voucher > 0) { return false }
      if (this.sale.value_credit > 0) { return false }
      if (this.sale.export_batch_id) { return false }
      return true
    },
    canAddCredit() {
      if (!this.sale || !this.customerCredits) { return false }
      if (this.sale.value <= 0) { return false }
      if (this.sale.sale_status_ref !== 'ORDERED' && this.sale.sale_status_ref !== 'FULFILLED') { return false }

      // If there are any customer credits with satus not equal to 'POSTED' then we cannot add a credit note to this sale
      if (this.hasOpenCredit) { return false }
      return true
    },
    canAddReceipt() {
      if (!this.sale) { return false }
      if (this.sale.value_outstanding === 0) { return false }
      if (this.sale.sale_status_ref !== 'ORDERED') { return false }
      if (this.hasOpenCredit) { return false }
      return true
    },
    canAddVoucher() {
      if (!this.sale) { return false }
      if (this.sale.value_outstanding >= 0) { return false }
      if (this.hasOpenCredit) { return false }
      return true
    },
    canDeleteVoucherReceipt() {
      if (!this.sale) { return false }
      if (this.hasOpenCredit) { return false }
      return true
    },
    canAuthorize () {
      if (!this.sale) { return false }
      if (this.sale.sale_status_ref !== 'UNAUTHORIZED') { return false }
      if (!this.sale.authorization_request) { return false }
      if (this.sale.authorization_request.authorizations.filter(a => a.authorized_user_id === this.$user().user_id).length > 0) { return false }
      if (!this.$userCheckPermission(this.sale.authorization_request.permission_ref)) { return false }
      return true
    },
  },
  methods: {
    // Data
    load () {
      if (this.$route.params.sale_id) {
        // Sale details
        this.secureGet('/api/v1/sales/' + parseInt(this.$route.params.sale_id) + '?type=items')
          .then(res => {
            this.sale = res.data
            //console.log(this.sale)

            // If this is a DRAFT sale then this is the wrong page
            if (this.sale.sale_status_ref === 'DRAFT') {
              this.$router.replace({name: 'New Sale', params: { sale_id: this.sale.sale_id }})
            }

            // Get the minimum date for Sales, Receipts and Vouchers
            // this.secureGet('/api/v1/sales/min_date')
            //   .then(res => {
            //     this.minDate = res.data.minDate
            //   })
            this.minDate = this.sale.ordered_at ? this.sale.ordered_at : this.sale.created_at

            // Get any credit notes for this customer to determine if we can add a credit note to this sale
            this.secureGet('/api/v1/customers/' + this.sale.customer_id + '/credits')
              .then(res => {
                this.customerCredits = res.data
                console.log('customer credits', this.customerCredits)
              })
          })
          .then(() => {
            return this.reloadLines()
          })
          .catch((error) => { this.error = error })
      }
    },
    reloadLines () {
      return this.secureGet('/api/v1/sales/' + this.sale.sale_id + '/lines')
        .then(res => {
          this.lines = res.data
        })
        .catch((error) => { this.error = error })
    },
    // Actions
    siteSelected (saleSite) {
      this.pending = true
      console.log('selected site', saleSite.selectedSite)
      this.securePost('/api/v1/sale_sites/' + saleSite.sale_site_id + '/setSite', {site_id: saleSite.selectedSite.site_id})
        .then(() => {
          this.$router.go()
        })
        .catch((error) => { this.error = error })
    },
    unplaceSale () {
      this.pending = true
      this.securePost('/api/v1/sales/' + this.sale.sale_id + '/unplace')
        .then(() => {
          this.$router.replace({name: 'Edit Sale', params: {customer_id: this.sale.customer_id}})
        })
        .catch((error) => { this.error = 'Error deleting sale. ' + error })
    },
    flagged () {
      if (this.sale.flag) {
        this.flagWithNote = true
        this.addNote = true
      } else {
        this.pending = true
        this.securePut('/api/v1/sales/' + this.sale.sale_id + '/flag')
          .then(() => {
            this.pending = false
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
    receiptAdded (receipt) {
      if (receipt.sale_status_ref !== this.sale.sale_status_ref) {
        this.$router.go()
      } else {
        if (!this.sale.receipts) {
          this.sale.receipts = []
        }
        this.sale.receipts.push(receipt)
        this.sale.value_receipted = parseFloat(this.sale.value_receipted) + parseFloat(receipt.value)
        this.sale.value_outstanding = parseFloat(this.sale.value_outstanding) - parseFloat(receipt.value)
      }
    },
    voucherAdded (voucher) {
      if (!this.sale.vouchers) {
        this.sale.vouchers = []
      }
      this.sale.vouchers.push(voucher)
      this.sale.value_voucher = parseFloat(this.sale.value_voucher) + parseFloat(voucher.value)
      this.sale.value_outstanding = parseFloat(this.sale.value_outstanding) + parseFloat(voucher.value)
    },
    deleteReceipt (receipt, index) {
      this.pending = true
      this.sale.receipts.splice(index, 1)
      this.secureDelete('/api/v1/sales/' + this.sale.sale_id + '/receipts/' + receipt.receipt_id)
        .then((res) => {
          this.sale.value_receipted = parseFloat(this.sale.value_receipted) - parseFloat(receipt.value)
          this.sale.value_outstanding = parseFloat(this.sale.value_outstanding) + parseFloat(receipt.value)
          this.pending = false
          if (res.data.sale_status_ref !== this.sale.sale_status_ref) {
            this.$router.go()
          }
        })
        .catch((error) => { this.error = error })
    },
    deleteVoucher (voucher, index) {
      this.pending = true
      this.sale.vouchers.splice(index, 1)
      this.secureDelete('/api/v1/sales/' + this.sale.sale_id + '/vouchers/' + voucher.voucher_id)
        .then((res) => {
          this.sale.value_voucher = parseFloat(this.sale.value_voucher) - parseFloat(voucher.value)
          this.sale.value_outstanding = parseFloat(this.sale.value_outstanding) - parseFloat(voucher.value)
          this.pending = false
        })
        .catch((error) => { this.error = error })
    },
    createCreditNote () {
      this.pending = true
      this.securePost('/api/v1/credits/', {sale_id: this.sale.sale_id})
        .then((res) => {
          this.$router.replace({name: 'New Credit Note', params: { credit_id: res.data.credit_id }})
        })
        .catch((error) => { this.error = error })
    },
    authorize () {
      this.pending = true
      this.securePost('/api/v1/authorize/sale/' + this.sale.sale_id)
        .then(resp => {
          this.sale.authorization_request.authorizations.push(resp.data)
          this.sale.authorization_request.authorizations_made += 1
          this.sale.authorization_request.authorizations_outstanding -= 1
          if (this.sale.authorization_request.authorizations_outstanding === 0) {
            this.$router.go()
          }
          this.pending = false
        })
        .catch((error) => {
          this.error = error
        })
    },
    // Helpers
    receiptHref (receipt) {
      return this.$config.API_URL + '/asset/receipt/' + receipt.receipt_id + '/' + receipt.filename
    },
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
          return 'Event - ' + event.event_type + ' ' + this.formatT(event.event_time)
        case 'burial':
          let burial = null
          this.sale.burials.forEach(bur => {
            if (bur.burial_id === line.parent_object_id) { burial = bur }
          })
          return 'Burial - ' + burial.deceased
      }
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
    voucherHref (voucher) {
      return this.$config.API_URL + '/asset/voucher/' + voucher.voucher_id + '/' + voucher.filename
    },
  }
}
</script>

<style scoped>

</style>
