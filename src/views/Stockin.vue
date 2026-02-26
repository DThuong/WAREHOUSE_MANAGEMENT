<template>
  <ImagePreviewDialog
    :visible="imagePreview.visible.value"
    :current-src="imagePreview.currentSrc.value"
    :images="imagePreview.images.value"
    :current-index="imagePreview.currentIndex.value"
    @close="imagePreview.close()"
    @prev="imagePreview.prev()"
    @next="imagePreview.next()"
    @goto="(i) => { imagePreview.currentIndex.value = i; imagePreview.currentSrc.value = imagePreview.images.value[i] }"
  />
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
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Từ ngày</label>
                <Calendar
                  v-model="fromDate"
                  dateFormat="dd/mm/yy"
                  showIcon showTime hourFormat="24"
                  class="w-full calendar-full-width"
                  @date-select="fetchAllStockins"
                />
              </div>
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">Đến ngày</label>
                <Calendar
                  v-model="toDate"
                  dateFormat="dd/mm/yy"
                  showIcon showTime hourFormat="24"
                  class="w-full calendar-full-width"
                  @date-select="fetchAllStockins"
                />
              </div>
            </div>
            <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div class="flex items-center">
                <span class="text-lg font-semibold text-gray-900">
                  Tổng: {{ totalFilteredItems }} phiếu nhập
                </span>
              </div>
              <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <span class="p-input-icon-left w-full md:w-80">
                  <InputText
                    v-model="searchQuery"
                    placeholder="Tìm kiếm theo ghi chú, người tạo..."
                    class="w-full"
                  />
                </span>
                <Button
                  label="Reset" icon="pi pi-refresh" severity="secondary"
                  class="w-full md:w-auto"
                  @click="clearDateFilter"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div>
            <div v-if="stockinStore.loading" class="text-center py-8">
              <i class="pi pi-spin pi-spinner text-3xl text-gray-400"></i>
            </div>
            <div v-else-if="filteredStockins.length === 0" class="text-center py-8">
              <i class="pi pi-inbox text-5xl text-gray-400"></i>
              <p class="mt-4 text-gray-500">Chưa có phiếu nhập nào</p>
            </div>
            <div v-else class="stockin-card-list">
              <div
                v-for="stockin in filteredStockins"
                :key="stockin.id"
                class="stockin-card"
                @click="viewDetail(stockin)"
              >
                <div class="stockin-card-header">
                  <span class="stockin-card-id">#{{ stockin.id }}</span>
                  <span class="stockin-card-date">{{ formatDate(stockin.stockInDate) }}</span>
                </div>
                <div class="stockin-card-body">
                  <div class="stockin-card-row">
                    <i class="pi pi-user text-gray-400"></i>
                    <span class="stockin-card-label">Người tạo</span>
                    <span class="stockin-card-value">{{ stockin.account?.username || '-' }}</span>
                  </div>
                  <div class="stockin-card-row">
                    <i class="pi pi-box text-gray-400"></i>
                    <span class="stockin-card-label">Sản phẩm</span>
                    <span class="stockin-card-value">{{ stockin.stockInDetails?.length || 0 }} SP</span>
                  </div>
                  <div class="stockin-card-row">
                    <i class="pi pi-images text-gray-400"></i>
                    <span class="stockin-card-label">Hình ảnh</span>
                    <span class="stockin-card-value">{{ stockin.image?.length || 0 }} ảnh</span>
                  </div>
                  <div v-if="stockin.note" class="stockin-card-row">
                    <i class="pi pi-file-edit text-gray-400"></i>
                    <span class="stockin-card-label">Ghi chú</span>
                    <span class="stockin-card-value truncate">{{ stockin.note }}</span>
                  </div>
                </div>
                <div class="stockin-card-footer" @click.stop>
                  <Button icon="pi pi-eye" label="Chi tiết" text size="small" severity="info" @click="viewDetail(stockin)" />
                  <Button icon="pi pi-images" label="Ảnh" text size="small" severity="secondary" @click="viewImages(stockin)" />
                  <Button icon="pi pi-trash" label="Xóa" text size="small" severity="danger" @click="confirmDelete(stockin)" />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- ==================== CREATE STOCKIN DIALOG ==================== -->
    <Dialog
      v-model:visible="showCreateDialog"
      header="Tạo phiếu nhập mới"
      :style="{ width: '900px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
    >
      <div class="flex flex-col gap-4 mt-4">
        <!-- Ghi chú -->
        <div>
          <label class="block mb-2 font-semibold">Ghi chú</label>
          <Textarea
            v-model="createForm.note"
            rows="3"
            class="w-full"
            placeholder="Nhập ghi chú cho phiếu nhập..."
          />
        </div>

        <!-- Danh sách sản phẩm -->
        <div>
          <div class="flex md:flex-row lg:flex-row flex-col justify-between items-center mb-3 gap-2">
            <label class="text-base font-semibold">
              Danh sách sản phẩm nhập <span class="text-red-500">*</span>
            </label>
            <Button label="Thêm sản phẩm" icon="pi pi-plus" size="small" @click="addItemRow" />
          </div>

          <div v-if="createForm.items.length === 0"
            class="text-center py-8 rounded-lg border-2 border-dashed border-gray-300 mt-2!">
            <i class="pi pi-box text-4xl text-gray-300 mb-2 block"></i>
            <p class="text-gray-500 font-medium mb-2">Chưa có sản phẩm nào</p>
            <Button label="Thêm sản phẩm đầu tiên" icon="pi pi-plus" text @click="addItemRow" />
          </div>

          <div v-else class="flex flex-col gap-3 mt-2!">
            <div
              v-for="(item, index) in createForm.items"
              :key="index"
              class="flex flex-col gap-3 p-4! border-2 border-gray-200 rounded-xl bg-gray-50 shadow-sm"
            >
              <!-- Badge + Xóa -->
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-500 px-2 py-0.5 rounded-full">
                  Sản phẩm {{ index + 1 }}
                </span>
                <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="removeItemRow(index)" />
              </div>

              <!-- Dropdown sản phẩm -->
              <div>
                <label class="block mb-1.5 text-sm font-medium text-gray-700">Sản phẩm</label>
                <Dropdown
                  v-model="item.itemId"
                  :options="availableItems"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Chọn sản phẩm"
                  class="w-full"
                  :filter="true"
                  appendTo="body"
                  panelClass="stockin-item-dropdown-panel"
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
                    <div class="flex items-center gap-3 py-1">
                      <img
                        v-if="slotProps.option.image"
                        :src="slotProps.option.image"
                        class="w-9 h-9 rounded object-cover shrink-0"
                        alt=""
                      />
                      <div v-else class="w-9 h-9 rounded bg-gray-200 flex items-center justify-center shrink-0">
                        <i class="pi pi-image text-gray-400 text-xs"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-sm truncate">{{ slotProps.option.label }}</div>
                        <div class="text-xs text-gray-500">
                          {{ slotProps.option.type }} · Tồn: {{ slotProps.option.stock }} {{ slotProps.option.unit }}
                        </div>
                      </div>
                    </div>
                  </template>
                </Dropdown>
              </div>

              <!-- Số lượng + Tồn kho -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block mb-1.5 text-sm font-medium text-gray-700">Số lượng</label>
                  <input
                    type="number"
                    v-model="item.quantity"
                    min="1"
                    class="w-full px-3! py-2! border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label class="block mb-1.5 text-sm font-medium text-gray-700">Tồn kho</label>
                  <div class="h-9 flex items-center px-3! bg-blue-50 border border-blue-200 rounded-lg">
                    <span v-if="item.itemId" class="text-blue-700 font-semibold text-sm">
                      {{ getSelectedItemStock(item.itemId) }} {{ getSelectedItemUnit(item.itemId) }}
                    </span>
                    <span v-else class="text-gray-400 text-sm">---</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="createForm.items.length > 0" class="p-4! bg-blue-50 rounded-lg border border-blue-200 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-gray-700">Tổng số mặt hàng:</span>
            <span class="text-xl font-bold text-primary">{{ createForm.items.length }} mặt hàng</span>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="font-semibold text-gray-700">Tổng số lượng nhập:</span>
            <span class="text-xl font-bold text-primary">{{ totalQuantity }} sản phẩm</span>
          </div>
        </div>
      </div>

      <template #footer>
  <Button label="Hủy" icon="pi pi-times" text @click="closeCreateDialog" />
  
  <!-- Bước 1: Chưa có ảnh → chỉ hiện nút Upload -->
  <Button
    v-if="createPendingImages.length === 0"
    label="Upload hình ảnh"
    icon="pi pi-images"
    severity="secondary"
    :disabled="!isFormValid"
    @click="openCreateImageDialog"
  />
  
  <!-- Bước 2: Đã có ảnh → hiện nút Tạo phiếu (và nút đổi ảnh) -->
  <template v-else>
    <Button
      :label="`Đổi ảnh (${createPendingImages.length})`"
      severity="secondary"
      @click="openCreateImageDialog"
    />
    <Button
      label="Tạo phiếu nhập"
      severity="success"
      :loading="isSubmittingCreate"
      @click="confirmAndCreateStockin"
    />
  </template>
      </template>
    </Dialog>

    <!-- CREATE IMAGE DIALOG -->
