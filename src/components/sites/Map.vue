<template>
  <v-row style="height:100%;">
    <v-col style="height: 85vh; min-height:400px;" cols="12" :sm="`${siteTypeId ? '12': '8'}`" :md="`${siteTypeId ? '12': '8'}`" :lg="`${siteTypeId ? '12': '9'}`" class="pr-0">
      <div style="height: 100%; min-height:400px; z-index: 1; background-color: #F5F5F5;" id="mapEl" class="map"></div>
    </v-col>
    <v-col v-if="!siteTypeId" cols="12" sm="4" md="4" lg="3" class="pl-0">
      <slot></slot>
    </v-col>
  </v-row>
</template>

<script>
import 'ol/ol.css'
import 'ol-layerswitcher/dist/ol-layerswitcher.css'
import {Map, View} from 'ol'
import {Vector as VectorSource} from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'

import {Fill, Stroke, Style} from 'ol/style'
import {get as getProjection, getTransform} from 'ol/proj'
import OSM from 'ol/source/OSM'
import {Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'

import ImageWMS from 'ol/source/ImageWMS'
import proj4 from 'proj4'
import {register} from 'ol/proj/proj4'
import LayerSwitcher from 'ol-layerswitcher'

// Included from tSitesMap.vue and SiteTypeSelect.vue
export default {
  name: 'Map',
  props: {
    value: Number,
    siteTypeId: Number,
    center: Array,
    zoom: Number,
    highlightGeometries: Array
  },
  components: {
  },
  data () {
    return {
      selectedSiteId: null,
      error: null,
      map: null
    }
  },
  mounted () {
    this.setupMap()
    if (this.highlightGeometries) {
      this.highlightGeometries.forEach(geom => {
        const siteFeat = new GeoJSON().readFeature(geom)
        this.highlightSitesSource.addFeature(siteFeat)
      })
      this.highlightSitesSource.changed()
    }
    setTimeout(() => {
      this.map.renderSync()
      this.map.updateSize()
    }, 200)
  },
  destroyed () {
    if (this.map) {
      this.map.setTarget(null)
      this.map = null
    }
  },
  methods: {
    /*
    exportMap () {
      let _this = this
      this.map.once('rendercomplete', function () {
        var mapCanvas = document.createElement('canvas')
        var size = _this.map.getSize()
        mapCanvas.width = size[0]
        mapCanvas.height = size[1]
        var mapContext = mapCanvas.getContext('2d')
        Array.prototype.forEach.call(
          document.querySelectorAll('.ol-layer canvas'),
          function (canvas) {
            if (canvas.width > 0) {
              var opacity = canvas.parentNode.style.opacity
              mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity)
              var transform = canvas.style.transform
              // Get the transform parameters from the style's transform matrix
              var matrix = transform
                .match(/^matrix\(([^(]*)\)$/)[1]
                .split(',')
                .map(Number)
              // Apply the transform to the export map context
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContext,
                matrix
              )
              mapContext.drawImage(canvas, 0, 0)
            }
          }
        )
        if (navigator.msSaveBlob) {
          // link download attribuute does not work on MS browsers
          navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png')
        } else {
          const url = mapCanvas.toDataURL()
          window.open(url, '_blank')
        }
      })
      this.map.renderSync()
    },
    */
    emitValue () {
      this.$emit('input', this.selectedSiteId)
    },
    setupMap () {
      console.log('Center:', this.center, ' Zoom: ', this.zoom)
      let _this = this

      proj4.defs('EPSG:100000', '+proj=omerc +lat_0=-15.41981 +lonc=28.3668 +alpha=12.85 +gamma=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=mm +to_meter=0.001 +no_defs')
      register(proj4)
      let projLocal = getProjection('EPSG:100000')
      var fromLonLat = getTransform('EPSG:4326', projLocal)

      this.selectedSitesSource = new VectorSource()
      this.selectedSites = new VectorLayer({source: this.selectedSitesSource})
      this.selectedSites.set('name', 'Selected')
      this.selectedSites.setStyle(new Style({
        fill: new Fill({color: 'rgba(255,215,0,0.5)'}),
        stroke: new Stroke({color: 'rgb(255,215,0)', width: 4})
      }))
      this.highlightSitesSource = new VectorSource()
      this.highlightSites = new VectorLayer({source: this.highlightSitesSource})
      this.highlightSites.set('name', 'Highlighted')
      this.highlightSites.setStyle(new Style({
        fill: new Fill({color: 'rgba(255,0,215,0.5)'}),
        stroke: new Stroke({color: 'rgb(255,0,215)', width: 4})
      }))

      function addLayer (name, title, visible, style = '') {
        return new ImageLayer({
          title: title,
          visible: visible,
          source: new ImageWMS({
            url: _this.$config.API_URL + '/api/v1/geo/geoserver/wms',
            projection: projLocal,
            params: {'LAYERS': _this.$config.GEOSERVER_WORKSPACE + ':' + name, 'TILED': false, 'STYLES': style},
            serverType: 'geoserver',
            transition: 0
          })
        })
      }

      let sitesParams = {'LAYERS': this.$config.GEOSERVER_WORKSPACE + ':sites', 'TILED': false}
      if (this.siteTypeId) {
        sitesParams = {'LAYERS': this.$config.GEOSERVER_WORKSPACE + ':sites_by_type', 'TILED': false, 'viewparams': 'site_type_id:' + this.siteTypeId + ';'}
      }
      const sitesWMS = new ImageWMS({
        url: _this.$config.API_URL + '/api/v1/geo/geoserver/wms',
        projection: projLocal,
        params: sitesParams,
        serverType: 'geoserver',
        transition: 0
      })
      const sitesLayer = new ImageLayer({
        title: 'Sites',
        source: sitesWMS,
        className: (this.highlightGeometries ? 'bw' : '')
      })
      const thisCenter = this.center ? fromLonLat(this.center) : fromLonLat(this.$config.MAP_CENTER)
      console.log('Center:' + this.center)
      const view = new View({
        projection: projLocal,
        center: thisCenter,
        zoom: this.zoom ? this.zoom : this.$config.MAP_ZOOM,
        rotation: -Math.PI / 2 // Math.PI / 180 * (-13.327 - 90)
      })
      const layerSwitcher = new LayerSwitcher()

      const lyrs = [
        new TileLayer({title: 'OSM', visible: false, source: new OSM()}),
        addLayer('layout_poly', 'Layout', true),
        sitesLayer,
        addLayer('sites_by_group', 'Site Types', false),
        addLayer('photos', 'Photos', false, 'site_photos'),
        addLayer('graves', 'Headstones', !(this.siteTypeId || this.highlightGeometries)),
        addLayer('burials', 'Burials', !(this.siteTypeId || this.highlightGeometries)),
        addLayer('flagged', 'Flagged Sites', !(this.siteTypeId || this.highlightGeometries)),
        addLayer('blocks', 'Blocks', true),
        this.selectedSites,
        this.highlightSites
      ]

      this.map = new Map({
        layers: lyrs,
        target: 'mapEl',
        view: view
      })
      this.map.addControl(layerSwitcher)
      this.map.on('singleclick', function (evt) {
        var viewResolution = /** @type {number} */ (view.getResolution())
        var url = sitesWMS.getFeatureInfoUrl(
          evt.coordinate,
          viewResolution,
          'EPSG:100000',
          {'INFO_FORMAT': 'application/json'}
        )
        if (url) {
          fetch(url)
            .then(function (response) { return response.text() })
            .then(function (json) {
              const feat = JSON.parse(json).features[0].properties
              console.log('Feature clicked: ', JSON.stringify(feat))
              _this.selectedSiteId = feat.site_id
              _this.emitValue()
              const siteFeat = new GeoJSON().readFeature(feat.geometry_local_json)
              siteFeat.setId(feat.site_id)
              _this.selectedSitesSource.clear()
              _this.selectedSitesSource.addFeature(siteFeat)
              _this.selectedSitesSource.changed()
            })
        }
      })
    }
  }
}
</script>

<style>
      .bw {
        filter: grayscale(70%);
      }
</style>
