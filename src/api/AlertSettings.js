import request from "@/utils/request";

export function getAlertSettings() {
    return request({
        url: '/api/alertSettings',
        method: 'get'
    });
}

export function updateAlertSetting(data) {
    return request({
        url: '/api/alertSettings',
        method: 'put',
        data
    });
}

