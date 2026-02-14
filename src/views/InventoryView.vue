<template>
  <MainLayout>
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold mb-4 text-gray-900">Kho hàng</h2>
          <p class="text-gray-600">Quản lý tồn kho sản phẩm</p>
        </div>
        <Button 
          label="Thêm sản phẩm mới" 
          icon="pi pi-plus" 
          class="btn-primary" 
          @click="router.push('/add-product')"
        />
      </div>

      <Card class="mb-6">
        <template #content>
          <div class="flex flex-col gap-4">
            <!-- Filters Row -->
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Loại sản phẩm</label>
                <Dropdown 
                  v-model="selectedType" 
                  :options="typeOptions" 
                  optionLabel="label" 
                  optionValue="value"
                  placeholder="Tất cả loại"
                  class="w-full"
                  showClear
                />
              </div>
              
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Trạng thái tồn kho</label>
                <Dropdown 
                  v-model="selectedStockStatus" 
                  :options="stockStatusOptions" 
                  optionLabel="label" 
                  optionValue="value"
                  placeholder="Tất cả"
                  class="w-full"
                  showClear
                />
              </div>
              
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Tìm kiếm</label>
                <div class="p-input-icon-left w-full">
                  <InputText 
                    v-model="searchQuery" 
                    placeholder="Tên sản phẩm, ID..." 
                    class="w-full"
                  />
                </div>
              </div>
            </div>
            
            <!-- Summary & Actions Row -->
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                <span class="text-lg font-semibold text-gray-900">
                  Tổng: {{ totalFilteredItems }} sản phẩm
                </span>
                
                <!-- Clickable Status Chips - DÙNG allItemsStockCount -->
                <Chip 
                  v-if="allItemsStockCount.normal > 0"
                  :label="`${allItemsStockCount.normal} còn hàng`"
                  icon="pi pi-check-circle"
                  class="clickable-chip chip-normal"
                  :class="{ 'chip-active': selectedStockStatus === 'in-stock' }"
                  @click="handleChipClick('in-stock')"
                />
                
                <Chip 
                  v-if="allItemsStockCount.warning > 0"
                  :label="`${allItemsStockCount.warning} cảnh báo`"
                  icon="pi pi-info-circle"
                  class="clickable-chip chip-warning"
                  :class="{ 'chip-active': selectedStockStatus === 'warning' }"
                  @click="handleChipClick('warning')"
                />
                
                <Chip 
                  v-if="allItemsStockCount.low > 0"
                  :label="`${allItemsStockCount.low} thấp`" 
                  icon="pi pi-exclamation-circle"
                  class="clickable-chip chip-low pulse-warning"
                  :class="{ 'chip-active': selectedStockStatus === 'low' }"
                  @click="handleChipClick('low')"
                />
                
                <Chip 
                  v-if="allItemsStockCount.critical > 0"
                  :label="`${allItemsStockCount.critical} nguy cấp`" 
                  icon="pi pi-exclamation-triangle"
                  class="clickable-chip chip-critical pulse-danger"
                  :class="{ 'chip-active': selectedStockStatus === 'critical' }"
                  @click="handleChipClick('critical')"
                />
                
                <Chip 
                  v-if="allItemsStockCount.outOfStock > 0"
                  :label="`${allItemsStockCount.outOfStock} hết hàng`" 
                  icon="pi pi-times-circle"
                  class="clickable-chip chip-out-of-stock pulse-danger"
                  :class="{ 'chip-active': selectedStockStatus === 'out-of-stock' }"
                  @click="handleChipClick('out-of-stock')"
                />

                <Chip 
                  v-if="allItemsStockCount.notConfigured > 0"
                  :label="`${allItemsStockCount.notConfigured} chưa có tồn an toàn`" 
                  icon="pi pi-cog"
                  class="clickable-chip chip-not-configured"
                  severity="secondary"
                  @click="handleChipClick('not-configured')"
                />
              </div>
              
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

      <Card>
        <template #content>
          <DataTable 
            :value="filteredItems" 
            :paginator="true" 
            :rows="10"
            :loading="itemStore.loading"
            responsiveLayout="scroll"
          >
            <template #empty>
              <div class="text-center py-8">
                <i class="pi pi-box text-5xl text-gray-400"></i>
                <p class="mt-4 text-gray-500">Chưa có sản phẩm nào</p>
              </div>
            </template>

            <Column field="id" header="ID" sortable class="w-32">
              <template #body="{ data }">
                <div :data-product-id="data.id">STT: {{ data.id }}</div>
                <div :data-item-id="data.itemIndentifyId" class="text-xs!">{{ data.itemIndentifyId }}</div>
              </template>
            </Column>
            
            <Column header="Sản phẩm">
              <template #body="{ data }">
                <div class="flex items-center gap-3">
                  <img 
                    :src="getProductImage(data)" 
                    :alt="getProductName(data)" 
                    class="w-12 h-12 rounded-lg object-cover cursor-pointer" 
                    @click="viewImages(data)"
                  />
                  <div>
                    <p class="font-semibold text-gray-900">{{ getProductName(data) }}</p>
                    <p class="text-sm text-gray-500">{{ getDistinguishName(data) }}</p>
                    <p class="text-sm text-gray-500">{{ getProductCategory(data) }}</p>
                  </div>
                </div>
              </template>
            </Column>
            
            <Column field="type" header="Loại" sortable></Column>
            
            <Column field="price" header="Giá" sortable>
              <template #body="{ data }">
                <span class="font-medium">{{ Number(data.price).toLocaleString('vi-VN') }} VND</span>
              </template>
            </Column>
            
            <Column field="stockQty" header="Tồn kho" sortable>
              <template #body="{ data }">
                <Chip 
                  :label="`${data.stockQty} ${data.unit}`" 
                  :class="data.stockQty < 10 ? 'p-chip-danger' : 'p-chip-success'"
                />
              </template>
            </Column>
            
            <Column field="saveQuantity" header="Tồn an toàn" sortable>
              <template #body="{ data }">
                <span>{{ data.saveQuantity }} {{ data.unit }}</span>
              </template>
            </Column>
            
            <Column header="Hành động" class="w-40">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button 
                    icon="pi pi-images" 
                    text 
                    rounded 
                    severity="info"
                    @click="viewImages(data)"
                    title="Quản lý ảnh"
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    text 
                    rounded 
                    severity="secondary" 
                    @click="openEditDialog(data)"
                    title="Sửa"
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

    <!-- Edit Dialog -->
    <Dialog 
      v-model:visible="showEditDialog" 
      header="Chỉnh sửa sản phẩm"
      :style="{ width: '500px' }"
      :modal="true"
    >
      <div class="flex flex-col gap-4 mt-4">
        <div>
          <label class="block mb-2 font-semibold">Loại <span class="text-red-500">*</span></label>
          <InputText v-model="editForm.type" class="w-full" placeholder="Nhập loại sản phẩm" />
        </div>

        <div>
          <label class="block mb-2 font-semibold">Đơn vị <span class="text-red-500">*</span></label>
          <InputText v-model="editForm.unit" class="w-full" placeholder="VD: cái, hộp, kg" />
        </div>

        <div>
          <label class="block mb-2 font-semibold">Giá <span class="text-red-500">*</span></label>
          <InputText v-model="editForm.price" class="w-full" placeholder="0.00" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-2 font-semibold">Tồn an toàn <span class="text-red-500">*</span></label>
            <InputText v-model.number="editForm.saveQuantity" type="number" class="w-full" placeholder="0" />
          </div>
          <div>
            <label class="block mb-2 font-semibold">Số lượng tồn <span class="text-red-500">*</span></label>
            <InputText v-model.number="editForm.stockQty" type="number" class="w-full" placeholder="0" />
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Hủy" icon="pi pi-times" text @click="showEditDialog = false" :disabled="itemStore.loading" />
        <Button label="Cập nhật" icon="pi pi-check" @click="saveEdit" :loading="itemStore.loading" />
      </template>
    </Dialog>

    <!-- Image Management Dialog -->
    <Dialog 
      v-model:visible="showImageDialog" 
      :header="`Quản lý hình ảnh - ${selectedItem ? getProductName(selectedItem) : ''}`"
      :style="{ width: '800px' }"
      :modal="true"
      :dismissableMask="true"
    >
      <div class="mt-4">
        <!-- Upload Area -->
        <div class="mb-6">
          <label class="block mb-2 font-semibold">
            Tải lên hình ảnh mới
            <span v-if="itemStore.uploadingImages" class="text-primary text-sm ml-2">
              <i class="pi pi-spin pi-spinner"></i> Đang tải lên...
            </span>
          </label>
          
          <div 
            @click="!itemStore.uploadingImages && imageFileInput?.click()"
            class="min-h-25 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-gray-50 flex flex-col justify-center items-center"
            :class="itemStore.uploadingImages ? 'opacity-50 cursor-not-allowed' : 'border-gray-400'"
          >
            <i class="pi pi-cloud-upload text-5xl text-gray-400 mb-2"></i>
            <p class="text-gray-600 text-sm mb-1">Click để chọn hình ảnh</p>
            <p class="text-xs text-gray-500">PNG, JPG, WEBP (Max. 5MB)</p>
          </div>
          
          <input 
            ref="imageFileInput" 
            type="file" 
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            :disabled="itemStore.uploadingImages"
            class="hidden" 
            @change="handleImageUpload"
          />

          <!-- Pending Images Preview -->
          <div v-if="pendingImages.length > 0" class="mt-4">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-sm">Đã chọn {{ pendingImages.length }} file</span>
              <div class="flex gap-2 mt-3!">
                <Button label="Xóa tất cả" icon="pi pi-trash" text size="small" severity="danger" @click="clearPendingImages" />
                <Button label="Tải lên" icon="pi pi-upload" size="small" severity="success" :loading="itemStore.uploadingImages" @click="uploadPendingImages" />
              </div>
            </div>
            
            <div class="grid grid-cols-6 gap-3">
              <div 
                v-for="(preview, index) in pendingImagePreviews" 
                :key="`pending-${index}`"
                class="relative aspect-square rounded-lg overflow-hidden border-2 border-orange-400"
              >
                <img :src="preview" class="absolute inset-0 w-full h-full object-cover" />
                
                <Button 
                  icon="pi pi-times" 
                  rounded 
                  text
                  severity="danger"
                  size="small"
                  class="absolute! top-1 right-1 bg-white/95! hover:bg-orange-200!"
                  @click="removePendingImage(index)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Current Images -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <label class="font-semibold">Hình ảnh hiện tại ({{ currentImages.length }})</label>
          </div>

          <div v-if="currentImages.length === 0" class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <i class="pi pi-image text-5xl text-gray-400"></i>
            <p class="mt-4 text-gray-500">Chưa có hình ảnh nào</p>
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
                :loading="itemStore.deletingImage"
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
import { useItemStore } from '@/stores/itemStore'
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
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import type { Item } from '@/types/item.types'
import Dropdown from 'primevue/dropdown'
import { useDashboardStore } from '@/stores/dashboard'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const itemStore = useItemStore()
const dashboardStore = useDashboardStore()

