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
import ToastService from 'primevue/toastservice'
import { ConfirmationService } from 'primevue'
import i18n from './i18n'

// Import PrimeIcons
import 'primeicons/primeicons.css'
// Custom styles
import './style.css'

// Register custom Chart.js plugin: center lone bars that have no partner dataset
import { Chart as ChartJS } from 'chart.js';
ChartJS.register({
  id: 'centerLoneBars',
  afterUpdate(chart: any) {
    const { datasets } = chart.data;
    if (!datasets || datasets.length < 2) return;
    const hasVal = (v: any) => v !== null && v !== undefined && v !== 0;
    datasets.forEach((_: any, dsIdx: number) => {
      const meta = chart.getDatasetMeta(dsIdx);
      if (!meta || meta.hidden) return;
      meta.data.forEach((bar: any, i: number) => {
        if (!hasVal(datasets[dsIdx].data[i])) return;
        const activeCount = datasets.filter((ds: any) => hasVal(ds.data[i])).length;
        if (activeCount === 1) {
          bar.x = chart.scales['x'].getPixelForValue(i);
          bar.width = Math.min(bar.width * datasets.length, 80);
        }
      });
    });
  },
});

const pinia = createPinia()
const app = createApp(App)
app.use(i18n)
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
      cssLayer: false,
      Ripple: false
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