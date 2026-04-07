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

  // ★ Check expiration ngay cả khi store đã có auth data
  if (userStore.isAuthenticated && userStore.currentUser?.expiresAt) {
    if (isTokenExpired(userStore.currentUser.expiresAt)) {
      userStore.authError = null
      userStore.currentUser = null
      userStore.authToken = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')

      if (to.path === '/signin') {
        next()
      } else {
        next({ path: '/signin', query: { reason: 'expired' } })
      }
      return
    }
  }

  // Sync store từ localStorage (KHÔNG gán isAuthenticated)
  if (token && userInfo && !userStore.isAuthenticated) {
    try {
      const user = JSON.parse(userInfo)

      if (isTokenExpired(user.expiresAt)) {
        localStorage.clear()
        next({ path: '/signin', query: { redirect: to.fullPath, reason: 'expired' } })
        return
      }

      // isAuthenticated sẽ tự động = true (vì là getter)
      userStore.currentUser = user
      userStore.authToken = token
      
    } catch (error) {
      console.error('Failed to parse user_info:', error)
      localStorage.clear()
      userStore.resetStore()
    }
  }

  // Đã login mà vào signin → redirect về home
  if (userStore.isAuthenticated && to.path === '/signin') {
    next('/')
    return
  }

  // Chưa login nhưng route cần auth
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ path: '/signin', query: { redirect: to.fullPath } })
    return
  }

  // CHECK ROLE
  if (to.meta.roles) {
    const allowedRoles = to.meta.roles as string[]
    if (!userStore.currentUser || !allowedRoles.includes(userStore.currentUser.role)) {
      next('/')
      return
    }
  }

  next()
}