import { getDeploymentList, getDeploymentDetail, createOrUpdateDeployment, deleteDeployment } from '@/api/deployment'

const getDefaultState = () => {
  return {
    deployments: [],
    currentDeployment: {}
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_DEPLOYMENT_LIST: (state, deployments) => {
    state.deployments = deployments
  },
  SET_CURRENT_DEPLOYMENT: (state, deployment) => {
    state.currentDeployment = deployment
  }
}

const actions = {
  // Get deployment list
  getDeploymentList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getDeploymentList(params).then(response => {
        commit('SET_DEPLOYMENT_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Get deployment details
  getDeploymentDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getDeploymentDetail(params).then(response => {
        commit('SET_CURRENT_DEPLOYMENT', response.data || {})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Create or update deployment
  createOrUpdateDeployment({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateDeployment(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Delete deployment
  deleteDeployment({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteDeployment(params).then(response => {
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