// Search & Filter
const searchQuery = ref('')

const selectedType = ref<string | null>(null)
const selectedStockStatus = ref<string | null>(null)
  // xử lý click từng Chip
const handleChipClick = (status: string) => {
  selectedStockStatus.value = status
}

const typeOptions = [
  { label: 'Tất cả loại', value: null },
  { label: 'Engineer', value: 'ENG' },
  { label: 'Consumer', value: 'COM' }
]

const stockStatusOptions = [
  { label: 'Tất cả', value: null },
  { label: 'Còn hàng', value: 'in-stock' },
  { label: 'Cảnh báo (>50% & <99%)', value: 'warning' },
  { label: 'Thấp (≤50%)', value: 'low' }, 
  { label: 'Nguy cấp (≤25%)', value: 'critical' },
  { label: 'Hết hàng', value: 'out-of-stock' },
  { label: 'Chưa có tồn an toàn', value: 'not-configured' }
]

const resetFilter = () => {
  selectedType.value = null
  selectedStockStatus.value = null
  searchQuery.value = ''
}

const filteredItems = computed(() => {
  let items = baseItems.value

  // Chỉ filter theo Stock Status
  if (selectedStockStatus.value === 'in-stock') {
    items = items.filter(item => dashboardStore.getStockStatus(item) === 'normal')
  } else if (selectedStockStatus.value === 'warning') {
    items = items.filter(item => dashboardStore.getStockStatus(item) === 'warning')
  } else if (selectedStockStatus.value === 'low') {
    items = items.filter(item => dashboardStore.getStockStatus(item) === 'low')
  } else if (selectedStockStatus.value === 'critical') {
    items = items.filter(item => dashboardStore.getStockStatus(item) === 'critical')
  } else if (selectedStockStatus.value === 'out-of-stock') {
    items = items.filter(item => dashboardStore.getStockStatus(item) === 'out-of-stock')
  } else if (selectedStockStatus.value === 'not-configured') {
    items = items.filter(item => dashboardStore.getStockStatus(item) === 'not-configured')
  }

  return items
})

