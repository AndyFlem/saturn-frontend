let user = null

export default {
  install (Vue, options) {
    if (localStorage.user) {
      user = JSON.parse(localStorage.user)
    }
    Vue.prototype.$auth_check_list = {}

    Vue.prototype.$loadPermissions = () => {
      if (Vue.prototype.$config.DEVELOPMENT_MODE) { console.log('Reload permissions') }
      return Vue.prototype.$http.secured.get('/api/v1/current-user-permissions')
        .then(pers => {
          user.permissionsDict = {}
          pers.data.forEach(p => { user.permissionsDict[p.permission_ref] = true })
        })
    }

    Vue.prototype.$userSignin = (email, password) => {
      return Vue.prototype.$http.plain.post('/api/v1/signin', { email: email, password: password })
        .then(response => {
          if (!response.data.csrf) {
            delete localStorage.csrf
            delete localStorage.user
            throw new Error('Login failed')
          }
          localStorage.csrf = response.data.csrf
          return Vue.prototype.$http.secured.get('/api/v1/current-user/')
        })
        .then(response => {
          user = response.data
          return Vue.prototype.$loadPermissions()
        })
        .then(() => {
          localStorage.user = JSON.stringify(user)
          Vue.prototype.$socket.client.io.opts.extraHeaders.Authorization = `Bearer ${localStorage.csrf}`
          Vue.prototype.$socket.client.open()
          return user
        })
        .then(()=> {
          console.log('Opening socket.io after login')
          Vue.prototype.$socket.client.open()
        })
        .catch(error => {
          delete localStorage.csrf
          delete localStorage.user
          throw error
        })
    }

    Vue.prototype.$userCheckPermission = (permissionRef, noLog) => {
      if (Vue.prototype.$config.DEVELOPMENT_MODE && !noLog && !Vue.prototype.$auth_check_list[permissionRef]) {
        Vue.prototype.$auth_check_list[permissionRef] = 1
        console.log('Auth checks: ', Object.keys(Vue.prototype.$auth_check_list))
      }
      if (!user) { return false }
      if (!user.permissionsDict) { return false }
      return (user.permissionsDict[permissionRef])
    }
    Vue.prototype.$user = () => {
      return user
    }
  }
}
