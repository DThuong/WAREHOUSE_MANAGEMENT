<template>
  <div class="line-machine-chart">
    <!-- FILTER BAR -->
    <Card class="!mb-4">
      <template #content>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4">
            <h3 class="font-bold text-lg !m-0 flex items-center gap-2">
              <i class="pi pi-chart-bar text-primary"></i>
              {{ tr('dashboard.tabs.lineMachineChart', 'Phân tích Line & Máy') }}
            </h3>

            <div class="w-px h-8 bg-slate-200 !mx-2 hidden md:block"></div>

            <div class="flex items-center gap-2">
              <TimeRangeFilter 
                :compact="true" 
                :showLabels="false"
                @update:fromDate="val => fromDate = val"
                @update:toDate="val => toDate = val"
              />
            </div>
            
            <div class="flex items-center gap-2">
              <Dropdown
                v-model="selectedArea"
                :options="areaOptions"
                optionLabel="label"
                optionValue="value"
                class="w-[140px]"
              />
              <Dropdown
                v-model="selectedLine"
                :options="lineOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="tr('lineMachine.analytics.selectMachine', 'Chọn Line...')"
                showClear
                class="w-[200px]"
              />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button
              icon="pi pi-file-excel"
              label="Excel"
              severity="success"
              outlined
              :loading="exporting"
              @click="onExportExcel"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center !p-4 bg-white rounded-xl shadow-sm border border-slate-100">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="!mt-4 text-slate-500 font-medium">{{ tr('common.loading', 'Đang tải dữ liệu...') }}</span>
    </div>

    <div v-else>
      <!-- Insights -->
      <div class="flex flex-col md:flex-row gap-4 !mb-4">
        <!-- Top Quantity -->
        <div 
          class="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 !p-4 flex items-start gap-4 cursor-pointer hover:border-blue-300 transition-colors"
          @click="topQuantityMachine.rawMachine ? showMachineDetail(topQuantityMachine.rawMachine, topQuantityMachine.line) : null"
        >
          <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <i class="pi pi-sort-amount-up text-xl"></i>
          </div>
          <div>
            <h3 class="text-slate-500 text-sm font-medium !mb-1">{{ tr('dashboard.insights.topQuantity', 'Tiêu thụ nhiều vật tư nhất') }}</h3>
            <div class="text-xl font-bold text-slate-800">{{ topQuantityMachine.name || '-' }}</div>
            <div class="text-sm text-blue-600 font-medium !mt-1">
              {{ formatNumber(topQuantityMachine.quantity) }} <span class="text-slate-400 font-normal">sản phẩm</span>
            </div>
          </div>
        </div>

        <!-- Top Money -->
        <div 
          class="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 !p-4 flex items-start gap-4 cursor-pointer hover:border-emerald-300 transition-colors"
          @click="topMoneyMachine.rawMachine ? showMachineDetail(topMoneyMachine.rawMachine, topMoneyMachine.line) : null"
        >
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <i class="pi pi-money-bill text-xl"></i>
          </div>
          <div class="flex-1">
            <h3 class="text-slate-500 text-sm font-medium !mb-1">{{ tr('dashboard.insights.topMoney', 'Tiêu thụ nhiều tiền nhất') }}</h3>
            <div class="text-xl font-bold text-slate-800">{{ topMoneyMachine.name || '-' }}</div>
            <div class="text-sm text-emerald-600 font-medium !mt-1">
              {{ formatCurrency(topMoneyMachine.money) }}
            </div>
          </div>
        </div>
      </div>

      <!-- CHART -->
      <Card class="!mb-4">
        <template #content>
          <div v-if="chartData.labels.length === 0" class="flex flex-col items-center justify-center !p-4 text-slate-400">
            <i class="pi pi-inbox text-4xl !mb-3"></i>
            <p>{{ tr('common.noData', 'Không có dữ liệu') }}</p>
          </div>
          <div v-else class="h-[400px]">
            <Chart type="bar" :data="chartData" :options="chartOptions" class="h-full w-full" @select="onChartClick" />
          </div>
        </template>
      </Card>

      <!-- DETAIL TABLE -->
      <div v-if="selectedMachine" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" ref="detailTableRef">
        <div class="!px-6 !py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h4 class="font-bold text-slate-800 text-lg !m-0 flex items-center gap-2">
              <i class="pi pi-list text-primary"></i>
              Chi tiết vật tư: <span class="text-primary">{{ selectedMachine }}</span>
            </h4>
            <p class="text-sm text-slate-500 !mt-1 !mb-0 font-medium">Line: {{ selectedMachineLine }}</p>
          </div>
          <Button icon="pi pi-times" text rounded severity="secondary" @click="selectedMachine = null" />
        </div>
        
        <DataTable
          :value="selectedMachineItems"
          class="p-datatable-sm"
          responsiveLayout="scroll"
          stripedRows
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50]"
        >
          <template #empty>
            <div class="!p-4 text-center text-slate-500">{{ tr('common.noData', 'Không có dữ liệu') }}</div>
          </template>
          
          <Column :header="tr('reports.chart.col.item', 'Vật tư')" style="min-width: 300px">
            <template #body="{ data }">
              <div class="flex items-center gap-3">
                <img v-if="data.itemImage" :src="data.itemImage" class="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                <div v-else class="w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-xs text-slate-400">N/A</div>
                <div class="flex flex-col">
                  <span class="font-bold text-slate-800 text-sm">{{ data.itemName }}</span>
                  <span class="text-xs text-slate-500 font-mono bg-slate-100 !px-2 !py-1 rounded w-fit">{{ data.itemCode }}</span>
                </div>
              </div>
            </template>
          </Column>
          
          <Column :header="tr('common.quantity', 'Số lượng')" class="text-right" style="width: 150px">
            <template #body="{ data }">
              <span class="font-bold text-blue-600 tabular-nums">{{ formatNumber(data.quantity) }}</span>
              <span class="text-xs text-slate-400 !ml-1">{{ data.unit }}</span>
            </template>
          </Column>

          <Column :header="tr('reports.chart.col.totalValue', 'Tổng tiền')" class="text-right" style="width: 180px">
            <template #body="{ data }">
              <span class="font-semibold text-slate-700 tabular-nums">{{ formatCurrency(data.totalValue) }}</span>
            </template>
          </Column>

          <Column :header="tr('reports.chart.col.orderDate', 'Ngày xuất')" style="width: 180px">
            <template #body="{ data }">
              <span class="text-sm text-slate-600">{{ formatDate(data.orderDate) }}</span>
            </template>
          </Column>
          
          <template #footer>
            <div class="flex justify-between items-center !px-4 !py-3 bg-slate-50 border-t border-slate-200">
              <span class="font-bold text-slate-700">Tổng cộng</span>
              <div class="flex items-center gap-6">
                <div class="flex flex-col items-end">
                  <span class="text-[10px] text-slate-500 uppercase tracking-wider">Tổng SL</span>
                  <span class="font-bold text-blue-600">{{ formatNumber(selectedMachineTotalQty) }}</span>
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-[10px] text-slate-500 uppercase tracking-wider">Tổng Giá trị</span>
                  <span class="font-bold text-emerald-600">{{ formatCurrency(selectedMachineTotalValue) }}</span>
                </div>
              </div>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Chart from 'primevue/chart'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressSpinner from 'primevue/progressspinner'
