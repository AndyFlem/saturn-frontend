<template>
  <div>
    <error-disp v-model="error"/>
    <v-btn
      icon
      v-if="editMode"
      title="Edit Event"
      color="primary"
      @click="showAddDialog"
    >
      <v-icon>mdi-pencil</v-icon>
    </v-btn>
    <v-btn
      icon
      v-else
      title="Add new event for site."
      color="primary"
      @click="showAddDialog"
    >
      <v-icon>mdi-plus-circle</v-icon>
    </v-btn>
    <v-dialog v-model="eventDialog" persistent max-width="800">
      <v-card class="elevation-4">
        <v-card-title v-if="editMode" class="primary white--text">
          Edit event for site {{siteRef}}
        </v-card-title>
        <v-card-title v-else class="primary white--text">
          Add a new event for site {{siteRef}}
        </v-card-title>
        <v-card-text class="pt-7">
          <v-row class="align-end">
            <v-col v-if="eventTypes" cols="12" md="6">
              <v-select
                class=""
                dense
                clearable
                v-model="event.event_type_id"
                :items="eventTypes"
                :disabled="editMode"
                :error-messages="eventTypeErrors"
                @change="eventTypeChange"
                item-text="event_type"
                item-value="event_type_id"
                label="Event"
              ></v-select>
            </v-col>
            <v-col v-if="eventTypeCharges && !editMode" cols="12" md="6">
              <v-select
                class=""
                dense
                clearable
                return-object
                v-model="eventCharge"
                :disabled="!event.event_type_id"
                :items="eventTypeCharges"
                :error-messages="eventTypeChargeErrors"
                @change="eventTypeChargeChanged"
                :item-text="eventChargeDescription"
                item-value="event_charge_id"
                label="Type"
              ></v-select>
            </v-col>
          </v-row>
          <v-row class="align-end">
            <v-col cols="12" md="8" class="pt-0 pb-0">
                <v-menu
                  v-model="menuEventDate"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      dense
                      v-model="formatEventDate"
                      label="Event Date"
                      :error-messages="eventDateErrors"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    :allowed-dates="allowedBurialDates"
                    :max="maxDate"
                    :min="minDate"
                    v-model="eventDate"
                    @input="eventDateSelect()">
                  </v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="12" md="4"  class="pt-0 pb-0">
                <v-menu
                  v-model="menuEventTime"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      dense
                      v-model="formatEventTime"
                      label="Event Time"
                      class="mr-10"
                      readonly
                      v-bind="attrs"
                      :error-messages="eventTimeErrors"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-time-picker v-model="eventTime" :allowed-hours="[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]" :allowed-minutes="[0, 30]" format="24hr" @input="eventTimeSelect()"></v-time-picker>
                </v-menu>
            </v-col>
          </v-row>
          <v-row class="align-end">
            <v-col cols="12"  class="pt-0 pb-0">
              <v-textarea
                label="Event description"
                rows="1"
                auto-grow
                clearable
                :error-messages="descriptionErrors"
                v-model="event.description"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row class="align-end">
            <v-col v-if="contractors" cols="12" md="6"  class="pt-0 pb-0">
              <v-select
                class=""
                dense
                v-model="event.contractor_id"
                :items="contractors"
                :item-text="contractorName"
                item-value="contractor_id"
                label="Contractor"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text>
          <template v-if="!editMode">
            <v-row v-for="group in groupCharges" :key="group.description">
              <v-col cols="10">
                <v-select
                  class=""
                  return-object
                  dense
                  multiple
                  :items="group.charges"
                  @change="groupChargeChanged"
                  item-text="description"
                  item-value="other_charge_id"
                  :label="group.description"
                ></v-select>
              </v-col>
            </v-row>
          </template>
          <template v-if="charges.length > 0 && !editMode">
              <v-row>
                <v-col cols="12" class="text-body-1"><b>Charges:</b></v-col>
              </v-row>
              <v-row v-for="charge in charges" :key="charge.other_charge_id">
                <v-col cols="12" class="pt-0 pb-1">
                   {{formatM(charge.price)}} {{charge.description}}
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="pt-0 pb-1 text-body-1">
                  Total: <b>{{formatM(charges.reduce((a,b) => a + b.price, 0))}}</b>
                </v-col>
              </v-row>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeDialog()">Cancel</v-btn>
          <v-btn v-if="!editMode" :disabled="pending" color="primary" @click="createEvent()">Add</v-btn>
          <v-btn v-if="editMode" color="primary" @click="updateEvent()">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { DateTime } from 'luxon'
import { required } from 'vuelidate/lib/validators'
import ErrorDisp from '@/components/shared/Error'

