import request from '@/utils/request'

/**
 * Get Service list
 * @param {String} namespace - Namespace to get Services from
 * @param {String} keyword - Keyword for filtering
 */
export function getServiceList(params) {
  return request({
    url: '/service/list',
    method: 'get',
    params
  })
}

/**
 * Get Service details
 * @param {String} namespace - Namespace of the Service
 * @param {String} name - Service name to get details for
 */
export function getServiceDetail(params) {
  return request({
    url: '/service/detail',
    method: 'get',
    params
  })
}

/**
 * Create or update a Service
 * @param {Object} data - Service configuration data
 */
export function createOrUpdateService(data) {
  return request({
    url: '/service',
    method: 'post',
    data
  })
}

/**
 * Delete a Service
 * @param {String} namespace - Namespace of the Service
 * @param {String} name - Service name to delete
 */
export function deleteService(params) {
  return request({
    url: '/service',
    method: 'delete',
    params
  })
}