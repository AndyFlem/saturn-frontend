<template>
    <div>
      <error-disp v-model="error"/>
      <v-row align="center" justify="center">
        <v-col cols="12" md="11" lg="8">
          <v-card class="elevation-4">
            <v-card-title class="primary white--text">
              Bulk Import
            </v-card-title>
            <v-card-text class="black--text">
              <v-row no-gutters>
                <v-col cols="12" class="pb-0">
                  <v-file-input
                    v-model="file"
                    class="pt-7 pb-0"
                    accept="text/csv"
                    :disabled="readonly"
                    :label="'Select CSV'"
                    @change="upload"
                    :error-messages="errorMessages"
                  ></v-file-input>
                </v-col>
              </v-row>
              <v-row no-gutters justify="start" align="center">
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
              <v-row>
                <v-col cols="12">
                  <v-checkbox
                    v-model="dryrun"
                    label="Attempt import and check for errors without saving data."
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12"><span>{{ response }}</span></v-col>
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
  name: 'BulkImport',
  components: {
    ErrorDisp
  },
  data () {
    return {
      error: null,
      uploadProgress: 0,
      file: null,
      errorMessages: [],
      response: '',
      dryrun: true
    }
  },
  computed: {

  },
  created () {
  },
  methods: {
    upload (file) {
      if (!file) { return false }
      this.error = null
      const formData = new FormData()

      formData.append('file', file)
      formData.append('dryrun', this.dryrun)

      if (this.customerId) { formData.append('customer_id', this.customerId) }

      this.securePostNoTimeout('/api/v1/bulkimport', formData, event => { this.uploadProgress = Math.round((100 * event.loaded) / event.total) })
        .then(response => {
          this.file = null
          this.uploadProgress = 0
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'ImportErrors.csv')
          document.body.appendChild(link)
          link.click()
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>

  <style scoped>

  </style>
