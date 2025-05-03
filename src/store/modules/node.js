import { getNodeList, getNodeDetail, updateNodeLabel, updateNodeTaint, getNodePods } from '@/api/node'

const state = {
  nodeList: [],
  currentNode: null,
  nodePods: []
}

const mutations = {
  SET_NODE_LIST: (state, nodeList) => {
    state.nodeList = nodeList
  },
  SET_CURRENT_NODE: (state, node) => {
    state.currentNode = node
  },
  SET_NODE_PODS: (state, pods) => {
    state.nodePods = pods
  }
}

const actions = {
  // 获取节点列表
  getNodeList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getNodeList(params).then(response => {
        commit('SET_NODE_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取节点详情
  getNodeDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getNodeDetail(params).then(response => {
        commit('SET_CURRENT_NODE', response.data || {})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 更新节点标签
  updateNodeLabel({ commit }, data) {
    return new Promise((resolve, reject) => {
      updateNodeLabel(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 更新节点污点
  updateNodeTaint({ commit }, data) {
    return new Promise((resolve, reject) => {
      updateNodeTaint(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取节点上的Pod列表
  getNodePods({ commit }, params) {
    return new Promise((resolve, reject) => {
      getNodePods(params).then(response => {
        commit('SET_NODE_PODS', response.data || [])
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