<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            <span>Site</span>
            <v-spacer/>
             <v-switch
              dense
              dark
              hide-details
              :disabled="!site.flag || !flagEnabled()"
              :color="site.verified ? 'green':'white'"
              class="mb-0 pt-0 pb-0 mt-1 mr-7"
              v-if="site"
              v-model="site.verified"
              :label=" site.verified ? 'Verified' : 'Verify site?'"
              @click="verified()"
            />
            <v-switch
              dense
              dark
              hide-details
              :disabled="!flagEnabled()"
              :color="site.flag ? 'red':'white'"
              class="mb-0 pt-0 pb-0 mt-1 mr-7"
              v-if="site"
              v-model="site.flag"
              label="Flagged site?"
              @click="flagged()"
            />
            <span v-if="site">{{ site.site_ref }}</span>
          </v-card-title>
          <site-details v-model="site_id" :reload="reloadDetails" hide-ref/>
        </v-card>
      </v-col>
    </v-row>

    <!--SITE WORKS-->
    <v-row v-if="site && site.customer_id" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="secondary pb-2">
            Site works
            <v-spacer/>
            <v-btn
              v-if="$userCheckPermission('PERM_WORKS')"
              icon
              title="Add a new site work order."
              color="primary"
              @click="createSitework"
            >
              <v-icon>mdi-plus-circle</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="text-body-1">
            <template v-if="siteworks">
              <div v-if="siteworks.length>0" v-for="(sitework, indx) in siteworks" :key="indx">
                <sitework-search-result :suppress-site-details="true" v-model="sitework.sitework_id"/>
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

    <!--NOTES-->
    <v-row  v-if="site" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <notes
          v-if="burials"
          :forceAdd="addNote"
          :objects="noteObjects"
          :parentObjectId="site.site_id"
          parentObjectType="site"/>
      </v-col>
    </v-row>

    <!--PHOTOS-->
    <v-row  v-if="site" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <photos
          :siteId="site.site_id"
          :siteRef="site.site_ref" />
      </v-col>
    </v-row>

    <!--CHANGE SITE TYPE-->
    <v-row  v-if="site && $userCheckPermission('PERM_SITES') && burials && burials.length == 0" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header class="secondary text-h6">
              <span>Change Site Type</span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row v-if="site">
                <v-col cols="12" sm="6">
                  <v-select
                    label="Site type"
                    :items="siteTypes"
                    v-model="selectSiteType"
                    item-text="site_type"
                    return-object
                    item-value="site_type_id"
                  />
                </v-col>
                <v-col cols="2">
                  <v-dialog
                    v-model="typeChangeDialog"
                    persistent
                    max-width="290"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        class="mr-5 mt-6 ml-5"
                        color="primary"
                        v-bind="attrs"
                        v-on="on">Update</v-btn>
                    </template>
                    <v-card>
                      <v-card-title class="headline">
                        Update Site Type
                      </v-card-title>
                      <v-card-text>Are you sure you want to update the site type for this site?</v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary"
                          text
                          @click="typeChangeDialog = false"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          color="primary"
                          text
                          @click="doTypeChange"
                        >
                          Confirm Change
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

    <!--UNSUITABILITY-->
    <v-row  v-if="$userCheckPermission('PERM_SITES') && burials && burials.length == 0" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header class="secondary text-h6">
              <span>Unsuitability</span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-if="unsuitabilities && site"
                :disabled="!((site.site_status_ref==='UNSUITABLE' || site.site_status_ref==='UNAVAIL'  || site.site_status_ref==='AVAIL'))"
                :items="unsuitabilities"
                item-text="site_unsuitability"
                item-value="site_unsuitability_id"
                v-model="site.site_unsuitability_id"
                label="Mark site unsuitable"
                @change="doUnsuitable"/>
            </v-col>
          </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <audit v-if="site" parentObjectType="site" v-bind:parentObjectId="site.site_id"/>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import SiteDetails from '@/components/sites/SiteDetails'
import SiteworkSearchResult from '@/components/siteworks/SiteworkSearchResult.vue'
import Audit from '@/components/shared/Audit'
import Notes from '@/components/notes/Notes'
import Photos from '@/components/photos/Photos'

