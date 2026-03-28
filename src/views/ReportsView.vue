<template>
  <MainLayout>
    <div class="animate-fade-in">
      <div class="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem">
              <i class="pi pi-cart-arrow-down" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem">{{ t("reports.import.title") }}</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem">{{ t("reports.import.description") }}</p>
              <Button :label="t('reports.viewReport')" outlined @click="navigateToReport('stockin')" />
            </div>
          </template>
        </Card>
        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem">
              <i class="pi pi-shopping-cart" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem">{{ t("reports.order.title") }}</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem">{{ t("reports.order.description") }}</p>
              <Button :label="t('reports.viewReport')" outlined @click="navigateToReport('orders')" />
            </div>
          </template>
        </Card>
        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem">
              <i class="pi pi-box" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem">{{ t("reports.inventory.title") }}</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem">{{ t("reports.inventory.description") }}</p>
              <Button :label="t('reports.viewReport')" outlined @click="navigateToReport('inventory')" />
            </div>
          </template>
        </Card>
      </div>

      <!-- BIỂU ĐỒ BAR CHART -->
      <Card v-if="!isMobile" class="mb-6 shadow-sm border border-slate-100">
        <template #content>
          <div style="padding: 1rem">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
              <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i class="pi pi-chart-bar text-slate-600"></i>
                Phân tích Tồn kho từng Sản phẩm
              </h3>

              <div class="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto p-1 bg-slate-50 rounded-lg">
                <SelectButton v-model="selectedTrend" :options="trendOptions" @change="onTrendChange" :allowEmpty="false" />

                <template v-if="selectedTrend === 'Items trend'">
                  <div class="w-px bg-slate-300 hidden sm:block mx-1"></div>
                  <Dropdown
                    v-model="selectedItem"
                    :options="allItems"
                    placeholder="Tìm kiếm SP"
                    filter
                    :filterFields="['eng.partname', 'com.name', 'id', 'itemIndentifyId']"
                    @change="onItemChange"
                    class="w-full sm:w-64"
                  >
                    <template #value="slotProps">
                      <div v-if="slotProps.value" class="flex items-center gap-2">
                        <i class="pi pi-box text-sm"></i>
                        <span class="truncate max-w-[150px]">
                          {{ slotProps.value.eng?.partname || slotProps.value.com?.name || "SP" }}
                        </span>
                      </div>
                      <span v-else>{{ slotProps.placeholder }}</span>
                    </template>
                    <template #option="slotProps">
                      <div class="flex flex-col">
                        <span class="font-medium text-slate-800">{{ slotProps.option.eng?.partname || slotProps.option.com?.name || "Unknown" }}</span>
                        <span class="text-xs text-slate-500">{{ slotProps.option.type || "N/A" }} - Tồn: {{ slotProps.option.stockQty }}</span>
                      </div>
                    </template>
                  </Dropdown>
                </template>

                <div class="w-px bg-slate-300 hidden sm:block mx-1"></div>
                <!-- Đổi time chỉ re-group rawData, KHÔNG gọi API -->
                <SelectButton v-model="selectedTime" :options="timeOptions" @change="onTimeChange" :allowEmpty="false" />
              </div>
            </div>

            <div v-if="loading" class="flex justify-center items-center py-20">
              <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
            </div>

            <div v-else>
              <div class="bg-white rounded-lg" style="height: 450px">
                <Chart type="bar" :data="chartData" :options="chartOptions" style="height: 100%; width: 100%" />
              </div>

              <!-- BẢNG CHI TIẾT -->
              <div v-if="selectedChartData.length > 0" class="mt-8 animate-fade-in transition-all">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                    Dữ liệu chi tiết
                    <span class="text-sm font-normal text-slate-500">({{ selectedChunkLabel }})</span>
                  </h4>
                  <Button icon="pi pi-times" rounded text severity="secondary" @click="selectedChartData = []" />
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
                    <div class="text-center py-4 text-slate-500">Không có dữ liệu chi tiết</div>
                  </template>
                  <Column header="Sản phẩm" class="w-1/3">
                    <template #body="{ data }">
                      <span class="font-semibold text-slate-800 uppercase">
                        {{ data.item.eng?.partname || data.item.com?.name || `Mã: ${data.item.id}` }}
                      </span>
                    </template>
                  </Column>
                  <Column header="Phân loại">
                    <template #body="{ data }">
                      <span :class="['px-2 py-1 rounded text-xs font-medium border', data.item.eng ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200']">
                        {{ data.item.eng ? "ENG" : "COM" }}
                      </span>
                    </template>
                  </Column>
                  <Column alignHeader="right">
                    <template #header>
                      <div class="flex items-center gap-1 justify-end w-full">
                        <div class="w-2 h-2 rounded-full bg-blue-500"></div> Nhập bao nhiêu
                      </div>
                    </template>
                    <template #body="{ data }">
                      <div class="text-right font-bold text-blue-600">
                        {{ formatNumber(data.totalStockIn) }}
                        <span class="text-xs font-normal text-slate-400">{{ data.item.unit }}</span>
                      </div>
                    </template>
                  </Column>
                  <Column alignHeader="right">
                    <template #header>
                      <div class="flex items-center gap-1 justify-end w-full">
                        <div class="w-2 h-2 rounded-full bg-yellow-500"></div> Sử dụng bao nhiêu
                      </div>
                    </template>
                    <template #body="{ data }">
                      <div class="text-right font-bold text-yellow-600">
                        {{ formatNumber(data.totalOrdered) }}
                        <span class="text-xs font-normal text-slate-400">{{ data.item.unit }}</span>
                      </div>
                    </template>
                  </Column>
                  <Column alignHeader="right">
                    <template #header>
                      <div class="flex items-center gap-1 justify-end w-full">
                        <div class="w-2 h-2 rounded-full bg-emerald-500"></div> Còn lại (Tồn kho)
                      </div>
                    </template>
                    <template #body="{ data }">
                      <div class="text-right font-bold text-emerald-600">
                        {{ formatNumber(data.stockQty) }}
                        <span class="text-xs font-normal text-slate-400">{{ data.item.unit }}</span>
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

    <Dialog v-model:visible="showUnsupportedDialog" :modal="true" :draggable="false" :style="{ width: '85vw', maxWidth: '320px' }" :showHeader="false" :closable="false">
      <div style="text-align: center; padding: 1.5rem 1rem">
        <i class="pi pi-mobile" style="font-size: 2.5rem; color: #f59e0b; margin-bottom: 1rem; display: block"></i>
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b">{{ t("reports.mobileNotSupported.title") }}</h3>
        <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5">{{ t("reports.mobileNotSupported.description") }}</p>
        <Button label="Đóng" style="width: 100%" @click="showUnsupportedDialog = false" />
      </div>
    </Dialog>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
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
import type { Item, DailyMovement, DailyMovementItem } from "@/types/item.types";