<Dialog
  v-model:visible="showCreateImageDialog"
  header="Thêm hình ảnh minh chứng"
  :style="{ width: '800px' }"
  :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
  :modal="true"
>
  <div class="mt-4">
    <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
      <p class="text-sm text-blue-700 p-2!">
        Tất cả hình ảnh sẽ được gắn <strong>timestamp</strong> tự động.
        Sau khi xong, đóng dialog để quay lại tạo phiếu nhập.
      </p>
    </div>

    <!-- Mobile: 2 nút -->
    <div v-if="isTableMobile" class="flex gap-2 mb-3">
      <Button label="Chọn ảnh" icon="pi pi-images" severity="secondary" class="flex-1"
        @click="createImageFileInput?.click()" />
      <Button label="Chụp ảnh" icon="pi pi-camera" severity="secondary" class="flex-1"
        @click="createCameraInput?.click()" />
    </div>

    <!-- Desktop: Drop zone -->
    <div v-if="!isTableMobile"
      @click="createImageFileInput?.click()"
      @dragover.prevent @drop.prevent="handleCreateDrop"
      class="border-2 border-dashed border-gray-400 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-all mb-3"
    >
      <div class="flex flex-col items-center justify-center py-4!">
        <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
        <p class="text-gray-600 text-sm font-medium mb-1">Kéo thả hoặc click để chọn</p>
        <p class="text-xs text-gray-400">PNG, JPG, WEBP (Max. 5MB) · Timestamp tự động</p>
      </div>
    </div>

    <!-- Preview grid -->
    <div v-if="createPendingPreviews.length > 0">
      <p class="text-sm font-medium text-gray-700 mb-2">Đã chọn {{ createPendingPreviews.length }} hình:</p>
      <div class="grid grid-cols-3 gap-2">
        <div v-for="(preview, index) in createPendingPreviews" :key="`cp-${index}`"
          class="relative aspect-square rounded-lg overflow-hidden border-2 border-green-400">
          <img :src="preview" class="absolute inset-0 w-full h-full object-cover" />
          <Button icon="pi pi-times" rounded text severity="danger" size="small"
            class="absolute! top-1 right-1 bg-white/95!" @click.stop="removeCreatePendingImage(index)" />
          <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center"
            style="font-size: 9px; padding: 2px 4px;">
            {{ createPendingTimestamps[index] }}
          </div>
        </div>
        <div class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
          @click="createImageFileInput?.click()">
          <i class="pi pi-plus text-xl text-gray-400"></i>
          <span class="text-xs text-gray-400 mt-1">Thêm</span>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-6 text-gray-400 border-2 border-dashed border-gray-400 rounded-xl mt-3! py-2!">
      <i class="pi pi-image text-4xl mb-2 block"></i>
      <p class="text-sm">Chưa có hình nào được chọn</p>
    </div>

    <!-- Hidden inputs -->
    <input ref="createImageFileInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
      multiple class="hidden" @change="handleCreateImageUpload" />
    <input ref="createCameraInput" type="file" accept="image/*" capture="environment"
      class="hidden" @change="handleCreateCameraCapture" />
  </div>

  <template #footer>
    <Button
      :label="createPendingImages.length > 0 ? `Xong (${createPendingImages.length} ảnh)` : 'Đóng'"
      :icon="createPendingImages.length > 0 ? 'pi pi-check' : 'pi pi-times'"
      :severity="createPendingImages.length > 0 ? 'success' : 'secondary'"
      @click="closeCreateImageDialog"
    />
  </template>
