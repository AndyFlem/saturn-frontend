<template>
  <div>
    <v-alert dense v-if="error" type="error">{{ error }}</v-alert>
    <template>
      <v-card class="elevation-4">
        <v-expansion-panels :value="null" v-model="expandIndex">
          <v-expansion-panel>
            <v-expansion-panel-header class="primary white--text text-h6 pt-3 pb-3">
              <span class="white--text">
                <router-link  :to="{name: 'Calendar'}" class="white--text">
                Site Works<span v-if="siteworkDays">: {{ siteworks.length }}</span><span v-else>: -</span>
                </router-link>
              </span>
              <template v-slot:actions>
                <v-icon color="white">$expand</v-icon>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-data-iterator
                v-if="siteworksDaysList"
                :items="siteworksDaysList"
                :page="siteworksPage"
                :items-per-page="3"
              >
              <template v-slot:default="props">
                <v-card-text class="mt-2">
                  <template v-if="siteworksDaysList">
                    <v-card v-for="(item, i) in props.items" :key="i" class="elevation-0 pb-0 pt-0">
                      <v-card-title class="secondary text-h6 pt-3 pb-2">
                        <span v-if="item[0]=== today">Today</span>
                        <span v-else>{{ formatD(item[0]) }}</span>
                      </v-card-title>
                      <v-card-text class="pl-4 pr-4">
                        <div v-if="item[1].length > 0">
                          <div v-for="sitework in item[1]" :key="sitework.sitework_id">
                            <sitework-search-result :value="sitework.sitework_id" />
                          </div>
                        </div>
                        <div v-else class="pt-2 text-body-1">
                          No siteworks
                        </div>
                      </v-card-text>
                    </v-card>
                  </template>
                  <v-skeleton-loader v-else type="article" />
                </v-card-text>
              </template>
              </v-data-iterator>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card>
    </template>
  </div>
</template>

<script>
import { DateTime } from 'luxon'
import SiteworkSearchResult from '@/components/siteworks/SiteworkSearchResult.vue'

// Used in tHome.vue only
export default {
  name: 'SiteworkList',
  components: {
    SiteworkSearchResult
  },
  props: {
    expand: Boolean
  },
  data () {
    return {
      date: null,
      error: null,
      today: null,
      siteworks: null,
      siteworksPage: 1,
      siteworkDays: null,
      expandIndex: null,
      siteworksDaysList: null
    }
  },
  computed: {},
  created () {
    if (this.expand) {
      this.expandIndex = 0
    }
  },
  mounted () {
    console.log('Mounted SiteworkList')
    this.date = DateTime.fromISO(this.currentDate())
    this.today = DateTime.now().toISODate()
    this.update()
  },
  methods: {
    update () {
      this.secureGet('/api/v1/siteworks?from=' + this.today)
        .then(res => {
          this.siteworks = res.data
          this.siteworkDays = {}
          this.siteworkDays[this.today] = []
          this.siteworks.forEach(evt => {
            const dte = DateTime.fromISO(evt.sitework_time).toISODate()
            if (!this.siteworkDays[dte]) {
              this.siteworkDays[dte] = []
            }
            this.siteworkDays[dte].push(evt)
          })
          this.siteworksDaysList = Object.entries(this.siteworkDays)
        })
        .catch(err => {
          this.error = err
        })
    }
  },
  watch: {}
}
</script>

<style scoped></style>
