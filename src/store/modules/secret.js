import { getSecretList, getSecretDetail, createOrUpdateSecret, deleteSecret } from '@/api/secret'

const state = {
  secretList: [],
  currentSecret: null
}

const mutations = {
  SET_SECRET_LIST: (state, secretList) => {
    state.secretList = secretList
  },
  SET_CURRENT_SECRET: (state, secret) => {
    state.currentSecret = secret
  }
}

const actions = {
  // Get Secret list
  getSecretList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getSecretList(params).then(response => {
        commit('SET_SECRET_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Get Secret details
  getSecretDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getSecretDetail(params).then(response => {
        commit('SET_CURRENT_SECRET', response.data || {})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Create or update Secret
  createOrUpdateSecret({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateSecret(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete Secret
  deleteSecret({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteSecret(params).then(response => {
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