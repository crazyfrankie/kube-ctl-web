import { getDashboardData } from '@/api/dashboard'

const state = {
  clusterInfo: [],
  resourcesInfo: [],
  usageInfo: [],
  usageRangeInfo: []
}

const mutations = {
  SET_CLUSTER_INFO: (state, data) => {
    state.clusterInfo = data
  },
  SET_RESOURCES_INFO: (state, data) => {
    state.resourcesInfo = data
  },
  SET_USAGE_INFO: (state, data) => {
    state.usageInfo = data
  },
  SET_USAGE_RANGE_INFO: (state, data) => {
    state.usageRangeInfo = data
  }
}

const actions = {
  // Get dashboard data
  getDashboardData({ commit }) {
    return new Promise((resolve, reject) => {
      getDashboardData().then(response => {
        const { data } = response
        if (data) {
          commit('SET_CLUSTER_INFO', data.cluster || [])
          commit('SET_RESOURCES_INFO', data.resources || [])
          commit('SET_USAGE_INFO', data.usage || [])
          commit('SET_USAGE_RANGE_INFO', data.usageRange || [])
          resolve(data)
        } else {
          reject(new Error('Invalid dashboard data'))
        }
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
