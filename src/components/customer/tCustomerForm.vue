<template>
  <v-form>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            {{title}}
          </v-card-title>
          <v-card-text>
            <v-row no-gutters>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="customer.is_corporate"
                  label="Corporate customer ?"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row v-if="customer.is_corporate" no-gutters>
              <v-col cols="12" md="8">
                <v-text-field
                    class="mr-3"
                    v-model="customer.company_name"
                    label="Company Name"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="customer.is_contractor"
                  label="Contractor customer ?"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="5" md="2">
                <v-combobox
                  class="mr-3"
                  v-model="customer.salutation"
                  :items="salutationList"
                  :error-messages="salutationErrors"
                  label="Title"
                ></v-combobox>
              </v-col>
              <v-col cols="7" md="3">
                <v-text-field
                    class="mr-3"
                    v-model="customer.first_name"
                    :error-messages="firstNameErrors"
                    label="First Name"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                    class="mr-3"
                    v-model="customer.middle_name"
                    label="Middle Names"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                    v-model="customer.last_name"
                    :error-messages="lastNameErrors"
                    label="Last Name"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                    class="mr-3"
                    v-model="customer.address1"
                    label="Address Line 1"
                    :error-messages="address1Errors"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                    class="mr-3"
                    v-model="customer.address2"
                    label="Address Line 2"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                    class="mr-3"
                    v-model="customer.address3"
                    label="Address Line 3"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                  <v-select
                    class="mr-3"
                    v-model="customer.country"
                    :items="countryList"
                    :error-messages="countryErrors"
                    label="Country"
                  ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                    v-model="customer.phone1"
                    class="mr-3"
                    label="Phone 1"
                    :error-messages="phone1Errors"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                    v-model="customer.phone2"
                    label="Phone 2"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                    v-model="customer.email"
                    label="Email Address"
                    :error-messages="emailErrors"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="customer.no_marketing_email"
                  label="No Marketing Emails"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="customer.no_transaction_email"
                  label="No Transaction Emails"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" md="6">
                <v-text-field
                    class="mr-3"
                    v-model="customer.tax_id"
                    label="Tax Id No"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                    v-model="customer.id_no"
                    label="Id No"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-end">
                <v-btn
                  class="mr-4"
                  color="primary"
                  @click="$router.go(-1)"
                >
                  Cancel
                </v-btn>
                            <v-btn
                  class="mr-4"
                  color="primary"
                  @click="post"
                >
                  {{action_text}}
                </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import { required, requiredUnless, email } from 'vuelidate/lib/validators'
import helpers from '@/services/helpers'

