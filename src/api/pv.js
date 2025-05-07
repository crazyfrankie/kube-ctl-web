import request from '@/utils/request'

/**
 * Get PV (Persistent Volume) list
 */
export function getPVList() {
  return request({
    url: '/pv',
    method: 'get'
  })
}

/**
 * Create or update a PV (Persistent Volume)
 * @param {Object} data - PV configuration data
 */
export function createPV(data) {
  return request({
    url: '/pv',
    method: 'post',
    data
  })
}

/**
 * Delete a PV (Persistent Volume)
 * @param {String} name - PV name to delete
 */
export function deletePV(name) {
  return request({
    url: '/pv',
    method: 'delete',
    params: { name }
  })
}