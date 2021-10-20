import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import http from '@/common/http.js'
import utils from '@/common/utils.js'

Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.prototype.$http = http
Vue.prototype.$utils = utils

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
