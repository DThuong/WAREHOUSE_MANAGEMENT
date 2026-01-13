<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Logo -->
      <div class="logo-section">
        <img :src="logoImg" alt="InApp Logo" class="logo-image" />
        <h2 class="logo-text">Dongyang</h2>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSignIn" class="auth-form">
        <div class="form-group">
        <label for="username" class="form-label">Username</label>
        <InputText 
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter your username"
            class="form-input"
            :class="{ 'p-invalid': usernameError }"
        />
        <small v-if="usernameError" class="error-message">{{ usernameError }}</small>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <div class="flex justify-between items-center mb-2">
            <label for="password" class="form-label">Password</label>
          </div>
          <InputText 
            id="password"
            v-model="password"
            type="password"
            placeholder="Password"
            class="form-input"
            :class="{ 'p-invalid': passwordError }"
          />
          <small v-if="passwordError" class="error-message">{{ passwordError }}</small>
        </div>

        <!-- Remember Me -->
          
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
                <input 
                type="checkbox" 
                id="remember" 
                v-model="rememberMe"
                class="checkbox-input"
            />
            <label for="remember" class="checkbox-label">Remember me</label>
            </div>
            <a href="#" class="forgot-link">Forgot Password?</a>
          </div>
        

        <!-- Sign In Button -->
        <Button 
          type="submit"
          label="Sign in"
          class="btn-signin"
          :loading="loading"
        />

        <!-- Sign Up Link -->
        <p class="signup-text">
          Don't have an account? 
          <strong>Contact IT</strong> for support
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import logoImg from '../assets/images/newLogo.jpg'

const router = useRouter()

// Form state
const username = ref<string>('')
const usernameError = ref<string>('')
const password = ref<string>('')
const rememberMe = ref<boolean>(false)
const loading = ref<boolean>(false)

// Error state
const passwordError = ref<string>('')

// Validation
const validateForm = (): boolean => {
    let isValid = true
  
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
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // TODO: Implement your sign in logic here
    // Example:
    // await authService.signIn(email.value, password.value)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Redirect to dashboard
    router.push('/')
  } catch (error) {
    console.error('Sign in error:', error)
    passwordError.value = 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
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

.auth-title {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 2rem 0;
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
  margin-bottom: 0.5rem;
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

.btn-signin:hover {
  opacity: 0.8 !important;
}

.btn-signin:active {
  transform: scale(0.98);
}

.signup-text {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.signup-link {
  color: #ea580c;
  text-decoration: none;
  font-weight: 600;
}

.signup-link:hover {
  color: #dc2626;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
}
</style>