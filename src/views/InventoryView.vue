<template>
  <MainLayout>
    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold mb-4 text-gray-900">Kho hàng</h2>
          <p class="text-gray-600">Quản lý tồn kho sản phẩm</p>
        </div>
        <Button 
          label="Thêm sản phẩm mới" 
          icon="pi pi-plus" 
          class="btn-primary" 
          @click="navigateToAddProduct"
        />
      </div>

      <Card>
        <!-- Search Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span style="font-size: 1.125rem; font-weight: 600; color: var(--gray-900);">
          Tổng: {{ totalFilteredItems }} sản phẩm
        </span>
        <Chip 
          v-if="lowStockCount > 0"
          :label="`${lowStockCount} sản phẩm sắp hết`" 
          severity="danger"
          icon="pi pi-exclamation-triangle"
        />
      </div>
      
      <span class="p-input-icon-left" style="width: 300px;">
        <i class="pi pi-search" />
        <InputText 
          v-model="filters.global.value" 
          placeholder="Tìm kiếm theo tên, loại, ID..." 
          style="width: 100%;"
        />
      </span>
    </div>
        <template #content>
          <DataTable 
            :value="displayItems" 
            :paginator="true" 
            :rows="5"
            :loading="loading"
            responsiveLayout="scroll"
            class="custom-datatable"
          >
            <template #empty>
              <div style="text-align: center; padding: 2rem 0;">
                <i class="pi pi-box" style="font-size: 3rem; color: #94a3b8;"></i>
                <p style="margin-top: 1rem; color: #64748b;">Chưa có sản phẩm nào</p>
              </div>
            </template>

            <Column field="itemIndentifyId" header="ID" sortable class="w-30"></Column>
            
            <Column header="Sản phẩm">
              <template #body="slotProps">
                <div class="flex items-center gap-2">
                  <img 
                    :src="getProductImage(slotProps.data)" 
                    :alt="getProductName(slotProps.data)" 
                    class="w-12 h-12 object-cover" 
                    style="border-radius: 10px; object-fit: cover;"
                  />
                  <div>
                    <p class="font-semibold text-gray-900">{{ getProductName(slotProps.data) }}</p>
                    <p class="text-gray-500" style="font-size: small;">{{ getProductCategory(slotProps.data) }}</p>
                  </div>
                </div>
              </template>
            </Column>
            
            <Column field="type" header="Loại" sortable></Column>
            
            <Column field="price" header="Giá" sortable>
              <template #body="slotProps">
                <span class="font-medium">{{ Number(slotProps.data.price).toLocaleString('vi-VN') }} VND</span>
              </template>
            </Column>
            
            <Column field="stockQty" header="Tồn kho" sortable>
              <template #body="slotProps">
                <Chip 
                  :label="slotProps.data.stockQty + ' ' + slotProps.data.unit" 
                  :class="getStockChipClass(slotProps.data.stockQty)"
                />
              </template>
            </Column>
            
            <Column field="saveQuantity" header="Tồn an toàn" sortable>
              <template #body="slotProps">
                <span>{{ slotProps.data.saveQuantity }} {{ slotProps.data.unit }}</span>
              </template>
            </Column>
            
            <Column header="Hành động" class="w-36">
              <template #body="slotProps">
                <div class="flex gap-2">
                  <Button 
                    icon="pi pi-pencil" 
                    text 
                    rounded 
                    severity="secondary" 
                    @click="openEditDialog(slotProps.data)"
                    v-tooltip.top="'Sửa'"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    text 
                    rounded 
                    severity="danger"
                    @click="confirmDeleteItem(slotProps.data)"
                    v-tooltip.top="'Xóa'"
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
      <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Loại <span style="color: #ef4444;">*</span>
          </label>
          <InputText 
            v-model="editForm.type" 
            style="width: 100%;"
            placeholder="Nhập loại sản phẩm"
          />
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Đơn vị <span style="color: #ef4444;">*</span>
          </label>
          <InputText 
            v-model="editForm.unit" 
            style="width: 100%;"
            placeholder="VD: cái, hộp, kg"
          />
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Giá <span style="color: #ef4444;">*</span>
          </label>
          <InputText 
            v-model="editForm.price" 
            style="width: 100%;"
            placeholder="0.00"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
              Tồn an toàn <span style="color: #ef4444;">*</span>
            </label>
            <InputText 
              v-model.number="editForm.saveQuantity" 
              type="number"
              style="width: 100%;"
              placeholder="0"
            />
          </div>

          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
              Số lượng tồn <span style="color: #ef4444;">*</span>
            </label>
            <InputText 
              v-model.number="editForm.stockQty" 
              type="number"
              style="width: 100%;"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button 
          label="Hủy" 
          icon="pi pi-times" 
          text 
          @click="closeEditDialog"
          :disabled="loading"
        />
        <Button 
          label="Cập nhật" 
          icon="pi pi-check" 
          @click="saveEdit"
          :loading="loading"
        />
      </template>
    </Dialog>

    <!-- Confirm Dialog -->
    <ConfirmDialog></ConfirmDialog>
    
    <!-- Toast for notifications -->
    <Toast />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useItem } from '@/composables/useItem'
