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
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold mb-4 text-gray-900">
            {{ t("orderManagement.orders") }}
          </h2>
          <p class="text-gray-600">{{ t("orderManagement.subtitle") }}</p>
        </div>
        <Button
          :label="t('orderManagement.createOrder.title')"
          icon="pi pi-plus"
          class="btn-primary"
          @click="openCreateOrderDialog"
        />
      </div>

      <!-- Search & Filter -->
      <Card class="mb-4">
        <template #content>
          <div class="flex flex-col gap-4">
            <!-- Date Range -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">{{
                  t("common.filter.fromDate")
                }}</label>
                <Calendar
                  v-model="fromDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showTime
                  hourFormat="24"
                  :stepMinute="15"
                  class="w-full calendar-full-width"
                  @date-select="fetchAllOrders"
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">{{
                  t("common.filter.toDate")
                }}</label>
                <Calendar
                  v-model="toDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showTime
                  hourFormat="24"
                  :stepMinute="15"
                  class="w-full calendar-full-width"
                  @date-select="fetchAllOrders"
                />
              </div>
            </div>

            <!-- Status Filter -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">{{
                  t("common.filter.status")
                }}</label>
                <Dropdown
                  v-model="selectedStatus"
                  :options="statusFilterOptions"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="t('orderManagement.allStatus')"
                  class="w-full"
                  @change="fetchAllOrders"
                />
              </div>

              <div>
                <label class="block mb-2 text-sm font-semibold text-gray-700">{{
                  t("common.search")
                }}</label>
                <InputText
                  v-model="searchQuery"
                  :placeholder="t('orderManagement.searchPlaceholder')"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Search & Actions -->
            <div class="flex justify-between items-center">
              <div
                class="flex md:flex-row lg:flex-row flex-col items-center gap-4"
              >
                <span class="text-lg font-semibold text-gray-900">
                  {{ t("orderManagement.totalOrders") }}: {{ totalItems }}
                  {{ t("orderManagement.orders") }}
                </span>

                <Chip
                  v-if="route.query.status"
                  :label="`${getStatusLabel(route.query.status as string)}`"
                  class="w-full"
                  severity="info"
                  removable
                  @remove="clearStatusFilter"
                />
              </div>

              <div class="flex gap-3">
                <Button
                  :label="t('common.filter.reset')"
                  icon="pi pi-refresh"
                  severity="secondary"
                  @click="resetFilter"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <!-- Statistics -->
        <div class="stats-grid mb-6">
          <div class="stat-card pending">
            <div class="stat-icon"><i class="pi pi-clock"></i></div>
            <div>
              <p class="stat-label">{{ t("orderManagement.pending") }}</p>
              <p class="stat-value">{{ orderStore.pendingOrders.length }}</p>
            </div>
          </div>
          <div class="stat-card approved">
            <div class="stat-icon"><i class="pi pi-check-circle"></i></div>
            <div>
              <p class="stat-label">{{ t("orderManagement.approved") }}</p>
              <p class="stat-value">{{ orderStore.approvedOrders.length }}</p>
            </div>
          </div>
          <div class="stat-card completed">
            <div class="stat-icon"><i class="pi pi-verified"></i></div>
            <div>
              <p class="stat-label">{{ t("orderManagement.completed") }}</p>
              <p class="stat-value">{{ orderStore.completedOrders.length }}</p>
            </div>
          </div>
          <div class="stat-card rejected">
            <div class="stat-icon"><i class="pi pi-times-circle"></i></div>
            <div>
              <p class="stat-label">{{ t("orderManagement.rejected") }}</p>
              <p class="stat-value">{{ orderStore.rejectedOrders.length }}</p>
            </div>
          </div>
        </div>

        <template #content>
          <!-- DESKTOP: DataTable -->
          <DataTable
            v-if="!isTableMobile"
            :value="paginatedOrders"
            :paginator="false"
            :rows="10"
            :loading="orderStore.loading"
            responsiveLayout="scroll"
            :rowClass="getRowClass"
          >
            <template #empty>
              <div class="text-center py-8">
                <i class="pi pi-shopping-cart text-5xl text-gray-400"></i>
                <p class="mt-4 text-gray-500">{{ t("dashboard.noOrders") }}</p>
              </div>
            </template>

            <Column field="id" header="ID" sortable class="w-20">
              <template #body="{ data }">
                <span :data-order-id="data.id">{{ data.id }}</span>
              </template>
            </Column>
            <Column
              field="orderDate"
              :header="t('orderManagement.orderDate')"
              sortable
            >
              <template #body="{ data }">{{
                formatDate(data.orderDate)
              }}</template>
            </Column>
            <Column
              field="nameWorker"
              :header="t('orderManagement.account')"
              sortable
            >
              <template #body="{ data }">
                <span class="font-medium">{{
                  data.account?.username || "-"
                }}</span>
              </template>
            </Column>
            <Column
              field="account.department"
              :header="t('orderManagement.department')"
              sortable
            ></Column>
            <Column :header="t('common.product')">
              <template #body="{ data }">
                <Chip
                  :label="`${data.orderDetails.length} ${t('common.product')}`"
                  class="p-chip-info"
                  style="width: fit-content"
                />
              </template>
            </Column>
            <Column field="status" :header="t('common.filter.status')" sortable>
              <template #body="{ data }">
                <Chip
                  :label="getStatusLabel(data.status)"
                  :class="getStatusClass(data.status)"
                />
              </template>
            </Column>
            <Column :header="t('common.action')" class="w-52">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-eye"
                    text
                    rounded
                    severity="info"
                    @click="viewOrderDetails(data)"
                    :title="t('orderManagement.viewDetail')"
                  />
                  <Button
                    icon="pi pi-images"
                    text
                    rounded
                    severity="secondary"
                    @click="viewOrderImages(data)"
                    :title="t('orderManagement.manageImages')"
                  />
                  <Button
                    v-if="
                      data.status === 'Pending' || data.status === 'Approved'
                    "
                    icon="pi pi-pencil"
                    text
                    rounded
                    severity="warning"
                    @click="openUpdateStatusDialog(data)"
                    :title="t('orderManagement.updateStatus')"
                  />
                  <Button
                    v-if="data.status === 'Rejected'"
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    @click="confirmDelete(data)"
                    :title="t('common.delete')"
                  />
                </div>
              </template>
            </Column>
          </DataTable>

          <!-- MOBILE: Card List -->
          <div v-else>
            <div v-if="orderStore.loading" class="text-center py-8">
              <i class="pi pi-spin pi-spinner text-3xl text-gray-400"></i>
            </div>
            <div
              v-else-if="filteredOrders.length === 0"
              class="text-center py-8"
            >
              <i class="pi pi-shopping-cart text-5xl text-gray-400"></i>
              <p class="mt-4 text-gray-500">{{ t("dashboard.noOrders") }}</p>
            </div>
            <div v-else class="order-card-list">
              <div
                v-for="order in paginatedOrders"
                :key="order.id"
                class="order-card"
                :data-order-id="order.id"
                @click="viewOrderDetails(order)"
              >
                <!-- Card Header -->
                <div class="order-card-header">
                  <div class="flex items-center gap-2">
                    <span class="order-card-id">#{{ order.id }}</span>
                    <Chip
                      :label="getStatusLabel(order.status)"
                      :class="getStatusClass(order.status)"
                    />
                  </div>
                  <span class="order-card-date">{{
                    formatDate(order.orderDate)
                  }}</span>
                </div>

                <!-- Card Body -->
                <div class="order-card-body">
                  <div class="order-card-row">
                    <i class="pi pi-user text-gray-400"></i>
                    <span class="order-card-label">{{
                      t("orderManagement.account")
                    }}</span>
                    <span class="order-card-value">{{
                      order.account?.username || "-"
                    }}</span>
                  </div>
                  <div class="order-card-row">
                    <i class="pi pi-building text-gray-400"></i>
                    <span class="order-card-label">{{
                      t("orderManagement.department")
                    }}</span>
                    <span class="order-card-value">{{
                      order.account?.department || "-"
                    }}</span>
                  </div>
                  <div class="order-card-row">
                    <i class="pi pi-box text-gray-400"></i>
                    <span class="order-card-label">{{
                      t("common.product")
                    }}</span>
                    <span class="order-card-value">
                      {{ order.orderDetails.length }}
                      {{ t("common.categoryItemCount") }} -
                      {{ getTotalQuantity(order) }}
                      {{ t("common.quantityItemCount") }}
                    </span>
                  </div>
                </div>

                <!-- Card Footer: Actions -->
                <div class="order-card-footer" @click.stop>
                  <Button
                    icon="pi pi-eye"
                    label="Chi tiết"
                    text
                    size="small"
                    severity="info"
                    @click="viewOrderDetails(order)"
                  />
                  <Button
                    icon="pi pi-images"
                    label="Ảnh"
                    text
                    size="small"
                    severity="secondary"
                    @click="viewOrderImages(order)"
                  />
                  <Button
                    v-if="
                      order.status === 'Pending' || order.status === 'Approved'
                    "
                    icon="pi pi-pencil"
                    :label="t('common.update')"
                    text
                    size="small"
                    severity="warning"
                    @click="openUpdateStatusDialog(order)"
                  />
                  <Button
                    v-if="order.status === 'Rejected'"
                    icon="pi pi-trash"
                    :label="t('common.delete')"
                    text
                    size="small"
                    severity="danger"
                    @click="confirmDelete(order)"
                  />
                </div>
              </div>
            </div>
          </div>

          <AppPagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="totalItems"
            :page-info="pageInfo"
            v-model:model-page-size="pageSize"
            @prev="prevPage"
            @next="nextPage"
            @first="firstPage"
            @last="lastPage"
            @goto="goToPage"
          />
        </template>
      </Card>
    </div>

    <!-- Order Details Dialog -->
    <Dialog
      v-model:visible="showDetailsDialog"
      :header="`${t('orderManagement.orderDetail.title')} #${selectedOrder?.id || ''}`"
      :blockScroll="true"
      :style="{ width: '900px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
    >
      <div v-if="selectedOrder" class="order-details">
        <!-- Order Info -->
        <div class="grid grid-cols-2 gap-4 mb-4 p-4! bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm text-gray-600">
              {{ t("orderManagement.orderDetail.orderedBy") }}
            </p>
            <p class="font-semibold">{{ selectedOrder.nameWorker || "-" }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">
              {{ t("orderManagement.orderDetail.department") }}
            </p>
            <p class="font-semibold">
              {{ selectedOrder.account?.department || "-" }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">
              {{ t("orderManagement.orderDetail.orderDate") }}
            </p>
            <p class="font-semibold">
              {{ formatDate(selectedOrder.orderDate) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">{{ t("common.status") }}</p>
            <Chip
              :label="getStatusLabel(selectedOrder.status)"
              :class="getStatusClass(selectedOrder.status)"
            />
          </div>
        </div>

        <!-- Order Items -->
        <div>
          <h4 class="font-semibold mb-3">
            {{ t("orderManagement.orderDetail.productList") }}
          </h4>

          <!-- DESKTOP: Table -->
          <DataTable
            v-if="!isTableMobile"
            :value="selectedOrder.orderDetails"
            responsiveLayout="scroll"
          >
            <Column :header="t('common.product')">
              <template #body="{ data }">
                <div class="flex items-center gap-3">
                  <img
                    v-if="data.item?.picture?.length"
                    :src="getItemImageUrl(data.item.picture[0])"
                    class="w-12 h-12 rounded object-cover"
                  />
                  <div
                    v-else
                    class="w-12 h-12 rounded bg-gray-200 flex items-center justify-center"
                  >
                    <i class="pi pi-image text-gray-400"></i>
                  </div>
                  <div>
                    <p class="font-semibold">{{ getItemName(data.item) }}</p>
                    <p class="text-sm text-gray-500">
                      {{ data.item?.itemIndentifyId || "-" }}
                    </p>
                  </div>
                </div>
              </template>
            </Column>
            <Column field="orderQty" :header="t('common.quantity')">
              <template #body="{ data }">
                <span class="font-medium"
                  >{{ data.orderQty }} {{ data.item?.unit || "" }}</span
                >
              </template>
            </Column>
            <Column :header="t('common.price')">
              <template #body="{ data }">
                <span v-if="data.item?.price">
                  {{ Number(data.item.price).toLocaleString("vi-VN") }} VND
                </span>
                <span v-else class="text-gray-400">{{
                  t("common.noPrice")
                }}</span>
              </template>
            </Column>
            <Column :header="t('common.total')">
              <template #body="{ data }">
                <span
                  v-if="data.item?.price"
                  class="font-semibold text-blue-600"
                >
                  {{
                    (Number(data.item.price) * data.orderQty).toLocaleString(
                      "vi-VN",
                    )
                  }}
                  VND
                </span>
                <span v-else class="text-gray-400">---</span>
              </template>
            </Column>
          </DataTable>

          <!-- MOBILE: Card list -->
          <div v-else class="dialog-item-card-list">
            <div
              v-for="(data, index) in selectedOrder.orderDetails"
              :key="index"
              class="dialog-item-card"
            >
              <!-- Product Info Row -->
              <div class="dialog-item-card-top">
                <img
                  v-if="data.item?.picture?.length"
                  :src="getItemImageUrl(data.item.picture[0])"
                  class="dialog-item-img"
                />
                <div v-else class="dialog-item-img-placeholder">
                  <i class="pi pi-image text-gray-400"></i>
                </div>
                <div class="dialog-item-info">
                  <p class="dialog-item-name">{{ getItemName(data.item) }}</p>
                  <p class="dialog-item-id">
                    {{ data.item?.itemIndentifyId || "-" }}
                  </p>
                </div>
              </div>

              <!-- Price Info Row -->
              <div class="dialog-item-card-bottom">
                <div class="dialog-item-price-row">
                  <span class="dialog-item-price-label">{{
                    t("common.quantity")
                  }}</span>
                  <span class="dialog-item-price-value">
                    {{ data.orderQty }} {{ data.item?.unit || "" }}
                  </span>
                </div>
                <div class="dialog-item-price-row">
                  <span class="dialog-item-price-label">{{
                    t("common.price")
                  }}</span>
                  <span class="dialog-item-price-value">
                    {{
                      data.item?.price
                        ? Number(data.item.price).toLocaleString("vi-VN") +
                          " VND"
                        : t("common.noPrice")
                    }}
                  </span>
                </div>
                <div class="dialog-item-price-row total">
                  <span class="dialog-item-price-label">{{
                    t("common.total")
                  }}</span>
                  <span class="dialog-item-total">
                    {{
                      data.item?.price
                        ? (
                            Number(data.item.price) * data.orderQty
                          ).toLocaleString("vi-VN") + " VND"
                        : "---"
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          :label="t('common.close')"
          icon="pi pi-times"
          text
          @click="showDetailsDialog = false"
        />
        <Button
          v-if="
            selectedOrder?.status === 'Pending' ||
            selectedOrder?.status === 'Approved'
          "
          :label="t('orderManagement.updateStatus')"
          icon="pi pi-pencil"
          severity="warning"
          @click="
            () => {
              showImageDialog = false;
              openUpdateStatusDialog(selectedOrder!);
            }
          "
        />
      </template>
    </Dialog>

    <!-- Update Status Dialog -->
    <Dialog
      v-model:visible="showUpdateStatusDialog"
      :header="t('orderManagement.updateStatusOrder')"
      :blockScroll="true"
      :style="{ width: '500px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
    >
      <div class="flex flex-col gap-4 mt-4">
        <div>
          <label class="block mb-2 font-semibold">
            {{ t("common.status") }} <span class="text-red-500">*</span>
          </label>
          <Dropdown
            v-model="updateForm.status"
            :options="updateStatusOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('orderManagement.chooseStatus')"
            class="w-full"
          />
        </div>
        <!-- Note field - Chỉ hiển thị khi chọn Rejected -->
        <div v-if="updateForm.status === 'Rejected'">
          <label class="block mb-2 font-semibold">
            {{ t("orderManagement.rejectReason") }}
            <span class="text-red-500">*</span>
          </label>
          <Textarea
            v-model="updateForm.note"
            rows="4"
            :placeholder="t('orderManagement.rejectReasonPlaceholder')"
            class="w-full"
            :class="{
              'p-invalid':
                updateForm.status === 'Rejected' && !updateForm.note.trim(),
            }"
          />
        </div>

        <!-- Cảnh báo khi chọn Completed -->
        <div
          v-if="
            updateForm.status === 'Completed' &&
            selectedOrder &&
            (!selectedOrder.image || selectedOrder.image.length === 0)
          "
          class="p-3! bg-orange-50 border border-orange-200 rounded-lg"
        >
          <div class="flex items-start gap-2">
            <i class="pi pi-exclamation-triangle text-orange-600 mt-1"></i>
            <div class="flex-1">
              <p class="font-semibold text-orange-800 text-sm mb-1">
                {{ t("orderManagement.proveImage") }}
              </p>
              <p class="text-orange-700 text-xs">
                {{ t("orderManagement.proveImagePlaceholder") }}
              </p>
              <Button
                :label="t('orderManagement.manageImages')"
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
            {{ t("dashboard.orders") }}:
            <span class="font-semibold">#{{ selectedOrder.id }}</span>
          </p>
          <p class="text-sm text-gray-600 mb-1">
            {{ t("orderManagement.orderDetail.orderedBy") }}:
            <span class="font-semibold">{{
              selectedOrder.nameWorker || selectedOrder.account?.username
            }}</span>
          </p>
          <p class="text-sm text-gray-600 mb-1">
            {{ t("orderManagement.currentStatus") }}:
            <Chip
              :label="getStatusLabel(selectedOrder.status)"
              :class="getStatusClass(selectedOrder.status)"
              class="ml-1"
            />
          </p>
          <!-- Hiển thị số lượng ảnh -->
          <p class="text-sm text-gray-600">
            {{ t("common.image") }}:
            <span class="font-semibold"
              >{{ selectedOrder.image?.length || 0 }}
              {{ t("orderManagement.img") }}</span
            >
          </p>
        </div>
      </div>

      <template #footer>
        <Button
          :label="t('common.cancel')"
          icon="pi pi-times"
          text
          @click="showUpdateStatusDialog = false"
          :disabled="orderStore.loading"
        />
        <Button
          :label="t('common.update')"
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
      :header="`${t('orderManagement.imageManagement.title')} #${selectedOrder?.id || ''}`"
      :blockScroll="true"
      :style="{ width: '800px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
    >
      <div class="mt-4">
        <!-- Upload Area -->
        <div class="mb-6">
          <label class="block mb-2 font-semibold">
            {{ t("orderManagement.imageManagement.upload") }}
            <span
              v-if="orderStore.uploadingImages"
              class="text-primary text-sm ml-2"
            >
              <i class="pi pi-spin pi-spinner"></i> {{ t("common.uploading") }}
            </span>
          </label>

          <!-- Mobile: 2 nút chọn ảnh / chụp ảnh -->
          <div v-if="isTableMobile" class="flex gap-2 mb-3">
            <Button
              :label="t('common.selectImage')"
              icon="pi pi-images"
              severity="secondary"
              class="flex-1"
              :disabled="orderStore.uploadingImages"
              @click="imageFileInput?.click()"
            />
            <Button
              :label="t('common.takePhoto')"
              icon="pi pi-camera"
              severity="secondary"
              class="flex-1"
              :disabled="orderStore.uploadingImages"
              @click="cameraFileInput?.click()"
            />
          </div>

          <!-- Desktop: Drop zone (giữ nguyên) -->
          <div
            v-if="!isTableMobile"
            @click="!orderStore.uploadingImages && imageFileInput?.click()"
            @dragover.prevent
            @drop.prevent="handleDrop"
            class="border-2 border-dashed rounded-xl p-4! transition-all"
            :class="
              orderStore.uploadingImages
                ? 'opacity-50 cursor-not-allowed border-gray-300'
                : 'border-gray-400 hover:bg-gray-50 cursor-pointer'
            "
          >
            <!-- Pending Images Grid bên trong vùng upload -->
            <div
              v-if="pendingImages.length > 0"
              class="grid grid-cols-5 gap-3 mb-4"
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
                  !orderStore.uploadingImages && imageFileInput?.click()
                "
              >
                <i class="pi pi-plus text-2xl text-gray-400"></i>
                <span class="text-xs text-gray-400 mt-1">{{
                  t("common.upload.addImage")
                }}</span>
              </div>
            </div>
            <!-- Empty state -->
            <div class="flex flex-col items-center justify-center py-6">
              <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
              <p class="text-gray-600 text-sm font-medium mb-1">
                {{ t("common.upload.dragDropOrClick") }}
              </p>
              <p class="text-xs text-gray-400">
                {{ t("common.upload.maxFileSize") }}
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
                <!-- Hiển thị timestamp nếu có -->
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
                  t("common.upload.addMore")
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
            :disabled="orderStore.uploadingImages"
            class="hidden"
            @change="handleImageUpload"
          />

          <!-- Input chụp ảnh từ camera (mobile only) -->
          <input
            ref="cameraFileInput"
            type="file"
            accept="image/*"
            capture="environment"
            :disabled="orderStore.uploadingImages"
            class="hidden"
            @change="handleCameraCapture"
          />

          <!-- Action buttons -->
          <div
            v-if="pendingImages.length > 0"
            class="flex justify-between items-center mt-3"
          >
            <span class="text-sm text-gray-600 font-medium"
              >{{ t("common.upload.selectedFiles") }}
              {{ pendingImages.length }} file</span
            >
            <div class="flex gap-2 mt-2!">
              <Button
                :label="t('common.createOrderAction.deleteAll')"
                icon="pi pi-trash"
                text
                size="small"
                severity="danger"
                @click="clearPendingImages"
              />
              <Button
                :label="t('common.upload.uploadBtn')"
                icon="pi pi-upload"
                size="small"
                severity="success"
                :loading="orderStore.uploadingImages"
                @click="uploadPendingImages"
              />
            </div>
          </div>
        </div>

        <!-- Current Images -->
        <div>
          <label class="font-semibold mb-3! block"
            >{{ t("common.upload.currentImages") }} ({{
              currentImages.length
            }})</label
          >

          <div
            v-if="currentImages.length === 0"
            class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed"
          >
            <i class="pi pi-image text-5xl text-gray-400"></i>
            <p class="text-gray-500">{{ t("common.upload.noImages") }}</p>
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
                v-if="selectedOrder?.status !== 'Completed'"
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
        <Button
          v-if="
            selectedOrder?.status === 'Pending' ||
            selectedOrder?.status === 'Approved'
          "
          :label="t('orderManagement.updateStatus')"
          icon="pi pi-pencil"
          severity="warning"
          @click="
            () => {
              showDetailsDialog = false;
              openUpdateStatusDialog(selectedOrder!);
            }
          "
        />
      </template>
    </Dialog>

    <!-- Create Order Dialog -->
    <Dialog
      v-model:visible="showCreateOrderDialog"
      :header="t('common.createOrderAction.createOrderTitle')"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :blockScroll="true"
      :style="{ width: '1200px' }"
      :modal="true"
    >
      <div class="flex flex-col gap-4 mt-4">
        <!-- Name Worker -->
        <div>
          <label class="block mb-2 font-semibold">
            {{ t("common.form.ordererName") }}
            <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="createOrderForm.nameWorker"
            class="w-full"
            :placeholder="t('common.form.ordererPlaceholder')"
          />
        </div>

        <!-- Items Selection -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <label class="text-base font-semibold">
              {{ t("common.form.productList") }}
              <span class="text-red-500">*</span>
            </label>
            <Button
              :label="t('common.form.addProduct')"
              icon="pi pi-plus"
              size="small"
              @click="addItemRow"
            />
          </div>

          <div
            v-if="createOrderForm.items.length === 0"
            class="text-center py-8 rounded-lg border-2 border-dashed border-gray-300"
          >
            <i class="pi pi-shopping-cart text-5xl text-gray-400"></i>
            <p class="mt-3! text-gray-500 font-medium">
              {{ t("common.form.noProducts") }}
            </p>
            <Button
              :label="t('common.form.addFirstProduct')"
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
              class="create-order-item-row p-4! border border-gray-200 rounded-lg"
            >
              <!-- Header row: số thứ tự + nút xóa -->
              <div class="flex justify-between items-center mb-3!">
                <span class="text-sm font-semibold text-gray-600">
                  {{ t("common.form.productUnit") }} #{{ index + 1 }}
                </span>
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  size="small"
                  @click="removeItemRow(index)"
                />
              </div>

              <!-- Dropdown sản phẩm - full width -->
              <div class="mb-3!">
                <label class="block mb-2 text-sm font-medium text-gray-700">
                  {{ t("common.form.productUnit") }}
                </label>
                <Dropdown
                  v-model="item.itemId"
                  :options="availableItems"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="t('common.form.selectProduct')"
                  class="w-full"
                  :filter="true"
                  :filterPlaceholder="t('common.form.searchProduct')"
                  appendTo="body"
                  panelClass="order-item-dropdown-panel"
                >
                  <template #value="slotProps">
                    <div
                      v-if="slotProps.value"
                      class="flex items-center gap-2 min-w-0"
                    >
                      <img
                        v-if="getSelectedItemImage(slotProps.value)"
                        :src="getSelectedItemImage(slotProps.value)"
                        class="w-8 h-8 rounded object-cover shrink-0"
                        alt=""
                      />
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-sm truncate">
                          {{ getSelectedItemLabel(slotProps.value) }}
                        </div>
                        <div class="text-xs text-gray-500 truncate">
                          {{ getSelectedItemId(slotProps.value) }} -
                          {{
                            getSelectedItemPrice(
                              slotProps.value,
                            ).toLocaleString("vi-VN")
                          }}
                          VND/{{ getSelectedItemUnit(slotProps.value) }}
                        </div>
                      </div>
                    </div>
                    <span v-else class="text-gray-400">{{
                      slotProps.placeholder
                    }}</span>
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
                        <div class="font-medium truncate">
                          {{ slotProps.option.label }}
                        </div>
                        <div class="text-xs text-gray-500 truncate">
                          {{ slotProps.option.type }} -
                          {{ t("common.form.stockLabel") }}:
                          {{ slotProps.option.stock }}
                          {{ slotProps.option.unit }} -
                          {{
                            Number(slotProps.option.price).toLocaleString(
                              "vi-VN",
                            )
                          }}
                          VND
                        </div>
                      </div>
                    </div>
                  </template>
                </Dropdown>
              </div>

              <!-- Số lượng + Thành tiền: 2 cột cố định -->
<div class="grid grid-cols-2 gap-3 items-end">
  <div>
    <div class="flex items-center justify-between mb-2">
      <label class="text-sm font-medium text-gray-700">
        {{ t('common.form.quantity') }}
      </label>
    </div>
    <small v-if="item.itemId" class="text-gray-500 text-xs block mb-1">
      {{ t('common.form.stockRemaining', { n: getStockQty(item.itemId) }) }}
      {{ getSelectedItemUnit(item.itemId) }}
    </small>
    <small
      v-if="item.itemId && item.quantity > getStockQty(item.itemId)"
      class="text-red-500 text-xs block mb-1"
    >
      {{ t('common.form.exceedStock') }}
    </small>
    <InputNumber
      v-model="item.quantity"
      :min="1"
      :max="getStockQty(item.itemId)"
      showButtons
      class="w-full"
    />
  </div>

  <div>
    <label class="text-sm font-medium text-gray-700 block mb-2">
      {{ t('common.form.subtotal') }}
    </label>
    <div class="h-10 flex items-center">
      <Chip
        v-if="item.itemId && item.quantity > 0"
        :label="`${getItemSubtotal(item.itemId, item.quantity).toLocaleString('vi-VN')} VND`"
        class="bg-green-100 text-green-700 font-bold text-xs"
      />
      <span v-else class="text-gray-400 text-sm">---</span>
    </div>
  </div>
</div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div
          v-if="createOrderForm.items.length > 0"
          class="mt-4 p-4! bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
        >
          <div class="flex items-center justify-between">
            <span class="font-semibold text-gray-700"
              >{{ t("common.form.totalItems") }}:</span
            >
            <span class="text-xl font-bold text-blue-600"
              >{{ createOrderForm.items.length }}
              {{ t("common.form.itemUnit") }}</span
            >
          </div>
          <div class="flex items-center justify-between mt-2!">
            <span class="font-semibold text-gray-700"
              >{{ t("common.form.totalQuantityOrdered") }}:</span
            >
            <span class="text-xl font-bold text-blue-600"
              >{{ totalQuantity.toLocaleString("vi-VN") }}
              {{ t("common.form.productUnit") }}</span
            >
          </div>
          <div
            class="flex items-center justify-between mt-2! pt-2! border-t border-blue-200"
          >
            <span class="font-semibold text-gray-800"
              >{{ t("common.form.totalOrderValue") }}:</span
            >
            <span class="text-2xl font-bold text-indigo-600"
              >{{ totalAmount.toLocaleString("vi-VN") }} VND</span
            >
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          :label="t('common.cancel')"
          icon="pi pi-times"
          text
          @click="closeCreateDialog"
          :disabled="orderStore.loading"
        />
        <Button
          :label="t('common.createOrderAction.createOrder')"
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
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { useOrderStore } from "@/stores/orderStore";
import { useItemStore } from "@/stores/itemStore";
import { orderAPI } from "@/services/orderAPI";
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
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import type { Order, OrderPendingRealtime } from "@/types/order.types";
import Calendar from "primevue/calendar";
import { useRoute, useRouter } from "vue-router";
import { signalRService } from "@/services/orderNotiService";
import Textarea from "primevue/textarea";
import ImagePreviewDialog from "@/views/ImagePreviewDialog.vue";
import { useImagePreview } from "@/composables/useImagePreview";
import { usePagination } from "@/composables/usePagination";
import AppPagination from "@/components/AppPagination.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const imagePreview = useImagePreview();
const confirm = useConfirm();
const toast = useToast();
const orderStore = useOrderStore();
const itemStore = useItemStore();
const route = useRoute();
const router = useRouter();

// Search & Filter
const searchQuery = ref("");
const selectedStatus = ref<string | null>(null);

const fromDate = ref<Date>(new Date(new Date().getFullYear(), 0, 1, 0, 0, 0));
const toDate = ref<Date>(new Date(new Date().setHours(23, 59, 59)));
const selectedDepartment = ref<string | null>(null);
const isTableMobile = ref(window.innerWidth < 768);
const cameraFileInput = ref<HTMLInputElement | null>(null);
const pendingImageTimestamps = ref<string[]>([]);
const handleTableResize = () => {
  isTableMobile.value = window.innerWidth < 768;
};

const statusFilterOptions = [
  { label: t("orderManagement.allStatus"), value: null },
  { label: t("orderManagement.pending"), value: "Pending" },
  { label: t("orderManagement.approved"), value: "Approved" },
  { label: t("orderManagement.completed"), value: "Completed" },
  { label: t("orderManagement.rejected"), value: "Rejected" },
];

// Helper để get status label
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    Pending: t("orderManagement.pending"),
    Approved: t("orderManagement.approved"),
    Completed: t("orderManagement.completed"),
    Rejected: t("orderManagement.rejected"),
  };
  return labels[status] || status;
};

// Clear specific filter
const clearStatusFilter = () => {
  selectedStatus.value = null;
  router.replace({ query: {} });
  fetchAllOrders();
};

const getStockQty = (itemId: number): number => {
  const item = availableItems.value.find((i) => i.value === itemId);
  return item?.stock || 0;
};

const formatDateTimeForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// ========================
// vẽ WATERMARK TIMESTAMP lên ảnh
// ========================
const addTimestampToImage = (file: File, timestamp: string): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d")!;

      // Vẽ ảnh gốc
      ctx.drawImage(img, 0, 0);

      // Config text
      const fontSize = Math.max(img.width, img.height) * 0.035;
      ctx.font = `bold ${fontSize}px monospace`;

      const padding = fontSize * 0.6;
      const text = timestamp;
      const textWidth = ctx.measureText(text).width;
      const boxW = textWidth + padding * 2;
      const boxH = fontSize + padding * 2;

      // Vị trí: góc dưới bên phải
      const x = img.width - boxW - fontSize * 0.5;
      const y = img.height - boxH - fontSize * 0.5;

      // Nền mờ
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.beginPath();
      ctx.roundRect(x, y, boxW, boxH, fontSize * 0.3);
      ctx.fill();

      // Text màu vàng kiểu camera
      ctx.fillStyle = "#FFD700";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 3;
      ctx.fillText(text, x + padding, y + padding + fontSize * 0.85);

      // Xuất file
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            const ext = file.name.split(".").pop() || "jpg";
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

const updateStatusOptions = computed(() => {
  if (!selectedOrder.value) return [];

  if (selectedOrder.value.status === "Pending") {
    return [
      { label: t("common.createOrderAction.approveOrder"), value: "Approved" },
      { label: t("common.createOrderAction.rejectOrder"), value: "Rejected" },
    ];
  } else if (selectedOrder.value.status === "Approved") {
    return [
      {
        label: t("common.createOrderAction.completeOrder"),
        value: "Completed",
      },
      { label: t("common.createOrderAction.rejectOrder"), value: "Rejected" },
    ];
  }

  return [];
});

const filteredOrders = computed(() => {
  if (!orderStore.orders?.length) return [];

  let filtered = orderStore.orders;

  // CHỈ FILTER SEARCH Ở CLIENT
  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.id?.toString().includes(term) ||
        order.account?.username.toLowerCase().includes(term) ||
        order.account?.department.toLowerCase().includes(term) ||
        order.nameWorker.toLowerCase().includes(term),
    );
  }

  return filtered;
});
const {
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  paginatedList: paginatedOrders,
  pageInfo,
  goToPage,
  nextPage,
  prevPage,
  firstPage,
  lastPage,
} = usePagination(() => filteredOrders.value, isTableMobile.value ? 5 : 10);

// Dialogs
const showDetailsDialog = ref(false);
const showUpdateStatusDialog = ref(false);
const showImageDialog = ref(false);
const showCreateOrderDialog = ref(false);
const selectedOrder = ref<Order | null>(null);

// Update Form
const updateForm = ref({
  status: "",
  note: "",
});

// Create Order Form
interface CreateOrderItem {
  itemId: number;
  quantity: number;
}

const createOrderForm = ref({
  nameWorker: "",
  items: [] as CreateOrderItem[],
});

const availableItems = computed(() => {
  if (!itemStore.items?.length) return [];

  return itemStore.items.map((item) => ({
    value: item.id,
    label: getItemName(item),
    type: item.type,
    stock: item.stockQty,
    unit: item.unit,
    price: item.price || 0,
    itemIndentifyId: item.itemIndentifyId,
    image: item.picture?.length ? getItemImageUrl(item.picture[0]) : null,
  }));
});

// Form validation
const isFormValid = computed(() => {
  return (
    createOrderForm.value.nameWorker.trim() !== "" &&
    createOrderForm.value.items.length > 0 &&
    createOrderForm.value.items.every(
      (item) =>
        item.itemId &&
        item.quantity > 0 &&
        item.quantity <= getStockQty(item.itemId),
    )
  );
});

// Total quantity
const totalQuantity = computed(() => {
  return createOrderForm.value.items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );
});

