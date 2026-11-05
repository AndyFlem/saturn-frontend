<template>
  <div>
    <error-disp v-model="error"/>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11" lg="8">
        <v-card class="elevation-4">
          <v-card-title class="primary white--text">
            Blocks
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="block in blocks" :key="block.block_ref" cols="12" md="3" class="">
                  <v-card>
                      <v-card-title class="text-body-1"><b>{{block.block_ref}}</b></v-card-title>
                      <v-card-text>
                        <v-switch
                          dense
                          :disabled="!$userCheckPermission('PERM_SITES')"
                          @change="updateSaleable(block)"
                          hide-details
                          class="pt-0 pb-0 mt-0 mb-0"
                          v-model="block.saleable"

                          label="Available"
                        />
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

export default {
  name: 'Blocks',
  components: {
    ErrorDisp
  },
  props: [],
  data () {
    return {
      error: null,
      data: null,
      blocks: null
    }
  },
  computed: {
  },
  created () {
    this.secureGet('/api/v1/blocks')
      .then(res => {
        this.blocks = res.data
      })
      .catch(err => { this.error = err })
  },
  methods: {
    updateSaleable (block) {
      this.securePut('/api/v1/blocks/' + block.block_id + '/set_saleable', {saleable: block.saleable})
        .catch(err => { this.error = err })
    }
  },
  watch: {
  }
}
</script>

<style scoped>

</style>