export default {
  name: 'tCustomerForm',
  components: {
    ErrorDisp
  },
  data () {
    return {
      title: 'New Customer',
      update_mode: false,
      action_text: 'Add',
      error: false,
      // country_list: ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Anguilla', 'Antigua &amp; Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia &amp; Herzegovina', 'Botswana', 'Brazil', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Cape Verde', 'Cayman Islands', 'Chad', 'Chile', 'China', 'Colombia', 'Congo', 'Cook Islands', 'Costa Rica', 'Cote D Ivoire', 'Croatia', 'Cruise Ship', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Estonia', 'Ethiopia', 'Falkland Islands', 'Faroe Islands', 'Fiji', 'Finland', 'France', 'French Polynesia', 'French West Indies', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guam', 'Guatemala', 'Guernsey', 'Guinea', 'Guinea Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyz Republic', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Namibia', 'Nepal', 'Netherlands', 'Netherlands Antilles', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Reunion', 'Romania', 'Russia', 'Rwanda', 'Saint Pierre &amp; Miquelon', 'Samoa', 'San Marino', 'Satellite', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'St Kitts &amp; Nevis', 'St Lucia', 'St Vincent', 'St. Lucia', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', "Timor L'Este", 'Togo', 'Tonga', 'Trinidad &amp; Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks &amp; Caicos', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Virgin Islands (US)', 'Yemen', 'Zambia', 'Zimbabwe'],
      customer_id: null,
      customer: {
        is_corporate: false,
        is_contractor: false,
        company_name: null,
        salutation: null,
        first_name: null,
        middle_name: null,
        last_name: null,
        address1: null,
        address2: null,
        address3: null,
        country: 'Zambia',
        phone1: null,
        phone2: null,
        email: null,
        tax_id: null,
        id_no: null,
        no_marketing_email: false,
        no_transaction_email: false
      }
    }
  },
  computed: {
    salutationList: helpers.salutationList,
    countryList: helpers.countryList,

    salutationErrors () {
      const errors = []
      if (!this.$v.customer.salutation.$dirty) return errors
      !this.$v.customer.salutation.required && errors.push('Title is required')
      return errors
    },
    firstNameErrors () {
      const errors = []
      if (!this.$v.customer.first_name.$dirty) return errors
      !this.$v.customer.first_name.required && errors.push('First name is required')
      return errors
    },
    lastNameErrors () {
      const errors = []
      if (!this.$v.customer.last_name.$dirty) return errors
      !this.$v.customer.last_name.required && errors.push('Last name is required')
      return errors
    },
    address1Errors () {
      const errors = []
      if (!this.$v.customer.address1.$dirty) return errors
      !this.$v.customer.address1.required && errors.push('Address line 1 is required')
      return errors
    },
    countryErrors () {
      const errors = []
      if (!this.$v.customer.country.$dirty) return errors
      !this.$v.customer.country.required && errors.push('Country is required')
      return errors
    },
    phone1Errors () {
      const errors = []
      if (!this.$v.customer.phone1.$dirty) return errors
      !this.$v.customer.phone1.required && errors.push('Phone 1 is required')
      return errors
    },
    emailErrors () {
      const errors = []
      if (!this.$v.customer.email.$dirty) return errors
      !this.$v.customer.email.email && errors.push('Must be valid e-mail')
      return errors
    }
  },
  validations: {
    customer: {
      salutation: {
        required: requiredUnless(function () { return this.customer.legacy_id })
      },
      first_name: {
        required: requiredUnless(function () { return this.customer.legacy_id })
      },
      last_name: {
        required
      },
      address1: {
        required: requiredUnless(function () { return this.customer.legacy_id })
      },
      phone1: {
        required: requiredUnless(function () { return this.customer.legacy_id })
      },
      email: {
        email
      },
      country: {
        required: requiredUnless(function () { return this.customer.legacy_id })
      }
    }
  },
  created () {
    if (this.$route.params.customer_id) {
      this.title = 'Edit Customer'
      this.action_text = 'Update'
      this.customer_id = this.$route.params.customer_id
      this.update_mode = true
      this.secureGet('/api/v1/customers/' + this.customer_id)
        .then(res => {
          this.customer.is_corporate = res.data.is_corporate
          this.customer.is_contractor = res.data.is_contractor
          this.customer.company_name = res.data.company_name
          this.customer.salutation = res.data.salutation
          this.customer.first_name = res.data.first_name
          this.customer.middle_name = res.data.middle_name
          this.customer.last_name = res.data.last_name
          this.customer.address1 = res.data.address1
          this.customer.address2 = res.data.address2
          this.customer.address3 = res.data.address3
          this.customer.country = res.data.country
          this.customer.phone1 = res.data.phone1
          this.customer.phone2 = res.data.phone2
          this.customer.email = res.data.email
          this.customer.tax_id = res.data.tax_id
          this.customer.id_no = res.data.id_no
          this.customer.no_marketing_email = res.data.no_marketing_email
          this.customer.no_transaction_email = res.data.no_transaction_email
        })
        .catch(error => (this.error = 'Error fetching customer. ' + error))
    }
  },
  methods: {
    cleanNames () {
      if (this.customer.first_name) {
        this.customer.first_name = this.customer.first_name.trim()
      }
      if (this.customer.middle_name) {
        this.customer.middle_name = this.customer.middle_name.trim()
      }
      if (this.customer.last_name) {
        this.customer.last_name = this.customer.last_name.trim()
      }
    },
    post () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.cleanNames()
        const cust = this.customer
        cust.user_id = JSON.parse(localStorage.user).user_id
        if (this.update_mode) {
          this.updateCustomer(cust)
        } else {
          this.createCustomer(cust)
        }
      }
    },
    createCustomer (cust) {
      this.securePost('/api/v1/customers', cust)
        .then(response => {
          this.$router.push({name: 'Customer', params: { customer_id: response.data.customer_id }})
        })
        .catch(error => (this.error = 'Error creating customer. ' + error))
    },
    updateCustomer (cust) {
      this.securePut('/api/v1/customers/' + this.customer_id, cust)
        .then(response => {
          this.$router.go(-1)
        })
        .catch(error => (this.error = 'Error updating customer. ' + error))
    }
  }
}
</script>

<style scoped>

</style>