const baseItems = computed(() => {
  if (!itemStore.items?.length) return []
  
  let items = itemStore.items

  // Chỉ filter theo Type
  if (selectedType.value === 'ENG') {
    items = items.filter(item => item.eng !== null)
  } else if (selectedType.value === 'COM') {
    items = items.filter(item => item.com !== null)
  }

  // Chỉ filter theo Search Query
  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase()
    items = items.filter(item => {
      const name = getProductName(item).toLowerCase()
      const category = getProductCategory(item).toLowerCase()
      return (
        name.includes(term) ||
        category.includes(term) ||
        item.type.toLowerCase().includes(term) ||
        item.id?.toString().includes(term) ||
        item.itemIndentifyId?.toLowerCase().includes(term)
      )
    })
  }

  return items
})

const allItemsStockCount = computed(() => {
  if (!baseItems.value?.length) return {
    critical: 0,
    low: 0,
    warning: 0,
    outOfStock: 0,
    normal: 0,
    notConfigured: 0,
    total: 0
  }

  const critical = baseItems.value.filter(item => 
    dashboardStore.getStockStatus(item) === 'critical'
  ).length
  
  const low = baseItems.value.filter(item => 
    dashboardStore.getStockStatus(item) === 'low'
  ).length
  
  const warning = baseItems.value.filter(item => 
    dashboardStore.getStockStatus(item) === 'warning'
  ).length

  const outOfStock = baseItems.value.filter(item => 
    dashboardStore.getStockStatus(item) === 'out-of-stock'
  ).length

  const normal = baseItems.value.filter(item => 
    dashboardStore.getStockStatus(item) === 'normal'
  ).length

  const notConfigured = baseItems.value.filter(item => 
    dashboardStore.getStockStatus(item) === 'not-configured'
  ).length
  
  return {
    critical,
    low,
    warning,
    outOfStock,
    normal,
    notConfigured,
    total: critical + low + warning + outOfStock + normal + notConfigured
  }
})
const totalFilteredItems = computed(() => filteredItems.value.length)

