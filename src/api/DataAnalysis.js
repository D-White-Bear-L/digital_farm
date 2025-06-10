import request from '@/utils/request'
import { getBaseOptions } from "./Monitoring"; // 获取基地选项


// 获取土壤基础指标趋势分析
export function getSoilTrendAnalysis(params) {
    return request({
        url: '/api/dataAnalysis/soil/trend',
        method: 'get',
        params
    })
}

// 获取土壤微量元素分析
export function getSoilMicroAnalysis(params) {
    return request({
        url: '/api/dataAnalysis/soil/micro',
        method: 'get',
        params: { ...params, _t: Date.now() }
    })
}

// 获取土壤质量评估
export function getSoilQualityAnalysis(params) {
    return request({
        url: '/api/dataAnalysis/soil/quality',
        method: 'get',
        params
    })
}


export { getBaseOptions }