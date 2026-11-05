<template>
    <v-row align="center" justify="center">
      <v-col cols="12"><error-disp v-model="error"/></v-col>

      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Credit Note No: <span v-if="credit" class="text-h6">&nbsp;{{ credit.credit_id }}</span>
            <span v-if="sale">&nbsp;on Sale No: <router-link class="primary white--text" :to="saleLink()">{{ sale.sale_id }}</router-link>&nbsp;</span>
            <v-chip
              v-if="credit"
              class="ml-auto mr-2"
              v-bind:color="creditStatusColor(credit.credit_status_ref)"
            >{{ credit.credit_status }}</v-chip>
          </v-card-title>

          <template v-if="sale && credit">
            <v-card-text>
              <v-row v-if="credit">
                <v-col cols="12" sm="6" class="">
                  <customer-details v-model="credit.customer_id" expand/>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-row>
                    <v-col cols="12" class="text-body-1 pt-1 pb-1">
                      Created: <b>{{ formatD(credit.created_at)}}</b>
                    </v-col>
                    <v-col v-if="credit.posted_at" cols="12" class="text-body-1 pt-1 pb-1">
                      Posted: <b>{{ formatD(credit.posted_at)}}</b>
                    </v-col>
                    <v-col cols="12" class="text-body-1 pt-1 pb-1">
                      Description: <b>{{ credit.description}}</b>
                    </v-col>
                    <v-col v-if="credit.export_batch_id" cols="12" class="text-body-1 pt-1 pb-1">
                      Export Batch: <b>{{ credit.export_batch_id}}</b>
                    </v-col>
                    <v-col cols="12" class="text-body-1 pt-1 pb-1" v-if="credit.credit_status_ref=='POSTED' && $userCheckPermission('PERM_ACCOUNTS')">
                      <a target="_blank" :href="creditHref(credit)"><v-icon color="primary" class="pr-3">mdi-download</v-icon>{{credit.filename}}</a>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            <!--****************-->
            <!-- CREDIT NOTE LINES -->
            <!--****************-->
              <v-row align="center" justify="center">
                <v-col cols="12">
                  <v-card class="elevation-0">
                    <v-card-title class="secondary text-body-1 pt-2 pb-2">
                      Credit Values
                    </v-card-title>
                    <v-card-text class="text-body-1">
                      <div v-for="line in credit.lines" :key="line.credit_line_id">
                        <v-row dense class="" align="center">
                          <v-col cols="6" class="">
                            {{line.line_description}}
                          </v-col>
                          <v-col cols="2" class="">
                            {{formatMInt(line.line_value)}}
                          </v-col>
                        </v-row>
                        <v-row dense>
                          <v-col cols="12">
                            <v-divider></v-divider>
                          </v-col>
                        </v-row>
                      </div>
                      <v-row>
                        <v-col cols="12">
                          <b>Total Credit: </b>{{ formatMInt(credit.value) }}
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

            <!--****************-->
            <!-- SALE SITES -->
            <!--****************-->
            <v-row v-if="credit.sites && credit.sites.length > 0" align="center" justify="center">
              <v-col cols="12">
                <v-card class="elevation-0">
                  <v-card-title class="secondary text-body-1 pt-2 pb-2">
                    Revert Sites to Stock
                  </v-card-title>
                  <v-card-text class="text-body-1">
                    <div v-for="site in credit.sites" :key="site.site_id">
                      <v-row class="pt-2" align="center">
                        <v-col cols="12">
                          <site-details-slim :value="site.site_id"/>
                        </v-col>
                      </v-row>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!--****************-->
            <!-- EVENTS -->
            <!--****************-->
              <v-row v-if="credit && credit.events && credit.events.length>0" align="center" justify="center">
                <v-col cols="12">
                  <v-card class="elevation-0">
                    <v-card-title class="secondary text-body-1 pt-2 pb-2">
                      Cancelled Events
                    </v-card-title>
                    <v-card-text class="text-body-1">
                      <div v-for="event in credit.events" :key="event.event_id">
                        <v-row class="pt-2" align="center">
                          <v-col cols="12">
                            <event-details :value="event.event_id" flat/>
                          </v-col>
                        </v-row>
                        <v-row dense>
                          <v-col cols="12">
                            <v-divider></v-divider>
                          </v-col>
                        </v-row>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

            <!--****************-->
            <!-- SUMMARY -->
            <!--****************-->
              <v-row class="pt-2" align="center">
                <v-col cols="12" class="">
                  <v-card class="elevation-1">
                    <v-card-title class="secondary text-body-1 pt-2 pb-2">
                      Sale Summary
                    </v-card-title>
                    <v-card-text class="text-body-1">
                      <template v-if="sale">
                        <v-row class="mt-5 mb-5 ml-5">
                          <v-col cols="11" sm="4" lg="4" class="pb-1 pr-5">
                              <v-row dense>
                                <v-col cols="12" sm="8" class="">
                                  <span>Invoice:</span>
                                </v-col>
                                <v-col cols="12" sm="4" class="text-right">
                                  {{ formatMInt(sale.value_order) }}
                                </v-col>
                              </v-row>
                              <v-row dense>
                                <v-col cols="12" sm="8" class="">
                                <span>Other Credit Notes:</span>
                                </v-col>
                                <v-col cols="12" sm="4" class="text-right">
                                {{ formatMInt(-sale.value_credit) }}
                                </v-col>
                              </v-row>
                              <v-row dense>
                                <v-col cols="12" sm="8" class="">
                                <span>This Credit Note:</span>
                                </v-col>
                                <v-col cols="12" sm="4" class="text-right">
                                {{ formatMInt(-credit.value) }}
                                </v-col>
                              </v-row>
                              <v-row dense>
                                <v-col cols="12">
                                <v-divider/>
                                </v-col>
                              </v-row>
                              <v-row dense>
                                <v-col cols="12" sm="8" class="">
                                  <span><b>Sale Value:</b></span>
                                </v-col>
                                <v-col cols="12" sm="4" class="text-right">
                                  <b>{{ formatMInt(sale.value) }}</b>
                                </v-col>
                              </v-row>
                          </v-col>
                          <v-col cols="1"></v-col>
                          <v-col cols="11" sm="4" lg="4" class="pb-1 pl-5">
                              <v-row dense>
                                <v-col cols="12" sm="8" class="">
                                  <span>Sale Value:</span>
                                </v-col>
                                <v-col cols="12" sm="4" class="text-right">
                                  {{ formatMInt(sale.value) }}
                                </v-col>
                              </v-row>
                              <v-row dense>
                                <v-col cols="12" sm="8" class="">
                                  <span>Receipts:</span>
                                </v-col>
                                <v-col cols="12" sm="4" class="text-right">
                                  {{ formatMInt(-sale.value_receipted) }}
                                </v-col>
                              </v-row>
                              <v-row dense>
                                <v-col cols="12" sm="8" class="">
                                <span>Credit Vouchers:</span>
                                </v-col>
                                <v-col cols="12" sm="4" class="text-right">
                                {{ formatMInt(sale.value_voucher) }}
                                </v-col>
                              </v-row>
                              <v-row dense>
                                <v-col cols="12">
                                <v-divider/>
                                </v-col>
                              </v-row>
                              <v-row dense>
                                <v-col cols="12" sm="8" class="">
                                  <span><b>Outstanding:</b></span>
                                </v-col>
                                <v-col cols="12" sm="4" class="text-right">
                                  <b>{{ formatMInt(sale.value_outstanding) }}</b>
                                </v-col>
                              </v-row>
                          </v-col>
                        </v-row>
                      </template>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

            <!--****************-->
            <!-- Authorisation -->
            <!--****************-->
            <v-row v-if="credit && credit.authorization_request" align="center" justify="center">
              <v-col cols="12">
                <v-card class="elevation-0">
                  <v-card-title class="secondary text-body-1 pt-2 pb-2">
                    Authorisation
                  </v-card-title>
                  <v-card-text>
                    <v-row class="pt-2" align="center">
                      <v-col cols="12" class="">
                        {{ credit.authorization_request.authorizations_made }} of {{ credit.authorization_request.authorizations_total }} authorisations provided.
                      </v-col>
                    </v-row>
                    <v-row no-gutters v-for="auth in credit.authorization_request.authorizations" :key="auth.authorization_id">
                        <v-col cols="6" md="2">{{formatT(auth.authorized_at)}}</v-col>
                        <v-col cols="6" md="4">{{auth.first_name}} {{auth.last_name}}</v-col>
                    </v-row>

                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            </v-card-text>

            <!--****************-->
            <!-- ACTIONS -->
            <!--****************-->
            <v-card-actions v-if="!loading">
              <v-spacer></v-spacer>
              <v-btn
                color="red"
                dark
                :disabled="pending"
                v-if="canRedraft"
                @click="doRedraft"
              >
                Redraft
              </v-btn>
              <v-btn
                color="orange"
                dark
                :disabled="pending"
                v-if="canAuthorize"
                @click="authorize"
              >
                Authorise
              </v-btn>
              <v-btn
                color="primary"
                v-if="canPost"
                dark
                :disabled="pending"
                @click="doPost"
              >
                Post
              </v-btn>
              <v-btn
                color="red"
                v-if="canUnpost"
                dark
                :disabled="pending"
                @click="doUnpost"
              >
                Unpost
              </v-btn>
            </v-card-actions>

            <v-dialog v-model="redraftDialog" max-width="500">
              <v-card>
                <v-card-title class="text-h6">Confirm Redraft</v-card-title>
                <v-card-text>
                  Are you sure you want to reset this credit note to draft status? This will allow the credit note to be edited but will require it to be re-authorised and re-posted. This action cannot be undone.
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="redraftDialog = false">Cancel</v-btn>
                  <v-btn color="red" dark @click="confirmRedraft">Confirm</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="unpostDialog" max-width="500">
              <v-card>
                <v-card-title class="text-h6">Confirm Unpost</v-card-title>
                <v-card-text>
                  Are you sure you want to unpost this credit note? This will reverse the posting and return the credit note to an unauthorised state.
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="unpostDialog = false">Cancel</v-btn>
                  <v-btn color="red" dark @click="confirmUnpost">Confirm</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
          <v-skeleton-loader v-else class="mx-auto" type="article"></v-skeleton-loader>
        </v-card>
      </v-col>
      <!--****************-->
      <!-- NOTES -->
      <!--****************-->
      <v-col v-if="credit" cols="12" md="11" lg="8">
        <v-row align="center" justify="center">
          <v-col cols="12">
            <notes
              :customerId="credit.customer_id"
              :objects="credit.objects"
              :readonly="!$userCheckPermission('PERM_EDIT')"
              :parentObjectId="credit.credit_id"
              parentObjectType="credit"/>
          </v-col>
        </v-row>
      </v-col>
      <!--****************-->
      <!-- DOCUMENTS -->
      <!--****************-->
      <v-col v-if="credit" cols="12" md="11" lg="8">
        <documents
          ref="documents"
          :readonly="!$userCheckPermission('PERM_ACCOUNTS_SUPER')"
          :customerId="credit.customer_id"
          :objects="credit.objects"
          :parentObjectId="credit.credit_id"
          parentObjectType="credit"/>
      </v-col>
      <v-col v-if="credit" cols="12" md="11" lg="8">
        <audit parentObjectType="credit" v-bind:parentObjectId="credit.credit_id"/>
      </v-col>

      <v-col v-if="credit" cols="12" md="11" lg="8" class="pt-0 pb-0 d-flex flex-wrap justify-end align-content-end caption">
        <span class="caption"><b>Created:&nbsp;</b>{{formatT(credit.created_at)}}</span>
        <span v-if="credit.posted_at" class="caption"><b>, Posted:&nbsp;</b>{{formatT(credit.posted_at)}}</span>
        <span class="caption"><b>,&nbsp;Updated:&nbsp;</b>{{formatT(credit.updated_at)}}</span>
        <span>
          <b>, by&nbsp;</b>
          <router-link v-if="$userCheckPermission('PERM_USERS_VIEW')" :to="{name: 'User', params: {user_id: credit.updated_by_id}}">{{credit.updated_by}}</router-link>
          <span v-else>{{credit.updated_by}}</span>
        </span>
      </v-col>
    </v-row>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import SiteDetailsSlim from '@/components/sites/SiteDetailsSlim'
