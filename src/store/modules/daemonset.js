import { getDaemonSetList, getDaemonSetDetail, createOrUpdateDaemonSet, deleteDaemonSet } from '@/api/daemonset'

const getDefaultState = () => {
  return {
    daemonsets: [],
    currentDaemonSet: {}
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_DAEMONSET_LIST: (state, daemonsets) => {
    state.daemonsets = daemonsets
  },
  SET_CURRENT_DAEMONSET: (state, daemonset) => {
    state.currentDaemonSet = daemonset
  }
}

const actions = {
  // Get daemonset list
  getDaemonSetList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getDaemonSetList(params).then(response => {
        commit('SET_DAEMONSET_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Get daemonset details
  getDaemonSetDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getDaemonSetDetail(params).then(response => {
        commit('SET_CURRENT_DAEMONSET', response.data || {})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Create or update daemonset
  createOrUpdateDaemonSet({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateDaemonSet(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Delete daemonset
  deleteDaemonSet({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteDaemonSet(params).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}