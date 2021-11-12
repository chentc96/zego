import Vue from 'vue'
import VueI18n from 'vue-i18n'
import US from './lang/en_US.js'
import CN from './lang/zh_CN.js'
import $utils from '@/common/utils.js'
const locale = ($utils.getUrlParam('lang') || 'CN').toUpperCase()
localStorage.setItem('lang', locale)
Vue.use(VueI18n)
export default new VueI18n({
	locale,
	messages: { US, CN }
})