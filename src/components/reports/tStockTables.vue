<template>
  <div>
    <error-disp v-model="error"/>

    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8" class="primary white--text rounded pt-5 pb-5">
        {{formatInt(sitesTotal)}} sites. {{formatInt(gravesTotal)}} graves. {{formatMInt(valueTotal)}} (000's) stock value, {{formatMInt(outstandingValueTotal)}} (000's) available stock value
      </v-col>
    </v-row>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-tabs
        v-model="tab"
        class="rounded"
        background-color="primary"
        dark>
          <v-tab :key="'charts'">Charts</v-tab>
          <v-tab :key="'statuses'">Statuses</v-tab>
          <v-tab :key="'groups'">Groups</v-tab>
          <v-tab :key="'categories'">Categories</v-tab>
          <v-tab :key="'types'">Types</v-tab>
          <v-tab :key="'blocks'">Blocks</v-tab>
          <v-tab :key="'pivot'">Pivot</v-tab>
        </v-tabs>
      </v-col>
    </v-row>
    <v-tabs-items v-model="tab">
      <v-tab-item :key="'charts'">
        <v-row align="center" justify="center">
          <v-col cols="12" md="11" lg="11">
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <plotly :displayModeBar="false" :data="[{type: 'pie', hoverinfo: 'label+value+percent', hole: 0.4, labels: Object.values(catDict).map(m=>m.siteTypeCategory), values: Object.values(catDict).map(m=>m.siteCount )}]" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <plotly :displayModeBar="false" :data="[{type: 'pie', hoverinfo: 'label+value+percent', hole: 0.4, labels: Object.values(statusDict).map(m=>m.siteStatus), values: Object.values(statusDict).map(m=>m.siteCount )}]" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <plotly :displayModeBar="false" :data="[{type: 'pie', hoverinfo: 'label+value+percent', hole: 0.4, labels: Object.values(groupDict).map(m=>m.siteTypeGroup), values: Object.values(groupDict).map(m=>m.siteCount )}]" />
                  </v-col>
                </v-row>
              </v-card-text>
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item :key="'statuses'">
        <v-row align="center" justify="center">
          <v-col cols="12" md="11" lg="8">
            <v-card class="elevation-4">
              <v-card-text v-if="loaded" class="mt-5 pl-5">
                <v-expansion-panels accordion multiple>
                  <v-expansion-panel v-for="(status, i) in Object.values(statusDict).sort((a, b) => (b.siteCount - a.siteCount))" :key="i">
                    <v-expansion-panel-header class="text-body-1 pt-0 pb-1">
                      <v-row>
                        <v-col cols="6" sm="3"><b>{{status.siteStatus}}</b></v-col>
                        <v-col cols="6">
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Sites: {{formatInt(status.siteCount)}}. {{formatDec(status.siteCount / sitesTotal * 100)}}%.
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Graves: {{formatInt(status.graveCount)}}. {{formatDec(status.graveCount / gravesTotal * 100)}}%.
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Value: {{formatMInt(status.value)}} {{formatDec(status.value / valueTotal * 100)}}%.
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      <v-spacer/>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content  class="text-body-2">
                      <template v-for="(type, j) in Object.values(status.siteTypesDict).sort((a, b) => (b.siteCount - a.siteCount))">
                      <v-row :key="'bo' + j">
                        <v-col cols="6" sm="4">{{type.siteType}}</v-col>
                        <v-col cols="6" sm="8">
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Sites: {{formatInt(type.siteCount)}}. {{formatDec(type.siteCount / sitesTotal * 100)}}%. {{formatDec(type.siteCount / status.siteCount * 100)}}% of {{ status.siteStatus }}.
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      </template>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item :key="'groups'">
        <v-row align="center" justify="center">
          <v-col cols="12" md="11" lg="8">
            <v-card class="elevation-4">
              <v-card-text v-if="loaded" class="mt-5 pl-5">
                <v-expansion-panels accordion multiple>
                  <v-expansion-panel v-for="(group, i) in Object.values(groupDict).sort((a, b) => (b.siteCount - a.siteCount))" :key="i">
                    <v-expansion-panel-header class="text-body-1 pt-0 pb-1">
                      <v-row>
                        <v-col cols="6" sm="3"><b>{{group.siteTypeGroup}}</b></v-col>
                        <v-col cols="6">
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Sites: {{formatInt(group.siteCount)}}. {{formatDec(group.siteCount / sitesTotal * 100)}}%.
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Graves: {{formatInt(group.graveCount)}}. {{formatDec(group.graveCount / gravesTotal * 100)}}%.
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Value: {{formatMInt(group.value)}} {{formatDec(group.value / valueTotal * 100)}}%. Outstanding: {{formatMInt(group.outstandingValue)}}
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      <v-spacer/>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content  class="text-body-2">
                      <template v-for="(type, j) in Object.values(group.siteTypesDict).sort((a, b) => (b.siteCount - a.siteCount))">
                      <v-row :key="'b' + j">
                        <v-col cols="6" sm="4">{{type.siteType}}</v-col>
                        <v-col cols="6" sm="8">
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Sites: {{formatInt(type.siteCount)}}. {{formatDec(type.siteCount / sitesTotal * 100)}}%. {{formatDec(type.siteCount / group.siteCount * 100)}}% of {{ group.siteTypeCategory }}.
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      </template>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item :key="'categories'">
        <v-row align="center" justify="center">
          <v-col cols="12" md="11" lg="8">
            <v-card class="elevation-4">
              <v-card-text v-if="loaded" class="mt-5 pl-5">
                <v-expansion-panels accordion multiple>
                  <v-expansion-panel v-for="(cat, i) in Object.values(catDict).sort((a, b) => (b.siteCount - a.siteCount))" :key="i">
                    <v-expansion-panel-header class="text-body-1 pt-0 pb-1">
                      <v-row>
                        <v-col cols="6" sm="3"><b>{{cat.siteTypeCategory}}</b></v-col>
                        <v-col cols="6">
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Sites: {{formatInt(cat.siteCount)}}. {{formatDec(cat.siteCount / sitesTotal * 100)}}%.
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Graves: {{formatInt(cat.graveCount)}}. {{formatDec(cat.graveCount / gravesTotal * 100)}}%.
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      <v-spacer/>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content  class="text-body-2">
                      <template v-for="(type, j) in Object.values(cat.siteTypesDict).sort((a, b) => (b.siteCount - a.siteCount))">
                      <v-row :key="'b' + j">
                        <v-col cols="6" sm="4">{{type.siteType}}</v-col>
                        <v-col cols="6" sm="8">
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Sites: {{formatInt(type.siteCount)}}. {{formatDec(type.siteCount / sitesTotal * 100)}}%. {{formatDec(type.siteCount / cat.siteCount * 100)}}% of {{ cat.siteTypeCategory }}.
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      </template>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item key="types">
        <v-row align="center" justify="center">
          <v-col cols="12" md="11" lg="8">
            <v-card class="elevation-4">
              <v-card-text v-if="loaded" class="mt-5 pl-5">
                <v-expansion-panels accordion multiple>
                  <v-expansion-panel v-for="(type, i) in Object.values(typeDict).sort((a, b) => ('' + a.siteTypeGroupRef).localeCompare(b.siteTypeGroupRef))" :key="i">
                    <v-expansion-panel-header class="text-body-1 pt-0 pb-1">
                      <v-row>
                        <v-col cols="6" sm="5"><b>{{type.siteType}}</b></v-col>
                        <v-col cols="6" sm="7">
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Sites: {{formatInt(type.siteCount)}}. {{formatDec(type.siteCount / sitesTotal * 100)}}%.
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Graves: {{formatInt(type.graveCount)}}. {{formatDec(type.graveCount / gravesTotal * 100)}}%.
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Value: {{formatMInt(type.value)}} {{formatDec(type.value / valueTotal * 100)}}%. Outstanding: {{formatMInt(type.outstandingValue)}}
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      <v-spacer/>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content  class="text-body-2">
                      <v-row><v-col cols="12"><b>Statuses</b></v-col></v-row>
                      <template v-for="(status, j) in Object.values(type.statusDict).sort((a, b) => (b.siteCount - a.siteCount))">
                      <v-row :key="'ba' + j">
                        <v-col cols="6" sm="2">{{status.siteStatus}}</v-col>
                        <v-col cols="6" sm="10">
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Sites: {{formatInt(status.siteCount)}}. {{formatDec(status.siteCount / sitesTotal * 100)}}%. {{formatDec(status.siteCount / type.siteCount * 100)}}% of {{ type.siteType }}. {{formatDec(status.siteCount / sitesTotal * 100)}}% of sites.
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      </template>
                      <v-row><v-col cols="12" class="pt-10"><b>Blocks</b></v-col></v-row>
                      <template v-for="(block, j) in Object.values(type.blocksDict).sort((a, b) => (b.siteCount - a.siteCount))">
                      <v-row :key="'bii' + j">
                        <v-col cols="6" sm="3" :class="block.saleable ? '' : 'grey--text'">{{block.blockRef}} {{block.saleable ? '' : '(not for sale)'}}</v-col>
                        <v-col cols="6" sm="9">
                          <v-row>
                            <v-col cols="12" :class="block.saleable ? 'pt-0 pb-0' : 'pt-0 pb-0 grey--text'">
                              Sites: {{formatInt(block.siteCount)}}. {{formatDec(block.siteCount / sitesTotal * 100)}}%. {{formatDec(block.siteCount / type.siteCount * 100)}}% of {{ type.siteType }}. {{formatDec(block.siteCount / sitesTotal * 100)}}% of sites.
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      </template>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item key="blocks">
        <v-row align="center" justify="center">
          <v-col cols="12" md="11" lg="8">
            <v-card class="elevation-4">
              <v-card-text v-if="loaded" class="mt-5 pl-5">
                <v-expansion-panels accordion multiple>
                  <v-expansion-panel v-for="(block, i) in Object.values(blocksDict).sort((a, b) => a.blockRef.localeCompare(b.blockRef))" :key="i">
                    <v-expansion-panel-header class="text-body-1 pt-0 pb-0">
                      <v-row>
                        <v-col cols="6" sm="3"><b>{{block.blockRef}}</b></v-col>
                        <v-col cols="6">
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Sites: {{formatInt(block.siteCount)}}. {{formatDec(block.siteCount / sitesTotal * 100)}}%.
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Graves: {{formatInt(block.graveCount)}}. {{formatDec(block.graveCount / gravesTotal * 100)}}%.
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      <v-spacer/>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content  class="text-body-2">
                      <v-row><v-col cols="12"><b>Types</b></v-col></v-row>
                      <template v-for="(type, j) in Object.values(block.siteTypesDict).sort((a, b) => (b.siteCount - a.siteCount))">
                      <v-row :key="'b' + j">
                        <v-col cols="6" sm="4">{{type.siteType}}</v-col>
                        <v-col cols="6" sm="8">
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Sites: {{formatInt(type.siteCount)}}. {{formatDec(type.siteCount / sitesTotal * 100)}}%. {{formatDec(type.siteCount / block.siteCount * 100)}}% of {{ block.blockRef }}.
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      </template>
                      <v-row><v-col cols="12"><b>Statuses</b></v-col></v-row>
                      <template v-for="(status, j) in Object.values(block.statusDict).sort((a, b) => (b.siteCount - a.siteCount))">
                      <v-row :key="'ba' + j">
                        <v-col cols="6" sm="2">{{status.siteStatus}}</v-col>
                        <v-col cols="6" sm="10">
                          <v-row>
                            <v-col cols="12" class="pt-0 pb-0">
                              Sites: {{formatInt(status.siteCount)}}. {{formatDec(status.siteCount / sitesTotal * 100)}}%. {{formatDec(status.siteCount / block.siteCount * 100)}}% of {{ block.blockRef }}. {{formatDec(status.siteCount / sitesTotal * 100)}}% of sites.
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      </template>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item key="pivot">
      <v-row align="center" justify="center">
        <v-col cols="12" md="11" lg="11">
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <pivot
                v-if="data"
                :data="data"
                v-model="fields"
                :reducer="reducer"
                :showSettings="defaultShowSettings"
                >
                  <template v-slot:value="slotProps">
                      <span v-if="slotProps.value>0">{{formatInt(slotProps.value)}}</span>
                      <span v-else>-</span>
                  </template>
                  <template v-slot:footer="slotProps">
                      <span>{{formatInt(slotProps.value.total)}}</span>
                  </template>
                </pivot>
              </v-col>
            </v-row>
          </v-card-text>
        </v-col>
      </v-row>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import Pivot from '@/components/reports/Pivot'

