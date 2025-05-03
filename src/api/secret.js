import request from '@/utils/request'

// Get Secret list
export function getSecretList(params) {
  return request({
    url: '/secret/list',
    method: 'get',
    params
  })
}

// Get Secret details
export function getSecretDetail(params) {
  return request({
    url: '/secret',
    method: 'get',
    params
  })
}

// Create or update Secret
export function createOrUpdateSecret(data) {
  return request({
    url: '/secret',
    method: 'post',
    data
  })
}

// Delete Secret
export function deleteSecret(params) {
  return request({
    url: '/secret',
    method: 'delete',
    params
  })
}