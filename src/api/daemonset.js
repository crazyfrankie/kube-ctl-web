import request from '@/utils/request'

export function getDaemonSetList(params) {
  return request({
    url: '/daemonset/list',
    method: 'get',
    params
  })
}

export function getDaemonSetDetail(params) {
  return request({
    url: '/daemonset',
    method: 'get',
    params
  })
}

export function createOrUpdateDaemonSet(data) {
  return request({
    url: '/daemonset',
    method: 'post',
    data
  })
}

export function deleteDaemonSet(params) {
  return request({
    url: '/daemonset',
    method: 'delete',
    params
  })
}