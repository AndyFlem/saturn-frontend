
<template>
  <v-form>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            <v-icon color="white" large class="pr-3">mdi-grave-stone</v-icon>
            <div v-if="burial_loaded">
              <div>Burial no. <span>{{burial_id}}</span></div>
              <div class="text-body-1">{{site_ref}} Grave no: {{grave_no}}</div>
            </div>
            <span v-if="burial.is_legacy" class="pl-5 ml-5">Legacy Burial</span>
            <v-spacer/>
            <v-chip
            v-if="burial_loaded"
            v-bind:color="burialStatusColor(burial_status_ref)"
            class="ml-auto mr-2"
            >
            {{ burial_status }}
            </v-chip>
          </v-card-title>
          <v-card-text v-if="(burial.is_legacy && !burial_id) || burial_loaded" class="pl-10 pr-10 mt-7">
            <v-row v-if="burial.is_legacy && !burial_id">
              <v-col cols="12">
                <span class="text-body-1 black--text font-weight-bold">Burial site</span>
              </v-col>
              <v-col cols="12">
                <grave-selector :error-messages="siteIdErrors" @selected="siteSelected" :customer-id="customer_id" />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <span class="text-body-1 black--text font-weight-bold">Deceased</span>
              </v-col>
              <v-col cols="4" sm="2">
                <v-combobox
                  class="mr-3"
                  dense
                  v-model="burial.deceased_salutation"
                  :items="salutationList"
                  :error-messages="deceasedSalutationErrors"
                  label="Title"
                ></v-combobox>
              </v-col>
              <v-col cols="8" sm="3">
                <v-text-field
                    class="mr-3"
                    dense
                    v-model="burial.deceased_first_name"
                    :error-messages="deceasedFirstNameErrors"
                    label="First Name"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                    dense
                    v-model="burial.deceased_middle_name"
                    class="mr-3"
                    label="Middle Names"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                    dense
                    v-model="burial.deceased_last_name"
                    :error-messages="deceasedLastNameErrors"
                    class="mr-3"
                    label="Last Name"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
              <v-divider></v-divider>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <span class="text-body-1 black--text font-weight-bold">Burial Date &amp; Time</span>
              </v-col>
              <v-col cols="12" sm="5">
                <v-menu
                  v-model="menuBurialDate"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  :disabled="burial_status_ref=='COMPLETE'"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      dense
                      v-model="formatBurialDate"
                      label="Burial Date"
                      :error-messages="burialDateErrors"
                      prepend-icon="mdi-calendar"
                      class="mr-10"
                      readonly
                      :disabled="burial_status_ref=='COMPLETE'"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-if="lists_loaded"
                    v-model="burial.burial_date" :max="maxDate" :allowed-dates="allowedBurialDates"
                    @input="burialDateSelect(); burial.burial_slot_id = null;">
                  </v-date-picker>
                </v-menu>
              </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-if="slots && !burial.is_legacy"
                      dense
                      :items="slots"
                      :item-text="makeSlotDescription"
                      :item-disabled="makeSlotDisabled"
                      item-value="burial_slot_id"
                      :error-messages="burialSlotErrors"
                      class=""
                      v-model="burial.burial_slot_id"
                      label="Burial slot"
                    ></v-select>
                  </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
              <v-divider></v-divider>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <span class="text-body-1 black--text font-weight-bold">Deceased Details</span>
              </v-col>
              <v-col cols="12" sm="9">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="burial.deceased_address"
                    label="Last Known Address"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="3">
                <v-menu
                  v-model="menuBirthDate"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      dense
                      v-model="formatBirthDate"
                      label="Birth Date"
                      prepend-icon="mdi-calendar"
                      class="mr-10"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-bind:max="currentDate()" v-model="burial.deceased_birth_date" @input="menuBirthDate = false"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" sm="3">
                <v-menu
                  v-model="menuDeathDate"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      dense
                      v-model="formatDeathDate"
                      label="Date of Death"
                      :error-messages="deathDateErrors"
                      prepend-icon="mdi-calendar"
                      class="mr-10"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-bind:max="currentDate()" v-model="burial.death_date" @input="menuDeathDate = false"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="3" sm="1" class="pt-7">
                <v-btn
                  icon
                  :disabled="!(burial.death_date && burial.deceased_birth_date)"
                  color="primary"
                  @click="calcAge"
                >
                  <v-icon>mdi-arrow-right-bold</v-icon>
                </v-btn>
              </v-col>
              <v-col cols="5" sm="1">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="burial.deceased_age"
                    :error-messages="deceasedAgeErrors"
                    label="Age"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="7" sm="6" md="3">
                <v-combobox
                  dense
                  class="mr-3"
                  v-model="burial.deceased_id_type"
                  :items="['NRC', 'Passport', 'Driving License', 'None']"
                  label="ID Type"
                ></v-combobox>
              </v-col>
              <v-col cols="5" sm="6" md="3">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="burial.deceased_id_no"
                    label="ID No"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="6" sm="4" md="2">
                <v-select
                  dense
                  :items="[{text:'Male',value:'M'},{text:'Female',value:'F'},{text:'Unknown',value:'U'}]"
                  class="mr-3"
                  :error-messages="deceasedGenderErrors"
                  v-model="burial.deceased_gender"
                  label="Gender"
                ></v-select>
              </v-col>
              <v-col cols="6" sm="8" md="3">
                <v-text-field
                    dense
                    v-model="burial.deceased_vip_type"
                    label="VIP Type"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12">
              <document
                v-if="burial_id"
                :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                parentObject="burial"
                :parentObjectId="burial_id"
                label="Select Deceased ID Document"
                v-model="idDocumentId"
                :customerId="customer_id"
                documentPropertyRef="ID"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
              <v-divider></v-divider>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <span class="text-body-1 black--text font-weight-bold">Cause of Death</span>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-if="lists_loaded"
                  dense
                  :items="cods"
                  item-text="cod"
                  item-value="cod_id"
                  class="mr-3"
                  v-model="burial.cod_id"
                  label="Cause of Death"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="burial.cod_description"
                    label="Cause of Death Description"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="8" md="3">
                <v-select
                  dense
                  :items="undertakers"
                  v-if="lists_loaded"
                  item-text="name"
                  item-value="contractor_id"
                  class="mr-3"
                  v-model="burial.undertaker_id"
                  label="Undertaker"
                ></v-select>
              </v-col>
              <v-col cols="12">
              <document
                v-if="burial_id"
                :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                parentObject="burial"
                :error-messages="codDocumentErrors"
                :parentObjectId="burial_id"
                label="Cause of Death / Notice of Death Document"
                v-model="codDocumentId"
                :customerId="customer_id"
                documentPropertyRef="COD"/>
              </v-col>
              <v-col cols="12" sm="8" md="8">
              <v-radio-group
                row
                v-model="burial.cod_is_bid"
                :error-messages="codIsBidErrors"
                >
                <v-radio
                  :key="false"
                  dense
                  label="Cause Of Death Certificate"
                  :value="false"
                ></v-radio>
                <v-radio
                  :key="true"
                  dense
                  label="Notice of Death Document"
                  :value="true"
                ></v-radio>
              </v-radio-group>
              </v-col>
              <v-col cols="12" sm="8" md="4">
                <v-switch
                  dense
                  class="mr-3"
                  v-model="burial.cod_is_contagious"
                  label="Contagious COD?"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
              <v-divider></v-divider>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <span class="text-body-1 black--text font-weight-bold">Religion</span>
              </v-col>
               <v-col cols="12" sm="4">
                <v-combobox
                  dense
                  v-model="burial.deceased_religion"
                  :items="religionList"
                  label="Religion"
                ></v-combobox>
              </v-col>
              <v-col cols="12" sm="4">
                <v-combobox
                  dense
                  v-model="burial.deceased_denomination"
                  :items="denominationList"
                  label="Denomination"
                ></v-combobox>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                    dense
                    v-model="burial.deceased_church"
                    label="Church"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
              <v-divider></v-divider>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <span class="text-body-1 black--text font-weight-bold">Burial Permit</span>
              </v-col>
              <v-col cols="6" sm="3">
                <v-combobox
                  dense
                  class="mr-3"
                  v-model="burial.burial_permit_issuer"
                  :items="['LCC', 'Home Affairs']"
                  :error-messages="burialPermitIssuerErrors"
                  label="Burial Permit Issuer"
                ></v-combobox>
              </v-col>
              <v-col cols="6" sm="3">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="burial.burial_permit_no"
                    :error-messages="burialPermitNoErrors"
                    label="Burial Permit No"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
              <document
                v-if="burial_id"
                :download="$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')"
                :error-messages="permitDocumentErrors"
                parentObject="burial"
                :parentObjectId="burial_id"
                label="Select Burial Permit Document"
                v-model="permitDocumentId"
                :customerId="customer_id"
                documentPropertyRef="BURIAL_PERMIT"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
              <v-divider></v-divider>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <span class="text-body-1 black--text font-weight-bold">Next-of-kin</span>
              </v-col>
              <v-col cols="12" sm="5">
                <v-switch
                  dense
                  class="pt-0 pb-0"
                  v-model="burial.nok_is_customer"
                  label="Customer is next-of-kin"
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="5" class="pb-0">
                <v-combobox
                  dense
                  class="mr-3"
                  v-model="burial.nok_relation"
                  :items="relationList"
                  label="Next-of-kin relationship to deceased"
                ></v-combobox>
              </v-col>
            </v-row>
            <v-row v-if="!burial.nok_is_customer">
              <v-col cols="4" sm="2">
                <v-combobox
                  dense
                  class="mr-3"
                  v-model="burial.nok_salutation"
                  :items="salutationList"
                  :error-messages="nokSalutationErrors"
                  :disabled="burial.nok_is_customer"
                  label="Next-of-kin Title"
                ></v-combobox>
              </v-col>
              <v-col cols="8" sm="3">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="burial.nok_first_name"
                    :error-messages="nokFirstNameErrors"
                    :disabled="burial.nok_is_customer"
                    label="Next-of-kin First Name"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                    dense
                    v-model="burial.nok_last_name"
                    :error-messages="nokLastNameErrors"
                    :disabled="burial.nok_is_customer"
                    class="mr-3"
                    label="Next-of-kin Last Name"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row  v-if="!burial.nok_is_customer">
              <v-col cols="12" md="9">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="burial.nok_address"
                    :error-messages="nokAddressErrors"
                    :disabled="burial.nok_is_customer"
                    label="Next-of-kin Address"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="!burial.nok_is_customer">
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="burial.nok_phone1"
                    :error-messages="nokPhone1Errors"
                    :disabled="burial.nok_is_customer"
                    label="Next-of-kin Phone 1"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="burial.nok_phone2"
                    :disabled="burial.nok_is_customer"
                    label="Next-of-kin Phone 2"
                    type="text"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="8">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="burial.nok_email"
                    :disabled="burial.nok_is_customer"
                    label="Next-of-kin Email"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="!burial.nok_is_customer">
              <v-col cols="5" sm="3">
                <v-combobox
                  dense
                  class="mr-3"
                  v-model="burial.nok_id_type"
                  :disabled="burial.nok_is_customer"
                  :items="['NRC', 'Passport', 'Driving License', 'None']"
                  label="Next-of-kin ID Type"
                ></v-combobox>
              </v-col>
              <v-col cols="7" sm="5">
                <v-text-field
                    dense
                    class="mr-3"
                    v-model="burial.nok_id_no"
                    :disabled="burial.nok_is_customer"
                    label="Next-of-kin ID No"
                    type="text"
                  ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="" cols="12">
                <customer-details v-if="customer_id && burial.nok_is_customer" v-model="customer_id" />
              </v-col>
            </v-row>
            <template v-if="sale_status_ref == 'DRAFT'">
              <v-row >
                <v-col cols="12">
                <v-divider></v-divider>
                </v-col>
              </v-row>
              <v-row>
              <v-col cols="12">
                <span class="text-body-1 black--text font-weight-bold">Burial Charges</span>
              </v-col>
              <v-col cols="12">
                <v-row v-for="group in Object.values(chargeGroups)" :key="group.other_charge_group_id">
                  <v-col cols="12" class="mt-0 mb-0 pt-2 pb-1">
                    <v-select
                      dense
                      :items="Object.values(group.charges)"
                      :item-text="makeChargeGroupDescription"
                      :multiple="group.allow_multiple"
                      :clearable="group.required === false"
                      @change="chargeGroupChange"
                      item-value="other_charge_id"
                      class="mt-0 mb-0 pt-0"
                      v-model="group.selectedCharges"
                      :label="groupLabel(group)"
                    ></v-select>
                  </v-col>
                </v-row>
                <div v-if="chargeGroupErrors.length>0" class="v-messages theme--light error--text">{{chargeGroupErrors.join()}}</div>
              </v-col>
              <v-col cols="12">Standard burial charges:</v-col>
              <v-col cols="12" v-for="charge in typeCharges" :key="'sbc' + charge.charge_id" class="pb-0 pt-0">
                {{formatM(charge.price)}} - {{charge.description}}
              </v-col>
              <v-col cols="12" class="pt-4 mt-2 mb-2 pb-0">
                <div class="text-body-1"><b>Total:</b> {{formatM(burialValue)}}</div>
              </v-col>
            </v-row>
            </template>
            <v-row>
              <v-col cols="12">
              <v-divider></v-divider>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <span class="text-body-1 black--text font-weight-bold">Public Portal</span>
              </v-col>
              <v-col cols="12" sm="5">
                <v-switch
                  dense
                  class="pt-0 pb-0"
                  v-model="burial.show_public"
                  label="Show burial on public portal?"
                ></v-switch>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions v-if="burial_id && burial_loaded" class="justify-end pb-5">
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
                  v-if="burial_status_ref !== 'UNSITED'"
                  @click="setConfirmed"
                >
                  {{ (burial_status_ref=='CONFIRMED' || burial_status_ref=='COMPLETE') ? 'Update' : 'Confirm' }}
                </v-btn>
                <v-btn
                  v-if="burial_status_ref == 'DRAFT' || burial_status_ref == 'UNSITED'"
                  class="mr-4"
                  color="primary"
                  @click="update"
                >
                  Update
                </v-btn>
          </v-card-actions>
          <v-card-actions v-if="burial.is_legacy && !burial_id" class="justify-end pb-5">
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
                  @click="createLegacy"
                >
                  Create
                </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { DateTime } from 'luxon'
