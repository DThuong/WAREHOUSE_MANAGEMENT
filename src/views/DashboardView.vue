<template>
  <MainLayout>
    <!-- Stats Cards Row -->
    <div class="grid grid-cols-4 animate-fade-in" style="margin-bottom: 2rem;">
      <StatCard 
        v-for="(stat, key) in dashboardStore.stats" 
        :key="key"
        :label="stat.label"
        :value="stat.value"
        :change="stat.change"
      />
    </div>

    <!-- Detailed Stats Row -->
    <div class="grid grid-cols-3" style="margin-bottom: 2rem;">
      <div 
        v-for="(stat, index) in dashboardStore.detailedStats" 
        :key="index"
        class="stat-card"
        style="animation-delay: 0.1s;"
      >
        <div class="flex justify-between items-center mb-4">
          <div>
            <p class="stat-label">{{ stat.title }}</p>
            <p class="stat-value" style="font-size: 1.75rem;">${{ formatNumber(stat.value) }}</p>
          </div>
          <div 
            style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;"
            :style="{ background: index === 0 ? '#dbeafe' : index === 1 ? '#fef3c7' : '#fee2e2' }"
          >
            <i 
              :class="index === 0 ? 'pi pi-chart-line' : index === 1 ? 'pi pi-replay' : 'pi pi-wallet'"
              :style="{ color: index === 0 ? '#1e40af' : index === 1 ? '#92400e' : '#991b1b', fontSize: '1.25rem' }"
            ></i>
          </div>
        </div>
        <div class="stat-change" :class="stat.change >= 0 ? 'positive' : 'negative'">
          <i :class="stat.change >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
          <span>{{ Math.abs(stat.change) }}% {{ stat.label }}</span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-2" style="margin-bottom: 2rem;">
      <SalesChart title="Doanh thu vs Mua hàng" />
      
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">Thông tin tổng quan</h3>
          <Dropdown 
            v-model="selectedOverviewPeriod" 
            :options="overviewPeriods" 
            optionLabel="label" 
            style="width: 180px;"
          />
        </div>
        <div class="grid grid-cols-3 gap-4" style="margin-top: 1.5rem;">
          <div style="text-align: center; padding: 1.5rem; background: var(--gray-50); border-radius: 12px;">
            <i class="pi pi-users" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 0.75rem;"></i>
            <p style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 0.25rem;">
              {{ formatNumber(dashboardStore.overviewStats.suppliers) }}
            </p>
            <p style="font-size: 0.875rem; color: var(--gray-600);">Nhà cung cấp</p>
          </div>
          <div style="text-align: center; padding: 1.5rem; background: var(--gray-50); border-radius: 12px;">
            <i class="pi pi-user" style="font-size: 2rem; color: #ec4899; margin-bottom: 0.75rem;"></i>
            <p style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 0.25rem;">
              {{ formatNumber(dashboardStore.overviewStats.customers) }}
            </p>
            <p style="font-size: 0.875rem; color: var(--gray-600);">Khách hàng</p>
          </div>
          <div style="text-align: center; padding: 1.5rem; background: var(--gray-50); border-radius: 12px;">
            <i class="pi pi-shopping-cart" style="font-size: 2rem; color: #10b981; margin-bottom: 0.75rem;"></i>
            <p style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 0.25rem;">
              {{ formatNumber(dashboardStore.overviewStats.orders) }}
            </p>
            <p style="font-size: 0.875rem; color: var(--gray-600);">Đơn hàng</p>
          </div>
        </div>
        <DoughnutChart style="margin-top: 2rem;" />
      </div>
    </div>

    <!-- Products & Sales Row -->
    <div class="grid grid-cols-3">
      <ProductList 
        title="Sản phẩm bán chạy"
        :products="dashboardStore.topProducts"
        :show-price="true"
        :show-percentage="true"
        :show-filter="true"
      />
      
      <ProductList 
        title="Sản phẩm tồn kho thấp"
        :products="dashboardStore.lowStockProducts"
        :show-stock="true"
        :show-filter="false"
        :show-view-all="true"
      />
      
      <RecentSales :sales="dashboardStore.recentSales" />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import MainLayout from '@/components/MainLayout.vue'
import StatCard from '@/components/StatCard.vue'
import SalesChart from '@/components/SalesChart.vue'
import DoughnutChart from '@/components/DoughnutChart.vue'
import ProductList from '@/components/ProductList.vue'
import RecentSales from '@/components/RecentSales.vue'

const dashboardStore = useDashboardStore()

const selectedOverviewPeriod = ref({ label: '6 tháng gần đây', value: '6months' })
const overviewPeriods = [
  { label: '6 tháng gần đây', value: '6months' },
  { label: 'Tháng này', value: 'month' },
  { label: 'Tuần này', value: 'week' }
]

const formatNumber = (num) => {
  return new Intl.NumberFormat('vi-VN').format(num)
}
</script>
