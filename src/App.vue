<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useTokenMonitor } from '@/composables/useToken'

const userStore = useUserStore()
const { scheduleExactExpiry } = useTokenMonitor()

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