import TimeRangeFilter from '@/components/common/TimeRangeFilter.vue'
import { orderAPI } from '@/services/orderAPI'
import { useLineMachineStore } from '@/stores/line_machine'
import * as XLSX from 'xlsx'
import { Order, OrderStatus } from '@/types/order.types'

const { t } = useI18n()

const tr = (key: string, fallback: string) => {
  const translated = t(key)
  return translated === key ? fallback : translated
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
}

// Filters
const fromDate = ref<string>('')
const toDate = ref<string>('')
const selectedArea = ref<string>('SMD')
const areaOptions = computed(() => [
  { label: tr('reports.common.areaAll', 'Tất cả Xưởng'), value: 'ALL' },
  { label: 'SMD', value: 'SMD' },
  { label: 'MAINLINE', value: 'MAINLINE' }
])
const selectedLine = ref<string | null>(null)
const lineMachineStore = useLineMachineStore()
const lineOptions = computed(() => {
  let lines = lineMachineStore.lines
  if (selectedArea.value !== 'ALL') {
    lines = lines.filter(l => (l.areaPart || '').toLowerCase() === selectedArea.value.toLowerCase())
  }
  return lines.map(line => ({
    label: line.lineName,
    value: line.lineName
  }))
})

// State
const loading = ref(false)
const exporting = ref(false)
const orders = ref<Order[]>([])
const chartData = ref<any>({ labels: [], datasets: [] })
const chartOptions = ref<any>({})

// Drill down state
const selectedMachine = ref<string | null>(null)
const selectedMachineLine = ref<string>('')
const selectedMachineItems = ref<any[]>([])
const detailTableRef = ref<any>(null)