// Total amount
const totalAmount = computed(() => {
  return createOrderForm.value.items.reduce((sum, item) => {
    const itemData = availableItems.value.find((i) => i.value === item.itemId);
    if (itemData && item.quantity > 0) {
      return sum + Number(itemData.price) * item.quantity;
    }
    return sum;
  }, 0);
});

// Image Management
const currentImages = ref<string[]>([]);
const pendingImages = ref<File[]>([]);
const pendingImagePreviews = ref<string[]>([]);
const imageFileInput = ref<HTMLInputElement | null>(null);

const fetchAllOrders = async () => {
  orderStore.setLoading(true);
  try {
    const from = formatDateTimeForAPI(fromDate.value);
    const to = formatDateTimeForAPI(toDate.value);

    const orders = await orderAPI.filterOrders({
      fromDate: from,
      toDate: to,
      status: selectedStatus.value || undefined,
      department: selectedDepartment.value || undefined,
    });

    orderStore.setOrders(orders);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("orderManagement.common.error"),
      detail: error.message || t("orderManagement.common.toast.loadOrderError"),
      life: 3000,
    });
  } finally {
    orderStore.setLoading(false);
  }
};

const handleDrop = async (event: DragEvent) => {
  if (orderStore.uploadingImages) return;
  const files = event.dataTransfer?.files;
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
        summary: t("orderManagement.common.warning"),
        detail: `File ${file.name} ${t("orderManagement.common.toast.invalidFormat")}`,
        life: 3000,
      });
      return;
    }
    if (file.size > maxSize) {
      toast.add({
        severity: "warn",
        summary: t("orderManagement.common.warning"),
        detail: `File ${file.name} ${t("orderManagement.common.toast.fileTooLargeMax")}`,
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
};

const resetFilter = () => {
  fromDate.value = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0);
  toDate.value = new Date(new Date().setHours(23, 59, 59));
  selectedStatus.value = null;
  selectedDepartment.value = null;
  searchQuery.value = "";

  // Clear URL query
  router.replace({ query: {} });

  fetchAllOrders();
};

const fetchAllItems = async () => {
  try {
    const items = await itemAPI.getAll();
    itemStore.setItems(items);
  } catch (error: any) {
    console.error("Error loading items:", error);
  }
};

// Helper Functions
const getImageUrl = (filename: string) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${import.meta.env.WAREHOUSE_URL}/api/Order/image/${filename}`;
};

const getItemImageUrl = (filename: string) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${import.meta.env.WAREHOUSE_URL}/api/Item/image/${filename}`;
};