import CustomerDetails from '@/components/customer/CustomerDetails'
import EventDetails from '@/components/events/EventDetails'
import Audit from '@/components/shared/Audit'
import Notes from '@/components/notes/Notes'
import Documents from '@/components/shared/Documents'

export default {
  name: 'tCreditNoteNew',
  components: {
    ErrorDisp,
    SiteDetailsSlim,
    CustomerDetails,
    EventDetails,
    Audit,
    Notes,
    Documents
  },
  data () {
    return {
      credit: null,
      sale: null,
      error: null,
      loading: true,
      redraftDialog: false,
      unpostDialog: false,
      pending: false
    }
  },
  computed: {
    canAuthorize () {
      if (!this.credit) { return false }
      if (this.credit.credit_status_ref !== 'UNAUTHORIZED') { return false }
      if (!this.credit.authorization_request) { return false }
      if (this.credit.authorization_request.authorizations.filter(a => a.authorized_user_id === this.$user().user_id).length > 0) { return false }
      if (!this.$userCheckPermission(this.credit.authorization_request.permission_ref)) { return false }
      return true
    },
    canPost () {
      return false
      if (!this.credit) { return false }
      if (!this.credit.authorization_request || this.credit.authorization_request.authorizations_outstanding > 0) { return false }
      if (this.credit.credit_status_ref !== 'UNAUTHORIZED') { return false }
      if (!this.$userCheckPermission('PERM_SALES_SUPER')) { return false }
      return true
    },
    canUnpost () {
      if (!this.credit) { return false }
      if (this.credit.credit_status_ref !== 'POSTED') { return false }
      if (!this.$userCheckPermission('PERM_SALES_SUPER')) { return false }
      if (this.credit.sites && this.credit.sites.length>0) { return false }
      if (this.credit.export_batch_id) { return false }
      return true
    },
    canRedraft () {
      if (!this.credit) { return false }
      if (this.credit.credit_status_ref !== 'UNAUTHORIZED') { return false }
      if (!this.$userCheckPermission('PERM_SALES_SUPER')) { return false }
      return true
    }
  },
  async created () {
    try {

      this.credit = (await this.secureGet('/api/v1/credits/' + this.$route.params.credit_id)).data
      this.credit.objects = [{parentObjectType: 'credit', parentObjectId: this.credit.credit_id}]

      // If the credit status is DRAFT, redirect to new page
      if (this.credit.credit_status_ref == 'DRAFT') {
        this.$router.replace({name: 'New Credit Note', params: { credit_id: this.credit.credit_id }})
        return
      }

      this.sale = (await this.secureGet('/api/v1/sales/' + this.credit.sale_id + '?type=items')).data
      // Adjust the sale value to reflect the credit note if it is not yet posted
      if (this.credit.credit_status_ref !== 'POSTED') {
        this.sale.value = this.sale.value - this.credit.value
        this.sale.value_outstanding = this.sale.value_outstanding - this.credit.value
      }
      if (this.credit.credit_status_ref === 'POSTED') {
        this.sale.value_credit = this.sale.value_credit - this.credit.value
      }
      this.loading = false

    } catch (error) {
      this.error = error
    }
  },
  methods: {
    doCancel () {
      this.$router.replace({name: 'Sale', params: { sale_id: this.credit.sale_id }})
    },
    doPost () {
      this.pending = true
      this.securePost('/api/v1/credits/' + this.credit.credit_id + '/post')
        .then(resp => {
          this.$router.go()
        })
        .catch((error) => {
          this.error = error
        })
    },
    doUnpost () {
      this.unpostDialog = true
    },
    confirmUnpost () {
      this.unpostDialog = false
      this.pending = true
      this.securePost('/api/v1/credits/' + this.credit.credit_id + '/unpost')
        .then(resp => {
          this.$router.go()
        })
        .catch((error) => {
          this.error = error
        })
    },
    doRedraft () {
      this.redraftDialog = true
    },
    confirmRedraft () {
      this.redraftDialog = false
      this.pending = true
      this.securePost('/api/v1/credits/' + this.credit.credit_id + '/redraft')
        .then(resp => {
          this.$router.replace({name: 'New Credit Note', params: { credit_id: this.credit.credit_id }})
        })
        .catch((error) => {
          this.error = error
        })
    },
    saleLink () {
      if (this.sale.sale_status_ref === 'DRAFT') {
        return {name: 'New Sale', params: { sale_id: this.sale.sale_id }}
      } else {
        return {name: 'Sale', params: { sale_id: this.sale.sale_id }}
      }
    },
    authorize () {
      this.pending = true
      this.securePost('/api/v1/authorize/credit/' + this.credit.credit_id)
        .then(resp => {
          this.credit.authorization_request.authorizations.push(resp.data)
          this.credit.authorization_request.authorizations_made += 1
          this.credit.authorization_request.authorizations_outstanding -= 1
          if (this.credit.authorization_request.authorizations_outstanding === 0) {
            this.$router.go()
          }
          this.pending = false
        })
        .catch((error) => {
          this.error = error
        })
    },
    creditHref (credit) {
      return this.$config.API_URL + '/asset/credit/' + credit.credit_id + '/' + credit.filename
    },
  }
}

</script>
