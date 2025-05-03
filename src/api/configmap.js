import request from '@/utils/request'

// 获取ConfigMap列表
export function getConfigMapList(params) {
  return request({
    url: '/configmap/list',
    method: 'get',
    params
  })
}

// 获取ConfigMap详情
export function getConfigMapDetail(params) {
  return request({
    url: '/configmap',
    method: 'get',
    params
  })
}

// 创建或更新ConfigMap
export function createOrUpdateConfigMap(data) {
  return request({
    url: '/configmap',
    method: 'post',
    data
  })
}

// 删除ConfigMap
export function deleteConfigMap(params) {
  return request({
    url: '/configmap',
    method: 'delete',
    params
  })
}