const getItemName = (item: any) =>
  item.eng?.partname || item.com?.name || "Unknown";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const navigateToImageManagement = () => {
  showUpdateStatusDialog.value = false;
  if (selectedOrder.value) {
    viewOrderImages(selectedOrder.value);
  }
};

const getTotalQuantity = (order: Order) => {
  return order.orderDetails.reduce((sum, detail) => sum + detail.orderQty, 0);
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    Pending: "p-chip-warning",
    Approved: "p-chip-info",
    Completed: "p-chip-success",
    Rejected: "p-chip-danger",
  };
  return classes[status] || "p-chip-secondary";
};

// Helper functions for selected items
const getSelectedItemLabel = (itemId: number) => {
  const item = availableItems.value.find((i) => i.value === itemId);
  return item?.label || "";
};

const getSelectedItemImage = (itemId: number) => {
  const item = availableItems.value.find((i) => i.value === itemId);
  return item?.image || "";
};

const getSelectedItemId = (itemId: number) => {
  const item = availableItems.value.find((i) => i.value === itemId);
  return item?.itemIndentifyId || "";
};

const getSelectedItemUnit = (itemId: number) => {
  const item = availableItems.value.find((i) => i.value === itemId);
  return item?.unit || "";
};

const getSelectedItemPrice = (itemId: number) => {
  const item = availableItems.value.find((i) => i.value === itemId);
  return item?.price || 0;
};