import { useConfirm } from 'primevue/useconfirm'
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

const router = useRouter()
const confirm = useConfirm()

// Không destructure items, giữ nguyên object
const itemComposable = useItem()
const { loading, fetchItems, deleteItem, getImageUrl, updateItem } = itemComposable

const searchQuery = ref('')
const filters = ref({
  global: { value: '', matchMode: 'contains' }
})

const showEditDialog = ref(false)
const editingItem = ref<Item | null>(null)
const editForm = ref({
  type: '',
  unit: '',
  price: '',
  saveQuantity: 0,
  stockQty: 0
})

// Sử dụng itemComposable.items thay vì items
const displayItems = computed(() => {
  if (!itemComposable.items.value || itemComposable.items.value.length === 0) {
    return []
  }
  
  const list = [...itemComposable.items.value]
  
  const searchTerm = filters.value.global.value
  if (!searchTerm) return list

  const term = searchTerm.toLowerCase()
  return list.filter(item => {
    const name = getProductName(item).toLowerCase()
    const category = getProductCategory(item).toLowerCase()
    return (
      name.includes(term) ||
      category.includes(term) ||
      item.type.toLowerCase().includes(term) ||
      item.id?.toString().includes(term)
    )
  })
})

const totalFilteredItems = computed(() => displayItems.value?.length || 0)

const lowStockCount = computed(() => 
  displayItems.value?.filter(i => i.stockQty < 10).length || 0
)

// Lifecycle
onMounted(async () => {
  await fetchItems()
})

// Handlers
const navigateToAddProduct = () => router.push('/add-product')

const getProductName = (item: Item): string => {
  return item.eng?.partname || item.com?.name || 'Unknown'
}

const getProductCategory = (item: Item): string => {
  if (item.eng) return 'Hàng kỹ thuật'
  if (item.com) return 'Hàng tiêu dùng'
  return 'Chưa phân loại'
}

const getProductImage = (item: Item): string => {
  if (item.picture?.length > 0) return getImageUrl(item.picture[0])
  return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'
}

const getStockChipClass = (stock: number): string => {
  return stock < 10 ? 'p-chip-danger' : 'p-chip-success'
}

const openEditDialog = (item: Item) => {
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

const closeEditDialog = () => {
  showEditDialog.value = false
  editingItem.value = null
}

const saveEdit = async () => {
  if (!editingItem.value?.id) return
  const result = await updateItem(editingItem.value.id, editForm.value)
  if (result?.success) {
    closeEditDialog()
    await fetchItems()
  }
}

const confirmDeleteItem = (item: Item) => {
  confirm.require({
    message: `Bạn có chắc muốn xóa "${getProductName(item)}"?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    acceptClass: 'p-button-danger',
    accept: async () => {
      if (item.id) {
        const result = await deleteItem(item.id)
        if (result?.success) await fetchItems()
      }
    }
  })
}
</script>

<style scoped>
:deep(nav.p-datatable-paginator-bottom) {
  border-bottom: none !important;
}

:deep(.p-input-icon-left > i) {
  left: 0.75rem;
  color: #94a3b8;
}

:deep(.p-input-icon-left > .p-inputtext) {
  padding-left: 2.5rem;
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

:deep(.p-paginator .p-paginator-current) {
  color: #64748b;
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
</style>