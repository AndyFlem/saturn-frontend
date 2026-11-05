<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="9" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Roles
          </v-card-title>
          <v-card-text class="">
            <v-row v-if="rolesReady">
              <v-col cols="12" v-for="role in Object.values(roles)" :key="role.role_ref">
                <v-card class="mb-2" >
                  <v-card-title class="body-1 secondary">{{ role.role_name }}</v-card-title>
                  <v-card-text v-if="ready">
                    <v-row>
                      <v-col cols="6">
                        <v-container>
                          <v-select
                            :items="Object.values(role.permissions_available)"
                            :menu-props="{ maxHeight: '400' }"
                            v-model="role.selectedPermission"
                            label="Permissions"
                            return-object
                            item-text="permission"
                            item-value="permission_id"
                            @change="addPermission($event, role)"
                            dense
                          ></v-select>
                          <v-row v-for="(permission, index) in role.permissions" :key="permission.permission_ref">
                            <v-col class="" cols="12">
                              <v-btn
                                icon
                                class="pl-9 pr-9"
                                @click="deletePermission(permission, role, index)"
                                x-small
                              >
                                <v-icon>mdi-delete</v-icon>
                              </v-btn><span>{{ permission.permission }}</span></v-col>
                          </v-row>
                        </v-container>
                      </v-col>
                      <v-col cols="6">
                        <v-container>
                          <v-select
                            :items="Object.values(role.users_available)"
                            :menu-props="{ maxHeight: '400' }"
                            v-model="role.selectedUser"
                            label="Users"
                            return-object
                            item-text="user_name"
                            item-value="user_id"
                            @change="addUser($event, role)"
                            dense
                          ></v-select>
                          <v-row v-for="(user, index) in role.users" :key="user.email">
                            <v-col class="" cols="12">
                              <v-btn
                                icon
                                class="pl-9 pr-9"
                                @click="deleteUser(user, role, index)"
                                x-small
                              >
                                <v-icon>mdi-delete</v-icon>
                              </v-btn><span>{{ user.user_name }}</span></v-col>
                          </v-row>
                        </v-container>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-skeleton-loader type="article" v-else/>
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
export default {
  name: 'Roles',
  components: {
    ErrorDisp
  },
  props: [],
  data () {
    return {
      error: null,
      roles: [],
      users: null,
      permissions: null,
      rolesReady: false,
      ready: false
    }
  },
  computed: {
  },
  created () {
    Promise.all([
      this.secureGet('/api/v1/users')
        .then(res => {
          this.users = res.data
        }),
      this.secureGet('/api/v1/permissions')
        .then(res => {
          this.permissions = res.data
        }),
      this.secureGet('/api/v1/roles')
        .then(res => {
          res.data.forEach(r => {
            r.users = {}
            r.permissions = {}
            this.$set(this.roles, r.role_ref, r)
            this.$set(this.roles[r.role_ref], 'selectedPermission', null)
            this.$set(this.roles[r.role_ref], 'selectedUser', null)
          })
          this.rolesReady = true
          return this.secureGet('/api/v1/roles_users')
        })
        .then(res => {
          res.data.forEach(u => {
            this.roles[u.role_ref].users[u.email] = u
          })
          return this.secureGet('/api/v1/roles_permissions')
        })
        .then(res => {
          res.data.forEach(p => {
            this.roles[p.role_ref].permissions[p.permission_ref] = p
          })
        })
    ])
      .then(() => {
        Object.values(this.roles).forEach(ro => {
          ro.users_available = {}
          this.users.forEach(us => {
            if (!ro.users[us.email]) {
              ro.users_available[us.email] = us
            }
          })

          ro.permissions_available = {}
          this.permissions.forEach(pr => {
            if (!ro.permissions[pr.permission_ref]) {
              ro.permissions_available[pr.permission_ref] = pr
            }
          })
          this.roles[ro.role_ref].permissions = Object.values(this.roles[ro.role_ref].permissions)
          this.roles[ro.role_ref].users = Object.values(this.roles[ro.role_ref].users)
        })

        this.ready = true
      })
      .catch(err => { this.error = err })
  },
  watch: {
  },
  methods: {
    addPermission (permission, role) {
      this.securePost('/api/v1/roles/' + role.role_id + '/permission', {permission_id: permission.permission_id})
        .then(() => {
          this.roles[role.role_ref].permissions.push(permission)
          delete role.permissions_available[permission.permission_ref]
          role.selectedPermission = null
        })
        .catch(error => { this.error = error })
    },
    deletePermission (permission, role, index) {
      console.log(permission, role, index)
      this.secureDelete('/api/v1/roles/' + role.role_id + '/permission/' + permission.permission_id)
        .then(() => {
          this.roles[role.role_ref].permissions.splice(index, 1)
          role.permissions_available[permission.permission_ref] = permission
          // role.selectedPermission = null
        })
        .catch(error => { this.error = error })
    },
    addUser (user, role) {
      this.securePost('/api/v1/roles/' + role.role_id + '/user', {user_id: user.user_id})
        .then(() => {
          this.roles[role.role_ref].users.push(user)
          delete role.users_available[user.email]
          role.selectedUser = null
        })
        .catch(error => { this.error = error })
    },
    deleteUser (user, role, index) {
      console.log(user, role, index)
      this.secureDelete('/api/v1/roles/' + role.role_id + '/user/' + user.user_id)
        .then(() => {
          this.roles[role.role_ref].users.splice(index, 1)
          role.users_available[user.email] = user
        })
        .catch(error => { this.error = error })
    }
  }
}
</script>

<style scoped>

</style>
