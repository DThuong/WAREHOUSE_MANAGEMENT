<template>
  <MainLayout>
    <div class="animate-fade-in">
      <div class="grid grid-cols-3 gap-4 mb-6">
        <!-- Báo cáo nhập kho -->
        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem">
              <i
                class="pi pi-cart-arrow-down"
                style="
                  font-size: 3rem;
                  color: var(--primary-color);
                  margin-bottom: 1rem;
                "
              ></i>
              <h3
                style="
                  font-size: 1.125rem;
                  font-weight: 600;
                  margin-bottom: 0.5rem;
                "
              >
                {{ t("reports.import.title") }}
              </h3>
              <p
                style="
                  color: var(--gray-600);
                  font-size: 0.875rem;
                  margin-bottom: 1.5rem;
                "
              >
                {{ t("reports.import.description") }}
              </p>
              <Button
                :label="t('reports.viewReport')"
                outlined
                @click="navigateToReport('stockin')"
              />
            </div>
          </template>
        </Card>

        <!-- Báo cáo đơn hàng -->
        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem">
              <i
                class="pi pi-shopping-cart"
                style="font-size: 3rem; color: #10b981; margin-bottom: 1rem"
              ></i>
              <h3
                style="
                  font-size: 1.125rem;
                  font-weight: 600;
                  margin-bottom: 0.5rem;
                "
              >
                {{ t("reports.order.title") }}
              </h3>
              <p
                style="
                  color: var(--gray-600);
                  font-size: 0.875rem;
                  margin-bottom: 1.5rem;
                "
              >
                {{ t("reports.order.description") }}
              </p>
              <Button
                :label="t('reports.viewReport')"
                outlined
                @click="navigateToReport('orders')"
              />
            </div>
          </template>
        </Card>

        <!-- Báo cáo tồn kho -->
        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem">
              <i
                class="pi pi-box"
                style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem"
              ></i>
              <h3
                style="
                  font-size: 1.125rem;
                  font-weight: 600;
                  margin-bottom: 0.5rem;
                "
              >
                {{ t("reports.inventory.title") }}
              </h3>
              <p
                style="
                  color: var(--gray-600);
                  font-size: 0.875rem;
                  margin-bottom: 1.5rem;
                "
              >
                {{ t("reports.inventory.description") }}
              </p>
              <Button
                :label="t('reports.viewReport')"
                outlined
                @click="navigateToReport('inventory')"
              />
            </div>
          </template>
        </Card>
      </div>

      <!-- BIỂU ĐỒ BAR CHART MỚI -->
      <Card v-if="!isMobile" class="mb-6 shadow-sm border border-slate-100">
        <template #content>
          <div style="padding: 1rem">
            <!-- TOOLBAR / FILTER -->
            <div
              class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8"
            >
              <h3
                class="text-xl font-bold text-slate-800 flex items-center gap-2"
              >
                <i class="pi pi-chart-bar text-slate-600"></i>
                Phân tích Tồn kho từng Sản phẩm
              </h3>

              <div
                class="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto p-1 bg-slate-50 rounded-lg"
              >
                <!-- Type Filter -->
                <Dropdown
                  v-model="selectedType"
                  :options="typeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Loại SP"
                  @change="loadReportData"
                  class="w-[120px]"
                />

                <div class="w-px bg-slate-300 hidden sm:block mx-1"></div>

                <!-- Data Filter Mode (Total vs Item) -->
                <SelectButton
                  v-model="selectedTrend"
                  :options="trendOptions"
                  @change="loadReportData"
                  :allowEmpty="false"
                  aria-labelledby="basic"
                />

                <!-- Items Search Box -->
                <Dropdown
                  v-if="selectedTrend === 'Items trend'"
                  v-model="selectedItem"
                  :options="allItems"
                  placeholder="Tìm kiếm SP"
                  filter
                  :filterFields="[
                    'eng.partname',
                    'com.name',
                    'id',
                    'itemIndentifyId',
                  ]"
                  @change="loadReportData"
                  class="w-full sm:w-64"
                >
                  <template #value="slotProps">
                    <div v-if="slotProps.value" class="flex items-center gap-2">
                      <i class="pi pi-box text-sm"></i>
                      <span class="truncate max-w-[150px]">{{
                        slotProps.value.eng?.partname ||
                        slotProps.value.com?.name ||
                        "SP"
                      }}</span>
                    </div>
                    <span v-else>{{ slotProps.placeholder }}</span>
                  </template>
                  <template #option="slotProps">
                    <div class="flex flex-col">
                      <span class="font-medium text-slate-800">{{
                        slotProps.option.eng?.partname ||
                        slotProps.option.com?.name ||
                        "Unknown"
                      }}</span>
                      <span class="text-xs text-slate-500"
                        >{{ slotProps.option.type || "N/A" }} - Tồn:
                        {{ slotProps.option.stockQty }}</span
                      >
                    </div>
                  </template>
                </Dropdown>

                <div class="w-px bg-slate-300 hidden sm:block mx-1"></div>

                <!-- Time Filter -->
                <SelectButton
                  v-model="selectedTime"
                  :options="timeOptions"
                  @change="loadReportData"
                  :allowEmpty="false"
                />
              </div>
            </div>

            <div v-if="loading" class="flex justify-center items-center py-20">
              <ProgressSpinner
                style="width: 50px; height: 50px"
                strokeWidth="4"
              />
            </div>

            <div v-else>
              <div class="bg-white rounded-lg" style="height: 450px">
                <Chart
                  type="bar"
                  :data="chartData"
                  :options="chartOptions"
                  style="height: 100%; width: 100%"
                />
              </div>

              <!-- BẢNG CHI TIẾT (XUẤT HIỆN KHI CLICK VÀO CỘT) -->
              <div
                v-if="selectedChartData.length > 0"
                class="mt-8 animate-fade-in transition-all"
              >
                <div class="flex items-center justify-between mb-3">
                  <h4
                    class="text-lg font-bold text-slate-800 flex items-center gap-2"
                  >
                    Dữ liệu chi tiết
                    <span class="text-sm font-normal text-slate-500"
                      >({{ selectedChunkLabel }})</span
                    >
                  </h4>
                  <Button
                    icon="pi pi-times"
                    rounded
                    text
                    severity="secondary"
                    @click="selectedChartData = []"
                  />
                </div>

                <DataTable
                  :value="selectedChartData"
                  class="p-datatable-sm shadow-sm border border-slate-200 rounded-lg overflow-hidden [&_.p-datatable-thead>tr>th]:bg-slate-50 [&_.p-datatable-thead>tr>th]:text-slate-700"
                  responsiveLayout="scroll"
                  stripedRows
                  :paginator="selectedChartData.length > 10"
                  :rows="10"
                  :rowsPerPageOptions="[10, 25, 50]"
                >
                  <template #empty>
                    <div class="text-center py-4 text-slate-500">
                      Không có dữ liệu chi tiết
                    </div>
                  </template>
                  <Column header="Sản phẩm" class="w-1/3">
                    <template #body="{ data }">
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-slate-800 uppercase">{{
                          data.item.eng?.partname ||
                          data.item.com?.name ||
                          `Mã: ${data.item.id}`
                        }}</span>
                      </div>
                    </template>
                  </Column>
                  <Column header="Phân loại">
                    <template #body="{ data }">
                      <span
                        :class="[
                          'px-2 py-1 rounded text-xs font-medium border',
                          data.item.eng
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200',
                        ]"
                      >
                        {{ data.item.eng ? "ENG" : "COM" }}
                      </span>
                    </template>
                  </Column>
                  <Column alignHeader="right">
                    <template #header>
                      <div class="flex items-center gap-1 justify-end w-full">
                        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                        Nhập bao nhiêu
                      </div>
                    </template>
                    <template #body="{ data }">
                      <div class="text-right font-bold text-blue-600">
                        {{ formatNumber(data.totalStockIn) }}
                        <span class="text-xs font-normal text-slate-400">{{
                          data.item.unit
                        }}</span>
                      </div>
                    </template>
                  </Column>
                  <Column alignHeader="right">
                    <template #header>
                      <div class="flex items-center gap-1 justify-end w-full">
                        <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Sử dụng bao nhiêu
                      </div>
                    </template>
                    <template #body="{ data }">
                      <div class="text-right font-bold text-yellow-600">
                        {{ formatNumber(data.totalOrdered) }}
                        <span class="text-xs font-normal text-slate-400">{{
                          data.item.unit
                        }}</span>
                      </div>
                    </template>
                  </Column>
                  <Column alignHeader="right">
                    <template #header>
                      <div class="flex items-center gap-1 justify-end w-full">
                        <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Còn lại (Tồn kho)
                      </div>
                    </template>
                    <template #body="{ data }">
                      <div class="text-right font-bold text-emerald-600">
                        {{ formatNumber(data.stockQty) }}
                        <span class="text-xs font-normal text-slate-400">{{
                          data.item.unit
                        }}</span>
                      </div>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <Dialog
      v-model:visible="showUnsupportedDialog"
      :modal="true"
      :draggable="false"
      :style="{ width: '85vw', maxWidth: '320px' }"
      :showHeader="false"
      :closable="false"
    >
      <div style="text-align: center; padding: 1.5rem 1rem">
        <i
          class="pi pi-mobile"
          style="
            font-size: 2.5rem;
            color: #f59e0b;
            margin-bottom: 1rem;
            display: block;
          "
        ></i>
        <h3
          style="
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #1e293b;
          "
        >
          {{ t("reports.mobileNotSupported.title") }}
        </h3>
        <p
          style="
            font-size: 0.875rem;
            color: #64748b;
            margin-bottom: 1.5rem;
            line-height: 1.5;
          "
        >
          {{ t("reports.mobileNotSupported.description") }}
        </p>
        <Button
          label="Đóng"
          style="width: 100%"
          @click="showUnsupportedDialog = false"
        />
      </div>
    </Dialog>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import Chart from "primevue/chart";
