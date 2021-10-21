import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/index.vue')
  },
  {
    path: '/customer',
    name: 'Customer',
    component: () => import('@/views/customer.vue')
  },
  {
    path: '/service',
    name: 'Service',
    component: () => import('@/views/service.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  routes,
})

export default router
