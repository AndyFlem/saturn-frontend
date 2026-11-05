<template>
  <v-expansion-panels v-model="expandIndex" :flat="flat">
    <error-disp v-model="error"/>
    <v-expansion-panel>
      <v-expansion-panel-header class="text-body-1 pt-2 pb-2">
        <v-row v-if="burial">
          <v-col cols="7" sm="6" order="1" order-sm="1" class="d-flex pr-0 pb-0 pt-0">
            <v-row no-gutters>
              <v-col cols="12">
                <v-icon class="text-h5 mr-4">mdi-grave-stone</v-icon>
                <router-link :to="{ name: 'Burial', params: { burial_id: value }}">
                  {{deceasedName}}
                </router-link>
              </v-col>
              <v-col cols="12" class="pt-0 pb-0 d-flex">
                <div :class="burialDateClass(burial)">
                  {{ formatD(burial.burial_date) }}
                </div>
                <div v-if="burial.cod_is_contagious" class="d-flex pl-4">
                  <v-icon color="red" class="text-h5 pt-0 pr-3" title="Contagious COD">mdi-alert-circle-outline</v-icon>
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" sm="4" order="2" order-sm="2" class="d-flex pl-0 pb-0 pt-0 align-center">
            <template>
              <site-map-popup :site="burial" />
            </template>
            <router-link class="pt-1 mr-5" :to="{name:'Site', params: {site_id: burial.site_id}}">
              {{ burial.site_ref }}
            </router-link>
          </v-col>
          <v-col cols="5" sm="2" order="1" order-sm="3" class="text-body-1 d-flex pt-0 pr-2 justify-end align-center">
            <span>
              <template v-if="burial.flag" >
                <v-chip class="mr-2" color="red">
                  <span class="text-body-1 font-weight-bold">Flag</span>
                </v-chip>
              </template>
              <v-chip
                small
                v-bind:color="burialStatusColor(burial.burial_status_ref)"
                @click="$router.push({name: 'Burial', params: {burial_id: value}})"
              >
                <span class="text-body-1 font-weight-bold">{{ burial.burial_status}}</span>
              </v-chip>
            </span>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col cols="12" class="pt-0 pb-0">
            Burial {{ value }}
          </v-col>
        </v-row>
      </v-expansion-panel-header>
      <v-expansion-panel-content class="text-body-1">
        <v-row>
          <v-col cols="12" sm="6" md="4" class="pt-1 pb-0">
            <template v-if="burial">
              <div :class="burialDateClass(burial)">
                Burial Date: <b>{{ formatD(burial.burial_date) }}</b>
              </div>
              <div v-if="burial.burial_slot_id" :class="burialDateClass(burial)">
                Burial Slot: <b>{{burialSlot}}</b>
              </div>
              <div>
                <span v-if="burial.deceased_birth_date">
                  Born: <b> <span>{{ formatD(burial.deceased_birth_date) }} </span></b>
                </span>
              </div>
              <div>
                <span v-if="burial.death_date">
                  Died: <b> <span>{{ formatD(burial.death_date) }} </span></b>
                </span>
                <span v-if="burial.deceased_age">
                  , age: <b>{{burial.deceased_age}}</b>
                </span>
              <div v-if="burial.is_legacy"><b>Legacy Burial</b></div>
              <div v-if="burial.is_legacy">Legacy address: {{burial.legacy_address}}</div>
              <div v-if="burial.legacy_address_dirty">Legacy suspect flag: {{burial.legacy_address_dirty}}</div>
              <div v-if="burial.legacy_address_dirty">Suspect address: {{burial.suspect_address}}</div>
              <div v-if="burial.cod_is_bid"><b>Brought in dead</b></div>
                <div>
                  <document
                    cols="12"
                    parentObject="burial"
                    :readonly="true"
                    :download="this.$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
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
                    :download="this.$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
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
                    :download="this.$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                    :customerId="burial.customer_id"
                    :parentObjectId="burial.burial_id"
                    documentPropertyRef="BURIAL_CERTIFICATE"
                    />
                </div>
              </div>
            </template>
            <v-skeleton-loader
              v-else
              type="article"
            ></v-skeleton-loader>
          </v-col>
          <v-col cols="12" sm="6" md="4" class="pt-1 pb-0">
            <template>
              <customer-details v-if="burial" v-model="burial.customer_id" expand />
              <v-skeleton-loader
                v-else
                type="article"
              ></v-skeleton-loader>
            </template>
          </v-col>
          <v-col cols="12" sm="6" md="4" class="pt-1 pb-0">
            <template v-if="burial">
              <div>
                Sale no: <b>
                <router-link v-if="this.$userCheckPermission('PERM_VIEW')" :to="{ name: 'Sale', params: { sale_id: burial.sale_id }}">{{ burial.sale_id }}</router-link><span v-else>{{ burial.sale_id }}</span>
                <span v-if="this.$userCheckPermission('PERM_VIEW')"> {{formatMInt(burial.sale_value)}} </span>
                <span :style="`color:${saleStatusColor(burial.sale_status_ref)};`">({{ burial.sale_status }})</span>
                </b>
              </div>
              <div>Burial no:<b> {{ burial.burial_id}}</b></div>
              <div>Site Type:<b> {{ burial.site_type}}</b></div>
              <template v-if="burial.site_id">
                <div>Site:<b> <site-map-popup :site="burial" />
                  <router-link :to="{ name: 'Site', params: { site_id: burial.site_id }}"><b>{{ burial.site_ref }}</b></router-link>
                </b>
                </div>
              </template>
              <template v-else>
                <div><b>Site:</b> Not selected </div>
              </template>
              <div v-if="burial.undertaker_name"><b>Undertaker:</b> {{ burial.undertaker_name}}</div>
              <div v-if="burial.show_public && this.burial.deceased_last_name && burial.site_id">
                <v-icon class="mr-2" small>mdi-open-in-new</v-icon><a :href="publicUrl" target="_blank">Public burial page</a><v-icon v-if="shareAvailable" class="ml-2" @click="share">mdi-share-variant</v-icon>
              </div>
            </template>
            <v-skeleton-loader
              v-else
              type="article"
            ></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-if="burial" cols="12" class="pt-0 pb-0 d-flex flex-wrap justify-end align-content-end caption">
            <span>
              <span><b>Created:&nbsp;</b>{{formatT(burial.created_at)}}</span>
              <span><b> Updated:&nbsp;</b>{{formatT(burial.updated_at)}}</span>
              <span>
                <b>, by&nbsp;</b>
                <router-link v-if="$userCheckPermission('PERM_USERS_VIEW')" :to="{name: 'User', params: {user_id: burial.updated_by_id}}">{{burial.updated_by}}</router-link>
                <span v-else>{{burial.updated_by}}</span>
              </span>
            </span>
          </v-col>
        </v-row>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

