<template>
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
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold mb-4 text-gray-900">
            {{ t("importManagement.title") }}
          </h2>
          <p class="text-gray-600">{{ t("importManagement.subtitle") }}</p>
        </div>
        <Button
          :label="t('importManagement.createNew')"
          icon="pi pi-plus"
          class="btn-primary"
          @click="openCreateDialog"
        />
      </div>

      <!-- Filter Section -->
<Card class="mb-6">
  <template #content>
    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block mb-2 text-sm font-semibold text-gray-700">
            {{ t("importManagement.filters.area") }}
          </label>
          <Dropdown
            v-model="selectedAreaFilter"
            :options="stockinAreaFilterOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('importManagement.filters.areaPlaceholder')"
            class="w-full"
            showClear
            @change="currentPage = 1"
          />
        </div>

        <div>
          <label class="block mb-2 text-sm font-semibold text-gray-700">
            {{ t("importManagement.filters.fromDate") }}
          </label>
          <Calendar
            v-model="fromDate"
            dateFormat="dd/mm/yy"
            showIcon
            showTime
            hourFormat="24"
            class="w-full calendar-full-width"
            @date-select="currentPage = 1"
          />
        </div>

        <div>
          <label class="block mb-2 text-sm font-semibold text-gray-700">
            {{ t("importManagement.filters.toDate") }}
          </label>
          <Calendar
            v-model="toDate"
            dateFormat="dd/mm/yy"
            showIcon
            showTime
            hourFormat="24"
            class="w-full calendar-full-width"
            @date-select="currentPage = 1"
          />
        </div>

        <div>
          <label class="block mb-2 text-sm font-semibold text-gray-700">
            {{ t("importManagement.filters.search") }}
          </label>
          <span class="p-input-icon-left w-full">
            <InputText
              v-model="searchQuery"
              :placeholder="t('importManagement.filters.searchTablePlaceholder')"
              class="w-full"
              @input="currentPage = 1"
            />
          </span>
        </div>
      </div>

      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
      >
        <div class="flex flex-wrap items-center gap-2">
          <Chip
            :label="t('importManagement.summary.totalReceipts', { count: totalItems })"
            class="chip-normal"
          />
          <Chip
            :label="t('importManagement.summary.totalQuantity', { count: totalImportQuantity })"
            class="chip-warning"
          />
          <Chip
            v-if="selectedAreaFilter"
            :label="t('importManagement.summary.areaLabel', { area: selectedAreaFilter })"
            class="chip-not-configured"
          />
        </div>

        <Button
          :label="t('common.filter.reset')"
          icon="pi pi-refresh"
          severity="secondary"
          class="w-full md:w-auto"
          @click="clearDateFilter"
        />
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
            <div
              v-else-if="filteredStockins.length === 0"
              class="text-center py-8"
            >
              <i class="pi pi-inbox text-5xl text-gray-400"></i>
              <p class="mt-4 text-gray-500">
                {{ t("importManagement.empty") }}
              </p>
            </div>
            <div v-else>
  <!-- DESKTOP: TABLE -->
<DataTable
  v-if="!isTableMobile"
  :value="paginatedStockins"
  :paginator="false"
  responsiveLayout="scroll"
  class="stockin-table"
  @row-click="(event) => viewDetail(event.data)"
