<template>
  <!-- Image Preview -->
  <ImagePreviewDialog
    :visible="imagePreview.visible.value"
    :current-src="imagePreview.currentSrc.value"
    :images="imagePreview.images.value"
    :current-index="imagePreview.currentIndex.value"
    @close="imagePreview.close()"
    @prev="imagePreview.prev()"
    @next="imagePreview.next()"
    @goto="
      (i) => {
        imagePreview.currentIndex.value = i;
        imagePreview.currentSrc.value = imagePreview.images.value[i];
      }
    "
  />
  <MainLayout>
    <div class="page-gradient-bg">
    <div class="animate-fade-in">
      <!-- Header -->
      <div
        class="flex md:flex-row lg:flex-row flex-col justify-between md:items-center lg:items-center mb-4"
      >
        <div>
          <h2 class="text-2xl font-bold mb-4 text-gray-900">
            {{ t("inventoryManagement.title") }}
          </h2>
          <p class="text-gray-600">{{ t("inventoryManagement.subtitle") }}</p>
        </div>
        <Button
          :label="t('inventoryManagement.addProduct')"
          icon="pi pi-plus"
          class="btn-primary"
          @click="router.push('/add-product')"
        />
      </div>

      <Card class="mb-6">
        <template #content>
          <div class="flex flex-col gap-4">
            <!-- Filters Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">
                  {{ t("inventoryManagement.filters.area") }}
                </label>

                <Dropdown
                  v-model="selectedFactory"
                  :options="factoryOptions"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="t('inventoryManagement.filters.areaPlaceholder')"
                  class="w-full"
                  showClear
                />
              </div>
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">
                  {{ t("inventoryManagement.filters.productType") }}
                </label>

                <Dropdown
                  v-model="selectedType"
                  :options="typeOptions"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="
                    selectedFactory
                      ? t('inventoryManagement.filters.allTypes')
                      : t('inventoryManagement.filters.selectAreaFirst')
                  "
                  class="w-full"
                  showClear
                  :disabled="!selectedFactory"
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">{{
                  t("inventoryManagement.filters.stockStatus")
                }}</label>
                <Dropdown
                  v-model="selectedStockStatus"
                  :options="stockStatusOptions"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="t('inventoryManagement.filters.allStatuses')"
                  class="w-full"
                  showClear
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">{{
                  t("inventoryManagement.filters.search")
                }}</label>
                <div class="p-input-icon-left w-full">
                  <InputText
                    v-model="searchQuery"
                    :placeholder="
                      t('inventoryManagement.filters.searchPlaceholder')
                    "
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            <!-- Summary & Actions Row -->
            <div
              class="flex md:flex-row lg:flex-row flex-col justify-between md:items-center lg:items-center items-start gap-4"
            >
              <div
                class="flex md:flex-row lg:flex-row flex-col md:items-center lg:items-center gap-4 text-sm!"
              >
                <span class="text-sm! font-semibold text-gray-900">
                  {{
                    t("inventoryManagement.summary.total", {
                      count: totalFilteredItems,
                    })
                  }}
                </span>

                <!-- Clickable Status Chips - DÙNG allItemsStockCount -->
                <Chip
                  v-if="allItemsStockCount.normal > 0"
                  :label="`${allItemsStockCount.normal} ${t('inventoryManagement.stockStatusOptions.inStock')}`"
                  icon="pi pi-check-circle"
                  class="clickable-chip chip-normal"
                  :class="{ 'chip-active': selectedStockStatus === 'in-stock' }"
                  @click="handleChipClick('in-stock')"
                />

                <Chip
                  v-if="allItemsStockCount.warning > 0"
                  :label="`${allItemsStockCount.warning} ${t('inventoryManagement.stockStatusOptions.warning')}`"
                  icon="pi pi-info-circle"
                  class="clickable-chip chip-warning"
                  :class="{ 'chip-active': selectedStockStatus === 'warning' }"
                  @click="handleChipClick('warning')"
                />

                <Chip
                  v-if="allItemsStockCount.low > 0"
                  :label="`${allItemsStockCount.low} ${t('inventoryManagement.stockStatusOptions.low')}`"
                  icon="pi pi-exclamation-circle"
                  class="clickable-chip chip-low pulse-warning"
                  :class="{ 'chip-active': selectedStockStatus === 'low' }"
                  @click="handleChipClick('low')"
                />

                <Chip
                  v-if="allItemsStockCount.critical > 0"
                  :label="`${allItemsStockCount.critical} ${t('inventoryManagement.stockStatusOptions.critical')}`"
                  icon="pi pi-exclamation-triangle"
                  class="clickable-chip chip-critical pulse-danger"
                  :class="{ 'chip-active': selectedStockStatus === 'critical' }"
                  @click="handleChipClick('critical')"
                />

                <Chip
                  v-if="allItemsStockCount.outOfStock > 0"
                  :label="`${allItemsStockCount.outOfStock} ${t('inventoryManagement.stockStatusOptions.outOfStock')}`"
                  icon="pi pi-times-circle"
                  class="clickable-chip chip-out-of-stock pulse-danger"
                  :class="{
                    'chip-active': selectedStockStatus === 'out-of-stock',
                  }"
                  @click="handleChipClick('out-of-stock')"
                />

                <Chip
                  v-if="allItemsStockCount.notConfigured > 0"
                  :label="`${allItemsStockCount.notConfigured} ${t('inventoryManagement.stockStatusOptions.notConfigured')}`"
                  icon="pi pi-cog"
                  class="clickable-chip chip-not-configured"
                  severity="secondary"
                  @click="handleChipClick('not-configured')"
                />
              </div>

              <Button
                :label="t('common.filter.reset')"
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
          <!-- DESKTOP: DataTable -->
          <DataTable
            v-if="!isTableMobile"
            :value="paginatedList"
            :paginator="false"
            :rows="10"
            :loading="itemStore.loading"
            responsiveLayout="scroll"
            @row-click="(e) => openEditDialog(e.data)"
          >
            <template #empty>
              <div class="text-center py-8">
                <i class="pi pi-box text-5xl text-gray-400"></i>
                <p class="mt-4 text-gray-500">
                  {{ t("inventoryManagement.table.empty") }}
                </p>
              </div>
            </template>

            <Column field="id" header="ID" sortable class="w-32">
              <template #body="{ data }">
                <!-- <div :data-product-id="data.id">STT: {{ data.id }}</div> -->
                <div :data-item-id="data.itemIndentifyId" class="text-xs!">
                  {{ data.itemIndentifyId }}
                </div>
              </template>
            </Column>

            <Column :header="t('common.product')" sortable>
              <template #body="{ data }">
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    :src="getProductImage(data)"
                    :alt="getProductName(data)"
                    class="w-12 h-12 rounded-lg object-cover cursor-pointer"
                  />

                  <div class="min-w-0 max-w-70">
                    <p
                      class="font-semibold text-gray-900 line-clamp-2 leading-snug"
                    >
                      {{ getProductName(data) }}
                    </p>

                    <p class="text-sm text-gray-500 truncate">
                      {{ getDistinguishName(data) }}
                    </p>

                    <p class="text-sm text-gray-500 truncate">
                      {{ getProductCategory(data) }}
                    </p>
                  </div>
                </div>
              </template>
            </Column>

            <Column
              field="type"
              :header="t('inventoryManagement.table.type')"
              sortable
            ></Column>

            <Column :header="t('inventoryManagement.table.area')" sortable>
              <template #body="{ data }">
                <Chip
                  :label="getFactoryName(data)"
                  :class="
                    getFactoryName(data) === 'SMD'
                      ? 'chip-warning'
                      : 'chip-normal'
                  "
                />
              </template>
            </Column>

            <Column field="price" :header="t('common.price')" sortable>
              <template #body="{ data }">
                <span class="font-medium"
                  >{{ Number(data.price).toLocaleString("vi-VN") }} VND</span
                >
              </template>
            </Column>

            <Column
              field="stockQty"
              :header="t('inventoryManagement.table.stockQty')"
              sortable
            >
              <template #body="{ data }">
                <Chip
                  :label="`${data.stockQty} ${data.unit}`"
                  :class="
                    data.stockQty < 10 ? 'p-chip-danger' : 'p-chip-success'
                  "
                />
              </template>
            </Column>

            <Column
              field="saveQuantity"
              :header="t('inventoryManagement.table.safeQty')"
              sortable
            >
              <template #body="{ data }">
                <span>{{ data.saveQuantity }} {{ data.unit }}</span>
              </template>
            </Column>

            <Column :header="t('common.action')" class="w-40">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-images"
                    text
                    rounded
                    severity="info"
                    @click.stop="viewImages(data)"
                    :title="t('inventoryManagement.actions.manageImages')"
                  />

                  <Button
                    icon="pi pi-history"
                    text
                    rounded
                    severity="help"
                    @click.stop="openTransactionDialog(data)"
                    :title="t('inventoryManagement.actions.transactionHistory')"
                  />

                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    severity="secondary"
                    @click.stop="openEditDialog(data)"
                    :title="t('inventoryManagement.actions.edit')"
                  />

                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    @click.stop="confirmDelete(data)"
                    :title="t('inventoryManagement.actions.delete')"
                  />
                </div>
              </template>
            </Column>
          </DataTable>

          <!-- MOBILE: Card List -->
          <div v-if="isTableMobile">
            <div v-if="itemStore.loading" class="flex justify-center py-4">
              <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
            </div>

            <div
              v-else-if="filteredItems.length === 0"
              class="text-center py-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
            >
              <i class="pi pi-box text-5xl text-gray-400"></i>
              <p class="mt-4 text-gray-500">
                {{ t("inventoryManagement.table.empty") }}
              </p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="item in paginatedList"
                :key="item.id"
                class="p-4! border-2 border-gray-200 rounded-lg"
                @click="openEditDialog(item)"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="getProductImage(item)"
                    :alt="getProductName(item)"
                    class="w-12 h-12 rounded-lg object-cover cursor-pointer"
                  />
                  <div>
                    <p class="font-semibold text-gray-900">
                      {{ getProductName(item) }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ getDistinguishName(item) }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ getProductCategory(item) }}
                    </p>
                  </div>
                </div>

                <div class="mt-4">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold"
                      >{{ t("inventoryManagement.table.price") }}:</span
                    >
                    <span class="font-medium"
                      >{{
                        Number(item.price).toLocaleString("vi-VN")
                      }}
                      VND</span
                    >
                  </div>

                  <div class="flex items-center gap-2 mt-2">
                    <span class="font-semibold"
                      >{{ t("inventoryManagement.table.stockQty") }}:</span
                    >
                    <Chip
                      :label="`${item.stockQty} ${item.unit}`"
                      :class="
                        item.stockQty < 10 ? 'p-chip-danger' : 'p-chip-success'
                      "
                    />
                  </div>

                  <div class="flex items-center gap-2 mt-2">
                    <span class="font-semibold"
                      >{{ t("inventoryManagement.table.safeQty") }}:</span
                    >
                    <span>{{ item.saveQuantity }} {{ item.unit }}</span>
                  </div>

                  <div class="flex items-center gap-2 mt-2">
                    <span class="font-semibold">{{ t("inventoryManagement.mobile.area") }}</span>
                    <Chip :label="getFactoryName(item)" />
                  </div>
                </div>

                <div class="flex gap-2 mt-4">
                  <Button
                    icon="pi pi-images"
                    text
                    rounded
                    severity="info"
                    @click.stop="viewImages(item)"
                    :title="t('inventoryManagement.actions.manageImages')"
                  />
                  <Button
                    icon="pi pi-history"
                    text
                    rounded
                    severity="help"
                    @click.stop="openTransactionDialog(item)"
                    :title="t('inventoryManagement.actions.transactionHistory')"
                  />
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    severity="secondary"
                    @click.stop="openEditDialog(item)"
                    :title="t('inventoryManagement.actions.edit')"
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    @click.stop="confirmDelete(item)"
                    :title="t('inventoryManagement.actions.delete')"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- SHARED PAGINATOR — dùng chung desktop & mobile -->
          <AppPagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="totalItems"
            :page-info="pageInfo"
            v-model:model-page-size="pageSize"
            :show-page-size="true"
            :max-visible="5"
            @prev="prevPage"
            @next="nextPage"
            @first="firstPage"
            @last="lastPage"
            @goto="goToPage"
          />
        </template>
      </Card>
    </div>
    </div>

    <!-- Edit Dialog -->
    <Dialog dismissableMask
      v-model:visible="showEditDialog"
      :header="t('inventoryManagement.editDialog.header')"
      :style="{ width: '500px' }"
      :modal="true"
    >
      <div class="flex flex-col gap-4 mt-4">
        <div>
          <label class="block mb-2 font-semibold"
            >{{ t("inventoryManagement.editDialog.type") }}</label
          >
          <InputText
            :model-value="editingItem?.eng ? 'Engineer (ENG)' : 'Consumer (COM)'"
            class="w-full opacity-60"
            disabled
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-2 font-semibold"
              >{{ t("inventoryManagement.editDialog.unit") }}
              <span class="text-red-500">*</span></label
            >
            <Dropdown
              v-model="editForm.unit"
              :options="unitOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>

          <div>
            <label class="block mb-2 font-semibold"
              >{{ t("inventoryManagement.editDialog.price") }}
              <span class="text-red-500">*</span></label
            >
            <InputText
              v-model="editForm.price"
              class="w-full"
              placeholder="0.00"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-2 font-semibold"
              >{{ t("inventoryManagement.editDialog.safeQty") }}
              <span class="text-red-500">*</span></label
            >
            <InputText
              v-model.number="editForm.saveQuantity"
              type="number"
              class="w-full"
              placeholder="0"
            />
          </div>
          <div>
            <label class="block mb-2 font-semibold"
              >{{ t("inventoryManagement.editDialog.stockQty") }}
              <span class="text-red-500">*</span></label
            >
            <InputText
              v-model.number="editForm.stockQty"
              type="number"
              class="w-full"
              placeholder="0"
            />
          </div>
        </div>

        <!-- ENG fields -->
        <template v-if="editingItem?.eng">
          <div class="border-t pt-3! mt-1!">
            <p class="text-sm font-bold text-gray-700 mb-2!">
              {{ t("inventoryManagement.editDialog.engSection") }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-semibold">{{
                t("inventoryManagement.editDialog.partname")
              }}</label>
              <InputText v-model="editForm.eng.partname" class="w-full" />
            </div>
            <div>
              <label class="block mb-2 font-semibold">{{
                t("inventoryManagement.editDialog.location")
              }}</label>
              <InputText v-model="editForm.eng.location" class="w-full" />
            </div>
          </div>
          <div>
            <label class="block mb-2 font-semibold">{{
              t("inventoryManagement.editDialog.description")
            }}</label>
            <InputText v-model="editForm.eng.description" class="w-full" />
          </div>
          <div>
            <label class="block mb-2 font-semibold">{{
              t("inventoryManagement.editDialog.vender")
            }}</label>
            <InputText v-model="editForm.eng.vender" class="w-full" />
          </div>
        </template>

        <!-- COM fields -->
        <template v-else-if="editingItem?.com">
          <div class="border-t pt-3! mt-1!">
            <p class="text-sm font-bold text-gray-700 mb-2!">
              {{ t("inventoryManagement.editDialog.comSection") }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 font-semibold">{{
                t("inventoryManagement.editDialog.comName")
              }}</label>
              <InputText v-model="editForm.com.name" class="w-full" />
            </div>
            <div>
              <label class="block mb-2 font-semibold">{{
                t("inventoryManagement.editDialog.location")
              }}</label>
              <InputText v-model="editForm.com.location" class="w-full" />
            </div>
          </div>
          <div>
            <label class="block mb-2 font-semibold">{{
              t("inventoryManagement.editDialog.specifications")
            }}</label>
            <InputText v-model="editForm.com.specifications" class="w-full" />
          </div>
          <div>
            <label class="block mb-2 font-semibold">{{
              t("inventoryManagement.editDialog.manufacturer")
            }}</label>
            <InputText v-model="editForm.com.manufacturer" class="w-full" />
          </div>
        </template>
      </div>

      <template #footer>
        <Button
          :label="t('common.cancel')"
          icon="pi pi-times"
          text
          @click="showEditDialog = false"
          :disabled="itemStore.loading"
        />
        <Button
          :label="t('common.update')"
          icon="pi pi-check"
          @click="saveEdit"
          :loading="itemStore.loading"
        />
      </template>
    </Dialog>

    <!-- Image Management Dialog -->
    <Dialog
      v-model:visible="showImageDialog"
      :header="
        t('inventoryManagement.imageDialog.header', {
          name: selectedItem ? getProductName(selectedItem) : '',
        })
      "
      :style="{ width: '800px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
      :dismissableMask="true"
    >
      <div class="mt-4">
        <!-- Upload Area -->
        <div class="mb-6">
          <label class="block mb-2 font-semibold">
            {{ t("inventoryManagement.imageDialog.uploadTitle") }}
            <!-- Tải lên hình ảnh mới -->
            <span
              v-if="itemStore.uploadingImages"
              class="text-primary text-sm ml-2"
            >
              <i class="pi pi-spin pi-spinner"></i>
              {{ t("inventoryManagement.imageDialog.uploading") }}
            </span>
          </label>

          <!-- Mobile: 2 nút chọn ảnh / chụp ảnh -->
          <div v-if="isTableMobile" class="flex gap-2 mb-3!">
            <Button
              :label="t('inventoryManagement.imageDialog.selectImages')"
              icon="pi pi-images"
              severity="secondary"
              class="flex-1"
              :disabled="itemStore.uploadingImages"
              @click="imageFileInput?.click()"
            />
            <Button
              :label="t('inventoryManagement.imageDialog.takePhoto')"
              icon="pi pi-camera"
              severity="secondary"
              class="flex-1"
              :disabled="itemStore.uploadingImages"
              @click="cameraFileInput?.click()"
            />
          </div>

          <!-- Desktop: Drop zone -->
          <div
            v-if="!isTableMobile"
            @click="!itemStore.uploadingImages && imageFileInput?.click()"
            class="border-2 border-dashed rounded-xl p-4 transition-all"
            :class="
              itemStore.uploadingImages
                ? 'opacity-50 cursor-not-allowed border-gray-300'
                : 'border-gray-400 hover:bg-gray-50 cursor-pointer'
            "
          >
            <div
              v-if="pendingImages.length > 0"
              class="grid grid-cols-5 gap-3 mb-4 p-4!"
            >
              <div
                v-for="(preview, index) in pendingImagePreviews"
                :key="`pending-${index}`"
                class="relative aspect-square rounded-lg overflow-hidden border-2 border-orange-400"
              >
                <img
                  :src="preview"
                  class="absolute inset-0 w-full h-full object-cover"
                />
                <Button
                  icon="pi pi-times"
                  rounded
                  text
                  severity="danger"
                  size="small"
                  class="absolute! top-1 right-1 bg-white/95!"
                  @click.stop="removePendingImage(index)"
                />
              </div>
              <!-- Ô thêm ảnh -->
              <div
                class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                @click.stop="
                  !itemStore.uploadingImages && imageFileInput?.click()
                "
              >
                <i class="pi pi-plus text-2xl text-gray-400"></i>
                <span class="text-xs text-gray-400 mt-1">{{
                  t("inventoryManagement.imageDialog.addMore")
                }}</span>
              </div>
            </div>
            <div class="flex flex-col items-center justify-center py-6">
              <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
              <p class="text-gray-600 text-sm font-medium mb-1">
                {{ t("inventoryManagement.imageDialog.dropzone") }}
              </p>
              <p class="text-xs text-gray-400">
                {{ t("inventoryManagement.imageDialog.dropzoneHint") }}
              </p>
            </div>
          </div>

          <!-- Mobile: Preview ảnh đã chọn -->
          <div v-if="isTableMobile && pendingImages.length > 0" class="mt-3">
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="(preview, index) in pendingImagePreviews"
                :key="`pending-mobile-${index}`"
                class="relative aspect-square rounded-lg overflow-hidden border-2 border-orange-400 mt-3!"
              >
                <img
                  :src="preview"
                  class="absolute inset-0 w-full h-full object-cover"
                />
                <Button
                  icon="pi pi-times"
                  rounded
                  text
                  severity="danger"
                  size="small"
                  class="absolute! top-1 right-1 bg-white/95!"
                  @click.stop="removePendingImage(index)"
                />
                <div
                  v-if="pendingImageTimestamps[index]"
                  class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center"
                  style="font-size: 9px; padding: 2px 4px"
                >
                  {{ pendingImageTimestamps[index] }}
                </div>
              </div>
              <!-- Ô thêm ảnh mobile -->
              <div
                class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer"
                @click="imageFileInput?.click()"
              >
                <i class="pi pi-plus text-xl text-gray-400"></i>
                <span class="text-xs text-gray-400 mt-1">{{
                  t("inventoryManagement.imageDialog.addMore")
                }}</span>
              </div>
            </div>
          </div>

          <!-- Input chọn ảnh từ thư viện -->
          <input
            ref="imageFileInput"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            :disabled="itemStore.uploadingImages"
            class="hidden"
            @change="handleImageUpload"
          />

          <!-- Input chụp ảnh từ camera (mobile only) -->
          <input
            ref="cameraFileInput"
            type="file"
            accept="image/*"
            capture="environment"
            :disabled="itemStore.uploadingImages"
            class="hidden"
            @change="handleCameraCapture"
          />

          <!-- Action buttons -->
          <div
            v-if="pendingImages.length > 0"
            class="flex justify-between items-center mt-3"
          >
            <span class="text-sm text-gray-600 font-medium">{{
              t("inventoryManagement.imageDialog.selectedCount", {
                count: pendingImages.length,
              })
            }}</span>
            <div class="flex gap-2 mt-2!">
              <Button
                :label="t('inventoryManagement.imageDialog.clearAll')"
                icon="pi pi-trash"
                text
                size="small"
                severity="danger"
                @click="clearPendingImages"
              />
              <Button
                :label="t('inventoryManagement.imageDialog.upload')"
                icon="pi pi-upload"
                size="small"
                severity="success"
                :loading="itemStore.uploadingImages"
                @click="uploadPendingImages"
              />
            </div>
          </div>
        </div>

        <!-- Current Images -->
        <div>
          <label class="font-semibold mb-3! block">{{
            t("inventoryManagement.imageDialog.currentImages", {
              count: currentImages.length,
            })
          }}</label>

          <div
            v-if="currentImages.length === 0"
            class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
          >
            <i class="pi pi-image text-5xl text-gray-400"></i>
            <p class="mt-4 text-gray-500">
              {{ t("inventoryManagement.imageDialog.noImages") }}
            </p>
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
        <Button
          :label="t('inventoryManagement.imageDialog.close')"
          icon="pi pi-times"
          @click="closeImageDialog"
        />
      </template>
    </Dialog>
    <ConfirmDialog />
  </MainLayout>

  <!-- Item Transaction History Dialog -->
  <Dialog
    v-model:visible="showTransactionDialog"
    :header="t('inventoryManagement.transactionDialog.header', {
      id: itemTransactions?.itemIndentifyId ||
        selectedTransactionItem?.itemIndentifyId ||
        ''
    })"
    :style="{ width: '1120px' }"
    :breakpoints="{ '960px': 'calc(100vw - 2rem)' }"
    :modal="true"
    :dismissableMask="true"
  >
    <div class="mt-2 flex flex-col gap-5">
      <!-- Filter -->
      <div class="transaction-filter-card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label class="block mb-2 text-sm font-semibold text-gray-700">
              {{ t("inventoryManagement.transactionDialog.filterByIdMachine") }}
            </label>
            <InputText
              v-model="transactionIdFilter"
              placeholder="Order ID, Detail ID, StockIn ID, Machine..."
              class="w-full"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-semibold text-gray-700">
              {{ t("inventoryManagement.transactionDialog.fromDate") }}
            </label>
            <InputText
              v-model="transactionFilterFromDate"
              type="date"
              class="w-full"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-semibold text-gray-700">
              {{ t("inventoryManagement.transactionDialog.toDate") }}
            </label>
            <InputText
              v-model="transactionFilterToDate"
              type="date"
              class="w-full"
            />
          </div>

          <div class="flex items-end gap-2">
            <Button
              :label="t('inventoryManagement.transactionDialog.filter')"
              icon="pi pi-search"
              class="flex-1"
              :loading="transactionLoading"
              @click="applyTransactionFilters"
            />
            <Button
              icon="pi pi-refresh"
              severity="secondary"
              :disabled="transactionLoading"
              @click="resetTransactionFilters"
            />
          </div>
        </div>
      </div>

      <div
        v-if="transactionLoading"
        class="flex justify-center items-center py-12"
      >
        <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
      </div>

      <div v-else-if="itemTransactions" class="flex flex-col gap-6">
        <!-- Summary -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="transaction-summary-card">
            <span class="text-sm text-gray-500">{{ t("inventoryManagement.transactionDialog.itemCode") }}</span>
            <strong>{{ itemTransactions.itemIndentifyId }}</strong>
          </div>

          <div class="transaction-summary-card">
            <span class="text-sm text-gray-500">{{ t("inventoryManagement.transactionDialog.dateRange") }}</span>
            <strong class="text-sm!">{{ transactionDateRangeLabel }}</strong>
          </div>
        </div>

        <!-- Orders History -->
        <div>
          <div class="flex items-center justify-between mb-3! gap-3">
            <h3 class="text-lg font-bold text-gray-900">{{ t("inventoryManagement.transactionDialog.ordersHistory") }}</h3>

            <Chip
              :label="t('inventoryManagement.transactionDialog.ordersCount', { count: filteredTransactionOrders.length })"
              class="chip-warning"
            />
          </div>

          <DataTable
            v-if="filteredTransactionOrders.length > 0"
            :value="paginatedTransactionOrders"
            responsiveLayout="scroll"
            class="transaction-table"
          >
            <Column field="orderId" header="Order ID">
              <template #body="{ data }">
                <span class="font-semibold">#{{ data.orderId }}</span>
              </template>
            </Column>

            <Column field="orderDetailId" header="Detail ID">
              <template #body="{ data }">
                <span>#{{ data.orderDetailId }}</span>
              </template>
            </Column>

            <Column field="orderDate" :header="t('inventoryManagement.transactionDialog.colOrderDate')">
              <template #body="{ data }">
                {{ formatDateTime(data.orderDate) }}
              </template>
            </Column>

            <Column field="machineName" :header="t('inventoryManagement.transactionDialog.colMachine')">
              <template #body="{ data }">
                <div class="flex flex-col">
                  <span class="font-semibold">
                    {{ data.machineName || "-" }}
                  </span>
                </div>
              </template>
            </Column>

            <Column field="lineName" :header="t('inventoryManagement.transactionDialog.colLine')">
              <template #body="{ data }">
                <div class="flex flex-col">
                  <span class="font-semibold">
                    {{ data.lineName || "-" }}
                  </span>
                </div>
              </template>
            </Column>

            <Column field="orderQty" :header="t('inventoryManagement.transactionDialog.colQty')">
              <template #body="{ data }">
                <span class="transaction-qty-text">
                  {{ data.orderQty }}
                </span>
              </template>
            </Column>

            <Column field="detailTotal" :header="t('inventoryManagement.transactionDialog.colItemAmount')">
              <template #body="{ data }">
                <span class="font-semibold">
                  {{ formatCurrency(data.detailTotal) }}
                </span>
              </template>
            </Column>

            <Column field="status" :header="t('inventoryManagement.transactionDialog.colStatus')">
              <template #body="{ data }">
                <Chip
                  :label="data.status"
                  :severity="getOrderStatusSeverity(data.status)"
                />
              </template>
            </Column>
          </DataTable>

          <div v-else class="transaction-empty">
            <i class="pi pi-shopping-cart text-3xl text-gray-400"></i>
            <p>{{ t("inventoryManagement.transactionDialog.noOrdersHistory") }}</p>
          </div>

          <div
            v-if="filteredTransactionOrders.length > 0"
            class="transaction-mini-pagination"
          >
            <span>{{ transactionOrderPageInfo }}</span>

            <div class="flex gap-2">
              <Button
                icon="pi pi-angle-left"
                size="small"
                text
                rounded
                :disabled="transactionOrderPage <= 1"
                @click="goTransactionOrderPage(transactionOrderPage - 1)"
              />

              <span class="transaction-page-badge">
                {{ transactionOrderPage }} / {{ transactionOrderTotalPages }}
              </span>

              <Button
                icon="pi pi-angle-right"
                size="small"
                text
                rounded
                :disabled="transactionOrderPage >= transactionOrderTotalPages"
                @click="goTransactionOrderPage(transactionOrderPage + 1)"
              />
            </div>
          </div>
        </div>

        <!-- StockIn History -->
        <div>
          <div class="flex items-center justify-between mb-3! gap-3">
            <h3 class="text-lg font-bold text-gray-900">{{ t("inventoryManagement.transactionDialog.stockinHistory") }}</h3>

            <Chip
              :label="t('inventoryManagement.transactionDialog.stockinCount', { count: filteredTransactionStockIns.length })"
              class="chip-normal"
            />
          </div>

          <DataTable
            v-if="filteredTransactionStockIns.length > 0"
            :value="paginatedTransactionStockIns"
            responsiveLayout="scroll"
            class="transaction-table"
          >
            <Column field="stockInId" header="StockIn ID">
              <template #body="{ data }">
                <span class="font-semibold">#{{ data.stockInId }}</span>
              </template>
            </Column>

            <Column field="stockInDetailId" header="Detail ID">
              <template #body="{ data }">
                <span>#{{ data.stockInDetailId }}</span>
              </template>
            </Column>

            <Column field="stockInDate" :header="t('inventoryManagement.transactionDialog.colStockinDate')">
              <template #body="{ data }">
                {{ formatDateTime(data.stockInDate) }}
              </template>
            </Column>

            <Column field="quantity" :header="t('inventoryManagement.transactionDialog.colStockinQty')">
              <template #body="{ data }">
                <span class="transaction-qty-text">
                  {{ data.quantity }}
                </span>
              </template>
            </Column>
          </DataTable>

          <div v-else class="transaction-empty">
            <i class="pi pi-download text-3xl text-gray-400"></i>
            <p>{{ t("inventoryManagement.transactionDialog.noStockinHistory") }}</p>
          </div>

          <div
            v-if="filteredTransactionStockIns.length > 0"
            class="transaction-mini-pagination"
          >
            <span>{{ transactionStockInPageInfo }}</span>

            <div class="flex gap-2">
              <Button
                icon="pi pi-angle-left"
                size="small"
                text
                rounded
                :disabled="transactionStockInPage <= 1"
                @click="goTransactionStockInPage(transactionStockInPage - 1)"
              />

              <span class="transaction-page-badge">
                {{ transactionStockInPage }} / {{ transactionStockInTotalPages }}
              </span>

              <Button
                icon="pi pi-angle-right"
                size="small"
                text
                rounded
                :disabled="transactionStockInPage >= transactionStockInTotalPages"
                @click="goTransactionStockInPage(transactionStockInPage + 1)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        :label="t('inventoryManagement.transactionDialog.close')"
        icon="pi pi-times"
        @click="showTransactionDialog = false"
      />
    </template>
  </Dialog>

