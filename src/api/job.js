import request from '@/utils/request'

// 获取 Job 列表
export function getJobList(params) {
  return request({
    url: '/job/list',
    method: 'get',
    params
  })
}

// 获取 Job 详情
export function getJobDetail(params) {
  return request({
    url: '/job',
    method: 'get',
    params
  })
}

// 创建或更新 Job
export function createOrUpdateJob(data) {
  return request({
    url: '/job',
    method: 'post',
    data
  })
}

// 删除 Job
export function deleteJob(params) {
  return request({
    url: '/job',
    method: 'delete',
    params
  })
}