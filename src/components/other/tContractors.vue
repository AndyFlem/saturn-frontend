<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Contractors
            <v-spacer/>
            <v-dialog
              v-model="dialog"
              persistent
              max-width="600px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  fab
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">New Contractor</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" class="pt-0 pb-0 text-body-1 d-flex">
                        <v-select
                          class=""
                          v-model="newUnder.contractor_type_id"
                          :items="contractorTypes"
                          item-text="contractor_type"
                          item-value="contractor_type_id"
                          :error-messages="contractorTypeErrors"
                          label="Contractor Type"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="pt-0 pb-0 text-body-1 d-flex">
                        <v-text-field
                            class=""
                            dense
                            v-model="newUnder.name"
                            :error-messages="nameErrors"
                            label="Name"
                            type="text"
                          />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="pt-0 pb-0">
                        <v-text-field
                            dense
                            v-model="newUnder.address_physical"
                            :error-messages="physicalAddressErrors"
                            label="Physical address"
                            type="text"
                          />
                      </v-col>
                      <v-col cols="12" class="pt-0 pb-0">
                        <v-text-field
                            dense
                            v-model="newUnder.address_postal"
                            :error-messages="postalAddressErrors"
                            label="Postal address"
                            type="text"
                          />
                      </v-col>
                      <v-col cols="12" class="pt-0 pb-0">
                        <v-text-field
                            dense
                            v-model="newUnder.phone1"
                            :error-messages="phone1Errors"
                            label="Phone"
                            type="text"
                          />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="4" class="pt-0 pb-0">
                        <v-text-field
                            dense
                            v-model="newUnder.contact_salutation"
                            :error-messages="salutationErrors"
                            label="Contact title"
                            type="text"
                          />
                      </v-col>
                      <v-col cols="8" class="pt-0 pb-0">
                        <v-text-field
                            dense
                            v-model="newUnder.contact_first_name"
                            :error-messages="firstNameErrors"
                            label="Contact first name"
                            type="text"
                          />
                      </v-col>
                      <v-col cols="12" class="pt-0 pb-0">
                        <v-text-field
                            dense
                            :error-messages="lastNameErrors"
                            v-model="newUnder.contact_last_name"
                            label="Contact last name"
                            type="text"
                          />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="6" class="pt-0 pb-0">
                        <v-text-field
                            dense
                            :error-messages="phoneErrors"
                            v-model="newUnder.contact_phone"
                            label="Contact phone"
                            type="text"
                          />
                      </v-col>
                      <v-col cols="6" class="pt-0 pb-0">
                        <v-text-field
                            dense
                            :error-messages="emailErrors"
                            v-model="newUnder.contact_email"
                            label="Contact email"
                            type="text"
                          />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions class="justify-end">
                  <v-btn @click="dialog = false" color="primary">
                    Cancel
                  </v-btn>
                  <v-btn @click="createUnder" color="primary">
                    Add
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

          </v-card-title>
          <v-card-text v-if="contractors">
            <v-card v-for="(under, i) in contractors" :key="under.contractor_id" class="mt-3 mb-3">
              <v-card-text v-if="!under.edit" class="text-body-2">
                <v-row>
                  <v-col cols="12" md="6" class="pt-0 pb-0 text-body-1">
                    <v-btn
                      icon
                      v-if="under.burial_count==0"
                      class="pt-0 pb-0"
                      @click="deleteUnder(under, i)"
                      color="grey"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      class="pt-0 pb-0"
                      @click="clickUnder(under)"
                      color="grey"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <b>{{under.name}}</b>
                  </v-col>
                  <v-col cols="12" md="6" class="pt-5 pb-0"><b>Contractor Type: </b>{{under.contractor_type}}</v-col>
                  <v-col cols="12" md="4" class="pt-5 pb-0"><b>Address: </b>{{under.address_physical}}</v-col>
                  <v-col cols="12" md="4" class="pt-5 pb-0"><b>Postal: </b>{{under.address_postal}}</v-col>
                  <v-col cols="12" md="4" class="pt-5 pb-0"><b>Phone: </b>{{under.phone1}}</v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="pt-5 pb-0"><b>Contact person:</b></v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="4" lg="3" class="pt-0 pb-0">{{under.contact_salutation}} {{under.contact_first_name}} {{under.contact_last_name}}</v-col>
                  <v-col cols="12"  md="4" lg="3" class="pt-0 pb-0">Phone: {{under.contact_phone}}</v-col>
                  <v-col cols="12"  md="4" lg="3" class="pt-0 pb-0">Email: <a :href="`mailto:${under.contact_email}`">{{under.contact_email}}</a></v-col>
                </v-row>
              </v-card-text>
              <v-card-text v-else>
                <v-row>
                  <v-col cols="12" md="6" class="pt-0 pb-0 text-body-1 d-flex">
                    <v-btn
                      icon
                      class="pt-0 pb-0"
                      @click="updateUnder(under)"
                      color="green"
                    >
                      <v-icon>mdi-check</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      class="pt-0 pb-0"
                      @click="under.edit = false; $forceUpdate()"
                      color="red"
                    >
                      <v-icon>mdi-cancel</v-icon>
                    </v-btn>
                    <v-text-field
                        class="ml-10"
                        dense
                        v-model="under.name"
                        label="Name"
                        type="text"
                      />
                  </v-col>
                  <v-col cols="12" md="6" class="pt-0 pb-0 text-body-1 d-flex">
                        <v-select
                          class=""
                          dense
                          v-model="under.contractor_type_id"
                          :items="contractorTypes"
                          item-text="contractor_type"
                          item-value="contractor_type_id"
                          label="Contractor Type"
                        ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="pt-0 pb-0">
                    <v-text-field
                        dense
                        v-model="under.address_physical"
                        label="Physical address"
                        type="text"
                      />
                  </v-col>
                  <v-col cols="12" md="6" class="pt-0 pb-0">
                    <v-text-field
                        dense
                        v-model="under.address_postal"
                        label="Postal address"
                        type="text"
                      />
                  </v-col>
                  <v-col cols="12" md="6" class="pt-0 pb-0">
                    <v-text-field
                        dense
                        v-model="under.phone1"
                        label="Phone"
                        type="text"
                      />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="2" md="2" class="pt-0 pb-0">
                    <v-text-field
                        dense
                        v-model="under.contact_salutation"
                        label="Contact title"
                        type="text"
                      />
                  </v-col>
                  <v-col cols="5" md="3" class="pt-0 pb-0">
                    <v-text-field
                        dense
                        v-model="under.contact_first_name"
                        label="Contact first name"
                        type="text"
                      />
                  </v-col>
                  <v-col cols="5" md="3" class="pt-0 pb-0">
                    <v-text-field
                        dense
                        v-model="under.contact_last_name"
                        label="Contact last name"
                        type="text"
                      />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6" class="pt-0 pb-0">
                    <v-text-field
                        dense
                        v-model="under.contact_phone"
                        label="Contact phone"
                        type="text"
                      />
                  </v-col>
                  <v-col cols="12" md="6" class="pt-0 pb-0">
                    <v-text-field
                        dense
                        v-model="under.contact_email"
                        label="Contact email"
                        type="text"
                      />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import { required, email } from 'vuelidate/lib/validators'