const router = useRouter();
const { t } = useI18n();

// ── Mobile ────────────────────────────────────────────────
const isMobile = ref(window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
const handleResize = () => { isMobile.value = window.innerWidth < 768; };
const showUnsupportedDialog = ref(false);

const navigateToReport = (type: string) => {
  if (isMobile.value) { showUnsupportedDialog.value = true; return; }
  router.push({ name: `${type.charAt(0).toUpperCase() + type.slice(1)}Report` });
};

// ── Formatting ────────────────────────────────────────────
const formatNumber = (num: number) => new Intl.NumberFormat("vi-VN").format(num || 0);

// ── State ─────────────────────────────────────────────────
const loading = ref(false);
const trendOptions = ref(["Total trend", "Items trend"]);
const selectedTrend = ref("Total trend");
const timeOptions = ref(["Ngày", "Tuần", "Tháng"]);
const selectedTime = ref("Tuần");
const allItems = ref<Item[]>([]);
const selectedItem = ref<Item | null>(null);
const selectedChartData = ref<any[]>([]);
const selectedChunkLabel = ref("");
const fullReportData = ref<any[]>([]);
const chartData = ref<any>(null);

// Raw data — load 1 lần, dùng cho tất cả filter
const rawData = ref<DailyMovement[]>([]);

// ── Chunks ────────────────────────────────────────────────
const generateTimeChunks = (type: string) => {
  const chunks: { label: string; fromDate: Date; toDate: Date }[] = [];
  const today = new Date();

  if (type === "Ngày") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      chunks.push({
        label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
        fromDate: start, toDate: end,
      });
    }
  } else if (type === "Tuần") {
    // 7 tuần gần nhất (T2 → CN)
    for (let i = 6; i >= 0; i--) {
      const curr = new Date(today);
      curr.setDate(today.getDate() - i * 7);
      const dow = curr.getDay();
      const diff = dow === 0 ? -6 : 1 - dow;
      const monday = new Date(curr); monday.setDate(curr.getDate() + diff); monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23, 59, 59, 999);
      const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      chunks.push({ label: `${fmt(monday)}-${fmt(sunday)}`, fromDate: monday, toDate: sunday });
    }
  } else if (type === "Tháng") {
    const year = today.getFullYear();
    for (let m = 0; m < 12; m++) {
      chunks.push({
        label: `T${m + 1}`,
        fromDate: new Date(year, m, 1, 0, 0, 0, 0),
        toDate: new Date(year, m + 1, 0, 23, 59, 59, 999),
      });
    }
  }

  return chunks;
};