</Dialog>

    <!-- ==================== DETAIL DIALOG ==================== -->
    <Dialog
      v-model:visible="showDetailDialog"
      :header="`Chi tiết phiếu nhập #${selectedStockin?.id}`"
      :style="{ width: '900px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
    >
      <div v-if="selectedStockin" class="mt-4">
        <div class="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
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

        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-3">Danh sách sản phẩm ({{ selectedStockin.stockInDetails?.length || 0 }})</h3>
          <div v-if="!selectedStockin.stockInDetails?.length" class="text-center py-4 text-gray-500">
            Không có sản phẩm nào
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="(data, index) in selectedStockin.stockInDetails"
              :key="index"
              class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50"
            >
              <img
                v-if="data.item?.picture?.length"
                :src="getItemImageUrl(data.item.picture[0])"
                class="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-200"
              />
              <div v-else class="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                <i class="pi pi-image text-gray-400"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-gray-900 truncate">{{ getDetailItemName(data.item) }}</p>
                <p class="text-xs text-gray-500">{{ data.item?.type || '-' }}</p>
              </div>
              <Chip
                :label="`+${data.quantity} ${data.item?.unit || ''}`"
                class="p-chip-success shrink-0"
                icon="pi pi-arrow-up"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Đóng" icon="pi pi-times" @click="showDetailDialog = false" />
      </template>
    </Dialog>

    <!-- ==================== IMAGE MANAGEMENT DIALOG ==================== -->
    <Dialog
      v-model:visible="showImageDialog"
      :header="`Quản lý hình ảnh - Phiếu nhập #${selectedStockin?.id}`"
      :style="{ width: '800px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
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

          <!-- Mobile: 2 nút -->
          <div v-if="isTableMobile" class="flex gap-2 mb-3">
            <Button label="Chọn ảnh" icon="pi pi-images" severity="secondary" class="flex-1"
              :disabled="stockinStore.uploadingImages" @click="imageFileInput?.click()" />
            <Button label="Chụp ảnh" icon="pi pi-camera" severity="secondary" class="flex-1"
              :disabled="stockinStore.uploadingImages" @click="cameraFileInput?.click()" />
          </div>

          <!-- Desktop: Drop zone -->
          <div v-if="!isTableMobile"
            @click="!stockinStore.uploadingImages && imageFileInput?.click()"
            @dragover.prevent @drop.prevent="handleDrop"
            class="border-2 border-dashed rounded-xl p-4 transition-all"
            :class="stockinStore.uploadingImages
              ? 'opacity-50 cursor-not-allowed border-gray-300'
              : 'border-gray-400 hover:bg-gray-50 cursor-pointer'"
          >
            <div v-if="pendingImages.length > 0" class="grid grid-cols-5 gap-3 mb-4">
              <div v-for="(preview, index) in pendingImagePreviews" :key="`pending-${index}`"
                class="relative aspect-square rounded-lg overflow-hidden border-2 border-orange-400">
                <img :src="preview" class="absolute inset-0 w-full h-full object-cover" />
                <Button icon="pi pi-times" rounded text severity="danger" size="small"
                  class="absolute! top-1 right-1 bg-white/95!" @click.stop="removePendingImage(index)" />
              </div>
              <div
                class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                @click.stop="!stockinStore.uploadingImages && imageFileInput?.click()">
                <i class="pi pi-plus text-2xl text-gray-400"></i>
                <span class="text-xs text-gray-400 mt-1">Thêm ảnh</span>
              </div>
            </div>
            <div class="flex flex-col items-center justify-center py-6">
              <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
              <p class="text-gray-600 text-sm font-medium mb-1">Kéo thả hoặc click để chọn</p>
              <p class="text-xs text-gray-400">PNG, JPG, WEBP (Max. 5MB)</p>
            </div>
          </div>

          <!-- Mobile: Preview -->
          <div v-if="isTableMobile && pendingImages.length > 0" class="mt-3">
            <div class="grid grid-cols-3 gap-2">
              <div v-for="(preview, index) in pendingImagePreviews" :key="`pending-mobile-${index}`"
                class="relative aspect-square rounded-lg overflow-hidden border-2 border-orange-400">
                <img :src="preview" class="absolute inset-0 w-full h-full object-cover" />
                <Button icon="pi pi-times" rounded text severity="danger" size="small"
                  class="absolute! top-1 right-1 bg-white/95!" @click.stop="removePendingImage(index)" />
                <div v-if="pendingImageTimestamps[index]"
                  class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center"
                  style="font-size: 9px; padding: 2px 4px;">
                  {{ pendingImageTimestamps[index] }}
                </div>
              </div>
              <div
                class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer"
                @click="imageFileInput?.click()">
                <i class="pi pi-plus text-xl text-gray-400"></i>
                <span class="text-xs text-gray-400 mt-1">Thêm</span>
              </div>
            </div>
          </div>

          <!-- Inputs -->
          <input ref="imageFileInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple :disabled="stockinStore.uploadingImages" class="hidden" @change="handleImageUpload" />
          <input ref="cameraFileInput" type="file" accept="image/*" capture="environment"
            :disabled="stockinStore.uploadingImages" class="hidden" @change="handleCameraCapture" />

          <!-- Action buttons -->
          <div v-if="pendingImages.length > 0" class="flex justify-between items-center mt-3">
            <span class="text-sm text-gray-600 font-medium">Đã chọn {{ pendingImages.length }} file</span>
            <div class="flex gap-2 mt-2">
              <Button label="Xóa tất cả" icon="pi pi-trash" text size="small" severity="danger" @click="clearPendingImages" />
              <Button label="Tải lên" icon="pi pi-upload" size="small" severity="success"
                :loading="stockinStore.uploadingImages" @click="uploadPendingImages" />
            </div>
          </div>
        </div>

        <!-- Current Images -->
        <div>
          <label class="font-semibold mb-4 block">Hình ảnh hiện tại ({{ currentImages.length }})</label>
          <div v-if="currentImages.length === 0"
            class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p class="my-4 text-gray-500">Chưa có hình ảnh nào</p>
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
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Đóng" icon="pi pi-times" @click="closeImageDialog" />
      </template>
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useStockinStore } from '@/stores/stockinStore'
import { useItemStore } from '@/stores/itemStore'
import { stockinAPI } from '@/services/stockinAPI'
import { itemAPI } from '@/services/itemAPI'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/components/MainLayout.vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import type { Stockin, CreateStockinDetail } from '@/types/stockin.types'
import ImagePreviewDialog from '@/views/ImagePreviewDialog.vue'
import { useImagePreview } from '@/composables/useImagePreview'

