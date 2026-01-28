import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import type { ApiError } from '@/types/user.types'
import { useUserStore } from '@/stores/userStore'
import { isTokenExpired } from '@/utils/checkToken'
import router from '@/router'

const api: AxiosInstance = axios.create({
  baseURL: 'http://172.16.162.103:5028/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

//Biến flag để tránh loop redirect
let isRedirecting = false

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = localStorage.getItem('auth_token')
    
    // Check token expiration TRƯỚC khi gửi request
    if (userStore.currentUser?.expiresAt) {
      if (isTokenExpired(userStore.currentUser.expiresAt)) {
        
        // Clear localStorage và store
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_info')
        userStore.resetStore()
        
        // Redirect to login
        router.push({ 
          path: '/signin', 
          query: { reason: 'expired' } 
        })
        
        // Cancel request
        return Promise.reject(new Error('Token expired'))
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse): any => {
    return response.data
  },
  (error: AxiosError): Promise<ApiError> => {
    // Xử lý 401 với flag để tránh loop
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true
      
      // Clear auth data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      
      // Redirect về signin
      const currentPath = window.location.pathname
      if (currentPath !== '/signin') {
        window.location.href = `/signin?redirect=${encodeURIComponent(currentPath)}`
      }
      
      // Reset flag sau 1s
      setTimeout(() => {
        isRedirecting = false
      }, 1000)
    }
    
    const apiError: ApiError = {
      message: (error.response?.data as any)?.message || error.message || 'Đã có lỗi xảy ra',
      status: error.response?.status,
      data: error.response?.data
    }
    
    return Promise.reject(apiError)
  }
)

export default api