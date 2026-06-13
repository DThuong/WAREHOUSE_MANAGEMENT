<template>
  <MainLayout>
    <div class="page-gradient-bg">
    <div class="animate-fade-in">
      <!-- Header -->
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
            {{ t("reports.orderReport.title") }}
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

      <!-- Filters -->
      <Card style="margin-bottom: 1.5rem">
        <template #content>
          <div
            style="display: flex; gap: 1rem; align-items: end; flex-wrap: wrap"
          >
            <div style="flex: 1; min-width: 200px">
              <label
                style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                >{{ t("reports.common.fromDate") }}</label
              >
              <Calendar
                v-model="fromDate"
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                style="width: 100%"
                :inputStyle="{ width: '100%' }"
                @date-select="loadData"
              />
            </div>
            <div style="flex: 1; min-width: 200px">
              <label
                style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                >{{ t("reports.common.toDate") }}</label
              >
              <Calendar
                v-model="toDate"
                dateFormat="dd/mm/yy"
                showIcon
                showTime
                hourFormat="24"
                style="width: 100%"
                :inputStyle="{ width: '100%' }"
                @date-select="loadData"
              />
            </div>
            <div style="flex: 1; min-width: 200px">
              <label
                style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                >{{ t("reports.common.filterArea") }}</label
              >
              <Dropdown
                v-model="selectedArea"
                :options="areaOptions"
                optionLabel="label"
                optionValue="value"
                style="width: 100%"
              />
            </div>
            <div style="flex: 1; min-width: 200px">
              <label
                style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                >{{ t("reports.orderReport.filterStatus") }}</label
              >
              <Dropdown
                v-model="selectedStatus"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="t('reports.orderReport.statusOptions.all')"
                style="width: 100%"
                @change="loadData"
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

      <!-- Trend Chart -->
      <Card style="margin-bottom: 1.5rem">
        <template #content>
          <AreaTrendChart
            :title="t('reports.common.trendTitleOrders')"
            :labels="trendLabels"
            :smd-data="trendSmdData"
            :mainline-data="trendMainlineData"
            :value-label="t('reports.common.trendValueOrders')"
            v-model:period="trendPeriod"
            @point-click="onTrendPointClick"
          />
        </template>
      </Card>

      <!-- Report Content -->
      <Card>
        <template #content>
          <div ref="reportContent" class="report-content" style="padding: 2rem">
            <!-- Report Header -->
            <div style="text-align: center; padding-bottom: 1rem">
              <h1
                style="
                  font-size: 1.75rem;
                  font-weight: 700;
                  margin-bottom: 0.5rem;
                "
              >
                {{ t("reports.orderReport.reportTitle") }}
              </h1>
              <p style="font-size: 0.875rem; color: #666">
                {{
                  t("reports.common.dateRange", {
                    from: formatDate(fromDate),
                    to: formatDate(toDate),
                  })
                }}
              </p>
              <p v-if="selectedStatus" style="font-size: 0.875rem; color: #666">
                {{
                  t("reports.orderReport.statusLabel", {
                    status: getStatusLabel(selectedStatus),
                  })
                }}
              </p>
              <p style="font-size: 0.875rem; color: #666">
                {{ t("reports.common.printDate") }}:
                {{ formatDate(new Date()) }}
              </p>
            </div>

            <!-- Summary -->
            <div
              style="
                display: grid;
                grid-template-columns: repeat(4, 1fr);
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
                <div
                  style="
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--primary-color);
                  "
                >
                  {{ filteredOrders.length }}
                </div>
                <div
                  style="font-size: 0.875rem; color: #666; margin-top: 0.5rem"
                >
                  {{ t("reports.orderReport.summary.totalOrders") }}
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
                  {{ pendingCount }}
                </div>
                <div
                  style="font-size: 0.875rem; color: #666; margin-top: 0.5rem"
                >
                  {{ t("reports.orderReport.summary.pending") }}
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
                <div style="font-size: 2rem; font-weight: 700; color: #3b82f6">
                  {{ approvedCount }}
                </div>
                <div
                  style="font-size: 0.875rem; color: #666; margin-top: 0.5rem"
                >
                  {{ t("reports.orderReport.summary.approved") }}
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
                  {{ completedCount }}
                </div>
                <div
                  style="font-size: 0.875rem; color: #666; margin-top: 0.5rem"
                >
                  {{ t("reports.orderReport.summary.completed") }}
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
                style="
                  width: 100%;
                  border-collapse: collapse;
                  table-layout: fixed;
                  text-align: center;
                  word-wrap: break-word;
                "
              >
                <thead>
                  <tr style="background: #f9fafb">
                    <th style="width: 90px; text-align: center">
                      {{ t("reports.orderReport.table.orderCode") }}
                    </th>
                    <th style="width: 120px; text-align: center">
                      {{ t("reports.orderReport.table.orderDate") }}
                    </th>
                    <th style="width: 140px; text-align: center">
                      {{ t("reports.orderReport.table.orderedBy") }}
                    </th>
                    <th style="width: 120px; text-align: center">
                      {{ t("reports.orderReport.table.department") }}
                    </th>
                    <th style="width: 90px; text-align: center">
                      {{ t("reports.orderReport.table.image") }}
                    </th>
                    <th style="width: 120px; text-align: center">
                      {{ t("reports.orderReport.table.product") }}
                    </th>
                    <th style="width: 90px; text-align: center">
                      {{ t("reports.orderReport.table.unitPrice") }}
                    </th>
                    <th style="width: 80px; text-align: center">
                      {{ t("reports.orderReport.table.qty") }}
                    </th>
                    <th style="width: 130px; text-align: center">
                      {{ t("reports.orderReport.table.subtotal") }}
                    </th>
                    <th style="width: 120px; text-align: center">
                      {{ t("reports.orderReport.table.status") }}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <template v-for="order in filteredOrders" :key="order.id">
                    <template v-if="order.orderDetails?.length">
                      <tr
                        v-for="(detail, index) in order.orderDetails"
                        :key="detail.id"
                      >
                        <!-- Order info (rowspan) -->
                        <td
                          v-if="index === 0"
                          :rowspan="order.orderDetails.length"
                        >
                          <strong>#{{ order.id }}</strong>
                        </td>

                        <td
                          v-if="index === 0"
                          :rowspan="order.orderDetails.length"
                        >
                          {{ formatDate(order.orderDate) }}
                        </td>

                        <td
                          v-if="index === 0"
                          :rowspan="order.orderDetails.length"
                        >
                          {{ order.nameWorker || "-" }}
                        </td>

                        <td
                          v-if="index === 0"
                          :rowspan="order.orderDetails.length"
                        >
                          {{
                            getDepartmentLabel(order.account?.department) || "-"
                          }}
                        </td>

                        <!-- Image -->
                        <td style="text-align: center">
                          <img
                            v-if="detail.item?.picture?.length"
                            :src="detail.item.picture[0]"
                            style="
                              width: 60px;
                              height: 60px;
                              object-fit: cover;
                              border-radius: 4px;
                            "
                            crossorigin="anonymous"
                          />
                          <span v-else class="muted-text">{{
                            t("reports.common.noImage")
                          }}</span>
                        </td>

                        <!-- Product -->
                        <td style="text-align: left">
                          <div class="product-name">
                            {{
                              detail.item?.eng?.partname ||
                              detail.item?.com?.name ||
                              "-"
                            }}
                          </div>
                          <div class="muted-text">
                            Id: {{ detail.item?.itemIndentifyId || "-" }}
                          </div>
                          <div class="muted-text">
                            {{
                              detail.item?.eng?.partname ||
                              detail.item?.com?.specifications ||
                              "-"
                            }}
                          </div>
                        </td>

                        <!-- Price -->
                        <td class="text-right" style="text-align: center">
                          {{ formatCurrency(Number(detail.item?.price || 0)) }}
                        </td>

                        <!-- Qty -->
                        <td class="text-right" style="text-align: center">
                          <strong>{{ detail.orderQty }}</strong>
                          {{ getUnitLabel(detail.item?.unit) || "" }}
                        </td>

                        <!-- Total -->
                        <td class="text-right" style="text-align: center">
                          <strong>
                            {{
                              formatCurrency(
                                detail.orderQty *
                                  Number(detail.item?.price || 0),
                              )
                            }}
                          </strong>
                        </td>

                        <!-- Status -->
                        <td
                          v-if="index === 0"
                          :rowspan="order.orderDetails.length"
                        >
                          <span
                            class="status-badge"
                            :style="{
                              background: getStatusColor(order.status),
                            }"
                          >
                            {{ getStatusLabel(order.status) }}
                          </span>
                        </td>
                      </tr>
                    </template>
                  </template>
                </tbody>
              </table>

              <!-- Empty state -->
              <div
                v-if="filteredOrders.length === 0"
                style="text-align: center; padding: 3rem"
              >
                <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc"></i>
                <p class="muted-text">
                  {{ t("reports.orderReport.emptyState") }}
                </p>
              </div>

              <!-- Summary -->
              <div
                v-if="filteredOrders.length"
                style="
                  margin-top: 2rem;
                  padding: 1rem;
                  background: #f9fafb;
                  border: 1px solid #e5e7eb;
                  border-radius: 4px;
                  text-align: right;
                "
              >
                <strong>{{ t("reports.orderReport.totalValue") }}: </strong>
                <span
                  style="color: #10b981; font-size: 1.5rem; font-weight: 700"
                >
                  {{ formatCurrency(totalValue) }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Date detail dialog -->
      <Dialog
        v-model:visible="dateDetailVisible"
        modal
        :header="t('reports.common.detailDialogTitle', { date: selectedTrendDate })"
        style="width: 90vw; max-width: 900px"
      >
        <DataTable :value="selectedDateOrders" responsiveLayout="scroll">
          <Column :header="t('reports.orderReport.table.orderCode')">
            <template #body="{ data }">#{{ data.id }}</template>
          </Column>
          <Column field="area" :header="t('reports.common.colArea')" />
          <Column :header="t('reports.orderReport.table.orderedBy')">
            <template #body="{ data }">{{ data.nameWorker || "-" }}</template>
          </Column>
          <Column :header="t('reports.orderReport.table.status')">
            <template #body="{ data }">
              <span
                class="status-badge"
                :style="{ background: getStatusColor(data.status) }"
              >
                {{ getStatusLabel(data.status) }}
              </span>
            </template>
          </Column>
          <Column :header="t('reports.common.colQty')">
            <template #body="{ data }">{{ calculateOrderQty(data) }}</template>
          </Column>
          <Column :header="t('reports.common.colAction')" style="width: 80px; text-align: center">
            <template #body="{ data }">
              <Button icon="pi pi-eye" text rounded @click="openOrderDetail(data)" />
            </template>
          </Column>
        </DataTable>
        <div v-if="!selectedDateOrders.length" style="text-align: center; padding: 2rem; color: #999">
          {{ t("reports.common.noData") }}
        </div>
      </Dialog>

      <!-- Order detail dialog -->
      <Dialog
        v-model:visible="orderDetailVisible"
        modal
        :header="selectedOrder ? `#${selectedOrder.id}` : ''"
        style="width: 90vw; max-width: 800px"
      >
        <DataTable :value="selectedOrder?.orderDetails || []" responsiveLayout="scroll">
          <Column :header="t('reports.orderReport.table.product')">
            <template #body="{ data }">
              {{ data.item?.eng?.partname || data.item?.com?.name || "-" }}
            </template>
          </Column>
          <Column :header="t('reports.orderReport.table.unitPrice')">
            <template #body="{ data }">
              {{ formatCurrency(Number(data.item?.price || 0)) }}
            </template>
          </Column>
          <Column field="orderQty" :header="t('reports.orderReport.table.qty')" />
          <Column :header="t('reports.orderReport.table.subtotal')">
            <template #body="{ data }">
              {{ formatCurrency(data.orderQty * Number(data.item?.price || 0)) }}
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
import { useOrderStore } from "@/stores/orderStore";
import { orderAPI } from "@/services/orderAPI";
import { useI18n } from "vue-i18n";
import { useTranslationHelpers } from "@/composables/useTranslationHelpers";
import { useDashboardStore, type AreaKey } from "@/stores/dashboard";

const { getDepartmentLabel, getUnitLabel, statusOptions } =
  useTranslationHelpers();
const router = useRouter();
const orderStore = useOrderStore();
const dashboardStore = useDashboardStore();
const { t } = useI18n();
const loading = ref(false);

// Date filters
const fromDate = ref<Date>(new Date(new Date().getFullYear(), 0, 1, 0, 0, 0));
const toDate = ref<Date>(new Date(new Date().setHours(23, 59, 59)));
const selectedStatus = ref<string | null>(null);
const selectedArea = ref<AreaKey>("ALL");
const areaOptions = [
  { label: t("reports.common.areaAll"), value: "ALL" as AreaKey },
  { label: "SMD", value: "SMD" as AreaKey },
  { label: "MAINLINE", value: "MAINLINE" as AreaKey },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "#f59e0b";
    case "Approved":
      return "#3b82f6";
    case "Completed":
      return "#10b981";
    case "Rejected":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

// Format date to ISO string with time
const formatDateTimeForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
// Load data with filter
const loadData = async () => {
  loading.value = true;
  try {
    const from = formatDateTimeForAPI(fromDate.value);
    const to = formatDateTimeForAPI(toDate.value);

    const data = await orderAPI.filterOrders({
      fromDate: from,
      toDate: to,
      status: selectedStatus.value || undefined,
    });

    orderStore.setOrders(data);
  } catch (error) {
    console.error("Error loading orders:", error);
  } finally {
    loading.value = false;
  }
};

// Reset filter
const resetFilter = () => {
  fromDate.value = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0);
  toDate.value = new Date(new Date().setHours(23, 59, 59));
  selectedStatus.value = null;
  selectedArea.value = "ALL";
  loadData();
};

// Computed values
const filteredOrders = computed(() => {
  let orders = [...orderStore.orders];

  if (selectedArea.value !== "ALL") {
    orders = orders.filter(
      (order) => dashboardStore.getOrderArea(order) === selectedArea.value,
    );
  }

  return orders.sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  );
});

