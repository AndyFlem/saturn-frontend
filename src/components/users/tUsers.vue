<template>
  <div>
    <error-disp v-model="error"/>

    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Users
            <v-spacer/>
            <v-btn
              color="primary"
              dark
              class="pt-0"
              fab
              :disabled="!$userCheckPermission('PERM_USERS_EDIT')"
              @click="$router.push({name: 'New User'})"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="mt-5 pl-5 text-body-1">
              <v-row v-for="(user, indx) in users" :key="indx">
                <v-col cols="12">
                  <v-card class="mb-2">
                    <v-card-text class="text-body-1 pb-1 pt-1">
                      <user-details @deleted="deleted(indx)" v-model="user.user_id"/>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import UserDetails from '@/components/users/UserDetails'

export default {
  name: 'Users',
  components: {
    ErrorDisp,
    UserDetails
  },
  props: [],
  data () {
    return {
      error: null,
      users: null,
      selectedSite: null
    }
  },
  computed: {
  },
  created () {
    this.secureGet('/api/v1/users')
      .then(res => {
        this.users = res.data
      })
      .catch(err => { this.error = err })
  },
  methods: {
    deleted (indx) {
      this.users.splice(indx, 1)
    }
  }
}
</script>

<style scoped>

</style>
