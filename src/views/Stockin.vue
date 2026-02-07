<template>
  <MainLayout>
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold mb-4 text-gray-900">Nhập hàng</h2>
          <p class="text-gray-600">Quản lý phiếu nhập kho</p>
        </div>
        <Button 
          label="Tạo phiếu nhập mới" 
          icon="pi pi-plus" 
          class="btn-primary" 
          @click="openCreateDialog"
        />
      </div>

      <!-- Filter Section -->
      <Card class="mb-6">
        <template #content>
          <div class="flex flex-col gap-4">
            <!-- Date Range -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Từ ngày</label>
                <Calendar 
                  v-model="fromDate" 
                  dateFormat="dd/mm/yy"
                  showIcon
                  showTime
                  hourFormat="24"
                  :stepMinute="15"
                  class="w-full calendar-full-width"
                />
              </div>
              
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Đến ngày</label>
                <Calendar 
                  v-model="toDate" 
                  dateFormat="dd/mm/yy"
                  showIcon
                  showTime
                  hourFormat="24"
                  :stepMinute="15"
                  class="w-full calendar-full-width"
                />
              </div>
            </div>
            <!-- Summary & Actions Row -->
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                <span class="text-lg font-semibold text-gray-900">
                  Tổng: {{ totalFilteredItems }} phiếu nhập
                </span>
              </div>
              
              <div class="flex gap-3">
                <span class="p-input-icon-left w-80">
                  <InputText 
                    v-model="searchQuery" 
                    placeholder="Tìm kiếm theo ghi chú, người tạo..." 
                    class="w-full"
                  />
                </span>
                
                <Button 
                  label="Lọc" 
                  icon="pi pi-filter"
                  @click="applyDateFilter"
                  :loading="stockinStore.loading"
                />
                
                <Button 
                  label="Reset" 
                  icon="pi pi-refresh"
                  severity="secondary"
                  @click="clearDateFilter"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <DataTable 
            :value="filteredStockins" 
            :paginator="true" 
            :rows="10"
            :loading="stockinStore.loading"
            responsiveLayout="scroll"
          >
            <template #empty>
              <div class="text-center py-8">
                <i class="pi pi-inbox text-5xl text-gray-400"></i>
                <p class="mt-4 text-gray-500">Chưa có phiếu nhập nào</p>
              </div>
            </template>

            <Column field="id" header="ID" sortable class="w-20"></Column>
            
            <Column field="stockInDate" header="Ngày nhập" sortable class="w-48">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <i class="pi pi-calendar text-gray-500"></i>
                  <span>{{ formatDate(data.stockInDate) }}</span>
                </div>
              </template>
            </Column>
            
            <Column field="note" header="Ghi chú">
              <template #body="{ data }">
                <span class="text-gray-700">{{ data.note || 'Chưa có' }}</span>
              </template>
            </Column>
            
            <Column field="account.username" header="Người tạo" sortable>
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <i class="pi pi-user text-primary"></i>
                  <span class="font-medium">{{ data.account?.username || '-' }}</span>
                </div>
              </template>
            </Column>
            
            <Column header="Sản phẩm" class="w-32">
              <template #body="{ data }">
                <Chip 
                  :label="`${data.stockInDetails?.length || 0} SP`" 
                  icon="pi pi-box"
                  class="p-chip-info"
                />
              </template>
            </Column>
            
            <Column header="Hình ảnh" class="w-32">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <i class="pi pi-images text-gray-500"></i>
                  <span>{{ data.image?.length || 0 }} ảnh</span>
                </div>
              </template>
            </Column>
            
            <Column header="Hành động" class="w-40">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button 
                    icon="pi pi-eye" 
                    text 
                    rounded 
                    severity="info"
                    @click="viewDetail(data)"
                    title="Xem chi tiết"
                  />
                  <Button 
                    icon="pi pi-images" 
                    text 
                    rounded 
                    severity="secondary"
                    @click="viewImages(data)"
                    title="Quản lý ảnh"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    text 
                    rounded 
                    severity="danger"
                    @click="confirmDelete(data)"
                    title="Xóa"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Create StockIn Dialog -->
    <Dialog 
      v-model:visible="showCreateDialog" 
      header="Tạo phiếu nhập mới"
      :style="{ width: '900px' }"
      :modal="true"
    >
      <div class="flex flex-col gap-4 mt-4">
        <!-- Note -->
        <div>
          <label class="block mb-2 font-semibold">Ghi chú</label>
          <Textarea 
            v-model="createForm.note" 
            rows="3" 
            class="w-full" 
            placeholder="Nhập ghi chú cho phiếu nhập..."
          />
        </div>

        <!-- Items Selection -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <label class="text-base font-semibold">
              Danh sách sản phẩm nhập <span class="text-red-500">*</span>
            </label>
            <Button 
              label="Thêm sản phẩm" 
              icon="pi pi-plus" 
              size="small"
              @click="addItemRow"
            />
          </div>

          <div v-if="createForm.items.length === 0" class="text-center py-8 rounded-lg border-2 border-dashed border-gray-300">
            <p class="mt-3! text-gray-500 font-medium">Chưa có sản phẩm nào</p>
            <Button 
              label="Thêm sản phẩm đầu tiên" 
              icon="pi pi-plus" 
              text
              class="mb-3!"
              @click="addItemRow"
            />
          </div>

          <div v-else class="space-y-3">
  <div 
    v-for="(item, index) in createForm.items" 
    :key="index"
    class="flex items-end gap-3 p-4"
  >
    <!-- Item Dropdown - fixed width -->
    <div class="w-96">
      <label class="block mb-2 text-sm font-medium text-gray-700">Sản phẩm</label>
      <Dropdown 
        v-model="item.itemId" 
        :options="availableItems" 
        optionLabel="label"
        optionValue="value"
        placeholder="Chọn sản phẩm" 
        class="w-full"
        :filter="true"
        filterPlaceholder="Tìm sản phẩm..."
        @change="onItemSelect($event, index)"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex items-center gap-2 min-w-0">
            <img 
              v-if="getSelectedItemImage(slotProps.value)"
              :src="getSelectedItemImage(slotProps.value)" 
              class="w-8 h-8 rounded object-cover shrink-0"
              alt=""
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm truncate">{{ getSelectedItemLabel(slotProps.value) }}</div>
              <div class="text-xs text-gray-500 truncate">
                {{ getSelectedItemType(slotProps.value) }} - 
                Tồn: {{ getSelectedItemStock(slotProps.value) }} {{ getSelectedItemUnit(slotProps.value) }}
              </div>
            </div>
          </div>
          <span v-else class="text-gray-400">{{ slotProps.placeholder }}</span>
        </template>
        <template #option="slotProps">
          <div class="flex items-center gap-3 py-2">
            <img 
              v-if="slotProps.option.image"
              :src="slotProps.option.image" 
              class="w-10 h-10 rounded object-cover shrink-0"
              alt=""
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ slotProps.option.label }}</div>
              <div class="text-xs text-gray-500 truncate">
                {{ slotProps.option.type }} - Tồn: {{ slotProps.option.stock }} {{ slotProps.option.unit }}
              </div>
            </div>
          </div>
        </template>
      </Dropdown>
    </div>

    <!-- Quantity - fixed width -->
    <div class="w-64">
      <label class="block mb-2 text-sm font-medium text-gray-700">Số lượng</label>
      <input type="number" v-model="item.quantity" class="w-full p-2! border border-gray-300 rounded outline-none">
    </div>

    <!-- Current Stock Info - fixed width -->
    <div class="w-64">
      <label class="block mb-2 text-sm font-medium text-gray-700 text-center">Tồn</label>
      <div class="h-10 flex items-center justify-center">
        <Chip 
          v-if="item.itemId"
          :label="`${getSelectedItemStock(item.itemId)} ${getSelectedItemUnit(item.itemId)}`" 
          class="bg-blue-100 text-blue-700 font-medium px-3 py-1"
        />
        <span v-else class="text-gray-400 text-sm">---</span>
      </div>
    </div>

    <!-- Remove Button - fixed width -->
    <div class="w-12">
      <label class="block mb-2 text-sm font-medium opacity-0 select-none">X</label>
      <div class="h-10 flex items-center justify-center">
        <Button 
          icon="pi pi-trash" 
          severity="danger"
          text
          rounded
          @click="removeItemRow(index)"
          class="hover:bg-red-50"
        />
      </div>
    </div>
  </div>
