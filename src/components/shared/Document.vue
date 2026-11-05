<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-row no-gutters>
      <v-col v-if="!readonly" cols="12" class="pb-0">
        <v-file-input
          v-model="file"
          class="pt-0 pb-0"
          accept="image/*,.pdf"
          :disabled="readonly"
          :label="label || 'Select document'"
          @change="selectDocuments"
          :error-messages="errorMessages"
        ></v-file-input>
      </v-col>
      <template v-if="document">
        <template v-if="document.filename">
          <v-col cols="12" class="pt-1 pb-1">
            <a v-if="download" target="_blank" :href="documentHref(document.filename)" class="text-body-1">
              <v-icon color="primary" class="text-h5 pr-1">mdi-download</v-icon>{{document.filename}}
            </a>
            <template v-else>
              <v-icon color="grey" class="text-h5 pr-1">mdi-download</v-icon>{{document.filename}}
            </template>
          </v-col>
        </template>
      </template>
      <v-col v-else cols="12" class="pt-1 pb-1">
        <v-skeleton-loader type="text" class="mx-auto" />
      </v-col>
    </v-row>
    <v-row v-if="uploadProgress>0" no-gutters justify="start" align="center">
      <v-col cols="8">
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
  </div>
</template>

<script>

export default {
  name: 'Document',
  props: [
    'value',
    'errorMessages',
    'parentObject',
    'parentObjectId',
    'documentPropertyRef',
    'customerId',
    'label',
    'readonly',
    'download'],
  data () {
    return {
      document: null,
      uploadProgress: 0,
      file: null,
      error: null
    }
  },
  computed: {
  },
  created () {
    this.loadDocument()
  },
  watch: {
    value (val) {
      this.loadDocument()
    }
  },
  methods: {
    loadDocument () {
      let url = '/api/v1/document_property/' + this.parentObject + '/' + this.parentObjectId + '/' + this.documentPropertyRef
      this.secureGet(url)
        .then(response => {
          if (response.data) {
            //console.log(response.data)
            this.document = response.data
            this.$emit('input', this.document.document_id)
          } else {
            this.document = {}
          }
        })
        .catch((error) => {
          this.error = error
        })
    },
    selectDocuments (file) {
      if (!file) { return false }
      this.error = null
      const formData = new FormData()
      this.document = null

      formData.append('file', file)
      formData.append('user_id', JSON.parse(localStorage.user).user_id)
      if (this.customerId) { formData.append('customer_id', this.customerId) }

      this.securePostNoTimeout('/api/v1/document_property/' + this.parentObject + '/' + this.parentObjectId + '/' + this.documentPropertyRef, formData, event => { this.uploadProgress = Math.round((100 * event.loaded) / event.total) })
        .then((res) => {
          console.log(res)
          this.document = {filename: res.data.filename}
          this.file = null
          this.uploadProgress = 0
          this.$emit('input', res.data.document_id)
        })
        .catch((error) => { this.error = error })
    },
    documentHref (docName) {
      return this.$config.API_URL + '/asset/' + this.parentObject + '/' + this.parentObjectId + '/' + docName
    }
  }
}
</script>

<style scoped>

</style>
