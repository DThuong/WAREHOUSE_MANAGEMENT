<template>
  <MainLayout>
    <div class="animate-fade-in">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <Button 
            icon="pi pi-arrow-left" 
            text 
            @click="router.back()"
          />
          <h2 style="font-size: 1.5rem; font-weight: 700; margin: 0;">Báo cáo đơn hàng</h2>
        </div>
        
        <div style="display: flex; gap: 0.5rem;">
          <!-- <Button 
            label="Tải PDF" 
            icon="pi pi-download" 
            @click="downloadPDF"
            :loading="downloading"
          /> -->
          <Button 
            label="In báo cáo" 
            icon="pi pi-print" 
            severity="secondary"
            @click="printReport"
          />
        </div>
      </div>

      <!-- Filters -->
      <Card style="margin-bottom: 1.5rem;">
        <template #content>
          <div style="display: flex; gap: 1rem; align-items: end; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Từ ngày</label>
              <Calendar 
                v-model="fromDate" 
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                :stepMinute="15"
                style="width: 100%;"
              />
            </div>
            <div style="flex: 1; min-width: 200px;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Đến ngày</label>
              <Calendar 
                v-model="toDate" 
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                :stepMinute="15"
                style="width: 100%;"
              />
            </div>
            <div style="flex: 1; min-width: 200px;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Trạng thái</label>
              <Dropdown 
                v-model="selectedStatus" 
                :options="statusOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Tất cả trạng thái"
                style="width: 100%;"
              />
            </div>
            <Button 
              label="Lọc" 
              icon="pi pi-filter"
              @click="applyFilter"
              :loading="loading"
            />
            <Button 
              label="Reset" 
              icon="pi pi-refresh"
              severity="secondary"
              @click="resetFilter"
            />
          </div>
        </template>
      </Card>

      <!-- Report Content -->
      <Card>
        <template #content>
          <div ref="reportContent" class="report-content" style="padding: 2rem;">
            <!-- Report Header -->
            <div style="text-align: center; padding-bottom: 1rem;">
              <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem;">BÁO CÁO ĐƠN HÀNG</h1>
              <p style="font-size: 0.875rem; color: #666;">
                Từ {{ formatDate(fromDate) }} đến {{ formatDate(toDate) }}
              </p>
              <p v-if="selectedStatus" style="font-size: 0.875rem; color: #666;">
                Trạng thái: {{ getStatusLabel(selectedStatus) }}
              </p>
              <p style="font-size: 0.875rem; color: #666;">
                Ngày in: {{ formatDate(new Date()) }}
              </p>
            </div>

            <!-- Summary -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
              <div style="text-align: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">
                  {{ filteredOrders.length }}
                </div>
                <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
                  Tổng đơn hàng
                </div>
              </div>
              <div style="text-align: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">
                  {{ pendingCount }}
                </div>
                <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
                  Chờ duyệt
                </div>
              </div>
              <div style="text-align: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;">
                  {{ approvedCount }}
                </div>
                <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
                  Đã duyệt
                </div>
              </div>
              <div style="text-align: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: 700; color: #10b981;">
                  {{ completedCount }}
                </div>
                <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
                  Hoàn thành
                </div>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" style="text-align: center; padding: 3rem;">
              <ProgressSpinner />
            </div>

            <!-- Data Table -->
            <div v-else>
            <table
                class="report-table"
                style="
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                text-align: center;
                word-wrap: break-word;
                "
            >
                <thead>
                <tr style="background:#f9fafb">
                    <th style="width:90px; text-align:center ">Mã ĐH</th>
                    <th style="width:120px; text-align:center">Ngày đặt</th>
                    <th style="width:140px; text-align:center">Người đặt</th>
                    <th style="width:120px; text-align:center">Bộ phận</th>
                    <th style="width:90px; text-align:center">Hình ảnh</th>
                    <th style="width:120px; text-align:center">Sản phẩm</th>
                    <th style="width:90px; text-align:center">Đơn giá</th>
                    <th style="width:80px; text-align:center">SL</th>
                    <th style="width:130px; text-align:center">Thành tiền</th>
                    <th style="width:120px; text-align:center">Trạng thái</th>
                </tr>
                </thead>

                <tbody>
                <template v-for="order in filteredOrders" :key="order.id">
                    <template v-if="order.orderDetails?.length">
                    <tr
                        v-for="(detail, index) in order.orderDetails"
                        :key="detail.id"
                    >
                        <!-- Order info (rowspan) -->
                        <td v-if="index === 0" :rowspan="order.orderDetails.length">
                        <strong>#{{ order.id }}</strong>
                        </td>

                        <td v-if="index === 0" :rowspan="order.orderDetails.length">
                        {{ formatDate(order.orderDate) }}
                        </td>

                        <td v-if="index === 0" :rowspan="order.orderDetails.length">
                        {{ order.nameWorker || '-' }}
                        </td>

                        <td v-if="index === 0" :rowspan="order.orderDetails.length">
                        {{ order.account?.department || '-' }}
                        </td>

                        <!-- Image -->
                        <td style="text-align:center">
                        <img
                            v-if="detail.item?.picture?.length"
                            :src="detail.item.picture[0]"
                            style="width:60px;height:60px;object-fit:cover;border-radius:4px"
                            crossorigin="anonymous"
                        />
                        <span v-else class="muted-text">Không có ảnh</span>
                        </td>

                        <!-- Product -->
                        <td style="text-align: left;">
                        <div class="product-name">
                            {{ detail.item?.eng?.partname || detail.item?.com?.name || '-' }}
                        </div>
                        <div class="muted-text">
                            Id: {{ detail.item?.itemIndentifyId || '-' }}
                        </div>
                        <div class="muted-text">
                            {{ detail.item?.eng?.partname || detail.item?.com?.specifications || '-' }}
                        </div>
                        </td>

                        <!-- Price -->
                        <td class="text-right" style="text-align: center;">
                        {{ formatCurrency(Number(detail.item?.price || 0)) }}
                        </td>

                        <!-- Qty -->
                        <td class="text-right" style="text-align: center;">
                        <strong>{{ detail.orderQty }}</strong>
                        {{ detail.item?.unit || '' }}
                        </td>

                        <!-- Total -->
                        <td class="text-right" style="text-align:center;">
                        <strong>
                            {{ formatCurrency(detail.orderQty * Number(detail.item?.price || 0)) }}
                        </strong>
                        </td>

                        <!-- Status -->
                        <td v-if="index === 0" :rowspan="order.orderDetails.length">
                        <span
                            class="status-badge"
                            :style="{
                            background: getStatusColor(order.status)
                            }"
                        >
                            {{ getStatusLabel(order.status) }}
                        </span>
                        </td>
                    </tr>
                    </template>
                </template>
                </tbody>
            </table>

            <!-- Empty state -->
            <div
                v-if="filteredOrders.length === 0"
                style="text-align:center;padding:3rem"
            >
                <i class="pi pi-inbox" style="font-size:3rem;color:#ccc"></i>
                <p class="muted-text">Không có đơn hàng trong khoảng thời gian này</p>
            </div>

            <!-- Summary -->
            <div
                v-if="filteredOrders.length"
                style="
                margin-top:2rem;
                padding:1rem;
                background:#f9fafb;
                border:1px solid #e5e7eb;
                border-radius:4px;
                text-align:right;
                "
            >
                <strong>Tổng giá trị đơn hàng: </strong>
                <span style="color:#10b981;font-size:1.5rem;font-weight:700">
                {{ formatCurrency(totalValue) }}
                </span>
            </div>
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
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import ProgressSpinner from 'primevue/progressspinner'
import { useOrderStore } from '@/stores/orderStore'
import { orderAPI } from '@/services/orderAPI'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const router = useRouter()
const orderStore = useOrderStore()

