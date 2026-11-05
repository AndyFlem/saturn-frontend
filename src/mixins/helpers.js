import Vue from 'vue'
import { DateTime } from 'luxon'
import {format} from 'd3'
import helpers from '@/services/helpers'

Vue.mixin({
  methods: {
    secureGet (url, prms) {
      if (!prms) { prms = {} }
      prms.source = this.$options.name
      prms.build = Vue.prototype.$config.metadata.buildRevision
      prms = {params: prms}
      if (Vue.prototype.$config.DEVELOPMENT_MODE) {
        console.log(this.$options.name,'-', this.$route.name, this.$route.path, '- GET:', url, ':', prms)
      }
      return this.$http.secured.get(url, prms)
    },
    secureGetXLSX (url, prms) {
      if (!prms) { prms = {} }
      prms.source = this.$options.name
      prms.build = Vue.prototype.$config.metadata.buildRevision
      prms = {params: prms}
      if (Vue.prototype.$config.DEVELOPMENT_MODE) {
        console.log(this.$options.name, ' GET XLSL:', url, ':', prms)
      }
      return this.$http.securedXLSX.get(url, prms)
    },
    securePost (url, prms) {
      if (!prms) { prms = {} }
      prms.source = this.$options.name
      prms.build = Vue.prototype.$config.metadata.buildRevision
      if (Vue.prototype.$config.DEVELOPMENT_MODE) {
        console.log(this.$options.name, ' POST:', url, ':', prms)
      }
      return this.$http.secured.post(url, prms)
    },
    securePostNoTimeout (url, formData, progressCallback) {
      // if (!formData) { formData = new FormData() }
      formData.append('source', this.$options.name)
      formData.append('build', Vue.prototype.$config.metadata.buildRevision)
      if (Vue.prototype.$config.DEVELOPMENT_MODE) {
        console.log(this.$options.name, ' POST:', url, formData)
      }
      return this.$http.securedNoTimeout.post(url, formData, { onUploadProgress: progressCallback })
    },
    securePut (url, prms) {
      if (!prms) { prms = {} }
      prms.source = this.$options.name
      prms.build = Vue.prototype.$config.metadata.buildRevision
      if (Vue.prototype.$config.DEVELOPMENT_MODE) {
        console.log(this.$options.name, ' PUT:', url, ':', prms)
      }
      return this.$http.secured.put(url, prms)
    },
    secureDelete (url, prms) {
      if (!prms) { prms = {} }
      prms.source = this.$options.name
      prms.build = Vue.prototype.$config.metadata.buildRevision
      if (Vue.prototype.$config.DEVELOPMENT_MODE) {
        console.log(this.$options.name, ' DELETE:', url, ':', prms)
      }
      return this.$http.secured.delete(url, prms)
    },
    siteStatusColor (site) {
      switch (site.site_status_ref) {
        case 'UNAVAIL':
          return helpers.statusColors().A
        case 'AVAIL':
          return helpers.statusColors().C
        case 'ORDER':
          return helpers.statusColors().B
        case 'OWN':
          return helpers.statusColors().D
        case 'UNSUITABLE':
          return helpers.statusColors().E
      }
    },
    eventStatusColor (ref) {
      switch (ref) {
        case 'CANCELLED':
          return helpers.statusColors().A
        case 'CREATED':
          return helpers.statusColors().C
      }
    },
    siteworkStatusColor (ref) {
      switch (ref) {
        case 'DRAFT':
          return helpers.statusColors().A
        case 'CONFIRMED':
          return helpers.statusColors().C
        case 'COMPLETE':
          return helpers.statusColors().D
        case 'CANCELLED':
          return helpers.statusColors().E

      }
    },
    saleStatusColor (ref) {
      switch (ref) {
        case 'DRAFT':
          return helpers.statusColors().A
        case 'UNAUTHORIZED':
          return helpers.statusColors().F
        case 'ORDERED':
          return helpers.statusColors().B
        case 'PAID':
          return helpers.statusColors().C
        case 'FULFILLED':
          return helpers.statusColors().D
      }
    },
    creditStatusColor (ref) {
      switch (ref) {
        case 'DRAFT':
          return helpers.statusColors().A
        case 'UNAUTHORIZED':
          return helpers.statusColors().F
        case 'POSTED':
          return helpers.statusColors().C
      }
    },
    burialStatusColor (ref) {
      switch (ref) {
        case 'DRAFT':
          return helpers.statusColors().A
        case 'UNSITED':
          return helpers.statusColors().B
        case 'CONFIRMED':
          return helpers.statusColors().C
        case 'COMPLETE':
          return helpers.statusColors().D
      }
    },
    chkStr (val) {
      return val ? val + ' ' : ''
    },
    camelize (str) {
      const regex = /-(\w)/g
      return str.replace(regex, (_, c) => (c ? c.toUpperCase() : ''))
    },
    formatM (val) {
      if (!isNaN(parseFloat(val))) {
        return (val < 0 ? '(' : '') + Vue.prototype.$config.MONEY_SYMBOL + format(',.2f')(Math.abs(val)) + (val < 0 ? ')' : '')
      } else {
        return Vue.prototype.$config.MONEY_SYMBOL + '0.00'
      }
    },
    formatDollar (val) {
      if (!isNaN(parseFloat(val))) {
        return '$' + format(',.0f')(val)
      } else {
        return '$ -'
      }
    },
    formatMInt (val) {
      if (!isNaN(parseFloat(val))) {
        return (val < 0 ? '(' : '') + Vue.prototype.$config.MONEY_SYMBOL + format(',.0f')(Math.abs(val)) + (val < 0 ? ')' : '')
      } else {
        return Vue.prototype.$config.MONEY_SYMBOL + '0'
      }
    },
    formatInt (val) {
      if (!isNaN(parseFloat(val))) {
        return format(',.0f')(val)
      } else {
        return '-'
      }
    },
    formatDec (val) {
      if (!isNaN(parseFloat(val))) {
        if (parseFloat(val) < 5) {
          if (parseFloat(val) < 2) {
            return format(',.2f')(val)
          } else {
            return format(',.1f')(val)
          }
        } else {
          return format(',.0f')(val)
        }
      } else {
        return '-'
      }
    },
    formatT (val) {
      return DateTime.fromISO(val).toLocaleString(DateTime.DATETIME_MED)
    },
    formatSlot (val) {
      if (val) {
        return DateTime.fromISO(val).toLocaleString(DateTime.TIME_SIMPLE)
      } else {
        return ''
      }
    },
    formatD (val) {
      if (val) {
        return DateTime.fromISO(val).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      } else {
        return 'not set'
      }
    },
    formatDShort (val) {
      if (val) {
        return DateTime.fromISO(val).toFormat('d LLL yy')
      } else {
        return 'not set'
      }
    },
    formatD2 (val) {
      if (val) {
        return 'CCC' // moment(val).local(true).format('YYYY-MM-DD')
      } else {
        return ''
      }
    },
    currentDate () {
      return DateTime.local().toISODate()
    },
    age (birthDate, ageDate) {
      return Math.floor(DateTime.fromISO(ageDate).diff(DateTime.fromISO(birthDate), 'year').years)
    }
  }
})