>
  <Column :header="t('importManagement.table.receipt')" class="w-28 max-w-28">
    <template #body="{ data }">
      <div class="max-w-24">
        <p class="font-bold text-gray-900 truncate">
          #{{ data.id || "-" }}
        </p>
        <p class="text-xs text-gray-500 truncate">
          {{ data.stockInDate ? formatDate(data.stockInDate) : "-" }}
        </p>
      </div>
    </template>
  </Column>

  <Column :header="t('importManagement.table.area')" class="w-28 max-w-28">
    <template #body="{ data }">
      <Chip
        :label="getStockinAreaPart(data) || '-'"
        :class="
          getStockinAreaPart(data) === 'SMD'
            ? 'chip-warning'
            : 'chip-normal'
        "
      />
    </template>
  </Column>

  <Column :header="t('importManagement.table.createdBy')" class="w-36 max-w-36">
    <template #body="{ data }">
      <span class="block max-w-32 truncate font-medium text-gray-800">
        {{ data.account?.username || "-" }}
      </span>
    </template>
  </Column>

  <Column :header="t('importManagement.table.importedProducts')" class="min-w-96 max-w-96">
    <template #body="{ data }">
      <div
        v-if="data.stockInDetails?.length"
        class="flex flex-col gap-2 max-w-96"
      >
        <div
          v-for="(detail, idx) in data.stockInDetails.slice(0, 3)"
          :key="idx"
          class="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 max-w-96"
        >
          <img
            v-if="detail.item?.picture?.length"
            :src="getItemImageUrl(detail.item.picture[0])"
            class="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-200"
            alt=""
          />
          <div
            v-else
            class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200"
          >
            <i class="pi pi-box text-gray-400"></i>
          </div>

          <div class="min-w-0">
            <p class="font-semibold text-sm text-gray-900 truncate">
              {{ getDetailItemName(detail.item) || "-" }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              <span v-if="detail.item?.itemIndentifyId">
                {{ detail.item.itemIndentifyId }}
              </span>
            </p>
          </div>

          <span
            class="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold shrink-0 whitespace-nowrap"
          >
            +{{ detail.quantity || 0 }} {{ detail.item?.unit || "" }}
          </span>
        </div>

        <button
          v-if="data.stockInDetails.length > 3"
          type="button"
          class="text-left text-xs font-semibold text-primary hover:underline max-w-fit"
          @click.stop="viewDetail(data)"
        >
          {{ t("importManagement.table.moreProducts", { count: data.stockInDetails.length - 3 }) }}
        </button>
      </div>

      <span v-else class="text-sm text-gray-400">
        -
      </span>
    </template>
  </Column>

  <Column :header="t('importManagement.table.totalQty')" class="w-24 max-w-24">
    <template #body="{ data }">
      <span class="block max-w-20 truncate font-bold text-primary">
        {{ getStockinTotalQuantity(data) || 0 }}
      </span>
    </template>
  </Column>

  <Column :header="t('importManagement.table.images')" class="w-32 max-w-32">
    <template #body="{ data }">
      <div class="flex items-center gap-2 max-w-28">
        <button
          v-if="data.image?.length"
          type="button"
          class="relative w-11 h-11 rounded-xl overflow-hidden border border-gray-200 hover:ring-2 hover:ring-primary transition-all shrink-0"
          @click.stop="openImagePreview(data, data.image[0])"
        >
          <img
            :src="getImageUrl(data.image[0])"
            class="w-full h-full object-cover"
            alt=""
          />
          <span
            v-if="data.image.length > 1"
            class="absolute inset-0 bg-black/45 text-white text-xs font-bold flex items-center justify-center"
          >
            +{{ data.image.length - 1 }}
          </span>
        </button>

        <div
          v-else
          class="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0"
        >
          <i class="pi pi-image text-gray-400"></i>
        </div>

        <button
          type="button"
          class="text-xs font-semibold text-gray-600 hover:text-primary truncate cursor-pointer"
          @click.stop="viewImages(data)"
        >
        </button>
      </div>
    </template>
  </Column>

  <Column :header="t('importManagement.table.actions')" class="w-32 max-w-32">
    <template #body="{ data }">
      <div class="flex items-center gap-1" @click.stop>
        <Button
          icon="pi pi-eye"
          text
          rounded
          severity="info"
          @click="viewDetail(data)"
        />
        <Button
          icon="pi pi-images"
          text
          rounded
          severity="secondary"
          @click="viewImages(data)"
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          @click="confirmDelete(data)"
        />
      </div>
    </template>
  </Column>
</DataTable>

  <!-- MOBILE: GIỮ CARD CŨ -->
  <div v-else class="stockin-card-list">
    <div
      v-for="stockin in paginatedStockins"
      :key="stockin.id"
      class="stockin-card"
    >
      <div class="stockin-card-header">
        <span class="stockin-card-id">#{{ stockin.id }}</span>
        <span class="stockin-card-date">
          {{ formatDate(stockin.stockInDate) }}
        </span>
      </div>

      <div class="stockin-card-body">
        <div class="stockin-card-row">
          <i class="pi pi-user text-gray-400"></i>
          <span class="stockin-card-label">
            {{ t("importManagement.card.createdBy") }}
          </span>
          <span class="stockin-card-value">
            {{ stockin.account?.username || "-" }}
          </span>
        </div>

        <div class="stockin-card-row">
          <span class="stockin-card-label">{{ t("importManagement.card.area") }}</span>
          <span class="stockin-card-value">
            {{ getStockinAreaPart(stockin) }}
          </span>
        </div>

        <div class="stockin-card-row">
          <i class="pi pi-box text-gray-400"></i>
          <span class="stockin-card-label">
            {{ t("importManagement.card.products") }}
          </span>
          <span class="stockin-card-value">
            {{
              t("importManagement.card.productCount", {
                count: stockin.stockInDetails?.length || 0,
              })
            }}
          </span>
        </div>

        <div class="stockin-card-row">
          <i class="pi pi-images text-gray-400"></i>
          <span class="stockin-card-label">
            {{ t("importManagement.card.images") }}
          </span>
          <span class="stockin-card-value">
            {{
              t("importManagement.card.imageCount", {
                count: stockin.image?.length || 0,
              })
            }}
          </span>
        </div>

        <div v-if="stockin.note" class="stockin-card-row">
          <i class="pi pi-file-edit text-gray-400"></i>
          <span class="stockin-card-label">
            {{ t("importManagement.card.note") }}
          </span>
          <span class="stockin-card-value truncate">
            {{ stockin.note }}
          </span>
        </div>
      </div>

      <div class="stockin-card-footer" @click.stop>
        <Button
          icon="pi pi-eye"
          :label="t('importManagement.card.detail')"
          text
          size="small"
          severity="info"
          @click="viewDetail(stockin)"
        />
        <Button
          icon="pi pi-images"
          :label="t('importManagement.card.images_btn')"
          text
          size="small"
          severity="secondary"
          @click="viewImages(stockin)"
        />
        <Button
          icon="pi pi-trash"
          :label="t('importManagement.card.delete')"
          text
          size="small"
          severity="danger"
          @click="confirmDelete(stockin)"
        />
      </div>
    </div>
  </div>
</div>


          </div>
        </template>
      </Card>

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
    </div>
    </div>

    <!-- ==================== CREATE STOCKIN DIALOG ==================== -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="t('importManagement.createDialog.header')"
      :style="{ width: '900px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
    >
      <div class="flex flex-col gap-4 mt-4">
        <!-- Xưởng -->
        <div>
          <label class="block mb-2 text-sm font-semibold text-gray-700">
            {{ t("importManagement.createDialog.area") }} <span class="text-red-500">*</span>
          </label>

          <Dropdown
            v-model="createForm.areaPart"
            :options="areaPartOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('importManagement.createDialog.areaPlaceholder')"
            class="w-full"
            appendTo="body"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center gap-2">
                <span class="font-semibold text-gray-900">
                  {{ slotProps.value }}
                </span>
              </div>
              <span v-else class="text-gray-400">
                {{ slotProps.placeholder }}
              </span>
            </template>

            <template #option="slotProps">
              <div class="flex items-center gap-2 py-1">
                <span class="font-medium">
                  {{ slotProps.option.label }}
                </span>
              </div>
            </template>
          </Dropdown>
        </div>
        <!-- Ghi chú -->
        <div>
          <label>{{ t("importManagement.createDialog.note") }}</label>
          <Textarea
            v-model="createForm.note"
            rows="3"
            class="w-full"
            :placeholder="t('importManagement.createDialog.notePlaceholder')"
          />
        </div>

        <!-- Danh sách sản phẩm -->
        <div>
          <div
            class="flex md:flex-row lg:flex-row flex-col justify-between items-center mb-3 gap-2"
          >
            <label class="text-base font-semibold">
              {{ t("importManagement.createDialog.productList") }}
              <span class="text-red-500">*</span>
            </label>
            <Button
              :label="t('importManagement.createDialog.addProduct')"
              icon="pi pi-plus"
              size="small"
              :disabled="!createForm.areaPart"
              @click="addItemRow"
            />
          </div>

          <div
            v-if="createForm.items.length === 0"
            class="text-center py-8 rounded-lg border-2 border-dashed border-gray-300 mt-2!"
          >
            <i class="pi pi-box text-4xl text-gray-300 mb-2 block"></i>
            <p class="text-gray-500 font-medium mb-2">
              {{ t("importManagement.createDialog.emptyProducts") }}
            </p>
            <Button
              :label="t('importManagement.createDialog.addFirst')"
              icon="pi pi-plus"
              text
              :disabled="!createForm.areaPart"
              @click="addItemRow"
            />
          </div>

          <div v-else class="flex flex-col gap-3 mt-2!">
            <div
              v-for="(item, index) in createForm.items"
              :key="index"
              class="flex flex-col gap-3 p-4! border-2 border-gray-200 rounded-xl bg-gray-50 shadow-sm"
            >
              <!-- Badge + Xóa -->
              <div class="flex items-center justify-between">
                <span
                  class="text-xs font-bold text-gray-500 px-2 py-0.5 rounded-full"
                >
                  {{
                    t("importManagement.createDialog.productBadge", {
                      index: index + 1,
                    })
                  }}
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

              <!-- Dropdown sản phẩm -->
              <div>
                <label class="block mb-1.5 text-sm font-medium text-gray-700">{{
                  t("importManagement.createDialog.productLabel")
                }}</label>
                <Dropdown
                  v-model="item.itemId"
                  :options="availableItems"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="
                    createForm.areaPart
                      ? t('importManagement.createDialog.productPlaceholder')
                      : t('importManagement.createDialog.selectAreaFirst')
                  "
                  class="w-full"
                  :filter="true"
                  :disabled="!createForm.areaPart"
                  appendTo="body"
                  panelClass="stockin-item-dropdown-panel"
                  :filterPlaceholder="
                    t('importManagement.createDialog.productFilter')
                  "
                  @change="onItemSelect($event, index)"
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
                          {{ getSelectedItemAreaPart(slotProps.value) }} -
                          {{ getSelectedItemType(slotProps.value) }} -
                          {{ getSelectedItemIdentifyId(slotProps.value) }} -
                          {{ t("importManagement.createDialog.stockLabel") }}:
                          {{ getSelectedItemStock(slotProps.value) }}
                          {{ getSelectedItemUnit(slotProps.value) }} -
                          {{ getSelectedItemSpecs(slotProps.value) }}
                        </div>
                      </div>
                    </div>
                    <span v-else class="text-gray-400">
                      {{ slotProps.placeholder }}
                    </span>
                  </template>

                  <template #option="slotProps">
                    <div class="flex items-center gap-3 py-1">
                      <img
                        v-if="slotProps.option.image"
                        :src="slotProps.option.image"
                        class="w-9 h-9 rounded object-cover shrink-0"
                        alt=""
                      />
                      <div
                        v-else
                        class="w-9 h-9 rounded bg-gray-200 flex items-center justify-center shrink-0"
                      >
                        <i class="pi pi-image text-gray-400 text-xs"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-sm truncate">
                          {{ slotProps.option.label }}
                        </div>
                        <div class="text-xs text-gray-500">
                          {{ slotProps.option.areaPart }} -
                          {{ slotProps.option.type }} -
                          {{ slotProps.option.itemIndentifyId }} -
                          {{ t("importManagement.createDialog.stockLabel") }}:
                          {{ slotProps.option.stock }}
                          {{ slotProps.option.unit }} -
                          {{ slotProps.option.specifications }}
                        </div>
                      </div>
                    </div>
                  </template>
                </Dropdown>
              </div>

              <!-- SL + Giá + Tồn kho -->
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label
                    class="block mb-1.5 text-sm font-medium text-gray-700"
                    >{{
                      t("importManagement.createDialog.quantityLabel")
                    }}</label
                  >
                  <input
                    type="number"
                    v-model="item.quantity"
                    min="1"
                    class="w-full px-3! py-2! border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label
                    class="block mb-1.5 text-sm font-medium text-gray-700"
                    >{{ t("importManagement.createDialog.priceLabel") || 'Đơn giá' }}</label
                  >
                  <input
                    type="text"
                    inputmode="numeric"
                    v-model="item.price"
                    :placeholder="'0'"
                    class="w-full px-3! py-2! border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label
                    class="block mb-1.5 text-sm font-medium text-gray-700"
                    >{{ t("importManagement.createDialog.stockLabel") }}</label
                  >
                  <div
                    class="h-9 flex items-center px-3! bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <span
                      v-if="item.itemId"
                      class="text-blue-700 font-semibold text-sm"
                    >
                      {{ getSelectedItemStock(item.itemId) }}
                      {{ getSelectedItemUnit(item.itemId) }}
                    </span>
                    <span v-else class="text-gray-400 text-sm">---</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div
          v-if="createForm.items.length > 0"
          class="p-4! bg-blue-50 rounded-lg border border-blue-200 flex flex-col gap-2"
        >
          <div class="flex items-center justify-between">
            <span class="font-semibold text-gray-700"
              >{{ t("importManagement.createDialog.summaryItems") }}:</span
            >
            <span class="text-xl font-bold text-primary">{{
              t("importManagement.createDialog.summaryItemsValue", {
                count: createForm.items.length,
              })
            }}</span>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="font-semibold text-gray-700"
              >{{ t("importManagement.createDialog.summaryQty") }}:</span
            >
            <span class="text-xl font-bold text-primary">{{
              t("importManagement.createDialog.summaryQtyValue", {
                count: totalQuantity,
              })
            }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          :label="t('importManagement.createDialog.cancel')"
          icon="pi pi-times"
          text
          @click="closeCreateDialog"
        />

        <!-- Bước 1: Chưa có ảnh → chỉ hiện nút Upload -->
        <Button
          v-if="createPendingImages.length === 0"
          :label="t('importManagement.createDialog.uploadImages')"
          icon="pi pi-images"
          severity="secondary"
          :disabled="!isFormValid"
          @click="openCreateImageDialog"
        />

        <!-- Bước 2: Đã có ảnh → hiện nút Tạo phiếu (và nút đổi ảnh) -->
        <template v-else>
          <Button
            :label="
              t('importManagement.createDialog.changeImages', {
                count: createPendingImages.length,
              })
            "
            severity="secondary"
            @click="openCreateImageDialog"
          />
          <Button
            :label="t('importManagement.createDialog.submit')"
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
      :header="t('importManagement.createImageDialog.header')"
      :style="{ width: '800px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
    >
      <div class="mt-4">
        <div
          class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2"
        >
          <p class="text-sm text-blue-700 p-2!">
            {{ t("importManagement.createImageDialog.hint") }}
          </p>
        </div>

        <!-- Mobile: 2 nút -->
        <div v-if="isTableMobile" class="flex gap-2 mb-3">
          <Button
            :label="t('importManagement.createImageDialog.selectImages')"
            icon="pi pi-images"
            severity="secondary"
            class="flex-1"
            @click="createImageFileInput?.click()"
          />
          <Button
            :label="t('importManagement.createImageDialog.takePhoto')"
            icon="pi pi-camera"
            severity="secondary"
            class="flex-1"
            @click="createCameraInput?.click()"
          />
        </div>

        <!-- Desktop: Drop zone -->
        <div
          v-if="!isTableMobile"
          @click="createImageFileInput?.click()"
          @dragover.prevent
          @drop.prevent="handleCreateDrop"
          class="border-2 border-dashed border-gray-400 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-all mb-3"
        >
          <div class="flex flex-col items-center justify-center py-4!">
            <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
            <p class="text-gray-600 text-sm font-medium mb-1">
              {{ t("importManagement.createImageDialog.dropzone") }}
            </p>
            <p class="text-xs text-gray-400">
              {{ t("importManagement.createImageDialog.dropzoneHint") }}
            </p>
          </div>
        </div>

        <!-- Preview grid -->
        <div v-if="createPendingPreviews.length > 0">
          <p class="text-sm font-medium text-gray-700 mb-2">
            {{
              t("importManagement.createImageDialog.selectedCount", {
                count: createPendingPreviews.length,
              })
            }}
          </p>
          <div class="grid grid-cols-3 gap-2 mt-3!">
            <div
              v-for="(preview, index) in createPendingPreviews"
              :key="`cp-${index}`"
              class="relative aspect-square rounded-lg overflow-hidden border-2 border-green-400"
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
                @click.stop="removeCreatePendingImage(index)"
              />
              <div
                class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center"
                style="font-size: 9px; padding: 2px 4px"
              >
                {{ createPendingTimestamps[index] }}
              </div>
            </div>
            <div
              class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
              @click="createImageFileInput?.click()"
            >
              <i class="pi pi-plus text-xl text-gray-400"></i>
              <span class="text-xs text-gray-400 mt-1">{{
                t("importManagement.createImageDialog.addMore")
              }}</span>
            </div>
          </div>
        </div>
        <div
          v-else
          class="text-center text-gray-400 border-2 border-dashed border-gray-400 rounded-xl mt-3! py-2!"
        >
          <i class="pi pi-image text-4xl mb-2 block"></i>
          <p class="text-sm">
            {{ t("importManagement.createImageDialog.noImages") }}
          </p>
        </div>

        <!-- Hidden inputs -->
        <input
          ref="createImageFileInput"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          class="hidden"
          @change="handleCreateImageUpload"
        />
        <input
          ref="createCameraInput"
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          @change="handleCreateCameraCapture"
        />
      </div>

      <template #footer>
        <Button
          :label="
            createPendingImages.length > 0
              ? t('importManagement.createImageDialog.closeWithCount', {
                  count: createPendingImages.length,
                })
              : t('importManagement.createImageDialog.close')
          "
          :icon="createPendingImages.length > 0 ? 'pi pi-check' : 'pi pi-times'"
          :severity="createPendingImages.length > 0 ? 'success' : 'secondary'"
          @click="closeCreateImageDialog"
        />
      </template>
    </Dialog>

    <!-- ==================== DETAIL DIALOG ==================== -->
    <Dialog
      v-model:visible="showDetailDialog"
      :header="
        t('importManagement.detailDialog.header', { id: selectedStockin?.id })
      "
      :style="{ width: '900px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
    >
      <div v-if="selectedStockin" class="mt-4">
        <div class="grid grid-cols-2 gap-4 mb-4 p-4! bg-gray-50 rounded-lg">
          <div>
            <label class="block text-sm text-gray-600 mb-1">{{
              t("importManagement.detailDialog.stockInDate")
            }}</label>
            <p class="font-semibold text-gray-900">
              {{ formatDateTime(selectedStockin.stockInDate) }}
            </p>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">{{
              t("importManagement.detailDialog.createdBy")
            }}</label>
            <p class="font-semibold text-gray-900">
              {{ selectedStockin.account?.username }}
            </p>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">
              {{ t("importManagement.detailDialog.area") }}
            </label>
            <p class="font-semibold text-gray-900">
              {{ getStockinAreaPart(selectedStockin) }}
            </p>
          </div>
          <div class="col-span-2">
            <label class="block text-sm text-gray-600 mb-1">{{
              t("importManagement.detailDialog.note")
            }}</label>
            <p class="text-gray-900">{{ selectedStockin.note || "-" }}</p>
          </div>
        </div>

        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-3!">
            {{
              t("importManagement.detailDialog.productList", {
                count: selectedStockin.stockInDetails?.length || 0,
              })
            }}
          </h3>
          <div
            v-if="!selectedStockin.stockInDetails?.length"
            class="text-center py-4 text-gray-500"
          >
            {{ t("importManagement.detailDialog.noProducts") }}
          </div>
          <div v-else class="border border-gray-200 rounded-xl overflow-hidden">
            <DataTable :value="selectedStockin.stockInDetails" class="p-datatable-sm w-full" responsiveLayout="scroll">
              <Column :header="t('importManagement.table.images') || 'Hình ảnh'" class="w-20">
                <template #body="{ data }">
                  <img
                    v-if="data.item?.picture?.length"
                    :src="getItemImageUrl(data.item.picture[0])"
                    class="w-10 h-10 rounded-lg object-cover border border-gray-200"
                  />
                  <div
                    v-else
                    class="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center"
                  >
                    <i class="pi pi-image text-gray-400"></i>
                  </div>
                </template>
              </Column>

              <Column :header="t('importManagement.createDialog.productLabel') || 'Sản phẩm'" class="min-w-[200px]">
                <template #body="{ data }">
                  <p class="font-semibold text-sm text-gray-900 truncate">
                    {{ getDetailItemName(data.item) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ data.item?.type || "-" }}
                  </p>
                </template>
              </Column>

              <Column :header="t('importManagement.createDialog.priceLabel') || 'Đơn giá'" class="w-32 text-right">
                <template #body="{ data }">
                  <span class="font-semibold text-sm text-orange-600">
                    {{ data.price ? Number(data.price).toLocaleString() + ' ₫' : '-' }}
                  </span>
                </template>
              </Column>

              <Column :header="t('importManagement.createDialog.quantityLabel') || 'Số lượng'" class="w-24 text-right">
                <template #body="{ data }">
                  <span class="font-semibold text-sm text-gray-900">
                    {{ data.quantity }} {{ data.item?.unit || '' }}
                  </span>
                </template>
              </Column>

              <Column header="Thành tiền" class="w-32 text-right">
                <template #body="{ data }">
                  <span class="font-bold text-sm text-primary">
                    {{ data.price && data.quantity ? (Number(data.price) * Number(data.quantity)).toLocaleString() + ' ₫' : '-' }}
                  </span>
                </template>
              </Column>
            </DataTable>
            
            <div class="bg-gray-50 p-4! border-t border-gray-200 flex justify-end items-center gap-4">
              <span class="text-gray-600 font-medium">Tổng cộng:</span>
              <span class="text-xl font-bold text-primary">
                {{ 
                  selectedStockin.stockInDetails.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0).toLocaleString() + ' ₫'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          :label="t('importManagement.detailDialog.close')"
          icon="pi pi-times"
          @click="showDetailDialog = false"
        />
      </template>
    </Dialog>

    <!-- ==================== IMAGE MANAGEMENT DIALOG ==================== -->
    <Dialog
      v-model:visible="showImageDialog"
      :header="
        t('importManagement.imageDialog.header', { id: selectedStockin?.id })
      "
      :style="{ width: '800px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
      :dismissableMask="true"
    >
      <div class="mt-4" @click="pasteInput?.focus()">
        <!-- Upload Area -->
        <div class="mb-6">
          <label class="block mb-2 font-semibold">
            {{ t("importManagement.imageDialog.uploadTitle") }}
            <span
              v-if="stockinStore.uploadingImages"
              class="text-primary text-sm ml-2"
            >
              <i class="pi pi-spin pi-spinner"></i>
              {{ t("importManagement.imageDialog.uploading") }}
            </span>
          </label>

          <!-- Mobile: 2 nút -->
          <div v-if="isTableMobile" class="flex gap-2 mb-3">
            <Button
              :label="t('importManagement.imageDialog.selectImages')"
              icon="pi pi-images"
              severity="secondary"
              class="flex-1"
              :disabled="stockinStore.uploadingImages"
              @click="imageFileInput?.click()"
            />
            <Button
              :label="t('importManagement.imageDialog.takePhoto')"
              icon="pi pi-camera"
              severity="secondary"
              class="flex-1"
              :disabled="stockinStore.uploadingImages"
              @click="cameraFileInput?.click()"
            />
          </div>

          <!-- Desktop: Drop zone -->
          <div
            v-if="!isTableMobile"
            @click="!stockinStore.uploadingImages && imageFileInput?.click()"
            @dragover.prevent
            @drop.prevent="handleDrop"
            class="border-2 border-dashed rounded-xl p-4 transition-all"
            :class="
              stockinStore.uploadingImages
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
              <div
                class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                @click.stop="
                  !stockinStore.uploadingImages && imageFileInput?.click()
                "
              >
                <i class="pi pi-plus text-2xl text-gray-400"></i>
                <span class="text-xs text-gray-400 mt-1">{{
                  t("importManagement.imageDialog.addMore")
                }}</span>
              </div>
            </div>
            <div class="flex flex-col items-center justify-center p-4!">
              <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-2"></i>
              <p class="text-gray-600 text-sm font-medium mb-1">
                {{ t("importManagement.imageDialog.dropzone") }}
              </p>
              <p class="text-xs text-gray-400">
                {{ t("importManagement.imageDialog.dropzoneHint") }}
              </p>
            </div>
          </div>

          <!-- Mobile: Preview -->
          <div v-if="isTableMobile && pendingImages.length > 0" class="mt-3">
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="(preview, index) in pendingImagePreviews"
                :key="`pending-mobile-${index}`"
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
                <div
                  v-if="pendingImageTimestamps[index]"
                  class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center"
                  style="font-size: 9px; padding: 2px 4px"
                >
                  {{ pendingImageTimestamps[index] }}
                </div>
              </div>
              <div
                class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer"
                @click="imageFileInput?.click()"
              >
                <i class="pi pi-plus text-xl text-gray-400"></i>
                <span class="text-xs text-gray-400 mt-1">{{
                  t("importManagement.imageDialog.addMore")
                }}</span>
              </div>
            </div>
          </div>

          <!-- Inputs -->
          <input
            ref="imageFileInput"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            :disabled="stockinStore.uploadingImages"
            class="hidden"
            @change="handleImageUpload"
          />
          <input
            ref="cameraFileInput"
            type="file"
            accept="image/*"
            capture="environment"
            :disabled="stockinStore.uploadingImages"
            class="hidden"
            @change="handleCameraCapture"
          />

          <!-- Action buttons -->
          <div
            v-if="pendingImages.length > 0"
            class="flex justify-between items-center mt-3!"
          >
            <span class="text-sm text-gray-600 font-medium">{{
              t("importManagement.imageDialog.selectedCount", {
                count: pendingImages.length,
              })
            }}</span>
            <div class="flex gap-2 mt-2">
              <Button
                :label="t('importManagement.imageDialog.clearAll')"
                icon="pi pi-trash"
                text
                size="small"
                severity="danger"
                @click="clearPendingImages"
              />
              <Button
                :label="t('importManagement.imageDialog.upload')"
                icon="pi pi-upload"
                size="small"
                severity="success"
                :loading="stockinStore.uploadingImages"
                @click="uploadPendingImages"
              />
            </div>
          </div>
        </div>

        <!-- Current Images -->
        <div>
          <label class="font-semibold mb-4 block">{{
            t("importManagement.imageDialog.currentImages", {
              count: currentImages.length,
            })
          }}</label>
          <div
            v-if="currentImages.length === 0"
            class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
          >
            <p class="my-4 text-gray-500">
              {{ t("importManagement.imageDialog.noImages") }}
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
            </div>
          </div>
        </div>
      </div>
      <input
        ref="pasteInput"
        type="text"
        class="opacity-0 absolute w-0 h-0 pointer-events-none"
        @paste="handleDialogPaste"
      />

      <template #footer>
        <Button
          :label="t('importManagement.imageDialog.close')"
          icon="pi pi-times"
          @click="closeImageDialog"
        />
      </template>
    </Dialog>

    <ConfirmDialog />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { useStockinStore } from "@/stores/stockinStore";
import { useItemStore } from "@/stores/itemStore";
import { stockinAPI } from "@/services/stockinAPI";
import { itemAPI } from "@/services/itemAPI";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import MainLayout from "@/components/MainLayout.vue";
import Button from "primevue/button";
import Card from "primevue/card";
import Chip from "primevue/chip";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import ConfirmDialog from "primevue/confirmdialog";
import type { Stockin, CreateStockinDetail } from "@/types/stockin.types";

type AreaPart = "SMD" | "MAINLINE";
import ImagePreviewDialog from "@/views/ImagePreviewDialog.vue";
import { useImagePreview } from "@/composables/useImagePreview";
import { usePagination } from "@/composables/usePagination";
import AppPagination from "@/components/AppPagination.vue";
import { useI18n } from "vue-i18n";

const confirm = useConfirm();
const toast = useToast();
const stockinStore = useStockinStore();
const itemStore = useItemStore();
const imagePreview = useImagePreview();
const { t } = useI18n();
const pasteInput = ref<HTMLInputElement | null>(null);

// ── Resize ────────────────────────────────────────────────
const isTableMobile = ref(window.innerWidth < 768);
const handleTableResize = () => {
  isTableMobile.value = window.innerWidth < 768;
};

// ── Filter ────────────────────────────────────────────────
const searchQuery = ref("");
const selectedAreaFilter = ref<AreaPart | null>(null);

const fromDate = ref<Date | null>(
  new Date(new Date().getFullYear(), 0, 1, 0, 0, 0),
);
const toDate = ref<Date | null>(
  new Date(new Date().setHours(23, 59, 59)),
);

const stockinAreaFilterOptions: { label: string; value: AreaPart }[] = [
  { label: "SMD", value: "SMD" },
  { label: "MAINLINE", value: "MAINLINE" },
];

const showCreateImageDialog = ref(false);
const createPendingImages = ref<File[]>([]);
const createPendingPreviews = ref<string[]>([]);
const createPendingTimestamps = ref<string[]>([]);
const createImageFileInput = ref<HTMLInputElement | null>(null);
const createCameraInput = ref<HTMLInputElement | null>(null);
const isSubmittingCreate = ref(false);

// Mở image dialog từ create form
const openCreateImageDialog = () => {
  showCreateImageDialog.value = true;
};

// Đóng image dialog → quay lại form (giữ nguyên ảnh đã chọn)
const closeCreateImageDialog = () => {
  showCreateImageDialog.value = false;
};

// handleCreateImageUpload — upload ảnh có sẵn, tự động đè timestamp
const handleCreateImageUpload = async (event: Event) => {
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
        summary: t("importManagement.toast.warningTitle"),
        detail: t("importManagement.toast.invalidFormat", { name: file.name }),
        life: 3000,
      });
      return;
    }
    if (file.size > maxSize) {
      toast.add({
        severity: "warn",
        summary: t("importManagement.toast.warningTitle"),
        detail: t("importManagement.toast.fileTooLarge", { name: file.name }),
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
    createPendingImages.value.push(watermarked);
    createPendingTimestamps.value.push(timestamp);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result)
        createPendingPreviews.value.push(e.target.result as string);
    };
    reader.readAsDataURL(watermarked);
  }

  if (createImageFileInput.value) createImageFileInput.value.value = "";
};

