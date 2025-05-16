import { getRoleBindingList, getRoleBinding, createOrUpdateRoleBinding, deleteRoleBinding } from '@/api/rolebinding'

const state = {
  roleBindings: [],
  currentRoleBinding: null
}

const mutations = {
  SET_ROLEBINDINGS: (state, roleBindings) => {
    state.roleBindings = roleBindings
  },
  SET_CURRENT_ROLEBINDING: (state, roleBinding) => {
    state.currentRoleBinding = roleBinding
  }
}

const actions = {
  // Get role binding list
  getRoleBindingList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getRoleBindingList(params).then(response => {
        if (response && response.data) {
          commit('SET_ROLEBINDINGS', response.data)
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Get role binding detail 
  getRoleBindingDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getRoleBinding(params).then(response => {
        if (response && response.data) {
          commit('SET_CURRENT_ROLEBINDING', response.data)
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Create or update role binding
  createOrUpdateRoleBinding({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateRoleBinding(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete role binding  
  deleteRoleBinding({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteRoleBinding(params).then(response => {
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
