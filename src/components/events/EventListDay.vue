<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <template>
      <v-card class="elevation-4">
        <v-card-title class="primary white--text pt-2 pb-3">
          <span>Events</span>
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
          <div v-if="events">
            <v-card
              v-for="(day, i) in Object.entries(events)"
              :key="day[0]"
              class="elevation-0 pb-0 pt-0"
            >
              <v-card-title v-if="Object.entries(events).length>1" class="secondary text-h6 pt-3 pb-2">
                <span v-if="i === 0">Today</span
                ><span v-else>{{ formatD(day[0]) }}</span>
              </v-card-title>
              <v-card-text class="pl-4 pr-4 ">
                <div v-if="day[1].length > 0">
                  <div v-for="event in day[1]" :key="event.event_id">
                    <event-details :value="event.event_id" />
                  </div>
                </div>
                <div v-else class="pt-2 text-body-1">
                  No events
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
import EventDetails from '@/components/events/EventDetails'

// Used on tCalendar.vue only
export default {
  name: 'EventListDay',
  components: {
    EventDetails
  },
  props: {
    value: String,
    refresh: Boolean,
    hideNav: Boolean
  },
  data () {
    return {
      date: null,
      eventCount: null,
      error: null,
      events: null,
      eventDays: null,
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
      this.eventDays = null
      this.events = null
      this.eventCount = 0
      const selectedDate = this.date.toISODate()
      this.secureGet('/api/v1/events?from=' + selectedDate)
        .then(res => {
          this.eventDays = res.data
          this.events = {}
          this.events[selectedDate] = []
          this.eventDays.forEach(evt => {
            const dte = DateTime.fromISO(evt.event_time).toISODate()
            if (dte === selectedDate) { this.events[selectedDate].push(evt) }
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
