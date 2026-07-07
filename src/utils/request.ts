import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:4000',
  timeout: 10000,
})

// Request interceptor: inject JWT token automatically
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: unified error handling
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || '网络请求错误'

    if (status === 401) {
      ElMessage.error('登录状态失效，请重新登录')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      // Redirect to login page if window exists
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      ElMessage.error('权限不足，拒绝访问')
    } else {
      ElMessage.error(message)
    }
    return Promise.reject(error)
  }
)

export default request
