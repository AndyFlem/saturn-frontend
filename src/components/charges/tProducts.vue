<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Products
            <v-spacer/>
            <v-btn
              color="primary"
              dark
              class="pt-0"
              fab
              @click="newDialog=true"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pl-5 pr-5">
            <v-row v-for="(product, i) in products" :key="i">
              <template v-if="!product.showEdit">
                <v-col cols="2">
                  <v-btn
                    icon
                    class="pt-0 pb-0"
                    @click="noEdit(); product.showEdit = true;"
                    color="grey"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-col>
                <v-col cols="2">
                  Ac:{{product.external_account_id}}
                </v-col>
                <v-col cols="4">
                  {{product.description}}
                </v-col>
                <v-col cols="2">
                  {{product.product_ref}}
                </v-col>
                <v-col cols="2">
                  {{product.allow_adhoc?'Allows adhoc':''}}
                </v-col>
              </template>
              <template v-else>
                <v-col cols="2">
                  <v-btn
                    icon
                    class="pt-0 pb-0"
                    @click="updateProduct(product)"
                    color="green"
                  >
                    <v-icon>mdi-check</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    class="pt-0 pb-0"
                    @click="noEdit()"
                    color="red"
                  >
                    <v-icon>mdi-cancel</v-icon>
                  </v-btn>
                </v-col>
                <v-col cols="2">
                  <v-text-field
                    dense
                    hide-details
                    class="text-caption"
                    v-model="product.external_account_id"
                    type="text"
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    dense
                    hide-details
                    class="text-caption"
                    v-model="product.description"
                    type="text"
                  />
                </v-col>
                <v-col cols="2">
                  <v-text-field
                    dense
                    hide-details
                    class="text-caption"
                    v-model="product.product_ref"
                    type="text"
                  />
                </v-col>
                <v-col cols="2">
                  <v-switch
                    dense
                    hide-details
                    class="text-caption pt-0"
                    v-model="product.allow_adhoc"
                  >
                  <template class="text-caption" v-slot:label>Allow adhoc?</template>
                  </v-switch>
                </v-col>
              </template>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-dialog
              v-model="newDialog"
              persistent
              max-width="290"
            >
              <v-card>
                <v-card-title class="headline">
                  Add a new product
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        dense
                        hide-details
                        class=""
                        v-model="newAccountId"
                        type="text"
                        label="External Account ID"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        dense
                        hide-details
                        class=""
                        v-model="newDescription"
                        type="text"
                        label="Description"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        dense
                        hide-details
                        class=""
                        v-model="newRef"
                        type="text"
                        label="Product Ref"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-switch
                        dense
                        hide-details
                        class=""
                        v-model="newAdhoc"
                      >
                      <template class="" v-slot:label>Allow adhoc?</template>
                      </v-switch>
                    </v-col>
                  </v-row>
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
                    @click="createProduct"
                  >
                    Create
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ErrorDisp from '@/components/shared/Error'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'Products',
  components: {
    ErrorDisp
  },
  data () {
    return {
      products: [],
      error: null,
      newDescription: null,
      newRef: null,
      newAccountId: null,
      newAdhoc: false,
      newDialog: false
    }
  },
  validations: {
    newDescription: {
      required
    }
  },
  computed: {
    newDescriptionErrors () {
      const errors = []
      if (!this.$v.newDescription.$dirty) return errors
      !this.$v.newName.required && errors.push('A description is required for the product.')
      return errors
    }
  },
  created () {
    this.secureGet('/api/v1/products')
      .then(res => {
        res.data.forEach(prod => {
          prod.showEdit = false
          this.products.push(prod)
        })
      })
      .catch((error) => { this.error = error })
  },
  methods: {
    updateProduct (product) {
      this.securePut('/api/v1/products/' + product.product_id, {product_id: product.product_id, product_ref: product.product_ref, description: product.description, external_account_id: product.external_account_id, allow_adhoc: product.allow_adhoc})
        .then(() => {
          this.noEdit()
        })
    },
    createProduct () {
      const newProduct = {product_ref: this.newRef, description: this.newDescription, external_account_id: this.newAccountId, allow_adhoc: this.newAdhoc}
      this.securePost('/api/v1/products', newProduct)
        .then(res => {
          newProduct.product_id = res.data.product_id
          this.products.push(newProduct)
          this.newDialog = false
          this.newRef = null
          this.newDescription = null
          this.newAccountId = null
          this.newAdhoc = false
        })
    },
    deleteProduct (product, index) {
      this.secureDelete('/api/v1/products/' + product.product_id)
        .then(() => {
          this.products.splice(index, 1)
        })
        .catch((error) => { this.error = error })
    },
    noEdit () {
      this.products.forEach(prod => {
        prod.showEdit = false
      })
    }
  }
}
</script>

  <style scoped>

  </style>
