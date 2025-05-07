import { getPVList, createPV, deletePV } from '@/api/pv'

const state = {
  pvList: []
}

const mutations = {
  SET_PV_LIST: (state, pvList) => {
    state.pvList = pvList
  }
}

const actions = {
  // Get the list of all PVs
  async getPVList({ commit }) {
    try {
      const response = await getPVList()
      commit('SET_PV_LIST', response.data || [])
      return response
    } catch (error) {
      console.error('Failed to get PV list:', error)
      throw error
    }
  },

  // Create a new PV
  async createPV({ dispatch }, data) {
    try {
      const response = await createPV(data)
      // Refresh the PV list after creating
      await dispatch('getPVList')
      return response
    } catch (error) {
      console.error('Failed to create PV:', error)
      throw error
    }
  },

  // Delete a PV
  async deletePV({ dispatch }, name) {
    try {
      const response = await deletePV(name)
      // Refresh the PV list after deletion
      await dispatch('getPVList')
      return response
    } catch (error) {
      console.error('Failed to delete PV:', error)
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