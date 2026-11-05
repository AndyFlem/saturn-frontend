<template>
  <div>
  <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-row v-if="burial" class="text-body-2">
      <v-col :cols="narrow ? 1 : 2" :sm="narrow ? 4 : 1" :md="narrow ? 3 : 1" :lg="narrow ? 1 : 1" class="pt-7">
        <v-icon title="Completed burial" v-if="burial.grave_id" class="text-h5">mdi-coffin</v-icon>
        <v-icon v-else :color="burialStatusColor(burial.burial_status_ref)" class="text-h5">mdi-numeric-{{graveNo}}-circle-outline</v-icon>
        <v-icon title="Grave has a headstone" v-if="burial.has_headstone" class="text-h5">mdi-grave-stone</v-icon>
      </v-col>
      <v-col :cols="narrow ? 4 : 10" :sm="narrow ? 8 : 2" :md="narrow ? 9 : 2" :lg="narrow ? 4 : 2" :class="`${narrow ? 'd-flex justify-center' : ''}`">
        <v-chip
          class="ml-2 mt-2 caption font-weight-bold"
          :color="!burialBelongsToSale ? 'grey': burialStatusColor(burial.burial_status_ref)"
          @click="$router.push({name: 'Burial', params: {burial_id:burial.burial_id }})"
          >{{ burial.burial_status }}</v-chip>
      </v-col>
      <v-col :cols="narrow ? 7 : 7" :sm="narrow ? 12 : 5" :md="narrow ? 12 : 5" :lg="narrow ? 7 : 5" class="">
        <v-row>
          <v-col cols="12" class="pt-0 pb-1">
            <router-link :to="{name: 'Burial', params: {burial_id: burial.burial_id}}">
              <span class="font-weight-bold">{{ deceasedName }}</span>
            </router-link>
              <v-icon
                small
                v-if="!readonly"
                class="pl-3 pt-0 pb-0"
                @click="$router.push({name: 'Edit Burial', params: {burial_id:burial.burial_id }})"
                color="grey"
              >mdi-pencil</v-icon>
          </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" class="pt-0 pb-0">
              <span v-if="burial.burial_date"><span :class="burialDateClass(burial)">{{formatD(burial.burial_date)}}</span> <span v-if="burial.burial_slot" :class="burialDateClass(burial)">{{formatSlot(burial.burial_slot_from)}} - {{formatSlot(burial.burial_slot_to)}}</span></span>
              <span v-else>No burial date set</span>
            </v-col>
        </v-row>
        <v-row v-if="burial.deceased_birth_date && burial.death_date">
          <v-col cols="12" class="pt-0 pb-0">
            {{formatDShort(burial.deceased_birth_date)}} - {{formatDShort(burial.death_date)}} {{deceasedAge}}
          </v-col>
        </v-row>
      </v-col>
      <v-col :cols="narrow ? 12 : 5" :sm="narrow ? 12 : 4" :md="narrow ? 8 : 2" :lg="narrow ? 12 : 2" class="">
        <v-row>
          <v-col cols="12" class="pt-0 pb-0">
          <div class="red--text" v-if="burial.flag">
            <b>Flagged burial</b>
          </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="pt-0 pb-1">
            <template v-if="!burialBelongsToSale">
            <b>Sale&nbsp;</b>
            <router-link v-if="burial.sale_status_ref==='DRAFT'" :to="{name: 'Edit Sale', params: {customer_id: burial.customer_id}}">{{burial.sale_id}}</router-link>
            <router-link v-else :to="{name: 'Sale', params: {sale_id: burial.sale_id}}">{{burial.sale_id}}</router-link> <span :style="`color:${saleStatusColor(burial.sale_status_ref)};`">({{burial.sale_status}})</span>
            </template>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="pt-0 pb-0">
            <b>Burial no. </b>{{burial.burial_id}}
          </v-col>
        </v-row>
      </v-col>
      <v-col v-if="!hideHeadstoneSwitch && burial.grave_id" :cols="narrow ? 12 : 6" sm="12" :md="narrow ? 4 : 2" :lg="narrow ? 4 : 2" class="d-flex align-center">
        <v-switch
          v-model="burial.has_headstone"
          class="pl-4 pt-0 pb-0 mt-0 mb-0"
          dense
          hide-details
          @change="toggleHeadstone(burial)"
        ></v-switch><div>Headstone?</div>
      </v-col>
      <v-col v-if="hasActions" :cols="narrow ? 12 : 6" sm="12" :md="narrow ? 4 : 2" :lg="narrow ? 4 : 2" class="">
        <slot name="actions"></slot>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="1" class="pl-3 pr-0 pt-7">
        <v-icon color="grey" medium>mdi-numeric-{{graveNo}}-circle-outline</v-icon>
      </v-col>
      <v-col cols="5" class="grey--text pt-9">
        Available
      </v-col>
      <v-col cols="6">
        <slot name="available_actions"></slot>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import { DateTime, Interval } from 'luxon'

export default {
  name: 'BurialDetails',
  props: {
    burial: Object,
    graveNo: Number,
    narrow: Boolean,
    readonly: Boolean,
    hideHeadstoneSwitch: Boolean,
    saleId: Number
  },
  components: {
  },
  data () {
    return {
      error: null
    }
  },
  watch: {
  },
  created () {
  },
  computed: {
    burialBelongsToSale () {
      if (this.burial) {
        return (this.burial.sale_id === this.saleId) || !this.saleId
      } else {
        return false
      }
    },
    deceasedAge () {
      if (this.burial.deceased_age < 5 && this.burial.deceased_birth_date && this.burial.death_date) {
        let dur = Interval.fromDateTimes(DateTime.fromISO(this.burial.deceased_birth_date), DateTime.fromISO(this.burial.death_date)).toDuration(['years', 'months']).toObject()
        let str = 'Age: '
        if (dur.years > 0) {
          str += dur.years + 'yrs'
        }
        if (Math.floor(dur.months) > 0) {
          str += ', ' + Math.floor(dur.months) + 'mns'
        }
        return str
      } else {
        if (this.burial.deceased_age) {
          return 'Age: ' + this.burial.deceased_age + ' yrs'
        } else {
          return ''
        }
      }
    },
    hasActions () {
      return !!this.$slots.actions
    },
    deceasedName () {
      if (this.burial.deceased_first_name || this.burial.deceased_last_name) {
        return this.chkStr(this.burial.deceased_salutation) + ' ' + this.chkStr(this.burial.deceased_first_name) + ' ' + this.chkStr(this.burial.deceased_middle_name) + ' ' + this.chkStr(this.burial.deceased_last_name)
      } else {
        return 'Unknown deceased'
      }
    }
  },
  methods: {
    toggleHeadstone (burial) {
      this.securePut('/api/v1/burials/' + burial.burial_id + '/headstone')
        .catch((error) => { this.error = error })
    },
    burialDateClass (burial) {
      if (burial.burial_status_ref !== 'COMPLETE' && DateTime.fromISO(burial.burial_date).startOf('day') < DateTime.local().startOf('day')) { return 'red--text' }
      if (burial.burial_status_ref !== 'COMPLETE' && DateTime.fromISO(burial.burial_date).hasSame(DateTime.local(), 'day')) { return 'font-weight-bold green--text' }
    }
  }
}
</script>
