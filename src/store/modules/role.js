import { getRoleList, getRole, createOrUpdateRole, deleteRole } from '@/api/role'

const state = {
  roles: [],
  currentRole: null
}

const mutations = {
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_CURRENT_ROLE: (state, role) => {
    state.currentRole = role
  }
}

const actions = {
  // Get role list
  getRoleList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getRoleList(params).then(response => {
        if (response && response.data) {
          commit('SET_ROLES', response.data)
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Get role detail
  getRoleDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getRole(params).then(response => {
        if (response && response.data) {
          commit('SET_CURRENT_ROLE', response.data)
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Create or update role
  createOrUpdateRole({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateRole(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete role
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