const formatDateTimeForAPI = (date: Date): string => {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${d} ${h}:${mi}`;
};

// ── Load API — chỉ gọi 1 lần ────────────────────────────
const loadReportData = async () => {
  loading.value = true;
  selectedChartData.value = [];
  selectedChunkLabel.value = "";

  try {
    const fetchedItems = await itemAPI.getAll();
    allItems.value = fetchedItems;
    if (!selectedItem.value || !fetchedItems.find(it => it.id === selectedItem.value?.id)) {
      selectedItem.value = fetchedItems[0] ?? null;
    }

    // Range rộng: đủ cho Ngày (7 ngày), Tuần (7 tuần = ~49 ngày), Tháng (cả năm)
    const today = new Date();
    const year = today.getFullYear();
    // Lấy từ 49 ngày trước hoặc đầu năm (lấy cái nào sớm hơn)
    const weekRangeStart = new Date(today); weekRangeStart.setDate(today.getDate() - 49);
    const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);
    const rangeFrom = weekRangeStart < yearStart ? weekRangeStart : yearStart;
    const rangeTo = new Date(year, 11, 31, 23, 59, 59, 999);

    rawData.value = await itemAPI.getItemRange(
      formatDateTimeForAPI(rangeFrom),
      formatDateTimeForAPI(rangeTo),
    );

    buildChartFromRawData();
  } catch (err) {
    console.error("Failed to load report data", err);
  } finally {
    loading.value = false;
  }
};

// ── Build chart từ rawData — KHÔNG gọi API ───────────────
const buildChartFromRawData = () => {
  const chunks = generateTimeChunks(selectedTime.value);
  const isTotal = selectedTrend.value === "Total trend";
  const trackedId = selectedItem.value?.id;

  fullReportData.value = chunks.map(chunk => {
    const daysInChunk = rawData.value.filter(d => {
      const date = new Date(d.date);
      return date >= chunk.fromDate && date <= chunk.toDate;
    });

    let totalIn = 0, totalOut = 0, closingStock = 0;

    if (isTotal) {
      daysInChunk.forEach(day => {
        day.items.forEach(item => {
          totalIn += item.totalStockIn;
          totalOut += item.totalOrdered;
        });
      });
      const lastDay = daysInChunk.at(-1);
      if (lastDay) closingStock = lastDay.items.reduce((sum, i) => sum + i.closingStock, 0);
    } else {
      daysInChunk.forEach(day => {
        const found = day.items.find(i => i.itemId === trackedId);
        if (found) {
          totalIn += found.totalStockIn;
          totalOut += found.totalOrdered;
          closingStock = found.closingStock;
        }
      });
    }

    return { label: chunk.label, fromDate: chunk.fromDate, toDate: chunk.toDate, totalIn, totalOut, totalStock: closingStock, rawDays: daysInChunk };
  });

  updateChartData();
};

// ── Update datasets ───────────────────────────────────────
const updateChartData = () => {
  const isTotal = selectedTrend.value === "Total trend";
  const hasStockIn = fullReportData.value.some(r => r.totalIn > 0);
  const datasets: any[] = [];

  if (!isTotal || hasStockIn) {
    datasets.push({
      label: isTotal ? "Số phiếu nhập" : "Nhập bao nhiêu",
      backgroundColor: "#3b82f6", borderColor: "#2563eb",
      borderWidth: 1, borderRadius: 4, maxBarThickness: 100, barPercentage: 1.0, categoryPercentage: 0.8,
      data: fullReportData.value.map(r => r.totalIn),
    });
  }

  datasets.push({
    label: isTotal ? "Số đơn hoàn thành" : "Sử dụng bao nhiêu",
    backgroundColor: "#eab308", borderColor: "#ca8a04",
    borderWidth: 1, borderRadius: 4, maxBarThickness: 100, barPercentage: 1.0, categoryPercentage: 0.8,
    data: fullReportData.value.map(r => r.totalOut),
  });

  // Tồn kho luôn hiện — closingStock chính xác từ API
  datasets.push({
    label: "Còn lại (Tồn kho)",
    backgroundColor: "#10b981", borderColor: "#059669",
    borderWidth: 1, borderRadius: 4, maxBarThickness: 100, barPercentage: 1.0, categoryPercentage: 0.8,
    data: fullReportData.value.map(r => r.totalStock),
  });

  chartData.value = { labels: fullReportData.value.map(r => r.label), datasets };
};

// ── Chart click — filter rawDays, KHÔNG gọi API ──────────
const onChartClick = (e: any, elements: any[]) => {
  if (!elements.length) return;
  const dataIndex = elements[0].index;
  const datasetIndex = elements[0].datasetIndex;
  const clickedChunk = fullReportData.value[dataIndex];
  if (!clickedChunk) return;

  const label = chartData.value?.datasets?.[datasetIndex]?.label ?? "";
  const isStockInCol = label.includes("nhập") || label.includes("phiếu");
  const isOrderCol = label.includes("hoàn thành") || label.includes("Sử dụng");

  const isTotal = selectedTrend.value === "Total trend";
  const trackedId = selectedItem.value?.id;

  const itemMap = new Map<number, any>();
  clickedChunk.rawDays.forEach((day: DailyMovement) => {
    day.items.forEach((d: DailyMovementItem) => {
      if (!isTotal && d.itemId !== trackedId) return;
      if (!itemMap.has(d.itemId)) {
        itemMap.set(d.itemId, { itemId: d.itemId, item: d.item, totalStockIn: 0, totalOrdered: 0, stockQty: d.closingStock });
      }
      const entry = itemMap.get(d.itemId)!;
      entry.totalStockIn += d.totalStockIn;
      entry.totalOrdered += d.totalOrdered;
      entry.stockQty = d.closingStock;
    });
  });

  let result = Array.from(itemMap.values());
  if (isStockInCol) result = result.filter(d => d.totalStockIn > 0);
  else if (isOrderCol) result = result.filter(d => d.totalOrdered > 0);
  // Tồn kho: hiện tất cả

  selectedChartData.value = result;
  selectedChunkLabel.value = clickedChunk.label;
};

// ── Event handlers ────────────────────────────────────────
const onTimeChange = () => { selectedChartData.value = []; selectedChunkLabel.value = ""; buildChartFromRawData(); };
const onTrendChange = () => { selectedChartData.value = []; selectedChunkLabel.value = ""; buildChartFromRawData(); };
const onItemChange = () => { selectedChartData.value = []; selectedChunkLabel.value = ""; buildChartFromRawData(); };

// ── Chart options ─────────────────────────────────────────
const chartOptions = ref({
  responsive: true, maintainAspectRatio: false,
  animation: { duration: 800, easing: "easeOutQuart" },
  plugins: {
    legend: { display: true, position: "bottom" as const, labels: { usePointStyle: true, padding: 20, font: { family: "'Inter', sans-serif", size: 13, weight: "600" } } },
    tooltip: {
      mode: "nearest" as const, intersect: true,
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      titleFont: { size: 14, family: "'Inter', sans-serif" },
      bodyFont: { size: 13, family: "'Inter', sans-serif" },
      padding: 12, cornerRadius: 6,
      callbacks: {
        label: (context: any) => {
          let label = context.dataset.label || "";
          if (label) label += ": ";
          if (context.parsed.y !== null) label += new Intl.NumberFormat("vi-VN").format(context.parsed.y);
          return label;
        },
      },
    },
  },
  scales: {
    x: { stacked: false, grid: { display: false, drawBorder: false }, ticks: { maxRotation: 45, minRotation: 0, font: { family: "'Inter', sans-serif", size: 11 } } },
    y: { beginAtZero: true, stacked: false, grid: { color: "#f1f5f9", drawBorder: false, borderDash: [5, 5] }, ticks: { font: { family: "'Inter', sans-serif" } } },
  },
  interaction: { mode: "nearest" as const, axis: "x" as const, intersect: true },
  onClick: onChartClick,
});

// ── Lifecycle ─────────────────────────────────────────────
onMounted(() => { window.addEventListener("resize", handleResize); loadReportData(); });
onUnmounted(() => { window.removeEventListener("resize", handleResize); });
</script>

<style scoped>
.p-card { border-radius: 12px; }
:deep(.p-selectbutton .p-button) { padding: 0.5rem 1.25rem; font-weight: 600; font-size: 0.875rem; }
</style>