const getItemSubtotal = (itemId: number, quantity: number) => {
  const price = getSelectedItemPrice(itemId);
  return price * quantity;
};

// Dialog Handlers
const viewOrderDetails = (order: Order) => {
  selectedOrder.value = order;
  showDetailsDialog.value = true;
};

const openUpdateStatusDialog = (order: Order) => {
  selectedOrder.value = order;
  updateForm.value = {
    status: "",
    note: "",
  };
  showUpdateStatusDialog.value = true;
};

const saveUpdateStatus = async () => {
  if (!selectedOrder.value?.id) return;

  // Validate status
  if (!updateForm.value.status) {
    toast.add({
      severity: "warn",
      summary: t("orderManagement.common.warning"),
      detail: t("orderManagement.common.toast.selectStatus"),
      life: 3000,
    });
    return;
  }

  // VALIDATE NOTE khi Rejected
  if (updateForm.value.status === "Rejected") {
    if (!updateForm.value.note || !updateForm.value.note.trim()) {
      toast.add({
        severity: "warn",
        summary: t("orderManagement.common.missingInfo"),
        detail: t("orderManagement.common.toast.enterRejectReason"),
        life: 3000,
      });
      return;
    }
  }

  // Validate image cho Completed
  if (updateForm.value.status === "Completed") {
    if (!selectedOrder.value.image || selectedOrder.value.image.length === 0) {
      toast.add({
        severity: "warn",
        summary: t("orderManagement.common.missingImage"),
        detail: t("orderManagement.common.toast.uploadAtLeastOneImage"),
        life: 4000,
      });
      return;
    }
  }

  orderStore.setLoading(true);

  try {
    // GỬI NOTE khi có
    await orderAPI.updateStatus(
      selectedOrder.value.id,
      updateForm.value.status,
      updateForm.value.note || undefined,
    );

    selectedOrder.value = {
      ...selectedOrder.value,
      status: updateForm.value.status,
      note: updateForm.value.note || selectedOrder.value.note,
    };

    const statusMessages: Record<string, string> = {
      Approved: t("orderManagement.common.toast.approveSuccess"),
      Rejected: t("orderManagement.common.toast.rejectSuccess"),
      Completed: t("orderManagement.common.toast.completeSuccess"),
    };

    toast.add({
      severity: "success",
      summary: t("orderManagement.common.success"),
      detail:
        statusMessages[updateForm.value.status] ||
        t("orderManagement.common.toast.updateStatusSuccess"),
      life: 3000,
    });

    showUpdateStatusDialog.value = false;
    if (updateForm.value.status === "Completed") {
      showImageDialog.value = false;
      showDetailsDialog.value = true;
    }
    await fetchAllOrders();
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("orderManagement.common.error"),
      detail:
        error.message || t("orderManagement.common.toast.cannotUpdateStatus"),
      life: 3000,
    });
  } finally {
    orderStore.setLoading(false);
  }
};
const confirmDelete = (order: Order) => {
  confirm.require({
    message: t("orderManagement.common.confirmDeleteOrder", { id: order.id }),
    header: t("orderManagement.common.confirm"),
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("orderManagement.common.delete"),
    rejectLabel: t("orderManagement.common.cancel"),
    acceptClass: "p-button-danger",
    accept: async () => {
      if (order.id) {
        orderStore.setLoading(true);

        try {
          await orderAPI.delete(order.id);

          toast.add({
            severity: "success",
            summary: t("orderManagement.common.success"),
            detail: t("orderManagement.common.toast.deleteOrderSuccess"),
            life: 3000,
          });

          await fetchAllOrders();
        } catch (error: any) {
          toast.add({
            severity: "error",
            summary: t("orderManagement.common.error"),
            detail:
              error.message ||
              t("orderManagement.common.toast.cannotDeleteOrder"),
            life: 3000,
          });
        } finally {
          orderStore.setLoading(false);
        }
      }
    },
  });
};

