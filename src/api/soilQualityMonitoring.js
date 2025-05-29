import request from '@/utils/request'

// 土壤质量监测-土壤质量监测
export function getMonitoring(params) {
  return request({
    url: '/api/soilQualityMonitoring',
    method: 'get',
    params
  })
}

