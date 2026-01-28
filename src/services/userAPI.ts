import api from './api'
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  ChangePasswordByAdminData
} from '@/types/user.types'

export const userAPI = {
  /**
   * Đăng ký account mới
   */
  register(userData: RegisterData): Promise<User> {
    return api.post('/api/Account/register', userData)
  },

  /**
   * Đăng nhập (mỗi tài khoản chỉ dùng trên 1 thiết bị)
   */
  login(credentials: LoginCredentials): Promise<User> {
    return api.post('/api/Account/login', credentials)
  },

  /**
   * Lấy danh sách tất cả accounts
   */
  getAllAccounts(): Promise<User[]> {
    return api.get('/api/Account')
  },

  /**
   * Lấy account theo ID
   */
  getAccountById(accountId: number): Promise<User> {
    return api.get(`/api/Account/${accountId}`)
  },

  /**
   * Cập nhật account
   */
  updateAccount(accountId: number, userData: Partial<RegisterData>): Promise<User> {
    return api.put(`/api/Account/${accountId}`, userData)
  },

  /**
   * Xóa account
   */
  deleteAccount(accountId: number): Promise<{ message: string }> {
    return api.delete(`/api/Account/${accountId}`)
  },

  /**
   * Admin đổi mật khẩu cho account
   */
  changePasswordByAdmin(data: ChangePasswordByAdminData): Promise<{ message: string }> {
    return api.put('/api/Account/change-password-by-admin', data)
  },

  // logout
  logout(): Promise<{ message: string }> {
    return api.post('/api/Account/logout')
  }
}