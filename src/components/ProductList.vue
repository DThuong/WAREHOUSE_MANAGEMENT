<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <Dropdown 
        v-if="showFilter"
        v-model="selectedFilter" 
        :options="filters" 
        optionLabel="label" 
        placeholder="Chọn"
        style="width: 140px;"
      />
    </div>
    <div class="product-list">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="product-card"
      >
        <img :src="product.image" :alt="product.name" class="product-image" />
        <div class="product-info">
          <p class="product-name">{{ product.name }}</p>
          <p class="product-meta">
            <template v-if="showPrice">
              ${{ product.price }} • {{ formatNumber(product.units) }} đơn vị
            </template>
            <template v-else>
              ID: #{{ product.id }}
            </template>
          </p>
        </div>
        <div v-if="showPercentage" style="text-align: right;">
          <div style="font-size: 0.875rem; font-weight: 600; color: var(--success-color);">
            {{ product.percentage }}%
          </div>
          <div style="width: 48px; height: 4px; background: var(--gray-200); border-radius: 9999px; margin-top: 0.5rem; overflow: hidden;">
            <div :style="{ width: product.percentage + '%', height: '100%', background: 'var(--success-color)' }"></div>
          </div>
        </div>
        <div v-else-if="showStock" class="badge badge-warning">
          {{ product.stock }} Còn hàng
        </div>
      </div>
    </div>
    <div v-if="showViewAll" style="text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-200);">
      <a href="#" style="color: var(--primary-color); font-size: 0.875rem; font-weight: 500; text-decoration: none;">
        Xem tất cả
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: String,
  products: Array,
  showPrice: {
    type: Boolean,
    default: false
  },
  showPercentage: {
    type: Boolean,
    default: false
  },
  showStock: {
    type: Boolean,
    default: false
  },
  showFilter: {
    type: Boolean,
    default: true
  },
  showViewAll: {
    type: Boolean,
    default: false
  }
})

const selectedFilter = ref({ label: 'Hôm nay', value: 'today' })
const filters = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Tuần này', value: 'week' },
  { label: 'Tháng này', value: 'month' }
]

const formatNumber = (num) => {
  return new Intl.NumberFormat('vi-VN').format(num)
}
</script>

<style scoped>
.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
