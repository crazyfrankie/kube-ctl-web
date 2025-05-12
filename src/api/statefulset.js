import request from '@/utils/request'

export function getStatefulSetList(params) {
  return request({
    url: '/statefulset/list',
    method: 'get',
    params
  })
}

export function getStatefulSetDetail(params) {
  return request({
    url: '/statefulset',
    method: 'get',
    params
  })
}

export function createOrUpdateStatefulSet(data) {
  return request({
    url: '/statefulset',
    method: 'post',
    data
  })
}

export function deleteStatefulSet(params) {
  return request({
    url: '/statefulset',
    method: 'delete',
    params
  })
}