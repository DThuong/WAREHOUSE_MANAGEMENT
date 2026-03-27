<template>
  <MainLayout>
    <div class="animate-fade-in">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        "
      >
        <div style="display: flex; align-items: center; gap: 1rem">
          <Button icon="pi pi-arrow-left" text @click="router.back()" />
          <h2 style="font-size: 1.5rem; font-weight: 700; margin: 0">
            {{ t("reports.inventoryReport.title") }}
          </h2>
        </div>

        <div style="display: flex; gap: 0.5rem">
          <Button
            :label="t('reports.common.printReport')"
            icon="pi pi-print"
            severity="secondary"
            @click="printReport"
          />
        </div>
      </div>

      <Card style="margin-bottom: 1.5rem">
        <template #content>
          <div
            style="display: flex; gap: 1rem; align-items: end; flex-wrap: wrap"
          >
            <div style="flex: 1; min-width: 200px">
              <label
                style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                >{{ t("reports.inventoryReport.filterProductType") }}</label
              >
              <Dropdown
                v-model="selectedType"
                :options="typeOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="t('reports.inventoryReport.typeOptions.all')"
                style="width: 100%"
              />
            </div>
            <div style="flex: 1; min-width: 200px">
              <label
                style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                >{{ t("reports.inventoryReport.filterStockStatus") }}</label
              >
              <Dropdown
                v-model="selectedStockStatus"
                :options="stockStatusOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="
                  t('reports.inventoryReport.stockStatusOptions.all')
                "
                style="width: 100%"
              />
            </div>
            <div style="flex: 1; min-width: 200px">
              <label
                style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                >{{ t("reports.inventoryReport.filterSearch") }}</label
              >
              <InputText
                v-model="searchQuery"
                :placeholder="
                  t('reports.inventoryReport.filterSearchPlaceholder')
                "
                style="width: 100%"
              />
            </div>
            <!-- Từ ngày -->
            <div style="flex: 1; min-width: 150px">
              <label
                style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                >{{ t("reports.common.fromDate") }}</label
              >
              <Calendar
                v-model="dateRange.fromDate"
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                style="width: 100%"
                :inputStyle="{ width: '100%' }"
                @date-select="loadUsedInRangeData"
                @blur="loadUsedInRangeData"
              />
            </div>

            <!-- Đến ngày -->
            <div style="flex: 1; min-width: 150px">
              <label
                style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                >{{ t("reports.common.toDate") }}</label
              >
              <Calendar
                v-model="dateRange.toDate"
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                style="width: 100%"
                :inputStyle="{ width: '100%' }"
                @date-select="loadUsedInRangeData"
                @blur="loadUsedInRangeData"
              />
            </div>
            <Button
              :label="t('reports.common.reset')"
              icon="pi pi-refresh"
              severity="secondary"
              @click="resetFilter"
            />
          </div>
        </template>
      </Card>

      <!-- Report Content - CHỈ phần này được xuất PDF -->
      <div
        ref="reportContent"
        class="report-content"
        style="background: white; padding: 2rem"
      >
        <!-- Report Header -->
        <div style="text-align: center; padding-bottom: 1rem">
          <h1
            style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem"
          >
            {{ t("reports.inventoryReport.reportTitle") }}
          </h1>
          <p style="font-size: 0.875rem; color: #666">
            {{ t("reports.inventoryReport.reportDate") }}:
            {{ formatDate(new Date()) }}
          </p>
        </div>

        <!-- Summary -->
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
          "
        >
          <!-- Tổng sản phẩm -->
          <div
            @click="handleSummaryClick(null)"
            :class="{ 'summary-card-active': selectedStockStatus === null }"
            class="summary-card"
            style="
              text-align: center;
              padding: 1rem;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
            "
          >
            <div style="font-size: 2rem; font-weight: 700; color: #6366f1">
              {{ totalItems }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem">
              {{ t("reports.inventoryReport.summary.totalProducts") }}
            </div>
          </div>

          <!-- Còn hàng -->
          <div
            @click="handleSummaryClick('normal')"
            :class="{ 'summary-card-active': selectedStockStatus === 'normal' }"
            class="summary-card"
            style="
              text-align: center;
              padding: 1rem;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
            "
          >
            <div style="font-size: 2rem; font-weight: 700; color: #10b981">
              {{ normalCount }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem">
              {{ t("reports.inventoryReport.summary.normal") }}
            </div>
          </div>

          <!-- Cảnh báo -->
          <div
            @click="handleSummaryClick('warning')"
            :class="{
              'summary-card-active': selectedStockStatus === 'warning',
            }"
            class="summary-card"
            style="
              text-align: center;
              padding: 1rem;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
            "
          >
            <div style="font-size: 2rem; font-weight: 700; color: #3b82f6">
              {{ warningCount }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem">
              {{ t("reports.inventoryReport.summary.warning") }}
            </div>
          </div>

          <!-- Thấp -->
          <div
            @click="handleSummaryClick('low')"
            :class="{ 'summary-card-active': selectedStockStatus === 'low' }"
            class="summary-card"
            style="
              text-align: center;
              padding: 1rem;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
            "
          >
            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b">
              {{ lowCount }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem">
              {{ t("reports.inventoryReport.summary.low") }}
            </div>
          </div>

          <!-- Nguy cấp -->
          <div
            @click="handleSummaryClick('critical')"
            :class="{
              'summary-card-active': selectedStockStatus === 'critical',
            }"
            class="summary-card"
            style="
              text-align: center;
              padding: 1rem;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
            "
          >
            <div style="font-size: 2rem; font-weight: 700; color: #ef4444">
              {{ criticalCount }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem">
              {{ t("reports.inventoryReport.summary.critical") }}
            </div>
          </div>

          <!-- Hết hàng -->
          <div
            @click="handleSummaryClick('out-of-stock')"
            :class="{
              'summary-card-active': selectedStockStatus === 'out-of-stock',
            }"
            class="summary-card"
            style="
              text-align: center;
              padding: 1rem;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
            "
          >
            <div style="font-size: 2rem; font-weight: 700; color: #991b1b">
              {{ outOfStockCount }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem">
              {{ t("reports.inventoryReport.summary.outOfStock") }}
            </div>
          </div>

          <!-- Chưa cấu hình -->
          <div
            @click="handleSummaryClick('not-configured')"
            :class="{
              'summary-card-active': selectedStockStatus === 'not-configured',
            }"
            class="summary-card"
            style="
              text-align: center;
              padding: 1rem;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
            "
          >
            <div style="font-size: 2rem; font-weight: 700; color: #6b7280">
              {{ notConfiguredCount }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem">
              {{ t("reports.inventoryReport.summary.notConfigured") }}
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div>
          <h3
            style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem"
          >
            {{ t("reports.inventoryReport.detail") }}
          </h3>

          <table
            class="report-table"
            style="width: 100%; border-collapse: collapse; text-align: center"
          >
            <thead>
              <tr style="background: #f9fafb">
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.inventoryReport.table.productCode") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.inventoryReport.table.image") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.inventoryReport.table.productName") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.inventoryReport.table.type") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.inventoryReport.table.stock") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.inventoryReport.table.safeStock") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.inventoryReport.table.status") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.inventoryReport.table.unitPrice") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.inventoryReport.table.inventoryValue") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.inventoryReport.table.orderCount") }}
                </th>
                <!-- Số lần nhập -->
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.inventoryReport.table.stockInCount") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in itemsWithOrderCount"
                :key="item.id"
                style="border-bottom: 1px solid #e5e7eb"
              >
                <!-- Mã SP -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb">
                  <strong>#{{ item.id }}</strong>
                  <div style="font-size: 0.75rem; color: #666">
                    {{ item.itemIndentifyId }}
                  </div>
                </td>

                <!-- Hình ảnh -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb">
                  <div
                    style="
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      height: 100%;
                    "
                  >
                    <img
                      v-if="item.picture && item.picture.length > 0"
                      :src="item.picture[0]"
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
                    <span v-else style="color: #999; font-size: 0.75rem">
                      {{ t("reports.common.noImage") }}
                    </span>
                  </div>
                </td>

                <!-- Tên sản phẩm -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb">
                  <div style="font-weight: 600">
                    {{ item.eng?.partname || item.com?.name }}
                  </div>
                  <div style="font-size: 0.75rem; color: #666">
                    {{
                      item?.eng?.description || item?.com?.specifications || "-"
                    }}
                  </div>
                </td>

                <!-- Loại -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb">
                  <span
                    :style="{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: item.eng ? '#dbeafe' : '#d1fae5',
                      color: item.eng ? '#1e40af' : '#065f46',
                    }"
                  >
                    {{ item.eng ? "ENG" : "COM" }}
                  </span>
                </td>

                <!-- Tồn kho -->
                <td
                  style="
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                    text-align: center;
                  "
                >
                  <strong>{{ item.stockQty }}</strong>
                  {{ getUnitLabel(item.unit) }}
                </td>

                <!-- Tồn an toàn -->
                <td
                  style="
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                    text-align: center;
                  "
                >
                  {{ item.saveQuantity }} {{ getUnitLabel(item.unit) }}
                </td>

                <!-- Trạng thái -->
                <td style="padding: 0.75rem; border: 1px solid #e5e7eb">
                  <span
                    :style="{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: getStockStatusColor(item).bg,
                      color: getStockStatusColor(item).text,
                    }"
                  >
                    {{ getStockStatusLabel(item) }}
                  </span>
                </td>

                <!-- Đơn giá -->
                <td
                  style="
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                    text-align: center;
                  "
                >
                  {{ formatCurrency(parseFloat(item.price || "0")) }}
                </td>

                <!-- Giá trị tồn -->
                <td
                  style="
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                    text-align: center;
                  "
                >
                  <strong>
                    {{ formatCurrency(parseFloat(item.stockPrice || "0")) }}
                  </strong>
                </td>

                <!-- Số lần order -->
                <td
                  style="
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                    text-align: center;
                  "
                >
                  <span
                    :style="{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      background: item.totalOrdered > 0 ? '#dbeafe' : '#f3f4f6',
                      color: item.totalOrdered > 0 ? '#1e40af' : '#6b7280',
                    }"
                  >
                    {{ item.totalOrdered || 0 }}
                  </span>
                </td>

                <!-- Số lần nhập kho -->
                <td
                  style="
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                    text-align: center;
                  "
                >
                  <span
                    :style="{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      background: item.totalStockIn > 0 ? '#d1fae5' : '#f3f4f6',
                      color: item.totalStockIn > 0 ? '#065f46' : '#6b7280',
                    }"
                  >
                    {{ item.totalStockIn || 0 }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div
            v-if="filteredItems.length === 0"
            style="text-align: center; padding: 3rem"
          >
            <i
              class="pi pi-inbox"
              style="font-size: 3rem; color: #ccc; margin-bottom: 1rem"
            ></i>
            <p style="color: #666">
              {{ t("reports.inventoryReport.emptyState") }}
            </p>
          </div>

          <!-- Total Summary -->
          <div
            v-if="filteredItems.length > 0"
            style="
              margin-top: 2rem;
              padding: 1rem;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
            "
          >
            <div
              style="
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
              "
            >
              <div>
                <strong
                  >{{ t("reports.inventoryReport.totalProducts") }}:</strong
                >
                {{ filteredItems.length }}
                {{ t("reports.inventoryReport.productUnit") }}
              </div>
              <div style="text-align: right">
                <strong
                  >{{ t("reports.inventoryReport.totalInventoryValue") }}:
                </strong>
                <span
                  style="color: #10b981; font-size: 1.25rem; font-weight: 700"
                >
                  {{ formatCurrency(totalInventoryValue) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import { useDashboardStore } from "@/stores/dashboard";
import { itemAPI } from "@/services/itemAPI";
import type { UsedInRangeItem } from "@/types/item.types";
import Calendar from "primevue/calendar";
import { useI18n } from "vue-i18n";
import { useTranslationHelpers } from "@/composables/useTranslationHelpers";

const router = useRouter();
const dashboardStore = useDashboardStore();
const { t } = useI18n();
const { getUnitLabel, typeOptions, stockStatusOptions, getStockStatusLabel } =
  useTranslationHelpers();
// filter 1 sản phẩm trong tất cả các đơn hàng có trạng thái Completed
const usedInRangeData = ref<UsedInRangeItem[]>([]);
const dateRange = ref({
  fromDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  toDate: new Date(new Date().setHours(23, 59, 59)),
});
const formatDateTimeForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const loadUsedInRangeData = async () => {
  try {
    const data = await itemAPI.checkUsedInrange(
      formatDateTimeForAPI(dateRange.value.fromDate),
      formatDateTimeForAPI(dateRange.value.toDate),
    );
    usedInRangeData.value = data;
  } catch (error) {
    console.error("Error loading used in range:", error);
  }
};

// Filters
const selectedType = ref<string | null>(null);
const selectedStockStatus = ref<string | null>(null);
const searchQuery = ref("");

// Reset filter
const resetFilter = () => {
  selectedType.value = null;
  selectedStockStatus.value = null;
  searchQuery.value = "";
  dateRange.value = {
    fromDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    toDate: new Date(new Date().setHours(23, 59, 59)),
  };
};

// Merge filteredItems với order count
const itemsWithOrderCount = computed(() => filteredItems.value);

// ===== FILTERED ITEMS (Filter từ baseItems theo Stock Status) =====
const filteredItems = computed(() => {
  let items = baseItems.value;

  // Chỉ filter theo Stock Status
  if (selectedStockStatus.value === "normal") {
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

// ===== BASE ITEMS (Bị ảnh hưởng bởi Type filter, KHÔNG bị ảnh hưởng bởi Stock Status filter) =====
const baseItems = computed(() => {
  if (!usedInRangeData.value?.length) return [];

  let items = usedInRangeData.value.map((x) => ({
    ...x.item, // spread toàn bộ item data lên trên
    totalOrdered: x.totalOrdered,
    totalStockIn: x.totalStockIn,
  }));

  if (selectedType.value === "ENG") {
    items = items.filter((item) => item.eng !== null);
  } else if (selectedType.value === "COM") {
    items = items.filter((item) => item.com !== null);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter((item) => {
      const name = item.eng?.partname || item.com?.name || "";
      const description =
        item.eng?.description || item.com?.specifications || "";
      const id = item.id?.toString() || "";
      const itemId = item.itemIndentifyId || "";
      return (
        name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        id.includes(query) ||
        itemId.toLowerCase().includes(query)
      );
    });
  }

  return items;
});
// ===== SUMMARY COUNTS (Tính từ baseItems - bị ảnh hưởng bởi Type & Search, KHÔNG bị ảnh hưởng bởi Stock Status) =====
const totalItems = computed(() => baseItems.value.length);

const normalCount = computed(
  () =>
    baseItems.value.filter(
      (item) => dashboardStore.getStockStatus(item) === "normal",
    ).length,
);

const warningCount = computed(
  () =>
    baseItems.value.filter(
      (item) => dashboardStore.getStockStatus(item) === "warning",
    ).length,
);

const lowCount = computed(
  () =>
    baseItems.value.filter(
      (item) => dashboardStore.getStockStatus(item) === "low",
    ).length,
);

const criticalCount = computed(
  () =>
    baseItems.value.filter(
      (item) => dashboardStore.getStockStatus(item) === "critical",
    ).length,
);

const outOfStockCount = computed(
  () =>
    baseItems.value.filter(
      (item) => dashboardStore.getStockStatus(item) === "out-of-stock",
    ).length,
);

const notConfiguredCount = computed(
  () =>
    baseItems.value.filter(
      (item) => dashboardStore.getStockStatus(item) === "not-configured",
    ).length,
);

const totalInventoryValue = computed(() => {
  return filteredItems.value.reduce((total, item) => {
    const price = parseFloat(item.price || "0");
    return total + item.stockQty * price;
  }, 0);
});

// Helper functions
const formatDate = (date: Date | string) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN");
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const getStockStatusColor = (item: any) => {
  const status = dashboardStore.getStockStatus(item);

  switch (status) {
    case "normal":
      return { bg: "#d1fae5", text: "#065f46" };
    case "warning":
      return { bg: "#dbeafe", text: "#1e40af" };
    case "low":
      return { bg: "#fef3c7", text: "#92400e" };
    case "critical":
      return { bg: "#fee2e2", text: "#991b1b" };
    case "out-of-stock":
      return { bg: "#1c1917", text: "#ffffff" };
    case "not-configured":
      return { bg: "#f3f4f6", text: "#4b5563" };
    default:
      return { bg: "#f3f4f6", text: "#6b7280" };
  }
};

// Print report
const printReport = () => {
  window.print();
};

// Handle summary card click
const handleSummaryClick = (status: string | null) => {
  if (selectedStockStatus.value === status) {
    // Nếu đang active thì bỏ filter (toggle off)
    selectedStockStatus.value = null;
  } else {
    // Nếu chưa active thì apply filter
    selectedStockStatus.value = status;
  }
};

onMounted(async () => {
  await loadUsedInRangeData();
});
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

/* Summary Card Styles */
.summary-card {
  position: relative;
  overflow: hidden;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #6366f1 !important;
}

.summary-card:active {
  transform: translateY(-2px);
}

.summary-card-active {
  border-color: #6366f1 !important;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.05) 0%,
    rgba(99, 102, 241, 0.1) 100%
  );
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.summary-card-active::before {
  content: "✓";
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #6366f1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
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
</style>
