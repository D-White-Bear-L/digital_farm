/* 封装axios用于发送请求 */
import axios from 'axios'
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
  // 添加更详细的错误日志
  console.error('API请求错误:', error)
  // 可以根据错误类型进行不同处理
  if (error.code === 'ECONNABORTED') {
    console.log('请求超时')
  }
  return Promise.reject(error) // 返回一个失败的promise
})

// 导出
export default request
