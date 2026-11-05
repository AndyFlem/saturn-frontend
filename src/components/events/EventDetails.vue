<template>
  <v-row v-if="event">
    <v-col cols="12" class="pl-0 pr-0 pb-1 pt-1">
      <v-card :elevation="flat ? 0 : 3">
        <v-card-text class="text-body-1 pt-2 pb-2">
          <v-row no-gutters class="pl-4">
            <v-col cols="12" md="6">
              <v-row no-gutters>
                <v-col cols="12">
                  <v-chip
                      small
                      v-bind:color="eventStatusColor(event.event_status_ref)"
                    >{{ event.event_status }}</v-chip>
                    <b>
                      {{ formatD(event.event_time) }}
                      {{ formatSlot(event.event_time) }}
                      {{ event.event_type }}
                    </b>
                </v-col>
              </v-row>
              <template v-if="event.event_status_ref != 'CANCELLED'">
                <v-row no-gutters>
                  <v-col cols="12">
                    <b>Site: </b><site-map-popup :site="event"/><router-link :to="{name: 'Site',params: {site_id: event.site_id}}">{{ event.site_ref }}</router-link>{{ event.site_type }}
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <span class="pr-3">
                      <b>Customer: </b>
                      <router-link :to="{name: 'Customer',params: {customer_id: event.customer_id}}">
                        {{ event.salutation }}
                        {{ event.first_name }}
                        {{ event.middle_name }}
                        {{ event.last_name }}</router-link>
                    </span>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <span v-if="event.contractor"><b>Contractor: </b>{{ event.contractor }}</span>
                  </v-col>
                </v-row>
              </template>
            </v-col>
            <v-col cols="12" md="6" v-if="event.event_status_ref != 'CANCELLED'">
              <v-row no-gutters>
                <v-col cols="12">
                  <b>Sale: </b><router-link :to="{name: 'Sale',params: {sale_id: event.sale_id}}">{{ event.sale_id }}</router-link>
                  <span :style="`color:${saleStatusColor(event.sale_status_ref)};`">({{ event.sale_status }})</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12">
                  <span class="pr-3"><b>Deceased: </b> {{ event.deceased }}</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12">
                  <b>Charges: </b>{{ formatM(event.event_value) }}
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12">
                  <b>Description: </b>{{ event.description }}
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import SiteMapPopup from '@/components/sites/SiteMapPopup'


export default {
  name: 'EventDetails',
  components: {
    SiteMapPopup
  },
  props: {
    value: {
      type: Number,
      required: true
    },
    flat: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      event: null,
    }
  },
  computed: {},
  created () {

  },
  mounted () {

  },
  methods: {

  },
  watch: {
    value: {
      immediate: true,
      handler: function (newVal) {
        if (newVal == null) return
        this.secureGet('/api/v1/events/' + newVal)
          .then(res => {
            this.event = res.data
          })
      }
    }
  }
}


</script>
