import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import pod from './modules/pod'
import node from './modules/node'
import configmap from './modules/configmap'
import secret from './modules/secret'
import pv from './modules/pv'
import pvc from './modules/pvc'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    pod,
    node,
    configmap,
    secret,
    pv,
    pvc
  },
  getters
})

export default store
