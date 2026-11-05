<template>
     <v-main>
        <v-container class="fill-height" fluid>
          <v-row align="center" justify="center" >
            <v-col cols="12" sm="8" md="4">
              <v-card class="elevation-12 pb-1">
                <v-toolbar color="primary" dark flat>
                  <v-toolbar-title>Login</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                  <v-form>
                    <v-text-field
                      v-model="email"
                      label="Email"
                      placeholder=" "
                      persistent-placeholder
                      :error-messages="emailErrors"
                      prepend-icon="mdi-account"
                      type="email"
                      required
                    ></v-text-field>
                    <v-text-field
                      v-model="password"
                      label="Password"
                      placeholder=" "
                      persistent-placeholder
                      :error-messages="passwordErrors"
                      prepend-icon="mdi-lock"
                      @keyup.enter="signin"
                      type="password"
                      required
                    ></v-text-field>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="signin">Login</v-btn>
                </v-card-actions>
                <v-alert class="ml-5 mr-5" v-if="error" type="error">{{ error }}</v-alert>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'

export default {
  name: 'Signin',
  data () {
    return {
      email: '',
      password: '',
      error: null
    }
  },
  validations: {
    email: {
      required,
      email
    },
    password: {
      required
    }
  },
  computed: {
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
    }
  },
  methods: {
    signin () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.$userSignin(this.email, this.password)
          .then(response => {
            if (this.$route.query.redirect) {
              this.$router.replace(this.$route.query.redirect)
            } else {
              this.$router.replace('/')
            }
          })
          .catch((error) => {
            if (error.response) {
              if (error.response.status === 404 || error.response.status === 401) {
                this.error = 'Incorrect email or password'
              } else {
                this.error = error
              }
            } else {
              this.error = error
            }
          })
      }
    }
  }
}
</script>

<style scoped>

</style>
