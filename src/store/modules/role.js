import { getRoleList, getRoleDetail, createOrUpdateRole, deleteRole } from '@/api/role'

const state = {
  roles: [],
  currentRole: {}
}

const mutations = {
  SET_ROLE_LIST: (state, roles) => {
    state.roles = roles
  },
  SET_CURRENT_ROLE: (state, role) => {
    state.currentRole = role
  }
}

const actions = {
  // Get Role list
  getRoleList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getRoleList(params).then(response => {
        commit('SET_ROLE_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Get Role details
  getRoleDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getRoleDetail(params).then(response => {
        commit('SET_CURRENT_ROLE', response.data || {})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Create or update Role
  createOrUpdateRole({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateRole(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete Role
  deleteRole({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteRole(params).then(response => {
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