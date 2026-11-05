<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">User</v-card-title>
          <v-card-text class="mt-10 ml-3">
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    class="pt-0 pb-0"
                      v-model="first_name"
                      autocomplete="off"
                      label="First Name"
                      :error-messages="firstNameErrors"
                      type="text"
                      required
                    ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    class="pt-0 pb-0"
                      v-model="last_name"
                      autocomplete="off"
                      label="Last Name"
                      :error-messages="lastNameErrors"
                      type="text"
                      required
                    ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    class="pt-0 pb-0"
                      v-model="email"
                      autocomplete="off"
                      label="Email"
                      :error-messages="emailErrors"
                      type="email"
                      required
                    ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    class="pt-0 pb-0"
                      v-model="phone"
                      autocomplete="off"
                      label="Phone Number"
                      type="text"
                      required
                    ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    class="pt-0 pb-0"
                      v-model="department"
                      autocomplete="off"
                      label="Department"
                      type=""
                      required
                    ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    class="pt-0 pb-0"
                      v-model="position"
                      autocomplete="off"
                      label="Job Position"
                      type="text"
                      required
                    ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-switch
                    class="pt-0 pb-0 mt-0 mb-0"
                      v-model="can_login"
                      label="Can login?"
                    ></v-switch>
                </v-col>
              </v-row>
              <v-text-field
               class="pt-0 pb-0"
                v-if="!editMode"
                v-model="password"
                autocomplete="off"
                label="Password"
                :error-messages="passwordErrors"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>
              <v-text-field
               class="pt-0 pb-0"
                v-if="!editMode"
                v-model="password_confirmation"
                autocomplete="off"
                label="Confirm Password"
                :error-messages="passwordConfirmationErrors"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="$router.go(-1)">Cancel</v-btn>
            <v-btn color="primary" v-if="editMode" @click="updateUser">Update</v-btn>
            <v-btn color="primary" v-if="!editMode" @click="createUser">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { required, email, requiredUnless } from 'vuelidate/lib/validators'
import ErrorDisp from '@/components/shared/Error'

export default {
  name: 'UserForm',
  components: {
    ErrorDisp
  },
  data () {
    return {
      email: null,
      first_name: null,
      last_name: null,
      can_login: true,
      phone: null,
      department: null,
      position: null,
      password: '',
      password_confirmation: '',
      error: null,
      editMode: false
    }
  },
  validations: {
    last_name: {
      required
    },
    first_name: {
      required
    },
    email: {
      required,
      email
    },
    password: {
      required: requiredUnless(function () { return this.editMode })
    },
    password_confirmation: {
      required: requiredUnless(function () { return this.editMode })
    }
  },
  computed: {
    lastNameErrors () {
      const errors = []
      if (!this.$v.last_name.$dirty) return errors
      !this.$v.last_name.required && errors.push('Last name is required')
      return errors
    },
    firstNameErrors () {
      const errors = []
      if (!this.$v.first_name.$dirty) return errors
      !this.$v.first_name.required && errors.push('First name is required')
      return errors
    },
    emailErrors () {
      const errors = []
      if (!this.$v.email.$dirty) return errors
      !this.$v.email.email && errors.push('Must be valid e-mail')
      !this.$v.email.required && errors.push('E-mail is required')
      return errors
    },
    passwordErrors () {
      const errors = []
      if (!this.$v.password.$dirty) return errors
      !this.$v.password.required && errors.push('Password is required')
      return errors
    },
    passwordConfirmationErrors () {
      const errors = []
      if (!this.$v.password_confirmation.$dirty) return errors
      !this.$v.password_confirmation.required && errors.push('Password confirmation is required')
      this.password !== this.password_confirmation && errors.push('Password confirmation must match password')
      return errors
    }
  },
  created () {
    if (this.$route.params.user_id) {
      this.editMode = true
      this.userId = this.$route.params.user_id
      this.secureGet('/api/v1/users/' + this.userId)
        .then(res => {
          this.first_name = res.data.first_name
          this.last_name = res.data.last_name
          this.email = res.data.email
          this.position = res.data.position
          this.department = res.data.department
          this.phone = res.data.phone
          this.can_login = res.data.can_login
        })
        .catch(err => { this.error = err })
    }
  },
  methods: {
    createUser () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        const payload = { phone: this.phone, department: this.department, position: this.position, email: this.email, password: this.password, first_name: this.first_name, last_name: this.last_name, password_confirmation: this.password_confirmation }
        this.securePost('/api/v1/users', payload)
          .then(() => {
            this.$router.push('/users')
          })
          .catch(error => { this.error = error })
      }
    },
    updateUser () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        const payload = { phone: this.phone, department: this.department, position: this.position, email: this.email, first_name: this.first_name, last_name: this.last_name, can_login: this.can_login }
        this.securePut('/api/v1/users/' + this.userId, payload)
          .then(this.$router.go(-1))
          .catch(error => { this.error = error })
      }
    }
  }
}
</script>

<style scoped>

</style>
