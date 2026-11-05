<template>
  <div>
  <error-disp v-model="error"/>
  <v-row align="start" justify="center">
    <v-col cols="12" md="11">
      <v-card>
      <v-card-title class="primary white--text pt-2 pb-2">
        <v-btn
          fab
          text
          small
          color="white"
          @click="prev"
        >
          <v-icon small>
            mdi-chevron-left
          </v-icon>
        </v-btn>
        <span v-if="$refs.calendar">
          {{ $refs.calendar.title }}
        </span>
        <v-btn
          fab
          text
          small
          color="white"
          @click="next"
        >
          <v-icon small>
            mdi-chevron-right
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pt-5">
        <v-sheet>
          <v-calendar
            ref="calendar"
            color="primary"
            type="month"
            :weekdays="wkdays"
            v-model="selectedDate"
            @change="getEvents"
            @click:date="viewDay"
          >
          <template v-slot:day-label="{ date, day }">
            <v-sheet
              @click="viewDay(date)"
              rounded
              :class="`ml-2 mr-2 caption d-flex justify-center align-center ${dayCol(date)}`">
              {{day===1?monthLabel(date):''}} {{ day }}
            </v-sheet>
          </template>
          <template v-slot:day="{ date }">
            <v-row v-if="dates[date]" class="no-gutters justify ml-5 mr-5 mt-2 mb-0">
                <template v-for="(count, i) in dates[date].slots">
                  <v-col :key="i" class="d-flex justify-center align-center mb-2" cols="4">
                  <v-btn
                    fab
                    outlined
                    x-small
                    :color="`${count===0?'grey lighten-1':'primary'}`"
                    class="ml-1 mr-1"
                  >{{count}}</v-btn>
                </v-col>
                </template>
                <v-col class="mt-0 mb-2" cols="12">
                  <v-sheet
                    outlined
                    rounded
                    :class="'caption d-flex justify-center align-center ' + (dates[date].event_count > 0?'primary--text':'grey--text')"
                    width="100%"
                  >Events: {{dates[date].event_count}}</v-sheet>
                </v-col>
                <v-col class="mt-0 mb-2" cols="12">
                  <v-sheet
                    outlined
                    rounded
                    :class="'caption d-flex justify-center align-center ' + (dates[date].sitework_count > 0?'primary--text':'grey--text')"
                    width="100%"
                  >Site works: {{dates[date].sitework_count}}</v-sheet>
                </v-col>                
            </v-row>
          </template>
        </v-calendar>
        </v-sheet>
      </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-row align="start" v-if="$userCheckPermission('PERM_TARIFF')" justify="center" class="pt-4">
    <v-col v-if="selectedDate" cols="12" md="10" class="">
      <v-card class="elevation-4">
        <v-card-title class="primary white--text pt-2 pb-3">
          <v-spacer/>
          <span>
            {{formatD(selectedDate)}}
          </span>
        </v-card-title>
        <v-card-text class="mt-2">
          <v-switch
              class=""
              v-model="dayBlocked"
              label="Block burials and dates on this day?"
              @click="blockDay()"
            />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row align="start" justify="center" class="pt-4">
      <v-col v-if="selectedDate" cols="12" md="10" class="">
        <burial-schedule-day v-if="selectedDate" close hide-nav :value="selectedDateISO" />
      </v-col>
      <v-col v-if="selectedDate" cols="12" md="10" class="">
        <event-list-day v-if="selectedDate" hide-nav :value="selectedDateISO" />
      </v-col>
      <v-col v-if="selectedDate" cols="12" md="10" class="">
        <siteworks-list-day v-if="selectedDate" hide-nav :value="selectedDateISO" />
      </v-col>      
    </v-row>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import { DateTime } from 'luxon'
import BurialScheduleDay from '@/components/burials/BurialScheduleDay'
import EventListDay from '@/components/events/EventListDay'
import SiteworksListDay from '@/components/siteworks/SiteworksListDay.vue'

export default {
  name: 'Calendar',
  components: {
    ErrorDisp,
    BurialScheduleDay,
    EventListDay,
    SiteworksListDay
  },
  data () {
    return {
      error: null,
      selectedDate: '',
      dates: {},
      noburialdates: {},
      wkdays: [1, 2, 3, 4, 5, 6, 0],
      dayBlocked: false
    }
  },
  computed: {
    selectedDateISO () {
      return DateTime.fromISO(this.selectedDate).toISODate()
    },
    selectedDateObj () {
      return DateTime.fromISO(this.selectedDate)
    }
  },
  created () {
  },
  mounted () {
    this.$refs.calendar.checkChange()
    this.selectedDate = DateTime.now().toISODate()
  },
  methods: {
    getEvents ({start, end}) {
      this.dates = {}
      this.noburialdates = {}
      const fromDate = DateTime.fromISO(start.date).minus({days: 10})
      const toDate = DateTime.fromISO(end.date).plus({days: 10})

      return this.secureGet('/api/v1/burials/' + fromDate.toISODate() + '/' + toDate.toISODate() + '/counts')
        .then(res => {
          res.data.forEach(sl => {
            if (!this.dates[sl.burial_date]) {
              this.$set(this.dates, sl.burial_date, { slots: [], event_count: 0, sitework_count: 0 })
            }
            this.dates[sl.burial_date].slots[sl.slot_no - 1] = sl.burial_count
          })
          return this.secureGet('/api/v1/events/' + fromDate.toISODate() + '/' + toDate.toISODate() + '/counts')
        })
        .then(res => {
          res.data.forEach(sl => {
            if (!this.dates[sl.event_date]) {
              this.$set(this.dates, sl.event_date, { slots: [], event_count: 0, sitework_count: 0 })
            }
            this.dates[sl.event_date].event_count = sl.event_count
          })
          
          return this.secureGet('/api/v1/siteworks/' + fromDate.toISODate() + '/' + toDate.toISODate() + '/counts')
        })
        .then(res => {
          res.data.forEach(sl => {
            if (!this.dates[sl.sitework_date]) {
              this.$set(this.dates, sl.sitework_date, { slots: [], event_count: 0, sitework_count: 0 })
            }
            this.dates[sl.sitework_date].sitework_count = sl.sitework_count          
          })
          return this.secureGet('/api/v1/noburialdates?from=' + fromDate.toISODate() + '&to=' + toDate.toISODate())
        })        
        .then(res => {
          res.data.forEach(sl => {
            this.$set(this.noburialdates, sl.noburial_date, true)
          })
          this.dayBlocked = this.noburialdates[this.selectedDate]

          this.loaded = true
        })

        .catch(err => { this.error = err })
    },
    blockDay () {
      if (this.dayBlocked) {
        this.securePost('/api/v1/noburialdates', {date: this.selectedDate})
          .catch((error) => { this.error = error })
        this.$set(this.noburialdates, this.selectedDate, true)
      } else {
        this.secureDelete('/api/v1/noburialdates/' + this.selectedDate)
          .catch((error) => { this.error = error })
        this.$set(this.noburialdates, this.selectedDate, false)
      }
    },
    viewDay (date) {
      this.selectedDate = date
      this.dayBlocked = this.noburialdates[this.selectedDate]
    },
    getEventColor (event) {
      return event.color
    },
    prev () {
      this.$refs.calendar.prev()
    },
    next () {
      this.$refs.calendar.next()
    },
    monthLabel (date) {
      return DateTime.fromISO(date).toFormat('LLL')
    },
    dayCol (date) {
      if (this.noburialdates[date]) { return 'red lighten-3' }
      if (date === this.selectedDate) { return 'primary white--text' }
    }
  }
}
</script>

<style scoped lang="scss">

</style>
