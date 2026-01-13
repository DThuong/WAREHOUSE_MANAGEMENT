<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">Bán hàng gần đây</h3>
      <Dropdown 
        v-model="selectedPeriod" 
        :options="periods" 
        optionLabel="label" 
        placeholder="Chọn"
        style="width: 140px;"
      />
    </div>
    <div class="sales-list">
      <div 
        v-for="sale in sales" 
        :key="sale.id"
        class="product-card"
      >
        <img :src="sale.image" :alt="sale.name" class="product-image" />
        <div class="product-info">
          <p class="product-name">{{ sale.name }}</p>
          <p class="product-meta">
            {{ sale.category }} • {{ sale.quantity }},${{ formatNumber(sale.price) }}
          </p>
        </div>
        <span 
          class="badge" 
          :class="getStatusClass(sale.status)"
        >
          {{ getStatusLabel(sale.status) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  sales: Array
})

const selectedPeriod = ref({ label: 'Hàng tuần', value: 'weekly' })
const periods = [
  { label: 'Hàng tuần', value: 'weekly' },
  { label: 'Hàng tháng', value: 'monthly' },
  { label: 'Hàng năm', value: 'yearly' }
]

const formatNumber = (num) => {
  return new Intl.NumberFormat('vi-VN').format(num)
}

const getStatusClass = (status) => {
  const classes = {
    completed: 'badge-success',
    processing: 'badge-info',
    pending: 'badge-warning',
    cancelled: 'badge-danger'
  }
  return classes[status] || 'badge-info'
}

const getStatusLabel = (status) => {
  const labels = {
    completed: 'Hoàn thành',
    processing: 'Đang xử lý',
    pending: 'Chờ xử lý',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}
</script>

<style scoped>
.sales-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
