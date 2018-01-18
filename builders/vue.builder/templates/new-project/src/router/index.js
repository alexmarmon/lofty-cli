import Vue from 'vue'
import Router from 'vue-router'
import pages from './pages'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/landing'
    },
    {
      path: '/landing',
      name: 'Landing',
      component: pages.landing
    }
  ]
})

export default router