const openImagePreview = (stockin: Stockin, clickedImg: string) => {
  const fullUrls = (stockin.image || []).map((img) => getImageUrl(img));
  const clickedUrl = getImageUrl(clickedImg);
  imagePreview.open(clickedUrl, fullUrls);
};

const handleDialogPaste = async (event: ClipboardEvent) => {
  if (stockinStore.uploadingImages) return;
  const items = event.clipboardData?.items;
  if (!items) return;

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  const maxSize = 5 * 1024 * 1024;

  for (const item of Array.from(items)) {
    if (!allowedTypes.includes(item.type)) continue;

    const file = item.getAsFile();
    if (!file) continue;

    if (file.size > maxSize) {
      toast.add({
        severity: "warn",
        summary: t("importManagement.toast.warningTitle"),
        detail: t("importManagement.toast.fileTooLargeSimple"),
        life: 3000,
      });
      continue;
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
      item.type === "image/jpeg" ? "jpg" : item.type.split("/")[1] || "png";
    const newName = `paste_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}.${ext}`;

    const watermarked = await addTimestampToImage(
      new File([file], newName, { type: item.type }),
      timestamp,
    );
    pendingImages.value.push(watermarked);
    pendingImageTimestamps.value.push(timestamp);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result)
        pendingImagePreviews.value.push(e.target.result as string);
    };
    reader.readAsDataURL(watermarked);

    toast.add({
      severity: "success",
      summary: t("importManagement.toast.successTitle"),
      detail: t("importManagement.toast.pastedImage"),
      life: 2000,
    });
  }
};

