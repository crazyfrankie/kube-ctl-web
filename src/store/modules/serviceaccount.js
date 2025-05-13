import { getServiceAccountList, createServiceAccount, deleteServiceAccount } from '@/api/serviceaccount'

const state = {
  serviceAccounts: [],
  currentServiceAccount: {}
}

const mutations = {
  SET_SERVICEACCOUNT_LIST: (state, serviceAccounts) => {
    state.serviceAccounts = serviceAccounts
  },
  SET_CURRENT_SERVICEACCOUNT: (state, serviceAccount) => {
    state.currentServiceAccount = serviceAccount
  }
}

const actions = {
  // Get ServiceAccount list
  getServiceAccountList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getServiceAccountList(params).then(response => {
        commit('SET_SERVICEACCOUNT_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Create ServiceAccount
  createServiceAccount({ commit }, data) {
    return new Promise((resolve, reject) => {
      createServiceAccount(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete ServiceAccount
  deleteServiceAccount({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteServiceAccount(params).then(response => {
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