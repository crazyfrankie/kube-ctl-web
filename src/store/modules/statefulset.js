import { getStatefulSetList, getStatefulSetDetail, createOrUpdateStatefulSet, deleteStatefulSet } from '@/api/statefulset'

const getDefaultState = () => {
  return {
    statefulsets: [],
    currentStatefulSet: {}
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_STATEFULSET_LIST: (state, statefulsets) => {
    state.statefulsets = statefulsets
  },
  SET_CURRENT_STATEFULSET: (state, statefulset) => {
    state.currentStatefulSet = statefulset
  }
}

const actions = {
  // Get statefulset list
  getStatefulSetList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getStatefulSetList(params).then(response => {
        commit('SET_STATEFULSET_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Get statefulset details
  getStatefulSetDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getStatefulSetDetail(params).then(response => {
        commit('SET_CURRENT_STATEFULSET', response.data || {})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Create or update statefulset
  createOrUpdateStatefulSet({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateStatefulSet(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // Delete statefulset
  deleteStatefulSet({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteStatefulSet(params).then(response => {
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