// handleCreateDrop — kéo thả ảnh vào dialog tạo phiếu, cũng đè timestamp
const handleCreateDrop = async (event: DragEvent) => {
  const files = event.dataTransfer?.files;
  if (!files?.length) return;

  const maxSize = 5 * 1024 * 1024;
  const validFiles: File[] = [];

  Array.from(files).forEach((file) => {
    if (
      !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
        file.type,
      )
    )
      return;
    if (file.size > maxSize) return;
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
    createPendingImages.value.push(watermarked);
    createPendingTimestamps.value.push(timestamp);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result)
        createPendingPreviews.value.push(e.target.result as string);
    };
    reader.readAsDataURL(watermarked);
  }
};

// handleCreateCameraCapture — chụp ảnh trong dialog tạo phiếu
const handleCreateCameraCapture = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files?.length) return;

  const file = files[0];
  if (
    !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)
  ) {
    toast.add({
      severity: "warn",
      summary: t("importManagement.toast.warningTitle"),
      detail: t("importManagement.toast.unsupportedFormat"),
      life: 3000,
    });
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      severity: "warn",
      summary: t("importManagement.toast.warningTitle"),
      detail: t("importManagement.toast.fileTooLargeSimple"),
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
  const watermarked = await addTimestampToImage(
    new File([file], newName, { type: file.type }),
    timestamp,
  );

  createPendingImages.value.push(watermarked);
  createPendingTimestamps.value.push(timestamp);

  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result)
      createPendingPreviews.value.push(e.target.result as string);
  };
  reader.readAsDataURL(watermarked);

  if (createCameraInput.value) createCameraInput.value.value = "";
};