</div>
        </div>

        <!-- Summary -->
        <div v-if="createForm.items.length > 0" class="mt-4 p-4! bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-gray-700">Tổng số mặt hàng:</span>
            <span class="text-xl font-bold text-primary">{{ createForm.items.length }} mặt hàng</span>
          </div>
          <div class="flex items-center justify-between mt-2!">
            <span class="font-semibold text-gray-700">Tổng số lượng nhập:</span>
            <span class="text-xl font-bold text-primary">{{ totalQuantity }} sản phẩm</span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button 
          label="Hủy" 
          icon="pi pi-times" 
          text 
          @click="closeCreateDialog" 
          :disabled="stockinStore.loading"
        />
        <Button 
          label="Tạo phiếu nhập" 
          icon="pi pi-check" 
          @click="submitCreate"
          :loading="stockinStore.loading"
          :disabled="!isFormValid"
        />
      </template>
    </Dialog>

    <!-- Detail Dialog -->
    <Dialog 
      v-model:visible="showDetailDialog" 
      :header="`Chi tiết phiếu nhập #${selectedStockin?.id}`"
      :style="{ width: '900px' }"
      :modal="true"
    >
      <div v-if="selectedStockin" class="mt-4">
        <!-- Info Section -->
        <div class="grid grid-cols-2 gap-4 mb-4 p-4! bg-gray-50 rounded-lg">
          <div>
            <label class="block text-sm text-gray-600 mb-1">Ngày nhập</label>
            <p class="font-semibold text-gray-900">{{ formatDateTime(selectedStockin.stockInDate) }}</p>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Người tạo</label>
            <p class="font-semibold text-gray-900">{{ selectedStockin.account?.username }}</p>
          </div>
          <div class="col-span-2">
            <label class="block text-sm text-gray-600 mb-1">Ghi chú</label>
            <p class="text-gray-900">{{ selectedStockin.note || '-' }}</p>
          </div>
        </div>

        <!-- Items Table -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-3!">Danh sách sản phẩm ({{ selectedStockin.stockInDetails?.length || 0 }})</h3>
          <DataTable 
            :value="selectedStockin.stockInDetails" 
            responsiveLayout="scroll"
            class="border border-gray-200"
          >
            <template #empty>
              <div class="text-center py-4 text-gray-500">
                Không có sản phẩm nào
              </div>
            </template>

            <Column field="item.id" header="ID" class="w-20"></Column>
            
            <Column header="Sản phẩm">
              <template #body="{ data }">
                <div class="flex items-center gap-3">
                  <img 
                    v-if="data.item?.picture?.length"
                    :src="getItemImageUrl(data.item.picture[0])" 
                    class="w-12 h-12 object-cover" 
                  />
                  <div v-else class="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                    <i class="pi pi-image text-gray-400"></i>
                  </div>
                  <div>
                    <p class="font-medium">{{ getDetailItemName(data.item) }}</p>
                    <p class="text-sm text-gray-500">{{ data.item?.type || '-' }}</p>
                  </div>
                </div>
              </template>
            </Column>
            
            <Column field="quantity" header="Số lượng nhập" class="w-40">
              <template #body="{ data }">
                <Chip 
                  :label="`+${data.quantity} ${data.item?.unit || ''}`" 
                  class="p-chip-success"
                  icon="pi pi-arrow-up"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <template #footer>
        <Button label="Đóng" icon="pi pi-times" @click="showDetailDialog = false" />
      </template>
    </Dialog>

    <!-- Image Management Dialog -->
    <Dialog 
      v-model:visible="showImageDialog" 
      :header="`Quản lý hình ảnh - Phiếu nhập #${selectedStockin?.id}`"
      :style="{ width: '800px' }"
      :modal="true"
      :dismissableMask="true"
    >
      <div class="mt-4">
        <!-- Upload Area -->
