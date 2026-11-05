import Vue from 'vue'
import Router from 'vue-router'
import Signin from '@/components/Signin.vue'
import UserForm from '@/components/users/tUserForm.vue'
import Home from '@/components/tHome.vue'

import Calendar from '@/components/calendar/tCalendar.vue'

import SaleNew from '@/components/sales/tSaleNew.vue'
import CreditNoteNew from '@/components/credit/tCreditNoteNew.vue'
import CreditNote from '@/components/credit/tCreditNote.vue'
import CreditSearch from '@/components/credit/tCreditSearch.vue'

import SalesExport from '@/components/sales/tSalesExport.vue'
import SaleSearch from '@/components/sales/tSaleSearch.vue'
import CustomerSearch from '@/components/customer/tCustomerSearch.vue'
import Customer from '@/components/customer/tCustomer.vue'
import CustomerForm from '@/components/customer/tCustomerForm.vue'

import BurialSearch from '@/components/burials/tBurialSearch.vue'
import Burial from '@/components/burials/tBurial.vue'
import BurialForm from '@/components/burials/tBurialForm.vue'
import Tariffs from '@/components/charges/tTariffs.vue'
import Tariff from '@/components/charges/tTariffNew.vue'
import Products from '@/components/charges/tProducts.vue'

import Sale from '@/components/sales/tSale.vue'
import SitesMap from '@/components/sites/tSitesMap.vue'
import StockTables from '@/components/reports/tStockTables.vue'
import SiteSearch from '@/components/sites/tSiteSearch.vue'

import Site from '@/components/sites/tSite.vue'
import SiteTypes from '@/components/sitetype/tSiteTypes.vue'
import SiteType from '@/components/sitetype/tSiteType.vue'
import Blocks from '@/components/sites/tBlocks.vue'

import SiteworkSearch from '@/components/siteworks/tSiteworksSearch.vue'
import Sitework from '@/components/siteworks/tSitework.vue'
import SiteworkNew from '@/components/siteworks/tSiteworkNew.vue'

import Users from '@/components/users/tUsers.vue'
import User from '@/components/users/tUser.vue'
import Roles from '@/components/users/tRoles.vue'

import Reports from '@/components/reports/tReports.vue'
import Monthly from '@/components/reports/tMonthly.vue'
import UserReports from '@/components/reports/tUserReports.vue'
import AnnualReports from '@/components/reports/tAnnualReports.vue'
import DailyReports from '@/components/reports/tDailyReports.vue'

import System from '@/components/other/tSystem.vue'
import BulkImport from '@/components/other/tBulkImport.vue'
import Contractors from '@/components/other/tContractors.vue'
import Exchange from '@/components/other/tExchange.vue'

Vue.use(Router)

