<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <template>
      <v-card class="elevation-4">
        <v-card-title class="primary white--text pt-2 pb-3">
          <v-row no-gutters>
            <v-col cols="5">
              <span>
                <site-map-popup v-if="geometries && geometries.length>0" :dark="true" :highlight-geometries="geometries" />
                <router-link :to="{name: 'Calendar'}" class="white--text">Burials: {{burialCount}}</router-link>
              </span>
            </v-col>
        
            <v-col cols="7">
              <v-btn
                icon
                @click="scheduleDateDown"
                color="white"
                v-if="!hideNav"
              >
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <span>{{formatD(date)}}</span>
              <v-btn
                icon
                @click="scheduleDateUp"
                color="white"
                v-if="!hideNav"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text v-if="loaded" class="mt-2">
          <template v-for="slot in slots">
          <v-card v-if="slot.burials.length>0" :key="slot.slot_id" class="elevation-0 mb-2">
            <v-card-title class="secondary text-h6 pt-2 pb-2">
              {{slot.description}} {{formatSlot(slot.from)}} - {{formatSlot(slot.to)}}
              <v-spacer/>
              {{slot.burials.length}} burials
            </v-card-title>
            <v-card-text class="pl-4 pr-4 ">
              <v-row  v-for="burial in slot.burials" :key="burial.burial_id">
                <v-col cols="12" class="mb-0 pb-0 pt-0 mt-1 pl-0 pr-0">
                  <burial-search-result :expand="!($vuetify.breakpoint.mobile || close)" :value="burial.burial_id" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          </template>
        </v-card-text>
        <v-card-text v-else>
          <v-skeleton-loader type="article"/>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script>
import BurialSearchResult from '@/components/burials/BurialSearchResult'
import { DateTime } from 'luxon'
import SiteMapPopup from '@/components/sites/SiteMapPopup'

export default {
  name: 'BurialScheduleDay',
  components: {
    BurialSearchResult,
    SiteMapPopup
  },
  props: {
    value: String,
    refresh: Boolean,
    close: Boolean,
    hideNav: Boolean
  },
  data () {
    return {
      slots: null,
      date: null,
      loaded: false,
      error: null,
      burialCount: null,
      geometries: null
    }
  },
  computed: {

  },
  mounted () {
    if (this.value) {
      this.date = DateTime.fromISO(this.value)
    } else {
      this.date = DateTime.fromISO(this.currentDate())
    }
    this.update()
  },
  methods: {
    update () {
      this.loaded = false
      this.slots = null
      this.burialCount = 0
      this.geometries = []
      this.secureGet('/api/v1/burials/' + this.date.toISODate() + '/schedule')
        .then(res => {
          this.slots = res.data
          const tmp = []
          this.slots.forEach(slt => {
            this.burialCount += slt.burials.length
            slt.burials.forEach(burial => {
              if (burial.site_id) {
                tmp.push(burial.geometry_local_json)
              }
            })
          })
          this.geometries = tmp
          this.$emit('burial-count', this.burialCount)
          this.loaded = true
        })
        .catch(err => { this.error = err })
    },
    scheduleDateUp () {
      this.date = this.date.plus({days: 1})
      this.update()
    },
    scheduleDateDown () {
      this.date = this.date.minus({days: 1})
      this.update()
    }
  },
  watch: {
    value () {
      this.date = DateTime.fromISO(this.value)
      this.update()
    },
    refresh () {
      this.update()
    }
  }
}
</script>

<style scoped>

</style>
