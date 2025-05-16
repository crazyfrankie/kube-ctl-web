import request from '@/utils/request'

// Get role binding or cluster role binding list 
export function getRoleBindingList(params) {
  return request({
    url: '/rbac/rb/list',
    method: 'get',
    params
  })
}

// Get role binding or cluster role binding detail
export function getRoleBinding(params) {
  return request({
    url: '/rbac/rb',
    method: 'get',
    params
  })
}

// Create or update role binding or cluster role binding
export function createOrUpdateRoleBinding(data) {
  return request({
    url: '/rbac/rb', 
    method: 'post',
    data
  })
}

// Delete role binding or cluster role binding
export function deleteRoleBinding(params) {
  return request({
    url: '/rbac/rb',
    method: 'delete',
    params
  })
}
