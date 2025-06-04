import request from '@/utils/request'

// 获取监测点列表
export function getMonitoring(params) {
  return request({
    url: '/api/monitoring/list',
    method: 'get',
    params
  })
}

// 获取基地选项
export function getBaseOptions() {
  return request({
    url: '/api/monitoring/base-options',
    method: 'get'
  })
}

// 添加监测点
export function addMonitoringPoint(data) {
  return request({
    url: '/api/monitoring/add',
    method: 'post',
    data
  })
}

// 更新监测点
export function updateMonitoringPoint(data) {
  return request({
    url: '/api/monitoring/update',
    method: 'put',
    data
  })
}

// 删除监测点
export function deleteMonitoringPoint(pointId) {
  return request({
    url: `/api/monitoring/delete/${pointId}`,
    method: 'delete'
  })
}