<div class="mb-6">
  <label class="block mb-2 font-semibold">
    Tải lên hình ảnh mới
    <span v-if="stockinStore.uploadingImages" class="text-primary text-sm ml-2">
      <i class="pi pi-spin pi-spinner"></i> Đang tải lên...
    </span>
  </label>
  
  <div 
    @click="!stockinStore.uploadingImages && imageFileInput?.click()"
    class="relative min-h-60 border-2 border-dashed rounded-xl p-4! transition-all"
    :class="stockinStore.uploadingImages ? 'opacity-50 cursor-not-allowed border-gray-300' : 'border-gray-400 cursor-pointer hover:bg-gray-50'"
  >
    <!-- Pending Images Preview - Top Left Corner with Scroll -->
    <div 
      v-if="pendingImages.length > 0" 
      class="absolute top-4 left-4 right-4 z-10 backdrop-blur-md rounded-lg p-4! shadow-lg max-h-50! overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-2! sticky top-0 pb-2">
        <span class="text-sm font-medium text-gray-700">
          Đã chọn {{ pendingImages.length }} ảnh
        </span>
        <div class="flex gap-2">
          <Button 
            label="Xóa tất cả" 
            icon="pi pi-trash" 
            text 
            size="small" 
            severity="danger"
            class="text-xs! px-2! py-1!"
            @click.stop="clearPendingImages" 
          />
          <Button 
            label="Tải lên" 
            icon="pi pi-upload" 
            size="small" 
            severity="success"
            class="text-xs! px-2! py-1!"
            :loading="stockinStore.uploadingImages" 
            @click.stop="uploadPendingImages" 
          />
        </div>
      </div>

      <div class="grid grid-cols-6 gap-2 mt-2">
        <div 
          v-for="(preview, index) in pendingImagePreviews" 
          :key="`pending-${index}`"
          class="relative aspect-square rounded-lg overflow-hidden border-2 border-orange-400"
        >
          <img 
            :src="preview" 
            class="w-full h-full object-cover" 
            alt="Preview"
          />
          
          <Button 
            icon="pi pi-times" 
            rounded 
            text
            severity="danger"
            size="small"
            class="absolute! top-1! right-1! w-5! h-5! min-w-0! bg-white! shadow-md! hover:bg-red-100!"
            @click.stop="removePendingImage(index)"
          />
        </div>
      </div>
    </div>

    <!-- Upload Area - Center -->
    <div class="flex flex-col justify-center items-center text-center">
      <i class="pi pi-cloud-upload text-5xl text-gray-400 mb-3"></i>
      <p class="text-gray-600 text-sm font-medium mb-1">Click để chọn hình ảnh</p>
      <p class="text-xs text-gray-500 mb-1">PNG, JPG, WEBP (Max. 5MB mỗi file)</p>
      <p class="text-xs text-gray-400">Upload từng ảnh một, có thể chọn nhiều ảnh cùng lúc</p>
    </div>
  </div>
  
  <input 
    ref="imageFileInput" 
    type="file" 
    accept="image/png,image/jpeg,image/jpg,image/webp"
    multiple
    :disabled="stockinStore.uploadingImages"
    class="hidden" 
    @change="handleImageUpload"
  />
