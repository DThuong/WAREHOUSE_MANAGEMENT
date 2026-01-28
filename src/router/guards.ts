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

  // Sync store từ localStorage
  if (token && userInfo && !userStore.isAuthenticated) {
    try {
      const user = JSON.parse(userInfo)

      if (isTokenExpired(user.expiresAt)) {
        localStorage.clear()
        next({ path: '/signin', query: { redirect: to.fullPath, reason: 'expired' } })
        return
      }

      userStore.currentUser = user
      userStore.isAuthenticated = true
      userStore.authToken = token
    } catch {
      localStorage.clear()
      userStore.$reset()
    }
  }

  // Đã login mà vào signin
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
    const allowedRoles = to.meta.roles as string

    if (!userStore.currentUser || !allowedRoles.includes(userStore.currentUser.role)) {
      next('/')
      return
    }
  }

  next()
}
