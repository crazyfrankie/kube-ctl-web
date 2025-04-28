import { createPod, getPodList, getPodDetail, deletePod, getNamespaces } from '@/api/pod'

const state = {
  podName: '',
  currentPod: null,
  namespaces: []
}

const mutations = {
  SET_POD_NAME: (state, podName) => {
    state.podName = podName
  },
  SET_CURRENT_POD: (state, pod) => {
    state.currentPod = pod
  },
  SET_NAMESPACES: (state, namespaces) => {
    state.namespaces = namespaces
  }
}

const actions = {
  // 创建或更新Pod
  createPod({ commit }, data) {
    return new Promise((resolve, reject) => {
      createPod(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取Pod列表
  getPodList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getPodList(params).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取Pod详情
  getPodDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getPodDetail(params).then(response => {
        commit('SET_CURRENT_POD', response.data)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 删除Pod
  deletePod({ commit }, params) {
    return new Promise((resolve, reject) => {
      deletePod(params).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取命名空间列表
  getNamespaces({ commit }) {
    return new Promise((resolve, reject) => {
      getNamespaces().then(response => {
        commit('SET_NAMESPACES', response.data)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  setPodName({ commit }, name) {
    commit('SET_POD_NAME', name)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

