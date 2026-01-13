<!-- ProductList.vue -->
<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <Dropdown 
        v-if="showFilter"
        v-model="selectedFilter" 
        :options="filters" 
        optionLabel="label" 
        class="filter-dropdown"
      />
      <router-link 
        v-if="showViewAll"
        to="/inventory" 
        class="view-all-link"
      >
        Xem tất cả
      </router-link>
    </div>
    <div class="product-list">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="product-item"
      >
        <div class="product-image-wrapper">
          <img :src="product.image" :alt="product.name" class="product-image" />
        </div>
        <div class="product-details">
          <p class="product-name">{{ product.name }}</p>
          <p class="product-meta">
            <template v-if="showPrice">
              ${{ product.price }} • {{ formatNumber(product.units) }} Đơn vị
            </template>
            <template v-else-if="showStock">
              ID: #{{ product.id }}
            </template>
            <template v-else-if="showCategory">
              {{ product.category }} • ${{ formatNumber(product.price) }}
            </template>
          </p>
        </div>
        <div class="product-right">
          <div v-if="showPercentage" class="percentage-badge" :class="getPercentageClass(product.percentage)">
            {{ product.percentage }}%
          </div>
          <div v-else-if="showStock" class="stock-info">
            <div class="stock-quantity">{{ product.stock }}</div>
            <div class="stock-label">Còn hàng</div>
          </div>
          <div v-else-if="showStatus" class="status-badge" :class="getStatusClass(product.status)">
            {{ getStatusText(product.status) }}
          </div>
        </div>
      </div>
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
  showCategory: {
    type: Boolean,
    default: false
  },
  showStatus: {
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

const getPercentageClass = (percentage) => {
  if (percentage >= 40) return 'percentage-high'
  if (percentage >= 30) return 'percentage-medium'
  if (percentage >= 20) return 'percentage-low'
  return 'percentage-very-low'
}

const getStatusClass = (status) => {
  const statusMap = {
    'completed': 'status-completed',
    'hoàn thành': 'status-completed',
    'processing': 'status-processing',
    'đang xử lý': 'status-processing',
    'pending': 'status-pending',
    'chờ xử lý': 'status-pending',
    'cancelled': 'status-cancelled',
    'đã hủy': 'status-cancelled'
  }
  return statusMap[status] || ''
}

const getStatusText = (status) => {
  const statusTextMap = {
    'Completed': 'Hoàn thành',
    'Processing': 'Đang xử lý',
    'Pending': 'Chờ xử lý',
    'Cancelled': 'Đã hủy'
  }
  return statusTextMap[status] || status
}
</script>

<style scoped>
.chart-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
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

.filter-dropdown {
  width: 120px;
}

.view-all-link {
  font-size: 0.875rem;
  color: #ef4444;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: #dc2626;
  text-decoration: underline;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.5rem 0;
}

.product-image-wrapper {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-meta {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.product-right {
  flex-shrink: 0;
  text-align: right;
}

/* Percentage Badges for Top Selling */
.percentage-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.percentage-high {
  background: #fee2e2;
  color: #dc2626;
}

.percentage-medium {
  background: #dbeafe;
  color: #2563eb;
}

.percentage-low {
  background: #dcfce7;
  color: #16a34a;
}

.percentage-very-low {
  background: #fef3c7;
  color: #d97706;
}

/* Stock Info for Low Stock */
.stock-info {
  text-align: right;
}

.stock-quantity {
  font-size: 1rem;
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 0.125rem;
  text-align: center;
}

.stock-label {
  font-size: 0.75rem;
  color: #64748b;
}

/* Status Badges for Recent Sales */
.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  white-space: nowrap;
}

.status-completed {
  background: #dcfce7;
  color: #16a34a;
}

.status-processing {
  background: #fef3c7;
  color: #d97706;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-cancelled {
  background: #fee2e2;
  color: #dc2626;
}
</style>