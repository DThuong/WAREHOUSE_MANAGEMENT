import { computed, type ComputedRef } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'primevue/usetoast'
import type { 
  User, 
  LoginCredentials, 
  RegisterData,
  ChangePasswordByAdminData,
  ApiResponse
} from '@/types/user.types'

export function useUser() {
  const userStore = useUserStore()
  const toast = useToast()

  // Computed properties
  const currentUser: ComputedRef<User | null> = computed(() => userStore.currentUser)
  const isAuthenticated: ComputedRef<boolean> = computed(() => userStore.isAuthenticated)
  const users: ComputedRef<User[]> = computed(() => userStore.users)
  const activeAccounts: ComputedRef<User[]> = computed(() => userStore.activeAccounts)
  const inactiveAccounts: ComputedRef<User[]> = computed(() => userStore.inactiveAccounts)
  const loading: ComputedRef<boolean> = computed(() => userStore.loading)
  const authLoading: ComputedRef<boolean> = computed(() => userStore.authLoading)
  const error: ComputedRef<string | null> = computed(() => userStore.error)
  const authError: ComputedRef<string | null> = computed(() => userStore.authError)
  const hasError: ComputedRef<boolean> = computed(() => userStore.hasError)
  const totalAccounts: ComputedRef<number> = computed(() => userStore.totalAccounts)

  // Login method (NO toast here, let SignIn.vue handle it)
  const login = async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    const result = await userStore.login(credentials)
    return result
  }

  // FIXED - Logout method with async/await
  const logout = async (): Promise<ApiResponse> => {
    const result = await userStore.logout()
    return result
  }

  const register = async (userData: RegisterData): Promise<ApiResponse<User>> => {
    const result = await userStore.register(userData)
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đăng ký thành công',
        life: 2000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: result.error || 'Đăng ký thất bại',
        life: 3000
      })
    }
    
    return result
  }

  // ... rest of methods remain the same ...

  const fetchAccounts = async (): Promise<ApiResponse<User[]>> => {
    const result = await userStore.fetchAccounts()
    
    if (!result.success) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: result.error || 'Không thể tải danh sách accounts',
        life: 3000
      })
    }
    
    return result
  }

  const fetchAccountById = async (accountId: number): Promise<ApiResponse<User>> => {
    const result = await userStore.fetchAccountById(accountId)
    
    if (!result.success) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: result.error || 'Không thể tải thông tin account',
        life: 3000
      })
    }
    
    return result
  }

  const addAccount = async (userData: RegisterData): Promise<ApiResponse<User>> => {
    const result = await userStore.addAccount(userData)
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Thêm account thành công',
        life: 2000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: result.error || 'Không thể thêm account',
        life: 3000
      })
    }
    
    return result
  }

  const updateAccount = async (accountId: number, userData: Partial<RegisterData>): Promise<ApiResponse<User>> => {
    const result = await userStore.updateAccount(accountId, userData)
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật account thành công',
        life: 2000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: result.error || 'Không thể cập nhật account',
        life: 3000
      })
    }
    
    return result
  }

  const deleteAccount = async (accountId: number): Promise<ApiResponse> => {
    const result = await userStore.deleteAccount(accountId)
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Xóa account thành công',
        life: 2000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: result.error || 'Không thể xóa account',
        life: 3000
      })
    }
    
    return result
  }

  const changePasswordByAdmin = async (data: ChangePasswordByAdminData): Promise<ApiResponse> => {
    const result = await userStore.changePasswordByAdmin(data)
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đổi mật khẩu thành công',
        life: 2000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: result.error || 'Không thể đổi mật khẩu',
        life: 3000
      })
    }
    
    return result
  }

  const clearError = (): void => {
    userStore.clearError()
  }

  const resetStore = (): void => {
    userStore.resetStore()
  }

  const getAccountById = (id: number): User | undefined => {
    return userStore.getAccountById(id)
  }

  const getAccountsByRole = (role: string): User[] => {
    return userStore.getAccountsByRole(role)
  }

  const getAccountsByDepartment = (department: string): User[] => {
    return userStore.getAccountsByDepartment(department)
  }

  return {
    // State
    currentUser,
    isAuthenticated,
    users,
    activeAccounts,
    inactiveAccounts,
    loading,
    authLoading,
    error,
    authError,
    hasError,
    totalAccounts,
    
    // Methods
    login,
    logout,
    register,
    fetchAccounts,
    fetchAccountById,
    addAccount,
    updateAccount,
    deleteAccount,
    changePasswordByAdmin,
    clearError,
    resetStore,
    
    // Getters
    getAccountById,
    getAccountsByRole,
    getAccountsByDepartment,
  }
}