import request from '@/utils/request'

/**
 * Get PVC (Persistent Volume Claim) list
 * @param {String} namespace - Namespace to get PVCs from
 */
export function getPVCList(namespace) {
  return request({
    url: '/pvc',
    method: 'get',
    params: { namespace }
  })
}

/**
 * Create or update a PVC (Persistent Volume Claim)
 * @param {Object} data - PVC configuration data
 */
export function createPVC(data) {
  return request({
    url: '/pvc',
    method: 'post',
    data
  })
}

/**
 * Delete a PVC (Persistent Volume Claim)
 * @param {String} namespace - Namespace of the PVC
 * @param {String} name - PVC name to delete
 */
export function deletePVC(namespace, name) {
  return request({
    url: '/pvc',
    method: 'delete',
    params: { namespace, name }
  })
}