</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useItemStore } from "@/stores/itemStore";
import { itemAPI } from "@/services/itemAPI";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import MainLayout from "@/components/MainLayout.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Card from "primevue/card";
import Chip from "primevue/chip";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import ConfirmDialog from "primevue/confirmdialog";
import type {
  Item,
  ItemTransactionResponse,
  UpdateItemRequest,
} from "@/types/item.types";
import Dropdown from "primevue/dropdown";
import { useDashboardStore } from "@/stores/dashboard";
import ImagePreviewDialog from "@/views/ImagePreviewDialog.vue";
import { useImagePreview } from "@/composables/useImagePreview";
import { usePagination } from "@/composables/usePagination";
import AppPagination from "@/components/AppPagination.vue";
import { useI18n } from "vue-i18n";
import { useTranslationHelpers } from "@/composables/useTranslationHelpers";

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const itemStore = useItemStore();
const dashboardStore = useDashboardStore();
const imagePreview = useImagePreview();
const cameraFileInput = ref<HTMLInputElement | null>(null);
const pendingImageTimestamps = ref<string[]>([]);
const { t } = useI18n();
const { unitOptions, factoryOptions } = useTranslationHelpers();

// Search & Filter
const searchQuery = ref("");

const selectedType = ref<string | null>(null);
const selectedStockStatus = ref<string | null>(null);
const selectedFactory = ref<string | null>(null);
const isTableMobile = ref(window.innerWidth < 768);

