<template>
    <v-row align="center" justify="center">
      <v-col cols="12"><error-disp v-model="error"/></v-col>

      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            New Site Work No: <span v-if="sitework" class="text-h6">&nbsp;{{ sitework.sitework_id }}</span>
            <v-chip
              v-if="sitework"
              class="ml-auto mr-2"
              v-bind:color="siteworkStatusColor(sitework.sitework_status_ref)"
            >{{ sitework.sitework_status }}</v-chip>
          </v-card-title>
          <template v-if="sitework">
            <v-card-text class="">
              <v-row class="pt-5">
                <v-col cols="12" class="pt-5">
                  <site-details-slim :value="sitework.site_id" />
                </v-col>
              </v-row>
              <v-row class=""><v-divider></v-divider></v-row>
            </v-card-text>
            <v-card-text class="ml-5">
              <v-row v-if="currentSiteworkCharge">
                <v-col cols="12" md="4" lg="3" class="pl-5 pt-5">
                  <div class="text-body-1">
                    Site Work Charge: <b>{{ formatM(currentSiteworkCharge.price) }}</b>
                  </div>
                </v-col>
                <v-col cols="12" md="4" lg="3" class="pl-5 pt-5">
                  <div class="text-body-1">
                    Express Surcharge: <b>{{ formatM(currentSiteworkCharge.surcharge_express) }}</b>
                  </div>
                </v-col>
                <v-col cols="12" md="4" lg="4" class="pl-5">
                  <v-checkbox
                    v-model="sitework.express"
                    label="Enable Express Surcharge"
                    dense
                    hide-details
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-row class="pb-5"><v-divider></v-divider></v-row>
              <v-row>

              </v-row>
              <v-row class="pt-5">
                <v-col class="pl-5" cols="12" sm="5" md="4" lg="3">
                  <v-select
                    v-model="sitework.sitework_type_id"
                    :items="siteworkTypes"
                    item-text="sitework_type"
                    item-value="sitework_type_id"
                    label="Site Work Type"
                    :error-messages="siteworkTypeErrors"
                    @change="$v.sitework.sitework_type_id.$touch()"
                    dense
                  ></v-select>
                </v-col>
                <v-col class="pl-5" cols="12" sm="7" md="5" lg="4">
                  <v-select
                    v-model="sitework.contractor_id"
                    :items="contractors"
                    item-text="name"
                    item-value="contractor_id"
                    label="Contractor"
                    :error-messages="contractorErrors"
                    @change="$v.sitework.contractor_id.$touch()"
                    dense
                  ></v-select>
                </v-col>
                <v-col class="pl-5" cols="12" sm="4" md="3" lg="2">
                  <v-select
                    v-model="sitework.grave_no"
                    :items="graveNoOptions"
                    label="Grave No"
                    dense
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6" lg="4" class="pl-5">
                  <v-menu
                    v-model="menuWorksDate"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        dense
                        v-model="formatWorksDate"
                        label="Works Date"
                        prepend-icon="mdi-calendar"
                        :error-messages="worksDateErrors"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      :min="minDate"
                      :max="maxDate"
                      v-model="worksDate"
                      @input="worksDateSelect()"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" md="4" lg="3" class="pl-5">
                  <v-menu
                    v-model="menuWorksTime"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        dense
                        v-model="formatWorksTime"
                        label="Works Time"
                        class="mr-10"
                        :error-messages="worksTimeErrors"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-model="worksTime"
                      :allowed-hours="[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]"
                      :allowed-minutes="[0, 30]"
                      format="24hr"
                      @input="worksTimeSelect()"
                    ></v-time-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row>
                <v-col class="pl-5" cols="12" sm="10" md="8" lg="7">
                  <v-textarea
                    v-model="sitework.description"
                    label="Description"
                    rows="2"
                    :error-messages="descriptionErrors"
                    @input="$v.sitework.description.$touch()"
                    @blur="$v.sitework.description.$touch()"
                    dense
                    auto-grow
                  ></v-textarea>
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
                dark
                :disabled="pending"
                v-if="canCreate"
                @click="doCreate"
              >
                Confirm
              </v-btn>
            </v-card-actions>
          </template>
          <v-skeleton-loader v-else class="mx-auto" type="article"></v-skeleton-loader>
        </v-card>
      </v-col>
      <!-- NOTES -->
      <v-col v-if="sitework" cols="12" md="11" lg="8">
        <v-row align="center" justify="center">
          <v-col cols="12">
            <notes
              :customerId="sitework.customer_id"
              :objects="sitework.objects"
              :readonly="!$userCheckPermission('PERM_EDIT')"
              :parentObjectId="sitework.sitework_id"
              parentObjectType="sitework"/>
          </v-col>
        </v-row>
      </v-col>
      <!-- AUDIT -->
      <v-col v-if="sitework" cols="12" md="11" lg="8">
        <audit parentObjectType="sitework" v-bind:parentObjectId="sitework.sitework_id"/>
      </v-col>
      <!-- OBJECT CREATED UPDATED -->
      <v-col v-if="sitework" cols="12" md="11" lg="8" class="pt-0 pb-0 d-flex flex-wrap justify-end align-content-end caption">
        <span class="caption"><b>Created:&nbsp;</b>{{formatT(sitework.created_at)}}</span>
        <span v-if="sitework.updated_at" class="caption"><b>,&nbsp;Updated:&nbsp;</b>{{formatT(sitework.updated_at)}}</span>
        <span v-if="sitework.updated_by_id">
          <b>, by&nbsp;</b>
          <router-link v-if="$userCheckPermission('PERM_USERS_VIEW')" :to="{name: 'User', params: {user_id: sitework.updated_by_id}}">{{sitework.updated_by}}</router-link>
          <span v-else>{{sitework.updated_by}}</span>
        </span>
      </v-col>
      <!-- DELETE CONFIRMATION DIALOG -->
      <v-dialog v-model="deleteDialog" max-width="500">
        <v-card>
          <v-card-title class="error white--text">
            Confirm Delete
          </v-card-title>
          <v-card-text class="pt-5">
            <p class="text-body-1">Are you sure you want to delete this site work order?</p>
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
import SiteDetailsSlim from '@/components/sites/SiteDetailsSlim'
import { required, integer, decimal, minValue, maxValue } from 'vuelidate/lib/validators'
import Notes from '@/components/notes/Notes'
import { DateTime } from 'luxon'

