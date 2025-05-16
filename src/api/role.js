import request from '@/utils/request'

// Get role or clusterrole list
export function getRoleList(params) {
  return request({
    url: '/rbac/role/list',
    method: 'get',
    params
  })
}

// Get role or clusterrole detail
export function getRole(params) {
  return request({
    url: '/rbac/role',
    method: 'get',
    params
  })
}

// Create or update role or clusterrole
export function createOrUpdateRole(data) {
  return request({
    url: '/rbac/role',
    method: 'post',
    data
  })
}

// Delete role or clusterrole
export function deleteRole(params) {
  return request({
    url: '/rbac/role',
    method: 'delete',
    params
  })
}