// Item Transactions Dialog
const showTransactionDialog = ref(false);
const transactionLoading = ref(false);
const selectedTransactionItem = ref<Item | null>(null);
const itemTransactions = ref<ItemTransactionResponse | null>(null);

const transactionIdFilter = ref("");

const transactionFilterFromDate = ref("");
const transactionFilterToDate = ref("");

const transactionOrderPage = ref(1);
const transactionStockInPage = ref(1);
const transactionPageSize = 10;

const resetTransactionDateFilters = () => {
  transactionFilterFromDate.value = "";
  transactionFilterToDate.value = "";
};

const buildVnDateTimeOffset = (
  dateValue: string,
  timeValue: "08:00:00" | "07:59:59",
) => {
  if (!dateValue) return "";
  return `${dateValue}T${timeValue}+07:00`;
};

const transactionQuery = computed(() => {
  const fromDate = buildVnDateTimeOffset(
    transactionFilterFromDate.value,
    "08:00:00",
  );
  const toDate = buildVnDateTimeOffset(
    transactionFilterToDate.value,
    "07:59:59",
  );

  if (!fromDate && !toDate) return undefined;

  return {
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
  };
});

const transactionDateRangeLabel = computed(() => {
  if (!transactionQuery.value) return t("inventoryManagement.transactionDialog.allHistory");
  return t("inventoryManagement.transactionDialog.selectedDateRange");
});

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return `${Number(value).toLocaleString("vi-VN")} VND`;
};