const loading = ref(false)
const downloading = ref(false)
const reportContent = ref<HTMLElement | null>(null)

// Date filters
const fromDate = ref<Date>(new Date(new Date().getFullYear(), 0, 1, 0, 0, 0))
const toDate = ref<Date>(new Date(new Date().setHours(23, 59, 59)))
const selectedStatus = ref<string | null>(null)

const statusOptions = [
  { label: 'Tất cả trạng thái', value: null },
  { label: 'Chờ duyệt', value: 'Pending' },
  { label: 'Đã duyệt', value: 'Approved' },
  { label: 'Hoàn thành', value: 'Completed' },
  { label: 'Từ chối', value: 'Rejected' }
]
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return '#f59e0b'
    case 'Approved': return '#3b82f6'
    case 'Completed': return '#10b981'
    case 'Rejected': return '#ef4444'
    default: return '#6b7280'
  }
}

// Format date to ISO string with time
const formatDateTimeForAPI = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
// Load data with filter
const loadData = async () => {
  loading.value = true
  try {
    const from = formatDateTimeForAPI(fromDate.value)
    const to = formatDateTimeForAPI(toDate.value)
    
    const data = await orderAPI.filterOrders({
      fromDate: from,
      toDate: to,
      status: selectedStatus.value || undefined
    })
    
    orderStore.setOrders(data)
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    loading.value = false
  }
}