const confirm = useConfirm()
const toast = useToast()
const stockinStore = useStockinStore()
const itemStore = useItemStore()
const imagePreview = useImagePreview()

// ── Resize ────────────────────────────────────────────────
const isTableMobile = ref(window.innerWidth < 768)
const handleTableResize = () => { isTableMobile.value = window.innerWidth < 768 }

// ── Filter ────────────────────────────────────────────────
const searchQuery = ref('')
const fromDate = ref<Date>(new Date(new Date().getFullYear(), 0, 1, 0, 0, 0))
const toDate = ref<Date>(new Date(new Date().setHours(23, 59, 59)))

const showCreateImageDialog = ref(false)
const createPendingImages = ref<File[]>([])
const createPendingPreviews = ref<string[]>([])
const createPendingTimestamps = ref<string[]>([])
const createImageFileInput = ref<HTMLInputElement | null>(null)
const createCameraInput = ref<HTMLInputElement | null>(null)
const isSubmittingCreate = ref(false)

// Mở image dialog từ create form
const openCreateImageDialog = () => {
  showCreateImageDialog.value = true
}

// Đóng image dialog → quay lại form (giữ nguyên ảnh đã chọn)
const closeCreateImageDialog = () => {
  showCreateImageDialog.value = false
}

// handleCreateImageUpload — upload ảnh có sẵn, tự động đè timestamp
const handleCreateImageUpload = async (event: Event) => {
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

  for (const file of validFiles) {
    const now = new Date()
    const timestamp = now.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
    const watermarked = await addTimestampToImage(file, timestamp)
    createPendingImages.value.push(watermarked)
    createPendingTimestamps.value.push(timestamp)

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) createPendingPreviews.value.push(e.target.result as string)
    }
    reader.readAsDataURL(watermarked)
  }

  if (createImageFileInput.value) createImageFileInput.value.value = ''
}