import ProgressSpinner from "primevue/progressspinner";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Card from "primevue/card";
import SelectButton from "primevue/selectbutton";
import Dropdown from "primevue/dropdown";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useI18n } from "vue-i18n";
import { itemAPI } from "@/services/itemAPI";
import { stockinAPI } from "@/services/stockinAPI";
import { orderAPI } from "@/services/orderAPI";
import type { UsedInRangeItem, Item } from '@/types/item.types'

const router = useRouter();
const { t } = useI18n();

// Check if Mobile
const isMobile = ref(
  window.innerWidth < 768 ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
);
const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};
const showUnsupportedDialog = ref(false);

const navigateToReport = (type: string) => {
  if (isMobile.value) {
    showUnsupportedDialog.value = true;
    return;
  }
  router.push({
    name: `${type.charAt(0).toUpperCase() + type.slice(1)}Report`,
  });
};

// FORMATTING
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("vi-VN").format(num || 0);
};

// STATE CỦA CHART BAR MỚI
const loading = ref(false);

// Config Filter
const trendOptions = ref(["Total trend", "Items trend"]);
const selectedTrend = ref("Total trend");

const timeOptions = ref(["Ngày", "Tuần", "Tháng"]);
const selectedTime = ref("Tuần"); // Mặc định 7 ngày gần nhất

