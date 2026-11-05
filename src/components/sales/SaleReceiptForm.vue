<template>
  <div>
    <error-disp v-model="error"/>
    <v-dialog v-if="sale" v-model="dialog" persistent max-width="800">
      <v-card class="elevation-4">
        <v-card-title class="primary white--text">
          Add a new receipt
        </v-card-title>
        <v-card-text class="pt-7">
          <v-row>
            <v-col cols="6">
              Receipt to sale customer:
              <customer-details v-model="receiptCustomerId"/>
            </v-col>
            <v-col cols="6">
              Or select a different customer:
              <span class="d-flex">
                <v-text-field
                  dense
                  v-model="newReceiptCustomerId"
                  label="Customer no"
                  :error-messages="newCustomerErrors"
                  class="pr-5"
                ></v-text-field>
                <v-btn class="pt-1" color="primary" small :disabled="pending" @click="changeReceiptCustomer">Change</v-btn>
              </span>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text class="pt-7">
          <v-row>
            <v-col cols="6">
              <v-menu
                v-model="menuReceiptDate"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    dense
                    v-model="formatReceiptDate"
                    label="Receipt Date"
                    prepend-icon="mdi-calendar"
                    class="mr-10"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="receiptDatePick"
                  @input="receiptDatePicked"
                  :min="minDate"
                  :max="new Date().toISOString().substr(0, 10)"
                >
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-text-field
                class="mr-0"
                dense
                v-model="receiptValue"
                :error-messages="receiptValueErrors"
                append-outer-icon="mdi-check"
                @click:append-outer="receiptValue = sale.value_outstanding"
                label="Value"
                type="text"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="paymentTypes"
                dense
                :disabled="pending"
                return-object
                item-text="payment_type"
                item-value="payment_type_id"
                v-model="paymentType"
                :error-messages="paymentTypeErrors"
                clearable
                label="Payment Type"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="paymentModes"
                dense
                :disabled="pending || !paymentType || !paymentType.payment_mode_required"
                return-object
                item-text="payment_mode"
                item-value="payment_mode_id"
                v-model="paymentMode"
                :error-messages="paymentModeErrors"
                clearable
                label="Payment Mode"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field
                dense
                v-model="receiptNote"
                label="Notes"
                type="text"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :disabled="pending" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :disabled="pending" @click="addReceipt">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-if="sale" v-model="overpaymentDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">Confirm over-payment</v-card-title>
        <v-card-text>
          Receipt value ({{ formatM(receiptValue) }}) is greater than outstanding value ({{ formatM(sale.value_outstanding) }}).
          Do you want to continue?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="overpaymentDialog = false">Cancel</v-btn>
          <v-btn color="primary" dark @click="confirmOverpayment">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { DateTime } from 'luxon'
import { required, integer, decimal, minValue } from 'vuelidate/lib/validators'
import CustomerDetails from '@/components/customer/CustomerDetails'
import ErrorDisp from '@/components/shared/Error'

