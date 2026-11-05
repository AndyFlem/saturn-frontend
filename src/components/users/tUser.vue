<template>
  <div>
    <error-disp v-model="error"/>
    <v-alert v-if="success" type="success">{{success}}</v-alert>
    <v-row v-if="user" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            <span v-if="user.first_name" class="pl-1 pr-1">{{user.first_name }}</span>&nbsp;{{ user.last_name }}
          </v-card-title>
          <v-card-text class="mt-5 ml-3 text-body-1">
            <user-details v-model="user.user_id" no-buttons/>
          </v-card-text>
          <v-card-text>
              <div class="ml-3 text-body-1">
                <span class="font-weight-bold">Roles:</span>&nbsp;
                <span v-if="roles.length>0">
                  <template v-for="(role,index) in roles">
                    <div class="pl-7">
                      {{role.role_name}}
                    </div>
                  </template>
                </span>
                <span v-else>
                  No roles.
                </span>
              </div>
          </v-card-text>
          <v-card-text>
              <div class="ml-3 text-body-1">
                <span class="font-weight-bold">Permissions:</span>&nbsp;
                <span v-if="permissions.length>0">
                  <template v-for="(perm,index) in permissions">
                    <div class="pl-7">
                      {{perm.permission}}
                    </div>
                  </template>
                </span>
                <span v-else>
                  No permissions.
                </span>
              </div>
          </v-card-text>
          <v-card-actions class="pb-5">
            <v-spacer/>
            <v-btn
              class="mr-4 white--text"
              color="red"
              v-if="$userCheckPermission('PERM_USERS_EDIT')"
              @click="showDeleteForm"
            >
              Delete
            </v-btn>
            <v-btn
              class="mr-4"
              color="primary"
              v-if="$userCheckPermission('PERM_USERS_EDIT')"
              :to="{ name: 'Edit User', params: { user_id: user.user_id } }"
            >
              Edit
            </v-btn>
            <v-btn
              class="mr-4"
              color="primary"
              :disabled="!($userCheckPermission('PERM_USERS_EDIT') || userId === $user().user_id)"
              @click="passwordForm = true"
            >
              Update Password
            </v-btn>
          </v-card-actions>
        <v-dialog v-model="passwordForm" persistent max-width="500">
          <v-card class="elevation-4">
            <v-card-title class="primary white--text">
              Update Password
            </v-card-title>
            <v-card-text class="mt-5 pt-2">
              <v-form>
                <v-text-field
                  v-model="password"
                  label="Password"
                  :error-messages="passwordErrors"
                  prepend-icon="mdi-lock"
                  type="password"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="password_confirmation"
                  label="Confirm Password"
                  :error-messages="passwordConfirmationErrors"
                  @keyup.enter="updatePassword()"
                  prepend-icon="mdi-lock"
                  type="password"
                  required
                ></v-text-field>
                <v-switch
                  label="Email password?"
                  v-model="sendEmail"
                ></v-switch>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="passwordForm=false">Cancel</v-btn>
              <v-btn color="primary" @click="updatePassword()">Ok</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="deleteForm" persistent max-width="500">
          <v-card class="elevation-4">
            <v-card-title class="primary white--text">
              Delete User
            </v-card-title>
            <v-card-text class="mt-5 pt-2">
              Are you sure you want to delete this user?
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="cancelDelete">Cancel</v-btn>
              <v-btn color="error" @click="deleteUser">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        </v-card>
      </v-col>
    </v-row>
    <v-row  v-if="user" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <audit parentObjectType="user" v-bind:parentObjectId="user.user_id"/>
      </v-col>
    </v-row>
    <v-row  v-if="user" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-row v-if="history.length>0" no-gutters justify="center" align="center">
          <v-col cols="12">
              <v-expansion-panels>
                <v-expansion-panel>
                <v-expansion-panel-header>
                  Object History
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div class="caption"  v-for="(hist) in history" v-bind:key="hist.audit_id">
                    {{formatT(hist.audit_at)}} {{hist.object}} {{hist.object_id}} {{hist.action}} {{hist.message}}
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import Audit from '@/components/shared/Audit'
import ErrorDisp from '@/components/shared/Error'
import UserDetails from '@/components/users/UserDetails'

export default {
  name: 'User',
  components: {
    Audit,
    ErrorDisp,
    UserDetails
  },
  props: [],
  data () {
    return {
      error: null,
      success: null,
      userId: null,
      user: null,
      history: [],
      permissions: [],
      roles: [],
      passwordForm: false,
      deleteForm: false,
      password: null,
      password_confirmation: null,
      sendEmail: true
    }
  },
  validations: {
    password: {
      required
    },
    password_confirmation: {
      required
    }
  },
  computed: {
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
      this.userId = this.$route.params.user_id
      this.secureGet('/api/v1/users/' + this.userId)
        .then(res => {
          this.user = res.data
          return this.secureGet('/api/v1/users/' + this.userId + '/history')
        })
        .then(res => {
          this.history = res.data
          return this.secureGet('/api/v1/users/' + this.userId + '/permissions')
        })
        .then(res => {
          this.permissions = res.data
          return this.secureGet('/api/v1/users/' + this.userId + '/roles')
        })
        .then(res => {
          this.roles = res.data
        })
        .catch(err => { this.error = err })
    }
  },
  methods: {
    showDeleteForm () {
      this.deleteForm = true
    },
    cancelDelete () {
      this.deleteForm = false
    },
    updatePassword () {
      this.$v.$touch()
      if (!this.$v.$invalid && this.password === this.password_confirmation) {
        this.passwordForm = false
        this.securePut('/api/v1/users/' + this.userId + '/password', {password: this.password, send_email: this.sendEmail})
          .then(() => {
            this.success = 'Password updated.'
            this.password = null
            this.password_confirmation = null
            setTimeout(() => { this.success = null }, 4000)
          })
          .catch(err => { this.error = err })
      }
    },
    deleteUser () {
      this.secureDelete('/api/v1/users/' + this.user.user_id)
        .then(() => {
          this.deleteForm = false
          this.$router.push({name: 'Users'})
        })
        .catch(err => { this.error = err })
    }
  }
}
</script>

<style scoped>

</style>