// Create Order Handlers
const openCreateOrderDialog = () => {
  createOrderForm.value = {
    nameWorker: "",
    items: [],
  };
  showCreateOrderDialog.value = true;
};

const closeCreateDialog = () => {
  showCreateOrderDialog.value = false;
  createOrderForm.value = {
    nameWorker: "",
    items: [],
  };
};

const addItemRow = () => {
  createOrderForm.value.items.push({
    itemId: 0,
    quantity: 1,
  });
};

const removeItemRow = (index: number) => {
  createOrderForm.value.items.splice(index, 1);
};

const submitCreate = async () => {
  if (!isFormValid.value) {
    toast.add({
      severity: "warn",
      summary: t("orderManagement.common.warning"),
      detail: t("orderManagement.common.toast.fillAllInfo"),
      life: 3000,
    });
    return;
  }

  orderStore.setLoading(true);

  try {
    const requestData = {
      nameWorker: createOrderForm.value.nameWorker.trim(),
      itemIds: createOrderForm.value.items.map((item) => ({
        itemId: item.itemId,
        orderQty: item.quantity,
      })),
    };

    await orderAPI.create(requestData);

    toast.add({
      severity: "success",
      summary: t("orderManagement.common.success"),
      detail: t("orderManagement.common.toast.createOrderSuccess"),
      life: 3000,
    });

    closeCreateDialog();
    await fetchAllOrders();
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("orderManagement.common.error"),
      detail:
        error.message || t("orderManagement.common.toast.cannotCreateOrder"),
      life: 3000,
    });
  } finally {
    orderStore.setLoading(false);
  }
};

