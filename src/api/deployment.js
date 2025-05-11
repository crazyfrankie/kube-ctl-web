import request from '@/utils/request'

export function getDeploymentList(params) {
  return request({
    url: '/deployment/list',
    method: 'get',
    params
  })
}

export function getDeploymentDetail(params) {
  return request({
    url: '/deployment',
    method: 'get',
    params
  })
}

export function createOrUpdateDeployment(data) {
  return request({
    url: '/deployment',
    method: 'post',
    data
  })
}

export function deleteDeployment(params) {
  return request({
    url: '/deployment',
    method: 'delete',
    params
  })
}