const pendingCount = computed(
  () => filteredOrders.value.filter((o) => o.status === "Pending").length,
);

const approvedCount = computed(
  () => filteredOrders.value.filter((o) => o.status === "Approved").length,
);

const completedCount = computed(
  () => filteredOrders.value.filter((o) => o.status === "Completed").length,
);

const totalValue = computed(() => {
  return filteredOrders.value.reduce((total, order) => {
    return total + calculateOrderTotal(order);
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

const calculateOrderTotal = (order: any) => {
  if (!order.orderDetails || order.orderDetails.length === 0) return 0;

  return order.orderDetails.reduce((sum: number, detail: any) => {
    const price = parseFloat(detail.item.price) || 0;
    return sum + detail.orderQty * price;
  }, 0);
};

const getStatusLabel = (status: string) => {
  const option = statusOptions.value.find((opt) => opt.value === status);
  return option?.label || status;
};

// Print report
const printReport = () => {
  window.print();
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

const calculateOrderQty = (order: any) =>
  (order.orderDetails || []).reduce(
    (sum: number, detail: any) => sum + (detail.orderQty || 0),
    0,
  );

const ordersTrendMap = computed(() => {
  const map = new Map<string, { SMD: number; MAINLINE: number; orders: any[] }>();
  for (const order of orderStore.orders) {
    const key = formatDateKey(order.orderDate);
    const area = dashboardStore.getOrderArea(order);
    if (!map.has(key)) map.set(key, { SMD: 0, MAINLINE: 0, orders: [] });
    const entry = map.get(key)!;
    if (area === "SMD" || area === "MAINLINE") {
      entry[area] += calculateOrderQty(order);
    }
    entry.orders.push({ ...order, area });
  }
  return map;
});

const sortedTrendKeys = computed(() => {
  let keys = Array.from(ordersTrendMap.value.keys()).sort();
  if (trendPeriod.value !== "all") {
    const n = Number(trendPeriod.value);
    keys = keys.slice(-n);
  }
  return keys;
});

const trendLabels = computed(() => sortedTrendKeys.value.map(formatLabel));
const trendSmdData = computed(() =>
  sortedTrendKeys.value.map((k) => ordersTrendMap.value.get(k)?.SMD || 0),
);
const trendMainlineData = computed(() =>
  sortedTrendKeys.value.map((k) => ordersTrendMap.value.get(k)?.MAINLINE || 0),
);

const dateDetailVisible = ref(false);
const selectedTrendDate = ref("");
const selectedDateOrders = ref<any[]>([]);
const orderDetailVisible = ref(false);
const selectedOrder = ref<any>(null);

const onTrendPointClick = (index: number) => {
  const key = sortedTrendKeys.value[index];
  if (!key) return;
  selectedTrendDate.value = formatLabel(key);
  selectedDateOrders.value = ordersTrendMap.value.get(key)?.orders || [];
  dateDetailVisible.value = true;
};

const openOrderDetail = (order: any) => {
  selectedOrder.value = order;
  orderDetailVisible.value = true;
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
.report-table th,
.report-table td {
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  vertical-align: middle;
  height: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-right {
  text-align: right;
}

.muted-text {
  font-size: 0.75rem;
  color: #666;
}

.product-name {
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
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
