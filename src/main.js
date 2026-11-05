import Vue from 'vue'
import App from './App'
import router from './router'

import VueAxios from 'vue-axios'
import SaturnUser from '@/plugins/saturn-user'
import Vuetify from 'vuetify/lib/framework'
import Vuelidate from 'vuelidate'
import '@/mixins/helpers'
import VueSocketIOExt from 'vue-socket.io-extended'
import { io } from 'socket.io-client'
import metadata from './metadata.json'

const AxiosServices = require('./services/axios')

let securedAxiosInstance = null
let securedAxiosInstanceXLSX = null

let securedAxiosInstanceNoTimeout = null
let plainAxiosInstance = null

Vue.config.productionTip = false

fetch(process.env.BASE_URL + 'config.json')
  .then(response => response.json())
  .then(data => {
    console.log('Starting vue app.')
    data.metadata = metadata
    Vue.prototype.$config = data
    const opts = {
      theme: {
        themes: {
          light: {
            primary: data.COL_PRIMARY,
            secondary: data.COL_SECONDARY
          }
        }
      }
    }

    const socket = io(data.API_URL, {
      extraHeaders: { Authorization: `Bearer ${localStorage.csrf}` },
      autoConnect: false
    })
    Vue.prototype.$socketConnection = socket
    Vue.use(VueSocketIOExt, socket)
    if (localStorage.csrf) {
      console.log('Opening socket.io')
      socket.open()
    }

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    // setInterval(() => {
    //   console.log('Emitting debug event')
    //   socket.emit('debug', { timestamp: new Date().toISOString() })
    // }, 2000)

    Vue.use(Vuelidate)
    Vue.use(SaturnUser)
    Vue.use(Vuetify)

    securedAxiosInstance = AxiosServices.securedAxiosInstance(data.API_URL,  data.TIMEOUT, {'Content-Type': 'application/json'}, 'json', true)
    securedAxiosInstanceXLSX = AxiosServices.securedAxiosInstance(data.API_URL,  data.TIMEOUT, {'Content-Disposition': 'attachment;', 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}, 'arraybuffer', true)
    securedAxiosInstanceNoTimeout = AxiosServices.securedAxiosInstance(data.API_URL, 0, null, 'json', true)
    plainAxiosInstance = AxiosServices.plainAxiosInstance(data.API_URL)

    Vue.use(VueAxios, {
      secured: securedAxiosInstance,
      securedXLSX: securedAxiosInstanceXLSX,
      securedNoTimeout: securedAxiosInstanceNoTimeout,
      plain: plainAxiosInstance
    })

    /* eslint-disable no-new */
    new Vue({
      router,
      securedAxiosInstance,
      securedAxiosInstanceNoTimeout,
      plainAxiosInstance,
      data: { state: {} },
      vuetify: new Vuetify(opts),
      render: h => h(App)
    }).$mount('#app')
  })
  .catch(err => console.log(err))