export default {
  name: 'EventForm',
  components: {
    ErrorDisp
  },
  props: {
    tariffId: Number,
    siteId: Number,
    saleId: Number,
    siteRef: String,
    eventId: Number
  },
  data () {
    return {
      error: null,
      pending: false,
      editMode: false,
      eventTime: null,
      eventDate: null,
      eventDialog: false,
      contractors: null,
      eventTypes: null,
      eventTypesDict: null,
      menuEventDate: false,
      menuEventTime: false,
      groupCharges: null,
      eventCharge: null,
      eventTypeCharges: null,
      charges: [],
      chargesTotal: null,
      noburialdates: {},
      event: {
        event_id: null,
        site_id: null,
        site_ref: null,
        event_time: null,
        description: null,
        event_type_id: null,
        contractor_id: null
      }
    }
  },
  validations: {
    eventCharge: { required },
    eventDate: {
      required
    },
    event: {
      description: {
        required
      },
      event_type_id: {
        required
      },
      event_time: {
        required
      }
    }
  },
  created () {
    this.event.site_id = this.siteId
    this.event.site_ref = this.siteRef

    if (this.eventId) {
      this.editMode = true
      this.secureGet('/api/v1/events/' + this.eventId)
        .then(res => {
          this.event = res.data
          const eventDT = DateTime.fromISO(this.event.event_time)
          this.eventDate = eventDT.toISODate()
          this.eventTime = eventDT.toFormat('HH:mm')
          this.eventCharge = -1
        })
    }

    this.secureGet('/api/v1/contractors')
      .then(res => {
        this.contractors = res.data
      })
      .catch((error) => { this.error = error })

    this.secureGet('/api/v1/event_types')
      .then(res => {
        this.eventTypes = res.data
        this.eventTypesDict = Object.fromEntries(this.eventTypes.map(et => { return [et.event_type_id, et] }))
        return this.secureGet('/api/v1/tariffs/' + this.tariffId + '/event_charges')
      })
      .then(res => {
        res.data.forEach(chrg => {
          if (!this.eventTypesDict[chrg.event_type_id].charges) { this.eventTypesDict[chrg.event_type_id].charges = [] }
          this.eventTypesDict[chrg.event_type_id].charges.push(chrg)
        })
      })
      .catch((error) => { this.error = error })

    this.secureGet('/api/v1/tariffs/' + this.tariffId + '/other_charges?parent=event')
      .then(res => {
        this.groupCharges = {}
        res.data.forEach(charge => {
          if (!this.groupCharges[charge.other_charge_group_id]) {
            this.groupCharges[charge.other_charge_group_id] = {description: charge.other_charge_group_description, charges: []}
          }
          this.groupCharges[charge.other_charge_group_id].charges.push(charge)
        })
      })
      .catch((error) => { this.error = error })

    this.secureGet('/api/v1/noburialdates/?from=' + DateTime.now().toISODate())
      .then(res => {
        res.data.forEach(sl => {
          this.noburialdates[sl.noburial_date] = true
        })
      })
      .catch((error) => { this.error = error })
  },
  watch: {
  },
  computed: {
    maxDate () {
      return DateTime.now().plus({month: 1}).toISODate()
    },
    minDate () {
      return DateTime.now().toISODate()
    },
    formatEventDate () {
      if (this.eventDate) {
        return this.formatD(this.eventDate)
      } else {
        return ''
      }
    },
    formatEventTime () {
      if (this.eventTime) {
        return this.eventTime
      } else {
        return ''
      }
    },
    descriptionErrors () {
      const errors = []
      if (!this.$v.event.description.$dirty) return errors
      !this.$v.event.description.required && errors.push('Event description is required')
      return errors
    },
    eventTypeErrors () {
      const errors = []
      if (!this.$v.event.event_type_id.$dirty) return errors
      !this.$v.event.event_type_id.required && errors.push('Event is required')
      return errors
    },
    eventTypeChargeErrors () {
      const errors = []
      if (!this.$v.eventCharge.$dirty) return errors
      !this.$v.eventCharge.required && errors.push('Event type is required')
      return errors
    },
    eventTimeErrors () {
      const errors = []
      if (!this.$v.event.event_time.$dirty) return errors
      !this.$v.event.event_time.required && errors.push('Event date and time are required')
      return errors
    },
    eventDateErrors () {
      const errors = []
      if (!this.$v.eventDate.$dirty) return errors
      !this.$v.eventDate.required && errors.push('Event date and time are required')
      return errors
    }
  },
  methods: {
    eventChargeDescription (item) {
      return item.description + ' - ' + this.formatM(item.price)
    },
    groupChargeChanged (val) {
      this.charges = [this.charges[0]].concat(val)
    },
    eventTypeChargeChanged (val) {
      this.charges = []
      if (val) {
        this.charges.push(val)
      }
    },
    eventTypeChange () {
      this.eventTypeCharges = []
      this.charges = []
      if (this.event.event_type_id) {
        this.eventTypeCharges = this.eventTypesDict[this.event.event_type_id].charges
      }
    },
    contractorName (item) {
      return item.contractor_type + ' - ' + item.name
    },
    eventDateSelect () {
      this.menuEventDate = false
    },
    eventTimeSelect () {
      this.menuEventTime = false
      this.event.event_time = this.eventDate + 'T' + this.eventTime + ':00.000+02:00'
    },
    showAddDialog () {
      this.eventDialog = true
    },
    closeDialog () {
      this.eventDialog = false
      if (!this.editMode) {
        this.reset()
      }
    },
    reset () {
      this.event.event_time = null
      this.event.description = ''
      this.event.event_type_id = null
      this.eventCharge = null

      this.event.contractor_id = null

      this.charges = []
      this.eventTypeCharges = []
      this.chargesTotal = 0
      this.eventTime = null
      this.eventDate = null
      this.$v.$reset()
      this.pending = false
    },
    createEvent () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.pending = true
        this.eventTimeSelect()
        const oInsert = {...this.event}
        oInsert.charges = this.charges
        oInsert.sale_id = this.saleId

        delete oInsert.event_id
        return this.securePost('/api/v1/events/', oInsert)
          .then(res => {
            this.eventDialog = false
            this.reset()
            this.$emit('create', res.data)
          })
          .catch((error) => { this.error = error })
      }
    },
    updateEvent () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.eventTimeSelect()
        const oUpdate = {contractor_id: this.event.contractor_id, description: this.event.description, event_time: this.event.event_time}
        return this.securePut('/api/v1/events/' + this.event.event_id, oUpdate)
          .then(res => {
            this.eventDialog = false
            this.$emit('update', this.event)
          })
          .catch((error) => { this.error = error })
      }
    },
    allowedBurialDates (val) {
      return !this.noburialdates[val]
    }
  }
}
</script>

<style scoped>

</style>
