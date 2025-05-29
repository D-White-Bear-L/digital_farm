import request from '@/utils/request'

// 土壤质量监测-土壤质量监测
export function getMonitoring(params) {
  return request({
    url: '/api/soilQualityMonitoring',
    method: 'get',
    params
  })
}


// 土壤质量监测-数据质量评估
export function getQualityEvaluation(params) {
  return request({
    url: '/api/qualityEvaluation',
    method: 'get',
    params
  })
}

// 土壤质量监测-数据质量评估-数据分析
export function getDataAnalysis(params) {
  return request({
    url: '/api/dataAnalysis',
    method: 'get',
    params
  })
}

// 土壤质量监测-数据质量评估-报警设置
export function getAlertSettings(params) {
  return request({
    url: '/api/alertSettings',
    method: 'get',
    params
  })
}

// 土壤质量监测-数据质量评估-报警记录
export function getAlertRecords(params) {
  return request({
    url: '/api/alertRecords',
    method: 'get',
    params
  })
}

