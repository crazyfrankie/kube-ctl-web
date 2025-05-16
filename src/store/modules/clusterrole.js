import { getRoleList, getRole, createOrUpdateRole, deleteRole } from '@/api/role'

const state = {
  clusterRoles: [],
  currentClusterRole: null
}

const mutations = {
  SET_CLUSTER_ROLES: (state, roles) => {
    state.clusterRoles = roles
  },
  SET_CURRENT_CLUSTER_ROLE: (state, role) => {
    state.currentClusterRole = role
  }
}

const actions = {
  // Get cluster role list
  getClusterRoles({ commit }, keyword = '') {
    return new Promise((resolve, reject) => {
      getRoleList({ 
        namespace: '',
        keyword: keyword || undefined
      }).then(response => {
        if (response && response.data) {
          commit('SET_CLUSTER_ROLES', response.data)
          resolve(response.data)
        } else {
          resolve([])
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Get cluster role detail
  getClusterRole({ commit }, name) {
    return new Promise((resolve, reject) => {
      getRole({ name, namespace: '' }).then(response => {
        if (response && response.data) {
          commit('SET_CURRENT_CLUSTER_ROLE', response.data)
          resolve(response.data)
        } else {
          resolve({
            name: '',
            labels: [],
            rules: []
          })
        }
      }).catch(error => {
        console.error('Failed to get cluster role detail:', error)
        reject(error)
      })
    })
  },

  // Create or update cluster role
  createOrUpdateClusterRole({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateRole({ ...data, namespace: '' }).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // Delete cluster role
  deleteClusterRole({ commit }, name) {
    return new Promise((resolve, reject) => {
      deleteRole({ name, namespace: '' }).then(response => {
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
