import request from '@/utils/request'

/**
 * Get Role list
 * @param {String} namespace - Namespace to get Roles from
 * @param {String} keyword - Keyword for filtering
 */
export function getRoleList(params) {
  return request({
    url: '/rbac/role/list',
    method: 'get',
    params
  })
}

/**
 * Get Role details
 * @param {String} namespace - Namespace of the Role
 * @param {String} name - Role name to get details for
 */
export function getRoleDetail(params) {
  return request({
    url: '/rbac/role',
    method: 'get',
    params
  })
}

/**
 * Create or update a Role
 * @param {Object} data - Role configuration data
 */
export function createOrUpdateRole(data) {
  return request({
    url: '/rbac/role',
    method: 'post',
    data
  })
}

/**
 * Delete a Role
 * @param {String} namespace - Namespace of the Role
 * @param {String} name - Role name to delete
 */
export function deleteRole(params) {
  return request({
    url: '/rbac/role',
    method: 'delete',
    params
  })
}