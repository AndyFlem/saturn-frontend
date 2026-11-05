/* eslint-disable vue/no-use-v-if-with-v-for */
<template>
  <div class="">
    <template v-if="isDataLoading">
      <slot name="loading">
        Loading...
      </slot>
    </template>
    <div v-else-if="data.length === 0" class="alert alert-warning">
      {{ noDataWarningText }}
    </div>
    <div v-else-if="getNumOfCells() > numOfCellsLimitation" class="alert alert-warning">
      {{ overNumOfCellsWarningText }}
    </div>
    <!--class="table table-hover table-bordered table-sm"-->
    <v-simple-table v-else class="dense">
      <template v-slot:default>
        <!-- Table header -->
        <thead>
          <template
            v-for="(colField, colFieldIndex) in colFields"
          >
          <tr
              v-if="colField.showHeader === void 0 || colField.showHeader"
              :key="'header-col-' + colField.label"
              class="">
            <!-- Top left dead zone -->
            <!--class="text-right font-weight-normal text-muted"-->
            <th
              v-if="colFieldIndex === firstColFieldHeaderIndex && rowHeaderSize > 0"
              :colspan="rowHeaderSize"
              :rowspan="colHeaderSize"
              style="width:50px;"
              class="text-right"
                >Total: {{formatInt(total)}}</th>
            <!-- Column headers -->
            <template
              v-for="(col, colIndex) in cols"
            >
              <th
                class="text-center font-weight-bold black--text"
                v-if="spanSize(cols, colFieldIndex, colIndex) !== 0"
                :key="JSON.stringify(col)"
                :style="`${((colIndex % 2) ==0 && colFieldIndex == colFields.length-1)? 'background-color:#eee;' : ''}`"
                :colspan="spanSize(cols, colFieldIndex, colIndex)"
              >
                <slot v-if="colField.headerSlotName" :name="colField.headerSlotName" v-bind:value="col[colFieldIndex]">
                  Missing slot <code>{{ colField.headerSlotName }}</code>
                </slot>
                <template v-else>
                  {{ col[colFieldIndex] }}
                </template>
              </th>
            </template>
            <!-- Top right dead zone -->
            <th
              v-if="colFieldIndex === firstColFieldHeaderIndex && rowFooterSize > 0"
              :colspan="rowFooterSize"
              :rowspan="colFooterSize"></th>
          </tr>
          </template>
        </thead>

        <!-- Table body -->
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="JSON.stringify(row)">
            <!-- Row headers -->
            <template
              v-for="(rowField, rowFieldIndex) in rowFields"
            >
              <th
                v-if="(rowField.showHeader === void 0 || rowField.showHeader) && spanSize(rows, rowFieldIndex, rowIndex) !== 0"
                :key="'header-row-' + rowField.label"
                :rowspan="spanSize(rows, rowFieldIndex, rowIndex)"
              >
                <slot v-if="rowField.headerSlotName" :name="rowField.headerSlotName" v-bind:value="row[rowFieldIndex]">
                  Missing slot <code>{{ rowField.headerSlotName }}</code>
                </slot>
                <template v-else>
                  {{ row[rowFieldIndex] }}
                </template>
              </th>
            </template>
            <!-- Values -->
            <td v-for="(col, colI) in cols" :key="JSON.stringify(col)" :style="`${(colI % 2) ==0 ? 'background-color:#eee;' : ''}`" class="text-center">
              <slot v-if="$scopedSlots.value" name="value" v-bind:value="values[JSON.stringify({ col, row })]" />
              <template v-else>{{ values[JSON.stringify({ col, row })] }}</template>
            </td>
            <!-- Row footers (if slots are provided) -->
            <template
              v-for="(rowField, rowFieldIndex) in rowFieldsReverse"
            >
              <th
                v-if="rowField.showFooter && spanSize(rows, rowFields.length - 1 - rowFieldIndex, rowIndex) !== 0"
                :key="'footer-row-' + rowField.label"
                :rowspan="spanSize(rows, rowFields.length - rowFieldIndex - 1, rowIndex)"
              >
                <slot v-if="rowField.footerSlotName" :name="rowField.footerSlotName" v-bind:value="row[rowFields.length - rowFieldIndex - 1]">
                  Missing slot <code>{{ rowField.footerSlotName }}</code>
                </slot>
                <template v-else>
                  {{ row[rowFields.length - rowFieldIndex - 1] }}
                </template>
              </th>
            </template>
          </tr>
        </tbody>

        <!-- Table footer -->
        <tfoot
          v-for="(colField, colFieldIndex) in colFieldsReverse"
          :key="'footer-col-' + colField.label"
        >
          <tr
            v-if="colField.showFooter"
          >
            <!-- Bottom left dead zone -->
            <th
              v-if="colFieldIndex === firstColFieldFooterIndex && rowHeaderSize > 0"
              :colspan="rowHeaderSize"
              :rowspan="colHeaderSize"
            ></th>
            <!-- Column footers -->
            <template
              v-for="(col, colIndex) in cols"
            >
              <th
                v-if="spanSize(cols, colFields.length - colFieldIndex - 1, colIndex) !== 0"
                :key="JSON.stringify(col)"
                class="text-center"
                :style="`${(colIndex % 2) ==0 ? 'background-color:#eee;' : ''}`"
                :colspan="spanSize(cols, colFields.length - colFieldIndex - 1, colIndex)"
              >
                <slot
                  v-if="colField.footerSlotName"
                  :name="colField.footerSlotName"
                  v-bind:value="{name: col[colFields.length - colFieldIndex - 1], total: colTotals[JSON.stringify(col)]}"
                  v-bind:total="colTotals[col]"
                >
                  Missing slot <code>{{ colField.footerSlotName }}</code>
                </slot>
                <template v-else>
                  {{ col[colFields.length - colFieldIndex - 1] }}
                </template>
              </th>
            </template>
            <!-- Bottom right dead zone -->
            <th
              v-if="colFieldIndex === firstColFieldFooterIndex && rowFooterSize > 0"
              :colspan="rowFooterSize"
              :rowspan="colFooterSize"
            ></th>
          </tr>
        </tfoot>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