// Apply filter
const applyFilter = () => {
  loadData()
}

// Reset filter
const resetFilter = () => {
  fromDate.value = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0)
  toDate.value = new Date(new Date().setHours(23, 59, 59))
  selectedStatus.value = null
  loadData()
}

// Computed values
const filteredOrders = computed(() => {
  return orderStore.orders.sort((a, b) => 
    new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  )
})

const pendingCount = computed(() => 
  filteredOrders.value.filter(o => o.status === 'Pending').length
)

const approvedCount = computed(() => 
  filteredOrders.value.filter(o => o.status === 'Approved').length
)

const completedCount = computed(() => 
  filteredOrders.value.filter(o => o.status === 'Completed').length
)

const rejectedCount = computed(() => 
  filteredOrders.value.filter(o => o.status === 'Rejected').length
)

const totalValue = computed(() => {
  return filteredOrders.value.reduce((total, order) => {
    return total + calculateOrderTotal(order)
  }, 0)
})

// Pie chart data
const pieChartData = computed(() => ({
  labels: ['Chờ duyệt', 'Đã duyệt', 'Hoàn thành', 'Từ chối'],
  datasets: [{
    data: [pendingCount.value, approvedCount.value, completedCount.value, rejectedCount.value],
    backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
  }]
}))

// Helper functions
const formatDate = (date: Date | string) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

const calculateOrderTotal = (order: any) => {
  if (!order.orderDetails || order.orderDetails.length === 0) return 0
  
  return order.orderDetails.reduce((sum: number, detail: any) => {
    const price = parseFloat(detail.item.price) || 0
    return sum + (detail.orderQty * price)
  }, 0)
}

const getStatusLabel = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option?.label || status
}


// Download PDF using html2canvas + jsPDF
// const downloadPDF = async () => {
//   if (!reportContent.value) return
  
//   downloading.value = true
//   try {
//     const canvas = await html2canvas(reportContent.value, {
//       scale: 2,
//       useCORS: true,
//       logging: false,
//       backgroundColor: '#ffffff'
//     })
    
//     const imgData = canvas.toDataURL('image/png')
//     const imgWidth = 210
//     const pageHeight = 297
//     const imgHeight = (canvas.height * imgWidth) / canvas.width
//     let heightLeft = imgHeight
    
//     const pdf = new jsPDF('p', 'mm', 'a4')
//     let position = 0
    
//     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
//     heightLeft -= pageHeight
    
//     while (heightLeft > 0) {
//       position = heightLeft - imgHeight
//       pdf.addPage()
//       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
//       heightLeft -= pageHeight
//     }
    
//     pdf.save(`bao-cao-don-hang-${new Date().getTime()}.pdf`)
//   } catch (error) {
//     console.error('Error generating PDF:', error)
//   } finally {
//     downloading.value = false
//   }
// }

// Print report
const printReport = () => {
  window.print()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.report-content {
  background: white;
}
.report-table th,
.report-table td {
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  vertical-align: middle;
  height: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-right {
  text-align: right;
}

.muted-text {
  font-size: 0.75rem;
  color: #666;
}

.product-name {
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
}

@media print {
  /* Ẩn toàn bộ sidebar và navbar */
  :deep(.sidebar),
  :deep(.navbar),
  :deep(aside),
  :deep(header) {
    display: none !important;
  }
  
  /* Ẩn main-content wrapper và chỉ show report-content */
  :deep(.main-content) {
    margin: 0 !important;
    padding: 0 !important;
  }
  
  :deep(.content-area) {
    padding: 0 !important;
  }
  
  /* Ẩn animate-fade-in children trừ Card cuối */
  :deep(.animate-fade-in) > *:not(:last-child) {
    display: none !important;
  }
  
  /* Ẩn Card wrapper chỉ giữ nội dung bên trong */
  :deep(.p-card) {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  :deep(.p-card-body),
  :deep(.p-card-content) {
    padding: 0 !important;
  }
  
  .report-content {
    background: white !important;
    padding: 1rem !important;
  }
  
  .report-table {
    font-size: 10pt !important;
  }
}
</style>