export default {
  name: 'tSiteworkNew',
  components: {
    ErrorDisp,
    Audit,
    CustomerDetails,
    SiteDetailsSlim,
    Notes
  },
  data () {
    return {
      sitework: null,
      siteType: null,
      contractors: null,
      siteworkTypes: null,
      siteworkCharge: null,
      worksDate: null,
      worksTime: null,
      menuWorksDate: false,
      menuWorksTime: false,
      error: null,
      deleteDialog: false,
      loading: true,
      pending: false
    }
  },
  validations: {
    sitework: {
      sitework_type_id: {
        required
      },
      contractor_id: {
        required
      },
      description: {
        required
      }
    },
    worksDate: {
      required
    },
    worksTime: {
      required
    }
  },
  computed: {
    canCreate () {
      return this.sitework
    },
    minDate () {
      return DateTime.now().minus({ days: 1 }).toISODate()
    },
    maxDate () {
      return DateTime.now().plus({ month: 2 }).toISODate()
    },
    formatWorksDate () {
      if (this.worksDate) {
        return this.formatD(this.worksDate)
      }
      return ''
    },
    formatWorksTime () {
      if (this.worksTime) {
        return this.formatT(this.worksTime)
      }
      return ''
    },
    currentSiteworkCharge () {
      if (Array.isArray(this.siteworkCharge)) {
        return this.siteworkCharge[0] || null
      }
      return this.siteworkCharge
    },
    graveNoOptions () {
      const graves = Number(this.siteType?.graves || 0)
      return Array.from({ length: graves }, (_, index) => index + 1)
    },
    siteworkTypeErrors () {
      const errors = []
      if (!this.$v || !this.$v.sitework || !this.$v.sitework.sitework_type_id.$dirty) return errors
      !this.$v.sitework.sitework_type_id.required && errors.push('Site work type is required')
      return errors
    },
    contractorErrors () {
      const errors = []
      if (!this.$v || !this.$v.sitework || !this.$v.sitework.contractor_id.$dirty) return errors
      !this.$v.sitework.contractor_id.required && errors.push('Contractor is required')
      return errors
    },
    worksDateErrors () {
      const errors = []
      if (!this.$v || !this.$v.worksDate.$dirty) return errors
      !this.$v.worksDate.required && errors.push('Works date is required')
      return errors
    },
    worksTimeErrors () {
      const errors = []
      if (!this.$v || !this.$v.worksTime.$dirty) return errors
      !this.$v.worksTime.required && errors.push('Works time is required')
      return errors
    },
    descriptionErrors () {
      const errors = []
      if (!this.$v || !this.$v.sitework || !this.$v.sitework.description.$dirty) return errors
      !this.$v.sitework.description.required && errors.push('Description is required')
      return errors
    }
  },
  async created () {
    try {

      // Get the list of sitework types for the dropdown
      this.secureGet('/api/v1/sitework_types')
        .then(res => {
          this.siteworkTypes = res.data
        })
        .catch((error) => { this.error = error })

      // Get the list of contractors for the dropdown
      this.secureGet('/api/v1/sitework_contractors')
        .then(res => {
          this.contractors = res.data
        })
        .catch((error) => { this.error = error })

      this.sitework = (await this.secureGet('/api/v1/siteworks/' + this.$route.params.sitework_id)).data

      // If the sitework status is not DRAFT, redirect to view page
      if (this.sitework.sitework_status_ref !== 'DRAFT') {
        this.$router.replace({name: 'Sitework', params: { sitework_id: this.sitework.sitework_id }})
        return
      }

      this.sitework.objects = [{parentObjectType: 'sitework', parentObjectId: this.sitework.sitework_id}]

      if (this.sitework.sitework_time) {
        const siteworkDateTime = DateTime.fromISO(this.sitework.sitework_time)
        if (siteworkDateTime.isValid) {
          this.worksDate = siteworkDateTime.toISODate()
          this.worksTime = siteworkDateTime.toFormat('HH:mm')
        }
      }

      // Get the charge for this sitework type and site type
      this.siteworkCharge = (await this.secureGet(`/api/v1/site_types/${this.sitework.site_type_id}/sitework_charges`)).data

      // Get the site type to determine how many graves are available
      this.siteType = (await this.secureGet(`/api/v1/site_types/${this.sitework.site_type_id}`)).data

      if (!this.sitework.grave_no && this.siteType && this.siteType.graves > 0) {
        this.sitework.grave_no = 1
      }

      this.loading = false

    } catch (error) {
      this.error = error
    }
  },
  methods: {
    doCreate () {
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }

      this.pending = true
      this.error = null

      this.securePut('/api/v1/siteworks/' + this.sitework.sitework_id + '/confirm', this.sitework)
        .then(res => {
          this.$router.replace({name: 'Sitework', params: { sitework_id: this.sitework.sitework_id }})
        })
        .catch((error) => { this.error = error })
        .finally(() => { this.pending = false })
    },
    confirmDelete () {
      this.deleteDialog = false
      this.secureDelete('/api/v1/siteworks/' + this.sitework.sitework_id)
        .then(res => {
          this.$router.replace({name: 'Site', params: { site_id: this.sitework.site_id }})
        })
        .catch((error) => { this.error = error })
    },
    worksDateSelect () {
      this.menuWorksDate = false
      this.$v.worksDate.$touch()
      this.updateSiteworkTime()
    },
    worksTimeSelect () {
      this.menuWorksTime = false
      this.$v.worksTime.$touch()
      this.updateSiteworkTime()
    },
    updateSiteworkTime () {
      if (!this.worksDate || !this.worksTime) {
        this.sitework.sitework_time = null
        return
      }

      this.sitework.sitework_time = DateTime.fromISO(this.worksDate + 'T' + this.worksTime)
        .toISO()
    }
  }
}

</script>
