<template>
  <div>
    <!-- Top row -->
    <v-row v-if="showSettings">
      <!-- Disabled fields -->
      <v-col cols="12" class="">
        <v-sheet elevation="1" class="pl-5 pb-5 pt-5 d-flex">
          <draggable
            v-model="internal.fields"
            class="d-flex flex-row flex-wrap"
            :class="dragAreaClass"
            :options="{ group: 'fields' }"
            @start="_start" @end="_end"
          >
            <div v-for="field in internal.fields" :key="'field-' + field.label">
              <v-btn
                class="ml-1 mr-1"
                color="primary"
                small
              >
                {{ field.label }}
              </v-btn>
            </div>
          </draggable>
          <v-spacer/>
          <v-menu>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                color="primary"
                icon
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-menu</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item>
                <v-list-item-title><v-btn ref="pivot-copy-button" text small>Copy table to clipboard</v-btn></v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title><v-btn @click="_clickedSaveButton('csv')" text small>Save table in CSV</v-btn></v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title><v-btn @click="_clickedSaveButton('tsv')" text small>Save table in TSV</v-btn></v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-sheet>
      </v-col>
    </v-row>

    <!--<div v-if="showSettings" class="row grid-x flex-nowrap mb-4">-->
    <v-row v-if="showSettings">
      <!-- Top left zone - TODO: renderer select menu -->
      <v-col cols="2" sm="3" md="1"></v-col>

      <!-- Horizontal fields -->
      <v-col cols="10" sm="9" md="11">
        <v-sheet elevation="1" class="pl-5 pb-5 pt-5 d-flex">
          <p v-if="internal.colFields.length === 0" class="caption mt-3">{{ colsLabelText || 'Drag fields here'}}</p>
          <v-btn
            v-else
            class="mr-7"
            fab
            color="grey"
            title="Clear column fields"
            x-small
            dark
            @click="_resetCols"
          >
            <v-icon color="white">
              mdi-cancel
            </v-icon>
          </v-btn>
          <draggable
            v-model="internal.colFields"
            :options="{ group: 'fields' }"
            @start="_start" @end="_end"
            class="d-flex flex-row flex-wrap"
            :class="dragAreaClass"
          >
            <div v-for="field in internal.colFields" :key="'col-' + field.label">
              <v-btn
                class="ml-1 mr-1 mt-1 mb-1"
                color="primary"
                small
                @click="_fieldClicked(field.label)"
              >
                {{ field.label }}
                <v-icon color="white" right v-if="internal.fieldsOrder[field.label] === 'desc'">
                  mdi-chevron-left
                </v-icon>
                <v-icon color="white" right v-else>
                  mdi-chevron-right
                </v-icon>
              </v-btn>
            </div>
          </draggable>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <!-- Vertical fields -->
      <v-col cols="4" sm="3" md="1">
        <v-sheet elevation="1" class="pl-5 pb-5 pt-5 pr-5" align="center" height="100%">
        <p v-if="internal.rowFields.length === 0" class="caption pt-3">{{ rowsLabelText || 'Drag fields here'}}</p>
        <div v-else>
          <v-btn
            class="mb-7"
            fab
            color="grey"
            title="Clear row fields"
            x-small
            dark
            @click="_resetRows"
          >
            <v-icon color="white">
              mdi-cancel
            </v-icon>
          </v-btn>
        </div>
        <draggable
          v-model="internal.rowFields"
          :options="{ group: 'fields' }"
          @start="_start"
          @end="_end"
          class="d-flex flex-column align-items-start"
          :class="dragAreaClass"
        >
          <div v-for="field in internal.rowFields" :key="'row-' + field.label">
              <v-btn
                class="ml-1 mr-1 mt-1 mb-1"
                color="primary"
                small
                @click="_fieldClicked(field.label)"
              >
                {{ field.label }}
                <v-icon color="white" right v-if="internal.fieldsOrder[field.label] === 'desc'">
                  mdi-chevron-up
                </v-icon>
                <v-icon color="white" right v-else>
                  mdi-chevron-down
                </v-icon>
              </v-btn>
          </div>
        </draggable>
        </v-sheet>
      </v-col>

      <!-- Table -->
      <v-col cols="8" sm="9" md="11">
        <pivot-table
          ref="pivottable"
          :data="data"
          :row-fields="internal.rowFields"
          :col-fields="internal.colFields"
          :reducer="reducer"
          :no-data-warning-text="noDataWarningText"
          :filename="filename"
          :is-data-loading="isDataLoading"
        >
          <!-- :style="{ height: tableHeight + 'px'}" -->
          <!-- pass down scoped slots -->
          <template v-for="(slot, slotName) in $scopedSlots" :slot="slotName" slot-scope="{ value }">
            <slot :name="slotName" v-bind="{ value }"></slot>
          </template>
          <template slot="loading">
            <slot name="loading"></slot>
          </template>
        </pivot-table>
        <transition name="copied-alert">
          <div v-if="showCopiedAlert" class="alert alert-secondary pivot-copied-alert">
            Copied to clipboard
          </div>
        </transition>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Clipboard from 'clipboard'