export default {
  name: 'tSite',
  components: {
    SiteDetails,
    SiteworkSearchResult,
    ErrorDisp,
    Audit,
    Notes,
    Photos
  },
  data () {
    return {
      site_id: null,
      site: null,
      burials: null,
      error: null,
      siteTypes: null,
      unsuitabilities: [],
      selectSiteType: {},
      typeChangeDialog: false,
      reloadDetails: false,
      addNote: false,
      siteworks: null
    }
  },
  created () {
    if (this.$route.params.site_id) {
      this.site_id = this.$route.params.site_id
      this.secureGet('/api/v1/sites/' + this.site_id)
        .then(res => {
          this.site = res.data
          this.selectSiteType.site_type_id = this.site.site_type_id
          this.secureGet('/api/v1/sites/' + this.site.site_id + '/burials')
            .then(res => {
              this.burials = res.data
            })
            .catch(error => { this.error = error })
          this.secureGet('/api/v1/unsuitability')
          return this.secureGet('/api/v1/unsuitability')
        })
        .then(uns => {
          this.unsuitabilities = uns.data
          if (this.site.site_unsuitability_id) {
            this.unsuitabilities.unshift({site_unsuitability_id: null, site_unsuitability: 'CLEAR UNSUITABILITY'})
          }
        })
        .catch(err => { this.error = err })
    }
    this.secureGet('/api/v1/sites/' + this.site_id + '/siteworks')
      .then(res => {
        this.siteworks = res.data
      })
      .catch(err => { this.error = err })
    this.secureGet('/api/v1/site_types')
      .then(res => {
        this.siteTypes = res.data
      })
      .catch(err => { this.error = err })
  },
  computed: {
    canAddSitework () {
      if (!this.site) return false
      if (this.site.site_status_ref!=='OWNED') return false
      return true
    },
    noteObjects () {
      let objs = []
      if (this.site) {
        objs = [{parentObjectType: 'site', parentObjectId: this.site.site_id}]
        if (this.burials) {
          this.burials.forEach(burial => {
            objs.push({parentObjectType: 'burial', parentObjectId: burial.burial_id})
          })
        }
        if (this.siteworks) {
          this.siteworks.forEach(sitework => {
            objs.push({parentObjectType: 'sitework', parentObjectId: sitework.sitework_id})
          })
        }
      }
      return objs
    }
  },
  methods: {
    doUnsuitable () {
      this.securePut('/api/v1/sites/' + this.site.site_id + '/unsuitability', {site_unsuitability_id: this.site.site_unsuitability_id})
        .then(res => {
          this.reloadDetails = !this.reloadDetails
          if (this.site.site_unsuitability_id) {
            this.unsuitabilities.unshift({site_unsuitability_id: null, site_unsuitability: 'CLEAR UNSUITABILITY'})
          } else {
            this.unsuitabilities.shift()
          }
        })
        .catch((error) => { this.error = error })
    },
    flagged () {
      if (this.site.flag) { this.addNote = !this.addNote }
      this.securePut('/api/v1/sites/' + this.site.site_id + '/flag')
        .then(() => {
          this.reloadDetails = !this.reloadDetails
        })
        .catch((error) => { this.error = error })
    },
    flagEnabled () {
      if (this.site.flag) {
        return this.$userCheckPermission('PERM_SALES_SUPER')
      } else {
        return (this.$userCheckPermission('PERM_SITES') || this.$userCheckPermission('PERM_SALES_SUPER'))
      }
    },
    verified () {
      this.site.flag = false
      this.$http.secured.put('/api/v1/sites/' + this.site.site_id + '/verify')
        .then(() => {
          this.reloadDetails = !this.reloadDetails
        })
        .catch((error) => { this.error = error })
    },
    doTypeChange () {
      this.typeChangeDialog = false
      this.securePut('/api/v1/sites/' + this.site.site_id + '/update_type', {site_type_id: this.selectSiteType.site_type_id})
        .then(res => {
          this.$router.go()
        })
        .catch(err => { this.error = err })
    },
    createSitework () {
      this.pending = true
      this.securePost('/api/v1/siteworks/', {site_id: this.site.site_id})
        .then((res) => {
          this.$router.replace({name: 'New Sitework', params: { sitework_id: res.data.sitework_id }})
        })
        .catch((error) => { this.error = error })
    }
  },
  watch: {
  }
}
</script>

<style scoped>

</style>