</div>

        <!-- Current Images -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <label class="font-semibold">Hình ảnh hiện tại ({{ currentImages.length }})</label>
          </div>

          <div v-if="currentImages.length === 0" class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p class="my-4! text-gray-500">Chưa có hình ảnh nào</p>
          </div>

          <div v-else class="grid grid-cols-4 gap-4">
            <div 
              v-for="(img, index) in currentImages" 
              :key="`current-${index}`"
              class="image-container"
            >
              <img 
                :src="getImageUrl(img)" 
                class="image-preview"
                @click="viewImageFullscreen(img)"
              />
              <Button 
                icon="pi pi-trash" 
                rounded 
                severity="danger"
                size="small"
                :loading="stockinStore.deletingImage"
                class="delete-button"
                @click.stop="confirmDeleteImage(img)"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Đóng" icon="pi pi-times" @click="closeImageDialog" />
      </template>
    </Dialog>

    <!-- Fullscreen Image Dialog -->
    <Dialog 
      v-model:visible="showFullscreenImage" 
      :style="{ width: '90vw', maxWidth: '1200px' }"
      :modal="true"
      header="Xem hình ảnh"
    >
      <div class="flex justify-center items-center p-4">
        <img 
          v-if="fullscreenImageUrl"
          :src="fullscreenImageUrl" 
          class="max-w-full max-h-[70vh] object-contain rounded-lg"
        />
      </div>
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStockinStore } from '@/stores/stockinStore'
import { useItemStore } from '@/stores/itemStore'
import { stockinAPI } from '@/services/stockinAPI'
import { itemAPI } from '@/services/itemAPI'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/components/MainLayout.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import type { Stockin, CreateStockinDetail } from '@/types/stockin.types'

