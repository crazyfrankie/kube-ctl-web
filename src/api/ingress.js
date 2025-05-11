import request from '@/utils/request'

/**
 * Get Ingress list
 * @param {String} namespace - Namespace to get Ingresses from
 * @param {String} keyword - Keyword for filtering
 */
export function getIngressList(params) {
  return request({
    url: '/ingress/list',
    method: 'get',
    params
  })
}

/**
 * Get Ingress details
 * @param {String} namespace - Namespace of the Ingress
 * @param {String} name - Ingress name to get details for
 */
export function getIngressDetail(params) {
  return request({
    url: '/ingress',
    method: 'get',
    params
  })
}

/**
 * Create or update a Ingress
 * @param {Object} data - Ingress configuration data
 */
export function createOrUpdateIngress(data) {
  return request({
    url: '/ingress',
    method: 'post',
    data
  })
}

/**
 * Delete a Ingress
 * @param {String} namespace - Namespace of the Ingress
 * @param {String} name - Ingress name to delete
 */
export function deleteIngress(params) {
  return request({
    url: '/ingress',
    method: 'delete',
    params
  })
}