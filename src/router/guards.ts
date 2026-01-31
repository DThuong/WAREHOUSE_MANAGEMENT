import { useUserStore } from "@/stores/userStore"
import { isTokenExpired } from "@/utils/checkToken"
import { NavigationGuardNext, RouteLocationNormalized } from "vue-router"

export const authGuard = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('auth_token')
  const userInfo = localStorage.getItem('user_info')

  // Sync store từ localStorage (KHÔNG gán isAuthenticated)
  if (token && userInfo && !userStore.isAuthenticated) {
    try {
      const user = JSON.parse(userInfo)

      if (isTokenExpired(user.expiresAt)) {
        console.log('⚠️ Token expired')
        localStorage.clear()
        next({ path: '/signin', query: { redirect: to.fullPath, reason: 'expired' } })
        return
      }

      // isAuthenticated sẽ tự động = true (vì là getter)
      userStore.currentUser = user
      userStore.authToken = token
      
      console.log('✅ Store synced from localStorage')
    } catch (error) {
      console.error('❌ Failed to parse user_info:', error)
      localStorage.clear()
      userStore.resetStore()
    }
  }

  // Đã login mà vào signin → redirect về home
  if (userStore.isAuthenticated && to.path === '/signin') {
    console.log('🔄 Already logged in, redirecting to home')
    next('/')
    return
  }

  // Chưa login nhưng route cần auth
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    console.log('🔒 Route requires auth, redirecting to signin')
    next({ path: '/signin', query: { redirect: to.fullPath } })
    return
  }

  // CHECK ROLE
  if (to.meta.roles) {
    const allowedRoles = to.meta.roles as string[]

    if (!userStore.currentUser || !allowedRoles.includes(userStore.currentUser.role)) {
      console.log('⛔ User role not allowed')
      next('/')
      return
    }
  }

  next()
}