const filteredTransactionOrders = computed(() => {
  const orders = itemTransactions.value?.orders || [];
  const term = transactionIdFilter.value.trim().toLowerCase();

  if (!term) return orders;

  return orders.filter((order) => {
    return (
      order.orderId.toString().includes(term) ||
      order.orderDetailId.toString().includes(term) ||
      order.machineName?.toLowerCase().includes(term) || 
      order.lineName?.toLowerCase().includes(term)
    );
  });
});

const filteredTransactionStockIns = computed(() => {
  const stockIns = itemTransactions.value?.stockIns || [];
  const term = transactionIdFilter.value.trim().toLowerCase();

  if (!term) return stockIns;

  return stockIns.filter((stockIn) => {
    return (
      stockIn.stockInId.toString().includes(term) ||
      stockIn.stockInDetailId.toString().includes(term)
    );
  });
});

const transactionOrderTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredTransactionOrders.value.length / transactionPageSize));
});

const transactionStockInTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredTransactionStockIns.value.length / transactionPageSize));
});

const paginatedTransactionOrders = computed(() => {
  const start = (transactionOrderPage.value - 1) * transactionPageSize;
  return filteredTransactionOrders.value.slice(start, start + transactionPageSize);
});

const paginatedTransactionStockIns = computed(() => {
  const start = (transactionStockInPage.value - 1) * transactionPageSize;
  return filteredTransactionStockIns.value.slice(start, start + transactionPageSize);
});

