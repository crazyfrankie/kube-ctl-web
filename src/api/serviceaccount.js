import request from '@/utils/request'

/**
 * Get ServiceAccount list
 * @param {String} namespace - Namespace to get ServiceAccounts from
 * @param {String} keyword - Keyword for filtering
 */
export function getServiceAccountList(params) {
  return request({
    url: '/rbac/sa',
    method: 'get',
    params
  })
}

/**
 * Create a ServiceAccount
 * @param {Object} data - ServiceAccount configuration data
 */
export function createServiceAccount(data) {
  return request({
    url: '/rbac/sa',
    method: 'post',
    data
  })
}

/**
 * Delete a ServiceAccount
 * @param {String} namespace - Namespace of the ServiceAccount
 * @param {String} name - ServiceAccount name to delete
 */
export function deleteServiceAccount(params) {
  return request({
    url: '/rbac/sa',
    method: 'delete',
    params
  })
}