// src/composables/useToken.ts
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { getTokenTimeRemaining } from '@/utils/checkToken'

const SAFETY_BUFFER = 8000 // 8s

export function useTokenMonitor() {
  const userStore = useUserStore()
  const router = useRouter()
  let timeoutId: number | null = null

  const clearTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const forceLogout = () => {
    clearTimer()

    // Clear auth state directly — do NOT call userAPI.logout() here.
    // The token is already expired so the API would return 401, which
    // previously caused a spurious "Request failed 401" error on the signin page.
    userStore.authError = null
    userStore.currentUser = null
    userStore.authToken = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')

    router.push({
      path: '/signin',
      query: { reason: 'expired' }
    })
  }

  const scheduleExactExpiry = () => {
    if (!userStore.isAuthenticated || !userStore.currentUser?.expiresAt) {
      return
    }
    const remaining = getTokenTimeRemaining(
      userStore.currentUser.expiresAt
    )
    // Token đã hết hạn
    if (remaining <= 0) {
      forceLogout()
      return
    }
    // Nếu token sắp hết (< buffer) → logout luôn
    if (remaining <= SAFETY_BUFFER) {
      forceLogout()
      return
    }
    clearTimer()
    const timeout = remaining - SAFETY_BUFFER
    timeoutId = window.setTimeout(forceLogout, timeout)
  }

  onMounted(() => {
    if (userStore.isAuthenticated) {
      scheduleExactExpiry()
    }
  })

  onUnmounted(() => {
    clearTimer()
  })

  return {
    scheduleExactExpiry
  }
}
