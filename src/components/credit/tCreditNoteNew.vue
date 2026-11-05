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
              <v-row>
                <v-col cols="12">
                  <customer-details v-model="credit.customer_id" expand/>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-card class="elevation-1">
                    <v-card-title class="secondary text-body-1 pt-2 pb-2">
                      Credit Note Description
                    </v-card-title>
                    <v-card-text v-if="saleLines && saleLines.length>0">
                      <v-text-field
                        label="Credit Note Description"
                        v-model="credit.description"
                        rows="3"
                        @input="dirty = true"
                        :error-messages="descriptionErrors"
                      ></v-text-field>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <!--****************-->
              <!-- CREDIT NOTE LINES -->
              <!--****************-->
              <v-row align="center" justify="center">
                <v-col cols="12">
                  <v-card class="elevation-1">
                    <v-card-title class="secondary text-body-1 pt-2 pb-2">
                      Credit Values
                    </v-card-title>
                    <v-card-text v-if="saleLines && saleLines.length>0" class="text-body-1">
                      <v-row class="pt-2 pb-2">
                        <v-col cols="4" class="font-weight-bold">
                          Sale line
                        </v-col>
                        <v-col cols="2" class="font-weight-bold">
                          Price
                        </v-col>
                        <v-col cols="3" class="font-weight-bold">
                          Credit Value
                        </v-col>
                      </v-row>
                      <div v-for="line in saleLines" :key="line.sale_line_id">
                        <template >
                          <v-row dense class="pt-2" align="center">
                            <v-col cols="4" class="pt-2 pb-1">
                              {{formatLineParent(line)}} - {{line.line_description}}
                            </v-col>
                            <v-col cols="2" class="pt-2 pb-1 ml-3">
                              {{formatMInt(line.line_value)}}
                            </v-col>
                            <v-col cols="3" class="">
                              <v-text-field
                              v-model="line.credit_value"
                              type="number"
                              dense
                              :disabled="line.line_value<=0"
                              :error-messages="creditValueErrors(line)"
                              @input="dirty = true"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="1">
                              <v-btn
                              icon
                              small
                              @click="line.credit_value = line.line_value; dirty = true"
                              v-if="line.line_value>0"
                              >
                              <v-icon>mdi-check</v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                          <v-row>
                          <v-col dense cols="12">
                            <v-divider></v-divider>
                          </v-col>
                          </v-row>
                        </template>
                      </div>
                      <v-row>
                        <v-col cols="12">
                          <b>Total Credit: </b>{{ formatMInt(creditValue) }}
                        </v-col>
                      </v-row>
                      <div v-if="creditError" class="red--text mt-2">{{ creditError }}</div>
                    </v-card-text>
                    <v-skeleton-loader v-else class="mx-auto" type="article"></v-skeleton-loader>
                  </v-card>
                </v-col>
              </v-row>

              <!--****************-->
              <!-- SALE SITES -->
              <!--****************-->
              <v-row v-if="saleSites && saleSites.length > 0" align="center" justify="center">
                <v-col cols="12">
                  <v-card class="elevation-1">
                    <v-card-title class="secondary text-body-1 pt-2 pb-2">
                      Revert Sites to Stock
                    </v-card-title>
                    <v-card-text v-if="saleSites.length>0" class="text-body-1">
                      <v-row class="pt-2" align="center">
                        <v-col cols="2" class="font-weight-bold">
                        Site Ref
                        </v-col>
                        <v-col cols="2" class="font-weight-bold">
                        Site Type
                        </v-col>
                        <v-col cols="2" class="font-weight-bold">
                        Revert to Stock
                        </v-col>
                      </v-row>
                      <div v-for="site in saleSites" :key="site.sale_site_id">
                        <v-row class="pt-2" align="center">
                        <v-col cols="2" class="pt-2 pb-1">
                          {{site.site_ref}}
                        </v-col>
                        <v-col cols="2" class="pt-2 pb-1">
                          {{site.site_type}}
                        </v-col>
                        <v-col cols="2" class="pt-2 pb-1">
                          <v-checkbox v-if="canRevert(site)" v-model="site.revert" @change="dirty = true"></v-checkbox>
                          <span v-else class="red--text">Cannot revert - site has burials</span>
                        </v-col>
                        </v-row>
                        <v-row>
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
              <!-- EVENTS -->
              <!--****************-->
              <v-row v-if="sale && sale.events.length>0" align="center" justify="center">
                <v-col cols="12">
                  <v-card class="elevation-1">
                    <v-card-title class="secondary text-body-1 pt-2 pb-2">
                      Cancel Events
                    </v-card-title>
                    <v-card-text class="text-body-1">
                      <v-row class="pt-2" align="center">
                        <v-col cols="6" class="font-weight-bold">
                        Event
                        </v-col>
                        <v-col cols="2" class="font-weight-bold">
                        Cancel Event
                        </v-col>
                      </v-row>
                      <div v-for="event in sale.events" :key="event.event_id">
                        <template v-if="event.event_status_ref != 'CANCELLED'">
                          <v-row dense class="" align="center">
                            <v-col cols="6" class="pt-2 pb-1">
                              {{formatT(event.event_time)}} - {{event.site_ref}} {{event.event_type}}
                            </v-col>
                            <v-col cols="2" class="pt-2 pb-1">
                              <v-checkbox v-model="event.cancel" @change="dirty = true"></v-checkbox>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12">
                              <v-divider></v-divider>
                            </v-col>
                          </v-row>
                        </template>
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
                      Credit Note Summary
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
                                {{ formatMInt(-creditValue) }}
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
                                  <b>{{ formatMInt(sale.value - creditValue) }}</b>
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
                                  {{ formatMInt(sale.value - creditValue) }}
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
                                  <b>{{ formatMInt(sale.value_outstanding - creditValue) }}</b>
                                </v-col>
                              </v-row>
                          </v-col>
                        </v-row>
                      </template>
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
                color="error"
                @click="deleteDialog = true"
              >
                Delete
              </v-btn>
              <v-btn
                color="primary"
                @click="doUpdate"
                :disabled="pending"
                v-if="!canCreate"
              >
                Update
              </v-btn>
              <v-btn
                color="primary"
                dark
                :disabled="pending"
                v-if="canCreate"
                @click="doSubmit"
              >
                Create Credit Note
              </v-btn>
            </v-card-actions>
          </template>
          <v-skeleton-loader v-else class="mx-auto" type="article"></v-skeleton-loader>
        </v-card>
      </v-col>
      <!-- NOTES -->
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
      <!-- DOCUMENTS -->
      <v-col v-if="credit" cols="12" md="11" lg="8">
        <documents
          ref="documents"
          :readonly="!$userCheckPermission('PERM_ACCOUNTS_SUPER')"
          :customerId="credit.customer_id"
          :objects="credit.objects"
          :parentObjectId="credit.credit_id"
          parentObjectType="credit"/>
      </v-col>
      <!-- AUDIT -->
      <v-col v-if="credit" cols="12" md="11" lg="8">
        <audit parentObjectType="credit" v-bind:parentObjectId="credit.credit_id"/>
      </v-col>
      <!-- OBJECT CREATED UPDATED -->
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
      <!-- DELETE CONFIRMATION DIALOG -->
      <v-dialog v-model="deleteDialog" max-width="500">
        <v-card>
          <v-card-title class="error white--text">
            Confirm Delete
          </v-card-title>
          <v-card-text class="pt-5">
            <p class="text-body-1">Are you sure you want to delete this credit note?</p>
            <p class="text-body-2">This action cannot be undone.</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="deleteDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="error"
              @click="confirmDelete"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import Audit from '@/components/shared/Audit'
