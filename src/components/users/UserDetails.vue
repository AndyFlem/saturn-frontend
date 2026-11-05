<template>
  <div>
    <template v-if="user">
      <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
      <v-row no-gutters>
        <v-col cols="10">
          <v-row no-gutters>
            <v-col cols="12" sm="4" class="">
              <router-link :to="{name: 'User', params: {user_id: user.user_id}}">
                <b>{{user.last_name}}<span v-if="user.first_name">, {{user.first_name}}</span></b>
                <span v-if="!user.can_login"> (No login)</span>
              </router-link>
            </v-col>
            <v-col cols="12" sm="4">
              <span>{{user.email}}</span>
            </v-col>
            <v-col cols="12" sm="4" class="">
              <span v-if="user.phone">Phone: <b>{{user.phone}}</b></span>
            </v-col>
          </v-row>
          <v-row no-gutters v-if="user.department || user.position">
            <v-col cols="12" sm="4" class="">
              <span v-if="user.department">Department: <b>{{user.department}}</b></span>
            </v-col>
            <v-col cols="12" sm="4">
              <span v-if="user.position">Position: <b>{{user.position}}</b></span>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12" sm="4">
              <span>Last login: <b>{{formatD(user.last_login)}}</b></span>
            </v-col>
            <v-col cols="12" sm="4">
              <span v-if="!user.can_login">No login</span>
            </v-col>
          </v-row>
        </v-col>
        <v-col v-if="!NoButtons" cols="2">
          <v-btn
            icon
            :disabled="!$userCheckPermission('PERM_USERS_EDIT')"
            @click="showDeleteForm()"
            color="primary">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn
            icon
            :disabled="!$userCheckPermission('PERM_USERS_EDIT')"
            @click="$router.push({name:'Edit User', params: {user_id: user.user_id}})"
            color="primary">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-dialog v-model="deleteForm" persistent max-width="500">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Delete user
          </v-card-title>
          <v-card-text class="pt-7">
            Are you sure you want to delete this user?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="cancelDelete">Cancel</v-btn>
            <v-btn color="error" @click="deleteUser">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
    <v-skeleton-loader v-else type="article"></v-skeleton-loader>
  </div>
</template>

<script>
export default {
  name: 'UserDetails',
  props: {
    value: Number,
    NoButtons: Boolean
  },
  data () {
    return {
      user: null,
      error: null,
      deleteForm: false
    }
  },
  created () {
  },
  watch: {
    value: {
      immediate: true,
      handler: function (newVal) {
        if (newVal == null) return
        this.secureGet('/api/v1/users/' + newVal)
          .then(res => {
            this.user = res.data
          })
          .catch((error) => { this.error = error })
      }
    }
  },
  methods: {
    showDeleteForm () {
      this.deleteForm = true
    },
    cancelDelete () {
      this.deleteForm = false
    },
    deleteUser () {
      this.secureDelete('/api/v1/users/' + this.user.user_id)
        .then(() => {
          this.deleteForm = false
          this.$emit('deleted')
        })
        .catch(err => { this.error = err })
    }
  }
}
</script>

<style scoped>

</style>
