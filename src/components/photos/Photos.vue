<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-card :outlined="narrow">
      <v-card-title :class="narrow ?  'white font-weight-bold text-body-1 pt-2 pb-0' : 'secondary text-h6' ">
        <span>Photos</span>
      </v-card-title>
      <v-card-text>
        <div v-if="photos">
          <div v-if="photos.length>0">
            <v-row>
              <template v-for="(photo,index) in photos">
                <v-col
                  :cols="narrow ? 4 : 6"
                  :sm="narrow ? 6 : 3"
                  :class="`pb-0 ${narrow ? 'text-caption' : 'text-body-1'}`">
                  <v-btn
                    icon
                    :x-small="narrow"
                    class="pt-0 pb-0 mb-0"
                    v-if="!readonly"
                    @click="deletePhoto(photo.photo_id, index)"
                    color="primary"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  {{formatT(photo.attached_at)}}
                  <a href="#" @click.stop.prevent="openPhoto(photo)">
                    <v-img max-width="75" max-height="75" :src="thumbHref(photo)"/>
                  </a>
                </v-col>
              </template>
            </v-row>
            <v-row>
              <v-col cols="12" class="pt-5 pb-0" >
                <v-divider/>
              </v-col>
            </v-row>
          </div>
        </div>
        <v-skeleton-loader
          v-else
          type="article"
        ></v-skeleton-loader>
        <v-row  v-if="!readonly" no-gutters>
          <v-col cols="12" class="pb-0">
            <v-file-input
              v-model="file"
              class="pt-7 pb-0"
              accept="image/*"
              :disabled="readonly"
              :label="'Select photo'"
              @change="upload"
              :error-messages="errorMessages"
            ></v-file-input>
          </v-col>
        </v-row>
        <v-row  v-if="!readonly" no-gutters justify="start" align="center">
          <v-col cols="12">
            <div>
              <v-progress-linear
                v-model="uploadProgress"
                color="primary"
                height="25"
                reactive
              >
                <strong>{{ uploadProgress }} %</strong>
              </v-progress-linear>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-dialog v-model="photoDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon @click="closePhotoDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ selectedPhoto ? selectedPhoto.filename : 'Photo' }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            v-if="selectedPhoto"
            text
            :href="documentHref(selectedPhoto)"
            :download="selectedPhoto.filename"
            target="_blank"
            rel="noopener"
          >
            <v-icon left>mdi-download</v-icon>
            Download
          </v-btn>
        </v-toolbar>
        <v-card-text class="d-flex align-center justify-center pa-0 black" style="height: calc(100vh - 64px);">
          <img
            v-if="selectedPhoto"
            class="photo-preview"
            :src="documentHref(selectedPhoto)"
            :alt="selectedPhoto.filename"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'Photos',
  components: {
  },
  props: {
    readonly: Boolean,
    narrow: Boolean,
    siteId: Number,
    siteRef: String
  },
  data () {
    return {
      photos: [],
      error: null,
      uploadProgress: 0,
      file: null,
      errorMessages: [],
      photoDialog: false,
      selectedPhoto: null
    }
  },
  watch: {
  },
  computed: {
  },
  mounted () {
    this.reloadPhotos()
  },
  methods: {
    thumbHref (doc) {
      return this.$config.API_URL + '/asset/site/' + this.siteId + '/' + doc.filename.replace('Photo', 'Thumb')
    },
    documentHref (doc) {
      return this.$config.API_URL + '/asset/site/' + this.siteId + '/' + doc.filename
    },
    openPhoto (photo) {
      this.selectedPhoto = photo
      this.photoDialog = true
    },
    closePhotoDialog () {
      this.photoDialog = false
      this.selectedPhoto = null
    },
    deletePhoto (photoId, index) {
      console.log(photoId, index)
      this.secureDelete('/api/v1/sites/photos/' + photoId)
        .catch((error) => { this.error = error })
      this.photos.splice(index, 1)
    },
    reloadPhotos () {
      this.photos = []
      this.secureGet('/api/v1/sites/' + this.siteId + '/photos')
        .then(response => {
          this.photos = response.data.sort((a, b) => {
            return a.created_at - b.created_at
          })
        })
        .catch((error) => { this.error = error })
    },
    upload (file) {
      if (!file) { return false }
      this.error = null
      const formData = new FormData()

      formData.append('file', file)
      formData.append('site_ref', this.siteRef)

      if (this.customerId) { formData.append('customer_id', this.customerId) }

      this.securePostNoTimeout('/api/v1/sites/' + this.siteId + '/photos', formData, event => { this.uploadProgress = Math.round((100 * event.loaded) / event.total) })
        .then((res) => {
          this.photos.push({ photo_id: res.data.photo_id, filename: res.data.filename, attached_at: res.data.attached_at, size_mb: res.data.size_mb })
          this.file = null
          this.uploadProgress = 0
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>

<style scoped>
.photo-preview {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

</style>
