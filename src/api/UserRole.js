import request from '@/utils/request'

// 获取角色申请列表
export function getRoleRequests() {
  return request({
    url: '/api/user/role/requests',
    method: 'get'
  })
}

// 提交角色申请
export function submitRoleRequest(data) {
  return request({
    url: '/api/user/role/request',
    method: 'post',
    data
  })
}

// 处理角色申请
export function handleRoleRequest(data) {
  return request({
    url: '/api/user/role/handle',
    method: 'post',
    data
  })
}

// 获取用户列表
export function getUserList() {
  return request({
    url: '/api/user/list',
    method: 'get'
  })
}

// 更新用户角色
export function updateUserRole(data) {
  return request({
    url: '/api/user/role/update',
    method: 'post',
    data
  })
} 