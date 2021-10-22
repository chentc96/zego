import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    name: 'Vr',
    path: '/vr/:mineId',
    component: () => import('@/views/index.vue')
  },
  {
    name: 'Cim',
    path: '/cim',
    component: () => import('@/views/cim.vue')
  },
  {
    name: 'Sim',
    path: '/sim',
    component: () => import('@/views/sim.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  routes,
})

export default router