// handleCreateDrop — kéo thả ảnh vào dialog tạo phiếu, cũng đè timestamp
const handleCreateDrop = async (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (!files?.length) return

  const maxSize = 5 * 1024 * 1024
  const validFiles: File[] = []

  Array.from(files).forEach(file => {
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) return
    if (file.size > maxSize) return
    validFiles.push(file)
  })

  if (!validFiles.length) return

  for (const file of validFiles) {
    const now = new Date()
    const timestamp = now.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
    const watermarked = await addTimestampToImage(file, timestamp)
    createPendingImages.value.push(watermarked)
    createPendingTimestamps.value.push(timestamp)

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) createPendingPreviews.value.push(e.target.result as string)
    }
    reader.readAsDataURL(watermarked)
  }
}

// handleCreateCameraCapture — chụp ảnh trong dialog tạo phiếu
const handleCreateCameraCapture = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files?.length) return

  const file = files[0]
  if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Định dạng không hỗ trợ', life: 3000 })
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'File quá lớn (max 5MB)', life: 3000 })
    return
  }

  const now = new Date()
  const timestamp = now.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
  const ext = file.name.split('.').pop() || 'jpg'
  const newName = `photo_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}.${ext}`
  const watermarked = await addTimestampToImage(new File([file], newName, { type: file.type }), timestamp)

  createPendingImages.value.push(watermarked)
  createPendingTimestamps.value.push(timestamp)

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) createPendingPreviews.value.push(e.target.result as string)
  }
  reader.readAsDataURL(watermarked)

  if (createCameraInput.value) createCameraInput.value.value = ''
}

