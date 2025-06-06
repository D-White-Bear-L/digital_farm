import request from "@/utils/request";
import { getBaseOptions } from "./Monitoring"; // 获取基地选项

// 获取土壤质量评估列表
export function getSoilQualityEvaluationList(params) {
  return request({
    url: '/api/soilQualityEvaluation/list',
    method: 'get',
    params
  })
}

// 添加土壤质量评估
export function addSoilQualityEvaluation(data) {
  return request({
    url: '/api/soilQualityEvaluation/add',
    method: 'post',
    data
  })
}

// 更新土壤质量评估
export function updateSoilQualityEvaluation(data) {
  return request({
    url: '/api/soilQualityEvaluation/update',
    method: 'put',
    data
  })
}

// 删除土壤质量评估
export function deleteSoilQualityEvaluation(evaluationId) {
  return request({
    url: `/api/soilQualityEvaluation/delete/${evaluationId}`,
    method: 'delete',
    params: { evaluationId }
  })
}

// 导出 getBaseOptions 以便在组件中使用
export { getBaseOptions }

// 获取监测点选项
export function getMonitoringPointOptions() {
  return request({
    url: '/api/monitoring/list',
    method: 'get'
  })
}
