<template>
  <MainLayout>
    <div class="animate-fade-in">
      <!-- Header - KHÔNG nằm trong reportContent -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <Button 
            icon="pi pi-arrow-left" 
            text 
            @click="router.back()"
          />
          <h2 style="font-size: 1.5rem; font-weight: 700; margin: 0;">Báo cáo tồn kho</h2>
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

      <!-- Filters - KHÔNG nằm trong reportContent -->
      <Card style="margin-bottom: 1.5rem;">
        <template #content>
          <div style="display: flex; gap: 1rem; align-items: end; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Loại sản phẩm</label>
              <Dropdown 
                v-model="selectedType" 
                :options="typeOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Tất cả loại"
                style="width: 100%;"
              />
            </div>
            <div style="flex: 1; min-width: 200px;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Trạng thái tồn kho</label>
              <Dropdown 
                v-model="selectedStockStatus" 
                :options="stockStatusOptions" 
                optionLabel="label" 
                optionValue="value"
                placeholder="Tất cả"
                style="width: 100%;"
              />
            </div>
            <div style="flex: 1; min-width: 200px;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Tìm kiếm</label>
              <InputText 
                v-model="searchQuery" 
                placeholder="Tên sản phẩm..."
                style="width: 100%;"
              />
            </div>
            <Button 
              label="Reset" 
              icon="pi pi-refresh"
              severity="secondary"
              @click="resetFilter"
            />
          </div>
        </template>
      </Card>

      <!-- Report Content - CHỈ phần này được xuất PDF -->
      <div ref="reportContent" class="report-content" style="background: white; padding: 2rem;">
        <!-- Report Header -->
        <div style="text-align: center; padding-bottom: 1rem;">
          <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem;">BÁO CÁO TỒN KHO</h1>
          <p style="font-size: 0.875rem; color: #666;">
            Ngày báo cáo: {{ formatDate(new Date()) }}
          </p>
        </div>

        <!-- Summary -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
          <div style="text-align: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 2rem; font-weight: 700; color: #6366f1;">
              {{ totalItems }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
              Tổng sản phẩm
            </div>
          </div>
          <div style="text-align: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 2rem; font-weight: 700; color: #10b981;">
              {{ inStockCount }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
              Còn hàng
            </div>
          </div>
          <div style="text-align: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">
              {{ lowStockCount }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
              Sắp hết
            </div>
          </div>
          <div style="text-align: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 2rem; font-weight: 700; color: #ef4444;">
              {{ outOfStockCount }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
              Hết hàng
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" style="text-align: center; padding: 3rem;">
          <ProgressSpinner />
        </div>

        <!-- Data Table -->
        <div v-else>
          <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Chi tiết tồn kho</h3>
          
          <table class="report-table" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Mã SP</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Hình ảnh</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Tên sản phẩm</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Loại</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Tồn kho</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Tồn an toàn</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Trạng thái</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Đơn giá</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Giá trị tồn</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredItems" :key="item.id" style="border-bottom: 1px solid #e5e7eb;">
                <!-- Mã SP -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">
                  <strong>#{{ item.id }}</strong>
                  <div style="font-size: 0.75rem; color: #666;">
                    {{ item.itemIndentifyId }}
                  </div>
                </td>
                
                <!-- Hình ảnh -->
                <td
                  style="
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                  "
                >
                  <div
                    style="
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      height: 100%;
                    "
                  >
                    <img 
                      v-if="item.picture && item.picture.length > 0"
                      :src="item.picture[0]" 
                      alt="Product"
                      style="
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border-radius: 4px;
                        display: block;
                      "
                      crossorigin="anonymous"
                    />
                    <span v-else style="color: #999; font-size: 0.75rem;">
                      Không có ảnh
                    </span>
                  </div>
                </td>

                
                <!-- Tên sản phẩm -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">
                  <div style="font-weight: 600;">
                    {{ item.eng?.partname || item.com?.name }}
                  </div>
                  <div style="font-size: 0.75rem; color: #666;">
                    {{ item?.eng?.partname || item?.com?.specifications || '-' }}
                  </div>
                </td>
                
                <!-- Loại -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">
                  <span 
                    :style="{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: item.eng ? '#dbeafe' : '#d1fae5',
                      color: item.eng ? '#1e40af' : '#065f46'
                    }"
                  >
                    {{ item.eng ? 'ENG' : 'COM' }}
                  </span>
                </td>
                
                <!-- Tồn kho -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb; text-align: center;">
                  <strong>{{ item.stockQty }}</strong> {{ item.unit }}
                </td>
                
                <!-- Tồn an toàn -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb; text-align: center;">
                  {{ item.saveQuantity }} {{ item.unit }}
                </td>
                
                <!-- Trạng thái -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">
                  <span 
                    :style="{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: getStockStatusColor(item).bg,
                      color: getStockStatusColor(item).text
                    }"
                  >
                    {{ getStockStatusLabel(item) }}
                  </span>
                </td>
                
                <!-- Đơn giá -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb; text-align: center;">
                  {{ formatCurrency(parseFloat(item.price || '0')) }}
                </td>
                
                <!-- Giá trị tồn -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb; text-align: center;">
                  <strong>
                    {{ formatCurrency(item.stockQty * parseFloat(item.price || '0')) }}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="filteredItems.length === 0" style="text-align: center; padding: 3rem;">
            <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
            <p style="color: #666;">Không có sản phẩm phù hợp</p>
          </div>

          <!-- Total Summary -->
          <div v-if="filteredItems.length > 0" style="margin-top: 2rem; padding: 1rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
              <div>
                <strong>Tổng số sản phẩm:</strong> {{ filteredItems.length }} sản phẩm
              </div>
              <div style="text-align: right;">
                <strong>Tổng giá trị tồn kho: </strong> 
                <span style="color: #10b981; font-size: 1.25rem; font-weight: 700;">
                  {{ formatCurrency(totalInventoryValue) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/components/MainLayout.vue'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Chart from 'primevue/chart'
import ProgressSpinner from 'primevue/progressspinner'
import { useItemStore } from '@/stores/itemStore'
import { itemAPI } from '@/services/itemAPI'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const router = useRouter()
const itemStore = useItemStore()

const loading = ref(false)
const downloading = ref(false)
const reportContent = ref<HTMLElement | null>(null)

// Filters
const selectedType = ref<string | null>(null)
const selectedStockStatus = ref<string | null>(null)
const searchQuery = ref('')

const typeOptions = [
  { label: 'Tất cả loại', value: null },
  { label: 'Engineer', value: 'eng' },
  { label: 'Consumer', value: 'com' }
]

const stockStatusOptions = [
  { label: 'Tất cả', value: null },
  { label: 'Còn hàng', value: 'in-stock' },
  { label: 'Sắp hết', value: 'low-stock' },
  { label: 'Hết hàng', value: 'out-of-stock' }
]

// Load data
const loadData = async () => {
  loading.value = true
  try {
    const data = await itemAPI.getAll()
    itemStore.setItems(data)
  } catch (error) {
    console.error('Error loading items:', error)
  } finally {
    loading.value = false
  }
}

// Reset filter
const resetFilter = () => {
  selectedType.value = null
  selectedStockStatus.value = null
  searchQuery.value = ''
}

// Computed values
const filteredItems = computed(() => {
  let items = itemStore.items

  // Filter by type
  if (selectedType.value === 'eng') {
    items = items.filter(item => item.eng !== null)
  } else if (selectedType.value === 'com') {
    items = items.filter(item => item.com !== null)
  }

  // Filter by stock status
  if (selectedStockStatus.value === 'in-stock') {
    items = items.filter(item => item.stockQty > item.saveQuantity)
  } else if (selectedStockStatus.value === 'low-stock') {
    items = items.filter(item => item.stockQty > 0 && item.stockQty <= item.saveQuantity)
  } else if (selectedStockStatus.value === 'out-of-stock') {
    items = items.filter(item => item.stockQty === 0)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => {
      const name = item.eng?.partname || item.com?.name || ''
      const location = item.eng?.location || item.com?.location || ''
      return name.toLowerCase().includes(query) || location.toLowerCase().includes(query)
    })
  }

  return items
})

const totalItems = computed(() => filteredItems.value.length)

const inStockCount = computed(() => 
  filteredItems.value.filter(item => item.stockQty > item.saveQuantity).length
)

const lowStockCount = computed(() => 
  filteredItems.value.filter(item => item.stockQty > 0 && item.stockQty <= item.saveQuantity).length
)

const outOfStockCount = computed(() => 
  filteredItems.value.filter(item => item.stockQty === 0).length
)

const totalInventoryValue = computed(() => {
  return filteredItems.value.reduce((total, item) => {
    const price = parseFloat(item.price || '0')
    return total + (item.stockQty * price)
  }, 0)
})

// Chart data
const doughnutChartData = computed(() => ({
  labels: ['Còn hàng', 'Sắp hết', 'Hết hàng'],
  datasets: [{
    data: [inStockCount.value, lowStockCount.value, outOfStockCount.value],
    backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
  }]
}))

const doughnutChartOptions = ref({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true
      }
    }
  }
})

