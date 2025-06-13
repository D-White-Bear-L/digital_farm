import request from '@/utils/request'

export function submitRoleChangeRequest(data) {
  return request({
    url: '/api/role/request',
    method: 'post',
    data
  })
}

export function getPendingRequests() {
  return request({
    url: '/api/role/pending-requests',
    method: 'get'
  })
}

export function processRoleChangeRequest(data) {
  return request({
    url: '/api/role/process-request',
    method: 'post',
    data
  })
}

export function changeUserRole(data) {
  return request({
    url: '/api/role/change-role',
    method: 'post',
    data
  })
}

export function resetUserPassword(data) {
  return request({
    url: '/api/role/reset-password',
    method: 'post',
    data
  })
}