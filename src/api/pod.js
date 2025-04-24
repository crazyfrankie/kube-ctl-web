import request from '@/utils/request'

export function getPodList() {
    return request({
        url: '/pod/list',
        method: 'get'
    })
}