<template>
  <v-card class="mb-5">
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-card-text>
      <template v-if="siteType">
      <v-row no-gutters justify="space-between">
        <v-col cols="12" sm="4">
          <div class="font-weight-bold text-subtitle-1"><router-link :to="{ name: 'Site Type', params: { site_type_id: siteType.site_type_id }}">{{siteType.site_type}}</router-link> {{siteType.site_type_ref}}</div>
          <div class=""><b>Type: </b>{{siteType.site_type_category}}, {{siteType.site_type_group}}</div>
          <div class=""><b>Available: </b>{{siteType.saleable ? 'yes' : 'no'}}, <b>Pre-need: </b>{{siteType.allow_preneed ? 'yes' : 'no'}}</div>
          <div class=""><b>Graves: </b>{{siteType.graves}}</div>
        </v-col>
        <v-col v-if="typeCharges.length>0" cols="12" sm="4">
          <template v-for="charge in typeCharges">
            <div :key="charge.type_charge_id">{{charge.description}}: {{formatM(charge.price)}}</div>
          </template>
          <div class=""><b>Site: </b>{{formatM(siteType.current_type_charge)}}</div>
        </v-col>
        <v-col v-if="burialCharges.length>0" cols="12" sm="4">
          <template v-for="charge in burialCharges">
            <div :key="charge.type_charge_id">{{charge.description}}: {{formatM(charge.price)}}</div>
          </template>
          <div class=""><b>Burial: </b>{{formatM(siteType.current_burial_charge)}}</div>
          <div><v-divider/></div>
          <div class=""><b>At-need Total: </b>{{formatM(parseFloat(siteType.current_type_charge) + parseFloat(siteType.current_burial_charge))}}</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="pt-0">
          <div class="">{{siteType.description}}</div>
        </v-col>
      </v-row>
      </template>
      <v-skeleton-loader
        v-else
        type="article"
      ></v-skeleton-loader>
    </v-card-text>
  </v-card>
</template>

<script>
// import CustomerDetails from '@/components/customer/CustomerDetails'

export default {
  name: 'SiteTypeSearchResult',
  components: {
  },
  props: ['value'],
  data () {
    return {
      siteType: null,
      typeCharges: [],
      burialCharges: [],
      error: null
    }
  },
  created () {
    this.secureGet('/api/v1/site_types/' + this.value)
      .then(res => {
        this.siteType = res.data
      })
      .catch((error) => { this.error = error })

    this.secureGet('/api/v1/tariffs/-1/type_charges?siteTypeId=' + this.value)
      .then(res => {
        res.data.forEach(chg => {
          if (chg.parent_object === 'burial') {
            this.burialCharges.push(chg)
          } else {
            this.typeCharges.push(chg)
          }
        })
      })
      .catch((error) => { this.error = error })
  },
  watch: {
  },
  methods: {

  }
}
</script>

<style scoped>
</style>
