<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-header class="secondary text-h6 pb-2">
          <span>Documents&nbsp;<span v-if="documents.length>0">({{documents.length}})</span></span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
            <v-row v-if="documents.length>0" no-gutters justify="center" align="center">
              <v-col cols="12" class="pb-0">
                <template v-for="(document,index) in documents" :key="document.document_id">
                  <v-row no-gutters>
                    <v-col cols="3" sm="2" md="1" class="pt-0 pb-0 d-flex align-center">
                        <v-checkbox
                        @click="documentActive(document.document_id, document.selected)"
                        v-model="document.selected"
                        v-if="email"
                        color="primary"
                        class="text-h5 pt-0 mt-0"
                        hide-details
                        ></v-checkbox>
                      <v-icon
                          v-if="downloadEnabled(document) && document.can_delete && !readonly"
                          @click="deleteDocument(document, index)"
                          class="text-h5"
                          color="primary"
                        >
                          mdi-delete
                        </v-icon>
                    </v-col>
                    <v-col cols="3" sm="4" class="pt-0 pb-0 d-flex align-center text-body-1">
                      {{objectDescription(document)}}
                    </v-col>
                    <v-col cols="6" sm="6" class="pt-2 pb-0">
                      <v-row>
                        <v-col cols="12" class="pt-0 pb-0">
                          <a target="_blank" :href="documentHref(document)">
                            <v-icon :color="downloadEnabled(document) ? 'primary' : 'grey'" class="text-h5 pr-3 pl-0">mdi-download</v-icon><span class="text-body-1">{{document.filename}}</span>
                          </a>

                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" class="pt-0 pb-0">
                          <span class="text-body-2">{{formatD(document.attached_at)}} {{document.size_mb}} MB</span>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" class="pt-0 pb-1" >
                      <v-divider/>
                    </v-col>
                  </v-row>
                </template>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="pt-5">
                  <v-btn
                    class="mr-5"
                    color="primary"
                    v-if="email && documents.length > 0"
                    :disabled="selectedList.length===0"
                    @click="sendEmail"
                  >
                    Email Selected
                  </v-btn>
              </v-col>
            </v-row>
            <template v-if="parentObjectType && parentObjectId && !readonly">
              <v-row no-gutters justify="center" align="center">
                <v-col cols="12" sm="8">
                  <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
                  <v-alert v-if="success" type="success">{{success}}</v-alert>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="12" sm="8">
                  <v-file-input
                    chips
                    multiple
                    v-model="files"
                    hide-details
                    density="compact"
                    :disabled="readonly"
                    accept="image/*,.pdf"
                    label="Add documents"
                    @change="selectDocuments"
                  ></v-file-input>
                </v-col>
                <v-col cols="12" sm="4" class="pl-2">
                  <v-btn variant="elevated" append-icon="mdi-cloud-upload" color="primary" :disabled="files.length<1" @click="uploadDocuments">
                    Uploads
                  </v-btn>
                </v-col>
              </v-row>
              <v-row no-gutters justify="start" align="center">
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
            </template>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>

export default {
  name: 'Documents',
  props: {
    readonly: Boolean,
    email: String,
    customerId: Number,
    objects: Array,
    parentObjectType: String,
    parentObjectId: Number
  },
  data () {
    return {
      documents: [],
      uploadProgress: 0,
      files: [],
      selected: {},
      selectedList: [],
      error: null,
      success: null
    }
  },
  watch: {
    objects: function (old, news) {
      this.reloadDocuments()
    }
  },
  computed: {
  },
  created () {
    if (this.objects) { this.reloadDocuments() }
  },
  methods: {
    objectDescription (doc) {
      let objName = ''
      switch (doc.parent_object) {
        case 'credit':
          objName = `Credit Note ${doc.parent_object_id}`
          break
        case 'voucher':
          objName = `Credit Voucher ${doc.parent_object_id}`
          break
        case 'sale':
          objName = `Sale ${doc.parent_object_id}`
          break
        case 'receipt':
          objName = `Receipt ${doc.parent_object_id}`
          break
        case 'sale_site':
          objName = `Site ${doc.parent_object_id}`
          break
        case 'burial':
          objName = `Burial ${doc.parent_object_id}`
          break
        case 'customer':
          objName = `Customer ${doc.parent_object_id}`
          break
        case 'sitework':
          objName = `Sitework ${doc.parent_object_id}`
          break
        default:
          objName = `${doc.parent_object_id}`
      }
      return objName
    },
    downloadEnabled (doc) {
      switch (doc.parent_object) {
        case 'credit':
          return this.$userCheckPermission('PERM_ACCOUNTS')
        case 'voucher':
          return this.$userCheckPermission('PERM_ACCOUNTS')
        case 'sale':
          return this.$userCheckPermission('PERM_VIEW')
        case 'sale_site':
          return this.$userCheckPermission('PERM_VIEW')
        case 'burial':
          return this.$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')
        case 'customer':
          return this.$userCheckPermission('PERM_DOCUMENT_DOWNLOAD')
        case 'receipt':
          return this.$userCheckPermission('PERM_ACCOUNTS')
        case 'sitework':
          return this.$userCheckPermission('PERM_WORKS')
        default:
          return false
      }
    },
    sendEmail () {
      this.securePost('/api/v1/documents/email', {customer_id: this.customerId, document_ids: this.selectedList})
        .then(() => {
          this.success = 'Email sent'
          setTimeout(() => { this.success = null }, 4000)
        })
        .catch((error) => { this.error = error })

      this.documents.forEach(doc => {
        this.selected = {}
        this.selectedList = []
        doc.selected = false
      })
    },
    documentActive (documentId, selected) {
      if (selected) {
        this.selected[documentId] = true
      } else {
        delete this.selected[documentId]
      }
      this.selectedList = Object.keys(this.selected)
    },
    deleteDocument (document, index) {
      this.secureDelete('/api/v1/documents/' + document.document_id)
        .catch((error) => { this.error = error })
      this.documents.splice(index, 1)
    },
    selectDocuments (files) {
      this.error = null
      this.files = files
    },
    uploadDocuments () {
      this.error = null
      const formData = new FormData()
      this.files.forEach(file => {
        formData.append(file.name, file)
      })
      formData.append('user_id', JSON.parse(localStorage.user).user_id)
      formData.append('customer_id', this.customerId)
      this.securePostNoTimeout('/api/v1/documents/' + this.parentObjectType + '/' + this.parentObjectId, formData, event => { this.uploadProgress = Math.round((100 * event.loaded) / event.total) })
        .then(() => {
          this.reloadDocuments()
          this.files = []
          this.uploadProgress = 0
        })
        .catch((error) => { this.error = error })
    },
    reloadDocuments () {
      this.securePost('/api/v1/documents/get', {objects: this.objects.map(n => { return { parentObjectType: n.parentObjectType, parentObjectId: n.parentObjectId } })})
        .then(response => {
          this.documents = response.data
        })
        .catch(err => { this.error = err })
    },
    documentHref (doc) {
      return this.$config.API_URL + '/asset/' + doc.parent_object + '/' + doc.parent_object_id + '/' + doc.filename
    }
  }
}
</script>

<style scoped>

</style>