export default {
  name: 'System',
  components: {
    ErrorDisp
  },
  data () {
    return {
      error: null,
      contractors: null,
      contractorTypes: [],
      newUnder: {
        name: null,
        address_physical: null,
        address_postal: null,
        phone1: null,
        contact_salutation: null,
        contact_first_name: null,
        contact_last_name: null,
        contact_phone: null,
        contact_email: null
      },
      dialog: false
    }
  },
  validations: {
    newUnder: {
      contractor_type_id: {
        required
      },
      name: {
        required
      },
      address_physical: {
        required
      },
      address_postal: {
        required
      },
      phone1: {
        required
      },
      contact_salutation: {
        required
      },
      contact_first_name: {
        required
      },
      contact_last_name: {
        required
      },
      contact_phone: {
        required
      },
      contact_email: {
        required,
        email
      }
    }
  },
  computed: {
    contractorTypeErrors () {
      const errors = []
      if (!this.$v.newUnder.contractor_type_id.$dirty) return errors
      !this.$v.newUnder.contractor_type_id.required && errors.push('Contractor type is required')
      return errors
    },
    nameErrors () {
      const errors = []
      if (!this.$v.newUnder.name.$dirty) return errors
      !this.$v.newUnder.name.required && errors.push('Contractor name is required')
      return errors
    },
    physicalAddressErrors () {
      const errors = []
      if (!this.$v.newUnder.address_physical.$dirty) return errors
      !this.$v.newUnder.address_physical.required && errors.push('Physical address is required')
      return errors
    },
    postalAddressErrors () {
      const errors = []
      if (!this.$v.newUnder.address_postal.$dirty) return errors
      !this.$v.newUnder.address_postal.required && errors.push('Postal address is required')
      return errors
    },
    phone1Errors () {
      const errors = []
      if (!this.$v.newUnder.phone1.$dirty) return errors
      !this.$v.newUnder.phone1.required && errors.push('Phone number is required')
      return errors
    },
    salutationErrors () {
      const errors = []
      if (!this.$v.newUnder.contact_salutation.$dirty) return errors
      !this.$v.newUnder.contact_salutation.required && errors.push('Contact title is required')
      return errors
    },
    firstNameErrors () {
      const errors = []
      if (!this.$v.newUnder.contact_first_name.$dirty) return errors
      !this.$v.newUnder.contact_first_name.required && errors.push('Contact first name is required')
      return errors
    },
    lastNameErrors () {
      const errors = []
      if (!this.$v.newUnder.contact_last_name.$dirty) return errors
      !this.$v.newUnder.contact_last_name.required && errors.push('Contact last name is required')
      return errors
    },
    phoneErrors () {
      const errors = []
      if (!this.$v.newUnder.contact_phone.$dirty) return errors
      !this.$v.newUnder.contact_phone.required && errors.push('Contact phone is required')
      return errors
    },
    emailErrors () {
      const errors = []
      if (!this.$v.newUnder.contact_email.$dirty) return errors
      !this.$v.newUnder.contact_email.required && errors.push('Contact email is required')
      !this.$v.newUnder.contact_email.email && errors.push('Contact email is required')
      return errors
    }
  },
  created () {
    this.secureGet('/api/v1/contractors')
      .then(res => {
        this.contractors = res.data
        return this.secureGet('/api/v1/contractor_types')
      })
      .then(res => {
        this.contractorTypes = res.data
      })
      .catch((error) => { this.error = error })
  },
  methods: {
    createUnder () {
      this.$v.newUnder.$touch()
      if (!this.$v.newUnder.$invalid) {
        this.securePost('/api/v1/contractors/', this.newUnder)
          .then(() => {
            this.dialog = false
            this.$router.go()
          })
          .catch((error) => { this.error = error })
      }
    },
    deleteUnder (under, index) {
      this.secureDelete('/api/v1/contractors/' + under.contractor_id)
        .then(() => {
          this.contractors.splice(index, 1)
        })
        .catch((error) => { this.error = error })
    },
    clickUnder (under) {
      this.contractors.forEach(under => { under.edit = false })
      under.edit = true
      this.$forceUpdate()
    },
    updateUnder (under) {
      const upd = {...under}
      delete upd.contractor_id
      delete upd.edit
      delete upd.burial_count
      delete upd.contractor_type
      delete upd.contractor_type_ref
      delete upd.contractor_type_ordinal
      this.securePut('/api/v1/contractors/' + under.contractor_id, upd)
        .then(() => {
          this.contractors.forEach(under => { under.edit = false })
          this.$forceUpdate()
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>

<style scoped>

</style>
