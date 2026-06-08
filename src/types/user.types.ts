export interface User {
  id: number
  username: string
  password?: string | null
  role: string
  token?: string
  department: string
  areaPart: string
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
  areaPart: string
  phoneNumber: string
}

export interface UpdateAccountData {
  phoneNumber?: string
  role?: string
  department?: string
  areaPart?: string
}

export interface ChangePasswordByAdminData {
  accountId: number
  newPassword: string
}

export interface ApiError {
  message: string
  status: number | undefined
  data: any
}
