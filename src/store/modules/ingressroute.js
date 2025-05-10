import { getIngressRouteList, getIngressRouteDetail, createOrUpdateIngressRoute, deleteIngressRoute, getAvailableMiddlewares } from '@/api/ingressroute'

const getDefaultState = () => {
  return {
    ingressRouteList: [],
    currentIngressRoute: {},
    middlewares: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_INGRESSROUTE_LIST: (state, list) => {
    state.ingressRouteList = list
  },
  SET_CURRENT_INGRESSROUTE: (state, ingressRoute) => {
    state.currentIngressRoute = ingressRoute
  },
  SET_MIDDLEWARES: (state, middlewares) => {
    state.middlewares = middlewares
  }
}

const actions = {
  // Get ingressRoute list
  getIngressRouteList({ commit }, params) {
    return new Promise((resolve, reject) => {
      getIngressRouteList(params).then(response => {
        commit('SET_INGRESSROUTE_LIST', response.data || [])
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  
  // Get ingressRoute detail
  getIngressRouteDetail({ commit }, params) {
    return new Promise((resolve, reject) => {
      getIngressRouteDetail(params).then(response => {
        commit('SET_CURRENT_INGRESSROUTE', response.data || {})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  
  // Create or update ingressRoute
  createOrUpdateIngressRoute({ commit }, data) {
    return new Promise((resolve, reject) => {
      createOrUpdateIngressRoute(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  
  // Delete ingressRoute
  deleteIngressRoute({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteIngressRoute(params).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  
  // Get available middlewares in namespace
  getAvailableMiddlewares({ commit }, params) {
    return new Promise((resolve, reject) => {
      getAvailableMiddlewares(params).then(response => {
        commit('SET_MIDDLEWARES', response.data || [])
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