// Computed Insights
const machineStats = computed(() => {
  const stats = new Map<string, {
    machineName: string,
    lineName: string,
    quantity: number,
    money: number,
    items: any[]
  }>()

  const lineAreaMap = new Map<number, string>()
  lineMachineStore.lines.forEach(l => {
    lineAreaMap.set(l.id, l.areaPart)
  })

  orders.value.forEach(order => {
    // Chỉ lấy đơn hàng Completed
    if (order.status !== OrderStatus.COMPLETED) return;

    order.orderDetails.forEach(detail => {
      let machinesList = []
      if (detail.machine) machinesList.push(detail.machine)
      if (detail.machines && Array.isArray(detail.machines)) machinesList.push(...detail.machines)
      
      if (machinesList.length === 0) return

      machinesList.forEach(machine => {
        const machineName = machine.machineName || 'Unknown Machine'
        const lineName = machine.line?.lineName || machine.lineName || 'Unknown Line'
        
        let area = machine.line?.areaPart || lineAreaMap.get(machine.lineId) || ''
        if (!area && lineName) {
          const lineObj = lineMachineStore.lines.find(l => l.lineName === lineName)
          if (lineObj) area = lineObj.areaPart
        }
        if (selectedArea.value !== 'ALL' && area.toLowerCase() !== selectedArea.value.toLowerCase()) return;

        // Lọc theo Line nếu có
        if (selectedLine.value && lineName !== selectedLine.value) return;

        const key = `${lineName}_${machineName}`
        const qty = (detail.orderQty || 0) / machinesList.length
        const price = detail.item?.price || 0
        const value = (qty * Number(price))
        
        const itemImage = detail.item?.picture?.length ? 
          (detail.item.picture[0].startsWith('http') ? detail.item.picture[0] : `${import.meta.env.VITE_API_URL || ''}${detail.item.picture[0]}`) 
          : ''

        const itemRecord = {
          id: detail.id,
          orderId: order.id,
          orderDate: order.orderDate,
          worker: order.nameWorker || order.account?.username || 'Unknown',
          itemCode: detail.item?.itemIndentifyId || '',
          itemName: detail.item?.com?.name || detail.item?.eng?.name || 'Unknown',
          itemImage,
          unit: detail.item?.unit || '',
          quantity: qty,
          price: price,
          totalValue: value
        }

        if (stats.has(key)) {
          const existing = stats.get(key)!
          existing.quantity += qty
          existing.money += value
          existing.items.push(itemRecord)
        } else {
          stats.set(key, {
            machineName,
            lineName,
            quantity: qty,
            money: value,
            items: [itemRecord]
          })
        }
      })
    })
  })

  return Array.from(stats.values())
})

const topQuantityMachine = computed(() => {
  if (machineStats.value.length === 0) return { name: '', quantity: 0, line: '', rawMachine: '' }
  const top = [...machineStats.value].sort((a, b) => b.quantity - a.quantity)[0]
  return { name: `${top.lineName} - ${top.machineName}`, quantity: top.quantity, line: top.lineName, rawMachine: top.machineName }
})

const topMoneyMachine = computed(() => {
  if (machineStats.value.length === 0) return { name: '', money: 0, line: '', rawMachine: '' }
  const top = [...machineStats.value].sort((a, b) => b.money - a.money)[0]
  return { name: `${top.lineName} - ${top.machineName}`, money: top.money, line: top.lineName, rawMachine: top.machineName }
})

