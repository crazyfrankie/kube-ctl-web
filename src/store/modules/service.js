import { getServiceList, getServiceDetail, createOrUpdateService, deleteService } from '@/api/service'

const state = {
  serviceList: [],
  currentService: null
}

const mutations = {
  SET_SERVICE_LIST: (state, serviceList) => {
    state.serviceList = serviceList
  },
  SET_CURRENT_SERVICE: (state, service) => {
    state.currentService = service
  }
}

const actions = {
  // Get Service list
  getServiceList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getServiceList(params).then(response => {
        commit('SET_SERVICE_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Get Service details
  getServiceDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getServiceDetail(params).then(response => {
        commit('SET_CURRENT_SERVICE', response.data || {})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Create or update Service
  createOrUpdateService({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateService(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete Service
  deleteService({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteService(params).then(response => {
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