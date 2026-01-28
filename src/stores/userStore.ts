import { defineStore } from 'pinia'
import { userAPI } from '@/services/userAPI'
import type { 
  User, 
  UserState, 
  LoginCredentials, 
  RegisterData,
  ChangePasswordByAdminData,
  ApiResponse,
  ApiError
} from '@/types/user.types'
import { isTokenExpired } from '@/utils/checkToken'

export const useUserStore = defineStore('user', {
    // State
    state: ():UserState => {
    // Khởi tạo state từ localStorage nếu có
    const token = localStorage.getItem('auth_token')
    const userInfoStr = localStorage.getItem('user_info')
    let user: User | null = null
    
    if (userInfoStr) {
      try {
        user = JSON.parse(userInfoStr)
      } catch (error) {
        console.error('Failed to parse user_info from localStorage')
      }
    }

    const isAuthenticated = !!(token && user)
    
    return {
      currentUser: user,
      isAuthenticated,
      authToken: token,
      users: [],
      loading: false,
      authLoading: false,
      error: null,
      authError: null,
    }
  },
  

  getters: {
    getAccountById: (state) => {
      return (id: number): User | undefined => {
        return state.users.find(user => user.id === id)
      }
    },
    getAccountsByRole: (state) => {
      return (role: string): User[] => {
        return state.users.filter(user => user.role === role)
      }
    },
    getAccountsByDepartment: (state) => {
      return (department: string): User[] => {
        return state.users.filter(user => user.department === department)
      }
    },
    activeAccounts: (state): User[] => {
      return state.users.filter(user => user.isActive)
    },
    inactiveAccounts: (state): User[] => {
      return state.users.filter(user => !user.isActive)
    },
    totalAccounts: (state): number => state.users.length,
    hasError: (state): boolean => {
      return !!(state.error || state.authError)
    },
    isTokenExpired: (state): boolean => {
        if (!state.currentUser?.expiresAt) return false
        return isTokenExpired(state.currentUser.expiresAt)
    }
  },
  // Actions - tương đương actions/thunks trong Redux
  actions: {
    // đăng ký account mới
    async register(userData: RegisterData): Promise<ApiResponse<User>> {
      this.authLoading = true
      this.authError = null
      
      try {
        const response = await userAPI.register(userData)
        if (isTokenExpired(response.expiresAt)) {
          throw new Error('Token already expired')
        }
        // Lưu token và user info nếu API trả về
        if (response) {
          this.authToken = response.token
          this.isAuthenticated = true
          this.currentUser = response
          localStorage.setItem('auth_token', response.token)
          localStorage.setItem('user_info', JSON.stringify(response))
        }
        
        return { success: true, data: response }
      } catch (error) {
        const apiError = error as ApiError
        this.authError = apiError.message
        return { success: false, error: apiError.message }
      } finally {
        this.authLoading = false
      }
    },

    // Đăng nhập
   async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    this.authLoading = true
    this.authError = null
    
    try {
        const response = await userAPI.login(credentials)
        if (isTokenExpired(response.expiresAt)) {
          throw new Error('Token expired')
        }
        // Lưu token và user info
        this.authToken = response.token
        this.isAuthenticated = true
        this.currentUser = response
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('user_info', JSON.stringify(response))
        return { success: true, data: response }
    } catch (error) {
        const apiError = error as ApiError
        console.error('❌ userStore.login: Error', apiError)
        this.authError = apiError.message
        return { success: false, error: apiError.message }
    } finally {
        this.authLoading = false
    }
},
    // Đăng Xuất
    async logout(): Promise<ApiResponse> {
      this.authLoading = true
      this.authError = null
      
      try {
        // Call API logout (để xóa session/device trên server)
        await userAPI.logout()
        
        // Clear state
        this.currentUser = null
        this.isAuthenticated = false
        this.authToken = null
        
        // Clear localStorage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_info')
    
        return { success: true }
      } catch (error) {
        return { success: false, error: 'Đăng xuất thất bại' }
      } finally {
        this.authLoading = false
      }
    },

    // Lấy danh sách tất cả accounts
    async fetchAccounts(): Promise<ApiResponse<User[]>> {
      this.loading = true
      this.error = null
      
      try {
        const response = await userAPI.getAllAccounts()
        this.users = response
        
        return { success: true, data: response }
      } catch (error) {
        const apiError = error as ApiError
        this.error = apiError.message
        return { success: false, error: apiError.message }
      } finally {
        this.loading = false
      }
    },

    // lấy ra account theo ID
    async fetchAccountById(accountId: number): Promise<ApiResponse<User>> {
      this.loading = true
      this.error = null
      
      try {
        const response = await userAPI.getAccountById(accountId)
        
        // Update trong danh sách nếu đã có
        const index = this.users.findIndex(u => u.id === accountId)
        if (index !== -1) {
          this.users[index] = response
        } else {
          this.users.push(response)
        }
        
        return { success: true, data: response }
      } catch (error) {
        const apiError = error as ApiError
        this.error = apiError.message
        return { success: false, error: apiError.message }
      } finally {
        this.loading = false
      }
    },

    // Thêm account mới
    async addAccount(userData: RegisterData): Promise<ApiResponse<User>> {
      this.loading = true
      this.error = null
      
      try {
        const response = await userAPI.register(userData)
        
        // Thêm vào danh sách local
        if (response) {
          this.users.push(response)
        }
        
        return { success: true, data: response }
      } catch (error) {
        const apiError = error as ApiError
        this.error = apiError.message
        return { success: false, error: apiError.message }
      } finally {
        this.loading = false
      }
    },

    // cập nhật account
    async updateAccount(accountId: number, userData: Partial<RegisterData>): Promise<ApiResponse<User>> {
      this.loading = true
      this.error = null
      
      try {
        const response = await userAPI.updateAccount(accountId, userData)
        
        // Update trong danh sách local
        const index = this.users.findIndex(u => u.id === accountId)
        if (index !== -1) {
          this.users[index] = response
        }
        
        // Update current user nếu đang update chính mình
        if (this.currentUser?.id === accountId) {
          this.currentUser = response
          localStorage.setItem('user_info', JSON.stringify(this.currentUser))
        }
        
        return { success: true, data: response }
      } catch (error) {
        const apiError = error as ApiError
        this.error = apiError.message
        return { success: false, error: apiError.message }
      } finally {
        this.loading = false
      }
    },

    // Admin xóa account
    async deleteAccount(accountId: number): Promise<ApiResponse> {
      this.loading = true
      this.error = null
      
      try {
        await userAPI.deleteAccount(accountId)
        
        // Xóa khỏi danh sách local
        this.users = this.users.filter(u => u.id !== accountId)
        
        return { success: true }
      } catch (error) {
        const apiError = error as ApiError
        this.error = apiError.message
        return { success: false, error: apiError.message }
      } finally {
        this.loading = false
      }
    },

    // Admin đổi mật khẩu cho account
    async changePasswordByAdmin(data: ChangePasswordByAdminData): Promise<ApiResponse> {
      this.loading = true
      this.error = null
      
      try {
        const response = await userAPI.changePasswordByAdmin(data)
        return { success: true, message: response.message }
      } catch (error) {
        const apiError = error as ApiError
        this.error = apiError.message
        return { success: false, error: apiError.message }
      } finally {
        this.loading = false
      }
    },

    async checkAndHandleTokenExpiration(): Promise<boolean> {
      if (!this.currentUser?.expiresAt) {
        return false
      }
      
      if (isTokenExpired(this.currentUser.expiresAt)) {
        console.log('⚠️ Token expired, logging out...')
        await this.logout()
        return true // Token đã hết hạn
      }
      
      return false // Token vẫn còn hạn
    },
    // clear error
    clearError(): void {
      this.error = null
      this.authError = null
    },

    // clear data
    resetStore(): void {
      this.currentUser = null
      this.isAuthenticated = false
      this.authToken = null
      this.users = []
      this.loading = false
      this.authLoading = false
      this.error = null
      this.authError = null
    },
  },
})