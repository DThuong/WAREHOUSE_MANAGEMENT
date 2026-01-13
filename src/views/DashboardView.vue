<template>
  <MainLayout>
    <!-- Stats Cards Row -->
    <div class="stats-grid">
      <div 
        v-for="(stat, key, index) in dashboardStore.stats" 
        :key="key"
        class="stat-card-compact"
        :class="getStatCardClass(index)"
      >
        <div class="stat-icon" :class="getIconBgClass(index)">
          <i :class="getIconClass(index)"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label-compact">{{ stat.label }}</div>
          <div class="stat-value-compact">${{ formatNumber(stat.value) }}</div>
          <div class="stat-change-compact" :class="stat.change >= 0 ? 'positive' : 'negative'">
            +{{ stat.change }}% kể từ tháng trước
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Stats Row -->
    <div class="detailed-stats-grid">
      <div 
        v-for="(stat, index) in dashboardStore.detailedStats" 
        :key="index"
        class="detailed-stat-card"
      >
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <p class="detailed-stat-value">${{ formatNumber(stat.value) }}</p>
            <p class="detailed-stat-label">{{ stat.title }}</p>
          </div>
          <div 
            class="detailed-icon-wrapper"
            :style="{ background: getDetailedBgColor(index) }"
          >
            <i 
              :class="getDetailedIconClass(index)"
              :style="{ color: getDetailedIconColor(index) }"
            ></i>
          </div>
        </div>
        <div class="detailed-stat-change" :class="stat.change >= 0 ? 'positive' : 'negative'">
          <i :class="stat.change >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
          <span>{{ Math.abs(stat.change) }}% {{ stat.label }}</span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-2" style="margin-bottom: 24px; gap: 1.5rem;">
      <SalesChart title="Doanh thu vs Mua hàng" />
      
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">Thông tin tổng quan</h3>
          <Dropdown 
            v-model="selectedOverviewPeriod" 
            :options="overviewPeriods" 
            optionLabel="label" 
            placeholder="6 tháng gần đây"
            style="width: 180px;"
          />
        </div>

        <!-- Customers Overview Section -->
        <div class="customers-overview-section">
          <h4 class="section-subtitle">Tổng quan khách hàng</h4>
          
          <div class="overview-content-horizontal">
            <!-- Donut Chart -->
            <div class="donut-chart-section">
              <div class="donut-chart-wrapper">
                <DoughnutChart />
              </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-cards-horizontal">
              <!-- First Time Card -->
              <div class="stat-card-horizontal">
                <div class="stat-value-large">5.5K</div>
                <div class="stat-label-green">Lần đầu</div>
                <div class="stat-badge-green">
                  <i class="pi pi-arrow-up"></i>
                  25%
                </div>
              </div>

              <!-- Return Card -->
              <div class="stat-card-horizontal">
                <div class="stat-value-large">3.5K</div>
                <div class="stat-label-orange">Quay lại</div>
                <div class="stat-badge-green">
                  <i class="pi pi-arrow-up"></i>
                  21%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Stats Row -->
        <div class="bottom-stats">
          <div class="bottom-stat-item">
            <div class="stat-number">{{ formatNumber(dashboardStore.overviewStats.suppliers) }}</div>
            <div class="stat-text">Nhà cung cấp</div>
          </div>
          <div class="bottom-stat-divider"></div>
          <div class="bottom-stat-item">
            <div class="stat-number">{{ formatNumber(dashboardStore.overviewStats.customers) }}</div>
            <div class="stat-text">Khách hàng</div>
          </div>
          <div class="bottom-stat-divider"></div>
          <div class="bottom-stat-item">
            <div class="stat-number">{{ formatNumber(dashboardStore.overviewStats.orders) }}</div>
            <div class="stat-text">Đơn hàng</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Products & Sales Row -->
    <div class="grid grid-cols-3" style="gap: 1.5rem;">
      <ProductList 
        title="Top sản phẩm bán chạy"
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
      
      <ProductList 
        title="Trạng thái đơn hàng"
        :products="dashboardStore.recentSales"
        :show-category="true"
        :show-status="true"
        :show-filter="true"
      />
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import MainLayout from '@/components/MainLayout.vue'
import SalesChart from '@/components/SalesChart.vue'
import DoughnutChart from '@/components/DoughnutChart.vue'
import ProductList from '@/components/ProductList.vue'

interface OverviewPeriod {
  label: string
  value: string
}

