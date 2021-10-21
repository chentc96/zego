import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import http from '@/common/http.js'
import utils from '@/common/utils.js'
import icons from '@/components/tc-icons.vue'
import popup from '@/components/tc-popup.vue'

Vue.config.productionTip = false
Vue.component('tc-icons', icons)
Vue.component('tc-popup', popup)
Vue.prototype.$axios = axios
Vue.prototype.$http = http
Vue.prototype.$utils = utils

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
