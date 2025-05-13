import { getRoleBindingList, getRoleBindingDetail, createOrUpdateRoleBinding, deleteRoleBinding } from '@/api/rolebinding'

const state = {
  roleBindings: [],
  currentRoleBinding: {}
}

const mutations = {
  SET_ROLEBINDING_LIST: (state, roleBindings) => {
    state.roleBindings = roleBindings
  },
  SET_CURRENT_ROLEBINDING: (state, roleBinding) => {
    state.currentRoleBinding = roleBinding
  }
}

const actions = {
  // Get RoleBinding list
  getRoleBindingList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getRoleBindingList(params).then(response => {
        commit('SET_ROLEBINDING_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Get RoleBinding details
  getRoleBindingDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getRoleBindingDetail(params).then(response => {
        commit('SET_CURRENT_ROLEBINDING', response.data || {})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Create or update RoleBinding
  createOrUpdateRoleBinding({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateRoleBinding(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete RoleBinding
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