<template>
    <v-row align="center" justify="center">
      <v-col cols="12"><error-disp v-model="error"/></v-col>

      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Site Works Order: <span v-if="sitework" class="text-h6">&nbsp;{{ sitework.sitework_id }}</span>
            <v-chip
              v-if="sitework"
              class="ml-auto mr-2"
              v-bind:color="siteworkStatusColor(sitework.sitework_status_ref)"
            >{{ sitework.sitework_status }}</v-chip>
          </v-card-title>

          <template v-if="sitework">
            <v-card-text>
              <v-row>
                <v-col cols="12" class="pt-5">
                  <site-details-slim :value="sitework.site_id" />
                </v-col>
              </v-row>
              <v-row><v-divider/></v-row>
              <v-row v-if="sitework.sitework_status_ref == 'CONFIRMED'" class="mt-5 mb-5 ml-2">
                <v-col cols="12" sm="6" md="4" class="pl-3 pb-0">
                  <div v-if="$userCheckPermission('PERM_WORKS')">
                    <v-icon color="primary" class="pr-3 text-h5">mdi-download</v-icon>
                    <a @click="generateWorksOrder" class="text-body-1">Download Site Work Order</a>
                  </div>
                </v-col>
              </v-row>
              <v-row v-if="sitework.sitework_status_ref == 'COMPLETE'" class="mt-5 mb-5 ml-2">
                <v-col cols="12" sm="6" md="4" class="pl-3 pb-0">
                    <document
                      cols="12"
                      parentObject="sitework"
                      :readonly="true"
                      :download="$userCheckPermission('PERM_VIEW')"
                      :customerId="sitework.customer_id"
                      :parentObjectId="sitework.sitework_id"
                      documentPropertyRef="SITE_WORK_CONFIRMATION"
                      />
                </v-col>
              </v-row>
              <v-row><v-divider/></v-row>
              <v-row class="mt-5 ml-2">
                <v-col cols="12" class="text-body-1 pl-5 pt-1 pb-1">
                  Works Date: <span
                v-if="sitework.sitework_time"
                :class="{ 'red--text': isSiteworkOverdue }"
              ><b>{{ formatT(sitework.sitework_time) }}</b></span>
                </v-col>
                <v-col cols="12" class="text-body-1 pl-5 pt-1 pb-1">
                  Grave No: <b>{{ sitework.grave_no }}</b>
                </v-col>
                <v-col cols="12" class="text-body-1 pl-5 pt-1 pb-1">
                  Type: <b>{{ sitework.sitework_type }}</b>
                </v-col>
                <v-col cols="12" class="text-body-1 pl-5 pt-1 pb-1">
                  Contractor: <b>{{ sitework.contractor_name }}</b>
                </v-col>
                <v-col cols="12" class="text-body-1 pl-5 pt-1 pb-1">
                  Description: <b>{{ sitework.description}}</b>
                </v-col>
                <v-col v-if="sitework.lines && sitework.lines.length" cols="12" class="pl-5 pt-3 pb-1">
                  <v-simple-table dense class="sitework-lines-table">
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left text-body-1">Charges:</th>
                          <th class="text-right text-body-1"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="line in sitework.lines" :key="line.sitework_line_id || line.line_description">
                          <td class="text-body-1">{{ line.line_description }}</td>
                          <td class="text-right text-body-1">{{ formatM(line.line_value || 0) }}</td>
                        </tr>
                        <tr class="text-body-1">
                          <td class="text-body-1"><b>Total</b></td>
                          <td class="text-right text-body-1"><b>{{ formatM(sitework.value || 0) }}</b></td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
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
                dark
                v-if="canUnconfirm"
                @click="doUnconfirm"
              >
                Unconfirm
              </v-btn>
              <v-btn
                color="primary"
                dark
                v-if="canComplete"
                @click="siteworkConfirm = true"
              >
                Mark Complete
              </v-btn>
            </v-card-actions>
          </template>
          <v-skeleton-loader v-else class="mx-auto" type="article"></v-skeleton-loader>
        </v-card>

        <v-dialog v-if="sitework" v-model="siteworkConfirm" persistent max-width="800">
          <v-card class="elevation-4">
            <v-card-title class="primary white--text">
              Confirm Site Work Completion
            </v-card-title>
            <v-card-text class="pt-3">
              Upload a confirmation document to mark this site work as complete.
            </v-card-text>
            <v-card-text>
              <v-form>
                <v-row no-gutters>
                  <v-col cols="12" class="pb-0 text-subtitle-1">
                    <b>Works Date: </b>{{ formatT(sitework.sitework_time) }}
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12" class="pt-0">
                    <document
                      cols="12"
                      label="Site work confirmation"
                      :error-messages="confirmationDocumentErrors"
                      parentObject="sitework"
                      :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                      v-model="confirmationDocumentId"
                      :customerId="sitework.customer_id"
                      :parentObjectId="sitework.sitework_id"
                      documentPropertyRef="SITE_WORK_CONFIRMATION"/>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="siteworkConfirm = false">Cancel</v-btn>
              <v-btn color="primary" :disabled="!confirmationDocumentId" @click="markComplete()">Ok</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
      <v-col v-if="sitework" cols="12" md="11" lg="8">
        <v-row align="center" justify="center">
          <v-col cols="12">
            <notes
              :customerId="sitework.customer_id"
              :objects="sitework.objects"
              :readonly="!$userCheckPermission('PERM_WORKS')"
              :parentObjectId="sitework.sitework_id"
              parentObjectType="sitework"/>
          </v-col>
        </v-row>
      </v-col>
      <v-col v-if="sitework" cols="12" md="11" lg="8">
        <documents
          ref="documents"
          :readonly="!$userCheckPermission('PERM_WORKS')"
          :customerId="sitework.customer_id"
          :objects="sitework.objects"
          :parentObjectId="sitework.sitework_id"
          parentObjectType="sitework"/>
      </v-col>
      <v-col v-if="sitework" cols="12" md="11" lg="8">
        <audit parentObjectType="sitework" v-bind:parentObjectId="sitework.sitework_id"/>
      </v-col>

      <v-col v-if="sitework" cols="12" md="11" lg="8" class="pt-0 pb-0 d-flex flex-wrap justify-end align-content-end caption">
        <span class="caption"><b>Created:&nbsp;</b>{{formatT(sitework.created_at)}}</span>
        <span v-if="sitework.updated_at" class="caption"><b>,&nbsp;Updated:&nbsp;</b>{{formatT(sitework.updated_at)}}</span>
        <span v-if="sitework.updated_by_id">
          <b>, by&nbsp;</b>
          <router-link v-if="$userCheckPermission('PERM_USERS_VIEW')" :to="{name: 'User', params: {user_id: sitework.updated_by_id}}">{{sitework.updated_by}}</router-link>
          <span v-else>{{sitework.updated_by}}</span>
        </span>
      </v-col>
    </v-row>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import CustomerDetails from '@/components/customer/CustomerDetails'
