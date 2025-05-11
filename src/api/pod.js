import request from '@/utils/request'

export function createPod(data) {
  return request({
    url: '/pod',
    method: 'post',
    data
  })
}

export function getPodList(params) {
  return request({
    url: '/pod/list',
    method: 'get',
    params
  })
}

export function searchPod(params) {
  return request({
    url: '/pod/search',
    method: 'post',
    params
  })
}

export function getPodDetail(params) {
  return request({
    url: '/pod',
    method: 'get',
    params
  })
}

export function deletePod(params) {
  return request({
    url: '/pod',
    method: 'delete',
    params
  })
}

export function getNamespaces() {
  return request({
    url: '/pod/namespace',
    method: 'get'
  })
}
