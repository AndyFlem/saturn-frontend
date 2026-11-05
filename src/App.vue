<template>
  <v-app id="app">
    <v-app-bar app color="primary" dark id="bar">
    <div :style="'height:100%;width:30px;' + 'background-color:' + $config.COL_HOME_ACCENT"></div>
      <v-toolbar-title class="pl-5">
        <router-link class="text-h4 text-uppercase white--text text-decoration-none" :to="{name: 'Home'}">{{$config.TITLE}}</router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="$user() && $userCheckPermission('PERM_NEWS')">
        <v-menu
          v-model="newsShow"
          right
          >
          <template v-slot:activator="{ on, attrs }">
        <v-badge
          color="red"
          class="mr-10"
          :content="newsCount"
          :value="newsCount"
        >
          <v-icon v-bind="attrs" v-on="on">mdi-mail</v-icon>
        </v-badge>
        </template>
          <v-list v-if="news.length>0" two-line>
            <template v-for="(item, i) in news">
            <v-list-item :key="i" style="min-height:0px;">
              <v-list-item-icon class="mb-0 pt-6 mt-0 ml-0 mr-4">
                <v-icon v-text="item.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content class="pt-4 pb-4">
                <v-list-item-title><router-link class="text-body-2" :to="item.link">{{ item.message }}</router-link></v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{item.audit_at}} - {{ item.user.first_name + ' ' + item.user.last_name }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider
              v-if="i < news.length - 1"
              :key="'d' + i"
            ></v-divider>
            </template>
          </v-list>
        </v-menu>
      </template>
      <v-app-bar-nav-icon v-if="$user()" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      v-if="$user()"
      app
      right
      temporary
    >
      <template v-slot:prepend>
        <v-list-item two-line>
          <v-icon large class="pr-5">mdi-account</v-icon>
          <v-list-item-content>
            <v-list-item-title><span v-if="$user().first_name">{{$user().first_name}} </span>{{ $user().last_name }}</v-list-item-title>
            <v-list-item-subtitle>Logged In</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-item to="/">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
         <v-list-group
          :value="false"
          prepend-icon="mdi-tree-outline"
          v-if="$userCheckPermission('PERM_VIEW', true) || $userCheckPermission('PERM_EDIT', true) || $userCheckPermission('PERM_WORKS', true)"
        >
          <template v-slot:activator>
            <v-list-item-title>Park</v-list-item-title>
          </template>
          <v-list-item v-if="$userCheckPermission('PERM_VIEW', true)" to="/calendar">
            <v-list-item-icon class="pl-5">
              <v-icon>mdi-calendar</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Calendar</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="$userCheckPermission('PERM_VIEW', true)" to="/sites_map">
            <v-list-item-icon class="pl-5">
              <v-icon  class="">mdi-map-legend</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Map</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="$userCheckPermission('PERM_VIEW', true)" to="/burials">
            <v-list-item-icon class="pl-5">
              <v-icon>mdi-grave-stone</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Burials</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="$userCheckPermission('PERM_VIEW', true)" to="/sites">
            <v-list-item-icon class="pl-5">
              <v-icon  class="">mdi-map-marker-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Sites</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="$userCheckPermission('PERM_WORKS', true)" to="/siteworks">
            <v-list-item-icon class="pl-5">
              <v-icon  class="">mdi-shovel</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Site Works</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <v-list-group
          :value="false"
          prepend-icon="mdi-account"
          v-if="$userCheckPermission('PERM_VIEW', true) || $userCheckPermission('PERM_EDIT', true)"
        >
          <template v-slot:activator>
            <v-list-item-title>Customers</v-list-item-title>
          </template>
          <v-list-item :disabled="!$userCheckPermission('PERM_VIEW', true)" to="/customers">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-account-multiple</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Customers</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item :disabled="!$userCheckPermission('PERM_EDIT', true)" to="/new_customer">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-account-plus</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>New Customer</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <v-list-item v-if="$userCheckPermission('PERM_VIEW', true)" to="/sales">
          <v-list-item-icon class="">
            <v-icon>mdi-text-box-search-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Sales</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-group
          :value="false"
          prepend-icon="mdi-point-of-sale"
          v-if="$userCheckPermission('PERM_ACCOUNTS', true)"
        >
          <template v-slot:activator>
            <v-list-item-title>Accounts</v-list-item-title>
          </template>
          <v-list-item v-if="$userCheckPermission('PERM_VIEW', true)" to="/credits">
            <v-list-item-icon class="pl-5">
              <v-icon>mdi-text-box-search-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Credit Notes</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/sales_export">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-export-variant</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Batch Export</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
        </v-list-group>

        <v-list-group
          :value="false"
          prepend-icon="mdi-chart-bar"
          v-if="$userCheckPermission('PERM_REPORTS', true)"
        >
          <template v-slot:activator>
            <v-list-item-title>Reports</v-list-item-title>
          </template>
          <v-list-item to="/daily_reports">
              <v-list-item-icon>
                <v-icon class="pl-5">mdi-chart-bar</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Daily Reports</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item to="/reports">
              <v-list-item-icon>
                <v-icon class="pl-5">mdi-chart-bar</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Monthly Reports</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item to="/annual_reports">
              <v-list-item-icon>
                <v-icon class="pl-5">mdi-chart-line</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Annual Reports</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item to="/user_report">
              <v-list-item-icon>
                <v-icon class="pl-5">mdi-account-multiple</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>User Reports</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item to="/monthly_report">
              <v-list-item-icon>
                <v-icon class="pl-5">mdi-chart-bar</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Monthly Schedules</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item to="/stock">
              <v-list-item-icon>
                <v-icon class="pl-5">mdi-border-all</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Stock</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <v-list-group
          :value="false"
          prepend-icon="mdi-currency-usd"
          v-if="$userCheckPermission('PERM_TARIFFS', true)"
        >
          <template v-slot:activator>
            <v-list-item-title>Tariffs</v-list-item-title>
          </template>
          <v-list-item to="/tariffs">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-currency-usd</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Tariffs</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item to="/products">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-currency-usd</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Products</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item to="/exchange">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-currency-usd</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Exchange Rates</v-list-item-title>
              </v-list-item-content>
          </v-list-item>

        </v-list-group>
        <v-list-group
          :value="false"
          prepend-icon="mdi-cog"
          v-if="$userCheckPermission('PERM_TARIFFS', true) || $userCheckPermission('PERM_SITES', true)"
        >
          <template v-slot:activator>
            <v-list-item-title>Setup</v-list-item-title>
          </template>
          <v-list-item to="/site_types" v-if="$userCheckPermission('PERM_SITES', true)">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-home-city</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Site Types</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="$userCheckPermission('PERM_SITES', true)" to="/blocks">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-texture-box</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Blocks</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item to="/contractors">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-car-estate</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Contractors</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="$userCheckPermission('PERM_TARIFFS', true)" to="/system">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-cog</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>System</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="$userCheckPermission('PERM_TARIFFS', true)" to="/bulkimport">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-cog</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Bulk Import</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <v-list-group
        :value="false"
        prepend-icon="mdi-account-circle"
        v-if="$userCheckPermission('PERM_USERS_VIEW', true) || $userCheckPermission('PERM_PERMISSIONS', true)"
      >
        <template v-slot:activator>
          <v-list-item-title>Users</v-list-item-title>
        </template>
          <v-list-item v-if="$userCheckPermission('PERM_USERS_VIEW', true)" to="/users">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-account-multiple</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Users</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="$userCheckPermission('PERM_PERMISSIONS', true)" to="/permissions">
              <v-list-item-icon class="pl-5">
                <v-icon>mdi-clipboard-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Permissions</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <v-divider></v-divider>
        <v-list-item
          @click="signOut"
        >
            <v-list-item-icon>
              <v-icon>mdi-logout-variant</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Sign out</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid :fill-height="$route.path === '/sites_map'">
        <router-view />
      </v-container>
    </v-main>
    <v-footer class="primary" padless>
      <v-col
        class="text-center white--text"
        cols="12"
      >
        {{ new Date().getFullYear() }} — <strong>Memorial Park</strong>
      </v-col>
    </v-footer>
    <v-container v-if="$user() && $config.DEVELOPMENT_MODE">
    <v-row>
      <v-col cols="12">
      <div class="caption grey">User: {{$user().user_id}}, {{$user().user_name}}, {{$user().email}}</div>
      <div v-if="$user().permissionsDict" class="caption grey">Users Permissions: {{Object.keys($user().permissionsDict)}}</div>
      <div class="light-green caption">{{$route.path}}</div>
      <div class="light-green caption">{{$route.meta.permission_ref}}</div>
      <div class="light-blue caption">{{$config}}</div>
      </v-col>
    </v-row>
    </v-container>
  </v-app>
</template>

<script>
import { DateTime } from 'luxon'
const Favico = require('./services/favicon')
var favicon = new Favico({
  animation: 'slide'
})
favicon.badge('')

export default {
  name: 'App',
  data () {
    return {
      drawer: false,
      userRefresh: false,
      news: [],
      newsCount: 0,
      newsShow: false
    }
  },
  sockets: {
    debug (val) {
      console.log('Debug event received:', val)
    },
    logout (val) {
      console.log('LOGOUT COMMAND!')
      this.signOut()
    },
    audit (val) {
      //console.log('Audit', val)
      if (val.primary.object === 'credit' && val.primary.action === 'CREATED') {
        const customerName = val.primary.data.salutation + ' ' + val.primary.data.first_name + ' ' + val.primary.data.last_name
        this.addNews('mdi-point-of-sale', `New credit note added for customer ${customerName}`, val.user, val.audit_at, {name: 'New Credit Note', params: {credit_id: val.primary.object_id}})
      }
      if (val.primary.object === 'credit' && val.primary.action === 'SUBMITTED') {
        const customerName = val.primary.data.salutation + ' ' + val.primary.data.first_name + ' ' + val.primary.data.last_name
        this.addNews('mdi-point-of-sale', `Credit note submitted for customer ${customerName}`, val.user, val.audit_at, {name: 'Credit Note', params: {credit_id: val.primary.object_id}})
      }
      if (val.primary.object === 'credit' && val.primary.action === 'POSTED') {
        const customerName = val.primary.data.salutation + ' ' + val.primary.data.first_name + ' ' + val.primary.data.last_name
        this.addNews('mdi-point-of-sale', `Credit note posted for customer ${customerName}`, val.user, val.audit_at, {name: 'Credit Note', params: {credit_id: val.primary.object_id}})
      }
      if (val.primary.object === 'customer' && val.primary.action === 'CREATED') {
        const customerName = val.primary.data.salutation + ' ' + val.primary.data.first_name + ' ' + val.primary.data.last_name
        this.addNews('mdi-account', `New customer ${customerName} added`, val.user, val.audit_at, {name: 'Customer', params: {customer_id: val.primary.object_id}})
      }
      if (val.primary.object === 'customer' && val.primary.action === 'UPDATED') {
        const customerName = val.primary.data.salutation + ' ' + val.primary.data.first_name + ' ' + val.primary.data.last_name
        this.addNews('mdi-account', `Customer ${customerName} updated`, val.user, val.audit_at, {name: 'Customer', params: {customer_id: val.primary.object_id}})
      }
      if (val.primary.object === 'sale' && val.primary.action === 'CREATED') {
        const customerName = val.primary.data.salutation + ' ' + val.primary.data.first_name + ' ' + val.primary.data.last_name
        this.addNews('mdi-point-of-sale', `New sale added for customer ${customerName}`, val.user, val.audit_at, {name: 'Sale', params: {sale_id: val.primary.object_id}})
      }
      if (val.primary.object === 'sale' && val.primary.action === 'FULFILLED') {
        const customerName = val.primary.data.salutation + ' ' + val.primary.data.first_name + ' ' + val.primary.data.last_name
        this.addNews('mdi-point-of-sale', `Sale ${val.primary.data.sale_id} fulfilled for customer ${customerName}`, val.user, val.audit_at, {name: 'Sale', params: {sale_id: val.primary.object_id}})
      }
      if (val.primary.object === 'sale' && val.primary.action === 'ORDERED') {
        const customerName = val.primary.data.salutation + ' ' + val.primary.data.first_name + ' ' + val.primary.data.last_name
        this.addNews('mdi-point-of-sale', `Sale ${val.primary.data.sale_id} ordered for customer ${customerName}`, val.user, val.audit_at, {name: 'Sale', params: {sale_id: val.primary.object_id}})
      }
      if (val.primary.object === 'sale_site' && val.primary.action === 'CREATED') {
        const customerName = val.primary.data.salutation + ' ' + val.primary.data.first_name + ' ' + val.primary.data.last_name
        this.addNews('mdi-map-marker-outline', `New ${val.primary.data.site_type} site ${val.primary.data.site_ref ? val.primary.data.site_ref : ''} added to sale for customer ${customerName}.`, val.user, val.audit_at, {name: 'Sale', params: {sale_id: val.primary.data.sale_id}})
      }
      if (val.primary.object === 'burial' && val.primary.action === 'CONFIRMED') {
        const deceased = val.primary.data.deceased_salutation + ' ' + val.primary.data.deceased_first_name + ' ' + val.primary.data.deceased_last_name
        this.addNews('mdi-grave-stone', `New burial confirmed. ${deceased} on ${this.formatD(val.primary.data.burial_date)} at site ${val.primary.data.site_ref ? val.primary.data.site_ref : val.primary.data.site_type}.`, val.user, val.audit_at, {name: 'Burial', params: {burial_id: val.primary.data.burial_id}})
      }
      if (val.primary.object === 'burial' && val.primary.action === 'COMPLETED') {
        const deceased = val.primary.data.deceased_salutation + ' ' + val.primary.data.deceased_first_name + ' ' + val.primary.data.deceased_last_name
        this.addNews('mdi-grave-stone', `Burial ${val.primary.data.burial_id} of ${deceased} completed on ${this.formatD(val.primary.data.burial_date)} at site ${val.primary.data.site_ref}.`, val.user, val.audit_at, {name: 'Burial', params: {burial_id: val.primary.data.burial_id}})
      }
      if (val.primary.object === 'sitework' && val.primary.action === 'CREATED') {
        this.addNews('mdi-shovel', `Site work ${val.primary.data.sitework_id} created.`, val.user, val.audit_at, {name: 'New Sitework', params: {sitework_id: val.primary.object_id}})
      }
      if (val.primary.object === 'sitework' && val.primary.action === 'CONFIRMED') {
        this.addNews('mdi-shovel', `Site work ${val.primary.data.sitework_id} confirmed.`, val.user, val.audit_at, {name: 'Sitework', params: {sitework_id: val.primary.object_id}})
      }
      if (val.primary.object === 'sitework' && val.primary.action === 'COMPLETED') {
        this.addNews('mdi-shovel', `Site work ${val.primary.data.sitework_id} marked completed.`, val.user, val.audit_at, {name: 'Sitework', params: {sitework_id: val.primary.object_id}})
      }
    }
  },
  watch: {
    newsShow: function (val) {
      if (val) {
        this.newsCount = 0
        favicon.badge('')
      }
    },
    newsCount: function (val) {
      if (this.$userCheckPermission('PERM_NEWS')) {
        favicon.badge(val)
      }
    }
  },
  methods: {
    formatTime (val) {
      return DateTime.fromISO(val).toFormat('ccc LLL d, HH:mm')
    },
    addNews (icon, message, user, auditAt, link) {
      this.news.unshift({icon: icon, message: message, user: user, audit_at: this.formatTime(auditAt), link: link})
      if (this.news.length > 9) {
        this.news.pop()
      }
      this.newsCount += 1
    },
    signOut () {
      delete localStorage.csrf
      delete localStorage.user
      location.replace('/signin')
    }
  }
}
</script>

<style lang="scss">

.text-body-1 {
    color: rgba(1, 0, 0, 0.65) !important;
}
.row {
  margin-top: 0px !important;
  margin-bottom: 0px !important;
}
header#bar > div.v-toolbar__content {
  padding-left: 0px !important
}
@media #{map-get($display-breakpoints, 'xs-only')} {
    :root {
    --headings-size-h1: 1.9rem;
    --headings-size-h2: 1.6rem;
    --headings-size-h3: 1.2rem;
    --headings-size-h4: 1.1rem;
    --headings-size-h5: 1.0rem;
    --headings-size-h6: 0.9rem;
    --text-size-body-1: 0.75rem;
    --text-size-body-2: 0.7rem;
    --text-size-button: 0.65rem;
    --text-size-caption: 0.6rem;
    }
    .v-input { font-size: 0.8rem !important; }
    .v-label { font-size: 0.8rem !important; }
    .v-btn { font-size: 0.65rem !important; }
}
@media #{map-get($display-breakpoints, 'sm-only')} {
    :root {
    --headings-size-h1: 3rem;
    --headings-size-h2: 2.125rem;
    --headings-size-h3: 1.75rem;
    --headings-size-h4: 1.35rem;
    --headings-size-h5: 1.2rem;
    --headings-size-h6: 1.1rem;
    --text-size-body-1: 0.9rem;
    --text-size-body-2: 0.8rem;
    --text-size-button: 0.75rem;
    --text-size-caption: 0.7rem;
    }
    .v-input { font-size: 0.85rem !important; }
    .v-label { font-size: 0.85rem !important; }
    .v-btn { font-size: 0.75rem !important; }
}
@media #{map-get($display-breakpoints, 'md-only')} {
    :root {
    --headings-size-h1: 5rem;
    --headings-size-h2: 3rem;
    --headings-size-h3: 2.125rem;
    --headings-size-h4: 1.75rem;
    --headings-size-h5: 1.35rem;
    --headings-size-h6: 1.2rem;
    --text-size-body-1: 0.95rem;
    --text-size-body-2: 0.85rem;
    --text-size-button: 0.8rem;
    --text-size-caption: 0.75rem;
    }
    .v-input { font-size: 0.9rem !important; }
    .v-label { font-size: 0.9rem !important; }
    .v-btn { font-size: 0.8rem !important; }
}
@media #{map-get($display-breakpoints, 'lg-and-up')} {
    :root {
    --headings-size-h1: 6rem;
    --headings-size-h2: 5rem;
    --headings-size-h3: 3rem;
    --headings-size-h4: 2.125rem;
    --headings-size-h5: 1.5rem;
    --headings-size-h6: 1.25rem;
    --text-size-body-1: 1rem;
    --text-size-body-2: 0.9rem;
    --text-size-button: 0.85rem;
    --text-size-caption: 0.8rem;
    }
    .v-input { font-size: 1rem !important; }
    .v-label { font-size: 1rem !important; }
    .v-btn { font-size: 0.85rem !important; }
}
</style>
