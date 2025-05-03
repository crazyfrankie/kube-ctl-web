import { getConfigMapList, getConfigMapDetail, createOrUpdateConfigMap, deleteConfigMap } from '@/api/configmap'

const state = {
  configMapList: [],
  currentConfigMap: null
}

const mutations = {
  SET_CONFIG_MAP_LIST: (state, configMapList) => {
    state.configMapList = configMapList
  },
  SET_CURRENT_CONFIG_MAP: (state, configMap) => {
    state.currentConfigMap = configMap
  }
}

const actions = {
  // 获取ConfigMap列表
  getConfigMapList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getConfigMapList(params).then(response => {
        commit('SET_CONFIG_MAP_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取ConfigMap详情
  getConfigMapDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getConfigMapDetail(params).then(response => {
        commit('SET_CURRENT_CONFIG_MAP', response.data || {})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 创建或更新ConfigMap
  createOrUpdateConfigMap({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateConfigMap(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 删除ConfigMap
  deleteConfigMap({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteConfigMap(params).then(response => {
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