const dashboardStore = useDashboardStore()

const selectedOverviewPeriod = ref<OverviewPeriod>({ 
  label: '6 tháng gần đây', 
  value: '6months' 
})

const overviewPeriods: OverviewPeriod[] = [
  { label: '6 tháng gần đây', value: '6months' },
  { label: 'Tháng này', value: 'month' },
  { label: 'Tuần này', value: 'week' }
]

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num)
}

const getStatCardClass = (index: number): string => {
  const classes = ['card-orange', 'card-green', 'card-cyan', 'card-yellow']
  return classes[index] || 'card-orange'
}

const getIconBgClass = (index: number): string => {
  const classes = ['icon-bg-orange', 'icon-bg-green', 'icon-bg-cyan', 'icon-bg-yellow']
  return classes[index] || 'icon-bg-orange'
}

const getIconClass = (index: number): string => {
  const icons = ['pi pi-shopping-bag', 'pi pi-refresh', 'pi pi-dollar', 'pi pi-file']
  return icons[index] || 'pi pi-shopping-bag'
}

const getDetailedBgColor = (index: number): string => {
  const colors = ['#fef3c7', '#fee2e2', '#fef3c7']
  return colors[index] || '#fef3c7'
}

const getDetailedIconColor = (index: number): string => {
  const colors = ['#f59e0b', '#ef4444', '#f59e0b']
  return colors[index] || '#f59e0b'
}

const getDetailedIconClass = (index: number): string => {
  const icons = ['pi pi-chart-line', 'pi pi-credit-card', 'pi pi-wallet']
  return icons[index] || 'pi pi-chart-line'
}
</script>

<style scoped>
/* Stats Cards Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Compact Stat Cards */
.stat-card-compact {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.stat-card-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Card Color Variants */
.card-orange {
  border-left: 3px solid #fb923c;
  background: linear-gradient(135deg, #fff7ed 0%, white 100%);
}

.card-green {
  border-left: 3px solid #4ade80;
  background: linear-gradient(135deg, #f0fdf4 0%, white 100%);
}

.card-cyan {
  border-left: 3px solid #22d3ee;
  background: linear-gradient(135deg, #ecfeff 0%, white 100%);
}

.card-yellow {
  border-left: 3px solid #facc15;
  background: linear-gradient(135deg, #fefce8 0%, white 100%);
}

/* Icon Styling */
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 1.25rem;
  color: white;
}

.icon-bg-orange {
  background: #fb923c;
}

.icon-bg-green {
  background: #4ade80;
}

.icon-bg-cyan {
  background: #22d3ee;
}

.icon-bg-yellow {
  background: #facc15;
}

/* Stat Content */
.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label-compact {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.375rem;
}

.stat-value-compact {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.stat-change-compact {
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change-compact.positive {
  color: #16a34a;
}

.stat-change-compact.negative {
  color: #dc2626;
}

/* Detailed Stats Grid */
.detailed-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Detailed Stat Cards */
.detailed-stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.detailed-stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.detailed-stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.detailed-stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.detailed-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detailed-icon-wrapper i {
  font-size: 1.125rem;
}

.detailed-stat-change {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.detailed-stat-change.positive {
  color: #16a34a;
}

.detailed-stat-change.negative {
  color: #dc2626;
}

.detailed-stat-change i {
  font-size: 0.75rem;
}

/* Chart Container */
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

.customers-overview-section {
  margin-bottom: 2rem;
}

.section-subtitle {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #475569;
  margin: 0 0 1.5rem 0;
}

.overview-content-horizontal {
  display: flex;
  align-items: center;
  gap: 3rem;
  width: 100%;
}

.donut-chart-section {
  flex-shrink: 0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-chart-wrapper {
  width: 220px;
  height: 220px;
  position: relative;
}

.stats-cards-horizontal {
  display: flex;
  gap: 1.5rem;
  flex: 1;
}

.stat-card-horizontal {
  flex: 1;
  text-align: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.stat-card-horizontal:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-value-large {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label-green {
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.stat-label-orange {
  font-size: 0.875rem;
  color: #f59e0b;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.stat-badge-green {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.375rem 0.875rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #d1fae5;
  color: #059669;
}

.stat-badge-green i {
  font-size: 0.625rem;
}

.bottom-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 1.5rem 0 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.bottom-stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.stat-text {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.bottom-stat-divider {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
}

/* Responsive */
@media (max-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid,
  .detailed-stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>