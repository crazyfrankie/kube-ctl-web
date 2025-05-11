import request from '@/utils/request'

/**
 * Get IngressRoute list
 * @param {String} namespace - Namespace to get IngressRoutes from
 * @param {String} keyword - Keyword for filtering
 */
export function getIngressRouteList(params) {
  return request({
    url: '/ingroute/list',
    method: 'get',
    params
  })
}

/**
 * Get IngressRoute details
 * @param {String} namespace - Namespace of the IngressRoute
 * @param {String} name - IngressRoute name to get details for
 */
export function getIngressRouteDetail(params) {
  return request({
    url: '/ingroute',
    method: 'get',
    params
  })
}

/**
 * Create or update an IngressRoute
 * @param {Object} data - IngressRoute configuration data
 */
export function createOrUpdateIngressRoute(data) {
  return request({
    url: '/ingroute',
    method: 'post',
    data
  })
}

/**
 * Delete an IngressRoute
 * @param {String} namespace - Namespace of the IngressRoute
 * @param {String} name - IngressRoute name to delete
 */
export function deleteIngressRoute(params) {
  return request({
    url: '/ingroute',
    method: 'delete',
    params
  })
}

/**
 * Get available middlewares list in a namespace
 * @param {String} namespace - Namespace to get available middlewares from
 */
export function getAvailableMiddlewares(params) {
  return request({
    url: '/ingroute/mws',
    method: 'get',
    params
  })
}