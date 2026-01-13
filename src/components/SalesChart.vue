<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <Dropdown 
        v-model="selectedPeriod" 
        :options="periods" 
        optionLabel="label" 
        placeholder="Chọn kỳ"
        style="width: 180px;"
      />
    </div>
    <div style="height: 300px;">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

defineProps({
  title: {
    type: String,
    default: 'Doanh thu vs Mua hàng'
  }
})

const selectedPeriod = ref({ label: 'Năm nay', value: 'year' })
const periods = [
  { label: 'Năm nay', value: 'year' },
  { label: 'Tháng này', value: 'month' },
  { label: 'Tuần này', value: 'week' }
]

const chartData = computed(() => ({
  labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
  datasets: [
    {
      label: 'Doanh thu',
      data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 32000, 29000, 35000, 38000, 42000],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    },
    {
      label: 'Mua hàng',
      data: [8000, 12000, 10000, 18000, 16000, 22000, 20000, 24000, 21000, 26000, 28000, 30000],
      borderColor: '#ec4899',
      backgroundColor: 'rgba(236, 72, 153, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#ec4899',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 13,
          family: 'Inter'
        }
      }
    },
    tooltip: {
      backgroundColor: '#1f2937',
      padding: 12,
      titleFont: {
        size: 13,
        family: 'Inter'
      },
      bodyFont: {
        size: 13,
        family: 'Inter'
      },
      callbacks: {
        label: function(context) {
          return context.dataset.label + ': $' + context.parsed.y.toLocaleString('vi-VN')
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
          size: 12,
          family: 'Inter'
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#f3f4f6'
      },
      ticks: {
        font: {
          size: 12,
          family: 'Inter'
        },
        callback: function(value) {
          return '$' + (value / 1000) + 'k'
        }
      }
    }
  }
}
</script>
