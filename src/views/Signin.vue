<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Logo -->
      <div class="logo-section">
        <img :src="logoImg" alt="InApp Logo" class="logo-image" />
        <h2 class="logo-text">Dongyang</h2>
      </div>

      <!-- Error Message -->
      <Message v-if="authError" severity="error" :closable="true" @close="clearAuthError">
        {{ authError }}
      </Message>

      <!-- Form -->
      <form @submit.prevent="handleSignIn" class="auth-form">
        <!-- Username Field -->
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <InputText 
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter your username"
            class="form-input"
            :class="{ 'p-invalid': usernameError }"
            :disabled="authLoading"
          />
          <small v-if="usernameError" class="error-message">{{ usernameError }}</small>
        </div>
        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="password" class="form-label">Password</label>
          </div>
          <Password 
            id="password"
            v-model="password"
            placeholder="Password"
            :class="{ 'p-invalid': passwordError }"
            :disabled="authLoading"
            :feedback="false"
            toggleMask
          />
          <small v-if="passwordError" class="error-message">{{ passwordError }}</small>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <input 
              type="checkbox" 
              id="remember" 
              v-model="rememberMe"
              class="checkbox-input"
              :disabled="authLoading"
            />
            <label for="remember" class="checkbox-label">Remember me</label>
          </div>
          <a href="#" class="forgot-link">Forgot Password?</a>
        </div>

        <!-- Sign In Button -->
        <Button 
          type="submit"
          label="Đăng Nhập"
          class="btn-signin"
          :loading="authLoading"
          :disabled="authLoading"
        />

        <!-- Sign Up Link -->
        <p class="signup-text">
          Don't have an account? 
          <strong>Contact IT</strong> for support
        </p>
      </form>
    </div>

    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '@/composables/useUser'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password' 
import Button from 'primevue/button'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import logoImg from '@/assets/images/newLogo.jpg'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

// Composable
const { 
  login, 
  logout,
  authLoading, 
  authError,
  clearError 
} = useUser()

// Form state
const username = ref<string>('')
const password = ref<string>('')
const rememberMe = ref<boolean>(false)

// Validation errors
const usernameError = ref<string>('')
const passwordError = ref<string>('')

// Get device info for login
const getDeviceInfo = (): string => {
  const userAgent = navigator.userAgent
  const platform = navigator.platform
  
  let browser = 'Unknown'
  if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome'
  else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox'
  else if (userAgent.indexOf('Safari') > -1) browser = 'Safari'
  else if (userAgent.indexOf('Edge') > -1) browser = 'Edge'
  
  return `${browser} on ${platform}`
}

// Validation
const validateForm = (): boolean => {
  let isValid = true
  
  // Reset errors
  usernameError.value = ''
  passwordError.value = ''

  // Validate username
  if (!username.value) {
    usernameError.value = 'Username is required'
    isValid = false
  } else if (username.value.length < 3) {
    usernameError.value = 'Username must be at least 3 characters'
    isValid = false
  }

  // Validate password
  if (!password.value) {
    passwordError.value = 'Password is required'
    isValid = false
  } else if (password.value.length < 3) {
    passwordError.value = 'Password must be at least 3 characters'
    isValid = false
  }

  return isValid
}

// Handle sign in
const handleSignIn = async (): Promise<void> => {
  clearAuthError()
  
  if (!validateForm()) {
    return
  }

  try {
    const result = await login({
      username: username.value,
      password: password.value,
      deviceInfo: getDeviceInfo()
    })

    if (result.success) {
      const user = userStore.currentUser
      if(!user) return
      if (user.role !== 'admin') {
        toast.add({
          severity: 'warn',
          summary: 'Không có quyền',
          detail: 'Tài khoản của bạn không có quyền truy cập hệ thống',
          life: 3000
        })

        await logout()
        return
      }

      // Redirect to original destination or home
      const redirectPath = '/'
      
      // Thêm delay nhỏ để đảm bảo token đã được lưu
      setTimeout(() => {
        router.push(redirectPath)
      }, 100)
    } else {
      if (result.error?.toLowerCase().includes('username')) {
        usernameError.value = result.error
      } else if (result.error?.toLowerCase().includes('password')) {
        passwordError.value = result.error
      }
    }
  } catch (error) {
    console.error('Sign in error:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Đã xảy ra lỗi. Vui lòng thử lại.',
      life: 3000
    })
  }
}

// Clear auth error
const clearAuthError = () => {
  clearError()
  usernameError.value = ''
  passwordError.value = ''
}

// Load saved username if remember me was checked
onMounted(() => {
  const rememberMeEnabled = localStorage.getItem('remember_me') === 'true'
  const savedUsername = localStorage.getItem('saved_username')
  
  if (rememberMeEnabled && savedUsername) {
    rememberMe.value = true
    username.value = savedUsername
  }
})
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 420px;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.logo-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.p-invalid {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.8125rem;
  margin-top: 0.25rem;
  display: block;
}

.forgot-link {
  font-size: 0.875rem;
  color: #ef4444;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  color: #dc2626;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  user-select: none;
  margin: 0;
}

.btn-signin {
  width: 100%;
  background: #ea580c;
  border: none;
  border-radius: 8px;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
}

.btn-signin:enabled:hover {
  opacity: 0.8;
}

.btn-signin:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.signup-text {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Password */
/* Wrapper */
:deep(.p-password) {
  width: 100%;
}

/* Input thật */
:deep(.p-password input) {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

/* Focus */
:deep(.p-password input:focus) {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Error */
:deep(.p-password.p-invalid input) {
  border-color: #ef4444;
}

/* Disabled */
:deep(.p-password input:disabled) {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

/* Message styling */
:deep(.p-message) {
  margin-bottom: 1.5rem;
}

/* Button */
:deep(.p-button.btn-signin) {
  background: #ea580c;
  border: none !important;
  color: white;
}

/* Hover */
:deep(.p-button.btn-signin:hover) {
  background: #ca3001; /* giữ nguyên */
  opacity: 0.85;
}

/* Focus */
:deep(.p-button.btn-signin:focus) {
  background: #ea580c;
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.3);
}

/* Active (click) */
:deep(.p-button.btn-signin:active) {
  background: #c2410c;
}

/* Disabled */
:deep(.p-button.btn-signin:disabled) {
  background: #ea580c;
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
}
</style>