const removeCreatePendingImage = (index: number) => {
  createPendingImages.value.splice(index, 1);
  createPendingPreviews.value.splice(index, 1);
  createPendingTimestamps.value.splice(index, 1);
};

// Tạo phiếu + upload ảnh
const confirmAndCreateStockin = async () => {
  if (!createForm.value.areaPart) {
    toast.add({
      severity: "warn",
      summary: t("importManagement.toast.warningTitle"),
      detail: t("importManagement.toast.selectAreaRequired"),
      life: 3000,
    });
    return;
  }

  const invalidAreaItems = createForm.value.items.filter((formItem) => {
    const foundItem = itemStore.items.find((item) => item.id === formItem.itemId);
    return !foundItem || getItemAreaPart(foundItem) !== createForm.value.areaPart;
  });

  if (invalidAreaItems.length > 0) {
    toast.add({
      severity: "warn",
      summary: t("importManagement.toast.warningTitle"),
      detail: t("importManagement.toast.productAreaMismatch"),
      life: 3000,
    });
    return;
  }

  isSubmittingCreate.value = true;

  try {
    const newStockin = await stockinAPI.createStockin({
      note: createForm.value.note,
      areaPart: createForm.value.areaPart,
      items: createForm.value.items,
    });

    await stockinAPI.uploadImagesSequentially(
      newStockin.id,
      createPendingImages.value,
    );

    toast.add({
      severity: "success",
      summary: t("importManagement.toast.successTitle"),
      detail: t("importManagement.toast.createSuccess", { id: newStockin.id }),
      life: 3000,
    });

    createPendingImages.value = [];
    createPendingPreviews.value = [];
    createPendingTimestamps.value = [];
    closeCreateDialog();
    await fetchAllStockins();
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("importManagement.toast.errorTitle"),
      detail: error.message || t("importManagement.toast.createError"),
      life: 3000,
    });
  } finally {
    isSubmittingCreate.value = false;
  }
};