// Edit Dialog
const showEditDialog = ref(false)
const editingItem = ref<Item | null>(null)
const editForm = ref({
  type: '',
  unit: '',
  price: '',
  saveQuantity: 0,
  stockQty: 0
})

// Image Management
const showImageDialog = ref(false)
const selectedItem = ref<Item | null>(null)
const currentImages = ref<string[]>([])
const pendingImages = ref<File[]>([])
const pendingImagePreviews = ref<string[]>([])
const imageFileInput = ref<HTMLInputElement | null>(null)

// Fullscreen
const showFullscreenImage = ref(false)
const fullscreenImageUrl = ref('')

//  Load items on mount
onMounted(async () => {
  await fetchAllItems()
})

//  Clear shared state on unmount
onUnmounted(() => {
  itemStore.setCurrentItem(null)
  console.log('InventoryView unmounted - cleared currentItem')
})

//  Fetch all items
const fetchAllItems = async () => {
  itemStore.setLoading(true)
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
  } finally {
    itemStore.setLoading(false)
  }
}

// Helper function to get image URL
const getImageUrl = (filename: string) => {
  if (!filename) return ''
  if (filename.startsWith('http')) return filename
  return `${import.meta.env.WAREHOUSE_URL}/api/Item/image/${filename}`
}

// Utility Functions
const getProductName = (item: Item) => item.eng?.partname || item.com?.name || 'Unknown'
const getDistinguishName = (item: Item) => item?.eng?.description || item?.com?.specifications || 'Unknown'
const getProductCategory = (item: Item) => item.eng ? 'Hàng kỹ thuật' : item.com ? 'Hàng tiêu dùng' : 'Chưa phân loại'
const getProductImage = (item: Item) => 
  item.picture?.length ? getImageUrl(item.picture[0]) : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'

