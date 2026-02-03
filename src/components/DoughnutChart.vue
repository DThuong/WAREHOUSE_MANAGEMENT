<template>
  <div class="doughnut-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

interface ChartData {
  labels: string[]
  datasets: Array<{
    data: number[]
    backgroundColor: string[]
    borderWidth: number
    hoverOffset?: number
  }>
}

interface Props {
  chartData: ChartData
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(45, 45, 45, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(189, 178, 255, 0.5)',
          borderWidth: 2,
          padding: 16,
          boxPadding: 8,
          usePointStyle: true,
          bodyFont: {
            size: 14,
            weight: '600'
          },
          titleFont: {
            size: 15,
            weight: '700'
          },
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.parsed
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
              return ` ${label}: ${value} (${percentage}%)`
            }
          }
        }
      },
      cutout: '70%',
      borderWidth: 0,
      spacing: 2,
      hoverOffset: 8,
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 800,
        easing: 'easeInOutQuart'
      }
    }
  })
}

onMounted(() => {
  createChart()
})

watch(() => props.chartData, () => {
  createChart()
}, { deep: true })
</script>

<style scoped>
.doughnut-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
}
</style>