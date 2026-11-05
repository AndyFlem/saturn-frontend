<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <template>
      <v-card class="elevation-4">
        <v-card-title class="primary white--text pt-2 pb-3">
          <span>Site Works</span>
          <v-spacer />
          <v-btn icon @click="scheduleDateDown" color="white" v-if="!hideNav">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <span>{{ formatD(date) }}</span>
          <v-btn icon @click="scheduleDateUp" color="white" v-if="!hideNav">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="mt-2">
          <div v-if="siteWorks">
            <v-card
              v-for="(day, i) in Object.entries(siteWorks)"
              :key="day[0]"
              class="elevation-0 pb-0 pt-0"
            >
              <v-card-title v-if="Object.entries(siteWorks).length>1" class="secondary text-h6 pt-3 pb-2">
                <span v-if="i === 0">Today</span
                ><span v-else>{{ formatD(day[0]) }}</span>
              </v-card-title>
              <v-card-text class="pl-4 pr-4 ">
                <div v-if="day[1].length > 0">
                  <div v-for="siteWork in day[1]" :key="siteWork.sitework_id">
                    <sitework-search-result :value="siteWork.sitework_id" />
                  </div>
                </div>
                <div v-else class="pt-2 text-body-1">
                  No site works
                </div>
              </v-card-text>
            </v-card>
          </div>
          <v-skeleton-loader v-else type="article" />
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>
<script>
import { DateTime } from 'luxon'
import SiteworkSearchResult from '@/components/siteworks/SiteworkSearchResult'

// Used on tCalendar.vue only
export default {
  name: 'SiteworksListDay',
  components: {
    SiteworkSearchResult
  },
  props: {
    value: String,
    refresh: Boolean,
    hideNav: Boolean
  },
  data () {
    return {
      date: null,
      siteWorkCount: null,
      error: null,
      siteWorks: null,
      siteWorkDays: null,
      loaded: false
    }
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
      this.siteWorkDays = null
      this.siteWorks = null
      this.siteWorkCount = 0
      const selectedDate = this.date.toISODate()
      this.secureGet('/api/v1/siteworks?from=' + selectedDate)
        .then(res => {
          this.siteWorkDays = res.data
          this.siteWorks = {}
          this.siteWorks[selectedDate] = []
          this.siteWorkDays.forEach(siteWork => {
            const dte = DateTime.fromISO(siteWork.sitework_time).toISODate()
            if (dte === selectedDate) { this.siteWorks[selectedDate].push(siteWork) }
          })
        })
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
  },
  computed: {
  }
}
</script>
<style scoped></style>
