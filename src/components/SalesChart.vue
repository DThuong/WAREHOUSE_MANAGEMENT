<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <Dropdown 
        v-model="selectedPeriod" 
        :options="periods" 
        optionLabel="label" 
        placeholder="This Year"
        style="width: 180px;"
      />
    </div>
    <div style="height: 320px;">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Period {
  label: string
  value: string
}

defineProps({
  title: {
    type: String,
    default: 'Sales vs Purchase'
  }
})

const selectedPeriod = ref<Period>({ label: 'This Year', value: 'year' })
const periods: Period[] = [
  { label: 'This Year', value: 'year' },
  { label: 'This Month', value: 'month' },
  { label: 'This Week', value: 'week' }
]

const chartData = computed(() => ({
  labels: ['28 Jan', '29 Jan', '30 Jan', '31 Jan', '1 Feb', '2 Feb', '3 Feb', '4 Feb', '5 Feb'],
  datasets: [
    {
      label: 'Sales',
      data: [45, 55, 58, 98, 60, 85, 58, 105, 60, 95],
      backgroundColor: '#f7a085',
      borderRadius: 4,
      barThickness: 24
    },
    {
      label: 'Purchase',
      data: [75, 85, 58, 95, 60, 85, 105, 60, 115, 95],
      backgroundColor: '#e66239', 
      borderRadius: 4,
      barThickness: 24
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      align: 'center' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'rect',
        padding: 20,
        font: {
          size: 13,
          family: 'Inter, system-ui, sans-serif'
        },
        color: '#6b7280'
      }
    },
    tooltip: {
      backgroundColor: '#1f2937',
      padding: 12,
      titleFont: {
        size: 13,
        family: 'Inter, system-ui, sans-serif'
      },
      bodyFont: {
        size: 13,
        family: 'Inter, system-ui, sans-serif'
      },
      callbacks: {
        label: function(context: any) {
          return context.dataset.label + ': $' + context.parsed.y.toLocaleString('en-US') + 'k'
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif'
        },
        color: '#6b7280'
      }
    },
    y: {
      beginAtZero: true,
      max: 120,
      grid: {
        color: '#f3f4f6',
        drawBorder: false
      },
      ticks: {
        stepSize: 20,
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif'
        },
        color: '#6b7280',
        callback: function(value: any) {
          return value + 'k'
        }
      }
    }
  },
  interaction: {
    mode: 'index' as const,
    intersect: false
  }
}
</script>

<style scoped>
.chart-container {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
</style>