// Image Handlers
const viewOrderImages = async (order: Order) => {
  selectedOrder.value = order;

  if (order.id) {
    try {
      const orderData = await orderAPI.getById(order.id);
      currentImages.value = orderData.image || [];
      orderStore.setCurrentOrder(orderData);
    } catch (error) {
      currentImages.value = order.image || [];
    }
  } else {
    currentImages.value = order.image || [];
  }

  showImageDialog.value = true;
};

const closeImageDialog = () => {
  showImageDialog.value = false;
  selectedOrder.value = null;
  currentImages.value = [];
  clearPendingImages();
  orderStore.setCurrentOrder(null);
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
        summary: t("orderManagement.common.warning"),
        detail: `File ${file.name} ${t("orderManagement.common.toast.invalidFormat")}`,
        life: 3000,
      });
      return;
    }
    if (file.size > maxSize) {
      toast.add({
        severity: "warn",
        summary: t("orderManagement.common.warning"),
        detail: t("orderManagement.common.toast.fileTooLarge"),
        life: 3000,
      });
      return;
    }
    validFiles.push(file);
  });

  if (!validFiles.length) return;

  // *** Đè timestamp lên từng ảnh upload có sẵn ***
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
      summary: t("orderManagement.common.warning"),
      detail: t("orderManagement.common.toast.unsupportedFormat"),
      life: 3000,
    });
    return;
  }
  if (file.size > maxSize) {
    toast.add({
      severity: "warn",
      summary: t("orderManagement.common.warning"),
      detail: t("orderManagement.common.toast.fileTooLarge"),
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

  // Rename
  const ext = file.name.split(".").pop() || "jpg";
  const newName = `photo_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}.${ext}`;
  const renamedFile = new File([file], newName, { type: file.type });

  // *** Chèn timestamp vào ảnh ***
  const watermarkedFile = await addTimestampToImage(renamedFile, timestamp);

  pendingImages.value.push(watermarkedFile);
  pendingImageTimestamps.value.push(timestamp);

  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      pendingImagePreviews.value.push(e.target.result as string);
    }
  };
  reader.readAsDataURL(watermarkedFile);

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
  if (!selectedOrder.value?.id || !pendingImages.value.length) {
    toast.add({
      severity: "warn",
      summary: t("orderManagement.common.warning"),
      detail: t("orderManagement.common.toast.noFile"), // không có ile nào
      life: 3000,
    });
    return;
  }

  orderStore.setUploadingImages(true);

  try {
    const result = await orderAPI.uploadImagesSequentially(
      selectedOrder.value.id,
      pendingImages.value,
    );

    if (result.success > 0) {
      toast.add({
        severity: "success",
        summary: t("orderManagement.common.success"),
        detail: t("orderManagement.common.toast.uploadSuccess", {
          success: result.success,
          total: pendingImages.value.length,
        }),
        life: 3000,
      });

      clearPendingImages();

      if (selectedOrder.value.id) {
        const orderData = await orderAPI.getById(selectedOrder.value.id);
        currentImages.value = orderData.image || [];
        orderStore.setCurrentOrder(orderData);
        selectedOrder.value = orderData;
      }

      await fetchAllOrders();
    }

    if (result.failed > 0) {
      toast.add({
        severity: "error",
        summary: t("orderManagement.common.error"),
        detail: t("orderManagement.common.toast.uploadFailed", {
          failed: result.failed,
        }),
        life: 5000,
      });
    }
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("orderManagement.common.error"),
      detail: error.message || t("orderManagement.common.toast.cannotUpload"), // "Không thể tải lên"
      life: 3000,
    });
  } finally {
    orderStore.setUploadingImages(false);
  }
};