const selectedMachineTotalQty = computed(() => {
  return selectedMachineItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const selectedMachineTotalValue = computed(() => {
  return selectedMachineItems.value.reduce((sum, item) => sum + item.totalValue, 0)
})

// Methods
const fetchData = async () => {
  if (!fromDate.value || !toDate.value) return;
  
  loading.value = true
  selectedMachine.value = null
  try {
    if (lineMachineStore.lines.length === 0) {
      await lineMachineStore.fetchLines()
    }
    const res = await orderAPI.filterOrders({
      fromDate: fromDate.value,
      toDate: toDate.value
    })
    orders.value = res || []
    
    updateChart()
  } catch (err) {
    console.error('Error fetching data for line/machine chart:', err)
  } finally {
    loading.value = false
  }
}

const updateChart = () => {
  const data = machineStats.value
  
  // Sort by Line, then Machine for better grouping on X axis
  data.sort((a, b) => {
    if (a.lineName === b.lineName) return a.machineName.localeCompare(b.machineName)
    return a.lineName.localeCompare(b.lineName)
  })

  const labels = data.map(d => `${d.lineName}\n${d.machineName}`)
  const quantities = data.map(d => d.quantity)
  const moneys = data.map(d => d.money)

  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--text-color') || '#495057'
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d'
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef'

  chartData.value = {
    labels: labels,
    datasets: [
      {
        type: 'bar',
        label: tr('common.quantity', 'Số lượng'),
        backgroundColor: '#3b82f6', // blue-500
        data: quantities,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: tr('reports.chart.col.totalValue', 'Tổng tiền'),
        borderColor: '#10b981', // emerald-500
        backgroundColor: '#10b981',
        borderWidth: 2,
        tension: 0.4,
        data: moneys,
        yAxisID: 'y1'
      }
    ]
  }

  chartOptions.value = {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      legend: {
        labels: { color: textColor }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) { label += ': '; }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 1) {
                label += formatCurrency(context.parsed.y);
              } else {
                label += formatNumber(context.parsed.y);
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: textColorSecondary, maxRotation: 45, minRotation: 45 },
        grid: { color: surfaceBorder }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: tr('common.quantity', 'Số lượng (SP)')
        },
        ticks: { color: textColorSecondary },
        grid: { color: surfaceBorder }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Giá trị (VND)'
        },
        grid: { drawOnChartArea: false, color: surfaceBorder },
        ticks: { color: textColorSecondary, callback: (val: number) => formatNumber(val) }
      }
    }
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const onChartClick = (e: any) => {
  if (!e.element || e.element.index === undefined) return
  const index = e.element.index
  const stat = machineStats.value[index]
  if (stat) {
    showMachineDetail(stat.machineName, stat.lineName)
  }
}

const showMachineDetail = (machineName: string, lineName: string) => {
  selectedMachine.value = machineName
  selectedMachineLine.value = lineName
  
  const stat = machineStats.value.find(s => s.machineName === machineName && s.lineName === lineName)
  if (stat) {
    // Sort items by date descending
    selectedMachineItems.value = [...stat.items].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
  } else {
    selectedMachineItems.value = []
  }
  
  // Scroll to detail table smoothly
  nextTick(() => {
    if (detailTableRef.value) {
      detailTableRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

const onExportExcel = () => {
  if (machineStats.value.length === 0) return
  exporting.value = true
  
  try {
    // Export 1: Tổng hợp Line - Machine
    const summaryData = machineStats.value.map(stat => ({
      'Line': stat.lineName,
      'Máy (Machine)': stat.machineName,
      'Tổng số lượng vật tư': stat.quantity,
      'Tổng tiền': stat.money
    }))

    // Export 2: Chi tiết tất cả vật tư của các máy
    const detailData: any[] = []
    machineStats.value.forEach(stat => {
      stat.items.forEach(item => {
        detailData.push({
          'Line': stat.lineName,
          'Máy (Machine)': stat.machineName,
          'Mã vật tư': item.itemCode,
          'Tên vật tư': item.itemName,
          'Đơn vị': item.unit,
          'Số lượng': item.quantity,
          'Đơn giá': item.price,
          'Thành tiền': item.totalValue,
          'Ngày order': formatDate(item.orderDate),
          'Người order': item.worker
        })
      })
    })

    const wb = XLSX.utils.book_new()
    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    const wsDetail = XLSX.utils.json_to_sheet(detailData)
    
    // Auto-fit columns roughly
    const wscolsSummary = [ {wch:15}, {wch:20}, {wch:25}, {wch:20} ]
    wsSummary['!cols'] = wscolsSummary

    XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng hợp Máy")
    XLSX.utils.book_append_sheet(wb, wsDetail, "Chi tiết Vật tư")
    
    const fileName = `PhanTich_Line_May_${fromDate.value}_${toDate.value}.xlsx`
    XLSX.writeFile(wb, fileName)
  } catch (err) {
    console.error('Error exporting to Excel', err)
  } finally {
    exporting.value = false
  }
}

watch([fromDate, toDate], () => {
  fetchData()
})

watch([selectedArea, selectedLine], () => {
  // Reset selectedLine when area changes if it doesn't belong to new area
  if (selectedArea.value !== 'ALL' && selectedLine.value) {
    const lineObj = lineMachineStore.lines.find(l => l.lineName === selectedLine.value)
    if (lineObj && (lineObj.areaPart || '').toLowerCase() !== selectedArea.value.toLowerCase()) {
      selectedLine.value = null
    }
  }
  updateChart()
})

</script>

<style scoped>
.line-machine-chart {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