const isDateInRange = (dateString: string) => {
  if (!dateString) return false;

  const time = new Date(dateString).getTime();

  if (fromDate.value) {
    const from = new Date(fromDate.value).getTime();
    if (time < from) return false;
  }

  if (toDate.value) {
    const to = new Date(toDate.value).getTime();
    if (time > to) return false;
  }

  return true;
};

const getStockinTotalQuantity = (stockin: Stockin) =>
  stockin.stockInDetails?.reduce(
    (sum, detail) => sum + Number(detail.quantity || 0),
    0,
  ) || 0;

const getStockinProductNames = (stockin: Stockin) =>
  stockin.stockInDetails
    ?.map((detail) => getDetailItemName(detail.item))
    .filter(Boolean)
    .join(", ") || "";

const filteredStockins = computed(() => {
  if (!stockinStore.stockins?.length) return [];

  let list = [...stockinStore.stockins];

  // 1. Lọc theo xưởng trước
  if (selectedAreaFilter.value) {
    list = list.filter(
      (stockin) => getStockinAreaPart(stockin) === selectedAreaFilter.value,
    );
  }

  // 2. Sau đó lọc theo ngày
  list = list.filter((stockin) => isDateInRange(stockin.stockInDate));

  // 3. Cuối cùng search
  if (searchQuery.value.trim()) {
    const term = searchQuery.value.trim().toLowerCase();

    list = list.filter((s) => {
      const productNames = getStockinProductNames(s).toLowerCase();

      return (
        s.note?.toLowerCase().includes(term) ||
        s.account?.username?.toLowerCase().includes(term) ||
        getStockinAreaPart(s).toLowerCase().includes(term) ||
        productNames.includes(term) ||
        s.id?.toString().includes(term)
      );
    });
  }

  return list.sort(
    (a, b) =>
      new Date(b.stockInDate).getTime() - new Date(a.stockInDate).getTime(),
  );
});

const totalImportQuantity = computed(() =>
  filteredStockins.value.reduce(
    (sum, stockin) => sum + getStockinTotalQuantity(stockin),
    0,
  ),
);
const {
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  paginatedList: paginatedStockins,
  pageInfo,
  goToPage,
  nextPage,
  prevPage,
  firstPage,
  lastPage,
} = usePagination(() => filteredStockins.value, isTableMobile.value ? 5 : 10);

// ── Create Dialog ─────────────────────────────────────────
const showCreateDialog = ref(false);
const createForm = ref<{
  note: string;
  areaPart: AreaPart | null;
  items: CreateStockinDetail[];
}>({
  note: "",
  areaPart: null,
  items: [],
});
const areaPartOptions: { label: string; value: AreaPart }[] = [
  { label: "SMD", value: "SMD" },
  { label: "MAINLINE", value: "MAINLINE" },
];

const availableItems = computed(() => {
  if (!itemStore.items?.length) return [];

  const selectedArea = createForm.value.areaPart;

  if (!selectedArea) return [];

  return itemStore.items
    .filter((item) => getItemAreaPart(item) === selectedArea)
    .map((item) => ({
      value: item.id,
      label: getItemName(item),
      type: item.type,
      stock: item.stockQty,
      unit: item.unit,
      areaPart: getItemAreaPart(item),
      image: item.picture?.length ? getItemImageUrl(item.picture[0]) : null,
      specifications: item.eng?.description || item.com?.specifications || null,
      itemIndentifyId: item.itemIndentifyId || "",
    }));
});

const isFormValid = computed(
  () =>
    !!createForm.value.areaPart &&
    createForm.value.items.length > 0 &&
    createForm.value.items.every((item) => item.itemId && item.quantity > 0),
);

const totalQuantity = computed(() =>
  createForm.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
);

// ── Detail Dialog ─────────────────────────────────────────
const showDetailDialog = ref(false);
const selectedStockin = ref<Stockin | null>(null);

// ── Image Management ──────────────────────────────────────
const showImageDialog = ref(false);
const currentImages = ref<string[]>([]);
const pendingImages = ref<File[]>([]);
const pendingImagePreviews = ref<string[]>([]);
const pendingImageTimestamps = ref<string[]>([]);
const imageFileInput = ref<HTMLInputElement | null>(null);
const cameraFileInput = ref<HTMLInputElement | null>(null);

const handleGlobalPaste = async (event: ClipboardEvent) => {
  // Check cả 2 dialog
  const isImageDialogOpen =
    showImageDialog.value || showCreateImageDialog.value;
  if (!isImageDialogOpen) return;
  if (stockinStore.uploadingImages) return;

  const target = event.target as HTMLElement;
  const isInputFocused =
    target.tagName === "INPUT" || target.tagName === "TEXTAREA";
  if (isInputFocused) return;

  const items = event.clipboardData?.items;
  if (!items) return;

  const hasImage = Array.from(items).some((i) => i.type.startsWith("image/"));
  if (!hasImage) return;

  event.preventDefault();

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  const maxSize = 5 * 1024 * 1024;

  for (const item of Array.from(items)) {
    if (!allowedTypes.includes(item.type)) continue;
    const file = item.getAsFile();
    if (!file) continue;
    if (file.size > maxSize) {
      toast.add({
        severity: "warn",
        summary: t("importManagement.toast.warningTitle"),
        detail: t("importManagement.toast.fileTooLargeSimple"),
        life: 3000,
      });
      continue;
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
      item.type === "image/jpeg" ? "jpg" : item.type.split("/")[1] || "png";
    const newName = `paste_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}.${ext}`;
    const watermarked = await addTimestampToImage(
      new File([file], newName, { type: item.type }),
      timestamp,
    );

    // Push vào đúng array tương ứng với dialog đang mở
    if (showCreateImageDialog.value) {
      createPendingImages.value.push(watermarked);
      createPendingTimestamps.value.push(timestamp);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result)
          createPendingPreviews.value.push(e.target.result as string);
      };
      reader.onerror = (e) => {
        console.error("FileReader error:", e);
      };
      reader.readAsDataURL(watermarked);

    } else {
      pendingImages.value.push(watermarked);
      pendingImageTimestamps.value.push(timestamp);

      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result)
            pendingImagePreviews.value.push(e.target.result as string);
          resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsDataURL(watermarked);
      });
    }

    toast.add({
      severity: "success",
      summary: t("importManagement.toast.successTitle"),
      detail: t("importManagement.toast.pastedImage"),
      life: 2000,
    });
  }
};

// ── Lifecycle ─────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener("resize", handleTableResize);
  window.addEventListener("paste", handleGlobalPaste);
  await Promise.all([fetchAllStockins(), fetchAllItems()]);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleTableResize);
  window.removeEventListener("paste", handleGlobalPaste);
  stockinStore.setCurrentStockin(null);
});

// ── API calls ─────────────────────────────────────────────

const fetchAllStockins = async () => {
  stockinStore.setLoading(true);
  try {
    const stockins = await stockinAPI.getAllStockin();
    stockinStore.setStockins(stockins);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("importManagement.toast.errorTitle"),
      detail: error.message || t("importManagement.toast.loadStockinError"),
      life: 3000,
    });
  } finally {
    stockinStore.setLoading(false);
  }
};