const transactionOrderPageInfo = computed(() => {
  const total = filteredTransactionOrders.value.length;
  if (total === 0) return "0 / 0";

  const start = (transactionOrderPage.value - 1) * transactionPageSize + 1;
  const end = Math.min(transactionOrderPage.value * transactionPageSize, total);

  return `${start} - ${end} / ${total}`;
});

const transactionStockInPageInfo = computed(() => {
  const total = filteredTransactionStockIns.value.length;
  if (total === 0) return "0 / 0";

  const start = (transactionStockInPage.value - 1) * transactionPageSize + 1;
  const end = Math.min(transactionStockInPage.value * transactionPageSize, total);

  return `${start} - ${end} / ${total}`;
});

const goTransactionOrderPage = (page: number) => {
  transactionOrderPage.value = Math.min(
    Math.max(page, 1),
    transactionOrderTotalPages.value,
  );
};

const goTransactionStockInPage = (page: number) => {
  transactionStockInPage.value = Math.min(
    Math.max(page, 1),
    transactionStockInTotalPages.value,
  );
};

watch(transactionIdFilter, () => {
  transactionOrderPage.value = 1;
  transactionStockInPage.value = 1;
});

watch(filteredTransactionOrders, () => {
  if (transactionOrderPage.value > transactionOrderTotalPages.value) {
    transactionOrderPage.value = transactionOrderTotalPages.value;
  }
});

watch(filteredTransactionStockIns, () => {
  if (transactionStockInPage.value > transactionStockInTotalPages.value) {
    transactionStockInPage.value = transactionStockInTotalPages.value;
  }
});
// resize
const handleResize = () => {
  isTableMobile.value = window.innerWidth < 768;
};
// xử lý click từng Chip
const handleChipClick = (status: string) => {
  selectedStockStatus.value = status;
};

const addTimestampToImage = (file: File, timestamp: string): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(img.width, img.height) * 0.035;
      ctx.font = `bold ${fontSize}px monospace`;

      const padding = fontSize * 0.6;
      const text = timestamp;
      const textWidth = ctx.measureText(text).width;
      const boxW = textWidth + padding * 2;
      const boxH = fontSize + padding * 2;

      const x = img.width - boxW - fontSize * 0.5;
      const y = img.height - boxH - fontSize * 0.5;

      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.beginPath();
      ctx.roundRect(x, y, boxW, boxH, fontSize * 0.3);
      ctx.fill();

      ctx.fillStyle = "#FFD700";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 3;
      ctx.fillText(text, x + padding, y + padding + fontSize * 0.85);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            const newFile = new File([blob], file.name, { type: file.type });
            resolve(newFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        0.92,
      );
    };

    img.src = url;
  });
};