const confirm = useConfirm()
const toast = useToast()
const stockinStore = useStockinStore()
const itemStore = useItemStore()

// Search & Filter
const searchQuery = ref('')
const fromDate = ref<Date>(new Date(new Date().getFullYear(), 0, 1, 0, 0, 0))
const toDate = ref<Date>(new Date(new Date().setHours(23, 59, 59)))

const formatDateTimeForAPI = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const filteredStockins = computed(() => {
  if (!stockinStore.stockins?.length) return []
  if (!searchQuery.value) return stockinStore.stockins

  const term = searchQuery.value.toLowerCase()
  return stockinStore.stockins.filter(stockin => {
    return (
      stockin.note?.toLowerCase().includes(term) ||
      stockin.account?.username?.toLowerCase().includes(term) ||
      stockin.id?.toString().includes(term)
    )
  })
})

const totalFilteredItems = computed(() => filteredStockins.value.length)

// Create Dialog
const showCreateDialog = ref(false)
const createForm = ref<{
  note: string
  items: CreateStockinDetail[]
}>({
  note: '',
  items: []
})

// Available items for dropdown
const availableItems = computed(() => {
  if (!itemStore.items?.length) return []
  
  return itemStore.items.map(item => ({
    value: item.id,
    label: getItemName(item),
    type: item.type,
    stock: item.stockQty,
    unit: item.unit,
    image: item.picture?.length ? getItemImageUrl(item.picture[0]) : null
  }))
})

// Form validation
const isFormValid = computed(() => {
  return createForm.value.items.length > 0 && 
         createForm.value.items.every(item => item.itemId && item.quantity > 0)
})

