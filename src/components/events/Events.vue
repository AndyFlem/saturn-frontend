<template>
  <div v-if="events">
    <v-row>
      <v-col cols="12" class="d-flex">
        <span class="pt-5 text-body-2"><b>Events: </b></span>
        <event-form
          :siteId="siteId"
          :siteRef="siteRef"
          :saleId="saleId"
          :tariffId="tariffId"
          :eventId="null"
          v-if="!readonly && $userCheckPermission('PERM_EDIT')"
          @create="eventAdded"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="pl-5 pr-5">
        <div v-if="events">
          <div v-if="events.length>0">
            <template v-for="(event, index) in events">
              <v-row :key="event.event_id" >
                <v-col cols="8" md="11" class="text-body-2 pt-3">
                  <v-row no-gutters>
                    <v-col cols="6" md="3" class="">
                      <b>{{formatT(event.event_time)}}</b>
                    </v-col>
                    <v-col cols="6" md="3" class="">
                      <b>{{event.event_type}}</b>
                    </v-col>
                    <v-col cols="6" md="4" class="">
                      <span v-if="event.contractor"><b>Contractor:</b> {{event.contractor}}</span>
                    </v-col>
                    <v-col cols="6" md="2" class="">
                      <span v-if="event.sale_id != saleId">
                        <b>Sale:</b> <router-link :to="{name: 'Sale', params: {sale_id: event.sale_id}}">{{event.sale_id}}</router-link>
                      </span>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="6" class="">
                      {{event.description}}
                    </v-col>
                    <v-col cols="6" class="">
                      {{formatM(event.event_value)}}
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="4" md="1" class="text-body-1 pt-2 d-flex justify-end">
                  <event-form
                    :siteId="event.site_id"
                    :siteRef="event.site_ref"
                    :saleId="event.sale_id"
                    :tariffId="tariffId"
                    :eventId="event.event_id"
                    @update="eventUpdated($event, index)"
                    v-if="$userCheckPermission('PERM_EDIT') && event.sale_id === saleId"/>
                  <v-btn
                    icon
                    title="Delete event"
                    v-if="!readonly && event.sale_id === saleId"
                    @click="deleteEvent(event.event_id, index)"
                    color="primary"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </template>
          </div>
          <span v-else>None</span>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import EventForm from '@/components/events/EventForm'
import { DateTime } from 'luxon'

// Used on SaleSite.vue SiteDetails.vue and tSitesMap.vue
export default {
  name: 'Events',
  components: {
    EventForm
  },
  props: {
    readonly: Boolean,
    siteId: Number,
    saleId: Number,
    siteRef: String,
    tariffId: Number,
    noAddNew: Boolean
  },
  data () {
    return {
      events: null,
      error: null,
      eventId: null
    }
  },
  watch: {
  },
  computed: {
  },
  mounted () {
    if (this.siteId) {
      this.reloadEvents()
        .then(() => {
          this.$emit('input', this.events.length)
        })
    }
  },
  methods: {
    editEvent (eventId) {
      console.log('Setting event id: ' + eventId)
      this.eventId = eventId
    },
    deleteEvent (eventId, index) {
      return this.secureDelete('/api/v1/events/' + eventId)
        .then(() => {
          this.events.splice(index, 1)
          this.value = this.events.length
          this.$emit('eventDeleted')
          this.$emit('input', this.events.length)
        })
        .catch((error) => { this.error = error })
    },
    eventAdded (evt) {
      this.events.push(evt)
      this.value = this.events.length
      this.$emit('eventAdded', evt)
      this.$emit('input', this.events.length)
    },
    eventUpdated (evt, index) {
      this.events.splice(index, 1)
      this.events.push(evt)
    },
    reloadEvents () {
      this.events = null

      return this.secureGet('/api/v1/events/site/' + this.siteId)
        .then(response => {
          this.events = response.data.sort((a, b) => {
            return DateTime.fromISO(a.event_time) - DateTime.fromISO(b.event_time)
          })
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>

<style scoped>

</style>
