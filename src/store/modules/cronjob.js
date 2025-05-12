import { getCronJobList, getCronJobDetail, createOrUpdateCronJob, deleteCronJob } from '@/api/cronjob'

const getDefaultState = () => {
  return {
    cronjobs: [],
    currentCronJob: {}
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_CRONJOB_LIST: (state, cronjobs) => {
    state.cronjobs = cronjobs
  },
  SET_CURRENT_CRONJOB: (state, cronjob) => {
    state.currentCronJob = cronjob
  }
}

const actions = {
  // Get cronjob list
  async getCronJobList({ commit }, params) {
    try {
      const response = await getCronJobList(params)
      commit('SET_CRONJOB_LIST', response.data || [])
      return response
    } catch (error) {
      console.error('Failed to get CronJob list:', error)
      throw error
    }
  },

  // Get cronjob details
  async getCronJobDetail({ commit }, params) {
    try {
      const response = await getCronJobDetail(params)
      commit('SET_CURRENT_CRONJOB', response.data || {})
      return response
    } catch (error) {
      console.error('Failed to get CronJob details:', error)
      throw error
    }
  },

  // Create or update cronjob
  async createOrUpdateCronJob({ commit }, data) {
    try {
      const response = await createOrUpdateCronJob(data)
      return response
    } catch (error) {
      console.error('Failed to create/update CronJob:', error)
      throw error
    }
  },

  // Delete cronjob
  async deleteCronJob({ commit }, params) {
    try {
      const response = await deleteCronJob(params)
      return response
    } catch (error) {
      console.error('Failed to delete CronJob:', error)
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