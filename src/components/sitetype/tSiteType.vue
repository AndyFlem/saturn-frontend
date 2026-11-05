<template>
  <div>
    <error-disp v-model="error"/>
    <v-row v-if="site_type" align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            <span class="pt-0 pb-1">{{ site_type.site_type }}</span>
            <v-spacer/>
            <v-btn
              icon
              @click="toggleEdit"
              class="white"
            >
              <v-icon>mdi-pencil-outline</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="mt-5 ml-3 text-body-1">
            <v-row>
              <v-col cols="12" class="pt-1 pb-0">
                <b>Name: </b>
                <span v-if="!editMode" class="pt-0 pb-1">{{ site_type.site_type }}</span>
                <v-text-field
                    v-model="site_type.site_type"
                    v-if="editMode"
                    dense
                    type="text"
                    @keyup.enter="toggleEdit"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" class="pt-1 pb-0">
                <b>Category: </b>
                <span v-if="!editMode" class="pt-0 pb-1">{{ site_type.site_type_category }}</span>
                <v-select
                  dense
                  @keyup.enter="toggleEdit"
                  v-if="editMode"
                  :items="site_type_categories"
                  item-text="site_type_category"
                  item-value="site_type_category_id"
                  class="mr-3"
                  v-model="site_type.site_type_category_id"
                ></v-select>
              </v-col>
              <v-col cols="12" class="pt-1 pb-0">
                <b>Group: </b>
                <span v-if="!editMode" class="pt-0 pb-1">{{ site_type.site_type_group }}</span>
                <v-select
                  dense
                  @keyup.enter="toggleEdit"
                  v-if="editMode"
                  :items="site_type_groups"
                  item-text="site_type_group"
                  item-value="site_type_group_id"
                  class="mr-3"
                  v-model="site_type.site_type_group_id"
                ></v-select>
              </v-col>
              <v-col cols="12" class="pt-1 pb-0">
                <b>Description: </b>
                <span v-if="!editMode" class="pt-0 pb-1">{{ site_type.description }}</span>
                <v-text-field
                    v-model="site_type.description"
                    v-if="editMode"
                    dense
                    type="text"
                    @keyup.enter="toggleEdit"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" class="pt-1 pb-0">
                <b>Graves: </b>
                <span v-if="!editMode" class="pt-0 pb-1">{{ site_type.graves }}</span>
                <v-text-field
                    v-model="site_type.graves"
                    v-if="editMode"
                    dense
                    type="text"
                    @keyup.enter="toggleEdit"
                  ></v-text-field>
              </v-col>
              <v-col cols="12" class="pt-1 pb-0">
                <b>Available for sale: </b>
                <span v-if="!editMode" class="pt-0 pb-1">{{ site_type.saleable ? 'yes':'no' }}</span>
                <v-switch
                    v-model="site_type.saleable"
                    v-if="editMode"
                    dense
                  ></v-switch>
              </v-col>
              <v-col cols="12" class="pt-1 pb-0">
                <b>Allow pre-need: </b>
                <span v-if="!editMode" class="pt-0 pb-1">{{ site_type.allow_preeneed ? 'yes':'no' }}</span>
                <v-switch
                    v-model="site_type.allow_preeneed"
                    v-if="editMode"
                    dense
                  ></v-switch>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-divider/>
              </v-col>
            </v-row>
          <v-row>
            <v-col cols="12" class="pl-5 pt-1 pb-1">
              <document
                parentObject="site_type"
                :parentObjectId="site_type_id"
                documentPropertyRef="SITE_TYPE_AGREEMENT"
                label="Select template agreement body"/>
            </v-col>
          </v-row>
            <v-row>
              <v-col cols="12">
                <v-divider/>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import Document from '@/components/shared/Document'

export default {
  name: 'SiteType',
  components: {
    ErrorDisp,
    Document
  },
  data () {
    return {
      site_type_categories: null,
      categories: {},
      site_type_groups: null,
      groups: {},
      site_type_id: null,
      site_type: null,
      error: null,
      editMode: false
    }
  },

  computed: {

  },
  created () {
    if (this.$route.params.site_type_id) {
      this.site_type_id = this.$route.params.site_type_id
      this.secureGet('/api/v1/site_types/' + this.site_type_id)
        .then(res => {
          this.site_type = res.data
        })
        .catch(err => { this.error = err })
    }

    this.secureGet('/api/v1/site_type_categories')
      .then(res => {
        this.site_type_categories = res.data
        this.site_type_categories.forEach(cat => {
          this.categories[cat.site_type_category_id] = cat
        })
      })
      .catch(err => { this.error = err })

    this.secureGet('/api/v1/site_type_groups')
      .then(res => {
        this.site_type_groups = res.data
        this.site_type_groups.forEach(cat => {
          this.groups[cat.site_type_group_id] = cat
        })
      })
      .catch(err => { this.error = err })
  },
  methods: {
    toggleEdit () {
      if (this.editMode) {
        this.site_type.site_type_category = this.categories[this.site_type.site_type_category_id].site_type_category
        this.site_type.site_type_group = this.groups[this.site_type.site_type_group_id].site_type_group
        this.update()
      }
      this.editMode = !this.editMode
    },
    update () {
      this.securePut('/api/v1/site_types/' + this.site_type_id, {
        site_type: this.site_type.site_type,
        description: this.site_type.description,
        site_type_category_id: this.site_type.site_type_category_id,
        site_type_group_id: this.site_type.site_type_group_id,
        graves: this.site_type.graves,
        allow_preneed: this.site_type.allow_preneed,
        saleable: this.site_type.saleable
      })
        .catch((error) => { this.error = error })
    }
  }
}
</script>

<style scoped>

</style>