// Total quantity
const totalQuantity = computed(() => {
  return createForm.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

// Detail Dialog
const showDetailDialog = ref(false)
const selectedStockin = ref<Stockin | null>(null)

// Image Management
const showImageDialog = ref(false)
const currentImages = ref<string[]>([])
const pendingImages = ref<File[]>([])
const pendingImagePreviews = ref<string[]>([])
const imageFileInput = ref<HTMLInputElement | null>(null)

// Fullscreen
const showFullscreenImage = ref(false)
const fullscreenImageUrl = ref('')

// Load items on mount
onMounted(async () => {
  await Promise.all([
    fetchAllStockins(),
    fetchAllItems()
  ])
})

// Clear shared state on unmount
onUnmounted(() => {
  stockinStore.setCurrentStockin(null)
})

// Fetch all stockins
const fetchAllStockins = async (useFilter: boolean = false) => {
  stockinStore.setLoading(true)
  try {
    let stockins
    
    if (useFilter) {
      const from = formatDateTimeForAPI(fromDate.value)
      const to = formatDateTimeForAPI(toDate.value)
      stockins = await stockinAPI.filterStockin(from, to)
    } else {
      stockins = await stockinAPI.getAllStockin()
    }
    
    stockinStore.setStockins(stockins)
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể tải danh sách phiếu nhập',
      life: 3000
    })
  } finally {
    stockinStore.setLoading(false)
  }
}

// Fetch all items
const fetchAllItems = async () => {
  try {
    const items = await itemAPI.getAll()
    itemStore.setItems(items)
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể tải danh sách sản phẩm',
      life: 3000
    })
  }
}

// Date Filter
const applyDateFilter = async () => {
  stockinStore.setLoading(true)
  try {
    const from = formatDateTimeForAPI(fromDate.value)
    const to = formatDateTimeForAPI(toDate.value)
    
    const stockins = await stockinAPI.filterStockin(from, to)
    stockinStore.setStockins(stockins)
    
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `Tìm thấy ${stockins.length} phiếu nhập`,
      life: 3000
    })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể lọc phiếu nhập',
      life: 3000
    })
  } finally {
    stockinStore.setLoading(false)
  }
}

const clearDateFilter = async () => {
  fromDate.value = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0)
  toDate.value = new Date(new Date().setHours(23, 59, 59))
  await fetchAllStockins()
}

const getImageUrl = (filename: string) => {
  if (!filename) return ''
  if (filename.startsWith('http')) return filename
  return `${import.meta.env.WAREHOUSE_URL}/api/StockIn/image/${filename}`
}

const getItemImageUrl = (filename: string) => {
  if (!filename) return ''
  if (filename.startsWith('http')) return filename
  return `${import.meta.env.WAREHOUSE_URL}/api/Item/image/${filename}`
}

// For dropdown items (from itemStore)
const getItemName = (item: any) => {
  if (!item) return 'Unknown'
  return item.eng?.partname || item.com?.name || 'Unknown'
}

// For detail modal (nested structure from StockInDetail)
const getDetailItemName = (item: any) => {
  if (!item) return 'Unknown'
  
  // Check if item has nested eng/com structure
  if (item.eng?.partname) return item.eng.partname
  if (item.com?.name) return item.com.name
  
  // Fallback to direct properties
  if (item.partname) return item.partname
  if (item.name) return item.name
  
  return 'Unknown'
}

// Create Dialog Functions
const openCreateDialog = () => {
  createForm.value = {
    note: '',
    items: []
  }
  showCreateDialog.value = true
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  createForm.value = {
    note: '',
    items: []
  }
}

const addItemRow = () => {
  createForm.value.items.push({
    itemId: 0,
    quantity: 1
  })
}

const removeItemRow = (index: number) => {
  createForm.value.items.splice(index, 1)
}

const onItemSelect = (event: any, index: number) => {
  console.log('Item selected:', event.value, 'at index:', index)
}

const getSelectedItemLabel = (itemId: number) => {
  const item = availableItems.value.find(i => i.value === itemId)
  return item?.label || ''
}

const getSelectedItemImage = (itemId: number) => {
  const item = availableItems.value.find(i => i.value === itemId)
  return item?.image || ''
}

const getSelectedItemType = (itemId: number) => {
  const item = availableItems.value.find(i => i.value === itemId)
  return item?.type || ''
}

const getSelectedItemUnit = (itemId: number) => {
  const item = availableItems.value.find(i => i.value === itemId)
  return item?.unit || ''
}