const fetchAllItems = async () => {
  try {
    const items = await itemAPI.getAll();
    itemStore.setItems(items);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("importManagement.toast.errorTitle"),
      detail: error.message || t("importManagement.toast.loadItemError"),
      life: 3000,
    });
  }
};

const clearDateFilter = async () => {
  selectedAreaFilter.value = null;
  searchQuery.value = "";
  fromDate.value = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0);
  toDate.value = new Date(new Date().setHours(23, 59, 59));
  currentPage.value = 1;
  await fetchAllStockins();
};

// ── Helpers ───────────────────────────────────────────────
const getImageUrl = (filename: string) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${import.meta.env.WAREHOUSE_URL}/api/StockIn/image/${filename}`;
};

const getItemImageUrl = (filename: string) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${import.meta.env.WAREHOUSE_URL}/api/Item/image/${filename}`;
};

const getItemName = (item: any) =>
  item?.eng?.partname || item?.com?.name || "Unknown";

const getItemAreaPart = (item: any): "SMD" | "MAINLINE" | "" => {
  const areaPart = item?.areaPart?.toUpperCase?.() || "";
  const code = item?.itemIndentifyId?.toUpperCase?.() || "";

  if (areaPart === "SMD" || code.startsWith("SMD-")) {
    return "SMD";
  }

  if (areaPart === "MAINLINE" || code.startsWith("MAINLINE-")) {
    return "MAINLINE";
  }

  return "";
};

const getStockinAreaPart = (stockin: any): string => {
  const areaPart = stockin?.areaPart?.toUpperCase?.() || "";

  if (areaPart === "SMD") return "SMD";
  if (areaPart === "MAINLINE") return "MAINLINE";

  return stockin?.areaPart || "-";
};

const getDetailItemName = (item: any) => {
  if (!item) return "Unknown";
  return (
    item.eng?.partname ||
    item.com?.name ||
    item.partname ||
    item.name ||
    "Unknown"
  );
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getSelectedItemLabel = (id: number) =>
  availableItems.value.find((i) => i.value === id)?.label || "";
const getSelectedItemImage = (id: number) =>
  availableItems.value.find((i) => i.value === id)?.image || "";
const getSelectedItemType = (id: number) =>
  availableItems.value.find((i) => i.value === id)?.type || "";
const getSelectedItemUnit = (id: number) =>
  availableItems.value.find((i) => i.value === id)?.unit || "";
const getSelectedItemStock = (id: number) =>
  availableItems.value.find((i) => i.value === id)?.stock || 0;
const getSelectedItemSpecs = (id: number) =>
  availableItems.value.find((i) => i.value === id)?.specifications || null;
const getSelectedItemAreaPart = (id: number) =>
  availableItems.value.find((i) => i.value === id)?.areaPart || "";
const getSelectedItemIdentifyId = (id: number) =>
  availableItems.value.find((i) => i.value === id)?.itemIndentifyId || "";

// ── Timestamp watermark ───────────────────────────────────
const addTimestampToImage = (file: File, timestamp: string): Promise<File> =>
  new Promise((resolve) => {
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
      const textWidth = ctx.measureText(timestamp).width;
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
      ctx.fillText(timestamp, x + padding, y + padding + fontSize * 0.85);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve(
            blob ? new File([blob], file.name, { type: file.type }) : file,
          );
        },
        file.type,
        0.92,
      );
    };
    img.src = url;
  });

// ── Create Dialog functions ───────────────────────────────
const openCreateDialog = () => {
  createForm.value = { note: "", areaPart: null, items: [] };
  showCreateDialog.value = true;
};

const closeCreateDialog = () => {
  showCreateDialog.value = false;
  createForm.value = { note: "", areaPart: null, items: [] };
  createPendingImages.value = [];
  createPendingPreviews.value = [];
  createPendingTimestamps.value = [];
};

const addItemRow = () => {
  if (!createForm.value.areaPart) {
    toast.add({
      severity: "warn",
      summary: t("importManagement.toast.warningTitle"),
      detail: t("importManagement.toast.selectAreaBeforeAddProduct"),
      life: 3000,
    });
    return;
  }

  createForm.value.items.push({ itemId: 0, quantity: 1, price: "0" });
};

const removeItemRow = (index: number) => {
  createForm.value.items.splice(index, 1);
};

const onItemSelect = (_event: any, index: number) => {
  const selectedItemId = createForm.value.items[index]?.itemId;
  if (selectedItemId) {
    const foundItem = itemStore.items.find((i) => i.id === selectedItemId);
    if (foundItem?.price) {
      createForm.value.items[index].price = foundItem.price;
    }
  }
};

// ── Detail ────────────────────────────────────────────────
const viewDetail = async (stockin: Stockin) => {
  selectedStockin.value = stockin;
  if (stockin.id) {
    try {
      selectedStockin.value = await stockinAPI.getStockinById(stockin.id);
    } catch (error) {
      console.error("Error loading stockin detail:", error);
    }
  }
  showDetailDialog.value = true;
};

// ── Delete ────────────────────────────────────────────────
const confirmDelete = (stockin: Stockin) => {
  confirm.require({
    message: t("importManagement.confirmDelete.message", { id: stockin.id }),
    header: t("importManagement.confirmDelete.header"),
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("importManagement.confirmDelete.accept"),
    rejectLabel: t("importManagement.confirmDelete.reject"),
    acceptClass: "p-button-danger",
    accept: async () => {
      if (!stockin.id) return;
      stockinStore.setLoading(true);
      try {
        await stockinAPI.deleteStockin(stockin.id);
        toast.add({
          severity: "success",
          summary: t("importManagement.toast.successTitle"),
          detail: t("importManagement.toast.deleteSuccess"),
          life: 3000,
        });
        await fetchAllStockins();
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: t("importManagement.toast.errorTitle"),
          detail: error.message || t("importManagement.toast.deleteError"),
          life: 3000,
        });
      } finally {
        stockinStore.setLoading(false);
      }
    },
  });
};

// ── Image Management ──────────────────────────────────────
const viewImages = async (stockin: Stockin) => {
  selectedStockin.value = stockin;
  if (stockin.id) {
    try {
      const stockinData = await stockinAPI.getStockinById(stockin.id);
      currentImages.value = stockinData.image || [];
      stockinStore.setCurrentStockin(stockinData);
    } catch {
      currentImages.value = stockin.image || [];
    }
  } else {
    currentImages.value = stockin.image || [];
  }
  showImageDialog.value = true;
};

const closeImageDialog = () => {
  showImageDialog.value = false;
  selectedStockin.value = null;
  currentImages.value = [];
  clearPendingImages();
  stockinStore.setCurrentStockin(null);
};

const handleDrop = (event: DragEvent) => {
  if (stockinStore.uploadingImages) return;
  const files = event.dataTransfer?.files;
  if (!files?.length) return;
  const maxSize = 5 * 1024 * 1024;
  const validFiles: File[] = [];
  Array.from(files).forEach((file) => {
    if (
      !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
        file.type,
      )
    )
      return;
    if (file.size > maxSize) return;
    validFiles.push(file);
  });
  if (!validFiles.length) return;
  pendingImages.value.push(...validFiles);
  validFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result)
        pendingImagePreviews.value.push(e.target.result as string);
    };
    reader.readAsDataURL(file);
  });
};

const handleImageUpload = (event: Event) => {
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
        summary: t("importManagement.toast.warningTitle"),
        detail: t("importManagement.toast.invalidFormat", { name: file.name }),
        life: 3000,
      });
      return;
    }
    if (file.size > maxSize) {
      toast.add({
        severity: "warn",
        summary: t("importManagement.toast.warningTitle"),
        detail: t("importManagement.toast.fileTooLarge", { name: file.name }),
        life: 3000,
      });
      return;
    }
    validFiles.push(file);
  });
  if (!validFiles.length) return;
  pendingImages.value.push(...validFiles);
  validFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result)
        pendingImagePreviews.value.push(e.target.result as string);
    };
    reader.readAsDataURL(file);
  });
  if (imageFileInput.value) imageFileInput.value.value = "";
};

