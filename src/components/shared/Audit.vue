<template>
  <v-row v-if="$userCheckPermission('PERM_SALES_SUPER') && audits.length>0" no-gutters justify="center" align="center">
    <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
          <v-expansion-panel-header>
            History
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="caption"  v-for="(audit, index) in audits" v-bind:key="audit.audit_id">
              {{index+1}}. {{audit.action}} {{formatTime(audit.audit_at)}}
              <router-link v-if="$userCheckPermission('PERM_USERS_VIEW')" :to="{ name: 'User', params: { user_id: audit.user_id }}">{{ audit.last_name }}<span v-if="audit.first_name">, {{audit.first_name}}</span>.</router-link>
              <span v-else><b>{{ audit.last_name }}<span v-if="audit.first_name">, {{audit.first_name}}</span></b>.</span>
              {{audit.message}}
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>
</template>

<script>
import { DateTime } from 'luxon'
export default {
  name: 'Audit',
  props: ['parentObjectType', 'parentObjectId'],
  data () {
    return {
      audits: []
    }
  },
  computed: {
  },
  created () {
    this.secureGet('/api/v1/audits/' + this.parentObjectType + '/' + this.parentObjectId)
      .then(response => {
        this.audits = response.data
      })
      .catch(err => { this.error = err })
  },
  methods: {
    formatTime (val) {
      return DateTime.fromISO(val).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)
    },
  }
}
</script>

<style scoped>

</style>
