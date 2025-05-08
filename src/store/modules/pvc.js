import { getPVCList, createPVC, deletePVC } from '@/api/pvc'

const state = {
  pvcList: []
}

const mutations = {
  SET_PVC_LIST: (state, pvcList) => {
    state.pvcList = pvcList
  }
}

const actions = {
  // Get the list of all PVCs
  async getPVCList({ commit }, namespace) {
    try {
      const response = await getPVCList(namespace)
      commit('SET_PVC_LIST', response.data || [])
      return response
    } catch (error) {
      console.error('Failed to get PVC list:', error)
      throw error
    }
  },

  // Create a new PVC
  async createPVC({ dispatch }, data) {
    try {
      const response = await createPVC(data)
      // 修正命名空间路径，直接使用 data.namespace 而不是 data.metadata.namespace
      await dispatch('getPVCList', data.namespace)
      return response
    } catch (error) {
      console.error('Failed to create PVC:', error)
      throw error
    }
  },

  // Delete a PVC
  async deletePVC({ dispatch }, { namespace, name }) {
    try {
      const response = await deletePVC(namespace, name)
      // Refresh the PVC list after deletion
      await dispatch('getPVCList', namespace)
      return response
    } catch (error) {
      console.error('Failed to delete PVC:', error)
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