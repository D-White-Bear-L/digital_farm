import request from '@/utils/request'
import { getBaseOptions } from "./Monitoring"; // 获取基地选项


// 获取土壤基础指标趋势分析
export function getSoilTrendAnalysis(params) {
    return request({
        url: '/api/dataAnalysis/soil/trend',
        method: 'get',
        params: {
            ...params,
            pointId: params.pointId || null, // 确保传递 pointId
            baseId: params.baseId || null,
            startDate: params.startDate || null,
            endDate: params.endDate || null
        }
    })
}

// 获取土壤微量元素分析
export function getSoilMicroAnalysis(params) {
    return request({
        url: '/api/dataAnalysis/soil/micro',
        method: 'get',
        params: {
            ...params,
            pointId: params.pointId || null, // 确保传递 pointId
            baseId: params.baseId || null,
            startDate: params.startDate || null,
            endDate: params.endDate || null,
            _t: Date.now()
        }
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

// 导出数据接口
export function exportData(params) {
    return request({
        url: '/api/dataAnalysis/export',
        method: 'get',
        params: {
            ...params,
            baseId: params.baseId || null,
            pointId: params.pointId || null,
            startDate: params.startDate || null,
            endDate: params.endDate || null,
            type: params.type || null
        },
        responseType: 'blob' // 告诉axios这是一个二进制流响应
    })
}

export { getBaseOptions }