export default {
  name: 'SaleReceiptForm',
  components: {
    CustomerDetails,
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
      receiptDate: DateTime.now().toISO(),
      receiptDatePick: DateTime.now().toISODate(),
      menuReceiptDate: false,
      receiptValue: null,
      receiptNote: null,
      overpaymentDialog: false,
      paymentType: null,
      paymentMode: null,
      paymentTypes: null,
      paymentModes: null,
      receiptCustomerId: null,
      newReceiptCustomerId: null,
      receiptOverpayment: false
    }
  },
  validations () {
    return {
      receiptValue: {
        required,
        decimal,
        minValue: minValue(0),
        lessThanOutstanding (value) {
          if (!this.sale) { return true }
          if (this.$userCheckPermission('PERM_ACCOUNTS_SUPER')) { return true }
          return parseFloat(value) <= parseFloat(this.sale.value_outstanding)
        }
      },
      newReceiptCustomerId: {
        minValue: minValue(0),
        integer
      },
      paymentType: { required },
      paymentMode: {
        required (value, vm) {
          if (vm.paymentType) {
            const selectedType = (vm.paymentTypes || []).find(pt => pt.payment_type_id === vm.paymentType.payment_type_id)
            if (selectedType) {
              return selectedType.payment_mode_required ? !!value : true
            } else {
              return true
            }
          }
          return true
        }
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
    formatReceiptDate () {
      if (this.receiptDate) {
        return this.formatD(this.receiptDate)
      }
      return ''
    },
    newCustomerErrors () {
      const errors = []
      if (!this.$v.newReceiptCustomerId.$dirty) return errors
      !this.$v.newReceiptCustomerId.integer && errors.push('Customer No must be a number.')
      !this.$v.newReceiptCustomerId.minValue && errors.push('Customer No must be greater than 0.')
      return errors
    },
    receiptValueErrors () {
      const errors = []
      if (!this.$v.receiptValue.$dirty) return errors
      !this.$v.receiptValue.required && errors.push('Receipt value is required.')
      !this.$v.receiptValue.decimal && errors.push('Receipt value must be a number.')
      !this.$v.receiptValue.minValue && errors.push('Receipt value must be greater than 0.')
      !this.$v.receiptValue.lessThanOutstanding && errors.push('Receipt value must be less than the outstanding value.')
      return errors
    },
    paymentTypeErrors () {
      const errors = []
      if (!this.$v.paymentType.$dirty) return errors
      !this.$v.paymentType.required && errors.push('Payment type is required.')
      return errors
    },
    paymentModeErrors () {
      const errors = []
      if (!this.$v.paymentMode.$dirty) return errors
      !this.$v.paymentMode.required && errors.push('Payment mode is required.')
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
    this.loadReferenceData()
    this.resetForm()
  },
  methods: {
    loadReferenceData () {
      this.secureGet('/api/v1/payment_types')
        .then(res => {
          // Remove the payment type with ref 'LEGACY'
          res.data = res.data.filter(pt => pt.payment_type_ref !== 'LEGACY')
          this.paymentTypes = res.data
          //console.log('Payment types', this.paymentTypes)
        })
        .catch((error) => { this.error = error })

      this.secureGet('/api/v1/payment_modes')
        .then(res => {
          this.paymentModes = res.data
        })
        .catch((error) => { this.error = error })
    },
    resetForm () {
      this.receiptDate = DateTime.now().toISO()
      this.receiptDatePick = DateTime.now().toISODate()
      this.menuReceiptDate = false
      this.receiptValue = null
      this.receiptNote = null
      this.paymentType = null
      this.paymentMode = null
      this.receiptCustomerId = this.sale ? this.sale.customer_id : null
      this.newReceiptCustomerId = null
      this.receiptOverpayment = false
      this.overpaymentDialog = false
      this.$v.$reset()
    },
    closeDialog () {
      this.dialog = false
      this.resetForm()
    },
    changeReceiptCustomer () {
      if (this.newReceiptCustomerId) {
        this.$v.newReceiptCustomerId.$touch()
        if (!this.$v.newReceiptCustomerId.$invalid) {
          this.pending = true
          this.secureGet('/api/v1/customers/' + this.newReceiptCustomerId)
            .then(res => {
              this.receiptCustomerId = res.data.customer_id
              this.pending = false
            })
            .catch(() => {
              this.newReceiptCustomerId = null
              this.pending = false
            })
        }
      }
    },
    addReceipt () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        if (parseFloat(this.receiptValue) > parseFloat(this.sale.value_outstanding)) {
          this.overpaymentDialog = true
          return
        }

        this.submitReceipt()
      }
    },
    confirmOverpayment () {
      this.overpaymentDialog = false
      this.receiptOverpayment = true
      this.submitReceipt()
    },
    submitReceipt () {
      this.pending = true

      const receiptPayload = {
        customerId: this.receiptCustomerId,
        receiptDate: this.receiptDate,
        receiptValue: this.receiptValue,
        paymentTypeId: this.paymentType.payment_type_id,
        receiptNote: this.receiptNote,
        receiptOverpayment: this.receiptOverpayment
      }

      if (this.paymentMode) {
        receiptPayload.paymentModeId = this.paymentMode.payment_mode_id
      }

      this.securePost('/api/v1/sales/' + this.sale.sale_id + '/receipt', receiptPayload)
        .then((res) => {
          this.pending = false
          this.$emit('added', res.data)
          this.closeDialog()
        })
        .catch((error) => {
          this.error = error
          this.pending = false
        })
    },
    receiptDatePicked () {
      this.receiptDate = this.receiptDatePick
      this.menuReceiptDate = false
    }
  }
}
</script>

<style scoped>

</style>
