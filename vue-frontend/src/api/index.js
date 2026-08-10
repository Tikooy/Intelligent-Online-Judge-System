import axios from 'axios'

const api = axios.create({
  baseURL: '',
  timeout: 10000,
})

// 请求拦截器：自动附加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一错误处理
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // 仅当持有 token 时视为会话过期，强制登出；登录失败（无 token）不跳转，保留页面错误提示
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
