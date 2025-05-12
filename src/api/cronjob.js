import request from '@/utils/request'

/**
 * Get CronJob list
 * @param {String} namespace - Namespace to get CronJobs from
 * @param {String} keyword - Keyword for filtering
 */
export function getCronJobList(params) {
  return request({
    url: '/cronjob/list',
    method: 'get',
    params
  })
}

/**
 * Get CronJob details
 * @param {String} namespace - Namespace of the CronJob
 * @param {String} name - CronJob name to get details for
 */
export function getCronJobDetail(params) {
  return request({
    url: '/cronjob',
    method: 'get',
    params
  })
}

/**
 * Create or update a CronJob
 * @param {Object} data - CronJob configuration data
 */
export function createOrUpdateCronJob(data) {
  return request({
    url: '/cronjob',
    method: 'post',
    data
  })
}

/**
 * Delete a CronJob
 * @param {String} namespace - Namespace of the CronJob
 * @param {String} name - CronJob name to delete
 */
export function deleteCronJob(params) {
  return request({
    url: '/cronjob',
    method: 'delete',
    params
  })
}