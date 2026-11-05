<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <template>
      <v-card class="elevation-4">
        <v-expansion-panels :value="null" v-model="expandIndex">
          <v-expansion-panel>
            <v-expansion-panel-header class="primary white--text text-h6 pt-3 pb-3">
              <span class="white--text">
                <router-link  :to="{name: 'Calendar'}" class="white--text">Events<span v-if="eventDays">: {{ events.length }}</span><span v-else>: -</span></router-link>
              </span>
              <template v-slot:actions>
                <v-icon color="white">$expand</v-icon>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-data-iterator
                v-if="eventsDaysList"
                :items="eventsDaysList"
                :page="eventsPage"
                :items-per-page="3"
              >
              <template v-slot:default="props">
                <v-card-text class="mt-2">
                  <template v-if="eventsDaysList">
                    <v-card v-for="(item, i) in props.items" :key="i" class="elevation-0 pb-0 pt-0">
                      <v-card-title class="secondary text-h6 pt-3 pb-2">
                        <span v-if="item[0]=== today">Today</span>
                        <span v-else>{{ formatD(item[0]) }}</span>
                      </v-card-title>
                      <v-card-text class="pl-4 pr-4">
                        <div v-if="item[1].length > 0">
                          <div v-for="event in item[1]" :key="event.event_id">
                            <event-details :value="event.event_id" />
                          </div>
                        </div>
                        <div v-else class="pt-2 text-body-1">
                          No events
                        </div>
                      </v-card-text>
                    </v-card>
                  </template>
                  <v-skeleton-loader v-else type="article" />
                </v-card-text>
              </template>
              </v-data-iterator>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card>
    </template>
  </div>
</template>

<script>
import { DateTime } from 'luxon'
import EventDetails from '@/components/events/EventDetails'

// Used in tHome.vue only
export default {
  name: 'EventList',
  components: {
    EventDetails
  },
  props: {
    expand: Boolean
  },
  data () {
    return {
      date: null,
      error: null,
      today: null,
      events: null,
      eventsPage: 1,
      eventDays: null,
      expandIndex: null,
      eventsDaysList: null
    }
  },
  computed: {},
  created () {
    if (this.expand) {
      this.expandIndex = 0
    }
  },
  mounted () {
    this.date = DateTime.fromISO(this.currentDate())
    this.today = DateTime.now().toISODate()
    this.update()
  },
  methods: {
    update () {
      this.secureGet('/api/v1/events?from=' + this.today)
        .then(res => {
          this.events = res.data
          this.eventDays = {}
          this.eventDays[this.today] = []
          this.events.forEach(evt => {
            const dte = DateTime.fromISO(evt.event_time).toISODate()
            if (!this.eventDays[dte]) {
              this.eventDays[dte] = []
            }
            this.eventDays[dte].push(evt)
          })
          this.eventsDaysList = Object.entries(this.eventDays)
        })
        .catch(err => {
          this.error = err
        })
    }
  },
  watch: {}
}
</script>

<style scoped></style>
