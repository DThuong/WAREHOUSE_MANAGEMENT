import { createI18n } from 'vue-i18n'
import messages from '@/locales/index'

// Lấy ngôn ngữ từ localStorage, fallback về 'vi'
const savedLang = localStorage.getItem('dashboardLanguage') || 'vi'

const i18n = createI18n({
  legacy: false,        // Dùng Composition API
  locale: savedLang,
  fallbackLocale: 'vi', // Nếu key không tồn tại → fallback về tiếng Việt
  messages: messages as any,
})

export default i18n