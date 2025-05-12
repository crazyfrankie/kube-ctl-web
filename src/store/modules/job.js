import { getJobList, getJobDetail, createOrUpdateJob, deleteJob } from '@/api/job'
import { getNamespaces } from '@/api/pod'

const state = {
  jobs: [],
  jobDetail: {}
}

const mutations = {
  SET_JOBS: (state, jobs) => {
    state.jobs = jobs
  },
  SET_JOB_DETAIL: (state, jobDetail) => {
    state.jobDetail = jobDetail
  }
}

const actions = {
  // 获取 Job 列表
  getJobList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getJobList(params)
        .then(response => {
          // Consider it successful if we got a response with data
          if (response && (response.code === 0 || Array.isArray(response.data))) {
            commit('SET_JOBS', response.data || [])
            resolve(response)
          } else {
            reject(response.msg || 'Error')
          }
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  // 获取 Job 详情
  getJobDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getJobDetail(params)
        .then(response => {
          if (response.code === 0) {
            commit('SET_JOB_DETAIL', response.data || {})
            resolve(response)
          } else {
            reject(response.msg || 'Error')
          }
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  // 创建或更新 Job
  createOrUpdateJob({ commit }, jobData) {
    return new Promise((resolve, reject) => {
      createOrUpdateJob(jobData)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  // 删除 Job
  deleteJob({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteJob(params)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  // 获取命名空间
  getNamespaces() {
    return new Promise((resolve, reject) => {
      getNamespaces()
        .then(response => {
          resolve(response)
        })
        .catch(error => {
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