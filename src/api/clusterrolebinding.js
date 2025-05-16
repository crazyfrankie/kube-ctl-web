import request from '@/utils/request'

// Get cluster role binding list
export function getClusterRoleBindingList(params) {
  return request({
    url: '/rbac/rb/list',
    method: 'get',
    params: {
      ...params,
      namespace: '' // Empty namespace indicates cluster-wide binding
    }
  })
}

// Get cluster role binding detail
export function getClusterRoleBinding(params) {
  return request({
    url: '/rbac/rb',
    method: 'get',
    params: {
      ...params,
      namespace: '' // Empty namespace indicates cluster-wide binding
    }
  })
}

// Create or update cluster role binding
export function createOrUpdateClusterRoleBinding(data) {
  return request({
    url: '/rbac/rb',
    method: 'post',
    data: {
      ...data,
      namespace: '' // Empty namespace indicates cluster-wide binding
    }
  })
}

// Delete cluster role binding
export function deleteClusterRoleBinding(params) {
  return request({
    url: '/rbac/rb',
    method: 'delete',
    params: {
      ...params,
      namespace: '' // Empty namespace indicates cluster-wide binding
    }
  })
}
