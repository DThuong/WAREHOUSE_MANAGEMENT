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
          <h2 style="font-size: 1.5rem; font-weight: 700; margin: 0;">Báo cáo nhập kho</h2>
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
          <div class="filter-grid">

            <!-- From Date -->
            <div class="field">
              <label>Từ ngày</label>
              <Calendar 
                v-model="fromDate" 
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                :stepMinute="15"
                class="w-full"
                :inputStyle="{ width: '100%' }"
              />
            </div>

            <!-- To Date -->
            <div class="field">
              <label>Đến ngày</label>
              <Calendar 
                v-model="toDate" 
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                :stepMinute="15"
                class="w-full"
                :inputStyle="{ width: '100%' }"
              />
            </div>

            <!-- Buttons -->
            <div class="actions">
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

          </div>
        </template>
      </Card>


      <!-- Report Content - CHỈ phần này được xuất PDF -->
      <div ref="reportContent" class="report-content" style="background: white; padding: 2rem;">
        <!-- Report Header -->
        <div style="text-align: center; padding-bottom: 1rem;">
          <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem;">BÁO CÁO NHẬP KHO</h1>
          <p style="font-size: 0.875rem; color: #666;">
            Từ {{ formatDate(fromDate) }} đến {{ formatDate(toDate) }}
          </p>
          <p style="font-size: 0.875rem; color: #666;">
            Ngày in: {{ formatDate(new Date()) }}
          </p>
        </div>

        <!-- Summary -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
          <div style="text-align: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 2rem; font-weight: 700; color: #6366f1;">
              {{ filteredStockins.length ? filteredStockins.length : 0 }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
              Tổng số lần nhập
            </div>
          </div>
          <div style="text-align: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 2rem; font-weight: 700; color: #10b981;">
              {{ totalItems }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
              Tổng số sản phẩm
            </div>
          </div>
          <div style="text-align: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">
              {{ totalQuantity }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">
              Tổng số lượng nhập
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" style="text-align: center; padding: 3rem;">
          <ProgressSpinner />
        </div>

        <!-- Data Table -->
        <div v-else>
          <table class="report-table" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Mã phiếu</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Ngày nhập</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Người nhập</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Sản phẩm</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Hình ảnh</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Đơn giá</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Số lượng</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Thành tiền</th>
                <th style="padding: 0.75rem; text-align: center; border: 1px solid #e5e7eb;">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="stockin in filteredStockins" :key="stockin.id">
                <tr v-for="(detail, index) in stockin.stockInDetails" :key="detail.id" 
                    style="border-bottom: 1px solid #e5e7eb;">
                  <!-- Merge cells for first row -->
                  <td v-if="index === 0" 
                      :rowspan="stockin.stockInDetails.length" 
                      style="padding: 0.75rem; border: 1px solid #e5e7eb; vertical-align: top;">
                    <strong>#{{ stockin.id }}</strong>
                  </td>
                  <td v-if="index === 0" 
                      :rowspan="stockin.stockInDetails.length" 
                      style="padding: 0.75rem; border: 1px solid #e5e7eb; vertical-align: top;">
                    {{ formatDate(stockin.stockInDate) }}
                  </td>
                  <td v-if="index === 0" 
                      :rowspan="stockin.stockInDetails.length" 
                      style="padding: 0.75rem; border: 1px solid #e5e7eb; vertical-align: top;">
                    {{ stockin.account.username }}
                  </td>
                  
                  <!-- Product info -->
                  <td style="padding: 0.75rem; border: 1px solid #e5e7eb; text-align: left;">
                    <div style="font-weight: 600;">
                      {{ detail.item.eng?.partname || detail.item.com?.name }}
                    </div>
                    <div style="font-size: 0.75rem; color: #666;">
                      Id: {{ detail.item.itemIndentifyId }}
                    </div>
                    <div style="font-size: 0.75rem; color: #666;">
                      {{ detail.item?.eng?.partname || detail.item?.com?.specifications || '-' }}
                    </div>
                  </td>
                  
                  <!-- Image -->
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
                        v-if="detail.item.picture && detail.item.picture.length > 0"
                        :src="detail.item.picture[0]"
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
                  
                  <!-- Price -->
                  <td style="padding: 0.75rem; border: 1px solid #e5e7eb; text-align: center;">
                    {{ formatCurrency(parseFloat(detail.item.price || '0')) }}
                  </td>
                  
                  <!-- Quantity -->
                  <td style="padding: 0.75rem; border: 1px solid #e5e7eb; text-align: center;">
                    <strong>{{ detail.quantity }}</strong> {{ detail.item.unit }}
                  </td>
                  
                  <!-- Total -->
                  <td style="padding: 0.75rem; border: 1px solid #e5e7eb; text-align: center;">
                    <strong>{{ formatCurrency(detail.quantity * parseFloat(detail.item.price || '0')) }}</strong>
                  </td>
                  
                  <!-- Note (merged) -->
                  <td v-if="index === 0" 
                      :rowspan="stockin.stockInDetails.length" 
                      style="padding: 0.75rem; border: 1px solid #e5e7eb; vertical-align: top; text-align: left;">
                    {{ stockin.note || '-' }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="filteredStockins.length === 0" style="text-align: center; padding: 3rem;">
            <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
            <p style="color: #666;">Không có dữ liệu nhập kho trong khoảng thời gian này</p>
          </div>
          
          <!-- Total Summary -->
          <div v-if="filteredStockins.length > 0" style="margin-top: 2rem; padding: 1rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px;">
            <div style="text-align: right;">
              <strong style="font-size: 1.125rem;">Tổng giá trị nhập kho: </strong>
              <span style="color: #10b981; font-size: 1.5rem; font-weight: 700;">
                {{ formatCurrency(totalValue) }}
              </span>
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
import Calendar from 'primevue/calendar'
import ProgressSpinner from 'primevue/progressspinner'
import { useStockinStore } from '@/stores/stockinStore'
import { stockinAPI } from '@/services/stockinAPI'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const router = useRouter()
const stockinStore = useStockinStore()

const loading = ref(false)
const downloading = ref(false)
const reportContent = ref<HTMLElement | null>(null)

// Date filters
const fromDate = ref<Date>(new Date(new Date().getFullYear(), 0, 1, 0, 0, 0))
const toDate = ref<Date>(new Date(new Date().setHours(23, 59, 59)))

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
    
    const data = await stockinAPI.filterStockin(from, to)
    stockinStore.setStockins(data)
  } catch (error) {
    console.error('Error loading stockins:', error)
  } finally {
    loading.value = false
  }
}

// Apply filter
const applyFilter = async () => {
  loadData()
}

// Reset filter
const resetFilter = () => {
  fromDate.value = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0)
  toDate.value = new Date(new Date().setHours(23, 59, 59))
  loadData()
}

// Computed values
const filteredStockins = computed(() => stockinStore.stockins)

const totalItems = computed(() => {
  if (!Array.isArray(filteredStockins.value)) return 0
  
  return filteredStockins.value.reduce((total, stockin) => {
    return total + (stockin.stockInDetails?.length || 0)
  }, 0)
})

const totalQuantity = computed(() => {
  if (!Array.isArray(filteredStockins.value)) return 0
  
  return filteredStockins.value.reduce((total, stockin) => {
    return total + (stockin.stockInDetails?.reduce((sum, detail) => sum + detail.quantity, 0) || 0)
  }, 0)
})

const totalValue = computed(() => {
  if (!Array.isArray(filteredStockins.value)) return 0
  
  return filteredStockins.value.reduce((total, stockin) => {
    return total + (stockin.stockInDetails?.reduce((sum, detail) => {
      const price = parseFloat(detail.item.price || '0')
      return sum + (detail.quantity * price)
    }, 0) || 0)
  }, 0)
})

// Format functions
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
//     pdf.save(`bao-cao-nhap-kho-${new Date().getTime()}.pdf`)
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

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}

.field {
  width: 100%;
  min-width: 0; /* Quan trọng cho grid items */
}

.field label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
}

/* FIX: Kéo dài Calendar input full width */
:deep(.p-calendar) {
  display: flex;  
  width: 100%;
}

:deep(.p-calendar .p-inputtext) {
  flex: 1 !important;
  width: 100% !important;
}

:deep(.p-calendar .p-button) {
  flex-shrink: 0; /* Icon button không bị co lại */
}

.actions {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
}

</style>