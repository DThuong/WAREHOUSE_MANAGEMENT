<!-- DoughnutChart.vue -->
<template>
  <div class="doughnut-container">
    <div class="chart-wrapper">
      <Doughnut :data="chartData" :options="chartOptions" />
      <div class="chart-center-text">
        <div class="center-title">Tổng quan</div>
        <div class="center-title">khách hàng</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartData = computed(() => ({
  labels: ['Lần đầu', 'Quay lại'],
  datasets: [
    {
      data: [5500, 3500],
      backgroundColor: ['#10b981', '#f59e0b'],
      borderWidth: 0,
      cutout: '70%',
      borderRadius: 8,
      spacing: 2
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1f2937',
      padding: 12,
      bodyFont: {
        size: 13
      },
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(0)
          return label + ': ' + value.toLocaleString('vi-VN') + ' (' + percentage + '%)'
        }
      }
    }
  }
}
</script>

<style scoped>
.doughnut-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.center-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}
</style>