//  Edit Handlers
const openEditDialog = (item: Item) => {
  console.log('openEditDialog called with:', item)
  editingItem.value = item
  editForm.value = {
    type: item.type,
    unit: item.unit,
    price: item.price,
    saveQuantity: item.saveQuantity,
    stockQty: item.stockQty
  }
  showEditDialog.value = true
}

const saveEdit = async () => {
  if (!editingItem.value?.id) return
  
  itemStore.setLoading(true)
  
  try {
    await itemAPI.update(editingItem.value.id, editForm.value)
    
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Cập nhật sản phẩm thành công',
      life: 3000
    })
    
    showEditDialog.value = false
    await fetchAllItems()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể cập nhật sản phẩm',
      life: 3000
    })
  } finally {
    itemStore.setLoading(false)
  }
}

const confirmDelete = (item: Item) => {
  confirm.require({
    message: `Bạn có chắc muốn xóa "${getProductName(item)}"?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    acceptClass: 'p-button-danger',
    accept: async () => {
      if (item.id) {
        itemStore.setLoading(true)
        
        try {
          await itemAPI.delete(item.id)
          
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Xóa sản phẩm thành công',
            life: 3000
          })
          
          await fetchAllItems()
        } catch (error: any) {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể xóa sản phẩm',
            life: 3000
          })
        } finally {
          itemStore.setLoading(false)
        }
      }
    }
  })
}

//  Image Handlers
const viewImages = async (item: Item) => {
  console.log('viewImages called with:', item)
  selectedItem.value = item
  
  if (item.id) {
    try {
      const itemData = await itemAPI.getById(item.id)
      currentImages.value = itemData.picture || []
      itemStore.setCurrentItem(itemData)
    } catch (error) {
      currentImages.value = item.picture || []
    }
  } else {
    currentImages.value = item.picture || []
  }
  
  showImageDialog.value = true
}

const closeImageDialog = () => {
  showImageDialog.value = false
  selectedItem.value = null
  currentImages.value = []
  clearPendingImages()
  itemStore.setCurrentItem(null)
}

const handleImageUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files?.length) return

  const maxSize = 5 * 1024 * 1024
  const validFiles: File[] = []

  Array.from(files).forEach(file => {
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: `File ${file.name} không đúng định dạng`, life: 3000 })
      return
    }
    if (file.size > maxSize) {
      toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: `File ${file.name} quá lớn (tối đa 5MB)`, life: 3000 })
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
  if (!selectedItem.value?.id || !pendingImages.value.length) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Không có file nào được chọn', life: 3000 })
    return
  }

  itemStore.setUploadingImages(true)
  
  try {
    const result = await itemAPI.uploadImagesSequentially(selectedItem.value.id, pendingImages.value)
    
    if (result.success > 0) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Đã tải lên ${result.success}/${pendingImages.value.length} ảnh`,
        life: 3000
      })

      clearPendingImages()
      
      // Refresh item data
      if (selectedItem.value.id) {
        const itemData = await itemAPI.getById(selectedItem.value.id)
        currentImages.value = itemData.picture || []
        itemStore.setCurrentItem(itemData)
      }
      
      await fetchAllItems()
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
    itemStore.setUploadingImages(false)
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
      if (!selectedItem.value?.id) return

      const filename = imageName.split('/').pop() || imageName
      
      itemStore.setDeletingImage(true)
      
      try {
        await itemAPI.deleteImage(selectedItem.value.id, filename)
        
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa hình ảnh',
          life: 3000
        })
        
        // Refresh item data
        if (selectedItem.value.id) {
          const itemData = await itemAPI.getById(selectedItem.value.id)
          currentImages.value = itemData.picture || []
          itemStore.setCurrentItem(itemData)
        }
        
        await fetchAllItems()
      } catch (error: any) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.message || 'Không thể xóa hình ảnh',
          life: 3000
        })
      } finally {
        itemStore.setDeletingImage(false)
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
/* Image Container - FIX CRITICAL */
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

/* CRITICAL FIX: Always position delete button at top-right */
.delete-button {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  background: rgba(239, 68, 68, 0.95) !important;
  z-index: 10 !important;
}
.delete-button:hover{
  opacity: 0.8 !important;
}

/* Animation */
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

/* DataTable Styling */
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

/* Dialog Fix - Smooth animations */
:deep(.p-dialog) {
  animation: fadeInDialog 150ms ease-out !important;
}

:deep(.p-dialog-mask) {
  animation: fadeInMask 150ms ease-out !important;
}

@keyframes fadeInDialog {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInMask {
  from { opacity: 0; }
  to { opacity: 1; }
}

:deep(.p-dialog-enter-active),
:deep(.p-dialog-leave-active) {
  transition: opacity 150ms ease-out !important;
}

:deep(.p-dialog-enter-from),
:deep(.p-dialog-leave-to) {
  opacity: 0 !important;
  transform: none !important;
}

:deep(.p-dialog .p-dialog-header .p-dialog-header-icon) {
  transition: background-color 0.2s, color 0.2s !important;
  animation: none !important;
  transform: none !important;
}
/* Clickable Chips */
.clickable-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.clickable-chip:active {
  transform: translateY(0);
}

/* Pulse Animation for Critical & Out of Stock */
.pulse-warning {
  animation: pulse-warning 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.pulse-danger {
  animation: pulse-danger 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-warning {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
  }
}

@keyframes pulse-danger {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

/* Custom Colors */
.chip-critical {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
  font-weight: 600 !important;
}

.chip-out-of-stock {
  background: linear-gradient(135deg, #290b0b 0%, #130101 100%) !important;
  color: white !important;
  font-weight: 600 !important;
}

.chip-low {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  color: white !important;
}

.chip-warning {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
}

.chip-normal {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
}

/* Icon với màu nổi bật */
.chip-critical :deep(.p-chip-icon) {
  color: #fde047 !important;
  filter: drop-shadow(0 0 2px rgba(253, 224, 71, 0.5));
}

.chip-out-of-stock :deep(.p-chip-icon) {
  color: #fbbf24 !important;
  filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.5));
}

.chip-low :deep(.p-chip-icon) {
  color: #fef3c7 !important;
  font-weight: bold;
}

.chip-warning :deep(.p-chip-icon) {
  color: #dbeafe !important;
}

.chip-normal :deep(.p-chip-icon) {
  color: #dcfce7 !important;
}

.chip-not-configured {
  background: linear-gradient(135deg, #47526b 0%, #3c4e68 100%) !important;
  color: white !important;
}

.chip-not-configured :deep(.p-chip-icon) {
  color: #f3f4f6 !important;
}

.chip-not-configured:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%) !important;
}
</style>