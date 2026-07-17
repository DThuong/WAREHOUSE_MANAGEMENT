<template>
  <MainLayout>
    <div class="page-gradient-bg">
    <div class="animate-fade-in">
      <!-- Header - KHÔNG nằm trong reportContent -->
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
            {{ t("reports.importReport.title") }}
          </h2>
        </div>

        <div style="display: flex; gap: 0.5rem">
          <Button
            label="Excel"
            icon="pi pi-file-excel"
            severity="success"
            outlined
            :loading="exporting"
            @click="onExportExcel"
          />
          <Button
            :label="t('reports.common.printReport')"
            icon="pi pi-print"
            severity="secondary"
            @click="printReport"
          />
        </div>
      </div>

      <!-- Filters - KHÔNG nằm trong reportContent -->
      <Card style="margin-bottom: 1.5rem">
        <template #content>
          <div class="filter-grid">
            <!-- From Date -->
            <div class="field">
              <label>{{ t("reports.common.fromDate") }}</label>
              <Calendar
                v-model="fromDate"
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                :stepMinute="15"
                class="w-full"
                :inputStyle="{ width: '100%' }"
                @date-select="loadData"
              />
            </div>

            <!-- To Date -->
            <div class="field">
              <label>{{ t("reports.common.toDate") }}</label>
              <Calendar
                v-model="toDate"
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                :stepMinute="15"
                class="w-full"
                :inputStyle="{ width: '100%' }"
                @date-select="loadData"
              />
            </div>

            <!-- Area -->
            <div class="field">
              <label>{{ t("reports.common.filterArea") }}</label>
              <Dropdown
                v-model="selectedArea"
                :options="areaOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                style="width: 100%"
              />
            </div>

            <!-- Buttons -->
            <div class="actions">
              <Button
                :label="t('reports.common.reset')"
                icon="pi pi-refresh"
                severity="secondary"
                @click="resetFilter"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Trend Chart -->
      <Card style="margin-bottom: 1.5rem">
        <template #content>
          <AreaTrendChart
            :title="t('reports.common.trendTitleStockin')"
            :labels="trendLabels"
            :smd-data="trendSmdData"
            :mainline-data="trendMainlineData"
            :value-label="t('reports.common.trendValueStockin')"
            v-model:period="trendPeriod"
            @point-click="onTrendPointClick"
          />
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
            {{ t("reports.importReport.reportTitle") }}
            <span v-if="selectedChartDate" style="color: #1e3a5f; font-size: 1.25rem;">
              ({{ selectedTrendDate }})
              <Button icon="pi pi-times" text rounded size="small" style="width: 2rem; height: 2rem; padding: 0;" @click="selectedChartDate = null" />
            </span>
          </h1>
          <p style="font-size: 0.875rem; color: #666">
            {{
              t("reports.common.dateRange", {
                from: formatDate(fromDate),
                to: formatDate(toDate),
              })
            }}
          </p>
          <p style="font-size: 0.875rem; color: #666">
            {{ t("reports.common.printDate") }}: {{ formatDate(new Date()) }}
          </p>
        </div>

        <!-- Summary -->
        <div
          style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
          "
        >
          <div
            style="
              text-align: center;
              padding: 1rem;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            "
          >
            <div style="font-size: 2rem; font-weight: 700; color: #1e3a5f">
              {{ filteredStockins.length ? filteredStockins.length : 0 }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem">
              {{ t("reports.importReport.summary.totalImports") }}
            </div>
          </div>
          <div
            style="
              text-align: center;
              padding: 1rem;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            "
          >
            <div style="font-size: 2rem; font-weight: 700; color: #10b981">
              {{ totalItems }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem">
              {{ t("reports.importReport.summary.totalProducts") }}
            </div>
          </div>
          <div
            style="
              text-align: center;
              padding: 1rem;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            "
          >
            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b">
              {{ totalQuantity }}
            </div>
            <div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem">
              {{ t("reports.importReport.summary.totalQuantity") }}
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" style="text-align: center; padding: 3rem">
          <ProgressSpinner />
        </div>

        <!-- Data Table -->
        <div v-else>
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
                  {{ t("reports.importReport.table.receiptCode") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.importReport.table.importDate") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.importReport.table.importer") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.importReport.table.product") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.importReport.table.image") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.importReport.table.unitPrice") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.importReport.table.quantity") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.importReport.table.subtotal") }}
                </th>
                <th
                  style="
                    padding: 0.75rem;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                  "
                >
                  {{ t("reports.importReport.table.note") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="stockin in filteredStockins" :key="stockin.id">
                <tr
                  v-for="(detail, index) in stockin.stockInDetails"
                  :key="detail.id"
                  style="border-bottom: 1px solid #e5e7eb"
                >
                  <!-- Merge cells for first row -->
                  <td
                    v-if="index === 0"
                    :rowspan="stockin.stockInDetails.length"
                    style="
                      padding: 0.75rem;
                      border: 1px solid #e5e7eb;
                      vertical-align: top;
                    "
                  >
                    <strong>#{{ stockin.id }}</strong>
                  </td>
                  <td
                    v-if="index === 0"
                    :rowspan="stockin.stockInDetails.length"
                    style="
                      padding: 0.75rem;
                      border: 1px solid #e5e7eb;
                      vertical-align: top;
                    "
                  >
                    {{ formatDate(stockin.stockInDate) }}
                  </td>
                  <td
                    v-if="index === 0"
                    :rowspan="stockin.stockInDetails.length"
                    style="
                      padding: 0.75rem;
                      border: 1px solid #e5e7eb;
                      vertical-align: top;
                    "
                  >
                    {{ stockin.account.username }}
                  </td>

                  <!-- Product info -->
                  <td
                    style="
                      padding: 0.75rem;
                      border: 1px solid #e5e7eb;
                      text-align: left;
                    "
                  >
                    <div style="font-weight: 600">
                      {{ detail.item.eng?.partname || detail.item.com?.name }}
                    </div>
                    <div style="font-size: 0.75rem; color: #666">
                      Id: {{ detail.item.itemIndentifyId }}
                    </div>
                    <div style="font-size: 0.75rem; color: #666">
                      {{
                        detail.item?.eng?.partname ||
                        detail.item?.com?.specifications ||
                        "-"
                      }}
                    </div>
                  </td>

                  <!-- Image -->
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
                        v-if="
                          detail.item.picture && detail.item.picture.length > 0
                        "
                        :src="detail.item.picture[0]"
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

                  <!-- Price -->
                  <td
                    style="
                      padding: 0.75rem;
                      border: 1px solid #e5e7eb;
                      text-align: center;
                    "
                  >
                    {{ formatCurrency(parseFloat(detail.price || detail.item.price || "0")) }}
                  </td>

                  <!-- Quantity -->
                  <td
                    style="
                      padding: 0.75rem;
                      border: 1px solid #e5e7eb;
                      text-align: center;
                    "
                  >
                    <strong>{{ detail.quantity }}</strong>
                    {{ getUnitLabel(detail.item.unit) }}
                  </td>

                  <!-- Total -->
                  <td
                    style="
                      padding: 0.75rem;
                      border: 1px solid #e5e7eb;
                      text-align: center;
                    "
                  >
                    <strong>{{
                      formatCurrency(
                        detail.quantity * parseFloat(detail.price || detail.item.price || "0"),
                      )
                    }}</strong>
                  </td>

                  <!-- Note (merged) -->
                  <td
                    v-if="index === 0"
                    :rowspan="stockin.stockInDetails.length"
                    style="
                      padding: 0.75rem;
                      border: 1px solid #e5e7eb;
                      vertical-align: top;
                      text-align: left;
                    "
                  >
                    {{ stockin.note || "-" }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

          <!-- Empty State -->
          <div
            v-if="filteredStockins.length === 0"
            style="text-align: center; padding: 3rem"
          >
            <i
              class="pi pi-inbox"
              style="font-size: 3rem; color: #ccc; margin-bottom: 1rem"
            ></i>
            <p style="color: #666">
              {{ t("reports.importReport.emptyState") }}
            </p>
          </div>

          <!-- Total Summary -->
          <div
            v-if="filteredStockins.length > 0"
            style="
              margin-top: 2rem;
              padding: 1rem;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
            "
          >
            <div style="text-align: right">
              <strong style="font-size: 1.125rem"
                >{{ t("reports.importReport.totalValue") }}:
              </strong>
              <span style="color: #10b981; font-size: 1.5rem; font-weight: 700">
                {{ formatCurrency(totalValue) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Date detail dialog removed, filtering main table directly -->

      <!-- Stockin detail dialog -->
      <Dialog
        v-model:visible="stockinDetailVisible"
        modal
        :header="selectedStockin ? `#${selectedStockin.id}` : ''"
        style="width: 90vw; max-width: 800px"
      >
        <DataTable :value="selectedStockin?.stockInDetails || []" responsiveLayout="scroll">
          <Column :header="t('reports.importReport.table.product')">
            <template #body="{ data }">
              {{ data.item?.eng?.partname || data.item?.com?.name || "-" }}
            </template>
          </Column>
          <Column :header="t('reports.importReport.table.unitPrice')">
            <template #body="{ data }">
              {{ formatCurrency(parseFloat(data.item?.price || "0")) }}
            </template>
          </Column>
          <Column field="quantity" :header="t('reports.importReport.table.quantity')" />
          <Column :header="t('reports.importReport.table.subtotal')">
            <template #body="{ data }">
              {{ formatCurrency(data.quantity * parseFloat(data.item?.price || "0")) }}
            </template>
          </Column>
        </DataTable>
      </Dialog>
    </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import Calendar from "primevue/calendar";
import Dropdown from "primevue/dropdown";
import ProgressSpinner from "primevue/progressspinner";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import AreaTrendChart from "@/components/charts/AreaTrendChart.vue";
import { useStockinStore } from "@/stores/stockinStore";
import { stockinAPI } from "@/services/stockinAPI";
import { useI18n } from "vue-i18n";
import { useTranslationHelpers } from "@/composables/useTranslationHelpers";
import { useDashboardStore, type AreaKey } from "@/stores/dashboard";

const router = useRouter();
const stockinStore = useStockinStore();
const dashboardStore = useDashboardStore();
const { t } = useI18n();
const { getUnitLabel } = useTranslationHelpers();
const loading = ref(false);

// Date filters
const fromDate = ref<Date>(new Date(new Date().getFullYear(), 0, 1, 0, 0, 0));
const toDate = ref<Date>(new Date(new Date().setHours(23, 59, 59)));
const selectedArea = ref<AreaKey>("ALL");
const areaOptions = [
  { label: t("reports.common.areaAll"), value: "ALL" as AreaKey },
  { label: "SMD", value: "SMD" as AreaKey },
  { label: "MAINLINE", value: "MAINLINE" as AreaKey },
];

// Format date to ISO string with time
const formatDateTimeForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const selectedChartDate = ref<string | null>(null);

// Load data with filter
const loadData = async () => {
  loading.value = true;
  selectedChartDate.value = null; // reset chart selection
  try {
    const from = formatDateTimeForAPI(fromDate.value);
    const to = formatDateTimeForAPI(toDate.value);

    const data = await stockinAPI.filterStockin(from, to);
    stockinStore.setStockins(data);
  } catch (error) {
    console.error("Error loading stockins:", error);
  } finally {
    loading.value = false;
  }
};

// Reset filter
const resetFilter = () => {
  fromDate.value = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0);
  toDate.value = new Date(new Date().setHours(23, 59, 59));
  selectedArea.value = "ALL";
  loadData();
};

// Computed values
const filteredStockins = computed(() => {
  let result = stockinStore.stockins;

  if (selectedArea.value !== "ALL") {
    result = result.filter(
      (stockin) => dashboardStore.getStockinArea(stockin) === selectedArea.value,
    );
  }

  if (selectedChartDate.value) {
    result = result.filter(
      (stockin) => formatDateKey(stockin.stockInDate) === selectedChartDate.value
    );
  }

  return result;
});

const totalItems = computed(() => {
  if (!Array.isArray(filteredStockins.value)) return 0;

  return filteredStockins.value.reduce((total, stockin) => {
    return total + (stockin.stockInDetails?.length || 0);
  }, 0);
});

const totalQuantity = computed(() => {
  if (!Array.isArray(filteredStockins.value)) return 0;

  return filteredStockins.value.reduce((total, stockin) => {
    return (
      total +
      (stockin.stockInDetails?.reduce(
        (sum, detail) => sum + detail.quantity,
        0,
      ) || 0)
    );
  }, 0);
});

const totalValue = computed(() => {
  if (!Array.isArray(filteredStockins.value)) return 0;

  return filteredStockins.value.reduce((total, stockin) => {
    return (
      total +
      (stockin.stockInDetails?.reduce((sum, detail) => {
        const price = parseFloat((detail as any).price || detail.item.price || "0");
        return sum + detail.quantity * price;
      }, 0) || 0)
    );
  }, 0);
});

// Format functions
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

// Print report
const printReport = () => {
  window.print();
};

// Export Excel
const exporting = ref(false);
const onExportExcel = async () => {
  exporting.value = true;
  try {
    const area = selectedArea.value === "ALL" ? undefined : selectedArea.value;
    await stockinAPI.exportExcel({
      fromDate: formatDateTimeForAPI(fromDate.value),
      toDate: formatDateTimeForAPI(toDate.value),
      areapart: area,
    });
  } catch (err) {
    console.error("Export failed:", err);
  } finally {
    exporting.value = false;
  }
};

// ===== Trend chart (SMD vs MAINLINE) =====
const trendPeriod = ref<"7" | "30" | "all">("30");

const formatDateKey = (date: Date | string) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const formatLabel = (key: string) => {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
};

const calculateStockinQty = (stockin: any) =>
  (stockin.stockInDetails || []).reduce(
    (sum: number, detail: any) => sum + (detail.quantity || 0),
    0,
  );

const stockinsTrendMap = computed(() => {
  const map = new Map<string, { SMD: number; MAINLINE: number; stockins: any[] }>();
  for (const stockin of stockinStore.stockins) {
    const key = formatDateKey(stockin.stockInDate);
    const area = dashboardStore.getStockinArea(stockin);
    if (!map.has(key)) map.set(key, { SMD: 0, MAINLINE: 0, stockins: [] });
    const entry = map.get(key)!;
    if (area === "SMD" || area === "MAINLINE") {
      entry[area] += calculateStockinQty(stockin);
    }
    entry.stockins.push({ ...stockin, area });
  }
  return map;
});

const sortedTrendKeys = computed(() => {
  let keys = Array.from(stockinsTrendMap.value.keys()).sort();
  if (trendPeriod.value !== "all") {
    const n = Number(trendPeriod.value);
    keys = keys.slice(-n);
  }
  return keys;
});

const trendLabels = computed(() => sortedTrendKeys.value.map(formatLabel));
const trendSmdData = computed(() =>
  sortedTrendKeys.value.map((k) => stockinsTrendMap.value.get(k)?.SMD || 0),
);
const trendMainlineData = computed(() =>
  sortedTrendKeys.value.map((k) => stockinsTrendMap.value.get(k)?.MAINLINE || 0),
);

const selectedTrendDate = ref("");
const stockinDetailVisible = ref(false);
const selectedStockin = ref<any>(null);

const onTrendPointClick = (index: number) => {
  const key = sortedTrendKeys.value[index];
  if (!key) return;
  
  if (selectedChartDate.value === key) {
    selectedChartDate.value = null;
    selectedTrendDate.value = "";
  } else {
    selectedChartDate.value = key;
    selectedTrendDate.value = formatLabel(key);
  }
};

const openStockinDetail = (stockin: any) => {
  selectedStockin.value = stockin;
  stockinDetailVisible.value = true;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
:deep(.content-area) {
  padding: 0 !important;
  max-width: none !important;
  margin: 0 !important;
}

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

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}

.field {
  width: 100%;
  min-width: 0; /* Quan trọng cho grid items */
}

.field label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
}

/* FIX: Kéo dài Calendar input full width */
:deep(.p-calendar) {
  display: flex;
  width: 100%;
}

:deep(.p-calendar .p-inputtext) {
  flex: 1 !important;
  width: 100% !important;
}

:deep(.p-calendar .p-button) {
  flex-shrink: 0; /* Icon button không bị co lại */
}

.actions {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
}
</style>