const handleCameraCapture = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files?.length) return;
  const file = files[0];
  if (
    !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)
  ) {
    toast.add({
      severity: "warn",
      summary: t("importManagement.toast.warningTitle"),
      detail: t("importManagement.toast.unsupportedFormat"),
      life: 3000,
    });
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      severity: "warn",
      summary: t("importManagement.toast.warningTitle"),
      detail: t("importManagement.toast.fileTooLargeSimple"),
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
  const watermarked = await addTimestampToImage(
    new File([file], newName, { type: file.type }),
    timestamp,
  );
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
  if (!selectedStockin.value?.id || !pendingImages.value.length) {
    toast.add({
      severity: "warn",
      summary: t("importManagement.toast.warningTitle"),
      detail: t("importManagement.toast.noFileSelected"),
      life: 3000,
    });
    return;
  }
  stockinStore.setUploadingImages(true);
  try {
    const result = await stockinAPI.uploadImagesSequentially(
      selectedStockin.value.id,
      pendingImages.value,
    );
    if (result.success > 0) {
      toast.add({
        severity: "success",
        summary: t("importManagement.toast.successTitle"),
        detail: t("importManagement.toast.uploadSuccessDetail", {
          success: result.success,
          total: pendingImages.value.length,
        }),
        life: 3000,
      });
      clearPendingImages();
      if (selectedStockin.value.id) {
        const stockinData = await stockinAPI.getStockinById(
          selectedStockin.value.id,
        );
        currentImages.value = stockinData.image || [];
        stockinStore.setCurrentStockin(stockinData);
      }
      await fetchAllStockins();
    }
    if (result.failed > 0) {
      toast.add({
        severity: "error",
        summary: t("importManagement.toast.errorTitle"),
        detail: t("importManagement.toast.uploadFailDetail", {
          count: result.failed,
        }),
        life: 5000,
      });
    }
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("importManagement.toast.errorTitle"),
      detail: error.message || t("importManagement.toast.uploadError"),
      life: 3000,
    });
  } finally {
    stockinStore.setUploadingImages(false);
  }
};

const viewImageFullscreen = (imageUrl: string) => {
  const fullUrls = currentImages.value.map((img) => getImageUrl(img));
  imagePreview.open(getImageUrl(imageUrl), fullUrls);
};

watch(showImageDialog, (val) => {
  if (val) {
    nextTick(() => {
      pasteInput.value?.focus();
    });
  }
});
watch(isTableMobile, (mobile) => {
  pageSize.value = mobile ? 5 : 10;
});

watch(
  () => createForm.value.areaPart,
  (newArea, oldArea) => {
    if (!oldArea || newArea === oldArea) return;

    createForm.value.items = [];
  },
);
</script>

<style scoped>
:deep(.content-area) {
  padding: 0 !important;
  max-width: none !important;
  margin: 0 !important;
}

/* ── Image container ── */
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
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Calendar ── */
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
}

/* ── Stockin cards ── */
.stockin-card-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stockin-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.stockin-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stockin-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.stockin-card-id {
  font-weight: 700;
  font-size: 0.95rem;
  color: #111827;
}
.stockin-card-date {
  font-size: 0.75rem;
  color: #6b7280;
}

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

.stockin-card-label {
  color: #6b7280;
  min-width: 75px;
}
.stockin-card-value {
  font-weight: 500;
  color: #111827;
  flex: 1;
  min-width: 0;
}

.stockin-card-footer {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

/* ===== DESKTOP CARD ===== */
.stockin-desktop-card {
  display: flex;
  height: 160px;
  cursor: default;
}

/* Cột trái */
.stockin-desktop-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.18s;
  position: relative;
  border-radius: 12px 0 0 12px;
}

.stockin-desktop-left:hover {
  background: #f0f9ff;
}

.stockin-desktop-left-hint {
  position: absolute;
  bottom: 0.6rem;
  right: 1rem;
  font-size: 0.7rem;
  color: #93c5fd;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.18s;
}

.stockin-desktop-left:hover .stockin-desktop-left-hint {
  opacity: 1;
}

/** Ảnh thumbnails */
.stockin-desktop-images {
  display: grid;
  grid-template-columns: repeat(2, 56px);
  grid-template-rows: repeat(2, 56px);
  gap: 4px;
  flex-shrink: 0;
  width: 116px;
  height: 116px;
}

/* 1 ảnh: chiếm full 116x116 */
.stockin-thumb-full {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
  width: 116px !important;
  height: 116px !important;
}

/* 2 ảnh: mỗi ảnh chiếm 1 cột, full chiều cao */
.stockin-thumb-half {
  grid-row: 1 / 3;
  width: 56px !important;
  height: 116px !important;
}

.stockin-desktop-thumb {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.stockin-desktop-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stockin-thumb-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stockin-desktop-no-img {
  width: 116px;
  height: 116px;
  border-radius: 8px;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Danh sách sản phẩm */
.stockin-desktop-product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  overflow: hidden;
}

.stockin-desktop-product-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.stockin-desktop-product-name {
  font-weight: 600;
  color: #111827;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stockin-desktop-product-type {
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #6b7280;
  flex-shrink: 0;
}

.stockin-desktop-product-qty {
  font-size: 0.78rem;
  font-weight: 600;
  color: #16a34a;
  flex-shrink: 0;
}

.stockin-desktop-more-products {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

/* Divider */
.stockin-desktop-divider {
  width: 1px;
  background: #e5e7eb;
  margin: 1rem 0;
}

/* Cột phải */
.stockin-desktop-right {
  width: 40%;
  flex-shrink: 0;
  padding: 1rem 1.25rem 1rem 1.5rem;  /* ← thêm padding trái nhiều hơn */
  cursor: pointer;
  transition: background 0.18s;
  position: relative;
  border-radius: 0 12px 12px 0;
  display: flex;
  flex-direction: row;
  align-items: center;    
  gap: 1rem;       
  justify-content: space-between;
}

.stockin-desktop-right:hover {
  background: #f5f3ff;
}

.stockin-desktop-right-hint {
  font-size: 0.7rem;
  color: #a78bfa;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.18s;
}

.stockin-desktop-right:hover .stockin-desktop-right-hint {
  opacity: 1;
}

.stockin-desktop-meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stockin-desktop-id {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.stockin-desktop-date,
.stockin-desktop-creator {
  font-size: 0.85rem;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.stockin-desktop-counts {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.stockin-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 20px;
  background: #f3f4f6;
  color: #6b7280;
  font-weight: 500;
}

.stockin-desktop-note {
  font-size: 0.78rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  overflow: hidden;
}

.stockin-desktop-note span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stockin-table {
  width: 100%;
}

.stockin-table :deep(.p-datatable-wrapper) {
  overflow-x: auto;
}

.stockin-table :deep(.p-datatable-table) {
  table-layout: fixed;
  min-width: 980px;
}

.stockin-table :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #334155;
  font-weight: 700;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.stockin-table :deep(.p-datatable-tbody > tr) {
  cursor: pointer;
  transition: background-color 0.18s ease;
}

.stockin-table :deep(.p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}

.stockin-table :deep(.p-datatable-tbody > tr > td) {
  vertical-align: top;
  padding-top: 0.9rem;
  padding-bottom: 0.9rem;
  overflow: hidden;
}

.stockin-table :deep(.p-column-header-content) {
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Dropdown fix mobile ── */
@media (max-width: 767px) {
  .flex.justify-between.items-center.mb-4 {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .w-80 {
    width: 100% !important;
  }

  :global(.stockin-item-dropdown-panel) {
    max-width: calc(100vw - 2rem) !important;
    width: calc(100vw - 2rem) !important;
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
