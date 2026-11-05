<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <v-card :outlined="narrow">
      <v-card-title :class="narrow ?  'white font-weight-bold text-body-1 pt-2 pb-0' : 'secondary text-h6 pb-2' ">
        Notes<span v-if="notes && notes.length>0">&nbsp;({{ notes.length }})</span>
        <v-spacer />
        <note-form
          @added="reloadNotes"
          :forceAdd="forceAdd"
          :setFlag="setFlag"
          :readonly="readonly"
          :parentObjectId="parentObjectId"
          :parentObjectType="parentObjectType"/>
      </v-card-title>
      <v-card-text>
        <div v-if="notes">
          <div v-if="notes.length>0">
            <template v-for="(note,index) in notes">
              <v-row :key="note.note_id" >
                <v-col cols="12" :class="`pb-0 ${narrow ? 'text-caption' : 'text-body-1'}`">
                  <v-btn
                    icon
                    :x-small="narrow"
                    class="pt-0 pb-0 mb-0"
                    v-if="!readonly"
                    @click="deleteNote(note.note_id, index)"
                    color="primary"
                  >
                    <v-icon class="text-h5 pt-0 pb-0">mdi-delete</v-icon>
                  </v-btn>
                  <router-link :to="{name: 'User', params: {user_id: note.user_id}}">{{note.first_name}} {{note.last_name}}</router-link>&nbsp;
                  {{formatT(note.created_at)}}&nbsp;
                  <router-link v-if="isLinked(note)" :to="linkTo(note)">{{linkText(note)}}</router-link>
                </v-col>
                <v-col cols="12" :class="`pl-7 pb-1 pt-1 ${narrow ? 'text-caption' : 'text-body-1'}`">
                  <em>{{note.note}}</em>
                </v-col>
              </v-row>
                <v-row v-for="doc in note.documents" :key="doc.document_id" no-gutters>
                  <v-col class="ml-10" cols="12">
                    <a target="_blank" :href="documentHref(note.note_id, doc)">
                      <span class="text-caption">
                        <v-icon :small="narrow" color="primary" class="pr-3 pl-0">mdi-download</v-icon>{{doc.filename}}
                      </span>
                    </a>
                  </v-col>
                </v-row>
              <v-row :key="'d' + note.note_id">
                <v-col cols="12" class="pt-5 pb-0" >
                  <v-divider/>
                </v-col>
              </v-row>
            </template>
          </div>
          <div class="pt-5 text-body-2" v-if="notes.length == 0 && !narrow">None</div>
        </div>
        <v-skeleton-loader
          v-else
          type="article"
        ></v-skeleton-loader>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import NoteForm from '@/components/notes/NoteForm'
export default {
  name: 'Notes',
  components: {
    NoteForm
  },
  props: {
    readonly: Boolean,
    narrow: Boolean,
    objects: Array,
    parentObjectType: String,
    parentObjectId: Number,
    forceAdd: Boolean,
    setFlag: Boolean
  },
  data () {
    return {
      notes: null,
      error: null
    }
  },
  watch: {
    objects: function () {
      this.reloadNotes()
    }
  },
  computed: {
  },
  mounted () {
    if (this.objects) {
      this.reloadNotes()
    }
  },
  methods: {
    isLinked (note) {
      return !(note.parent_object === this.parentObjectType && note.parent_object_id === this.parentObjectId)
    },
    linkText (note) {
      switch (note.parent_object) {
        case 'sale':
          return `for Sale ${note.parent_object_id}`
        case 'site':
          return `for Site ${note.parent_object_id}`
        case 'sale_site':
          return `for Site ${note.parent_object_id}`
        case 'burial':
          return `for Burial ${note.parent_object_id}`
        case 'customer':
          return `for Customer ${note.parent_object_id}`
        case 'credit':
          return `for Credit Note ${note.parent_object_id}`
        case 'sitework':
          return `for Site Work Order ${note.parent_object_id}`
      }
    },
    linkTo (note) {
      switch (note.parent_object) {
        case 'sale':
          return {name: 'Sale', params: {sale_id: note.parent_object_id}}
        case 'site':
          return {name: 'Site', params: {site_id: note.parent_object_id}}
        case 'sale_site':
          return {name: 'Site', params: {site_id: note.parent_object_id}}
        case 'burial':
          return {name: 'Burial', params: {burial_id: note.parent_object_id}}
        case 'customer':
          return {name: 'Customer', params: {customer_id: note.parent_object_id}}
        case 'credit':
          return {name: 'Credit Note', params: {credit_id: note.parent_object_id}}
        case 'sitework':
          return {name: 'Sitework', params: {sitework_id: note.parent_object_id}}
      }
    },
    documentHref (noteId, doc) {
      return this.$config.API_URL + '/asset/note/' + noteId + '/' + doc.filename
    },
    deleteNote (noteId, index) {
      this.secureDelete('/api/v1/notes/' + noteId)
        .catch((error) => { this.error = error })
      this.notes.splice(index, 1)
    },
    reloadNotes () {
      this.notes = null
      this.$emit('added')
      this.securePost('/api/v1/notes/get', {objects: this.objects.map(n => { return { parentObjectType: n.parentObjectType, parentObjectId: n.parentObjectId } } ) } )
        .then(response => {
          this.notes = response.data.sort((a, b) => {
            return a.created_at - b.created_at
          })
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>
