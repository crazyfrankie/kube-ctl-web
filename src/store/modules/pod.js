import { createPod, getPodList, searchPod, getPodDetail, deletePod, getNamespaces } from '@/api/pod'
import { getPVCList } from '@/api/pvc'

const state = {
  podName: '',
  currentPod: null,
  namespaces: [],
  pvcList: []
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
  },
  SET_PVC_LIST: (state, pvcList) => {
    state.pvcList = pvcList
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
  getPodList({ commit }, namespace) {
    return new Promise((resolve, reject) => {
      getPodList({ namespace }).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 搜索Pod
  searchPod({ commit }, params) {
    return new Promise((resolve, reject) => {
      searchPod(params).then(response => {
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
        if (response.data) {
          // 将Pod详情直接存储到state中
          commit('SET_CURRENT_POD', response.data)
          resolve(response)
        } else {
          reject(new Error('Invalid response format'))
        }
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
  },

  // Get PVC list for current namespace
  async getPVCsForNamespace({ commit }, namespace) {
    try {
      const response = await getPVCList(namespace)
      commit('SET_PVC_LIST', response.data || [])
      return response
    } catch (error) {
      console.error('Failed to fetch PVCs:', error)
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

