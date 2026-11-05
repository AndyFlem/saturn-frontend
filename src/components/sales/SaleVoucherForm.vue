<template>
  <div>

    <v-dialog v-if="sale" v-model="dialog" persistent max-width="800">
      <v-card class="elevation-4">
        <v-card-title class="primary white--text">
          Add a new credit voucher
        </v-card-title>
        <v-card-text class="pt-7">
          <error-disp v-model="error"/>
          <v-row>
            <v-col cols="12" sm="10" md="6">
              <v-text-field
                class="mr-0"
                dense
                v-model="voucherValue"
                :error-messages="voucherValueErrors"
                append-outer-icon="mdi-check"
                @click:append-outer="voucherValue = -sale.value_outstanding"
                label="Value"
                type="text"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="10" md="6">
              <v-menu
                v-model="menuVoucherDate"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    dense
                    v-model="formatVoucherDate"
                    label="Voucher Date"
                    prepend-icon="mdi-calendar"
                    class="mr-10"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="voucherDatePick"
                  @input="voucherDatePicked"
                  :min="minDate"
                  :max="new Date().toISOString().substr(0, 10)"
                >
                </v-date-picker>
              </v-menu>
            </v-col>

            <v-col cols="12">
              <v-text-field
                dense
                v-model="externalRef"
                :error-messages="externalRefErrors"
                label="Payment Reference"
                type="text"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                dense
                v-model="voucherNote"
                :error-messages="voucherNoteErrors"
                label="Note"
                type="text"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :disabled="pending" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :disabled="pending" @click="addVoucher">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { DateTime } from 'luxon'
import { required, decimal, minValue } from 'vuelidate/lib/validators'
import ErrorDisp from '@/components/shared/Error'

export default {
  name: 'SaleVoucherForm',
  components: {
    ErrorDisp
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    sale: {
      type: Object,
      required: true
    },
    minDate: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      error: null,
      pending: false,
      voucherValue: null,
      voucherNote: null,
      externalRef: null,
      voucherDate: DateTime.now().toISO(),
      voucherDatePick: DateTime.now().toISODate(),
      menuVoucherDate: false,
    }
  },
  validations () {
    return {
      voucherValue: {
        required,
        decimal,
        minValue: minValue(0),
        lessThanOutstanding (value) {
          if (!this.sale) { return true }
          return parseFloat(value) <= -parseFloat(this.sale.value_outstanding)
        }
      },
      voucherNote: {
        required
      },
      externalRef: {
        required
      }
    }
  },
  computed: {
    dialog: {
      get () {
        return this.value
      },
      set (newValue) {
        this.$emit('input', newValue)
      }
    },
    formatVoucherDate () {
      if (this.voucherDate) {
        return this.formatD(this.voucherDate)
      }
      return ''
    },
    voucherValueErrors () {
      const errors = []
      if (!this.$v.voucherValue.$dirty) return errors
      !this.$v.voucherValue.required && errors.push('Voucher value is required.')
      !this.$v.voucherValue.decimal && errors.push('Voucher value must be a number.')
      !this.$v.voucherValue.minValue && errors.push('Voucher value must be greater than 0.')
      !this.$v.voucherValue.lessThanOutstanding && errors.push('Voucher value must be less than the outstanding value.')
      return errors
    },
    voucherNoteErrors () {
      const errors = []
      if (!this.$v.voucherNote.$dirty) return errors
      !this.$v.voucherNote.required && errors.push('Voucher note is required.')
      return errors
    },
    externalRefErrors () {
      const errors = []
      if (!this.$v.externalRef.$dirty) return errors
      !this.$v.externalRef.required && errors.push('External reference is required.')
      return errors
    }
  },
  watch: {
    dialog (isOpen) {
      if (isOpen) {
        this.resetForm()
      }
    }
  },
  mounted () {
    this.resetForm()
    console.log('min date in form', this.minDate)
  },
  methods: {
    voucherDatePicked () {
      this.voucherDate = this.voucherDatePick
      this.menuVoucherDate = false
    },
    resetForm () {
      this.voucherValue = null
      this.voucherNote = null
      this.externalRef = null
      this.voucherDate = DateTime.now().toISO()
      this.voucherDatePick = DateTime.now().toISODate()
      this.menuVoucherDate = false
      this.error = null
      this.$v.$reset()
    },
    closeDialog () {
      this.dialog = false
      this.resetForm()
    },
    addVoucher () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.submitVoucher()
      }
    },
    submitVoucher () {
      this.pending = true

      const voucherPayload = {
        voucherValue: this.voucherValue,
        voucherNote: this.voucherNote,
        externalRef: this.externalRef,
        voucherDate: this.voucherDate
      }

      this.securePost('/api/v1/sales/' + this.sale.sale_id + '/voucher', voucherPayload)
        .then((res) => {
          this.pending = false
          this.$emit('added', res.data)
          this.closeDialog()
        })
        .catch((error) => {
          this.error = error
          this.pending = false
        })
    }
  }
}
</script>

<style scoped>

</style>
