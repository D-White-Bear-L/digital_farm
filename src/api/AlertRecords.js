import request from "@/utils/request";

// 获取预警记录列表
export function getAlertRecords(params) {
    return request({
        url: '/api/alert-records/list',
        method: 'get',
        params
    });
}

// 更新预警记录状态（已读/未读）
export function updateAlertStatus(alertId) {
    return request({
        url: `/api/alert-records/${alertId}/status`,
        method: 'put'
    });
}

// 获取基地选项
export function getBaseOptions() {
    return request({
        url: '/api/alert-records/base-options',
        method: 'get'
    });
}