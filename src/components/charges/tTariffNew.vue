<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="10">
        <v-card v-if="tariff" class="elevation-0">
          <v-card-title class="primary white--text">
            <span>Tariff: {{tariff.name}}</span>
            <v-spacer/>
            <v-switch
              :disabled="!$userCheckPermission('PERM_SALES_SUPER')"
              no-detail
              class="font-weight-bold pt-0 pb-0"
              dark
              label="Edit"
              v-model="editMode"
            />
          </v-card-title>
          <v-card-text class="mt-5">
            <tariff-site-charges v-if="tariff" :tariff="tariff" :edit-mode="editMode"/>
            <tariff-other-charges v-if="tariff" :tariff="tariff" :edit-mode="editMode"/>
            <tariff-event-charges v-if="tariff" :tariff="tariff" :edit-mode="editMode"/>
            <tariff-sitework-charges v-if="tariff" :tariff="tariff" :edit-mode="editMode"/>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

import ErrorDisp from '@/components/shared/Error'
import TariffSiteCharges from './TariffSiteCharges.vue'
import TariffOtherCharges from './TariffOtherCharges.vue'
import TariffEventCharges from './TariffEventCharges.vue'
import TariffSiteworkCharges from './TariffSiteworkCharges.vue'

export default {
  name: 'Tariff',
  components: {
    ErrorDisp,
    TariffSiteCharges,
    TariffOtherCharges,
    TariffEventCharges,
    TariffSiteworkCharges
  },
  data () {
    return {
      error: null,
      tariff: null,
      editMode: false
    }
  },
  methods: { },
  created () {
    this.tariffId = this.$route.params.tariff_id
    // Get the tariff
    this.secureGet('/api/v1/tariffs/' + this.tariffId)
      .then(res => {
        this.tariff = res.data
      })
  }
}
</script>