const routes = [
  // SIGNIN
  {
    path: '/signin',
    name: 'Signin',
    component: Signin
  },
  // HOME
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/calendar',
    name: 'Calendar',
    meta: {permission_ref: 'PERM_VIEW'},
    component: Calendar
  },
  // BURIALS
  {
    path: '/burials',
    name: 'Burials',
    meta: {permission_ref: 'PERM_VIEW'},
    component: BurialSearch
  },
  {
    path: '/burial/:burial_id',
    name: 'Burial',
    meta: {permission_ref: 'PERM_VIEW', showParam: 'burial_id'},
    component: Burial
  },
  {
    path: '/edit_burial/:burial_id',
    meta: {permission_ref: 'PERM_EDIT'},
    name: 'Edit Burial',
    component: BurialForm
  },
  {
    path: '/new_burial',
    meta: {permission_ref: 'PERM_EDIT'},
    name: 'New Burial',
    component: BurialForm
  },
  // CUSTOMERS
  {
    path: '/customers',
    name: 'Customers',
    meta: {permission_ref: 'PERM_VIEW'},
    component: CustomerSearch
  },
  {
    path: '/customer/:customer_id',
    name: 'Customer',
    meta: {permission_ref: 'PERM_VIEW', showParam: 'customer_id'},
    component: Customer
  },
  {
    path: '/edit_customer/:customer_id',
    name: 'Edit Customer',
    meta: {permission_ref: 'PERM_EDIT', showParam: 'customer_id'},
    component: CustomerForm
  },
  {
    path: '/new_customer',
    name: 'New Customer',
    meta: {permission_ref: 'PERM_EDIT'},
    component: CustomerForm
  },
  // SALES
  {
    path: '/sales',
    name: 'Sales',
    meta: {permission_ref: 'PERM_VIEW'},
    component: SaleSearch
  },
  {
    path: '/new_sale/:sale_id',
    meta: {permission_ref: 'PERM_VIEW', showParam: 'sale_id'},
    name: 'New Sale',
    component: SaleNew
  },
  {
    path: '/sale/:sale_id',
    name: 'Sale',
    meta: {permission_ref: 'PERM_VIEW', showParam: 'sale_id'},
    component: Sale
  },
  {
    path: '/sales_export',
    name: 'Sales Export',
    meta: {permission_ref: 'PERM_ACCOUNTS'},
    component: SalesExport
  },
    {
    path: '/credits',
    name: 'Credit Notes',
    meta: {permission_ref: 'PERM_ACCOUNTS'},
    component: CreditSearch
  },
   {
    path: '/credit/:credit_id/new',
    meta: {permission_ref: 'PERM_ACCOUNTS_SUPER'},
    name: 'New Credit Note',
    component: CreditNoteNew
  },   {
    path: '/credit/:credit_id',
    meta: {permission_ref: 'PERM_ACCOUNTS', showParam: 'credit_id'},
    name: 'Credit Note',
    component: CreditNote
  },
  // SITES
  {
    path: '/sites_map',
    name: 'SitesMap',
    meta: {permission_ref: 'PERM_VIEW'},
    component: SitesMap
  },
  {
    path: '/sites',
    name: 'Sites',
    meta: {permission_ref: 'PERM_VIEW'},
    component: SiteSearch
  },
  {
    path: '/site/:site_id',
    name: 'Site',
    meta: {permission_ref: 'PERM_VIEW', showParam: 'site_id'},
    component: Site
  },
  // WORKS
  {
    path: '/siteworks',
    name: 'Siteworks',
    meta: {permission_ref: 'PERM_WORKS'},
    component: SiteworkSearch
  },
  {
    path: '/sitework/:sitework_id',
    name: 'Sitework',
    meta: {permission_ref: 'PERM_VIEW', showParam: 'sitework_id'},
    component: Sitework
  },
  {
    path: '/new_sitework/:sitework_id',
    name: 'New Sitework',
    meta: {permission_ref: 'PERM_WORKS', showParam: 'sitework_id'},
    component: SiteworkNew
  },
  // PERM_REPORTS
  {
    path: '/daily_reports',
    name: 'Daily Reports',
    meta: {permission_ref: 'PERM_REPORTS'},
    component: DailyReports
  },
  {
    path: '/reports',
    name: 'Reports',
    meta: {permission_ref: 'PERM_REPORTS'},
    component: Reports
  },
  {
    path: '/monthly_report',
    name: 'Monthly Report',
    meta: {permission_ref: 'PERM_REPORTS'},
    component: Monthly
  },
  {
    path: '/user_report',
    name: 'User Reports',
    meta: {permission_ref: 'PERM_REPORTS'},
    component: UserReports
  },
  {
    path: '/annual_reports',
    name: 'Annual Reports',
    meta: {permission_ref: 'PERM_REPORTS'},
    component: AnnualReports
  },
  {
    path: '/stock',
    name: 'Stock',
    meta: {permission_ref: 'PERM_REPORTS'},
    component: StockTables
  },
  // SETUP
  {
    path: '/site_types/',
    name: 'Site Types',
    meta: {permission_ref: 'PERM_TARIFFS'},
    component: SiteTypes
  },
  {
    path: '/site_type/:site_type_id',
    name: 'Site Type',
    meta: {permission_ref: 'PERM_TARIFFS'},
    component: SiteType
  },
  {
    path: '/blocks',
    name: 'Blocks',
    meta: {permission_ref: 'PERM_TARIFFS'},
    component: Blocks
  },
  {
    path: '/tariffs',
    name: 'Tariffs',
    meta: {permission_ref: 'PERM_TARIFFS'},
    component: Tariffs
  },
  {
    path: '/tariff/:tariff_id',
    name: 'Tariff',
    meta: {permission_ref: 'PERM_TARIFFS'},
    component: Tariff
  },
  {
    path: '/products',
    name: 'Products',
    meta: {permission_ref: 'PERM_TARIFFS'},
    component: Products
  },
  {
    path: '/contractors',
    name: 'Contractors',
    meta: {permission_ref: 'PERM_TARIFFS'},
    component: Contractors
  },
  {
    path: '/system',
    name: 'System',
    meta: {permission_ref: 'PERM_TARIFFS'},
    component: System
  },
  {
    path: '/bulkimport',
    name: 'Bulk Import',
    meta: {permission_ref: 'PERM_TARIFFS'},
    component: BulkImport
  },
  {
    path: '/exchange',
    name: 'Exchange',
    meta: {permission_ref: 'PERM_TARIFFS'},
    component: Exchange
  },
  // USERS
  {
    path: '/users',
    name: 'Users',
    meta: {permission_ref: 'PERM_USERS_VIEW'},
    component: Users
  },
  {
    path: '/user/:user_id',
    name: 'User',
    meta: {permission_ref: 'PERM_USERS_VIEW', showParam: 'user_id'},
    component: User
  },
  {
    path: '/new_user',
    name: 'New User',
    meta: {permission_ref: 'PERM_USERS_EDIT'},
    component: UserForm
  },
  {
    path: '/edit_user/:user_id',
    name: 'Edit User',
    meta: {permission_ref: 'PERM_USERS_EDIT'},
    component: UserForm
  },
  // PERM_PERMISSIONS
  {
    path: '/permissions',
    name: 'Permissions',
    meta: {permission_ref: 'PERM_PERMISSIONS'},
    component: Roles
  }
]

const router = new Router({
  routes,
  mode: 'history'
})
router.beforeEach((to, from, next) => {
  Vue.prototype.$auth_check_list = {}

  // console.log('Router Before Each: ', to.path)

  if (to.path !== '/signin') {
    if (!Vue.prototype.$user()) {
      return next('/signin?redirect=' + to.path)
    }
  }
  new Promise((resolve, reject) => {
    if (Vue.prototype.$user() && Vue.prototype.$config.RELOAD_PERM_PERMISSIONS) {
      return Vue.prototype.$loadPermissions()
        .then(() => { resolve() })
    } else {
      resolve()
    }
  })
    .then(() => {
      // If route has a permission guard
      if (to.matched[0].meta && to.matched[0].meta.permission_ref) {
      // If the user does not have permission then go to the home page
        if (!Vue.prototype.$userCheckPermission(to.matched[0].meta.permission_ref)) {
          location.replace('/')
          return false
        }
      }
      // Set the page title
      if (to.matched[0] && to.matched[0].name) {
        document.title = Vue.prototype.$config.APP_TITLE + ' - ' + to.matched[0].name

        if (to.matched[0].meta.showParam) {
          document.title += ' ' + to.params[to.matched[0].meta.showParam]
        }
      } else {
        document.title = Vue.prototype.$config.APP_TITLE
      }
      next()
    })
})
export default router
