import Vue from 'vue'
import Vuex from 'vuex'
import root from './root'
import example from './example'

Vue.use(Vuex)

root.modules = {
  example
}

const store = new Vuex.Store(root)

export default store