const typeOptions = computed(() => [
  { label: t("inventoryManagement.filters.allTypes"), value: null },
  { label: t("reports.inventoryReport.typeOptions.engineer", "Engineer"), value: "ENG" },
  { label: t("reports.inventoryReport.typeOptions.consumer", "Consumer"), value: "COM" },
]);

const stockStatusOptions = [
  { label: t("inventoryManagement.filters.allStatuses"), value: null },
  {
    label: t("inventoryManagement.stockStatusOptions.inStock"),
    value: "in-stock",
  },
  {
    label: t("inventoryManagement.stockStatusOptions.warning"),
    value: "warning",
  },
  { label: t("inventoryManagement.stockStatusOptions.low"), value: "low" },
  {
    label: t("inventoryManagement.stockStatusOptions.critical"),
    value: "critical",
  },
  {
    label: t("inventoryManagement.stockStatusOptions.outOfStock"),
    value: "out-of-stock",
  },
  {
    label: t("inventoryManagement.stockStatusOptions.notConfigured"),
    value: "not-configured",
  },
];

const getFactoryName = (item: Item) => {
  const areaPart = item.areaPart || "";
  const code = item.itemIndentifyId || "";

  if (areaPart.toUpperCase() === "SMD" || code.startsWith("SMD-")) {
    return "SMD";
  }

  if (areaPart.toUpperCase() === "MAINLINE" || code.startsWith("MAINLINE-")) {
    return "MAINLINE";
  }

  return areaPart || "-";
};

const resetFilter = () => {
  selectedFactory.value = null;
  selectedType.value = null;
  selectedStockStatus.value = null;
  searchQuery.value = "";
};
// Utility Functions
const getProductName = (item: Item) =>
  item.eng?.partname || item.com?.name || "Unknown";
const getDistinguishName = (item: Item) =>
  item?.eng?.description || item?.com?.specifications || "Unknown";
const getProductCategory = (item: Item) =>
  item.eng
    ? t("inventoryManagement.category.engineering")
    : item.com
      ? t("inventoryManagement.category.consumer")
      : t("inventoryManagement.category.uncategorized");
const getProductImage = (item: Item) =>
  item.picture?.length
    ? getImageUrl(item.picture[0])
    : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop";

const filteredItems = computed(() => {
  let items = baseItems.value;

  // Chỉ filter theo Stock Status
  if (selectedStockStatus.value === "in-stock") {
    items = items.filter(
      (item) => dashboardStore.getStockStatus(item) === "normal",
    );
  } else if (selectedStockStatus.value === "warning") {
    items = items.filter(
      (item) => dashboardStore.getStockStatus(item) === "warning",
    );
  } else if (selectedStockStatus.value === "low") {
    items = items.filter(
      (item) => dashboardStore.getStockStatus(item) === "low",
    );
  } else if (selectedStockStatus.value === "critical") {
    items = items.filter(
      (item) => dashboardStore.getStockStatus(item) === "critical",
    );
  } else if (selectedStockStatus.value === "out-of-stock") {
    items = items.filter(
      (item) => dashboardStore.getStockStatus(item) === "out-of-stock",
    );
  } else if (selectedStockStatus.value === "not-configured") {
    items = items.filter(
      (item) => dashboardStore.getStockStatus(item) === "not-configured",
    );
  }

  return items;
});

const baseItems = computed(() => {
  if (!itemStore.items?.length) return [];

  let items = itemStore.items;

  // Filter theo xưởng: SMD / Mainline
  if (selectedFactory.value) {
    items = items.filter((item) => {
      return getFactoryName(item) === selectedFactory.value;
    });
  }

  // Chỉ cho filter type sau khi đã chọn xưởng
  if (selectedFactory.value && selectedType.value === "ENG") {
    items = items.filter((item) => {
      const code = item.itemIndentifyId?.toUpperCase() || "";
      return item.eng !== null && code.includes("-ENG-");
    });
  } else if (selectedFactory.value && selectedType.value === "COM") {
    items = items.filter((item) => {
      const code = item.itemIndentifyId?.toUpperCase() || "";
      return item.com !== null && code.includes("-COM-");
    });
  }

  // Search Query
  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase();

    items = items.filter((item) => {
      const name = getProductName(item).toLowerCase();
      const category = getProductCategory(item).toLowerCase();
      const type = item.type?.toLowerCase() || "";
      const id = item.id?.toString() || "";
      const identifyId = item.itemIndentifyId?.toLowerCase() || "";
      const factory = item.areaPart?.toLowerCase() || "";

      return (
        name.includes(term) ||
        category.includes(term) ||
        type.includes(term) ||
        id.includes(term) ||
        identifyId.includes(term) ||
        factory.includes(term)
      );
    });
  }

  return items;
});

const {
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  paginatedList,
  pageInfo,
  goToPage,
  nextPage,
  prevPage,
  firstPage,
  lastPage,
} = usePagination(() => filteredItems.value, isTableMobile.value ? 5 : 10);

const allItemsStockCount = computed(() => {
  if (!baseItems.value?.length)
    return {
      critical: 0,
      low: 0,
      warning: 0,
      outOfStock: 0,
      normal: 0,
      notConfigured: 0,
      total: 0,
    };

  const critical = baseItems.value.filter(
    (item) => dashboardStore.getStockStatus(item) === "critical",
  ).length;

  const low = baseItems.value.filter(
    (item) => dashboardStore.getStockStatus(item) === "low",
  ).length;

  const warning = baseItems.value.filter(
    (item) => dashboardStore.getStockStatus(item) === "warning",
  ).length;

  const outOfStock = baseItems.value.filter(
    (item) => dashboardStore.getStockStatus(item) === "out-of-stock",
  ).length;

  const normal = baseItems.value.filter(
    (item) => dashboardStore.getStockStatus(item) === "normal",
  ).length;

  const notConfigured = baseItems.value.filter(
    (item) => dashboardStore.getStockStatus(item) === "not-configured",
  ).length;

  return {
    critical,
    low,
    warning,
    outOfStock,
    normal,
    notConfigured,
    total: critical + low + warning + outOfStock + normal + notConfigured,
  };
});
const totalFilteredItems = computed(() => filteredItems.value.length);

// Edit Dialog
const showEditDialog = ref(false);
const editingItem = ref<Item | null>(null);
const editForm = ref({
  unit: "",
  price: "",
  saveQuantity: 0,
  stockQty: 0,
  eng: { partname: "", location: "", description: "", vender: "" },
  com: { name: "", location: "", specifications: "", manufacturer: "" },
});

// Image Management
const showImageDialog = ref(false);
const selectedItem = ref<Item | null>(null);
const currentImages = ref<string[]>([]);
const pendingImages = ref<File[]>([]);
const pendingImagePreviews = ref<string[]>([]);
const imageFileInput = ref<HTMLInputElement | null>(null);

const route = useRoute();

onMounted(async () => {
  if (route.query.stockStatus) {
    selectedStockStatus.value = route.query.stockStatus as string;
  }
  if (route.query.area) {
    selectedFactory.value = route.query.area as string;
  }
  
  await fetchAllItems();
  window.addEventListener("resize", handleResize);
  document.addEventListener("paste", handleImageDialogPaste);
});

watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.stockStatus) {
      selectedStockStatus.value = newQuery.stockStatus as string;
    }
    if (newQuery.area) {
      selectedFactory.value = newQuery.area as string;
    }
  },
  { deep: true }
);

onUnmounted(() => {
  itemStore.setCurrentItem(null);
  window.removeEventListener("resize", handleResize);
  document.removeEventListener("paste", handleImageDialogPaste);
});

