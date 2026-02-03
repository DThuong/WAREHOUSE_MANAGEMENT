<template>
  <MainLayout>
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold mb-4 text-gray-900">Quản lý đơn hàng</h2>
          <p class="text-gray-600">Theo dõi và xử lý đơn đặt hàng</p>
        </div>
        <Button 
          label="Tạo đơn hàng mới" 
          icon="pi pi-plus" 
          class="btn-primary" 
          @click="openCreateOrderDialog"
        />
      </div>

      <Card>
        <!-- Statistics -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="stat-card pending">
            <div class="stat-icon">
              <i class="pi pi-clock"></i>
            </div>
            <div>
              <p class="stat-label">Chờ xử lý</p>
              <p class="stat-value">{{ orderStore.pendingOrders.length }}</p>
            </div>
          </div>

          <div class="stat-card approved">
            <div class="stat-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <div>
              <p class="stat-label">Đã duyệt</p>
              <p class="stat-value">{{ orderStore.approvedOrders.length }}</p>
            </div>
          </div>

          <div class="stat-card completed">
            <div class="stat-icon">
              <i class="pi pi-verified"></i>
            </div>
            <div>
              <p class="stat-label">Hoàn thành</p>
              <p class="stat-value">{{ orderStore.completedOrders.length }}</p>
            </div>
          </div>

          <div class="stat-card rejected">
            <div class="stat-icon">
              <i class="pi pi-times-circle"></i>
            </div>
            <div>
              <p class="stat-label">Từ chối</p>
              <p class="stat-value">{{ orderStore.rejectedOrders.length }}</p>
            </div>
          </div>
        </div>

        <!-- Search & Filter -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-4">
            <span class="text-lg font-semibold text-gray-900">
              Tổng: {{ totalFilteredOrders }} đơn hàng
            </span>
          </div>
          
          <div class="flex gap-3">
            <Dropdown 
              v-model="selectedStatus" 
              :options="statusOptions" 
              optionLabel="label" 
              placeholder="Lọc theo trạng thái"
              class="w-56"
              showClear
            />
            
            <span class="p-input-icon-left w-80">
              <i class="pi pi-search" />
              <InputText 
                v-model="searchQuery" 
                placeholder="Tìm kiếm theo ID, người đặt..." 
                class="w-full"
              />
            </span>
          </div>
        </div>

        <template #content>
          <DataTable 
            :value="filteredOrders" 
            :paginator="true" 
            :rows="10"
            :loading="orderStore.loading"
            responsiveLayout="scroll"
          >
            <template #empty>
              <div class="text-center py-8">
                <i class="pi pi-shopping-cart text-5xl text-gray-400"></i>
                <p class="mt-4 text-gray-500">Chưa có đơn hàng nào</p>
              </div>
            </template>

            <Column field="id" header="ID" sortable class="w-20"></Column>
            
            <Column field="orderDate" header="Ngày đặt" sortable>
              <template #body="{ data }">
                {{ formatDate(data.orderDate) }}
              </template>
            </Column>

            <Column field="nameWorker" header="Người đặt" sortable>
              <template #body="{ data }">
                <span class="font-medium">{{ data.nameWorker || data.account?.username || '-' }}</span>
              </template>
            </Column>

            <Column field="account.department" header="Phòng ban" sortable></Column>
            
            <Column header="Sản phẩm">
              <template #body="{ data }">
                <div class="flex flex-col gap-1">
                  <Chip 
                    :label="`${data.orderDetails.length} sản phẩm`" 
                    class="p-chip-info"
                  />
                  <span class="text-xs text-gray-500">
                    Tổng: {{ getTotalQuantity(data) }} món
                  </span>
                </div>
              </template>
            </Column>

            <Column field="status" header="Trạng thái" sortable>
              <template #body="{ data }">
                <Chip 
                  :label="data.status" 
                  :class="getStatusClass(data.status)"
                />
              </template>
            </Column>
            
            <Column header="Hành động" class="w-52">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button 
                    icon="pi pi-eye" 
                    text 
                    rounded 
                    severity="info"
                    @click="viewOrderDetails(data)"
                    title="Xem chi tiết"
                  />
                  <Button 
                    icon="pi pi-images" 
                    text 
                    rounded 
                    severity="secondary"
                    @click="viewOrderImages(data)"
                    title="Quản lý ảnh"
                  />
                  <Button 
                        v-if="data.status === 'Pending' || data.status === 'Approved'"
                        icon="pi pi-pencil" 
                        text 
                        rounded 
                        severity="warning"
                        @click="openUpdateStatusDialog(data)"
                        title="Cập nhật trạng thái"
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

    <!-- Order Details Dialog -->
    <Dialog 
      v-model:visible="showDetailsDialog" 
      :header="`Chi tiết đơn hàng #${selectedOrder?.id || ''}`"
      :style="{ width: '900px' }"
      :modal="true"
    >
      <div v-if="selectedOrder" class="order-details">
        <!-- Order Info -->
        <div class="grid grid-cols-2 gap-4 mb-4 p-4! bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm text-gray-600">Người đặt</p>
            <p class="font-semibold">{{ selectedOrder.nameWorker || selectedOrder.account?.username || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Phòng ban</p>
            <p class="font-semibold">{{ selectedOrder.account?.department || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Ngày đặt</p>
            <p class="font-semibold">{{ formatDate(selectedOrder.orderDate) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Trạng thái</p>
            <Chip :label="selectedOrder.status" :class="getStatusClass(selectedOrder.status)" />
          </div>
        </div>

        <!-- Order Items -->
        <div>
          <h4 class="font-semibold mb-3">Danh sách sản phẩm</h4>
          <DataTable :value="selectedOrder.orderDetails" responsiveLayout="scroll">
            <Column header="Sản phẩm">
              <template #body="{ data }">
                <div class="flex items-center gap-3">
                  <img 
                    v-if="data.item?.picture?.length"
                    :src="getItemImageUrl(data.item.picture[0])" 
                    class="w-12 h-12 rounded object-cover" 
                  />
                  <div v-else class="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                    <i class="pi pi-image text-gray-400"></i>
                  </div>
                  <div>
                    <p class="font-semibold">{{ getItemName(data.item) }}</p>
                    <p class="text-sm text-gray-500">{{ data.item?.type || '-' }}</p>
                  </div>
                </div>
              </template>
            </Column>
            <Column field="orderQty" header="Số lượng">
              <template #body="{ data }">
                <span class="font-medium">{{ data.orderQty }} {{ data.item?.unit || '' }}</span>
              </template>
            </Column>
            <Column header="Đơn giá">
              <template #body="{ data }">
                <span v-if="data.item?.price">
                  {{ Number(data.item.price).toLocaleString('vi-VN') }} VND
                </span>
                <span v-else class="text-gray-400">Chưa có giá</span>
              </template>
            </Column>
            <Column header="Thành tiền">
              <template #body="{ data }">
                <span v-if="data.item?.price" class="font-semibold text-blue-600">
                  {{ (Number(data.item.price) * data.orderQty).toLocaleString('vi-VN') }} VND
                </span>
                <span v-else class="text-gray-400">---</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <template #footer>
        <Button label="Đóng" icon="pi pi-times" @click="showDetailsDialog = false" />
      </template>
    </Dialog>

    <Dialog 
    v-model:visible="showUpdateStatusDialog" 
    header="Cập nhật trạng thái đơn hàng"
    :style="{ width: '500px' }"
    :modal="true"
    >
    <div class="flex flex-col gap-4 mt-4">
        <div>
        <label class="block mb-2 font-semibold">
            Trạng thái <span class="text-red-500">*</span>
        </label>
        <Dropdown 
            v-model="updateForm.status" 
            :options="updateStatusOptions" 
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn trạng thái"
            class="w-full"
        />
        </div>

        <!-- Cảnh báo khi chọn Completed -->
        <div 
            v-if="updateForm.status === 'Completed' && selectedOrder && (!selectedOrder.image || selectedOrder.image.length === 0)" 
            class="p-3! bg-orange-50 border border-orange-200 rounded-lg"
            >
            <div class="flex items-start gap-2">
                <i class="pi pi-exclamation-triangle text-orange-600 mt-1"></i>
                <div class="flex-1">
                <p class="font-semibold text-orange-800 text-sm mb-1">Yêu cầu hình ảnh minh chứng</p>
                <p class="text-orange-700 text-xs">
                    Vui lòng tải lên ít nhất 1 hình ảnh minh chứng đã nhận hàng trước khi hoàn thành đơn hàng.
                </p>
                <Button 
                    label="Quản lý hình ảnh" 
                    icon="pi pi-images" 
                    size="small"
                    text
                    class="mt-2! p-0!"
                    @click="navigateToImageManagement"
                />
                </div>
            </div>
        </div>

        <!-- Info về đơn hàng -->
        <div v-if="selectedOrder" class="p-3! bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-600 mb-1">
            Đơn hàng: <span class="font-semibold">#{{ selectedOrder.id }}</span>
        </p>
        <p class="text-sm text-gray-600 mb-1">
            Người đặt: <span class="font-semibold">{{ selectedOrder.nameWorker || selectedOrder.account?.username }}</span>
        </p>
        <p class="text-sm text-gray-600 mb-1">
            Trạng thái hiện tại: 
            <Chip :label="selectedOrder.status" :class="getStatusClass(selectedOrder.status)" class="ml-1" />
        </p>
        <!-- Hiển thị số lượng ảnh -->
        <p class="text-sm text-gray-600">
            Hình ảnh: 
            <span class="font-semibold">{{ selectedOrder.image?.length || 0 }} ảnh</span>
        </p>
        </div>
    </div>

    <template #footer>
        <Button 
        label="Hủy" 
        icon="pi pi-times" 
        text 
        @click="showUpdateStatusDialog = false" 
        :disabled="orderStore.loading" 
        />
        <Button 
        label="Cập nhật" 
        icon="pi pi-check" 
        @click="saveUpdateStatus" 
        :loading="orderStore.loading"
        :disabled="!updateForm.status"
        />
    </template>
    </Dialog>

    <!-- Image Management Dialog -->
    <Dialog 
      v-model:visible="showImageDialog" 
      :header="`Quản lý hình ảnh - Đơn hàng #${selectedOrder?.id || ''}`"
      :style="{ width: '800px' }"
      :modal="true"
    >
      <div class="mt-4">
        <!-- Upload Area -->
        <div class="mb-6">
          <label class="block mb-2 font-semibold">
            Tải lên hình ảnh mới
            <span v-if="orderStore.uploadingImages" class="text-primary text-sm ml-2">
              <i class="pi pi-spin pi-spinner"></i> Đang tải lên...
            </span>
          </label>
          
          <div 
            @click="!orderStore.uploadingImages && imageFileInput?.click()"
            class="min-h-25 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-gray-50 flex flex-col justify-center items-center"
            :class="orderStore.uploadingImages ? 'opacity-50 cursor-not-allowed' : 'border-gray-400'"
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
            :disabled="orderStore.uploadingImages"
            class="hidden" 
            @change="handleImageUpload"
          />

          <!-- Pending Images -->
          <div v-if="pendingImages.length > 0" class="mt-4!">
            <div class="flex justify-between items-center mb-2!">
              <span class="font-medium text-sm">Đã chọn {{ pendingImages.length }} file</span>
              <div class="flex gap-2">
                <Button label="Xóa tất cả" icon="pi pi-trash" text size="small" severity="danger" @click="clearPendingImages" />
                <Button label="Tải lên" icon="pi pi-upload" size="small" severity="success" :loading="orderStore.uploadingImages" @click="uploadPendingImages" />
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
                  class="absolute! top-1 right-1 bg-white/95!"
                  @click="removePendingImage(index)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Current Images -->
        <div>
          <label class="font-semibold mb-3 block">Hình ảnh hiện tại ({{ currentImages.length }})</label>

          <div v-if="currentImages.length === 0" class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <i class="pi pi-image text-5xl text-gray-400"></i>
            <p class="mt-4 text-gray-500">Chưa có hình ảnh</p>
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
                :loading="orderStore.deletingImage"
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

    <!-- Create Order Dialog -->
    <Dialog 
      v-model:visible="showCreateOrderDialog" 
      header="Tạo đơn hàng mới"
      :style="{ width: '1200px' }"
      :modal="true"
    >
      <div class="flex flex-col gap-4 mt-4">
        <!-- Name Worker -->
        <div>
          <label class="block mb-2 font-semibold">
            Tên người đặt hàng <span class="text-red-500">*</span>
          </label>
          <InputText 
            v-model="createOrderForm.nameWorker" 
            class="w-full" 
            placeholder="Nhập tên người đặt hàng..."
          />
        </div>

        <!-- Items Selection -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <label class="text-base font-semibold">
              Danh sách sản phẩm đặt hàng <span class="text-red-500">*</span>
            </label>
            <Button 
              label="Thêm sản phẩm" 
              icon="pi pi-plus" 
              size="small"
              @click="addItemRow"
            />
          </div>

          <div v-if="createOrderForm.items.length === 0" class="text-center py-8 rounded-lg border-2 border-dashed border-gray-300">
            <i class="pi pi-shopping-cart text-5xl text-gray-400"></i>
            <p class="mt-3! text-gray-500 font-medium">Chưa có sản phẩm nào</p>
            <Button 
              label="Thêm sản phẩm đầu tiên" 
              icon="pi pi-plus" 
              text
              class="mt-2!"
              @click="addItemRow"
            />
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="(item, index) in createOrderForm.items" 
              :key="index"
              class="flex items-end gap-3 p-4"
            >
              <!-- Item Dropdown -->
              <div class="w-lg">
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
                          {{ getSelectedItemPrice(slotProps.value).toLocaleString('vi-VN') }} VND/{{ getSelectedItemUnit(slotProps.value) }}
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
                          {{ slotProps.option.type }} - 
                          Tồn: {{ slotProps.option.stock }} {{ slotProps.option.unit }} - 
                          {{ Number(slotProps.option.price).toLocaleString('vi-VN') }} VND
                        </div>
                      </div>
                    </div>
                  </template>
                </Dropdown>
              </div>

              <!-- Quantity -->
              <div class="w-md">
                <label class="block mb-2 text-sm font-medium text-gray-700">Số lượng</label>
                <InputNumber 
                  v-model="item.quantity" 
                  :min="1"
                  showButtons
                  class="w-full"
                />
              </div>

              <!-- Subtotal -->
              <div class="w-48">
                <label class="block mb-2 text-sm font-medium text-gray-700 text-center">Thành tiền</label>
                <div class="h-10 flex items-center justify-center">
                  <Chip 
                    v-if="item.itemId && item.quantity > 0"
                    :label="`${getItemSubtotal(item.itemId, item.quantity).toLocaleString('vi-VN')} VND`" 
                    class="bg-green-100 text-green-700 font-bold px-3 py-1"
                  />
                  <span v-else class="text-gray-400 text-sm">---</span>
                </div>
              </div>

              <!-- Remove Button -->
              <div class="w-8">
                <label class="block mb-2 text-sm font-medium select-none">Xóa</label>
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
        <div v-if="createOrderForm.items.length > 0" class="mt-4 p-4! bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-gray-700">Tổng số mặt hàng:</span>
            <span class="text-xl font-bold text-blue-600">{{ createOrderForm.items.length }} mặt hàng</span>
          </div>
          <div class="flex items-center justify-between mt-2!">
            <span class="font-semibold text-gray-700">Tổng số lượng đặt:</span>
            <span class="text-xl font-bold text-blue-600">{{ totalQuantity.toLocaleString('vi-VN') }} sản phẩm</span>
          </div>
          <div class="flex items-center justify-between mt-2! pt-2! border-t border-blue-200">
            <span class="font-semibold text-gray-800">Tổng giá trị đơn hàng:</span>
            <span class="text-2xl font-bold text-indigo-600">{{ totalAmount.toLocaleString('vi-VN') }} VND</span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button 
          label="Hủy" 
          icon="pi pi-times" 
          text 
          @click="closeCreateDialog" 
          :disabled="orderStore.loading"
        />
        <Button 
          label="Tạo đơn hàng" 
          icon="pi pi-check" 
          @click="submitCreate"
          :loading="orderStore.loading"
          :disabled="!isFormValid"
        />
      </template>
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import { useItemStore } from '@/stores/itemStore'
import { orderAPI } from '@/services/orderAPI'
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
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import type { Order } from '@/types/order.types'

const confirm = useConfirm()
const toast = useToast()
const orderStore = useOrderStore()
const itemStore = useItemStore()

// Search & Filter
const searchQuery = ref('')
const selectedStatus = ref<{label: string, value: string} | null>(null)

const statusOptions = [
  { label: 'Chờ xử lý', value: 'Pending' },
  { label: 'Đã duyệt', value: 'Approved' },
  { label: 'Từ chối', value: 'Rejected' },
  { label: 'Hoàn thành', value: 'Completed' },
]

const updateStatusOptions = computed(() => {
  if (!selectedOrder.value) return []
  
  if (selectedOrder.value.status === 'Pending') {
    return [
      { label: 'Duyệt đơn hàng', value: 'Approved' },
      { label: 'Từ chối đơn hàng', value: 'Rejected' }
    ]
  } else if (selectedOrder.value.status === 'Approved') {
    return [
      { label: 'Hoàn thành (Đã giao hàng)', value: 'Completed' }
    ]
  }
  
  return []
})

const filteredOrders = computed(() => {
  if (!orderStore.orders?.length) return []
  
  let filtered = orderStore.orders

  if (selectedStatus.value) {
    filtered = filtered.filter(order => order.status === selectedStatus.value?.value)
  }

  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.id?.toString().includes(term) ||
      order.account?.username.toLowerCase().includes(term) ||
      order.account?.department.toLowerCase().includes(term) ||
      order.nameWorker.toLowerCase().includes(term)
    )
  }

  return filtered
})

const totalFilteredOrders = computed(() => filteredOrders.value.length)

// Dialogs
const showDetailsDialog = ref(false)
const showUpdateStatusDialog = ref(false)
const showImageDialog = ref(false)
const showCreateOrderDialog = ref(false)
const selectedOrder = ref<Order | null>(null)

// Update Form
const updateForm = ref({
  status: ''
})

// Create Order Form
interface CreateOrderItem {
  itemId: number
  quantity: number
}

const createOrderForm = ref({
  nameWorker: '',
  items: [] as CreateOrderItem[]
})

// Available items for selection
const availableItems = computed(() => {
  if (!itemStore.items?.length) return []
  
  return itemStore.items.map(item => ({
    value: item.id,
    label: getItemName(item),
    type: item.type,
    stock: item.stockQty,
    unit: item.unit,
    price: item.price || 0,
    image: item.picture?.length ? getItemImageUrl(item.picture[0]) : null
  }))
})

// Form validation
const isFormValid = computed(() => {
  return createOrderForm.value.nameWorker.trim() !== '' &&
         createOrderForm.value.items.length > 0 && 
         createOrderForm.value.items.every(item => item.itemId && item.quantity > 0)
})

// Total quantity
const totalQuantity = computed(() => {
  return createOrderForm.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

// Total amount
const totalAmount = computed(() => {
  return createOrderForm.value.items.reduce((sum, item) => {
    const itemData = availableItems.value.find(i => i.value === item.itemId)
    if (itemData && item.quantity > 0) {
      return sum + (Number(itemData.price) * item.quantity)
    }
    return sum
  }, 0)
})

// Image Management
const currentImages = ref<string[]>([])
const pendingImages = ref<File[]>([])
const pendingImagePreviews = ref<string[]>([])
const imageFileInput = ref<HTMLInputElement | null>(null)

onMounted(async () => {
  await Promise.all([
    fetchAllOrders(),
    fetchAllItems()
  ])
})

const fetchAllOrders = async () => {
  orderStore.setLoading(true)
  try {
    const orders = await orderAPI.getAll()
    orderStore.setOrders(orders)
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể tải danh sách đơn hàng',
      life: 3000
    })
  } finally {
    orderStore.setLoading(false)
  }
}

const fetchAllItems = async () => {
  try {
    const items = await itemAPI.getAll()
    itemStore.setItems(items)
  } catch (error: any) {
    console.error('Error loading items:', error)
  }
}

// Helper Functions
const getImageUrl = (filename: string) => {
  if (!filename) return ''
  if (filename.startsWith('http')) return filename
  return `${import.meta.env.WAREHOUSE_URL}/api/Order/image/${filename}`
}

const getItemImageUrl = (filename: string) => {
  if (!filename) return ''
  if (filename.startsWith('http')) return filename
  return `${import.meta.env.WAREHOUSE_URL}/api/Item/image/${filename}`
}

const getItemName = (item: any) => 
  item.eng?.partname || item.com?.name || 'Unknown'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const navigateToImageManagement = () => {
  showUpdateStatusDialog.value = false
  if (selectedOrder.value) {
    viewOrderImages(selectedOrder.value)
  }
}

const getTotalQuantity = (order: Order) => {
  return order.orderDetails.reduce((sum, detail) => sum + detail.orderQty, 0)
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'Pending': 'p-chip-warning',
    'Approved': 'p-chip-info',
    'Completed': 'p-chip-success',
    'Rejected': 'p-chip-danger',
  }
  return classes[status] || 'p-chip-secondary'
}

// Helper functions for selected items
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

const getSelectedItemPrice = (itemId: number) => {
  const item = availableItems.value.find(i => i.value === itemId)
  return item?.price || 0
}

const getItemSubtotal = (itemId: number, quantity: number) => {
  const price = getSelectedItemPrice(itemId)
  return price * quantity
}

// Dialog Handlers
const viewOrderDetails = (order: Order) => {
  selectedOrder.value = order
  showDetailsDialog.value = true
}

const openUpdateStatusDialog = (order: Order) => {
  selectedOrder.value = order
  updateForm.value.status = order.status
  showUpdateStatusDialog.value = true
}

const saveUpdateStatus = async () => {
  if (!selectedOrder.value?.id) return
  
  if (!updateForm.value.status) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng chọn trạng thái',
      life: 3000
    })
    return
  }
  
  if (updateForm.value.status === 'Completed') {
    if (!selectedOrder.value.image || selectedOrder.value.image.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Thiếu hình ảnh minh chứng',
        detail: 'Vui lòng tải lên ít nhất 1 hình ảnh minh chứng đã nhận hàng trước khi hoàn thành đơn hàng',
        life: 4000
      })
      return
    }
  }
  
  orderStore.setLoading(true)
  
  try {
    await orderAPI.updateStatus(selectedOrder.value.id, updateForm.value.status)
    
    const statusMessages: Record<string, string> = {
      'Approved': 'Đã duyệt đơn hàng thành công',
      'Rejected': 'Đã từ chối đơn hàng',
      'Completed': 'Đã hoàn thành đơn hàng'
    }
    
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: statusMessages[updateForm.value.status] || 'Cập nhật trạng thái thành công',
      life: 3000
    })
    
    showUpdateStatusDialog.value = false
    await fetchAllOrders()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể cập nhật trạng thái',
      life: 3000
    })
  } finally {
    orderStore.setLoading(false)
  }
}
const confirmDelete = (order: Order) => {
  confirm.require({
    message: `Bạn có chắc muốn xóa đơn hàng #${order.id}?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    acceptClass: 'p-button-danger',
    accept: async () => {
      if (order.id) {
        orderStore.setLoading(true)
        
        try {
          await orderAPI.delete(order.id)
          
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Xóa đơn hàng thành công',
            life: 3000
          })
          
          await fetchAllOrders()
        } catch (error: any) {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể xóa đơn hàng',
            life: 3000
          })
        } finally {
          orderStore.setLoading(false)
        }
      }
    }
  })
}

// Create Order Handlers
const openCreateOrderDialog = () => {
  createOrderForm.value = {
    nameWorker: '',
    items: []
  }
  showCreateOrderDialog.value = true
}

const closeCreateDialog = () => {
  showCreateOrderDialog.value = false
  createOrderForm.value = {
    nameWorker: '',
    items: []
  }
}

const addItemRow = () => {
  createOrderForm.value.items.push({
    itemId: 0,
    quantity: 1
  })
}

const removeItemRow = (index: number) => {
  createOrderForm.value.items.splice(index, 1)
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

  orderStore.setLoading(true)
  
  try {
    const requestData = {
      nameWorker: createOrderForm.value.nameWorker.trim(),
      itemIds: createOrderForm.value.items.map(item => ({
        itemId: item.itemId,
        orderQty: item.quantity
      }))
    }

    await orderAPI.create(requestData)
    
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Tạo đơn hàng thành công',
      life: 3000
    })
    
    closeCreateDialog()
    await fetchAllOrders()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể tạo đơn hàng',
      life: 3000
    })
  } finally {
    orderStore.setLoading(false)
  }
}

// Image Handlers
const viewOrderImages = async (order: Order) => {
  selectedOrder.value = order
  
  if (order.id) {
    try {
      const orderData = await orderAPI.getById(order.id)
      currentImages.value = orderData.image || []
      orderStore.setCurrentOrder(orderData)
    } catch (error) {
      currentImages.value = order.image || []
    }
  } else {
    currentImages.value = order.image || []
  }
  
  showImageDialog.value = true
}

const closeImageDialog = () => {
  showImageDialog.value = false
  selectedOrder.value = null
  currentImages.value = []
  clearPendingImages()
  orderStore.setCurrentOrder(null)
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
      toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: `File ${file.name} quá lớn`, life: 3000 })
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
  if (!selectedOrder.value?.id || !pendingImages.value.length) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Không có file nào', life: 3000 })
    return
  }

  orderStore.setUploadingImages(true)
  
  try {
    const result = await orderAPI.uploadImagesSequentially(selectedOrder.value.id, pendingImages.value)
    
    if (result.success > 0) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Đã tải lên ${result.success}/${pendingImages.value.length} ảnh`,
        life: 3000
      })

      clearPendingImages()
      
      if (selectedOrder.value.id) {
        const orderData = await orderAPI.getById(selectedOrder.value.id)
        currentImages.value = orderData.image || []
        orderStore.setCurrentOrder(orderData)
      }
      
      await fetchAllOrders()
    }

    if (result.failed > 0) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: `${result.failed} ảnh thất bại`,
        life: 5000
      })
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể tải lên',
      life: 3000
    })
  } finally {
    orderStore.setUploadingImages(false)
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
      if (!selectedOrder.value?.id) return

      const filename = imageName.split('/').pop() || imageName
      
      orderStore.setDeletingImage(true)
      
      try {
        await orderAPI.deleteImage(selectedOrder.value.id, filename)
        
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa hình ảnh',
          life: 3000
        })
        
        if (selectedOrder.value.id) {
          const orderData = await orderAPI.getById(selectedOrder.value.id)
          currentImages.value = orderData.image || []
          orderStore.setCurrentOrder(orderData)
        }
        
        await fetchAllOrders()
      } catch (error: any) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.message || 'Không thể xóa',
          life: 3000
        })
      } finally {
        orderStore.setDeletingImage(false)
      }
    }
  })
}

const viewImageFullscreen = (imageUrl: string) => {
  window.open(getImageUrl(imageUrl), '_blank')
}
</script>

<style scoped>
/* Statistics Cards */
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-card.pending .stat-icon {
  background: #fef3c7;
  color: #f59e0b;
}

.stat-card.approved .stat-icon {
  background: #dbeafe;
  color: #3b82f6;
}

.stat-card.completed .stat-icon {
  background: #dcfce7;
  color: #22c55e;
}

.stat-card.rejected .stat-icon {
  background: #fee2e2;
  color: #ef4444;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

/* Image Container */
.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
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
</style>