<template>
  <MainLayout>
      <div style="text-align: center; padding: 2rem;">
        <i class="pi pi-globe" style="font-size: 3rem; color: #fa8072; margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">{{ t('language.title') }}</h3>
        <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem;">{{ t('language.description') }}</p>
        <Button outlined @click="setLanguage('vi')" class="btn-mobile">
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.25rem;">🇻🇳</span>
            <span>{{ t('language.vi') }}</span>
          </span>
        </Button>
        <Button outlined @click="setLanguage('en')" style="margin-left: 1rem;" class="btn-mobile">
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.25rem;">🇺🇸</span>
            <span>{{ t('language.en') }}</span>
          </span>
        </Button>
        <Button outlined @click="setLanguage('ko')" style="margin-left: 1rem;" class="btn-mobile">
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.25rem;">🇰🇷</span>
            <span>{{ t('language.ko') }}</span>
          </span>
        </Button>
      </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/MainLayout.vue'
import Button from 'primevue/button'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const setLanguage = (lang: string) => {
  localStorage.setItem('dashboardLanguage', lang)
  window.location.reload()
}
</script>
<style scoped>
@media (max-width: 768px) {
  .btn-mobile {
    width: 100%;
    margin-bottom: 0.5rem;
    margin-left: 0 !important;
  }
}
</style>