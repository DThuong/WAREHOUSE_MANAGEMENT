import api from './api'
import type {
  User,
  LoginCredentials,
  RegisterData,
  UpdateAccountData,
  ChangePasswordByAdminData,
} from '@/types/user.types'

export const userAPI = {
  // Auth
  register(userData: RegisterData): Promise<User> {
    return api.post('/api/Account/register', userData)
  },

  login(credentials: LoginCredentials): Promise<User> {
    return api.post('/api/Account/login', credentials)
  },

  logout(): Promise<{ message: string }> {
    return api.post('/api/Account/logout')
  },

  // User Management
  getAllAccounts(): Promise<User[]> {
    return api.get('/api/Account')
  },

  getAccountById(accountId: number): Promise<User> {
    return api.get(`/api/Account/${accountId}`)
  },

  updateAccount(accountId: number, userData: UpdateAccountData): Promise<User> {
    return api.put(`/api/Account/${accountId}`, userData)
  },

  deleteAccount(accountId: number): Promise<{ message: string }> {
    return api.delete(`/api/Account/${accountId}`)
  },

  changePasswordByAdmin(data: ChangePasswordByAdminData): Promise<{ message: string }> {
    return api.put('/api/Account/change-password-by-admin', data)
  },
}