const removeCreatePendingImage = (index: number) => {
  createPendingImages.value.splice(index, 1)
  createPendingPreviews.value.splice(index, 1)
  createPendingTimestamps.value.splice(index, 1)
}

// Tạo phiếu + upload ảnh
const confirmAndCreateStockin = async () => {
  isSubmittingCreate.value = true
  try {
    const newStockin = await stockinAPI.createStockin({
      note: createForm.value.note,
      items: createForm.value.items
    })
    await stockinAPI.uploadImagesSequentially(newStockin.id, createPendingImages.value)
    toast.add({ severity: 'success', summary: 'Thành công', detail: `Tạo phiếu nhập #${newStockin.id} thành công!`, life: 3000 })
    // Reset
    createPendingImages.value = []
    createPendingPreviews.value = []
    createPendingTimestamps.value = []
    closeCreateDialog()
    await fetchAllStockins()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể tạo phiếu nhập', life: 3000 })
  } finally {
    isSubmittingCreate.value = false
  }
}

const filteredStockins = computed(() => {
  if (!stockinStore.stockins?.length) return []
  if (!searchQuery.value) return stockinStore.stockins
  const term = searchQuery.value.toLowerCase()
  return stockinStore.stockins.filter(s =>
    s.note?.toLowerCase().includes(term) ||
    s.account?.username?.toLowerCase().includes(term) ||
    s.id?.toString().includes(term)
  )
})
const totalFilteredItems = computed(() => filteredStockins.value.length)

// ── Create Dialog ─────────────────────────────────────────
const showCreateDialog = ref(false)
const createForm = ref<{ note: string; items: CreateStockinDetail[] }>({
  note: '', items: []
})

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

const isFormValid = computed(() =>
  createForm.value.items.length > 0 &&
  createForm.value.items.every(item => item.itemId && item.quantity > 0)
)

const totalQuantity = computed(() =>
  createForm.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
)

// ── Detail Dialog ─────────────────────────────────────────
const showDetailDialog = ref(false)
const selectedStockin = ref<Stockin | null>(null)

// ── Image Management ──────────────────────────────────────
const showImageDialog = ref(false)
const currentImages = ref<string[]>([])
const pendingImages = ref<File[]>([])
const pendingImagePreviews = ref<string[]>([])
const pendingImageTimestamps = ref<string[]>([])
const imageFileInput = ref<HTMLInputElement | null>(null)
const cameraFileInput = ref<HTMLInputElement | null>(null)

// ── Lifecycle ─────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener('resize', handleTableResize)
  await Promise.all([fetchAllStockins(), fetchAllItems()])
})

onUnmounted(() => {
  window.removeEventListener('resize', handleTableResize)
  stockinStore.setCurrentStockin(null)
})

// ── API calls ─────────────────────────────────────────────
const formatDateTimeForAPI = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

const fetchAllStockins = async () => {
  stockinStore.setLoading(true)
  try {
    const stockins = await stockinAPI.getAllStockin()
    stockinStore.setStockins(stockins)
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể tải danh sách phiếu nhập', life: 3000 })
  } finally {
    stockinStore.setLoading(false)
  }
}

const fetchAllItems = async () => {
  try {
    const items = await itemAPI.getAll()
    itemStore.setItems(items)
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể tải danh sách sản phẩm', life: 3000 })
  }
}

const clearDateFilter = async () => {
  fromDate.value = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0)
  toDate.value = new Date(new Date().setHours(23, 59, 59))
  await fetchAllStockins()
}

// ── Helpers ───────────────────────────────────────────────
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

const getItemName = (item: any) => item?.eng?.partname || item?.com?.name || 'Unknown'

