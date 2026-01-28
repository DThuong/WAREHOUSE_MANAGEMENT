// User related types (match backend schema)
export interface User {
  id: number
  username: string
  role: string
  token: string
  department: string
  phoneNumber: string
  expiresAt?: string
  createAt: string
  isActive: boolean
}

// Auth related types
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

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  message: string
  status?: number
  data?: any
}

// Store state types
export interface UserState {
  currentUser: User | null
  isAuthenticated: boolean
  authToken: string | null
  users: User[]
  loading: boolean
  authLoading: boolean
  error: string | null
  authError: string | null
}