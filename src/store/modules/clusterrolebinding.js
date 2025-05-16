import { getClusterRoleBindingList, getClusterRoleBinding, createOrUpdateClusterRoleBinding, deleteClusterRoleBinding } from '@/api/clusterrolebinding'

const state = {
  clusterRoleBindings: [],
  currentClusterRoleBinding: null
}

const mutations = {
  SET_CLUSTERROLEBINDINGS: (state, clusterRoleBindings) => {
    state.clusterRoleBindings = clusterRoleBindings
  },
  SET_CURRENT_CLUSTERROLEBINDING: (state, clusterRoleBinding) => {
    state.currentClusterRoleBinding = clusterRoleBinding
  }
}

const actions = {
  // Get cluster role binding list
  getClusterRoleBindingList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getClusterRoleBindingList(params).then(response => {
        if (response && response.data) {
          commit('SET_CLUSTERROLEBINDINGS', response.data)
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Get cluster role binding detail 
  getClusterRoleBindingDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getClusterRoleBinding(params).then(response => {
        if (response && response.data) {
          commit('SET_CURRENT_CLUSTERROLEBINDING', response.data)
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Create or update cluster role binding
  createOrUpdateClusterRoleBinding({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateClusterRoleBinding(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete cluster role binding  
  deleteClusterRoleBinding({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteClusterRoleBinding(params).then(response => {
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