const typeOptions = ref([
  { label: "Tất cả loại", value: null },
  { label: "ENG", value: "ENG" },
  { label: "COM", value: "COM" },
]);
const selectedType = ref<string | null>(null);

// Data
const allItems = ref<Item[]>([]);
const selectedItem = ref<Item | null>(null);
const selectedChartData = ref<any[]>([]); // Data for Table below
const selectedChunkLabel = ref("");
const fullReportData = ref<any[]>([]);

const chartData = ref<any>(null);

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const generateTimeChunks = (type: string) => {
  const chunks = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (type === "Ngày") {
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    chunks.push({ label: "Hôm nay", fromDate: start, toDate: today });
  } else if (type === "Tuần") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      chunks.push({
        label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
        fromDate: start,
        toDate: end,
      });
    }
  } else if (type === "Tháng") {
    for (let i = 3; i >= 0; i--) {
      const end = new Date(today);
      end.setDate(today.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      const fmt = (d: Date) =>
        `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

      chunks.push({
        label: `${fmt(start)}-${fmt(end)}`,
        fromDate: start,
        toDate: end,
      });
    }
  }
  return chunks;
};

const formatDateTimeForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 1. Tải danh sách item & dữ liệu nhập/xuất trong Range
const loadReportData = async () => {
  loading.value = true;
  selectedChartData.value = [];
  selectedChunkLabel.value = '';

  try {
    // 1. Lấy danh sách items, orders, và stockins
    const [fetchedItems, fetchedOrders, fetchedStockins] = await Promise.all([
      itemAPI.getAll(),
      orderAPI.getAll(),
      stockinAPI.getAllStockin()
    ]);

    let filteredFetchedItems = fetchedItems;
    if (selectedType.value === 'ENG') {
      filteredFetchedItems = fetchedItems.filter(it => it.eng !== null);
    } else if (selectedType.value === 'COM') {
      filteredFetchedItems = fetchedItems.filter(it => it.com !== null);
    }
    allItems.value = filteredFetchedItems;

    if (!selectedItem.value || !filteredFetchedItems.find(it => it.id === selectedItem.value?.id)) {
      selectedItem.value = filteredFetchedItems[0] ?? null;
    }

    const trackedItemIds = new Set<number>();
    if (selectedTrend.value === 'Total trend') {
      filteredFetchedItems.forEach(it => trackedItemIds.add(it.id as number));
    } else if (selectedTrend.value === 'Items trend' && selectedItem.value) {
      trackedItemIds.add(selectedItem.value.id as number);
    }

    // Lọc chỉ lấy các đơn hàng có trạng thái Hoàn Thành (Completed) để tính số lượng sử dụng
    const validOrders = fetchedOrders.filter(o => o.status === 'Completed');

    // 2. Tạo chunks thời gian
    const chunks = generateTimeChunks(selectedTime.value);

    // 3. Xây dựng chart data
    fullReportData.value = chunks.map((chunk) => {
      let sumIn = 0;
      let sumOut = 0;
      let sumStock = 0;
      const details: any[] = [];

      trackedItemIds.forEach(id => {
        let stockInQty = 0;
        let orderedQty = 0;

        // Tính tổng nhập kho trong khoảng thời gian này
        fetchedStockins.forEach(stockin => {
          const sDate = new Date(stockin.stockInDate);
          if (sDate >= chunk.fromDate && sDate <= chunk.toDate) {
            stockin.stockInDetails?.forEach((detail: any) => {
              const detailItemId = detail.item?.id ?? detail.itemId;
              if (detailItemId === id) {
                stockInQty += detail.quantity;
              }
            });
          }
        });

        // Tính tổng xuất kho (order) trong khoảng thời gian này
        validOrders.forEach(order => {
          const oDate = new Date(order.orderDate);
          if (oDate >= chunk.fromDate && oDate <= chunk.toDate) {
            order.orderDetails?.forEach(detail => {
              const detailItemId = detail.item?.id ?? detail.itemId;
              if (detailItemId === id) {
                orderedQty += detail.orderQty;
              }
            });
          }
        });

        const itemObj = filteredFetchedItems.find(it => it.id === id);
        const stockQty = itemObj ? itemObj.stockQty : 0;

        sumIn += stockInQty;
        sumOut += orderedQty;
        sumStock += stockQty;

        if (stockInQty > 0 || orderedQty > 0 || selectedTrend.value === 'Items trend') {
          if (itemObj) {
            details.push({
              itemId: id,
              item: itemObj,
              totalStockIn: stockInQty,
              totalOrdered: orderedQty,
              stockQty: stockQty,
              stockPrice: itemObj.stockPrice,
            });
          }
        }
      });

      return {
        label: chunk.label,
        totalIn: sumIn,
        totalOut: sumOut,
        totalStock: sumStock,
        details
      };
    });

    updateChartData();

  } catch (err) {
    console.error('Failed to load chart report data', err);
  } finally {
    loading.value = false;
  }
};

// 2. Map data thành Chart Dataset
const updateChartData = () => {
  chartData.value = {
    labels: fullReportData.value.map((r) => r.label),
    datasets: [
      {
        label: "Nhập bao nhiêu",
        backgroundColor: "#3b82f6", // Xanh dương
        borderColor: "#2563eb",
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 100, // Thu nhỏ kích cỡ cột
        barPercentage: 1.0, // dính 3 cột trong cùng chunk lại sát nhau
        categoryPercentage: 0.8,
        data: fullReportData.value.map((r) => r.totalIn),
      },
      {
        label: "Còn lại (Tồn kho)",
        backgroundColor: "#10b981", // Xanh lá
        borderColor: "#059669",
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 100,
        barPercentage: 1.0,
        categoryPercentage: 0.8,
        data: fullReportData.value.map((r) => r.totalStock),
      },
      {
        label: "Sử dụng bao nhiêu",
        backgroundColor: "#eab308", // Vàng
        borderColor: "#ca8a04",
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 100,
        barPercentage: 1.0,
        categoryPercentage: 0.8,
        data: fullReportData.value.map((r) => r.totalOut),
      },
    ],
  };
};

// 3. Handle Chart Click Event
const onChartClick = (e: any, elements: any[]) => {
  if (elements && elements.length > 0) {
    const dataIndex = elements[0].index;
    const clickedChunk = fullReportData.value[dataIndex];
    if (clickedChunk) {
      selectedChartData.value = clickedChunk.details;
      selectedChunkLabel.value = clickedChunk.label;
    }
  }
};

// 4. Config Option ChartJS
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 800,
    easing: "easeOutQuart",
  },
  plugins: {
    legend: {
      display: true,
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: "600",
        },
      },
    },
    tooltip: {
      mode: "nearest" as const,
      intersect: true,
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      titleFont: { size: 14, family: "'Inter', sans-serif" },
      bodyFont: { size: 13, family: "'Inter', sans-serif" },
      padding: 12,
      cornerRadius: 6,
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat("vi-VN").format(context.parsed.y);
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      stacked: false,
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        font: { family: "'Inter', sans-serif", size: 11 },
      },
    },
    y: {
      beginAtZero: true,
      stacked: false,
      grid: {
        color: "#f1f5f9",
        drawBorder: false,
        borderDash: [5, 5],
      },
      ticks: {
        font: { family: "'Inter', sans-serif" },
      },
    },
  },
  interaction: {
    mode: "nearest" as const,
    axis: "x" as const,
    intersect: true,
  },
  onClick: onChartClick,
});

onMounted(() => {
  window.addEventListener("resize", handleResize);
  loadReportData();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.p-card {
  border-radius: 12px;
}
:deep(.p-selectbutton .p-button) {
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  font-size: 0.875rem;
}
</style>