import naturalSort from 'javascript-natural-sort'
import { downloadTableWith } from './util'

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    rowFields: {
      type: Array,
      default: () => []
    },
    colFields: {
      type: Array,
      default: () => []
    },
    reducer: {
      type: Function,
      default: (sum, item) => sum + 1
    },
    noDataWarningText: {
      type: String,
      default: 'No data to display.'
    },
    overNumOfCellsWarningText: {
      type: String,
      default: 'Too many cells. Please reduce the num of rows / cols.'
    },
    filename: {
      type: String,
      default: ''
    },
    numOfCellsLimitation: {
      type: Number,
      default: 10000
    },
    isDataLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // Watched target properties for re-calculation
    calculationTriggers: function () {
      return [this.rowFields, this.colFields, this.reducer]
    },
    // Reversed props for footer iterators
    colFieldsReverse: function () {
      return this.colFields.slice().reverse()
    },
    rowFieldsReverse: function () {
      return this.rowFields.slice().reverse()
    },
    // Number of col header rows
    colHeaderSize: function () {
      return this.colFields.filter(colField => colField.showHeader === void 0 || colField.showHeader).length
    },
    // Number of col footer rows
    colFooterSize: function () {
      return this.colFields.filter(colField => colField.showFooter).length
    },
    // Number of row header columns
    rowHeaderSize: function () {
      return this.rowFields.filter(rowField => rowField.showHeader === void 0 || rowField.showHeader).length
    },
    // Number of row footer columns
    rowFooterSize: function () {
      return this.rowFields.filter(rowField => rowField.showFooter).length
    },
    // Index of the first column field header to show - used for table header dead zones
    firstColFieldHeaderIndex: function () {
      return this.colFields.findIndex(colField => colField.showHeader === void 0 || colField.showHeader)
    },
    // Index of the first column field footer to show - used for table footer dead zones
    firstColFieldFooterIndex: function () {
      return this.colFieldsReverse.findIndex(colField => colField.showFooter)
    }
  },
  data () {
    return {
      values: null,
      colTotals: null,
      total: null
    }
  },
  methods: {
    getNumOfCells: function () { // this.cols / this.rows are not reactive
      return this.cols.length * this.rows.length
    },
    calculateCols: function () {
      const cols = []
      const extractColsRecursive = (data, depth, filters) => {
        const getter = this.colFields[depth].getter
        const sort = this.colFields[depth].sort || naturalSort
        const values = [...new Set(data.map(getter))].sort(sort)
        values.forEach(value => {
          // Build new filter hash
          const valueFilters = { ...filters, [depth]: value }
          const filteredData = this.filterDataByValue({ data, getter, filter: value })
          // Recursive call
          if (depth + 1 < this.colFields.length) {
            extractColsRecursive(filteredData, depth + 1, valueFilters)
          } else {
            cols.push(valueFilters)
          }
        })
      }
      if (this.colFields.length > 0) {
        extractColsRecursive(this.data, 0, {})
      } else {
        cols.push({})
      }
      return cols
    },
    calculateRows: function () {
      const rows = []
      const extractRowsRecursive = (data, depth, filters) => {
        const getter = this.rowFields[depth].getter
        const sort = this.rowFields[depth].sort || naturalSort
        const values = [...new Set(data.map(getter))].sort(sort)
        values.forEach(value => {
          // Build new filter hash
          const valueFilters = { ...filters, [depth]: value }
          const filteredData = this.filterDataByValue({ data, getter, filter: value })
          // Recursive call
          if (depth + 1 < this.rowFields.length) {
            extractRowsRecursive(filteredData, depth + 1, valueFilters)
          } else {
            rows.push(valueFilters)
          }
        })
      }
      if (this.rowFields.length > 0) {
        extractRowsRecursive(this.data, 0, {})
      } else {
        rows.push({})
      }
      return rows
    },
    filterDataByValue: function ({ data = [], getter, filter = undefined }) {
      // Filter data with getters
      if (filter !== void 0) {
        return data.filter(item => getter(item) === filter)
      } else {
        return data.slice()
      }
    },
    // Get data filtered
    filteredData: function ({ data = [], colFilters = {}, rowFilters = {} }) {
      // Prepare getters
      const colGetters = {}
      const rowGetters = {}
      for (const depth in colFilters) {
        colGetters[depth] = this.colFields[depth].getter
      }
      for (const depth in rowFilters) {
        rowGetters[depth] = this.rowFields[depth].getter
      }
      // Filter data with getters
      return data.filter(item => {
        let keep = true
        for (const depth in colFilters) {
          if (colGetters[depth](item) !== colFilters[depth]) {
            keep = false
            break
          }
        }
        if (keep) {
          for (const depth in rowFilters) {
            if (rowGetters[depth](item) !== rowFilters[depth]) {
              keep = false
              break
            }
          }
        }
        return keep
      })
    },
    // Get colspan/rowspan size
    spanSize: function (values, fieldIndex, valueIndex) {
      // If left value === current value
      // and top value === 0 (= still in the same top bracket)
      // The left td will take care of the display
      if (valueIndex > 0 &&
        values[valueIndex - 1][fieldIndex] === values[valueIndex][fieldIndex] &&
        (fieldIndex === 0 || (this.spanSize(values, fieldIndex - 1, valueIndex) === 0))) {
        return 0
      }
      // Otherwise, count entries on the right with the same value
      // But stop if the top value !== 0 (= the top bracket has changed)
      let size = 1
      let i = valueIndex
      while (i + 1 < values.length &&
        values[i + 1][fieldIndex] === values[i][fieldIndex] &&
        // eslint-disable-next-line no-unmodified-loop-condition
        (fieldIndex === 0 || (i + 1 < values.length && this.spanSize(values, fieldIndex - 1, i + 1) === 0))) {
        i++
        size++
      }
      return size
    },
    // Called when cols/rows have changed => recompute values
    computeValues: function () {
      // Remove old values
      this.values = {}
      this.colTotals = {}
      this.total = 0
      if (this.getNumOfCells() > this.numOfCellsLimitation) {
        // do not calculate if too many values
        return
      }
      // Compute new values
      this.rows.forEach(row => {
        const rowData = this.filteredData({ data: this.data, rowFilters: row })
        this.cols.forEach(col => {
          const data = this.filteredData({ data: rowData, colFilters: col })
          const key = JSON.stringify({ col, row })
          const value = data.reduce(this.reducer, 0)
          if (!this.colTotals[JSON.stringify(col)]) { this.colTotals[JSON.stringify(col)] = 0 }
          this.colTotals[JSON.stringify(col)] += value
          this.total += value
          this.values[key] = value
        })
      })
    },
    saveTableWithText (format) {
      downloadTableWith(format, this.cols, this.colFields, this.rows, this.rowFields, this.rowHeaderSize, this.values, this.filename)
    }
  },
  watch: {
    calculationTriggers: function () {
      this.rows = this.calculateRows()
      this.cols = this.calculateCols()
      this.computeValues()
    }
  },
  created: function () {
    this.rows = this.calculateRows()
    this.cols = this.calculateCols()
    this.computeValues()
  }
}
</script>

<style lang="scss" scoped>
/*
td {
  min-width: 100px;
}
table thead th {
  white-space: nowrap;
}
*/
</style>
