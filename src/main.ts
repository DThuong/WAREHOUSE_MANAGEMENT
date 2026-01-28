import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import router from './router'
import App from './App.vue'

// PrimeVue components
import Button from 'primevue/button'
import Card from 'primevue/card'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'
import Badge from 'primevue/badge'
import Chip from 'primevue/chip'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Chart from 'primevue/chart'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import OverlayPanel from 'primevue/overlaypanel'
import { ToastService } from 'primevue'
import { ConfirmationService } from 'primevue'

// Import PrimeIcons
import 'primeicons/primeicons.css'

// Custom styles
import './style.css'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ToastService)
app.use(ConfirmationService)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark-mode',
      cssLayer: false
    }
  },
  ripple: true
})

// Register components globally
app.component('Button', Button)
app.component('Card', Card)
app.component('Menu', Menu)
app.component('Avatar', Avatar)
app.component('Badge', Badge)
app.component('Chip', Chip)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Chart', Chart)
app.component('Dropdown', Dropdown)
app.component('InputText', InputText)
app.component('OverlayPanel', OverlayPanel)

app.mount('#app')