
<template>
  <v-alert v-if="is_error" :class="col">
    {{ error_header }}<br/>
    <span class="caption">{{ error_sub }}</span>
    <v-expansion-panels accordion flat>
        <v-expansion-panel :class="col">
        <v-expansion-panel-header>
            DETAILS
        </v-expansion-panel-header>
        <v-expansion-panel-content>
            <span v-if="error_code"><b>Code: </b> {{error_code}}</span><br/>
            <span class="caption" v-if="error_details"><b>Details: </b> {{ error_details }}</span>
        </v-expansion-panel-content>
        </v-expansion-panel>
  </v-expansion-panels>
  </v-alert>
</template>

<script>

export default {
  name: 'Error',
  props: ['value'],
  components: {
  },
  data () {
    return {
      is_error: false,
      error_header: null,
      error_sub: null,
      error_code: null,
      error_details: null,
      col: 'red white--text'
    }
  },
  watch: {
    value: function () {
      //console.log(this.value)
      if (this.value.name === 'AxiosError') {
        if (this.value !== 'AxiosError: Request aborted' && this.value.response) {

          const status = this.value.response.status
          if (status === 401 || status === 403) {
            location.replace('/signin?redirect=' + this.$route.path)
            return
          }
          if (status === 404) {
            this.col = 'orange white--text'
            this.error_header = 'Sorry! We could not find what you requested.'
            this.is_error = true
            return
          }

          this.error_header = 'Sorry! The server has reported an error.'
          this.error_sub = 'The error has been recorded and the system administrator has been informed.'
          this.error_details = this.value.response.statusText
          this.col = 'red white--text'
          this.is_error = true
          setTimeout(() => { this.is_error = false }, 5000)
        }
      } else {
        this.error_header = 'Sorry! An error has occured.'
        this.error_details = this.value
        this.col = 'red white--text'
        this.is_error = true
        console.log('Non-axios Error: ' + this.err)
      }
    }
  },
  computed: {
  },
  created () {

  },
  methods: {
  }
}
</script>

<style scoped>

</style>