const getSelectedItemStock = (itemId: number) => {
  const item = availableItems.value.find(i => i.value === itemId)
  return item?.stock || 0
}

const submitCreate = async () => {
  if (!isFormValid.value) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng điền đầy đủ thông tin',
      life: 3000
    })
    return
  }

  stockinStore.setLoading(true)
  
  try {
    await stockinAPI.createStockin({
      note: createForm.value.note,
      items: createForm.value.items
    })
    
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Tạo phiếu nhập thành công',
      life: 3000
    })
    
    closeCreateDialog()
    await fetchAllStockins()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể tạo phiếu nhập',
      life: 3000
    })
  } finally {
    stockinStore.setLoading(false)
  }
}

// Detail Handler
const viewDetail = async (stockin: Stockin) => {
  selectedStockin.value = stockin
  
  if (stockin.id) {
    try {
      const stockinData = await stockinAPI.getStockinById(stockin.id)
      selectedStockin.value = stockinData
      console.log('StockIn Detail Data:', stockinData) // Debug
    } catch (error) {
      console.error('Error loading stockin detail:', error)
    }
  }
  
  showDetailDialog.value = true
}

// Delete Handler
const confirmDelete = (stockin: Stockin) => {
  confirm.require({
    message: `Bạn có chắc muốn xóa phiếu nhập #${stockin.id}?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    acceptClass: 'p-button-danger',
    accept: async () => {
      if (stockin.id) {
        stockinStore.setLoading(true)
        
        try {
          await stockinAPI.deleteStockin(stockin.id)
          
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Xóa phiếu nhập thành công',
            life: 3000
          })
          
          await fetchAllStockins()
        } catch (error: any) {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể xóa phiếu nhập',
            life: 3000
          })
        } finally {
          stockinStore.setLoading(false)
        }
      }
    }
  })
}

// Image Handlers
const viewImages = async (stockin: Stockin) => {
  selectedStockin.value = stockin
  
  if (stockin.id) {
    try {
      const stockinData = await stockinAPI.getStockinById(stockin.id)
      currentImages.value = stockinData.image || []
      stockinStore.setCurrentStockin(stockinData)
    } catch (error) {
      currentImages.value = stockin.image || []
    }
  } else {
    currentImages.value = stockin.image || []
  }
  
  showImageDialog.value = true
}

const closeImageDialog = () => {
  showImageDialog.value = false
  selectedStockin.value = null
  currentImages.value = []
  clearPendingImages()
  stockinStore.setCurrentStockin(null)
}

const handleImageUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files?.length) return

  const maxSize = 5 * 1024 * 1024
  const validFiles: File[] = []

  Array.from(files).forEach(file => {
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.add({ 
        severity: 'warn', 
        summary: 'Cảnh báo', 
        detail: `File ${file.name} không đúng định dạng`, 
        life: 3000 
      })
      return
    }
    if (file.size > maxSize) {
      toast.add({ 
        severity: 'warn', 
        summary: 'Cảnh báo', 
        detail: `File ${file.name} quá lớn (tối đa 5MB)`, 
        life: 3000 
      })
      return
    }
    validFiles.push(file)
  })

  if (!validFiles.length) return

  pendingImages.value.push(...validFiles)
  
  validFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        pendingImagePreviews.value.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })

  if (imageFileInput.value) imageFileInput.value.value = ''
}

const removePendingImage = (index: number) => {
  pendingImages.value.splice(index, 1)
  pendingImagePreviews.value.splice(index, 1)
}

const clearPendingImages = () => {
  pendingImages.value = []
  pendingImagePreviews.value = []
}

const uploadPendingImages = async () => {
  if (!selectedStockin.value?.id || !pendingImages.value.length) {
    toast.add({ 
      severity: 'warn', 
      summary: 'Cảnh báo', 
      detail: 'Không có file nào được chọn', 
      life: 3000 
    })
    return
  }

  stockinStore.setUploadingImages(true)
  
  try {
    const result = await stockinAPI.uploadImagesSequentially(
      selectedStockin.value.id, 
      pendingImages.value
    )
    
    if (result.success > 0) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Đã tải lên ${result.success}/${pendingImages.value.length} ảnh`,
        life: 3000
      })

      clearPendingImages()
      
      if (selectedStockin.value.id) {
        const stockinData = await stockinAPI.getStockinById(selectedStockin.value.id)
        currentImages.value = stockinData.image || []
        stockinStore.setCurrentStockin(stockinData)
      }
      
      await fetchAllStockins()
    }

    if (result.failed > 0) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: `${result.failed} ảnh tải lên thất bại`,
        life: 5000
      })
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể tải lên hình ảnh',
      life: 3000
    })
  } finally {
    stockinStore.setUploadingImages(false)
  }
}

