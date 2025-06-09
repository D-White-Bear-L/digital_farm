import request from '@/utils/request'
import { getBaseOptions } from "./Monitoring"; // 获取基地选项
// 获取列表
export function getManualReportList(params) {
    return request({
        url: '/api/manualReport/list',
        method: 'get',
        params
    })
}

// 添加
export function addManualReport(data) {
    return request({
        url: '/api/manualReport/add',
        method: 'post',
        data
    })
}

// 更新
export function updateManualReport(data) {
    return request({
        url: '/api/manualReport/update',
        method: 'put',
        data
    })
}

// 删除
export function deleteManualReport(sampleId) {
    return request({
        url: `/api/manualReport/delete/${sampleId}`,
        method: 'delete'
    })
}

// 导出 getBaseOptions 以便在组件中使用
export { getBaseOptions }