import CustomerDetails from '@/components/customer/CustomerDetails'
import Document from '@/components/shared/Document'
import ErrorDisp from '@/components/shared/Error'
import GraveSelector from '@/components/sites/GraveSelector'
import helpers from '@/services/helpers'
import { required, requiredUnless, integer, minValue } from 'vuelidate/lib/validators' // email,

const dateAfterBirth = (value, vm) => {
  if (value && vm.deceased_birth_date) {
    return DateTime.fromISO(value) >= DateTime.fromISO(vm.deceased_birth_date)
  } else {
    return true
  }
}
const dateAfterDeath = (value, vm) => {
  if (value && vm.death_date) {
    return DateTime.fromISO(value) >= DateTime.fromISO(vm.death_date)
  } else {
    return true
  }
}

const genderList = (value, vm) => {
  if (value && vm.deceased_gender) {
    return ['M', 'F', 'U'].includes(value)
  } else {
    return true
  }
}
const ageMatchesDates = (age, vm) => {
  if (vm.death_date && vm.deceased_birth_date) {
    return parseInt(age) === Math.floor(DateTime.fromISO(vm.death_date).diff(DateTime.fromISO(vm.deceased_birth_date), 'year').years)
  } else {
    return true
  }
}
export default {
  name: 'BurialForm',
  components: {
    CustomerDetails,
    GraveSelector,
    Document,
    ErrorDisp
  },
  data () {
    return {
      // Page Flags
      error: false,
      burial_loaded: false,
      lists_loaded: false,
      checkConfirmed: false,
      // Charges
      chargeGroups: {},
      selectedCharges: null,
      burialSelectedCharges: [],
      charges: {},
      chargeGroupErrors: [],
      typeCharges: null,
      tariff_id: null,
      burialValue: null,
      // Lists
      noburialdates: {},
      slots: null,
      cods: null,
      undertakers: null,
      // Display flags
      menuBirthDate: false,
      menuDeathDate: false,
      menuBurialDate: false,
      // Burial
      customer_id: null,
      burial_id: null,
      burial_status_ref: null,
      burial_status: null,
      sale_status_ref: null,
      site_ref: null,
      site_id: null,
      grave_no: null,
      codDocumentId: null,
      permitDocumentId: null,
      idDocumentId: null,
      burial: {
        is_legacy: false,
        burial_date: null,
        burial_slot_id: null,
        death_date: null,
        deceased_salutation: null,
        deceased_first_name: null,
        deceased_middle_name: null,
        deceased_last_name: null,
        deceased_address: null,
        deceased_gender: null,
        deceased_birth_date: null,
        deceased_age: null,
        deceased_id_type: null,
        deceased_id_no: null,
        deceased_church: null,
        deceased_denomination: null,
        deceased_religion: null,
        undertaker_id: null,
        cod_id: null,
        cod_description: null,
        cod_is_contagious: false,
        burial_permit_issuer: null,
        burial_permit_no: null,
        deceased_vip_type: null,
        nok_is_customer: false,
        nok_salutation: null,
        nok_first_name: null,
        nok_last_name: null,
        nok_address: null,
        nok_phone1: null,
        nok_phone2: null,
        nok_email: null,
        nok_id_type: null,
        nok_id_no: null,
        nok_relation: null,
        show_public: false,
        cod_is_bid: false
      }
    }
  },
  computed: {
    salutationList: helpers.salutationList,
    relationList: helpers.relationList,
    religionList: helpers.religionList,
    denominationList: helpers.denominationList,
    maxDate () {
      return DateTime.now().plus({month: 1}).toISODate()
    },
    calculatedAge () {
      return this.age(this.burial.deceased_birth_date, this.burial.death_date)
    },
    formatBirthDate () {
      if (this.burial.deceased_birth_date) {
        return this.formatD(this.burial.deceased_birth_date)
      } else {
        return ''
      }
    },
    formatDeathDate () {
      if (this.burial.death_date) {
        return this.formatD(this.burial.death_date)
      } else {
        return ''
      }
    },
    formatBurialDate () {
      if (this.burial.burial_date) {
        return this.formatD(this.burial.burial_date)
      } else {
        return ''
      }
    },
    // =====================
    // Error formatters
    // =====================
    siteIdErrors () {
      const errors = []
      if (!this.$v.site_id.$dirty) return errors
      !this.$v.site_id.required && errors.push('Need to select a site and grave for the burial.')
      return errors
    },
    burialDateErrors () {
      const errors = []
      if (!this.$v.burial.burial_date.$dirty) return errors
      !this.$v.burial.burial_date.required && errors.push('Burial date is required')
      !this.$v.burial.burial_date.dateAfterDeath && errors.push('Burial date must be after date of death')
      return errors
    },
    burialSlotErrors () {
      const errors = []
      if (!this.$v.burial.burial_slot_id.$dirty) return errors
      !this.$v.burial.burial_slot_id.required && errors.push('A burial slot is required')
      return errors
    },
    deceasedSalutationErrors () {
      const errors = []
      if (!this.$v.burial.deceased_salutation.$dirty) return []
      !this.$v.burial.deceased_salutation.required && errors.push('Deceased title is required')
      return errors
    },
    deceasedFirstNameErrors () {
      const errors = []
      if (!this.$v.burial.deceased_first_name.$dirty) return errors
      !this.$v.burial.deceased_first_name.required && errors.push('Deceased first name is required')
      return errors
    },
    deceasedLastNameErrors () {
      const errors = []
      if (!this.$v.burial.deceased_last_name.$dirty) return errors
      !this.$v.burial.deceased_last_name.required && errors.push('Deceased last name is required')
      return errors
    },
    deceasedGenderErrors () {
      const errors = []
      if (!this.$v.burial.deceased_gender.$dirty) return errors
      console.log(this.$v.burial.deceased_gender)
      !this.$v.burial.deceased_gender.required && errors.push('Deceased gender is required')
      !this.$v.burial.deceased_gender.genderList && errors.push('Gender must be one of M, F or U')
      return errors
    },
    deceasedAgeErrors () {
      const errors = []
      if (!this.$v.burial.deceased_age.$dirty) return errors
      !this.$v.burial.deceased_age.required && errors.push('Deceased age is required')
      !this.$v.burial.deceased_age.integer && errors.push('Deceased age must be a number')
      !this.$v.burial.deceased_age.minValue && errors.push('Deceased age must be greater than 0')
      !this.$v.burial.deceased_age.ageMatchesDates && errors.push('Age must match birth and death dates')
      return errors
    },
    deathDateErrors () {
      const errors = []
      if (!this.$v.burial.death_date.$dirty) return errors
      !this.$v.burial.death_date.required && errors.push('Date of death is required')
      !this.$v.burial.death_date.dateAfterBirth && errors.push('Date of death must be after date of birth')
      return errors
    },
    burialPermitIssuerErrors () {
      const errors = []
      if (!this.$v.burial.burial_permit_issuer.$dirty) return errors
      !this.$v.burial.burial_permit_issuer.required && errors.push('Burial permit issuer is required')
      return errors
    },
    burialPermitNoErrors () {
      const errors = []
      if (!this.$v.burial.burial_permit_no.$dirty) return errors
      !this.$v.burial.burial_permit_no.required && errors.push('Burial permit no is required')
      return errors
    },
    permitDocumentErrors () {
      const errors = []
      if (!this.$v.permitDocumentId.$dirty) return errors
      !this.$v.permitDocumentId.required && errors.push('An uploaded burial permit is required.')
      return errors
    },
    codDocumentErrors () {
      const errors = []
      if (!this.$v.codDocumentId.$dirty) return errors
      !this.$v.codDocumentId.required && errors.push('An uploaded cause of death is required.')
      return errors
    },
    codIsBidErrors () {
      const errors = []
      if (!this.$v.burial.cod_is_bid.$dirty) return errors
      !this.$v.burial.cod_is_bid.required && errors.push('Required to selected either Cause of Death or Notice of Death document.')
      return errors
    },
    nokSalutationErrors () {
      const errors = []
      if (!this.$v.burial.nok_salutation.$dirty) return []
      !this.$v.burial.nok_salutation.required && errors.push('Next-of-kin title is required')
      return errors
    },
    nokFirstNameErrors () {
      const errors = []
      if (!this.$v.burial.nok_first_name.$dirty) return errors
      !this.$v.burial.nok_first_name.required && errors.push('Next-of-kin first name is required')
      return errors
    },
    nokLastNameErrors () {
      const errors = []
      if (!this.$v.burial.nok_last_name.$dirty) return errors
      !this.$v.burial.nok_last_name.required && errors.push('Next-of-kin last name is required')
      return errors
    },
    nokAddressErrors () {
      const errors = []
      if (!this.$v.burial.nok_address.$dirty) return errors
      !this.$v.burial.nok_address.required && errors.push('Next-of-kin address is required')
      return errors
    },
    nokPhone1Errors () {
      const errors = []
      if (!this.$v.burial.nok_phone1.$dirty) return errors
      !this.$v.burial.nok_phone1.required && errors.push('Next-of-kin phone 1 is required')
      return errors
    }
  },
  validations: {
    permitDocumentId: {
      required: requiredUnless(function () { return this.burial.is_legacy || !this.checkConfirmed })
    },
    codDocumentId: {
      required: requiredUnless(function () { return this.burial.is_legacy || !this.checkConfirmed })
    },
    site_id: {
      required: requiredUnless(function () { return !this.burial.is_legacy })
    },
    burial: {
      burial_date: {
        required: requiredUnless(function () { return !this.checkConfirmed }),
        dateAfterDeath
      },
      burial_slot_id: {
        required: requiredUnless(function () { return !this.checkConfirmed || this.burial.is_legacy })
      },
      deceased_salutation: {
        required: requiredUnless(function () { return this.burial.is_legacy || !this.checkConfirmed })
      },
      deceased_first_name: {
        required: requiredUnless(function () { return this.burial.is_legacy || !this.checkConfirmed })
      },
      deceased_last_name: {
        required
      },
      deceased_gender: {
        required: requiredUnless(function () { return !this.checkConfirmed }),
        genderList
      },
      deceased_age: {
        required: requiredUnless(function () { return !this.checkConfirmed }),
        integer,
        minValue: minValue(0),
        ageMatchesDates
      },
      death_date: {
        required,
        dateAfterBirth
      },
      burial_permit_issuer: {
        required: requiredUnless(function () { return this.burial.is_legacy || !this.checkConfirmed })
      },
      burial_permit_no: {
        required: requiredUnless(function () { return this.burial.is_legacy || !this.checkConfirmed })
      },
      nok_salutation: {
        required: requiredUnless(function () { return this.burial.is_legacy || this.burial.nok_is_customer })
      },
      nok_first_name: {
        required: requiredUnless(function () { return this.burial.is_legacy || this.burial.nok_is_customer })
      },
      nok_last_name: {
        required: requiredUnless(function () { return this.burial.is_legacy || this.burial.nok_is_customer })
      },
      nok_address: {
        required: requiredUnless(function () { return this.burial.is_legacy || this.burial.nok_is_customer })
      },
      nok_phone1: {
        required: requiredUnless(function () { return this.burial.is_legacy || this.burial.nok_is_customer })
      },
      cod_is_bid: {
        required: requiredUnless(function () { return this.burial.is_legacy || !this.checkConfirmed })
      }
    }
  },
  created () {
    if (this.$route.query.legacy) {
      this.burial.is_legacy = true
      this.checkConfirmed = false
      this.customer_id = parseInt(this.$route.query.customer_id)
    } else {
    // Burial already created before we get here
      this.burial_id = parseInt(this.$route.params.burial_id)

      // Get the burial
      this.secureGet('/api/v1/burials/' + this.burial_id)
        .then(res => {
          if (!res.data) { throw new Error('Burial not found') }
          this.site_ref = res.data.site_ref
          this.site_id = res.data.site_id
          this.grave_no = res.data.grave_no
          this.customer_id = res.data.customer_id
          this.burial_status_ref = res.data.burial_status_ref
          this.burial_status = res.data.burial_status
          this.sale_status_ref = res.data.sale_status_ref
          this.tariff_id = res.data.tariff_id
          if (res.data.burial_date) {
            this.burial.burial_date = DateTime.fromISO(res.data.burial_date).toISODate()
          }
          this.burial.burial_slot_id = res.data.burial_slot_id
          if (this.burial.burial_slot_id || this.burial.burial_date) {
            this.burialDateSelect()
          }
          if (res.data.death_date) {
            this.burial.death_date = DateTime.fromISO(res.data.death_date).toISODate()
          }
          this.burial.deceased_salutation = res.data.deceased_salutation
          this.burial.deceased_first_name = res.data.deceased_first_name
          this.burial.deceased_middle_name = res.data.deceased_middle_name
          this.burial.deceased_last_name = res.data.deceased_last_name
          this.burial.deceased_address = res.data.deceased_address
          this.burial.deceased_gender = res.data.deceased_gender
          if (res.data.deceased_birth_date) {
            this.burial.deceased_birth_date = res.data.deceased_birth_date
          }
          this.burial.deceased_age = res.data.deceased_age
          this.burial.deceased_religion = res.data.deceased_religion
          this.burial.deceased_denomination = res.data.deceased_denomination
          this.burial.deceased_church = res.data.deceased_church
          this.burial.is_legacy = res.data.is_legacy
          this.burial.deceased_id_type = res.data.deceased_id_type
          this.burial.deceased_id_no = res.data.deceased_id_no
          this.burial.id_document_id = res.data.id_document_id
          this.burial.cod_id = res.data.cod_id
          this.burial.undertaker_id = res.data.undertaker_id
          this.burial.cod_description = res.data.cod_description
          this.burial.cod_is_contagious = res.data.cod_is_contagious
          this.burial.cod_document_id = res.data.cod_document_id
          this.burial.burial_permit_issuer = res.data.burial_permit_issuer
          this.burial.burial_permit_no = res.data.burial_permit_no
          this.burial.permit_document_id = res.data.permit_document_id
          this.burial.deceased_vip_type = res.data.deceased_vip_type
          this.burial.nok_is_customer = res.data.nok_is_customer
          this.burial.nok_salutation = res.data.nok_salutation
          this.burial.nok_first_name = res.data.nok_first_name
          this.burial.nok_last_name = res.data.nok_last_name
          this.burial.nok_address = res.data.nok_address
          this.burial.nok_phone1 = res.data.nok_phone1
          this.burial.nok_phone2 = res.data.nok_phone2
          this.burial.nok_email = res.data.nok_email
          this.burial.nok_id_type = res.data.nok_id_type
          this.burial.nok_id_no = res.data.nok_id_no
          this.burial.nok_relation = res.data.nok_relation
          this.burial.show_public = res.data.show_public
          this.burial.cod_is_bid = res.data.cod_is_bid
          this.burialValue = res.data.value
          return this.secureGet('/api/v1/tariffs/' + this.tariff_id + '/other_charges', {parent: 'burial'})
        })
      // Charges
        .then(res => {
          res.data.forEach(chg => {
            this.charges[chg.other_charge_id] = chg
            if (!this.chargeGroups[chg.other_charge_group_id]) {
              this.chargeGroups[chg.other_charge_group_id] = {
                other_charge_group_ref: chg.other_charge_group_ref,
                other_charge_group_id: chg.other_charge_group_id,
                description: chg.other_charge_group_description,
                allow_multiple: chg.allow_multiple,
                required: chg.required,
                charges: {}
              }
              if (chg.allow_multiple) {
                this.chargeGroups[chg.other_charge_group_id].selectedCharges = []
              } else {
                this.chargeGroups[chg.other_charge_group_id].selectedCharges = null
              }
            }
            const grp = this.chargeGroups[chg.other_charge_group_id]
            if (!grp.charges[chg.other_charge_id]) {
              grp.charges[chg.other_charge_id] = chg
            }
          })
          return this.secureGet('/api/v1/burials/' + this.burial_id + '/sale_lines')
        })
        // Sale lines
        .then(res => {
          this.selectedCharges = res.data.filter(v => v.source_object === 'other_charge')
          this.typeCharges = res.data.filter(v => v.source_object === 'type_charge')

          this.selectedCharges.forEach(line => {
            const grp = this.chargeGroups[line.other_charge_group_id]
            const chg = grp.charges[line.charge_id]

            if (grp.allow_multiple) {
              this.$set(grp.selectedCharges, grp.selectedCharges.length, chg.other_charge_id)
            } else {
              this.$set(grp, 'selectedCharges', chg.other_charge_id)
            }
          })
        })
        .then(() => {
          this.burial_loaded = true
        })
        .catch((error) => { this.error = error })
    }

    Promise.all([
      this.secureGet('/api/v1/cods')
        .then(res => {
          this.cods = res.data
        })
        .catch((error) => { this.error = error }),

      this.secureGet('/api/v1/noburialdates/?from=' + DateTime.now().toISODate())
        .then(res => {
          res.data.forEach(sl => {
            this.noburialdates[sl.noburial_date] = true
          })
        })
        .catch((error) => { this.error = error }),

      this.secureGet('/api/v1/undertakers')
        .then(res => {
          this.undertakers = res.data
        })
        .catch((error) => { this.error = error })
    ])
      .then(() => {
        this.lists_loaded = true
      })
  },
  methods: {
    update () {
      this.checkConfirmed = false
      this.$v.$touch()
      this.chargeGroupChange()
      if (!this.$v.$invalid && this.chargeGroupErrors.length === 0) {
        this.postUpdate()
          .then(() => this.$router.go(-1))
          .catch((error) => { this.error = error })
      }
    },
    setConfirmed () {
      this.checkConfirmed = true
      this.$v.$touch()
      this.chargeGroupChange()
      if (!this.$v.$invalid && this.chargeGroupErrors.length === 0) {
        this.postUpdate()
          .then(() => {
            if (this.burial_status_ref === 'DRAFT') {
              return this.securePut('/api/v1/burials/' + this.burial_id + '/confirmed')
            }
          })
          .then(() => this.$router.go(-1))
          .catch((error) => { this.error = error })
      }
    },
    postUpdate () {
      let oUpdate = {burial: this.burial}
      if (this.sale_status_ref === 'DRAFT') {
        oUpdate.updateCharges = this.burialSelectedCharges
      }
      return this.securePut('/api/v1/burials/' + this.burial_id, oUpdate)
    },
    createLegacy () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.burial.customer_id = this.customer_id
        this.burial.site_id = this.site_id
        this.burial.grave_no = this.grave_no

        this.securePost('/api/v1/burial-legacy', {burial: this.burial})
          .then(response => {
            this.$router.push({name: 'Burial', params: { burial_id: response.data.burial_id }})
          })
          .catch(error => (this.error = 'Error creating legacy burial. ' + error))
      }
    },
    siteSelected (val) {
      if (val) {
        this.site_id = val.site_id
        this.grave_no = val.grave_no
        this.$v.site_id.$reset()
      }
    },
    // Charges
    groupLabel (group) {
      return group.description + (group.required ? '*' : '')
    },
    chargeGroupChange () {
      let total = 0
      this.chargeGroupErrors = []
      if (this.sale_status_ref === 'DRAFT') {
        this.burialSelectedCharges = []
        Object.values(this.chargeGroups).forEach(group => {
          if (Array.isArray(group.selectedCharges)) { // ie allow_multiple
            if (group.required && group.selectedCharges.length === 0 && this.$v.$dirty) {
              this.chargeGroupErrors.push(group.description + ' is required.')
            }
            group.selectedCharges.forEach(chargeId => {
              total += parseFloat(this.charges[chargeId].price)
              this.burialSelectedCharges.push(chargeId)
            })
          } else {
            if (group.selectedCharges) {
              total += parseFloat(this.charges[group.selectedCharges].price)
              this.burialSelectedCharges.push(group.selectedCharges)
            } else {
              if (group.required && this.$v.$dirty) {
                this.chargeGroupErrors.push(group.description + ' is required.')
              }
            }
          }
        })

        this.burialValue = total + this.typeCharges.reduce((acc, curr) => acc + parseFloat(curr.price), 0)
      }
    },
    makeChargeGroupDescription (item) {
      return this.formatM(item.price) + ' - ' + item.description
    },
    // Brial Slots
    makeSlotDescription (item) {
      return `${item.description} ${this.formatSlot(item.from)} - ${this.formatSlot(item.to)}. ${item.burials_available} available.`
    },
    makeSlotDisabled (item) {
      return item.burials_available === 0
    },
    // Date handling
    burialDateSelect () {
      this.menuBurialDate = false

      this.secureGet('/api/v1/burials/slots/' + this.burial.burial_date)
        .then(res => {
          this.slots = res.data
        })
        .catch((error) => { this.error = error })
    },
    minBurialDate () {
      if (!this.checkConfirmed) {
        return DateTime.local().toISODate()
      } else {
        return '1900-01-01'
      }
    },
    maxBurialDate () {
      if (this.burial_status_ref === 'COMPLETE') {
        return DateTime.local().toISODate()
      } else {
        return DateTime.local().plus({ months: 6 }).toISODate()
      }
    },
    calcAge () {
      this.burial.deceased_age = this.age(this.burial.deceased_birth_date, this.burial.death_date)
    },
    allowedBurialDates (val) {
      return !this.noburialdates[val]
    }
  }
}
</script>

<style scoped>

</style>