const confirmDeleteImage = (imageName: string) => {
  confirm.require({
    message: t("orderManagement.common.confirmDeleteImage"), // "Bạn có chắc muốn xóa ảnh này?"
    header: t("orderManagement.common.confirm"), // "Xác nhận xóa"
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("orderManagement.common.delete"), // "Xóa"
    rejectLabel: t("orderManagement.common.cancel"), // "Hủy"
    acceptClass: "p-button-danger",
    accept: async () => {
      if (!selectedOrder.value?.id) return;

      const filename = imageName.split("/").pop() || imageName;

      orderStore.setDeletingImage(true);

      try {
        await orderAPI.deleteImage(selectedOrder.value.id, filename);

        toast.add({
          severity: "success",
          summary: t("orderManagement.common.success"),
          detail: t("orderManagement.common.toast.deleteImageSuccess"),
          life: 3000,
        });

        if (selectedOrder.value.id) {
          const orderData = await orderAPI.getById(selectedOrder.value.id);
          currentImages.value = orderData.image || [];
          orderStore.setCurrentOrder(orderData);
          selectedOrder.value = orderData;
        }

        await fetchAllOrders();
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: t("orderManagement.common.error"),
          detail:
            error.message ||
            t("orderManagement.common.toast.cannotDeleteImage"),
          life: 3000,
        });
      } finally {
        orderStore.setDeletingImage(false);
      }
    },
  });
};

const viewImageFullscreen = (imageUrl: string) => {
  // Truyền toàn bộ danh sách để navigate giữa các ảnh
  const fullUrls = currentImages.value.map((img) => getImageUrl(img));
  imagePreview.open(getImageUrl(imageUrl), fullUrls);
};

// Function để tự động mở order detail từ query parameter
const checkAndOpenOrder = async () => {
  const orderIdFromQuery = route.query.orderId;

  if (!orderIdFromQuery) return;

  const orderId = parseInt(orderIdFromQuery as string);

  if (isNaN(orderId)) {
    console.warn("Invalid orderId:", orderIdFromQuery);
    return;
  }

  router.replace({ query: {} });

  // Hiển thị toast đang tìm
  toast.add({
    severity: "info",
    summary: t("orderManagement.common.searching"),
    detail: t("orderManagement.common.toast.openingOrder", { id: orderId }),
    life: 1500,
  });

  // Đợi một chút để đảm bảo orders đã load xong
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Tìm order trong danh sách
  let order = orderStore.orders.find((o) => o.id === orderId);

  if (!order) {
    // Nếu không tìm thấy, thử load lại từ API
    try {
      order = await orderAPI.getById(orderId);

      if (order) {
        // Thêm vào store nếu chưa có
        const exists = orderStore.orders.find((o) => o.id === orderId);
        if (!exists) {
          orderStore.orders.push(order);
        }
      }
    } catch (error) {
      console.error("Error loading order:", error);
      toast.add({
        severity: "warn",
        summary: t("orderManagement.common.notFound"),
        detail: t("orderManagement.common.toast.orderNotFound", {
          id: orderId,
        }),
        life: 3000,
      });
      router.replace({ query: {} });
      return;
    }
  }

  if (order) {
    // Mở dialog chi tiết
    viewOrderDetails(order);
    // Scroll đến order trong bảng (optional)
    scrollToOrder(orderId);
  }

  // Clear query parameter sau khi xử lý xong
  router.replace({ query: {} });
};
// Scroll đến order trong DataTable
const scrollToOrder = (orderId: number) => {
  setTimeout(() => {
    const orderRow = document.querySelector(`[data-order-id="${orderId}"]`);

    if (orderRow) {
      // Scroll đến row
      orderRow.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlight row với animation
      const parentRow = orderRow.closest("tr");
      if (parentRow) {
        parentRow.classList.add("highlight-flash");
        setTimeout(() => {
          parentRow.classList.remove("highlight-flash");
        }, 2000);
      }
    } else {
      console.warn("⚠️ Order row not found:", orderId);
    }
  }, 800);
};

