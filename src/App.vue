<template>
  <Toast />
  <div id="app-root">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted} from 'vue'
import { useUserStore } from '@/stores/userStore'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useTokenMonitor } from '@/composables/useToken'
import { signalRService } from './services/signalrService'
import { isTokenExpired } from '@/utils/checkToken'

const userStore = useUserStore()
const toast = useToast()
const { scheduleExactExpiry } = useTokenMonitor()

// Helper: chỉ start SignalR nếu token chưa hết hạn
const isTokenValid = () =>
  userStore.currentUser?.expiresAt && !isTokenExpired(userStore.currentUser.expiresAt)

watch(
  () => userStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated && isTokenValid()) {
      await signalRService.start()
    } else {
      await signalRService.stop()
    }
  },
  { immediate: true }
)
onMounted(async () => {
  if (userStore.isAuthenticated && isTokenValid()) {
    await signalRService.start()
  }
})

onMounted(() => {
  watch(
    () => userStore.justLogin,
    (val) => {
      console.log('LOGIN WATCH:', val, userStore.currentUser)

      if (val && userStore.currentUser) {
        if(userStore.currentUser.role === "Admin"){
          toast.add({
            summary: 'Đăng nhập thành công',
            detail: `Chào mừng ${userStore.currentUser.username}!`,
            life: 2000
          })
        }
        userStore.clearLoginFlag()
      }
    },
    { immediate: true }
  )
})
watch(
  () => userStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      scheduleExactExpiry()
    }
  },
  { immediate: true }
)
</script>

<style>
@import "tailwindcss";
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
