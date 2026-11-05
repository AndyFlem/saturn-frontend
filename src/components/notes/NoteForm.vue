<template>
  <div>
    <v-btn
      icon
      title="Add new note."
      color="primary"
      v-if="!readonly"
      @click="noteDialog=true"
    >
      <v-icon>mdi-plus-circle</v-icon>
    </v-btn>

    <v-dialog v-model="noteDialog" persistent max-width="800">
      <error-disp v-model="error"/>
      <v-card class="elevation-4">
        <v-card-title class="primary white--text">
          Add a new note
        </v-card-title>
        <v-card-text class="pt-3">
          <v-row class="align-end">
            <v-col cols="12">
              <v-textarea
                label="New Note"
                rows="1"
                auto-grow
                clearable
                v-model="newNote"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row v-for="doc in documents" :key="doc.document_id" no-gutters>
            <v-col cols="12">
              <a target="_blank" :href="documentHref(doc)">
                <span class="text-body-1">
                  <v-icon color="primary" class="pr-3 pl-0">mdi-download</v-icon>{{doc}}
                </span>
              </a>
            </v-col>
          </v-row>
          <v-row no-gutters justify="center" align="center">
            <v-col cols="10">
              <v-alert v-if="success" type="success">{{success}}</v-alert>
            </v-col>
          </v-row>
          <v-row no-gutters justify="center" align="end">
            <v-col cols="12">
              <v-file-input
                v-model="file"
                :disabled="readonly"
                hide-details
                accept="image/*,.pdf"
                label="Add document or image"
                @change="uploadDocuments"
              ></v-file-input>
            </v-col>
          </v-row>
          <v-row no-gutters justify="start" align="center">
            <v-col cols="12" class="pt-5 pb-0">
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
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeDialog()">Cancel</v-btn>
          <v-btn color="primary" :disabled="!canAdd || pending" @click="updateNote()">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'

export default {
  name: 'NoteForm',
  components: {
    ErrorDisp
  },
  props: {
    readonly: Boolean,
    parentObjectType: String,
    parentObjectId: Number,
    forceAdd: Boolean,
    setFlag: Boolean
  },
  data () {
    return {
      error: null,
      newNote: null,
      newNoteId: null,
      noteDialog: false,
      documents: [],
      uploadProgress: 0,
      file: null,
      success: null,
      pending: false
    }
  },
  watch: {
    forceAdd: function (val) {
      this.noteDialog = val
    }
  },
  computed: {
    canAdd () {
      return (this.newNote || this.newNoteId)
    }
  },
  methods: {
    documentHref (doc) {
      return this.$config.API_URL + '/asset/note/' + this.newNoteId + '/' + doc
    },
    uploadDocuments () {
      this.error = null
      if (this.file) {
        this.pending = true
        new Promise((resolve, reject) => {
          if (!this.newNoteId) {
            this.addNote(this.file.name)
              .then(() => {
                resolve()
              })
              .catch((error) => { reject(error) })
          } else {
            resolve()
          }
        })
          .then(() => {
            const formData = new FormData()
            console.log(formData)
            formData.append(this.file.name, this.file)

            return this.securePostNoTimeout('/api/v1/documents/note/' + this.newNoteId, formData, event => { this.uploadProgress = Math.round((100 * event.loaded) / event.total) })
              .then(() => {
                this.documents.push(this.file.name)
                this.file = null
                this.uploadProgress = 0
                this.pending = false
              })
              .catch((error) => {
                this.error = error
                this.file = null
                this.uploadProgress = 0
                this.pending = false
              })
          })
      }
    },
    closeDialog () {
      this.file = null
      this.documents = []
      this.newNote = null
      this.newNoteId = null
      this.noteDialog = false
      this.pending = false
      this.error = null
    },
    addNote (noteText = null) {
      const oInsert = {note: this.newNote ? this.newNote : noteText}
      return this.securePost('/api/v1/notes/' + this.parentObjectType + '/' + this.parentObjectId, oInsert)
        .then(res => {
          this.newNoteId = res.data.note_id
          if (this.setFlag) {
            return this.securePut(`/api/v1/${this.parentObjectType}s/${this.parentObjectId}/flag`)
          }
        })
        .catch((error) => { this.error = error })
    },
    updateNote () {
      this.pending = true
      new Promise((resolve, reject) => {
        if (!this.newNoteId) {
          this.addNote()
            .then(() => {
              resolve()
            })
            .catch((error) => { reject(error) })
        } else {
          resolve()
        }
      })
        .then(() => {
          return this.securePut('/api/v1/notes/' + this.newNoteId, {note: this.newNote})
        })
        .then(() => {
          this.closeDialog()
          this.$emit('added')
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>

<style scoped>

</style>
