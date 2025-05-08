import { getStorageClassList, createStorageClass, deleteStorageClass } from '@/api/storageclass'

const state = {
  storageClassList: []
}

const mutations = {
  SET_STORAGE_CLASS_LIST: (state, storageClassList) => {
    state.storageClassList = storageClassList
  }
}

const actions = {
  // Get the list of all StorageClasses
  async getStorageClassList({ commit }) {
    try {
      const response = await getStorageClassList()
      commit('SET_STORAGE_CLASS_LIST', response.data || [])
      return response
    } catch (error) {
      console.error('Failed to get StorageClass list:', error)
      throw error
    }
  },

  // Create a new StorageClass
  async createStorageClass({ dispatch }, data) {
    try {
      const response = await createStorageClass(data)
      // Refresh the StorageClass list after creating
      await dispatch('getStorageClassList')
      return response
    } catch (error) {
      console.error('Failed to create StorageClass:', error)
      throw error
    }
  },

  // Delete a StorageClass
  async deleteStorageClass({ dispatch }, name) {
    try {
      const response = await deleteStorageClass(name)
      // Refresh the StorageClass list after deletion
      await dispatch('getStorageClassList')
      return response
    } catch (error) {
      console.error('Failed to delete StorageClass:', error)
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