import PivotTable from './PivotTable.vue'
import naturalSort from 'javascript-natural-sort'
import Draggable from 'vuedraggable'
// import { VBTooltip } from 'bootstrap-vue'
export default {
  name: 'Pivot',
  components: {
    PivotTable,
    Draggable
  },
  // directives: { 'b-tooltip': VBTooltip },
  model: {
    prop: 'fields',
    event: 'change'
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => {}
    },
    fields: {
      type: Object,
      default: () => {}
    },
    reducer: {
      type: Function,
      default: (sum, item) => sum + 1
    },
    showSettings: {
      type: Boolean,
      default: true
    },
    colsLabelText: {
      type: String,
      default: ''
    },
    rowsLabelText: {
      type: String,
      default: ''
    },
    hideSettingsText: {
      type: String,
      default: 'Hide settings'
    },
    showSettingsText: {
      type: String,
      default: 'Show settings'
    },
    noDataWarningText: {
      type: String,
      default: 'No data to display.'
    },
    filename: {
      type: String,
      default: ''
    },
    isDataLoading: {
      type: Boolean,
      default: false
    },
    tableHeight: {
      type: Number,
      default: 12300
    }
  },
  data: function () {
    return {
      internal: {
        fields: this.fields.availableFields,
        rowFields: this.fields.rowFields,
        colFields: this.fields.colFields,
        fieldsOrder: this.fields.fieldsOrder
      },
      dragging: false,
      showCopiedAlert: false
    }
  },
  created () {
    this._sortFields(this.internal.fieldsOrder)
  },
  mounted () {
    const self = this
    const clipboard = new Clipboard(self.$refs['pivot-copy-button'], {
      target: () => self.$refs.pivottable.$el
    })
    clipboard.on('success', (e) => {
      e.clearSelection()
      self.onPivotTableCopied(e)
    })
  },
  computed: {
    dragAreaClass: function () {
      return this.dragging ? 'drag-area--highlight' : null
    }
  },
  watch: {
    'internal.fields': function () {
      this._emitPivotFieldsChange()
    },
    'internal.rowFields': function () {
      this._emitPivotFieldsChange()
    },
    'internal.colFields': function () {
      this._emitPivotFieldsChange()
    },
    'internal.fieldsOrder': function () {
      this._emitPivotFieldsChange()
    }
  },
  methods: {
    _start: function () {
      this.dragging = true
    },
    _end: function () {
      this.dragging = false
    },
    _resetCols () {
      this.internal.fields = [...this.internal.fields, ...this.internal.colFields]
      this.internal.colFields = []
    },
    _resetRows () {
      this.internal.fields = [...this.internal.fields, ...this.internal.rowFields]
      this.internal.rowFields = []
    },
    _emitPivotFieldsChange () {
      const value = {
        availableFields: this.internal.fields,
        rowFields: this.internal.rowFields,
        colFields: this.internal.colFields,
        fieldsOrder: this.internal.fieldsOrder
      }
      this.$emit('change', value)
    },
    downloadPivotTableData (format) {
      this.$refs.pivottable.saveTableWithText(format)
    },
    _clickedSaveButton (format) {
      this.downloadPivotTableData(format)
    },
    _sortFields (fieldsOrder) {
      const appendSortOption = function (fields) {
        return fields.map((field) => {
          if (fieldsOrder[field.label] === 'desc') {
            return { ...field, sort: (x, y) => naturalSort(y, x) }
          } else {
            let { sort, ..._field } = field // remove 'sort' key
            return _field
          }
        })
      }
      this.internal.colFields = appendSortOption(this.internal.colFields)
      this.internal.rowFields = appendSortOption(this.internal.rowFields)
    },
    _fieldClicked (label) {
      const orgVal = this.internal.fieldsOrder[label]
      if (orgVal) {
        // recreate instance for reactivity
        this.internal.fieldsOrder = { ...this.internal.fieldsOrder, [label]: undefined }
      } else {
        this.internal.fieldsOrder = { ...this.internal.fieldsOrder, [label]: 'desc' }
      }
      this._sortFields(this.internal.fieldsOrder)
    },
    onPivotTableCopied () {
      this.showCopiedAlert = true
      setTimeout(() => { this.showCopiedAlert = false }, 700)
    }
  }
}
</script>

