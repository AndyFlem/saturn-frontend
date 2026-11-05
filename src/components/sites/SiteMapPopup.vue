<template>
  <span>
    <a
      v-if="centroid"
      title="Show on Google Maps"
      class="text-decoration-none"
      color="primary"
      :href="`https://www.google.com/maps/search/?api=1&query=${centroid[1]},${centroid[0]}`"
      target="_blank">
        <v-icon color="primary" class="text-h5" :dark="dark">mdi-google-maps</v-icon>
    </a>
    <v-btn
      icon
      small
      v-if="$userCheckPermission('PERM_VIEW')"
      class="ml-0 mr-3"
      :color="dark ? 'white' : 'primary'"
      @click="showMap = true"
      title="Show map"
    >
      <v-icon class="text-h5">mdi-map</v-icon>
    </v-btn>
    <v-dialog v-model="showMap" fullscreen>
       <v-card height="100%">
        <v-toolbar dark color="primary">
          <v-btn
            class="mr-5"
            text
            title="Close"
            color="white"
            dark @click="showMap = false">
            <v-icon class="text-h5">mdi-close</v-icon>Close
          </v-btn>
        </v-toolbar>
        <v-card-text class="white">
          <sites-map
            v-if="showMap"
            :highlight-geometries="geoms"
            :center="centroid"
            :zoom="zm"
            :site-id="site ? site.site_id : null"
            />
        </v-card-text>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import SitesMap from '@/components/sites/tSitesMap'

export default {
  name: 'SiteMapPopup',
  props: {
    site: Object,
    highlightGeometries: Array,
    dark: Boolean
  },
  components: {
    SitesMap
  },
  data () {
    return {
      showMap: false
    }
  },
  computed: {
    zm () {
      if (this.site) {
        return 21
      } else {
        return null
      }
    },
    geoms () {
      if (this.site) {
        return [this.site.geometry_local_json]
      } else {
        return this.highlightGeometries
      }
    },
    centroid () {
      if (this.site) {
        // console.log('Site centroid: ', this.site.centroid_json)
        return JSON.parse(this.site.centroid_json).coordinates
      } else {
        return null
      }
    }
  },
  created () {
  },
  methods: {
  }
}
</script>
