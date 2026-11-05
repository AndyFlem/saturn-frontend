<template>
  <div>
    <error-disp v-model="error"/>
    <div v-if="burial">
      <v-row align="center" justify="center">
        <v-col cols="12" md="11" lg="8">
          <v-card class="elevation-4">
            <v-card-title class="primary white--text">
              <span>
                <v-icon color="white" large class="pr-3">mdi-grave-stone</v-icon>
                {{deceasedName}}
              </span>
              <v-spacer/>
              <v-switch
                dense
                dark
                hide-details
                :disabled="!flagEnabled()"
                :color="burial.flag ? 'red':'white'"
                class="mb-0 pt-0 pb-0 mt-1 mr-7"
                v-model="burial.flag"
                label="Flagged burial?"
                @click="flagged()"
              />
              <v-chip
                v-bind:color="burialStatusColor(burial.burial_status_ref)"
                class="ml-auto mr-2"
              >
                {{ burial.burial_status}}
              </v-chip>
            </v-card-title>
            <v-card-text class="mt-3 ml-3 text-body-1">
              <v-row>
                <v-col cols="12" sm="6" md="4" class="pb-3">
                  <customer-details v-model="burial.customer_id" />
                  <div v-if="burial.nok_is_customer && burial.nok_relation">Relation to Deceased: <b>{{burial.nok_relation}}</b></div>
                  <div v-if="burial.show_public">
                    <v-icon class="mr-2" small>mdi-open-in-new</v-icon><a :href="publicUrl" target="_blank">Public burial page</a> ({{ burial.public_views || 0 }} views)<v-icon v-if="shareAvailable" class="ml-2" @click="share">mdi-share-variant</v-icon>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pb-3">
                  <div>Deceased: <b>{{deceasedName}}</b><span v-if="burial.deceased_gender"> ({{burial.deceased_gender}})</span></div>
                  <div>Burial Date:<b> <span :class="burialDateClass(burial)">{{ formatD(burial.burial_date) }}, {{burialSlot}}</span></b></div>
                  <div>
                    <span v-if="burial.deceased_birth_date">
                      Born:<b> {{ formatD(burial.deceased_birth_date) }}</b>
                    </span>
                    <span v-if="burial.deceased_age">
                      &nbsp;Age:<b> {{deceasedAge}}</b>
                    </span>
                  </div>
                  <div>
                    <span v-if="burial.deceased_religion || burial.deceased_denomination || burial.deceased_church">
                      Religion: <b> {{burial.deceased_religion}} {{burial.deceased_denomination}} {{burial.deceased_church}}</b>
                    </span>
                  </div>
                  <div v-if="burial.deceased_address">
                    Of: <b>{{burial.deceased_address}}</b>
                  </div>
                  <div>
                    <span v-if="burial.deceased_id_type">{{burial.deceased_id_type}}:</span>
                    <span v-if="burial.deceased_id_no"><b>{{burial.deceased_id_no}}</b></span>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pt-3">
                  <div>Burial no. <b>{{burial.burial_id}}</b></div>
                  <div>Site Type: <b>{{ burial.site_type }}</b></div>
                  <template v-if="burial.site_id">
                    <div>Site: <site-map-popup :site="burial" />
                      <router-link :to="{ name: 'Site', params: { site_id: burial.site_id }}"><b>{{ burial.site_ref }}</b></router-link>
                    </div>
                    <div>Grave no: <b>{{burial.grave_no}} of {{burial.graves}}</b></div>
                    <div>Site Status: <b> {{burial.site_status}}</b></div>
                  </template>
                  <template v-else>
                    <div>Site: <b>Not selected</b></div>
                  </template>
                  <div v-if="burial.has_headstone"><b>Headstone Installed</b></div>
                </v-col>
              </v-row>
              <v-row>
                <v-col v-if="!burial.nok_is_customer" cols="12" sm="6" md="4" class="pb-3">
                  <div>Next-of-kin: <b> {{burial.nok_salutation}} {{burial.nok_first_name}} {{burial.nok_last_name}}</b></div>
                  <div v-if="burial.nok_address">Of: <b>{{burial.nok_address}}</b></div>
                  <div v-if="burial.nok_phone1 || burial.nok_phone2">Tel: <b>{{burial.nok_phone1}} {{burial.nok_phone2}}</b></div>
                  <div v-if="burial.nok_email">Email: <b>{{burial.nok_email}}</b></div>
                  <div>
                    <span v-if="burial.nok_id_type">{{burial.nok_id_type}}: </span>
                    <span v-if="burial.nok_id_no"><b>{{burial.nok_id_no}}</b></span>
                  </div>
                  <div v-if="burial.nok_relation">Relation to Deceased: <b>{{burial.nok_relation}}</b></div>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pt-3">
                  <div v-if="burial.death_date">Date of Death: <b>{{formatD(burial.death_date)}}</b></div>
                  <div v-if="burial.cod">Cause of death: <b>{{burial.cod}}<span v-if="burial.cod_is_contagious"> (contagious)</span><span class="pl-1" v-if="burial.cod_description">{{burial.cod_description}}</span></b></div>
                  <div v-if="burial.cod_is_bid"><b>Brought in dead</b></div>
                  <div v-if="burial.undertaker_name">Undertaker: <b>{{burial.undertaker_name}}</b></div>
                  <div v-if="burial.burial_permit_issuer || burial.burial_permit_no">Burial permit: <b>{{burial.burial_permit_issuer}} {{burial.burial_permit_no}}</b></div>
                  <div v-if="burial.cod_is_contagious" class="d-flex"><v-icon color="red" class="pt-2 pr-3">mdi-alert-circle-outline</v-icon> <div class="font-weight-bold red--text pt-2">Contagious Cause of Death</div></div>
                </v-col>
                <v-col cols="12" sm="6" md="4" v-if="burial.is_legacy" class="pl-3 pb-0">
                  <div v-if="burial.is_legacy"><b>Legacy Burial</b></div>
                  <div v-if="burial.is_legacy">Legacy address: {{burial.legacy_address}}</div>
                  <div v-if="burial.is_legacy">Legacy suspect flag: {{burial.legacy_address_dirty}}

                  <v-icon
                    small
                    v-if="burial.legacy_address_dirty"
                    :disabled="!$userCheckPermission('PERM_SALES_SUPER')"
                    v-on:click="clearSuspect"
                  >mdi-cancel</v-icon>
                  </div>
                  <div v-if="burial.is_legacy">Suspect address: {{burial.suspect_address}}</div>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pt-3">
                  <div>
                    Sale no: <b>
                    <router-link v-if="this.$userCheckPermission('PERM_VIEW')" :to="{ name: 'Sale', params: { sale_id: burial.sale_id }}">{{ burial.sale_id }}</router-link><span v-else>{{ burial.sale_id }}</span>
                    <span v-if="this.$userCheckPermission('PERM_VIEW')"> {{formatMInt(burial.sale_value)}} </span>
                    <span :style="`color:${saleStatusColor(burial.sale_status_ref)};`">({{ burial.sale_status }})</span>
                    </b>
                  </div>
                  <div>Tariff:<b> {{ burial.tariff_name }}</b></div>
                  <div v-if="burial.deceased_vip_type">VIP: <b>{{burial.deceased_vip_type}}</b></div>
                </v-col>
                <template v-if="charges">
                  <v-col v-if="charges.length>0" cols="12" sm="6" md="4" class="pt-3">
                    <div><b>Charges:</b></div>
                    <template>
                      <div v-for="charge in charges" :key="charge.sale_line_id">
                        {{formatM(charge.line_price)}} - {{charge.line_description}}
                      </div>
                      <div><b>Total: </b>{{formatM(burial.value)}}</div>
                    </template>
                  </v-col>
                </template>
                <v-col cols="12" sm="6" md="4" class="pl-3 pb-0">
                  <div v-if="$userCheckPermission('PERM_EDIT')">
                    <v-icon color="primary" class="pr-3">mdi-download</v-icon>
                    <a @click="generateCertificate">Download Blank Burial Certificate</a>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="pt-3">
                  <div>
                    <document
                      cols="12"
                      parentObject="burial"
                      :readonly="true"
                      :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                      :customerId="burial.customer_id"
                      :parentObjectId="burial.burial_id"
                      documentPropertyRef="BURIAL_PERMIT"
                      />
                  </div>
                  <div>
                    <document
                      cols="12"
                      parentObject="burial"
                      :readonly="true"
                      :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                      :customerId="burial.customer_id"
                      :parentObjectId="burial.burial_id"
                      documentPropertyRef="COD"
                      />
                  </div>
                  <div>
                    <document
                      cols="12"
                      parentObject="burial"
                      :readonly="true"
                      :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                      :customerId="burial.customer_id"
                      :parentObjectId="burial.burial_id"
                      documentPropertyRef="ID"
                      />
                  </div>
                  <div>
                    <document
                      cols="12"
                      parentObject="burial"
                      :readonly="true"
                      :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                      :customerId="burial.customer_id"
                      :parentObjectId="burial.burial_id"
                      documentPropertyRef="BURIAL_CERTIFICATE"
                      />
                  </div>
                </v-col>
              </v-row>
              <v-row>
              <v-col v-if="burial" cols="12" class="pt-10 pb-0 d-flex caption align-end">
                <div>
                  <span><b>Created:&nbsp;</b>{{formatT(burial.created_at)}}</span>
                  <span><b>, Updated:&nbsp;</b>{{formatT(burial.updated_at)}}</span>
                  <span>
                    <b>, by&nbsp;</b>
                    <router-link v-if="$userCheckPermission('PERM_USERS_VIEW')" :to="{name: 'User', params: {user_id: burial.updated_by_id}}">{{burial.updated_by}}</router-link>
                    <span v-else>{{burial.updated_by}}</span>
                  </span>
                </div>
                <v-spacer/>
                <div>
                  <v-btn
                    class="mr-4 mb-3"
                    color="primary"
                    v-if="canComplete"
                    v-on:click="burialConfirm=true"
                  >
                  Complete
                  </v-btn>
                  <v-btn
                    class="mr-4 mb-3"
                    color="primary"
                    v-if="$userCheckPermission('PERM_EDIT')"
                    v-on:click="$router.push({path: '/edit_burial/' + burial.burial_id})"
                  >
                  Edit
                  </v-btn>
                </div>
              </v-col>
            </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
          <v-dialog v-model="burialConfirm" persistent max-width="800">
            <v-card class="elevation-4">
              <v-card-title class="primary white--text">
                Confirm Burial
              </v-card-title>
              <v-card-text class="pt-3">
                Confirm the burial date and upload a burial certificate to mark the burial as complete.
              </v-card-text>
              <v-card-text>
                <v-form>
                  <v-row no-gutters>
                    <v-col cols="12" class="pb-0 text-subtitle-1">
                      <b>Burial Date: </b>{{formatD(burial.burial_date)}}
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12" class="pt-0 pt-0">
                  <document
                    cols="12"
                    label="Burial certificate"
                    :error-messages="certificateDocumentErrors"
                    parentObject="burial"
                    :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                    v-model="certificateDocumentId"
                    :customerId="burial.customer_id"
                    :parentObjectId="burial.burial_id"
                    documentPropertyRef="BURIAL_CERTIFICATE"/>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="burialConfirm=false">Cancel</v-btn>
                <v-btn color="primary" :disabled="!certificateDocumentId" @click="markComplete()">Ok</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
      </v-col>
    </v-row>
    <!-- SITE SELECTOR -->
    <v-row v-if="burial && !burial.site_id && $userCheckPermission('PERM_EDIT')" justify="center" align="center">
      <v-col cols="12" md="11" lg="8">
          <v-card>
            <v-card-title class="secondary text-h6">
              Select Site
            </v-card-title>
            <v-card-text class="pt-5">
              <v-row>
                <v-col cols="12" md="10" class="pl-10 pr-10 text-body-2">Select site:
                <site-selector v-model="selectedSite" v-on:input="siteSelected" :siteTypeId="burial.site_type_id"/>
                </v-col>
              </v-row>
            </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!--PHOTOS-->
    <v-row  v-if="burial" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <photos
          :siteId="burial.site_id"
          :siteRef="burial.site_ref" 
          readonly/>
      </v-col>
    </v-row>    
    <!-- NOTES -->
    <v-row  v-if="burial" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <notes
          :customerId="burial.customer_id"
          :readonly="!$userCheckPermission('PERM_EDIT')"
          :objects="docObj"
          :forceAdd="addNote"
          :setFlag="flagWithNote"
          v-on:added="noteAdded"
          :parentObjectId="burial_id"
          parentObjectType="burial"/>
      </v-col>
    </v-row>
    <!-- DOCUMENTS -->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <documents
          ref="documents"
          :readonly="!$userCheckPermission('PERM_EDIT')"
          :customerId="burial.customer_id"
          :objects="docObj"
          :parentObjectId="burial_id"
          parentObjectType="burial"/>
      </v-col>
    </v-row>
    <!-- ADMIN ACTIONS -->
    <v-row v-if="$userCheckPermission('PERM_SALES_SUPER') && (((burial.burial_status_ref=='COMPLETE' || burial.burial_status_ref=='CONFIRMED') && !burial.is_legacy) || (burial.site_id))" justify="center" align="center">
      <v-col cols="12" md="11" lg="8">
          <v-expansion-panels>
            <v-expansion-panel>
            <v-expansion-panel-header class="secondary text-h6">
              Admin Actions
            </v-expansion-panel-header>
            <v-expansion-panel-content class="pt-5">
              <template v-if="burial.site_id">
                <v-row>
                  <v-col cols="12" class="body-text-1 font-weight-bold">
                    Move Grave Site
                  </v-col>
                  <v-col cols="10">
                    <grave-selector @selected="moveSiteSelected" :customer-id="burial.customer_id" :current-site-id="burial.site_id" :current-grave-no="burial.grave_no"/>
                  </v-col>
                  <v-col cols="2">
                    <v-btn
                      class="mr-4 mb-3"
                      color="primary"
                      :disabled="!moveSite"
                      v-on:click="doMove"
                    >
                    Move Grave
                    </v-btn>
                  </v-col>
                </v-row>
              </template>
              <template v-if="(burial.burial_status_ref=='COMPLETE' || burial.burial_status_ref=='CONFIRMED')">
                <v-row>
                  <v-col cols="12" class="body-text-1 font-weight-bold">
                    Set Burial as Draft
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-btn
                      class="mr-4 mb-3"
                      color="primary"
                      :disabled="!$userCheckPermission('PERM_SALES_SUPER')"
                      v-on:click="setIncomplete"
                    >
                    Set Draft
                    </v-btn>
                  </v-col>
                </v-row>
              </template>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <!-- AUDIT -->
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <audit parentObjectType="burial" v-bind:parentObjectId="burial.burial_id"/>
      </v-col>
    </v-row>
    </div>
  </div>
