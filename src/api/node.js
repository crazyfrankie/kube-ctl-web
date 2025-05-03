import request from '@/utils/request'

// 获取节点列表
export function getNodeList(params) {
  return request({
    url: '/node/list',
    method: 'get',
    params
  })
}

// 获取节点详情
export function getNodeDetail(params) {
  return request({
    url: '/node/detail',
    method: 'get',
    params
  })
}

// 更新节点标签
export function updateNodeLabel(data) {
  return request({
    url: '/node/label',
    method: 'put',
    data
  })
}

// 更新节点污点
export function updateNodeTaint(data) {
  return request({
    url: '/node/taint',
    method: 'put',
    data
  })
}

// 获取节点上的Pod列表
export function getNodePods(params) {
  return request({
    url: '/node/pods',
    method: 'get',
    params
  })
}