import SiteDetailsSlim from '@/components/sites/SiteDetailsSlim'
import Audit from '@/components/shared/Audit'
import Notes from '@/components/notes/Notes'
import Documents from '@/components/shared/Documents'
import Document from '@/components/shared/Document'
import { required } from 'vuelidate/lib/validators'
import { DateTime } from 'luxon'

export default {
  name: 'tSitework',
  components: {
    ErrorDisp,
    CustomerDetails,
    SiteDetailsSlim,
    Audit,
    Notes,
    Documents,
    Document
  },
  data () {
    return {
      sitework: null,
      confirmationDocumentId: null,
      siteworkConfirm: false,
      error: null,
      loading: true
    }
  },
  validations: {
    confirmationDocumentId: { required }
  },
  computed: {
    isSiteworkOverdue () {
      if (!this.sitework || !this.sitework.sitework_time) {
        return false
      }

      if (this.sitework.sitework_status_ref === 'COMPLETE') {
        return false
      }

      const siteworkTime = DateTime.fromISO(this.sitework.sitework_time)
      return siteworkTime.isValid && siteworkTime < DateTime.now()
    },
    canUnconfirm () {
      if (!this.sitework) return false
      if (this.sitework.sitework_status_ref !== 'CONFIRMED') return false
      if (this.sitework.legacy) return false
      return this.$userCheckPermission('PERM_WORKS')
    },
    canComplete () {
      if (!this.sitework) return false
      if (this.sitework.sitework_status_ref !== 'CONFIRMED') return false
      return this.$userCheckPermission('PERM_WORKS')
    },
    confirmationDocumentErrors () {
      const errors = []
      if (!this.$v.confirmationDocumentId.$dirty) return errors
      !this.$v.confirmationDocumentId.required && errors.push('An uploaded site work confirmation document is required.')
      return errors
    }
  },
  async created () {
    try {
      this.sitework = (await this.secureGet('/api/v1/siteworks/' + this.$route.params.sitework_id)).data
      this.sitework.objects = [{parentObjectType: 'sitework', parentObjectId: this.sitework.sitework_id}]

      // If the sitework status is DRAFT, redirect to new page
      if (this.sitework.sitework_status_ref == 'DRAFT') {
        this.$router.replace({name: 'New Sitework', params: { sitework_id: this.sitework.sitework_id }})
        return
      }
      this.loading = false

    } catch (error) {
      this.error = error
    }
  },
  methods: {
    doUnconfirm () {
      this.securePut('/api/v1/siteworks/' + this.sitework.sitework_id + '/unconfirm')
        .then(res => {
          this.$router.replace({name: 'New Sitework', params: { sitework_id: this.sitework.sitework_id }})
        })
        .catch(error => { this.error = error })
    },
    doComplete () {
      this.securePut('/api/v1/siteworks/' + this.sitework.sitework_id + '/complete')
        .then(res => {
          // Reload the page
          this.$router.go()
        })
        .catch(error => { this.error = error })
    },
    markComplete () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.doComplete()
        this.siteworkConfirm = false
        if (this.$refs.documents && typeof this.$refs.documents.reloadDocuments === 'function') {
          this.$refs.documents.reloadDocuments()
        }
      }
    },
    generateWorksOrder () {
      this.securePost(
        '/api/v1/siteworks/' + this.sitework.sitework_id + '/generate_works_order')
        .then(response => {
          const url = this.$config.API_URL + '/asset/sitework/' + this.sitework.sitework_id + '/' + this.sitework.sitework_id + '_Site_Work_Order.pdf'
          window.open(url, '_blank')
          if (this.$refs.documents && typeof this.$refs.documents.reloadDocuments === 'function') {
            this.$refs.documents.reloadDocuments()
          }
        })
        .catch((error) => { this.error = error })
    }
  }
}

</script>

<style scoped>
.sitework-lines-table {
  max-width: 520px;
}
</style>