//  Fetch all items
const fetchAllItems = async () => {
  itemStore.setLoading(true);
  try {
    const items = await itemAPI.getAll();
    itemStore.setItems(items);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("inventoryManagement.toast.errorLoadTitle"),
      detail: error.message || t("inventoryManagement.toast.errorLoadDetail"),
      life: 3000,
    });
  } finally {
    itemStore.setLoading(false);
  }
};

// Helper function to get image URL
const getImageUrl = (filename: string) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${import.meta.env.WAREHOUSE_URL}/api/Item/image/${filename}`;
};

//  Edit Handlers
const openEditDialog = (item: Item) => {
  editingItem.value = item;
  editForm.value = {
    unit: item.unit,
    price: item.price,
    saveQuantity: item.saveQuantity,
    stockQty: item.stockQty,
    eng: {
      partname: item.eng?.partname || "",
      location: item.eng?.location || "",
      description: item.eng?.description || "",
      vender: item.eng?.vender || "",
    },
    com: {
      name: item.com?.name || "",
      location: item.com?.location || "",
      specifications: item.com?.specifications || "",
      manufacturer: item.com?.manufacturer || "",
    },
  };
  showEditDialog.value = true;
};

const saveEdit = async () => {
  if (!editingItem.value?.id) return;

  itemStore.setLoading(true);

  try {
    const payload: UpdateItemRequest = {
      type: editingItem.value.type,
      unit: editForm.value.unit,
      price: editForm.value.price,
      saveQuantity: editForm.value.saveQuantity,
      stockQty: editForm.value.stockQty,
    };

    // Map đúng nested field theo type sản phẩm (không cho đổi type)
    if (editingItem.value.eng) {
      payload.eng = { ...editForm.value.eng };
    } else if (editingItem.value.com) {
      payload.com = { ...editForm.value.com };
    }

    await itemAPI.update(editingItem.value.id, payload);

    toast.add({
      severity: "success",
      summary: t("inventoryManagement.toast.updateSuccessTitle"),
      detail: t("inventoryManagement.toast.updateSuccess"),
      life: 3000,
    });

    showEditDialog.value = false;
    await fetchAllItems();
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("inventoryManagement.toast.errorLoadTitle"),
      detail: error.message || t("inventoryManagement.toast.updateError"),
      life: 3000,
    });
  } finally {
    itemStore.setLoading(false);
  }
};

const confirmDelete = (item: Item) => {
  confirm.require({
    message: t("inventoryManagement.confirmDelete.productMessage", {
      name: getProductName(item),
    }),
    header: t("inventoryManagement.confirmDelete.productHeader"),
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("inventoryManagement.confirmDelete.accept"),
    rejectLabel: t("inventoryManagement.confirmDelete.reject"),
    acceptClass: "p-button-danger",
    accept: async () => {
      if (item.id) {
        itemStore.setLoading(true);

        try {
          await itemAPI.delete(item.id);

          toast.add({
            severity: "success",
            summary: t("inventoryManagement.toast.deleteSuccessTitle"),
            detail: t("inventoryManagement.toast.deleteSuccess"),
            life: 3000,
          });

          await fetchAllItems();
        } catch (error: any) {
          toast.add({
            severity: "error",
            summary: t("inventoryManagement.toast.errorTitle"),
            detail: error.message || t("inventoryManagement.toast.deleteError"),
            life: 3000,
          });
        } finally {
          itemStore.setLoading(false);
        }
      }
    },
  });
};

//  Image Handlers
const viewImages = async (item: Item) => {
  selectedItem.value = item;

  if (item.id) {
    try {
      const itemData = await itemAPI.getById(item.id);
      currentImages.value = itemData.picture || [];
      itemStore.setCurrentItem(itemData);
    } catch (error) {
      currentImages.value = item.picture || [];
    }
  } else {
    currentImages.value = item.picture || [];
  }

  showImageDialog.value = true;
};

const loadItemTransactions = async () => {
  if (!selectedTransactionItem.value?.id) return;

  transactionLoading.value = true;
  itemTransactions.value = null;

  try {
    const data = transactionQuery.value
      ? await itemAPI.getTransactions(
          selectedTransactionItem.value.id,
          transactionQuery.value,
        )
      : await itemAPI.getTransactions(selectedTransactionItem.value.id);

    itemTransactions.value = {
      ...data,
      orders: data.orders || [],
      stockIns: data.stockIns || [],
    };

    transactionOrderPage.value = 1;
    transactionStockInPage.value = 1;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("inventoryManagement.toast.loadHistoryErrorTitle"),
      detail: error.message || t("inventoryManagement.toast.loadHistoryErrorDetail"),
      life: 3000,
    });
  } finally {
    transactionLoading.value = false;
  }
};

const openTransactionDialog = async (item: Item) => {
  if (!item.id) return;

  selectedTransactionItem.value = item;
  showTransactionDialog.value = true;
  transactionIdFilter.value = "";
  resetTransactionDateFilters();

  await loadItemTransactions();
};

const applyTransactionFilters = async () => {
  transactionOrderPage.value = 1;
  transactionStockInPage.value = 1;
  await loadItemTransactions();
};

const resetTransactionFilters = async () => {
  transactionIdFilter.value = "";
  resetTransactionDateFilters();
  transactionOrderPage.value = 1;
  transactionStockInPage.value = 1;
  await loadItemTransactions();
};

const formatDateTime = (date?: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getOrderStatusSeverity = (status: string) => {
  switch (status) {
    case "Pending":
      return "warning";
    case "Approved":
      return "info";
    case "Completed":
      return "success";
    case "Rejected":
      return "danger";
    default:
      return "secondary";
  }
};

const closeImageDialog = () => {
  showImageDialog.value = false;
  selectedItem.value = null;
  currentImages.value = [];
  clearPendingImages();
  itemStore.setCurrentItem(null);
};

const addClipboardImageToPending = async (file: File, mimeType: string) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(mimeType)) {
    toast.add({
      severity: "warn",
      summary: t("inventoryManagement.toast.warningTitle"),
      detail: t("inventoryManagement.toast.unsupportedFormat"),
      life: 3000,
    });
    return;
  }

  if (file.size > maxSize) {
    toast.add({
      severity: "warn",
      summary: t("inventoryManagement.toast.warningTitle"),
      detail: t("inventoryManagement.toast.fileTooLargeSimple"),
      life: 3000,
    });
    return;
  }

  const now = new Date();

  const timestamp = now.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const ext =
    mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1] || "png";

  const newName = `paste_${now.getFullYear()}${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
    now.getHours(),
  ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
    now.getSeconds(),
  ).padStart(2, "0")}.${ext}`;

  const renamedFile = new File([file], newName, { type: mimeType });

  // Nếu muốn giữ timestamp giống ảnh chụp/chọn ảnh hiện tại
  const watermarked = await addTimestampToImage(renamedFile, timestamp);

  pendingImages.value.push(watermarked);
  pendingImageTimestamps.value.push(timestamp);

  const reader = new FileReader();

  reader.onload = (e) => {
    if (e.target?.result) {
      pendingImagePreviews.value.push(e.target.result as string);
    }
  };

  reader.readAsDataURL(watermarked);

  toast.add({
    severity: "success",
    summary: t("inventoryManagement.toast.uploadSuccessTitle"),
    detail: t("inventoryManagement.toast.pasteImageSuccess"),
    life: 2000,
  });
};

const handleImageDialogPaste = async (event: ClipboardEvent) => {
  try {
    // Chỉ cho paste khi dialog quản lý ảnh đang mở
    if (!showImageDialog.value) return;

    // Không paste khi đang upload
    if (itemStore.uploadingImages) return;

    const items = event.clipboardData?.items;
    if (!items) return;

    const imageItems = Array.from(items).filter((item) =>
      item.type.startsWith("image/"),
    );

    if (imageItems.length === 0) return;

    event.preventDefault();

    for (const item of imageItems) {
      const file = item.getAsFile();
      if (!file) continue;

      await addClipboardImageToPending(file, item.type);
    }
  } catch (error) {
    console.error(error);
  }
};

const handleImageUpload = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files?.length) return;

  const maxSize = 5 * 1024 * 1024;
  const validFiles: File[] = [];

  Array.from(files).forEach((file) => {
    if (
      !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
        file.type,
      )
    ) {
      toast.add({
        severity: "warn",
        summary: t("inventoryManagement.toast.warningTitle"),
        detail: t("inventoryManagement.toast.invalidFormat", {
          name: file.name,
        }),
        life: 3000,
      });
      return;
    }
    if (file.size > maxSize) {
      toast.add({
        severity: "warn",
        summary: t("inventoryManagement.toast.warningTitle"),
        detail: t("inventoryManagement.toast.fileTooLarge", {
          name: file.name,
        }),
        life: 3000,
      });
      return;
    }
    validFiles.push(file);
  });

  if (!validFiles.length) return;

  for (const file of validFiles) {
    const now = new Date();
    const timestamp = now.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const watermarked = await addTimestampToImage(file, timestamp);
    pendingImages.value.push(watermarked);
    pendingImageTimestamps.value.push(timestamp);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result)
        pendingImagePreviews.value.push(e.target.result as string);
    };
    reader.readAsDataURL(watermarked);
  }

  if (imageFileInput.value) imageFileInput.value.value = "";
};

const handleCameraCapture = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files?.length) return;

  const file = files[0];
  const maxSize = 5 * 1024 * 1024;

  if (
    !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)
  ) {
    toast.add({
      severity: "warn",
      summary: t("inventoryManagement.toast.warningTitle"),
      detail: t("inventoryManagement.toast.unsupportedFormat"),
      life: 3000,
    });
    return;
  }
  if (file.size > maxSize) {
    toast.add({
      severity: "warn",
      summary: t("inventoryManagement.toast.warningTitle"),
      detail: t("inventoryManagement.toast.fileTooLargeSimple"),
      life: 3000,
    });
    return;
  }

  const now = new Date();
  const timestamp = now.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const ext = file.name.split(".").pop() || "jpg";
  const newName = `photo_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}.${ext}`;
  const renamedFile = new File([file], newName, { type: file.type });

  const watermarked = await addTimestampToImage(renamedFile, timestamp);
  pendingImages.value.push(watermarked);
  pendingImageTimestamps.value.push(timestamp);

  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result)
      pendingImagePreviews.value.push(e.target.result as string);
  };
  reader.readAsDataURL(watermarked);

  if (cameraFileInput.value) cameraFileInput.value.value = "";
};

const removePendingImage = (index: number) => {
  pendingImages.value.splice(index, 1);
  pendingImagePreviews.value.splice(index, 1);
  pendingImageTimestamps.value.splice(index, 1);
};

const clearPendingImages = () => {
  pendingImages.value = [];
  pendingImagePreviews.value = [];
  pendingImageTimestamps.value = [];
};

const uploadPendingImages = async () => {
  if (!selectedItem.value?.id || !pendingImages.value.length) {
    toast.add({
      severity: "warn",
      summary: t("inventoryManagement.toast.warningTitle"),
      detail: t("inventoryManagement.toast.noFileSelected"),
      life: 3000,
    });
    return;
  }

  itemStore.setUploadingImages(true);

  try {
    const result = await itemAPI.uploadImagesSequentially(
      selectedItem.value.id,
      pendingImages.value,
    );

    if (result.success > 0) {
      toast.add({
        severity: "success",
        summary: t("inventoryManagement.toast.uploadSuccessTitle"),
        detail: t("inventoryManagement.toast.uploadSuccessDetail", {
          success: result.success,
          total: pendingImages.value.length,
        }),
        life: 3000,
      });

      clearPendingImages();

      // Refresh item data
      if (selectedItem.value.id) {
        const itemData = await itemAPI.getById(selectedItem.value.id);
        currentImages.value = itemData.picture || [];
        itemStore.setCurrentItem(itemData);
      }

      await fetchAllItems();
    }

    if (result.failed > 0) {
      toast.add({
        severity: "error",
        summary: t("inventoryManagement.toast.errorTitle"),
        detail: t("inventoryManagement.toast.uploadFailDetail", {
          count: result.failed,
        }),
        life: 5000,
      });
    }
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("inventoryManagement.toast.errorTitle"),
      detail: error.message || t("inventoryManagement.toast.uploadError"),
      life: 3000,
    });
  } finally {
    itemStore.setUploadingImages(false);
  }
};

const confirmDeleteImage = (imageName: string) => {
  confirm.require({
    message: t("inventoryManagement.confirmDelete.imageMessage"),
    header: t("inventoryManagement.confirmDelete.imageHeader"),
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("common.delete"),
    rejectLabel: t("common.cancel"),
    acceptClass: "p-button-danger",
    accept: async () => {
      if (!selectedItem.value?.id) return;

      const filename = imageName.split("/").pop() || imageName;

      itemStore.setDeletingImage(true);

      try {
        await itemAPI.deleteImage(selectedItem.value.id, filename);

        toast.add({
          severity: "success",
          summary: t("inventoryManagement.toast.deleteImageSuccessTitle"),
          detail: t("inventoryManagement.toast.deleteImageSuccess"),
          life: 3000,
        });

        // Refresh item data
        if (selectedItem.value.id) {
          const itemData = await itemAPI.getById(selectedItem.value.id);
          currentImages.value = itemData.picture || [];
          itemStore.setCurrentItem(itemData);
        }

        await fetchAllItems();
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: t("inventoryManagement.toast.errorTitle"),
          detail:
            error.message || t("inventoryManagement.toast.deleteImageError"),
          life: 3000,
        });
      } finally {
        itemStore.setDeletingImage(false);
      }
    },
  });
};

const viewImageFullscreen = (imageUrl: string) => {
  const fullUrls = currentImages.value.map((img) => getImageUrl(img));
  imagePreview.open(getImageUrl(imageUrl), fullUrls);
};

watch(isTableMobile, (mobile) => {
  pageSize.value = mobile ? 5 : 10;
});

watch(selectedFactory, () => {
  selectedType.value = null;
});
</script>

<style scoped>
:deep(.content-area) {
  padding: 0 !important;
  max-width: none !important;
  margin: 0 !important;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  cursor: pointer;
}
/* Image Container - FIX CRITICAL */
.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
.delete-button:hover {
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInMask {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
  transition:
    background-color 0.2s,
    color 0.2s !important;
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
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
  }
}

@keyframes pulse-danger {
  0%,
  100% {
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

.transaction-summary-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.transaction-summary-card strong {
  font-size: 18px;
  color: #111827;
}

.transaction-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  border: 2px dashed #e5e7eb;
  border-radius: 14px;
  background: #f9fafb;
  color: #6b7280;
}

.transaction-table :deep(.p-datatable-tbody > tr) {
  cursor: default;
}

.transaction-table :deep(.p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}

.transaction-filter-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.transaction-qty-text {
  display: inline-flex;
  min-width: 42px;
  font-weight: 700;
  color: #111827;
}

.transaction-mini-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  color: #4b5563;
  font-size: 13px;
}

.transaction-page-badge {
  min-width: 72px;
  height: 32px;
  padding: 0 10px;
  border-radius: 999px;
  background: white;
  border: 1px solid #e5e7eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #111827;
}

@media (max-width: 768px) {
  .transaction-mini-pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .transaction-mini-pagination > div {
    justify-content: center;
  }
}

</style>
