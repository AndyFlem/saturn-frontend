<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Tariffs
            <v-spacer/>
            <v-dialog
              v-model="newDialog"
              persistent
              max-width="290"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="pt-0"
                  fab
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="headline">
                  Add a new tariff
                </v-card-title>
                <v-card-text>
                  <div>Enter a name for the new tariff.</div>
                  <v-text-field
                      v-model="newName"
                      label="New tariff name"
                      :error-messages="newNameErrors"
                      type="text"
                      required
                    />
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    text
                    @click="newDialog = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="primary"
                    text
                    @click="createTariff"
                  >
                    Create
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card-title>
          <v-card-text class="pl-5 pr-5">
              <v-row v-for="(tariff, i) in tariffs" :key="i">
                <v-col cols="12">
                  <v-card>
                    <v-card-title class="">
                        <router-link :to="{name: 'Tariff', params: {tariff_id: tariff.tariff_id}}">{{tariff.name}}</router-link>
                      <v-spacer/>
                      <v-btn
                        color="primary"
                        class="mr-5"
                        v-if="tariff.use_count === 0 && $userCheckPermission('PERM_SALES_SUPER')"
                        @click="deleteTariff(tariff, i)"
                      >
                        Delete
                      </v-btn>
                    </v-card-title>
                    <v-card-text class="pb-0 text-body-2">
                      <v-row>
                        <v-col cols="12" sm="4">
                          <div>Created: {{formatD(tariff.created_at)}}</div>
                          <div>Used in {{formatInt(tariff.use_count)}} sales.</div>
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-switch
                            dense
                            class="mt-0 mb-0 pt-0 pb-0"
                            v-model="tariff.is_available"
                            label="Available for sales?"
                            @click="availableTariff(tariff)"
                          />
                        </v-col>
                        <v-col cols="12" sm="4">
                          <v-switch
                            dense
                            class="mt-0 mb-0 pt-0 pb-0"
                            :disabled="tariff.is_current || !tariff.is_available"
                            v-model="tariff.is_current"
                            label="Default Tariff?"
                            @click="currentTariff(tariff)"
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
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
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'Tariffs',
  components: {
    ErrorDisp
  },
  data () {
    return {
      tariffs: [],
      error: null,
      newName: null,
      duplicateId: null,
      newDialog: false
    }
  },
  validations: {
    newName: {
      required
    }
  },
  computed: {
    newNameErrors () {
      const errors = []
      if (!this.$v.newName.$dirty) return errors
      !this.$v.newName.required && errors.push('A name is required for the tariff.')
      return errors
    }
  },
  created () {
    this.secureGet('/api/v1/tariffs')
      .then(res => {
        this.tariffs = res.data
      })
      .catch((error) => { this.error = error })
  },
  methods: {
    currentTariff (tariff) {
      if (tariff.is_current) {
        this.tariffs.forEach(t => {
          if (t.tariff_id !== tariff.tariff_id) {
            t.is_current = false
          }
        })
        this.securePut('/api/v1/tariffs/' + tariff.tariff_id, {is_current: tariff.is_current})
          .catch((error) => { this.error = error })
      }
    },
    availableTariff (tariff) {
      this.securePut('/api/v1/tariffs/' + tariff.tariff_id, {is_available: tariff.is_available})
        .catch((error) => { this.error = error })
    },
    createTariff () {
      this.$v.$touch()
      if (!this.$v.newName.$error) {
        this.securePost('/api/v1/tariffs/new', {name: this.newName})
          .then(() => {
            this.$router.go()
          })
          .catch((error) => { this.error = error })
      }
    },
    deleteTariff (tariff, index) {
      this.secureDelete('/api/v1/tariffs/' + tariff.tariff_id)
        .then(() => {
          this.tariffs.splice(index, 1)
        })
        .catch((error) => { this.error = error })
    }
  }
}
</script>