const barChartData = computed(() => {
  const engCount = filteredItems.value.filter(item => item.eng !== null).length
  const comCount = filteredItems.value.filter(item => item.com !== null).length

  return {
    labels: ['Engineer', 'Consumer'],
    datasets: [{
      label: 'Số lượng sản phẩm',
      data: [engCount, comCount],
      backgroundColor: ['#3b82f6', '#10b981']
    }]
  }
})

const barChartOptions = ref({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
})

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

const getStockStatusLabel = (item: any) => {
  if (item.stockQty === 0) return 'Hết hàng'
  if (item.stockQty <= item.saveQuantity) return 'Sắp hết'
  return 'Còn hàng'
}

const getStockStatusColor = (item: any) => {
  if (item.stockQty === 0) {
    return { bg: '#fee2e2', text: '#991b1b' }
  }
  if (item.stockQty <= item.saveQuantity) {
    return { bg: '#fef3c7', text: '#92400e' }
  }
  return { bg: '#d1fae5', text: '#065f46' }
}

// Download PDF using html2canvas + jsPDF
// const downloadPDF = async () => {
//   if (!reportContent.value) return
  
//   downloading.value = true
//   try {
//     // Capture the content as canvas
//     const canvas = await html2canvas(reportContent.value, {
//       scale: 2, // Higher quality
//       useCORS: true, // Enable cross-origin images
//       logging: false,
//       backgroundColor: '#ffffff'
//     })
    
//     const imgData = canvas.toDataURL('image/png')
    
//     // Calculate PDF dimensions
//     const imgWidth = 210 // A4 width in mm
//     const pageHeight = 297 // A4 height in mm
//     const imgHeight = (canvas.height * imgWidth) / canvas.width
//     let heightLeft = imgHeight
    
//     // Create PDF
//     const pdf = new jsPDF('p', 'mm', 'a4')
//     let position = 0
    
//     // Add first page
//     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
//     heightLeft -= pageHeight
    
//     // Add additional pages if needed
//     while (heightLeft > 0) {
//       position = heightLeft - imgHeight
//       pdf.addPage()
//       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
//       heightLeft -= pageHeight
//     }
    
//     // Save PDF
//     pdf.save(`bao-cao-ton-kho-${new Date().getTime()}.pdf`)
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

.report-table {
  font-size: 0.875rem;
}

.report-table th {
  font-weight: 600;
  background: #f9fafb;
}

.report-table td {
  font-size: 0.875rem;
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