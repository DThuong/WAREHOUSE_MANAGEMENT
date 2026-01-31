export interface User {
  id: number
  username: string
  role: string
  token: string
  department: string
  phoneNumber: string
  expiresAt?: string
  createdAt: string
  isActive: boolean
}

export interface LoginCredentials {
  username: string
  password: string
  deviceInfo: string
}

export interface RegisterData {
  username: string
  password: string
  role: string
  department: string
  phoneNumber: string
}

export interface ChangePasswordByAdminData {
  accountId: number
  newPassword: string
}