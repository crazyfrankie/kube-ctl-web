import request from '@/utils/request'

export function createPod(data) {
  return request({
    url: '/pod',
    method: 'post',
    data
  })
}

export function getPodList(params) {
  const { namespace } = params
  return request({
    url: `/pod/list?namespace=${namespace}`,
    method: 'get'
  })
}

export function getPodDetail(params) {
  const { namespace, name } = params
  return request({
    url: `/pod/detail?namespace=${namespace}&name=${name}`,
    method: 'get'
  })
}

export function deletePod(params) {
  const { namespace, name } = params
  return request({
    url: `/pod?namespace=${namespace}&name=${name}`,
    method: 'delete'
  })
}

export function getNamespaces() {
  return request({
    url: '/pod/namespace',
    method: 'get'
  })
}
