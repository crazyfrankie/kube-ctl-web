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
import storageclass from './modules/storageclass'
import service from './modules/service'
import ingress from './modules/ingress'
import ingressroute from './modules/ingressroute'
import deployment from './modules/deployment'
import daemonset from './modules/daemonset'
import statefulset from './modules/statefulset'
import job from './modules/job'
import cronjob from './modules/cronjob'
import serviceaccount from './modules/serviceaccount'
import role from './modules/role'
import rolebinding from './modules/rolebinding'
import dashboard from './modules/dashboard'
import clusterrole from './modules/clusterrole'
import clusterrolebinding from './modules/clusterrolebinding'

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
    pvc,
    storageclass,
    service,
    ingress,
    ingressroute,
    deployment,
    daemonset,
    statefulset,
    job,
    cronjob,
    serviceaccount,
    role,
    clusterrole,
    rolebinding,
    dashboard,
    clusterrolebinding
  },
  getters
})

export default store
