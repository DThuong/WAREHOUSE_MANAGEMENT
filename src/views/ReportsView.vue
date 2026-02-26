<template>
  <MainLayout>
    <div class="animate-fade-in">
      <!-- <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">Báo cáo</h2> -->
      
      <div class="grid grid-cols-3 gap-4 mb-6">
        <!-- Báo cáo nhập kho -->
        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem;">
              <i class="pi pi-cart-arrow-down" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Báo cáo nhập kho</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem;">Xem chi tiết nhập kho theo thời gian</p>
              <Button 
                label="Xem báo cáo" 
                outlined 
                @click="navigateToReport('stockin')"
              />
            </div>
          </template>
        </Card>

        <!-- Báo cáo đơn hàng -->
        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem;">
              <i class="pi pi-shopping-cart" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Báo cáo đơn hàng</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem;">Thống kê đơn hàng và trạng thái</p>
              <Button 
                label="Xem báo cáo" 
                outlined 
                @click="navigateToReport('orders')"
              />
            </div>
          </template>
        </Card>

        <!-- Báo cáo tồn kho -->
        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem;">
              <i class="pi pi-box" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Báo cáo tồn kho</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem;">Theo dõi hàng tồn kho theo thời gian</p>
              <Button 
                label="Xem báo cáo" 
                outlined 
                @click="navigateToReport('inventory')"
              />
            </div>
          </template>
        </Card>
      </div>

      <!-- Sales Overview Chart -->
      <Card style="margin-bottom: 1.5rem;">
        <template #content>
          <div style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.125rem; font-weight: 600;">Tổng quan order vật tư (Status: Completed)</h3>
              <div style="display: flex; gap: 0.5rem;">
                <Button 
                  :label="showThisYearOnly ? 'Hiện tất cả' : 'Chỉ năm nay'" 
                  :severity="showThisYearOnly ? 'secondary' : 'danger'" 
                  size="small"
                  @click="toggleYearFilter"
                />
              </div>
            </div>
            
            <div v-if="loading" style="text-align: center; padding: 2rem;">
              <ProgressSpinner style="width: 50px; height: 50px;" />
            </div>
            
            <Chart 
              v-else
              type="line" 
              :data="chartData" 
              :options="chartOptions" 
              style="height: 400px;" 
            />
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
              <div style="font-size: 0.875rem; color: var(--gray-600);">
                <strong>Tổng orders hoàn thành:</strong> {{ totalCompletedOrders }}
              </div>
              <Button 
                label="Xem báo cáo chi tiết" 
                text 
                size="small"
                @click="navigateToReport('orders')"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/components/MainLayout.vue'
import Chart from 'primevue/chart'
import ProgressSpinner from 'primevue/progressspinner'
import { useOrderStore } from '@/stores/orderStore'
import { orderAPI } from '@/services/orderAPI'

const router = useRouter()
const orderStore = useOrderStore()

const loading = ref(false)
const showThisYearOnly = ref(true)

// Navigate to report pages
const navigateToReport = (type: string) => {
  router.push({ name: `${type.charAt(0).toUpperCase() + type.slice(1)}Report` })
}

// Load completed orders using filter API
const loadCompletedOrders = async () => {
  loading.value = true
  try {
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1
    
    // Load current year completed orders
    const currentYearStart = `${currentYear}-01-01`
    const currentYearEnd = `${currentYear}-12-31`
    const currentYearOrders = await orderAPI.filterOrders({
      fromDate: currentYearStart,
      toDate: currentYearEnd,
      status: 'Completed'
    })
    
    // Load last year if needed
    let allOrders = currentYearOrders
    if (!showThisYearOnly.value) {
      const lastYearStart = `${lastYear}-01-01`
      const lastYearEnd = `${lastYear}-12-31`
      const lastYearOrders = await orderAPI.filterOrders({
        fromDate: lastYearStart,
        toDate: lastYearEnd,
        status: 'Completed'
      })
      allOrders = [...currentYearOrders, ...lastYearOrders]
    }
    
    orderStore.setOrders(allOrders)
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    loading.value = false
  }
}

// Get completed orders only
const completedOrders = computed(() => 
  orderStore.orders.filter(order => order.status === 'Completed')
)

const totalCompletedOrders = computed(() => completedOrders.value.length)

// Process chart data
const getMonthlyData = (year: number) => {
  const monthlyData = new Array(12).fill(0)
  
  completedOrders.value.forEach(order => {
    const orderDate = new Date(order.orderDate)
    if (orderDate.getFullYear() === year) {
      const month = orderDate.getMonth()
      // Calculate total value of order
      const orderValue = order.orderDetails.reduce((sum, detail) => {
        const price = parseFloat(detail.item.price) || 0
        return sum + (detail.orderQty * price)
      }, 0)
      monthlyData[month] += orderValue
    }
  })
  
  return monthlyData
}

const currentYear = new Date().getFullYear()
const lastYear = currentYear - 1

const chartData = computed(() => {
  const datasets = [
    {
      label: `Năm ${currentYear}`,
      data: getMonthlyData(currentYear),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
  
  if (!showThisYearOnly.value) {
    datasets.push({
      label: `Năm ${lastYear}`,
      data: getMonthlyData(lastYear),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    })
  }
  
  return {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets
  }
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      align: 'end' as const,
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(context.parsed.y)
          }
          return label
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          return new Intl.NumberFormat('vi-VN', {
            notation: 'compact',
            compactDisplay: 'short'
          }).format(value) + ' ₫'
        }
      }
    }
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false
  }
})

const toggleYearFilter = () => {
  showThisYearOnly.value = !showThisYearOnly.value
  loadCompletedOrders()
}

onMounted(() => {
  loadCompletedOrders()
})
</script>