const confirmDeleteImage = (imageName: string) => {
  confirm.require({
    message: 'Bạn có chắc muốn xóa hình ảnh này?',
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    acceptClass: 'p-button-danger',
    accept: async () => {
      if (!selectedStockin.value?.id) return

      const filename = imageName.split('/').pop() || imageName
      
      stockinStore.setDeletingImage(true)
      
      try {
        await stockinAPI.deleteImage(selectedStockin.value.id, filename)
        
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa hình ảnh',
          life: 3000
        })
        
        if (selectedStockin.value.id) {
          const stockinData = await stockinAPI.getStockinById(selectedStockin.value.id)
          currentImages.value = stockinData.image || []
          stockinStore.setCurrentStockin(stockinData)
        }
        
        await fetchAllStockins()
      } catch (error: any) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.message || 'Không thể xóa hình ảnh',
          life: 3000
        })
      } finally {
        stockinStore.setDeletingImage(false)
      }
    }
  })
}

const viewImageFullscreen = (imageUrl: string) => {
  fullscreenImageUrl.value = getImageUrl(imageUrl)
  showFullscreenImage.value = true
}
</script>

<style scoped>
/* Same CSS as before */
.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-preview {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.delete-button {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  background: rgba(239, 68, 68, 0.95) !important;
  z-index: 10 !important;
}

.delete-button:hover {
  opacity: 0.8 !important;
}

:deep(.stockin-dropdown .p-dropdown) {
  height: 40px !important;
  min-height: 40px !important;
}

:deep(.stockin-dropdown .p-dropdown .p-dropdown-label) {
  padding: 0 0.75rem !important;
  display: flex !important;
  align-items: center !important;
  height: 40px !important;
  line-height: 1.2 !important;
}

:deep(.stockin-dropdown .p-dropdown .p-dropdown-trigger) {
  width: 2.5rem !important;
}

:deep(.stockin-input .p-inputnumber) {
  height: 40px !important;
}

:deep(.stockin-input .p-inputnumber .p-inputtext) {
  height: 40px !important;
  padding: 0 0.75rem !important;
}

:deep(.stockin-input .p-inputnumber-button) {
  width: 2rem !important;
  height: 40px !important;
}

:deep(.stockin-input .p-inputnumber-button .p-button-icon) {
  font-size: 0.875rem !important;
}

:deep(.p-chip) {
  height: 28px;
  padding: 0 0.75rem;
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8fafc;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}

:deep(.p-paginator) {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
}

:deep(.p-input-icon-left > .p-inputtext) {
  padding-left: 1rem;
}

/* Calendar Full Width Fix */
.calendar-full-width {
  width: 100% !important;
}

:deep(.calendar-full-width .p-calendar) {
  width: 100% !important;
  display: flex !important;
}

:deep(.calendar-full-width .p-inputtext) {
  width: 100% !important;
  flex: 1 1 auto !important;
}

:deep(.calendar-full-width .p-datepicker-trigger) {
  flex-shrink: 0 !important;
  margin-left: 0 !important;
}

/* Đảm bảo grid item không overflow */
.grid > div {
  min-width: 0;
}
</style>