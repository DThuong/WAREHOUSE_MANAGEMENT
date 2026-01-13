<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">Tổng quan khách hàng</h3>
    </div>
    <div style="height: 240px; position: relative;">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    <div class="grid grid-cols-2 gap-4" style="margin-top: 1.5rem;">
      <div style="text-align: center;">
        <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">5.5K</p>
        <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.25rem;">Lần đầu</p>
        <div class="flex items-center justify-center gap-1" style="margin-top: 0.5rem;">
          <div style="width: 12px; height: 12px; background: #6366f1; border-radius: 3px;"></div>
          <span style="font-size: 0.75rem; color: var(--gray-500);">25%</span>
        </div>
      </div>
      <div style="text-align: center;">
        <p style="font-size: 1.5rem; font-weight: 700; color: #ec4899;">3.5K</p>
        <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.25rem;">Quay lại</p>
        <div class="flex items-center justify-center gap-1" style="margin-top: 0.5rem;">
          <div style="width: 12px; height: 12px; background: #ec4899; border-radius: 3px;"></div>
          <span style="font-size: 0.75rem; color: var(--gray-500);">21%</span>
        </div>
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
      backgroundColor: ['#6366f1', '#ec4899'],
      borderWidth: 0,
      cutout: '75%'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1f2937',
      padding: 12,
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = context.parsed || 0
          return label + ': ' + value.toLocaleString('vi-VN')
        }
      }
    }
  }
}
</script>
