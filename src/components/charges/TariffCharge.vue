<template>
  <div>
    <v-row v-if="!showEdit" class="text-caption bottom-border pl-0 mr-2">
      <v-col v-if="editMode" :class="`pt-${editMode ? '0' : '1'} pb-0 pl-2`">
        <template v-if="editMode">
          <v-btn
            icon
            class="pt-0 pb-0"
            @click="doDelete()"
            color="grey"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn
            icon
            class="pt-0 pb-0"
            @click="showEdit = true"
            color="grey"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-col>
      <v-col :cols="editMode ? '3' : '5'" :class="`pt-${editMode ? '5' : '1'} pb-0 pl-2`">
        <span>{{charge.description}}</span>
      </v-col>
      <v-col cols="5" :class="`pt-${editMode ? '5' : '1'} pb-0 pl-2`">
        <span>{{charge.external_account_id}}-{{charge.product_description}}</span>
      </v-col>
      <v-col cols="2" :class="`pt-${editMode ? '5' : '1'} pb-0 pl-2`">
        {{formatMInt(charge.price)}}
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="6" class="d-flex pt-0 pb-0 pl-2">
          <v-btn
            icon
            class="pt-0 pb-0"
            @click="doUpdate()"
            color="green"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
        <v-btn
          icon
          class="pt-0 pb-0"
          @click="showEdit = false"
          color="red"
        >
          <v-icon>mdi-cancel</v-icon>
        </v-btn>
        <v-text-field
            dense
            hide-details
            class="text-caption"
            v-model="charge.description"
            type="text"
          />
      </v-col>
      <v-col cols="3" class="pt-0 pb-0 pl-2">
        <v-select
          dense
          :items="products"
          item-text="description"
          item-value="product_id"
          class="text-caption"
          v-model="charge.product_id"
          hint="Product"
          @change="productSelected"
        ></v-select>
      </v-col>
      <v-col cols="3" class="pt-0 pb-0 pl-2">
        <v-text-field
            dense
            hide-details
            class="text-caption"
            v-model="charge.price"
            type="text"
          />
      </v-col>
    </v-row>
  </div>
</template>

<script>

export default {
  name: 'TariffCharge',
  props: {
    editMode: Boolean,
    charge: Object,
    products: Array
  },
  components: {
  },
  data () {
    return {
      showEdit: false
    }
  },
  methods: {
    productSelected (productId) {
      const product = this.products.find(product => String(product.product_id) === String(productId))

      if (product) {
        this.charge.external_product_id = product.external_product_id || null
        this.charge.product_description = product.description || null
      } else {
        this.charge.external_product_id = null
        this.charge.product_description = null
      }
    },
    doUpdate () {
      this.$emit('update', this.charge)
      this.showEdit = false
    },
    doDelete () {
      this.$emit('delete', this.charge)
      this.showEdit = false
    }
  }
}
</script>
