<template>
  <v-row v-if="requests && requests.length>0 && (count>0 || $userCheckPermission('PERM_AUTH_VIEW'))" align="center" justify="center">
    <v-col cols="12" md="11" lg="10">
      <v-expansion-panels :value="0">
        <v-expansion-panel>
          <v-expansion-panel-header class="primary white--text text-h6 pt-3 pb-3">
            <span class="white--text">Outstanding Authorisations:&nbsp;<span v-if="$userCheckPermission('PERM_AUTH_VIEW')"> {{ requests.length }}</span><span v-else>{{ count }}</span></span>
            <template v-slot:actions>
              <v-icon color="white">
                $expand
              </v-icon>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card v-for="request in requests" :key="request.authorization_request_id" class="mt-2 mb-2">
              <error-disp v-model="error"/>
              <v-card-text class="pt-3 pb-3 text-body-1">
                <v-row no-gutters>
                  <v-col cols="12">
                    
                    <sale-search-result no-stat flat v-if="request.object=='sale'" :value="request.object_id" />
                    <credit-search-result no-stat flat v-else-if="request.object=='credit'" :value="request.object_id" />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12" class="d-flex">
                    <div>
                      <div>
                        <span class="text-body-1">{{ request.authorizations_made }} of {{ request.authorizations_total }} provided</span>
                        <span v-if="request.authorizations_made > 0">
                          <span v-for="auth in request.authorizations" :key="auth.authorization_id">: {{ auth.first_name }} {{ auth.last_name }}</span>
                        </span>
                      </div>
                      <div><span class="text-body-1"><b>{{ request.description }}</b></span></div>
                    </div>
                    <v-spacer/>
                    <v-btn
                      color="orange"
                      dark
                      small
                      :disabled="pending"
                      v-if="request.canAuthorize"
                      @click="authorize(request)"
                    >
                      Authorise
                    </v-btn>                    
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>            
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import SaleSearchResult from '@/components/sales/SaleSearchResult'
import CreditSearchResult from '@/components/credit/CreditSearchResult'

export default {
  name: 'AuthRequests',
  components: {
    ErrorDisp,
    SaleSearchResult,
    CreditSearchResult
  },
  props: {
  },
  data () {
    return {
      requests: null,
      count: 0,
      error: null,
      pending: false
    }
  },
  computed: {
  },
  watch: {
    value: function (val) {
      this.load()
    }
  },
  created () {
    this.load()
  },
  methods: {
    canAuthorize (request) {
      if (request.authorizations.filter(a => a.authorized_user_id === this.$user().user_id).length > 0) { return false }
      if (!this.$userCheckPermission(request.permission_ref)) { return false }
      return true
    },
    authorize (request) {
      this.pending = true
      this.securePost(`/api/v1/authorize/${request.object}/${request.object_id}`)
        .then(res => {
          request.authorizations.push(res.data)
          request.authorizations_made += 1
          request.canAuthorize = false

          // Remove the request from the list
          if (request.authorizations_made >= request.authorizations_total) {
            this.requests = this.requests.filter(r => r.authorization_request_id !== request.authorization_request_id)
          }
        })
        .catch((error) => { this.error = error })
        .finally(() => { this.pending = false })
    },
    load () {
      this.requests = null
      this.secureGet('/api/v1/authorizationrequests_outstanding')
        .then(res => {
          // For each request determine if the current user can authorize
          const requests = res.data
            .map(request => {
              request.canAuthorize = this.canAuthorize(request)
              this.count += request.canAuthorize ? 1 : 0
              return request
            })
          this.requests = requests
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>

<style scoped>

</style>