const getDetailItemName = (item: any) => {
  if (!item) return 'Unknown'
  return item.eng?.partname || item.com?.name || item.partname || item.name || 'Unknown'
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const getSelectedItemLabel = (id: number) => availableItems.value.find(i => i.value === id)?.label || ''
const getSelectedItemImage = (id: number) => availableItems.value.find(i => i.value === id)?.image || ''
const getSelectedItemType  = (id: number) => availableItems.value.find(i => i.value === id)?.type || ''
const getSelectedItemUnit  = (id: number) => availableItems.value.find(i => i.value === id)?.unit || ''
const getSelectedItemStock = (id: number) => availableItems.value.find(i => i.value === id)?.stock || 0

// ── Timestamp watermark ───────────────────────────────────
const addTimestampToImage = (file: File, timestamp: string): Promise<File> =>
  new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const fontSize = Math.max(img.width, img.height) * 0.035
      ctx.font = `bold ${fontSize}px monospace`
      const padding = fontSize * 0.6
      const textWidth = ctx.measureText(timestamp).width
      const boxW = textWidth + padding * 2
      const boxH = fontSize + padding * 2
      const x = img.width - boxW - fontSize * 0.5
      const y = img.height - boxH - fontSize * 0.5
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
      ctx.beginPath()
      ctx.roundRect(x, y, boxW, boxH, fontSize * 0.3)
      ctx.fill()
      ctx.fillStyle = '#FFD700'
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 3
      ctx.fillText(timestamp, x + padding, y + padding + fontSize * 0.85)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url)
        resolve(blob ? new File([blob], file.name, { type: file.type }) : file)
      }, file.type, 0.92)
    }
    img.src = url
  })

// ── Create Dialog functions ───────────────────────────────
const openCreateDialog = () => {
  createForm.value = { note: '', items: [] }
  showCreateDialog.value = true
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  createForm.value = { note: '', items: [] }
  createPendingImages.value = []
  createPendingPreviews.value = []
  createPendingTimestamps.value = []
}

const addItemRow = () => {
  createForm.value.items.push({ itemId: 0, quantity: 1 })
}

const removeItemRow = (index: number) => {
  createForm.value.items.splice(index, 1)
}

const onItemSelect = (event: any, index: number) => {
  console.log('Item selected:', event.value, 'at index:', index)
}

/**
 * Luồng: Tạo phiếu nhập → tự động mở Image Dialog để upload ảnh
 */
const submitCreate = async () => {
  if (!isFormValid.value) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng điền đủ thông tin', life: 3000 })
    return
  }
  // Nếu đã có ảnh rồi → tạo phiếu luôn
  if (createPendingImages.value.length > 0) {
    await confirmAndCreateStockin()
    return
  }
  // Chưa có ảnh → mở image dialog
  showCreateImageDialog.value = true
}
// ── Detail ────────────────────────────────────────────────
const viewDetail = async (stockin: Stockin) => {
  selectedStockin.value = stockin
  if (stockin.id) {
    try {
      selectedStockin.value = await stockinAPI.getStockinById(stockin.id)
    } catch (error) {
      console.error('Error loading stockin detail:', error)
    }
  }
  showDetailDialog.value = true
}

