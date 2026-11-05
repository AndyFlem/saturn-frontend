<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            System
          </v-card-title>
          <v-card-text class="black--text">
            <v-row>
              <v-col>
                <v-card outlined>
                  <b>Socket</b>
                  <pre class="caption">{{ $socket.connected ? 'Connected' : 'Disconnected' }}</pre>
                </v-card>
              </v-col>
            </v-row>  
            <v-row>
              <v-col>
                <v-card outlined>
                  <b>Users</b>
                  <template v-for="user in users">
                    <pre :key="user.user_id" class="caption">{{user.user_name}} ({{user.user_id}}) - {{ user.connections }} connections.</pre>
                  </template>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-card outlined>
                  <b>Frontend</b>
                  <pre class="caption">{{vue_app_version}}</pre>
                  <pre class="caption">{{JSON.stringify($config, null, 2)}}</pre>
                </v-card>
              </v-col>  
            </v-row> 
            <v-row>
              <v-col>
                <v-card outlined>
                  <b>Backend</b>
                  <pre class="caption">{{JSON.stringify(backend, null, 2)}}</pre>
                </v-card>
              </v-col>
            </v-row> 

          </v-card-text>
        </v-card>
        <v-card v-if="this.backend" class="elevation-4">
          <v-card-title class="primary white--text">
            Actions
          </v-card-title>
          <v-card-text class="pt-5">
            <v-btn :disabled="!this.backend.development_mode" @click="anonymize">Anonymize</v-btn>
          </v-card-text>
          <v-card-text>
            <v-btn @click="logoutUsers">Logout all users</v-btn>
          </v-card-text>          
          <v-card-text>
            <v-btn @click="doError">Trigger backend error</v-btn>
          </v-card-text>
          <v-card-text>
            <v-btn @click="doScheduled">Call scheduled jobs</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'

export default {
  name: 'System',
  components: {
    ErrorDisp
  },
  data () {
    return {
      error: null,
      vue_app_version: process.env.VUE_APP_VERSION,
      backend: null,
      users: null
    }
  },
  computed: {

  },
  created () {
    this.secureGet('/api/v1/system')
      .then(res => {
        this.backend = res.data
      })
      .catch(err => { this.error = err })
      this.secureGet('/api/v1/system/indexSocketUsers')
      .then(res => {
        this.users = res.data
      })
      .catch(err => { this.error = err })
        
  },
  methods: {
    anonymize () {
      this.securePost('/api/v1/anonymize')
        .catch(err => { this.error = err })
    },
    logoutUsers () {
      this.securePost('/api/v1/system/logoutUsers')
        .catch(err => { this.error = err })
    },
    doError () {
      this.securePost('/api/v1/system/throw_error')
        .catch(err => { this.error = err })
    },
    doScheduled () {
      this.secureGet('/api/v1/system/scheduled_tasks')
        .catch(err => { this.error = err })
    }
  }
}
</script>

<style scoped>

</style>
