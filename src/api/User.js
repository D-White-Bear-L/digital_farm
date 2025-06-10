import request from '@/utils/request'

export function getUserInfo() {
  return request({
    url: '/api/user/info',
    method: 'get'
  })
}

export function updateUserInfo(data) {
  return request({
    url: '/api/user/update',
    method: 'post',
    data
  })
}

export function changePassword(data) {
  return request({
    url: '/api/user/changePassword',
    method: 'post',
    data
  })
}

export function sendVerificationCode(phone) {
  return request({
    url: '/api/user/sendVerificationCode',
    method: 'post',
    data: { phone }
  })
}

export function bindPhone(data) {
  return request({
    url: '/api/user/bindPhone',
    method: 'post',
    data
  })
}

export function getLoginHistory() {
  return request({
    url: '/api/user/loginHistory',
    method: 'get'
  })
}

export function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/api/user/uploadAvatar',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}