// ── Delete ────────────────────────────────────────────────
const confirmDelete = (stockin: Stockin) => {
  confirm.require({
    message: `Bạn có chắc muốn xóa phiếu nhập #${stockin.id}?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    acceptClass: 'p-button-danger',
    accept: async () => {
      if (!stockin.id) return
      stockinStore.setLoading(true)
      try {
        await stockinAPI.deleteStockin(stockin.id)
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa phiếu nhập thành công', life: 3000 })
        await fetchAllStockins()
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể xóa phiếu nhập', life: 3000 })
      } finally {
        stockinStore.setLoading(false)
      }
    }
  })
}

// ── Image Management ──────────────────────────────────────
const viewImages = async (stockin: Stockin) => {
  selectedStockin.value = stockin
  if (stockin.id) {
    try {
      const stockinData = await stockinAPI.getStockinById(stockin.id)
      currentImages.value = stockinData.image || []
      stockinStore.setCurrentStockin(stockinData)
    } catch {
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

const handleDrop = (event: DragEvent) => {
  if (stockinStore.uploadingImages) return
  const files = event.dataTransfer?.files
  if (!files?.length) return
  const maxSize = 5 * 1024 * 1024
  const validFiles: File[] = []
  Array.from(files).forEach(file => {
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) return
    if (file.size > maxSize) return
    validFiles.push(file)
  })
  if (!validFiles.length) return
  pendingImages.value.push(...validFiles)
  validFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => { if (e.target?.result) pendingImagePreviews.value.push(e.target.result as string) }
    reader.readAsDataURL(file)
  })
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
    reader.onload = (e) => { if (e.target?.result) pendingImagePreviews.value.push(e.target.result as string) }
    reader.readAsDataURL(file)
  })
  if (imageFileInput.value) imageFileInput.value.value = ''
}

const handleCameraCapture = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files?.length) return
  const file = files[0]
  if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Định dạng không hỗ trợ', life: 3000 })
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'File quá lớn (max 5MB)', life: 3000 })
    return
  }
  const now = new Date()
  const timestamp = now.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
  const ext = file.name.split('.').pop() || 'jpg'
  const newName = `photo_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}.${ext}`
  const watermarked = await addTimestampToImage(new File([file], newName, { type: file.type }), timestamp)
  pendingImages.value.push(watermarked)
  pendingImageTimestamps.value.push(timestamp)
  const reader = new FileReader()
  reader.onload = (e) => { if (e.target?.result) pendingImagePreviews.value.push(e.target.result as string) }
  reader.readAsDataURL(watermarked)
  if (cameraFileInput.value) cameraFileInput.value.value = ''
}

const removePendingImage = (index: number) => {
  pendingImages.value.splice(index, 1)
  pendingImagePreviews.value.splice(index, 1)
  pendingImageTimestamps.value.splice(index, 1)
}

const clearPendingImages = () => {
  pendingImages.value = []
  pendingImagePreviews.value = []
  pendingImageTimestamps.value = []
}

const uploadPendingImages = async () => {
  if (!selectedStockin.value?.id || !pendingImages.value.length) {
    toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Không có file nào được chọn', life: 3000 })
    return
  }
  stockinStore.setUploadingImages(true)
  try {
    const result = await stockinAPI.uploadImagesSequentially(selectedStockin.value.id, pendingImages.value)
    if (result.success > 0) {
      toast.add({
        severity: 'success', summary: 'Thành công',
        detail: `Đã tải lên ${result.success}/${pendingImages.value.length} ảnh`, life: 3000
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
      toast.add({ severity: 'error', summary: 'Lỗi', detail: `${result.failed} ảnh tải lên thất bại`, life: 5000 })
    }
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Không thể tải lên hình ảnh', life: 3000 })
  } finally {
    stockinStore.setUploadingImages(false)
  }
}

const viewImageFullscreen = (imageUrl: string) => {
  const fullUrls = currentImages.value.map(img => getImageUrl(img))
  imagePreview.open(getImageUrl(imageUrl), fullUrls)
}
</script>

<style scoped>
/* ── Image container ── */
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

/* ── Chip ── */
:deep(.p-chip) {
  height: 28px;
  padding: 0 0.75rem;
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
}

:deep(.p-chip-success) {
  background: #dcfce7 !important;
  color: #16a34a !important;
  border: 1px solid #bbf7d0 !important;
  font-weight: 600 !important;
}

/* ── Animation ── */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Calendar ── */
.calendar-full-width { width: 100% !important; }

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
}

/* ── Stockin cards ── */
.stockin-card-list { display: flex; flex-direction: column; gap: 0.75rem; }

.stockin-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.stockin-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }

.stockin-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.stockin-card-id   { font-weight: 700; font-size: 0.95rem; color: #111827; }
.stockin-card-date { font-size: 0.75rem; color: #6b7280; }

.stockin-card-body {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stockin-card-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.stockin-card-label { color: #6b7280; min-width: 75px; }
.stockin-card-value { font-weight: 500; color: #111827; flex: 1; min-width: 0; }

.stockin-card-footer {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

/* ── Dropdown fix mobile ── */
@media (max-width: 767px) {
  .flex.justify-between.items-center.mb-4 {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .w-80 { width: 100% !important; }

  :global(.stockin-item-dropdown-panel) {
    max-width: calc(100vw - 2rem) !important;
    width: auto !important;
    left: 1rem !important;
    right: 1rem !important;
  }

  :global(.stockin-item-dropdown-panel .p-dropdown-items-wrapper) {
    max-width: 100% !important;
  }

  :global(.stockin-item-dropdown-panel .p-dropdown-item) {
    white-space: normal !important;
    word-break: break-word !important;
  }
}
</style>