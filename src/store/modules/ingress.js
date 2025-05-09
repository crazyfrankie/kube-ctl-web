import { getIngressList, getIngressDetail, createOrUpdateIngress, deleteIngress } from '@/api/ingress'

const getDefaultState = () => {
  return {
    ingressList: [],
    currentIngress: {}
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_INGRESS_LIST: (state, list) => {
    state.ingressList = list
  },
  SET_CURRENT_INGRESS: (state, ingress) => {
    state.currentIngress = ingress
  }
}

const actions = {
  // Get ingress list
  getIngressList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getIngressList(params).then(response => {
        commit('SET_INGRESS_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Get ingress detail
  getIngressDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getIngressDetail(params).then(response => {
        commit('SET_CURRENT_INGRESS', response.data || {})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Create or update ingress
  createOrUpdateIngress({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateIngress(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Delete ingress
  deleteIngress({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteIngress(params).then(response => {
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