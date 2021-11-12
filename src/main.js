import Vue from 'vue'
import App from './App.vue'
import router from './router'
import http from '@/common/http.js'
import utils from '@/common/utils.js'
import filter from '@/common/filter.js'
import icons from '@/components/tc-icons.vue'
import popup from '@/components/tc-popup.vue'
import i18n from '@/i18n'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false
Vue.component('tc-icons', icons)
Vue.component('tc-popup', popup)
Vue.prototype.$http = http
Vue.prototype.$utils = utils
Vue.prototype.$filter = filter
Vue.prototype._i18n = i18n
Vue.use(ElementUI)

Object.keys(filter).forEach(key => {
  Vue.filter(key, filter[key])
})

new Vue({
	i18n,
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