export default {
  name: 'Sites',
  components: {
    ErrorDisp,
    Pivot,
    Plotly: () => import(/* webpackChunkName: "plotly" */ '@/components/shared/Plotly.vue')
  },
  props: [],
  data () {
    return {
      error: null,
      data: null,
      blocksDict: {},
      catDict: {},
      typeDict: {},
      statusDict: {},
      groupDict: {},
      sitesTotal: 0,
      gravesTotal: 0,
      valueTotal: 0,
      outstandingValueTotal: 0,
      loaded: false,
      tab: 'statuses',
      fields: {
        availableFields: [{
          getter: item => item.site_type,
          label: 'Site Type',
          showFooter: true,
          footerSlotName: 'footer'
        }, {
          getter: item => item.block_ref,
          label: 'Block',
          showFooter: true,
          footerSlotName: 'footer'
        }, {
          getter: item => item.site_type_category,
          label: 'Category',
          showFooter: true,
          footerSlotName: 'footer'
        }],
        colFields: [{
          getter: item => item.site_status,
          label: 'Status'
        }],
        rowFields: [
          {
            getter: item => item.site_type_group,
            label: 'Group'
          }],
        fieldsOrder: {}
      },
      reducer: (sum, item) => sum + item.site_count,
      defaultShowSettings: true
    }
  },
  computed: {
  },
  created () {
    this.secureGet('/api/v1/blocks_sites_statuses')
      .then(res => {
        this.data = res.data
        this.data.forEach(rw => {
          this.sitesTotal += parseInt(rw.site_count)
          this.gravesTotal += parseInt(rw.site_count * rw.graves)
          this.valueTotal += parseFloat(rw.type_charges) + parseFloat(rw.burial_charges)
          if (rw.site_status_ref !== 'UNSUITABLE' && rw.site_status_ref !== 'OWN' && rw.site_status_ref !== 'ORDER') {
            this.outstandingValueTotal += parseFloat(rw.type_charges) + parseFloat(rw.burial_charges)
          }
        })
        // Blocks
        this.data.forEach(rw => {
          if (!this.blocksDict[rw.block_ref]) {
            this.blocksDict[rw.block_ref] = {
              siteTypesDict: {},
              statusDict: {},
              blockRef: rw.block_ref,
              siteCount: 0,
              graveCount: 0
            }
          }
          const block = this.blocksDict[rw.block_ref]
          block.siteCount += parseInt(rw.site_count)
          block.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))

          if (!block.siteTypesDict[rw.site_type_ref]) {
            block.siteTypesDict[rw.site_type_ref] = {
              siteType: rw.site_type,
              siteTypeRef: rw.site_type_ref,
              siteCount: 0,
              graveCount: 0
            }
          }
          const siteType = block.siteTypesDict[rw.site_type_ref]
          siteType.siteCount += parseInt(rw.site_count)
          siteType.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))

          if (!block.statusDict[rw.site_status_ref]) {
            block.statusDict[rw.site_status_ref] = {
              siteStatusRef: rw.site_status_ref,
              siteStatus: rw.site_status,
              siteCount: 0,
              graveCount: 0 }
          }
          const status = block.statusDict[rw.site_status_ref]
          status.siteCount += parseInt(rw.site_count)
          status.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))
        })

        // Group
        this.data.forEach(rw => {
          if (!this.groupDict[rw.site_type_group_ref]) {
            this.groupDict[rw.site_type_group_ref] = {
              siteTypeGroupRef: rw.site_type_group_ref,
              siteTypeGroup: rw.site_type_group,
              siteTypesDict: {},
              siteCount: 0,
              graveCount: 0,
              value: 0,
              outstandingValue: 0
            }
          }
          const group = this.groupDict[rw.site_type_group_ref]
          group.siteCount += parseInt(rw.site_count)
          group.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))
          group.value += (parseInt(rw.type_charges) + parseInt(rw.burial_charges))
          if (rw.site_status_ref !== 'UNSUITABLE' && rw.site_status_ref !== 'OWN' && rw.site_status_ref !== 'ORDER') {
            group.outstandingValue += parseFloat(rw.type_charges) + parseFloat(rw.burial_charges)
          }

          if (!group.siteTypesDict[rw.site_type_ref]) {
            group.siteTypesDict[rw.site_type_ref] = {
              siteTypeRef: rw.site_type_ref,
              siteType: rw.site_type,
              siteCount: 0,
              graveCount: 0
            }
          }
          const siteType = group.siteTypesDict[rw.site_type_ref]
          siteType.siteCount += parseInt(rw.site_count)
          siteType.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))
        })

        // Cat
        this.data.forEach(rw => {
          if (!this.catDict[rw.site_type_category_ref]) {
            this.catDict[rw.site_type_category_ref] = {
              siteTypeCategoryRef: rw.site_type_category_ref,
              siteTypeCategory: rw.site_type_category,
              siteTypesDict: {},
              siteCount: 0,
              graveCount: 0
            }
          }
          const cat = this.catDict[rw.site_type_category_ref]
          cat.siteCount += parseInt(rw.site_count)
          cat.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))

          if (!cat.siteTypesDict[rw.site_type_ref]) {
            cat.siteTypesDict[rw.site_type_ref] = {
              siteTypeRef: rw.site_type_ref,
              siteType: rw.site_type,
              siteCount: 0,
              graveCount: 0
            }
          }
          const siteType = cat.siteTypesDict[rw.site_type_ref]
          siteType.siteCount += parseInt(rw.site_count)
          siteType.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))
        })

        // Type
        this.data.forEach(rw => {
          if (!this.typeDict[rw.site_type_ref]) {
            this.typeDict[rw.site_type_ref] = {
              blocksDict: {},
              statusDict: {},
              siteTypeRef: rw.site_type_ref,
              siteType: rw.site_type,
              siteTypeGroupRef: rw.site_type_group_ref,
              value: 0,
              outstandingValue: 0,
              siteCount: 0,
              graveCount: 0 }
          }
          const siteType = this.typeDict[rw.site_type_ref]
          siteType.siteCount += parseInt(rw.site_count)
          siteType.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))
          siteType.value += (parseInt(rw.type_charges) + parseInt(rw.burial_charges))
          if (rw.site_status_ref !== 'UNSUITABLE' && rw.site_status_ref !== 'OWN' && rw.site_status_ref !== 'ORDER') {
            siteType.outstandingValue += parseFloat(rw.type_charges) + parseFloat(rw.burial_charges)
          }

          if (!siteType.blocksDict[rw.block_ref]) {
            siteType.blocksDict[rw.block_ref] = {
              blockRef: rw.block_ref,
              saleable: rw.saleable,
              siteCount: 0,
              graveCount: 0 }
          }
          const block = siteType.blocksDict[rw.block_ref]
          block.siteCount += parseInt(rw.site_count)
          block.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))

          if (!siteType.statusDict[rw.site_status_ref]) {
            siteType.statusDict[rw.site_status_ref] = {
              siteStatusRef: rw.site_status_ref,
              siteStatus: rw.site_status,
              siteCount: 0,
              graveCount: 0 }
          }
          const status = siteType.statusDict[rw.site_status_ref]
          status.siteCount += parseInt(rw.site_count)
          status.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))
        })

        // Status
        this.data.forEach(rw => {
          if (!this.statusDict[rw.site_status_ref]) {
            this.statusDict[rw.site_status_ref] = {
              siteStatusRef: rw.site_status_ref,
              siteStatus: rw.site_status,
              siteTypesDict: {},
              siteCount: 0,
              graveCount: 0,
              value: 0
            }
          }
          const status = this.statusDict[rw.site_status_ref]
          status.siteCount += parseInt(rw.site_count)
          status.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))
          status.value += (parseInt(rw.type_charges) + parseInt(rw.burial_charges))

          if (!status.siteTypesDict[rw.site_type_ref]) {
            status.siteTypesDict[rw.site_type_ref] = {
              siteTypeRef: rw.site_type_ref,
              siteType: rw.site_type,
              blocksDict: {},
              siteCount: 0,
              graveCount: 0
            }
          }
          const siteType = status.siteTypesDict[rw.site_type_ref]
          siteType.siteCount += parseInt(rw.site_count)
          siteType.graveCount += (parseInt(rw.site_count) * parseInt(rw.graves))
        })
        this.loaded = true
      })
      .catch((error) => { this.error = error })
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style scoped>

</style>
