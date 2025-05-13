import request from '@/utils/request'

/**
 * Get RoleBinding list
 * @param {String} namespace - Namespace to get RoleBindings from
 * @param {String} keyword - Keyword for filtering
 */
export function getRoleBindingList(params) {
  return request({
    url: '/rbac/rb/list',
    method: 'get',
    params
  })
}

/**
 * Get RoleBinding details
 * @param {String} namespace - Namespace of the RoleBinding
 * @param {String} name - RoleBinding name to get details for
 */
export function getRoleBindingDetail(params) {
  return request({
    url: '/rbac/rb',
    method: 'get',
    params
  })
}

/**
 * Create or update a RoleBinding
 * @param {Object} data - RoleBinding configuration data
 */
export function createOrUpdateRoleBinding(data) {
  return request({
    url: '/rbac/rb',
    method: 'post',
    data
  })
}

/**
 * Delete a RoleBinding
 * @param {String} namespace - Namespace of the RoleBinding
 * @param {String} name - RoleBinding name to delete
 */
export function deleteRoleBinding(params) {
  return request({
    url: '/rbac/rb',
    method: 'delete',
    params
  })
}