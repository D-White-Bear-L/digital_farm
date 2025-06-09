/* 封装axios用于发送请求 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建一个新的axios实例(让每个实例互不影响)：不会污染原始的axios实例
const request = axios.create({
  baseURL: 'http://localhost:8080', // 请求的公共地址/基地址
  timeout: 6000// 请求超时时间6s
})

// 添加请求拦截器
request.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

// 添加响应拦截器
request.interceptors.response.use(function (response) {
  // 2xx 范围内(成功)的状态码都会触发该函数。
  return response.data// +.data拔掉一层
}, function (error) {
  // 超出 2xx 范围的状态码都会触发该函数。
  console.error('API请求错误:', error)
  
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // token过期或无效
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('token')
        router.push('/login')
        break
      case 403:
        ElMessage.error('没有权限访问该资源')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        ElMessage.error('服务器错误，请稍后重试')
        break
      default:
        ElMessage.error(error.response.data?.message || '请求失败')
    }
  } else if (error.code === 'ECONNABORTED') {
    ElMessage.error('请求超时，请检查网络连接')
  } else {
    ElMessage.error('网络错误，请检查网络连接')
  }
  
  return Promise.reject(error) // 返回一个失败的promise
})

// 导出
export default request