<style lang="scss" scoped>
/*
$base-space: 0.75rem;
$border-space: 0.0625rem;
$padding-space: 0.9375rem;
.left-col {
  width: 12rem;
  padding: 0 $padding-space;
}
.drag-area {
  min-width: 10rem;
  min-height: 2.05rem + $base-space * 2;
  border: 1px dashed #ccc;
  padding: $base-space;
  padding-bottom: 0;
  transition: background-color 0.4s;
  &.has-label {
    padding-top: 1rem + $base-space * 2;
  }
  &.flex-row > div {
    margin-right: $base-space;
    margin-bottom: $base-space;
    &:last-child {
      margin-right: 0rem;
    }
  }
  &.flex-column > div {
    margin-bottom: $base-space;
  }
  * {
    cursor: grab !important;
    &:active {
      cursor: grabbing !important;
    }
  }
  &--highlight {
    background-color: #f3f3f3;
  }
}
.drag-area-placeholder {
  position: absolute;
  top: 1rem;
  left: 2rem;
  user-select: none;
}
$cross-svg: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='rgba(0, 0, 0, 0)' stroke='white'><path d='M5,5 L11,11 M5,11 L11,5'></path></svg>");
.drag-area-clear-button {
  position: absolute;
  padding: 0;
  margin: 0;
  content: $cross-svg;
  transition: opacity 0.2s ease-out;
}
.drag-area {
  & ~ .drag-area-clear-button {
    opacity: 0;
  }
  &:hover ~ .drag-area-clear-button {
    opacity: 1;
  }
  & ~ .drag-area-clear-button:hover {
    opacity: 1;
  }
}
@mixin circle-sized($size: 1.8rem) {
  width: $size;
  height: $size;
  line-height: $size;
  top: -1 * $size / 2;
  left: -1 * $size / 2 + $padding-space;
}
.circle-background {
  border-radius: 50%;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  @include circle-sized;
}
$carret-bold-svg: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='15' fill='rgba(0, 0, 0, 0)' stroke='white'><path d='M0,5 L4,10 L8,5' stroke-width='1.5'></path></svg>");
.btn-draggable {
  text-align: left;
  margin: 0;
  .left-col & {
    max-width: 10rem - $base-space * 2;
  }
  .btn-label {
    overflow: hidden;
  }
  .sort-dict {
    content: $carret-bold-svg;
    transition: opacity 0.15s ease-in-out;
    opacity: 0.7;
    transform: rotate(180deg);
    &.--desc {
      transform: rotate(0deg);
    }
  }
  &:hover .sort-dict {
    opacity: 1;
  }
}
.sortable-ghost {
  opacity: 0.4;
}
.pivottable {
  margin: 0 15px;
  & ~ .table-option-button {
    opacity: 0;
  }
  &:hover ~ .table-option-button {
    opacity: 1;
  }
  & ~ .table-option-button:hover {
    opacity: 1;
  }
}
$hamburger-svg: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='rgba(0, 0, 0, 0)' stroke='white'><path d='M5,6 L15,6 M5,10 L15,10 M5,14 L15,14'></path></svg>");
.table-option-button {
  content: $hamburger-svg;
  position: absolute;
  padding: 0;
  margin: 0;
  transition: opacity 0.2s ease-out;
  border-width: 2px !important;
  left: $base-space*3 + 10rem - $border-space*3;
}
.pivot-copied-alert {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}
.copied-alert-enter-active {
  opacity: 0.6;
}
.copied-alert-leave-active {
  opacity: 0;
  transition: all 0.7s ease;
}
*/
</style>
