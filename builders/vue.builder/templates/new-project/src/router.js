import Vue from 'vue';
import Router from 'vue-router';
import Home from './pages/Home.vue';

// tell vue to use our router
Vue.use(Router);

// router
export default new Router({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
  ],
});