import CustomerDetails from '@/components/customer/CustomerDetails'
import { required, integer, decimal, minValue, maxValue } from 'vuelidate/lib/validators'
import Notes from '@/components/notes/Notes'
import Documents from '@/components/shared/Documents'

export default {
  name: 'tCreditNoteNew',
  components: {
    ErrorDisp,
    Audit,
    CustomerDetails,
    Documents,
    Notes
  },
  data () {
    return {
      credit: null,
      sale: null,
      error: null,
      saleLines: null,
      otherCreditLines: null,
      saleSites: null,
      saleEvents: null,
      deleteDialog: false,
      dirty: false,
      loading: true,
      pending: false
    }
  },
  validations: {
    credit: {
      description: {
        required
      }
    },
    saleLines: {
      $each: {
        credit_value: {
          minValue: minValue(0)
        }
      }
    }
  },
  computed: {
    creditValue () {
      if (!this.saleLines) { return 0 }
      if (this.saleLines.length === 0) { return 0 }
      // Calculate total credit value from the credit values of each line
      return this.saleLines.reduce((sum, line) => {
        const creditValue = parseFloat(line.credit_value) || 0
        return sum + creditValue
      }, 0)
    },
    canCreate () {
      return this.sale && this.credit && this.creditValue > 0 && !this.dirty
    },
    descriptionErrors () {
      const errors = []
      if (!this.$v.credit.description.$dirty) return errors
      !this.$v.credit.description.required && errors.push('Description is required')
      return errors
    },
    creditError () {
      if (this.$v.$dirty && this.sale) {
        // if (this.creditValue > this.sale.value_outstanding) {
        //   return 'Total credit cannot exceed outstanding amount'
        // }
        if (this.creditValue === 0) {
          return 'Total credit must be greater than 0'
        }
      }

      return null
    }
  },
  async created () {
    try {

        this.credit = (await this.secureGet('/api/v1/credits/' + this.$route.params.credit_id)).data
        this.credit.objects = [{parentObjectType: 'credit', parentObjectId: this.credit.credit_id}]

        // If the credit status is not DRAFT, redirect to view page
        if (this.credit.credit_status_ref !== 'DRAFT') {
          this.$router.replace({name: 'Credit Note', params: { credit_id: this.credit.credit_id }})
          return
        }
        this.sale = (await this.secureGet('/api/v1/sales/' + this.credit.sale_id + '?type=items')).data

        // Get sale lines for the sale to link to credit lines
        this.saleLines = (await this.secureGet('/api/v1/sales/' + this.sale.sale_id + '/lines')).data

        // Get any posted credit lines from other credits on this sale
        this.otherCreditLines = (await this.secureGet('/api/v1/sales/' + this.sale.sale_id + '/credit_lines')).data

        // Add a reactive property to each line for the credit value
        this.saleLines.forEach(line => {
          let val = 0
          // look for a credit line for this sale line and set the initial value if it exists
          if (this.credit.lines) {
            const creditLine = this.credit.lines.find(cl => cl.sale_line_id === line.sale_line_id)
            if (creditLine) {
              val = creditLine.line_value
            }
          }
          // Look for any posted credit lines for this sale line and subtract from the initial value
          if (this.otherCreditLines) {
            const otherCreditLines = this.otherCreditLines.filter(ocl => ocl.sale_line_id === line.sale_line_id)
            otherCreditLines.forEach(ocl => {
              line.line_value -= ocl.line_value
            })
          }
          this.$set(line, 'credit_value', val)
        })
        console.log('Initialised credit note: ', this.credit.lines)
        console.log('Initialised credit note lines: ', this.saleLines)
        // Get sale sites for the sale
        this.saleSites = (await this.secureGet('/api/v1/sales/' + this.sale.sale_id + '/sites')).data

        // Add a reactive property to each site for whether it should be reverted
        this.saleSites.forEach(site => {
          let revert = false
          // look for a credit site for this site and set the initial value if it exists
          if (this.credit.sites) {
            const creditSite = this.credit.sites.find(sr => sr.sale_site_id === site.sale_site_id)
            if (creditSite) {
              revert = true
            }
          }
          this.$set(site, 'revert', revert)
        })

        // Add a reactive property to each event for whether it should be cancelled
        this.sale.events.forEach(event => {
          let cancel = false
          // look for a credit event for this event and set the initial value if it exists
          if (this.credit.events) {
            const creditEvent = this.credit.events.find(ce => ce.event_id === event.event_id)
            if (creditEvent) {
              cancel = true
            }
          }
          this.$set(event, 'cancel', cancel)
        })
        this.loading = false

    } catch (error) {
      this.error = error
    }
  },
  methods: {
    doCancel () {
      this.$router.replace({name: 'Sale', params: { sale_id: this.credit.sale_id }})
    },
    doSubmit () {
      if (this.dirty) {
        return
      }
      // Call API to create credit note from this draft
      this.pending = true
      this.securePost('/api/v1/credits/' + this.credit.credit_id + '/submit')
        .then(res => {
          this.$router.replace({name: 'Credit Note', params: { credit_id: this.credit.credit_id }})
        })
        .catch((error) => { this.error = error })
    },
    doUpdate () {
      // Validate before updating
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      this.pending = true
      // Call API to update credit note
      const sitesRevert = this.saleSites.filter(site => site.revert).map(site => site.sale_site_id)
      const eventsCancel = this.sale.events.filter(event => event.cancel).map(event => event.event_id)
      const oCredit = {
        description: this.credit.description,
        lines: this.saleLines.filter(line => line.credit_value > 0).map(line => ({
          sale_line_id: line.sale_line_id,
          credit_value: parseFloat(line.credit_value),
          line_description: line.line_description
        })),
      }
      if (sitesRevert.length > 0) {
        oCredit.sites = sitesRevert
      }
      if (eventsCancel.length > 0) {
        oCredit.events = eventsCancel
      }

      //console.log('Updating credit note with data: ', oCredit)

      this.securePut('/api/v1/credits/' + this.credit.credit_id, oCredit)
        .then(res => {
          this.$router.go()
        })
        .catch((error) => { this.error = error })
    },
    confirmDelete () {
      this.deleteDialog = false
      this.secureDelete('/api/v1/credits/' + this.credit.credit_id)
        .then(res => {
          this.$router.replace({name: 'Sale', params: { sale_id: this.credit.sale_id }})
        })
        .catch((error) => { this.error = error })
    },
    creditValueErrors (line) {
      const errors = []
      const index = this.saleLines.indexOf(line)
      if (!this.$v.saleLines.$each[index] || !this.$v.saleLines.$each[index].credit_value.$dirty) return errors

      const creditValue = parseFloat(line.credit_value)
      if (isNaN(creditValue) || creditValue < 0) {
        errors.push('Credit value must be a positive number')
      }
      if (creditValue > line.line_value) {
        errors.push('Credit value cannot exceed line value of ' + this.formatMInt(line.line_value))
      }
      return errors
    },

    canRevert(site) {
      // A site can be reverted if it has no burials linked to it
      return !(site.burial_count > 0)
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
    saleLink () {
      if (this.sale.sale_status_ref === 'DRAFT') {
        return {name: 'New Sale', params: { sale_id: this.sale.sale_id }}
      } else {
        return {name: 'Sale', params: { sale_id: this.sale.sale_id }}
      }
    }
  }
}

</script>
