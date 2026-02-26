<template>
  <MainLayout>
      <div style="text-align: center; padding: 2rem;">
        <i class="pi pi-globe" style="font-size: 3rem; color: #fa8072; margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Ngôn ngữ</h3>
        <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem;">Chọn ngôn ngữ hiển thị cho hệ thống</p>
        <Button label="Tiếng Việt" outlined @click="setLanguage('vi')" />
        <Button label="English" outlined @click="setLanguage('en')" style="margin-left: 1rem;" />
        <Button label="Korean" outlined @click="setLanguage('ko')" style="margin-left: 1rem;" />
      </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/MainLayout.vue'
import Button from 'primevue/button'

const setLanguage = (lang: string) => {
  localStorage.setItem('dashboardLanguage', lang)
  window.location.reload()
}
</script>