</template>

<script>
import CustomerDetails from '@/components/customer/CustomerDetails'
import Documents from '@/components/shared/Documents'
import Audit from '@/components/shared/Audit'
import Document from '@/components/shared/Document'
import Notes from '@/components/notes/Notes'
import ErrorDisp from '@/components/shared/Error'
import SiteMapPopup from '@/components/sites/SiteMapPopup'
import SiteSelector from '@/components/sales/SiteSelector'
import GraveSelector from '@/components/sites/GraveSelector'
import Photos from '@/components/photos/Photos'

// import helpers from '@/services/helpers'
import { required } from 'vuelidate/lib/validators'
import { Interval, DateTime } from 'luxon'

export default {
  name: 'Burial',
  components: {
    CustomerDetails,
    Documents,
    Document,
    Audit,
    ErrorDisp,
    SiteMapPopup,
    Notes,
    Photos,
    SiteSelector,
    GraveSelector
  },
  data () {
    return {
      selectedSite: null,
      customer_id: null,
      burial_id: null,
      burial: null,
      charges: null,
      certificateDocumentId: null,
      burialConfirm: false,
      error: null,
      addNote: false,
      moveSite: null,
      flagWithNote: false
    }
  },
  validations: {
    certificateDocumentId: { required }
  },
  watch: {
    '$route.params.burial_id': function () {
      this.load()
    }
  },
  mounted () {
    this.load()
  },
  computed: {
    deceasedAge () {
      if (this.burial.deceased_age < 5 && this.burial.deceased_birth_date && this.burial.death_date) {
        let dur = Interval.fromDateTimes(DateTime.fromISO(this.burial.deceased_birth_date), DateTime.fromISO(this.burial.death_date)).toDuration(['years', 'months']).toObject()
        let str = ''
        if (dur.years > 0) {
          str = dur.years + 'yr'
        }
        if (Math.floor(dur.months) > 0) {
          str += ', ' + Math.floor(dur.months) + 'mn'
        }
        return str
      } else {
        if (this.burial.deceased_age) {
          return '' + this.burial.deceased_age + ' yrs'
        } else {
          return ''
        }
      }
    },
    publicUrl () {
      return `${this.$config.PUBLIC_PORTAL}/burial/${this.burial.public_id}`
    },
    shareAvailable () {
      return navigator.share
    },
    dateTime () {
      let str = ''
      if (this.burial) {
        str += this.formatD(this.burial.burial_date)
        if (this.burial.burial_slot_from) {
          str += ' between ' + this.formatSlot(this.burial.burial_slot_from) + ' and ' + this.formatSlot(this.burial.burial_slot_to)
        }
      }
      return str
    },
    deceasedName () {
      let str = ''
      if (this.burial) {
        if (this.burial.deceased_salutation) { str += this.burial.deceased_salutation + ' ' }
        if (this.burial.deceased_first_name) { str += this.burial.deceased_first_name + ' ' }
        if (this.burial.deceased_middle_name) { str += this.burial.deceased_middle_name + ' ' }
        if (this.burial.deceased_last_name) { str += this.burial.deceased_last_name }
      }
      return str
    },
    docObj () {
      if (this.burial_id) {
        return [{parentObjectType: 'burial', parentObjectId: this.burial_id}]
      } else {
        return []
      }
    },
    burialSlot () {
      return this.formatSlot(this.burial.burial_slot_from) + ' - ' + this.formatSlot(this.burial.burial_slot_to)
    },
    certificateDocumentErrors () {
      const errors = []
      if (!this.$v.certificateDocumentId.$dirty) return errors
      !this.$v.certificateDocumentId.required && errors.push('An uploaded burial certificate is required.')
      return errors
    },
    canComplete () {
      if (this.burial.sale_status_ref == 'DRAFT' ) { return false}
      if (this.burial.sale_status_ref == 'UNAUTHORIZED' ) { return false}
      if (this.burial.burial_status_ref != 'CONFIRMED' ) { return false}
      if (!this.$userCheckPermission('PERM_EDIT')) { return false}
      return true
    },
  },
  methods: {
    moveSiteSelected (val) {
      this.moveSite = val
    },
    siteSelected () {
      this.pending = true
      this.securePost('/api/v1/sale_sites/' + this.burial.sale_site_id + '/setSite', {site_id: this.selectedSite.site_id})
        .then(() => {
          this.$router.go()
        })
        .catch((error) => { this.error = error })
    },
    share () {
      if (navigator.share) {
        navigator.share({
          title: 'Burial of ' + this.deceasedName + '. ' + this.dateTime + '.',
          url: this.publicUrl
        })
      }
    },
    load () {
      if (this.$route.params.burial_id) {
        this.burial_id = parseInt(this.$route.params.burial_id)

        this.secureGet('/api/v1/burials/' + this.burial_id)
          .then(response => {
            this.burial = response.data
            this.customer_id = this.burial.customer_id
            return this.secureGet('/api/v1/burials/' + this.burial_id + '/sale_lines')
          })
          .catch((error) => { this.error = error })
      }
    },
    setIncomplete () {
      this.securePut('/api/v1/burials/' + this.burial.burial_id + '/incomplete')
        .then(() => {
          this.$router.go()
        })
        .catch((error) => { this.error = error })
    },
    clearSuspect () {
      this.securePut('/api/v1/burials/' + this.burial.burial_id + '/clearlegacydirty')
        .then(() => {
          this.burial.legacy_address_dirty = false
        })
        .catch((error) => { this.error = error })
    },
    flagged () {
      if (this.burial.flag) {
        this.flagWithNote = true
        this.addNote = true
      } else {
        this.securePut('/api/v1/burials/' + this.burial.burial_id + '/flag')
          .then(() => {
            return true
          })
          .catch((error) => { this.error = error })
      }
    },
    flagEnabled () {
      if (this.burial.flag) {
        return this.$userCheckPermission('PERM_SALES_SUPER')
      } else {
        return (this.$userCheckPermission('PERM_EDIT') || this.$userCheckPermission('PERM_SALES_SUPER'))
      }
    },
    noteAdded () {
      this.addNote = false
      this.flagWithNote = false
    },
    generateCertificate () {
      this.securePost(
        '/api/v1/burials/' + this.burial_id + '/generate_burial_certificate', {user_id: JSON.parse(localStorage.user).user_id})
        .then(response => {
          const url = this.$config.API_URL + '/asset/burial/' + this.burial_id + '/' + this.burial_id + '_Blank_Burial_Certificate.pdf'
          window.open(url, '_blank')
          this.$refs.documents.reloadDocuments()
        })
        .catch((error) => { this.error = error })
    },
    burialDateClass (burial) {
      if (burial.burial_status_ref !== 'COMPLETE' && DateTime.fromISO(burial.burial_date).startOf('day') < DateTime.local().startOf('day')) { return 'red--text' }
      if (burial.burial_status_ref !== 'COMPLETE' && DateTime.fromISO(burial.burial_date).hasSame(DateTime.local(), 'day')) { return 'font-weight-bold green--text' }
    },
    doMove () {
      if (this.moveSite.site_id === this.burial.site_id) {
        const oUpdate = {user_id: JSON.parse(localStorage.user).user_id, grave_no: this.moveSite.grave_no}
        this.securePut('/api/v1/burials/' + this.burial_id + '/change_grave', oUpdate)
          .then(() => {
            this.$router.go()
          })
          .catch((error) => { this.error = error })
      } else {
        // const oUpdate = {user_id: JSON.parse(localStorage.user).user_id, site_id: this.moveSite.site_id, grave_no: this.moveSite.grave_no}
        // this.securePut('/api/v1/burials/' + this.burial_id + '/change_site', oUpdate)
        //   .then(() => {
        //     this.$router.go()
        //   })
        //   .catch((error) => { this.error = error })
      }
    },
    markComplete () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.securePut('/api/v1/burials/' + this.burial_id + '/complete')
          .then(() => {
            this.burialConfirm = false
            this.$router.go()
          })
          .catch((error) => { this.error = error })
      }
    }
  }
}
</script>

<style scoped>
</style>