const handleNewOrderCreated = async (orderData: OrderPendingRealtime) => {
  // Reload danh sách orders để hiển thị order mới
  await fetchAllOrders();
};

onMounted(async () => {
  window.addEventListener("resize", handleTableResize);
  if (!signalRService.isConnected()) {
    await signalRService.start();
  }
  signalRService.on("NewOrderCreated", handleNewOrderCreated);
  await fetchAllItems();
  if (route.query.status) {
    selectedStatus.value = route.query.status as string;
  }
  await fetchAllOrders();
  if (!route.query.orderId) {
    checkAndOpenOrder();
  }
});

// Watch status from URL
watch(
  () => route.query.status,
  async (newStatus) => {
    if (newStatus) {
      selectedStatus.value = newStatus as string;
      await fetchAllOrders();
    }
  },
  { immediate: true },
);

// Watch orderId để bắt khi đang ở trang orders
watch(
  () => route.query.orderId,
  async (newOrderId) => {
    if (newOrderId) {
      // Đảm bảo orders đã được load trước
      if (!orderStore.orders.length) {
        await fetchAllOrders();
      }
      await checkAndOpenOrder();
    }
  },
  { immediate: true },
);

watch(isTableMobile, (mobile) => {
  pageSize.value = mobile ? 5 : 10;
});

onUnmounted(() => {
  window.removeEventListener("resize", handleTableResize);
  signalRService.off("NewOrderCreated");
});
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
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

/* Pending - Vàng Pastel */
.stat-card.pending .stat-icon {
  background: #fef3c7;
  color: #f59e0b;
}

/* Approved - Xanh Blue Pastel */
.stat-card.approved .stat-icon {
  background: #dbeafe;
  color: #3b82f6;
}

/* Completed - Xanh Lá Pastel */
.stat-card.completed .stat-icon {
  background: #dcfce7;
  color: #22c55e;
}

/* Rejected - Đỏ Pastel */
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

/* Chip Status Styles - Pastel Colors */
:deep(.p-chip-warning) {
  background: #fef3c7 !important;
  color: #d97706 !important;
  border: 1px solid #fde68a !important;
  font-weight: 600 !important;
}

:deep(.p-chip-info) {
  /* background: #dbeafe !important; */
  color: #2563eb !important;
  /* border: 1px solid #bfdbfe !important; */
  font-weight: 600 !important;
}

:deep(.p-chip-success) {
  background: #dcfce7 !important;
  color: #16a34a !important;
  border: 1px solid #bbf7d0 !important;
  font-weight: 600 !important;
}

:deep(.p-chip-danger) {
  background: #fee2e2 !important;
  color: #dc2626 !important;
  border: 1px solid #fecaca !important;
  font-weight: 600 !important;
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

/* Highlight animation khi navigate từ notification */
:deep(.highlight-flash) {
  animation: highlightPulse 1.5s ease-in-out;
}

@keyframes highlightPulse {
  0% {
    background: #dbeafe;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    background: #bfdbfe;
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    background: transparent;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

/* Selected row style */
:deep(.selected-row) {
  background: #eff6ff !important;
}

/* Hover state cho rows */
:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc;
  cursor: pointer;
}

/* =============================================
   STATS GRID - responsive
   ============================================= */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

/* =============================================
   MOBILE ORDER CARDS
   ============================================= */
.order-card-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  transition: box-shadow 0.2s;
  cursor: pointer;
}

.order-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.order-card:active {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.order-card-id {
  font-weight: 700;
  font-size: 0.95rem;
  color: #111827;
}

.order-card-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.order-card-body {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-card-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.order-card-label {
  color: #6b7280;
  min-width: 80px;
}

.order-card-value {
  font-weight: 500;
  color: #111827;
  flex: 1;
}

.order-card-footer {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
  flex-wrap: wrap;
}

/* =============================================
   RESPONSIVE BREAKPOINTS
   ============================================= */
@media (max-width: 1023px) {
  /* Tablet: stat grid 2 cột */
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  /* Mobile: stat grid 2 cột nhỏ hơn */
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.625rem;
  }

  .stat-card {
    padding: 0.875rem;
    gap: 0.625rem;
  }

  .stat-icon {
    width: 38px;
    height: 38px;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  /* Header page: stack dọc */
  .flex.justify-between.items-center.mb-4 {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  /* Filter grid: 1 cột */
  :deep(.p-card-content) .grid.grid-cols-2 {
    grid-template-columns: 1fr !important;
  }

  :deep(.p-dialog) {
    width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
    margin: 0 1rem !important;
    left: 0 !important;
  }

  :deep(.p-dialog .p-dialog-content) {
    padding: 1rem !important;
  }

  :deep(.p-dialog .p-dialog-header) {
    padding: 1rem !important;
  }

  :deep(.p-dialog .p-dialog-footer) {
    padding: 0.75rem 1rem !important;
  }

  :global(.order-item-dropdown-panel) {
    max-width: calc(100vw - 2rem) !important;
    width: calc(100vw - 2rem) !important;
    left: 1rem !important;
    right: 1rem !important;
  }

  :global(.order-item-dropdown-panel .p-select-list-container),
  :global(.order-item-dropdown-panel .p-dropdown-items-wrapper) {
    max-width: 100% !important;
  }

  :global(.order-item-dropdown-panel .p-select-option),
  :global(.order-item-dropdown-panel .p-dropdown-item) {
    white-space: normal !important;
    word-break: break-word !important;
  }
}
/* =============================================
   DIALOG PRODUCT CARDS (mobile)
   ============================================= */
.dialog-item-card-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dialog-item-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  background: white;
}

.dialog-item-card-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  background: #f8fafc;
}

.dialog-item-img {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}

.dialog-item-img-placeholder {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-item-info {
  flex: 1;
  min-width: 0;
}

.dialog-item-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #111827;
  line-height: 1.3;
  margin-bottom: 0.2rem;
}

.dialog-item-id {
  font-size: 0.75rem;
  color: #9ca3af;
}

.dialog-item-card-bottom {
  padding: 0.625rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.dialog-item-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
}

.dialog-item-price-row.total {
  padding-top: 0.375rem;
  margin-top: 0.125rem;
  border-top: 1px dashed #e5e7eb;
}

.dialog-item-price-label {
  color: #6b7280;
}

.dialog-item-price-value {
  font-weight: 500;
  color: #374151;
}

.dialog-item-total {
  font-weight: 700;
  color: #2563eb;
  font-size: 0.9rem;
}

:deep(.p-confirmdialog) {
  width: calc(100vw - 2rem) !important;
  max-width: calc(100vw - 2rem) !important;
  margin: 0 1rem !important;
  left: 0 !important;
}

/* Create Order Item Row - Desktop: horizontal, Mobile: card */
.create-order-item-row {
  background: #fafafa;
  margin-bottom: 0.75rem;
}

.create-order-item-row:last-child {
  margin-bottom: 0;
}

/* Dropdown panel */
:deep(.p-select-overlay) {
  max-height: 260px !important;
  overflow-y: auto !important;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

/* Dialog content */
:deep(.p-select-list-container) {
  overscroll-behavior: contain;
}
</style>
