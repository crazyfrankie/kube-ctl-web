import request from '@/utils/request'

/**
 * Get StorageClass list
 */
export function getStorageClassList() {
  return request({
    url: '/storage',
    method: 'get'
  })
}

/**
 * Create a StorageClass
 * @param {Object} data - StorageClass configuration data
 */
export function createStorageClass(data) {
  return request({
    url: '/storage',
    method: 'post',
    data
  })
}

/**
 * Delete a StorageClass
 * @param {String} name - StorageClass name to delete
 */
export function deleteStorageClass(name) {
  return request({
    url: '/storage',
    method: 'delete',
    params: { name }
  })
}