</template>

<script>
import CustomerDetails from '@/components/customer/CustomerDetails'
import { Interval, DateTime } from 'luxon'
import SiteMapPopup from '@/components/sites/SiteMapPopup'
import Document from '@/components/shared/Document'
import ErrorDisp from '@/components/shared/Error'

export default {
  name: 'BurialsSearchResult',
  components: {
    CustomerDetails,
    SiteMapPopup,
    Document,
    ErrorDisp
  },
  props: {
    value: Number,
    expand: Boolean,
    flat: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      burial: null,
      error: null,
      expandIndex: null
    }
  },
  created () {
    if (this.expand) { this.expandIndex = 0 }
  },
  computed: {
    deceasedAge () {
      if (this.burial) {
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
      } else {
        return ''
      }
    },
    publicUrl () {
      if (this.burial) {
        return `${this.$config.PUBLIC_PORTAL}/burial/${this.burial.public_id}`
      } else {
        return ''
      }
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
    burialSlot () {
      if (this.burial) {
        return this.formatSlot(this.burial.burial_slot_from) + ' - ' + this.formatSlot(this.burial.burial_slot_to)
      } else {
        return ''
      }
    },
    deceasedName () {
      let name = ''
      if (this.burial) {
        if (this.burial.deceased_first_name || this.burial.deceased_last_name) {
          if (this.burial.deceased_salutation) { name += this.burial.deceased_salutation + ' ' }
          if (this.burial.deceased_first_name) { name += this.burial.deceased_first_name + ' ' }
          if (this.burial.deceased_middle_name) { name += this.burial.deceased_middle_name + ' ' }
          if (this.burial.deceased_last_name) { name += this.burial.deceased_last_name }
        } else {
          name = 'Unknown Deceased'
        }
      }
      return name
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: function (newVal) {
        if (newVal == null) return
        this.secureGet('/api/v1/burials/' + newVal)
          .then(res => {
            this.burial = res.data
          })
          .catch(err => {
            this.error = err
          })
      }
    }
  },
  methods: {
    share () {
      if (navigator.share) {
        navigator.share({
          title: 'Burial of ' + this.deceasedName + '. ' + this.dateTime + '.',
          url: this.publicUrl
        })
      }
    },
    burialDateClass (burial) {
      if (burial.burial_status_ref !== 'COMPLETE' && DateTime.fromISO(burial.burial_date).startOf('day') < DateTime.local().startOf('day')) { return 'red--text' }
      if (burial.burial_status_ref !== 'COMPLETE' && DateTime.fromISO(burial.burial_date).hasSame(DateTime.local(), 'day')) { return 'font-weight-bold green--text' }
    }
  }
}
</script>

<style scoped>
</style>
