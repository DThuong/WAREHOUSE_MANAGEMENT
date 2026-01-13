<template>
  <MainLayout>
    <div class="animate-fade-in">
      <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0rem;"></h2>
      
      <div class="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem;">
              <i class="pi pi-chart-line" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Báo cáo doanh thu</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem;">Xem chi tiết doanh thu theo thời gian</p>
              <Button label="Xem báo cáo" outlined />
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem;">
              <i class="pi pi-shopping-cart" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Báo cáo đơn hàng</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem;">Thống kê đơn hàng và trạng thái</p>
              <Button label="Xem báo cáo" outlined />
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem;">
              <i class="pi pi-box" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Báo cáo tồn kho</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem;">Theo dõi hàng tồn kho theo sản phẩm</p>
              <Button label="Xem báo cáo" outlined />
            </div>
          </template>
        </Card>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <template #content>
            <div style="padding: 1.5rem;">
              <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">Total Revenue</p>
              <h3 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem;">$45,231</h3>
              <p style="font-size: 0.875rem; color: #10b981;">
                <i class="pi pi-arrow-up" style="font-size: 0.75rem;"></i> 12% from last month
              </p>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div style="padding: 1.5rem;">
              <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">Products Sold</p>
              <h3 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem;">1,234</h3>
              <p style="font-size: 0.875rem; color: #10b981;">
                <i class="pi pi-arrow-up" style="font-size: 0.75rem;"></i> 8% from last month
              </p>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div style="padding: 1.5rem;">
              <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">Low Stock Items</p>
              <h3 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem;">23</h3>
              <p style="font-size: 0.875rem; color: #ef4444;">
                <i class="pi pi-arrow-down" style="font-size: 0.75rem;"></i> 3% from last month
              </p>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div style="padding: 1.5rem;">
              <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">Out of Stock</p>
              <h3 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem;">5</h3>
              <p style="font-size: 0.875rem; color: #ef4444;">
                <i class="pi pi-arrow-down" style="font-size: 0.75rem;"></i> 2% from last month
              </p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Sales Overview Chart -->
      <Card style="margin-bottom: 1.5rem;">
        <template #content>
          <div style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.125rem; font-weight: 600;">Sales Overview</h3>
              <div style="display: flex; gap: 0.5rem;">
                <Button label="Randomize Data" text size="small" />
                <Button label="Show This Year Only" severity="danger" size="small" />
              </div>
            </div>
            <Chart type="line" :data="chartData" :options="chartOptions" style="height: 400px;" />
            <div style="text-align: right; margin-top: 1rem;">
              <a href="#" style="color: var(--primary-color); font-size: 0.875rem; text-decoration: none;">View detailed report</a>
            </div>
          </div>
        </template>
      </Card>

      <!-- Top Products -->
      <Card>
        <template #content>
          <div style="padding: 1.5rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem;">Top Products</h3>
            
            <div v-for="product in topProducts" :key="product.id" 
                 style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--gray-200);">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 48px; height: 48px; background: var(--gray-100); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  <i :class="product.icon" style="font-size: 1.5rem; color: var(--gray-600);"></i>
                </div>
                <div>
                  <p style="font-weight: 600; margin-bottom: 0.25rem;">{{ product.name }}</p>
                  <p style="font-size: 0.875rem; color: var(--gray-600);">{{ product.unitsSold }} units sold</p>
                </div>
              </div>
              <p style="font-weight: 700; font-size: 1.125rem;">${{ product.revenue.toLocaleString() }}</p>
            </div>

          </div>
        </template>
      </Card>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import MainLayout from '@/components/MainLayout.vue'
import Chart from 'primevue/chart'

const topProducts = ref([
  {
    id: 1,
    name: 'Gaming Joy Stick',
    unitsSold: 156,
    revenue: 3120,
    icon: 'pi pi-box'
  },
  {
    id: 2,
    name: 'Wireless Headphones',
    unitsSold: 134,
    revenue: 2680,
    icon: 'pi pi-box'
  },
  {
    id: 3,
    name: 'Smartwatch',
    unitsSold: 98,
    revenue: 1960,
    icon: 'pi pi-box'
  }
])

const chartData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'This Year',
      data: [42000, 53000, 47000, 61000, 74000, 65000, 74000, 82000, 78000, 86000, 97000, 97000],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Last Year',
      data: [38000, 45000, 47000, 56000, 60000, 63000, 68000, 70000, 65000, 75000, 80000, 84000],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '$' + (value / 1000) + 'k'
        }
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
})
</script>