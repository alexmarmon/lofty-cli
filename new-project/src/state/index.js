import Vue from 'vue';
import Vuex from 'vuex';
import user from './user';

// use store
Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    user,
  },
});

// hot reload state
if (module.hot) {
  module.hot.accept([
    './user',
  ], () => {
    store.hotUpdate({
      modules: {
        user: require('./user').default, // eslint-disable-line global-require
      },
    });
  });
}

export default store;
