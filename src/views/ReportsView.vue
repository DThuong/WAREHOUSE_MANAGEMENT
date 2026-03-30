<template>
  <MainLayout>
    <div class="animate-fade-in">
      <!-- 3 report cards -->
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

      <!-- BAR CHART -->
      <Card v-if="!isMobile" class="mb-6 chart-card">
        <template #content>
          <div class="chart-wrapper">

            <!-- Row 1: Title + Trend toggle + Item selector -->
            <div class="chart-header">
              <h3 class="chart-title">
                <i class="pi pi-chart-bar"></i>
                Phân tích Tồn kho từng Sản phẩm
              </h3>
              <div class="header-controls">
                <SelectButton v-model="selectedTrend" :options="trendOptions" @change="onTrendChange" :allowEmpty="false" class="trend-select" />
                <template v-if="selectedTrend === 'Items trend'">
                  <div class="divider-v"></div>
                  <Dropdown
                    v-model="selectedItem" :options="allItems" placeholder="Tìm kiếm SP" filter
                    :filterFields="['eng.partname', 'com.name', 'id', 'itemIndentifyId']"
                    @change="onItemChange" class="item-dropdown"
                  >
                    <template #value="slotProps">
                      <div v-if="slotProps.value" class="dropdown-value">
                        <i class="pi pi-box"></i>
                        <span class="truncate">{{ slotProps.value.eng?.partname || slotProps.value.com?.name || "SP" }}</span>
                      </div>
                      <span v-else class="text-slate-400">{{ slotProps.placeholder }}</span>
                    </template>
                    <template #option="slotProps">
                      <div class="dropdown-option">
                        <span class="option-name">{{ slotProps.option.eng?.partname || slotProps.option.com?.name || "Unknown" }}</span>
                        <span class="option-meta">{{ slotProps.option.type || "N/A" }} · Tồn: {{ slotProps.option.stockQty }}</span>
                      </div>
                    </template>
                  </Dropdown>
                </template>
              </div>
            </div>

            <!-- Row 2: Filter bar -->
            <div class="filter-bar">
              <div class="filter-group">
                <span class="filter-label">Từ</span>
                <Calendar v-model="fromDate" dateFormat="dd/mm/yy" showIcon :manualInput="false" class="report-calendar" @date-select="onRangeChange" />
              </div>
              <i class="pi pi-arrow-right filter-arrow"></i>
              <div class="filter-group">
                <span class="filter-label">Đến</span>
                <Calendar v-model="toDate" dateFormat="dd/mm/yy" showIcon :manualInput="false" class="report-calendar" @date-select="onRangeChange" />
              </div>

              <div class="filter-separator"></div>

              <div class="time-tabs">
                <button
                  v-for="opt in timeOptions" :key="opt"
                  :class="['time-tab', { active: selectedTime === opt }]"
                  @click="onTimeTabClick(opt)"
                >{{ opt }}</button>
              </div>

              <div class="filter-separator"></div>

              <button class="reset-btn" @click="onResetRange">
                <i class="pi pi-refresh"></i>
                Reset
              </button>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="loading-state">
              <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="4" />
              <span class="loading-text">Đang tải dữ liệu...</span>
            </div>

            <div v-else>
              <!-- Chart -->
              <div class="chart-area">
                <Chart type="bar" :data="chartData" :options="chartOptions" style="height: 100%; width: 100%" />
              </div>

              <!-- Detail table -->
              <div v-if="selectedChartData.length > 0 || detailLoading" class="detail-section animate-fade-in">
                <div class="detail-header">
                  <h4 class="detail-title">
                    Dữ liệu chi tiết
                    <span class="detail-period">{{ selectedChunkLabel }}</span>
                    <span v-if="detailClickedCol" class="detail-badge"
                      :class="{
                        'badge-blue': detailClickedCol === 'stockin',
                        'badge-yellow': detailClickedCol === 'order',
                        'badge-green': detailClickedCol === 'items',
                      }">
                      {{ detailClickedCol === 'stockin' ? 'Phiếu nhập' : detailClickedCol === 'order' ? 'Đơn hoàn thành' : 'Chi tiết SP' }}
                    </span>
                  </h4>
                  <Button icon="pi pi-times" rounded text severity="secondary" size="small" @click="selectedChartData = []; detailClickedCol = ''" />
                </div>

                <div v-if="detailLoading" class="flex justify-center py-8">
                  <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="4" />
                </div>

                <!-- Total trend: Phiếu nhập -->
                <DataTable v-else-if="selectedTrend === 'Total trend' && detailClickedCol === 'stockin'"
                  :value="selectedChartData"
                  class="p-datatable-sm detail-table"
                  responsiveLayout="scroll" stripedRows :paginator="selectedChartData.length > 10" :rows="10" :rowsPerPageOptions="[10, 25, 50]">
                  <template #empty><div class="table-empty">Không có phiếu nhập trong khoảng thời gian này</div></template>
                  <Column header="Mã phiếu" style="width: 100px">
                    <template #body="{ data }"><span class="font-bold text-blue-600">#{{ data.id }}</span></template>
                  </Column>
                  <Column header="Ngày nhập"><template #body="{ data }">{{ formatDate(data.stockInDate) }}</template></Column>
                  <Column header="Người tạo"><template #body="{ data }">{{ data.account?.username || "-" }}</template></Column>
                  <Column header="Số loại SP" alignHeader="right">
                    <template #body="{ data }"><div class="text-left font-semibold text-slate-700">{{ data.stockInDetails?.length || 0 }} loại</div></template>
                  </Column>
                  <Column header="Ghi chú"><template #body="{ data }"><span class="text-slate-500 text-sm">{{ data.note || "-" }}</span></template></Column>
                </DataTable>

                <!-- Total trend: Đơn hoàn thành -->
                <DataTable v-else-if="selectedTrend === 'Total trend' && detailClickedCol === 'order'"
                  :value="selectedChartData"
                  class="p-datatable-sm detail-table"
                  responsiveLayout="scroll" stripedRows :paginator="selectedChartData.length > 10" :rows="10" :rowsPerPageOptions="[10, 25, 50]">
                  <template #empty><div class="table-empty">Không có đơn hoàn thành trong khoảng thời gian này</div></template>
                  <Column header="Mã đơn" style="width: 100px">
                    <template #body="{ data }"><span class="font-bold text-yellow-600">#{{ data.id }}</span></template>
                  </Column>
                  <Column header="Ngày đặt"><template #body="{ data }">{{ formatDate(data.orderDate) }}</template></Column>
                  <Column header="Người đặt"><template #body="{ data }">{{ data.nameWorker || data.account?.username || "-" }}</template></Column>
                  <Column header="Bộ phận"><template #body="{ data }">{{ data.account?.department || "-" }}</template></Column>
                  <Column header="Số loại SP" alignHeader="right">
                    <template #body="{ data }"><div class="text-left font-semibold text-slate-700">{{ data.orderDetails?.length || 0 }} loại</div></template>
                  </Column>
                </DataTable>

                <!-- Items trend -->
                <DataTable v-else-if="selectedTrend === 'Items trend' && detailClickedCol === 'items'"
                  :value="selectedChartData"
                  class="p-datatable-sm detail-table"
                  responsiveLayout="scroll" stripedRows :paginator="selectedChartData.length > 10" :rows="10" :rowsPerPageOptions="[10, 25, 50]">
                  <template #empty><div class="table-empty">Không có dữ liệu trong khoảng này</div></template>
                  <Column header="Sản phẩm" style="width: 35%">
                    <template #body="{ data }">
                      <span class="font-semibold text-slate-800 uppercase text-sm">
                        {{ data.itemName || data.item?.eng?.partname || data.item?.com?.name || `Mã: ${data.itemId}` }}
                      </span>
                    </template>
                  </Column>
                  <Column header="Loại" style="width: 80px">
                    <template #body="{ data }">
                      <span :class="['px-2 py-0.5 rounded text-xs font-medium border', data.item?.eng ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200']">
                        {{ data.item?.eng ? "ENG" : "COM" }}
                      </span>
                    </template>
                  </Column>
                  <Column alignHeader="right">
                    <template #header><div class="flex items-center gap-1 justify-end w-full"><div class="w-2 h-2 rounded-full bg-blue-500"></div> Nhập</div></template>
                    <template #body="{ data }">
                      <div class="text-right font-bold text-blue-600">{{ formatNumber(data.totalStockIn) }} <span class="text-xs font-normal text-slate-400 ml-0.5">{{ data.item?.unit }}</span></div>
                    </template>
                  </Column>
                  <Column alignHeader="right">
                    <template #header><div class="flex items-center gap-1 justify-end w-full"><div class="w-2 h-2 rounded-full bg-yellow-500"></div> Sử dụng</div></template>
                    <template #body="{ data }">
                      <div class="text-right font-bold text-yellow-600">{{ formatNumber(data.totalOrdered) }} <span class="text-xs font-normal text-slate-400 ml-0.5">{{ data.item?.unit }}</span></div>
                    </template>
                  </Column>
                  <Column alignHeader="right">
                    <template #header><div class="flex items-center gap-1 justify-end w-full"><div class="w-2 h-2 rounded-full bg-emerald-500"></div> Tồn kho</div></template>
                    <template #body="{ data }">
                      <div class="text-right font-bold text-emerald-600">{{ formatNumber(data.stockQty) }} <span class="text-xs font-normal text-slate-400 ml-0.5">{{ data.item?.unit }}</span></div>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Mobile dialog -->
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
import Calendar from "primevue/calendar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useI18n } from "vue-i18n";
import { itemAPI } from "@/services/itemAPI";
import { stockinAPI } from "@/services/stockinAPI";
import { orderAPI } from "@/services/orderAPI";
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

// ── Helpers ───────────────────────────────────────────────
const formatNumber = (num: number) => new Intl.NumberFormat("vi-VN").format(num || 0);
const formatDate = (str: string) =>
  new Date(str).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
const fmtAPI = (date: Date) => {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${d} ${h}:${mi}`;
};

// ── Today boundary ────────────────────────────────────────
const getTodayEnd = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

// ── Plugin: căn giữa cột đơn lẻ khi dataset kia = null/0 ─────
// → khi chỉ có 1 dataset có giá trị tại 1 category, dời bar đó về đúng tâm label
const centerLoneBarsPlugin = {
  id: 'centerLoneBars',
  afterUpdate(chart: any) {
    const { datasets } = chart.data;
    if (!datasets || datasets.length < 2) return;
    const hasVal = (v: any) => v !== null && v !== undefined && v !== 0;
    datasets.forEach((_: any, dsIdx: number) => {
      const meta = chart.getDatasetMeta(dsIdx);
      if (!meta || meta.hidden) return;
      meta.data.forEach((bar: any, i: number) => {
        if (!hasVal(datasets[dsIdx].data[i])) return;
        const activeCount = datasets.filter((ds: any) => hasVal(ds.data[i])).length;
        if (activeCount === 1) {
          // Chỉ mình dataset này có giá trị → căn vào đúng tâm category
          bar.x = chart.scales['x'].getPixelForValue(i);
          bar.width = Math.min(bar.width * datasets.length, 80);
        }
      });
    });
  },
};

// ── Dataset config ────────────────────────────────────────
// barPercentage: 1.0 → 2 cột sát nhau hoàn toàn trong nhóm (không gap)
// categoryPercentage: 0.85 → nhóm chiếm 85% slot → còn 15% gap giữa các tuần
const DS = {
  barPercentage: 1.0,
  categoryPercentage: 0.85,
  maxBarThickness: 80,
  borderRadius: 2,
  borderWidth: 0,
};

// ── State ─────────────────────────────────────────────────
const loading = ref(false);
const detailLoading = ref(false);
const detailClickedCol = ref("");

const trendOptions = ["Total trend", "Items trend"];
const selectedTrend = ref("Total trend");
const timeOptions = ["Ngày", "Tuần", "Tháng"];
const selectedTime = ref("Tuần");

const allItems = ref<Item[]>([]);
const selectedItem = ref<Item | null>(null);
const rawData = ref<DailyMovement[]>([]);

const fullReportData = ref<any[]>([]);
const chartData = ref<any>(null);
const selectedChartData = ref<any[]>([]);
const selectedChunkLabel = ref("");
const fromDate = ref<Date>(new Date());
const toDate = ref<Date>(new Date());

// ── Default range ─────────────────────────────────────────
const getDefaultRange = (type: string) => {
  const today = new Date();
  if (type === "Ngày") {
    const from = new Date(today); from.setDate(today.getDate() - 6); from.setHours(0, 0, 0, 0);
    const to = new Date(today); to.setHours(23, 59, 59, 999);
    return { from, to };
  } else if (type === "Tuần") {
    const dow = today.getDay();
    const diffToMon = dow === 0 ? -6 : 1 - dow;
    const thisMon = new Date(today); thisMon.setDate(today.getDate() + diffToMon); thisMon.setHours(0, 0, 0, 0);
    const from = new Date(thisMon); from.setDate(thisMon.getDate() - 11 * 7); // 12 tuần: tuần hiện tại + 11 tuần trước
    const thisSun = new Date(thisMon); thisSun.setDate(thisMon.getDate() + 6); thisSun.setHours(23, 59, 59, 999);
    return { from, to: thisSun };
  } else {
    const from = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
    const to = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { from, to };
  }
};

// ── Generate chunks — chỉ đến hôm nay ──────────────────
// Với chế độ Tháng: luôn sinh đủ 12 tháng nhưng cắt tháng tương lai
const generateTimeChunks = () => {
  const chunks: { label: string; fromDate: Date; toDate: Date }[] = [];
  const todayEnd = getTodayEnd();

  if (selectedTime.value === "Ngày") {
    const from = new Date(fromDate.value); from.setHours(0, 0, 0, 0);
    const effectiveTo = toDate.value > todayEnd ? new Date(todayEnd) : new Date(toDate.value);
    effectiveTo.setHours(23, 59, 59, 999);
    const cursor = new Date(from);
    while (cursor <= effectiveTo) {
      chunks.push({
        label: fmtDate(cursor),
        fromDate: new Date(cursor),
        toDate: (() => { const e = new Date(cursor); e.setHours(23, 59, 59, 999); return e; })(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

  } else if (selectedTime.value === "Tuần") {
    const from = new Date(fromDate.value);
    const effectiveTo = toDate.value > todayEnd ? new Date(todayEnd) : new Date(toDate.value);
    const cursor = new Date(from);
    const dow = cursor.getDay();
    const diffToMon = dow === 0 ? -6 : 1 - dow;
    cursor.setDate(cursor.getDate() + diffToMon); cursor.setHours(0, 0, 0, 0);
    while (cursor <= effectiveTo) {
      const monday = new Date(cursor);
      const sunday = new Date(cursor); sunday.setDate(cursor.getDate() + 6); sunday.setHours(23, 59, 59, 999);
      if (monday > todayEnd) break;
      const chunkTo = sunday > todayEnd ? new Date(todayEnd) : sunday;
      chunks.push({ label: `${fmtDate(monday)}-${fmtDate(sunday)}`, fromDate: monday, toDate: chunkTo });
      cursor.setDate(cursor.getDate() + 7);
    }

  } else {
    // Tháng: luôn sinh đủ 12 tháng. Tháng tương lai bar = 0, label vẫn hiện
    const year = new Date().getFullYear();
    for (let m = 0; m < 12; m++) {
      const start = new Date(year, m, 1, 0, 0, 0, 0);
      const end = new Date(year, m + 1, 0, 23, 59, 59, 999);
      // chunkTo: nếu tháng tương lai thì fromDate = toDate = start (không truy vấn dữ liệu)
      const chunkTo = start > todayEnd ? new Date(start) : end > todayEnd ? new Date(todayEnd) : end;
      chunks.push({ label: `T${m + 1}/${year}`, fromDate: start, toDate: chunkTo });
    }
  }

  return chunks;
};

// ── Items trend: tính closingStock ───────────────────────
const computeItemClosingStockAt = (toDate: Date, itemId: number): number => {
  if (!rawData.value.length) {
    const currentItem = allItems.value.find(i => i.id === itemId);
    return currentItem ? currentItem.stockQty : 0;
  }

  let baseStock: number | null = null;
  for (const day of rawData.value) {
    const found = day.items.find(i => i.itemId === itemId);
    if (found) { baseStock = found.openingStock; break; }
  }

  // Nếu không tìm thấy MỘT RECORD NÀO của item này trong suốt thời gian qua
  // -> Món này không có biến động. Tồn kho quá khứ = Tồn kho hiện tại.
  if (baseStock === null) {
    const currentItem = allItems.value.find(i => i.id === itemId);
    return currentItem ? currentItem.stockQty : 0;
  }

  let total = baseStock;
  rawData.value.filter(d => new Date(d.date) <= toDate).forEach(day => {
    const found = day.items.find(i => i.itemId === itemId);
    if (found) { total += found.totalStockIn; total -= found.totalOrdered; }
  });
  return total;
};

// ── TOTAL TREND ───────────────────────────────────────────
const loadTotalTrend = async () => {
  const chunks = generateTimeChunks();
  if (!chunks.length) { fullReportData.value = []; chartData.value = null; return; }

  const todayEnd = getTodayEnd();
  const validChunks = chunks.filter(c => c.fromDate <= todayEnd);
  
  let allStockins: any[] = [];
  let allOrders: any[] = [];

  if (validChunks.length > 0) {
    const overallFrom = validChunks[0].fromDate;
    const overallTo = validChunks[validChunks.length - 1].toDate;
    
    // Gộp tất cả các khoảng thời gian lại fetch 1 lần duy nhất để tối ưu API (N+1 problem fix)
    const [stockinsRes, ordersRes] = await Promise.all([
      stockinAPI.filterStockin(fmtAPI(overallFrom), fmtAPI(overallTo)),
      orderAPI.filterOrders({ fromDate: fmtAPI(overallFrom), toDate: fmtAPI(overallTo), status: "Completed" }),
    ]);
    allStockins = stockinsRes;
    allOrders = ordersRes;
  }

  const results = chunks.map(chunk => {
    // Tháng tương lai (fromDate > hôm nay) → trả 0
    if (chunk.fromDate > todayEnd) {
      return { label: chunk.label, fromDate: chunk.fromDate, toDate: chunk.toDate, totalIn: 0, totalOut: 0, rawStockins: [], rawOrders: [] };
    }
    
    // Phân nhỏ data theo từng chunk xử lý locally
    const chunkStockins = allStockins.filter((s: any) => {
      const d = new Date(s.stockInDate);
      return d >= chunk.fromDate && d <= chunk.toDate;
    });
    const chunkOrders = allOrders.filter((o: any) => {
      const d = new Date(o.orderDate);
      return d >= chunk.fromDate && d <= chunk.toDate;
    });

    return { 
      label: chunk.label, 
      fromDate: chunk.fromDate, 
      toDate: chunk.toDate, 
      totalIn: chunkStockins.length, 
      totalOut: chunkOrders.length,
      rawStockins: chunkStockins,
      rawOrders: chunkOrders
    };
  });

  const hasStockIn = results.some(r => r.totalIn > 0);
  const hasOrders = results.some(r => r.totalOut > 0);

  // Luôn hiển thị đủ tất cả các mốc (kể cả mốc = 0) để chart nhất quán giữa các chế độ
  fullReportData.value = results;

  chartData.value = {
    labels: results.map(r => r.label),
    datasets: [
      ...(hasStockIn ? [{ label: "Số phiếu nhập", backgroundColor: "#3b82f6", ...DS, data: results.map(r => r.totalIn) }] : []),
      ...(hasOrders ? [{ label: "Số đơn hoàn thành", backgroundColor: "#eab308", ...DS, data: results.map(r => r.totalOut) }] : []),
    ],
  };
};

// ── ITEMS TREND ───────────────────────────────────────────
const loadItemsTrend = async () => {
  // Fetch từ đầu năm để computeItemClosingStockAt luôn có đủ lịch sử mở kho
  // (nếu chỉ fetch trong range hiển thị, item không có biến động sẽ mất openingStock)
  const yearStart = fmtAPI(new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0));
  rawData.value = await itemAPI.getItemRange(yearStart, fmtAPI(toDate.value));
  buildItemsChart();
};

const buildItemsChart = () => {
  const chunks = generateTimeChunks();
  const trackedId = selectedItem.value?.id;
  if (!chunks.length || !trackedId) { fullReportData.value = []; chartData.value = null; return; }

  const todayEnd = getTodayEnd();

  fullReportData.value = chunks.map(chunk => {
    const daysInChunk = rawData.value.filter(d => {
      const date = new Date(d.date);
      return date >= chunk.fromDate && date <= chunk.toDate;
    });
    let totalIn = 0, totalOut = 0;
    daysInChunk.forEach(day => {
      const found = day.items.find(i => i.itemId === trackedId);
      if (found) { totalIn += found.totalStockIn; totalOut += found.totalOrdered; }
    });
    // Chunk thuộc tương lai → không tính tồn kho (chưa có data)
    const totalStock = chunk.fromDate > todayEnd
      ? null
      : computeItemClosingStockAt(chunk.toDate, trackedId);
    return {
      label: chunk.label,
      fromDate: chunk.fromDate,
      toDate: chunk.toDate,
      totalIn,
      totalOut,
      totalStock,
      rawDays: daysInChunk,
    };
  });

  const hasStockIn = fullReportData.value.some(r => r.totalIn > 0);
  const hasOrdered = fullReportData.value.some(r => r.totalOut > 0);

  chartData.value = {
    labels: fullReportData.value.map(r => r.label),
    datasets: [
      ...(hasStockIn ? [{ label: "Nhập bao nhiêu", backgroundColor: "#3b82f6", ...DS, data: fullReportData.value.map(r => r.totalIn) }] : []),
      ...(hasOrdered ? [{ label: "Sử dụng bao nhiêu", backgroundColor: "#eab308", ...DS, data: fullReportData.value.map(r => r.totalOut) }] : []),
      { label: "Còn lại (Tồn kho)", backgroundColor: "#10b981", ...DS, data: fullReportData.value.map(r => r.totalStock) },
    ],
  };
};

// ── Load ──────────────────────────────────────────────────
const loadReportData = async () => {
  loading.value = true;
  selectedChartData.value = []; selectedChunkLabel.value = ""; detailClickedCol.value = "";
  try {
    if (selectedTrend.value === "Total trend") await loadTotalTrend();
    else await loadItemsTrend();
  } catch (err) {
    console.error("Failed to load report:", err);
  } finally {
    loading.value = false;
  }
};

// ── Chart click ───────────────────────────────────────────
const onChartClick = async (event: any, elements: any[], chart: any) => {
  if (!elements.length) return;

  // Với mode="index", elements chứa tất cả dataset ở cùng x
  // Cần lấy đúng element được click (intersect=true để lấy bar đúng)
  const exactElements = chart.getElementsAtEventForMode(
    event.native ?? event,
    "nearest",
    { intersect: true },
    false,
  );
  const dataIndex = elements[0].index;
  const datasetIndex = exactElements.length ? exactElements[0].datasetIndex : elements[0].datasetIndex;

  const clickedChunk = fullReportData.value[dataIndex];
  if (!clickedChunk) return;

  selectedChunkLabel.value = clickedChunk.label;
  const label = chartData.value?.datasets?.[datasetIndex]?.label ?? "";

  if (selectedTrend.value === "Total trend") {
    selectedChartData.value = [];
    // Sử dụng data lấy được từ lúc init thay vì gọi lại API
    if (label.includes("phiếu") || label.includes("nhập")) {
      detailClickedCol.value = "stockin";
      selectedChartData.value = clickedChunk.rawStockins || [];
    } else if (label.includes("đơn") || label.includes("hoàn thành")) {
      detailClickedCol.value = "order";
      selectedChartData.value = clickedChunk.rawOrders || [];
    }
  } else {
    detailClickedCol.value = "items";
    const trackedId = selectedItem.value?.id;
    const isStockInCol = label.includes("Nhập");
    const isOrderCol = label.includes("Sử dụng");
    const itemMap = new Map<number, any>();
    clickedChunk.rawDays?.forEach((day: DailyMovement) => {
      day.items.forEach((d: DailyMovementItem) => {
        if (d.itemId !== trackedId) return;
        if (!itemMap.has(d.itemId)) itemMap.set(d.itemId, { itemId: d.itemId, itemName: d.itemName, item: d.item, totalStockIn: 0, totalOrdered: 0, stockQty: d.closingStock });
        const entry = itemMap.get(d.itemId)!;
        entry.totalStockIn += d.totalStockIn; entry.totalOrdered += d.totalOrdered; entry.stockQty = d.closingStock;
      });
    });
    let result = Array.from(itemMap.values());
    if (isStockInCol) result = result.filter(d => d.totalStockIn > 0);
    else if (isOrderCol) result = result.filter(d => d.totalOrdered > 0);
    selectedChartData.value = result;
  }
};

// ── Event handlers ────────────────────────────────────────
const onTimeTabClick = (opt: string) => {
  if (selectedTime.value === opt) return;
  selectedTime.value = opt;
  selectedChartData.value = []; selectedChunkLabel.value = ""; detailClickedCol.value = "";
  if (opt === "Tháng") {
    const today = new Date();
    fromDate.value = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
    toDate.value = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    const range = getDefaultRange(opt);
    fromDate.value = range.from; toDate.value = range.to;
  }
  loadReportData();
};

const onTimeChange = () => {
  selectedChartData.value = []; selectedChunkLabel.value = ""; detailClickedCol.value = "";
  if (selectedTime.value === "Tháng") {
    const today = new Date();
    fromDate.value = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
    toDate.value = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    const range = getDefaultRange(selectedTime.value);
    fromDate.value = range.from; toDate.value = range.to;
  }
  loadReportData();
};

const onRangeChange = () => {
  if (!fromDate.value || !toDate.value || fromDate.value > toDate.value) return;
  selectedChartData.value = []; selectedChunkLabel.value = ""; detailClickedCol.value = "";
  loadReportData();
};

const onResetRange = () => {
  selectedTime.value = "Tuần";
  const range = getDefaultRange("Tuần");
  fromDate.value = range.from; toDate.value = range.to;
  selectedChartData.value = []; selectedChunkLabel.value = ""; detailClickedCol.value = "";
  loadReportData();
};

const onTrendChange = () => {
  selectedChartData.value = []; selectedChunkLabel.value = ""; detailClickedCol.value = "";
  loadReportData();
};

const onItemChange = () => {
  selectedChartData.value = []; selectedChunkLabel.value = ""; detailClickedCol.value = "";
  buildItemsChart();
};

// ── Chart options ─────────────────────────────────────────
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 500, easing: "easeOutQuart" },
  plugins: {
    centerLoneBars: {},   // kích hoạt plugin căn giữa cột đơn lẻ
    legend: {
      display: true,
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 24,
        font: { family: "'Inter', sans-serif", size: 13, weight: "600" },
      },
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      titleFont: { size: 13, family: "'Inter', sans-serif", weight: "700" },
      bodyFont: { size: 13, family: "'Inter', sans-serif" },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx: any) => {
          if (ctx.parsed.y === 0 || ctx.parsed.y === null) return null as any;
          const label = ctx.dataset.label || "";
          const val = new Intl.NumberFormat("vi-VN").format(ctx.parsed.y);
          return ` ${label}: ${val}`;
        },
      },
    },
  },
  scales: {
    x: {
      stacked: false,
      offset: true,
      grid: { display: false },
      ticks: {
        maxRotation: 45,
        minRotation: 0,
        font: { family: "'Inter', sans-serif", size: 11 },
        autoSkip: true,
        maxTicksLimit: 20,
      },
    },
    y: {
      beginAtZero: true,
      stacked: false,
      grid: { color: "#f1f5f9", borderDash: [4, 4] },
      ticks: { font: { family: "'Inter', sans-serif", size: 11 } },
    },
  },
  interaction: {
    mode: "index" as const,
    axis: "x" as const,
    intersect: false,
  },
  onClick: onChartClick,
});

// ── Lifecycle ─────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener("resize", handleResize);
  const items = await itemAPI.getAll();
  allItems.value = items;
  selectedItem.value = items[0] ?? null;
  const range = getDefaultRange("Tuần");
  fromDate.value = range.from; toDate.value = range.to;
  await loadReportData();
});

onUnmounted(() => { window.removeEventListener("resize", handleResize); });
</script>

<style scoped>
/* ── Card wrapper ─────────────────────────────────────── */
.chart-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
}

.chart-wrapper {
  padding: 1.25rem 1.5rem;
}

/* ── Header ───────────────────────────────────────────── */
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.chart-title .pi {
  color: #64748b;
  font-size: 1rem;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.divider-v {
  width: 1px;
  height: 1.5rem;
  background: #cbd5e1;
  margin: 0 0.25rem;
}

/* ── Filter bar ───────────────────────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  padding: 0.5rem 0.875rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1.25rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
}

.filter-arrow {
  color: #cbd5e1;
  font-size: 0.7rem;
}

.filter-separator {
  width: 1px;
  height: 1.25rem;
  background: #e2e8f0;
  margin: 0 0.125rem;
}

/* ── Time tabs (Ngày / Tuần / Tháng) ─────────────────── */
.time-tabs {
  display: flex;
  gap: 2px;
  background: #e2e8f0;
  padding: 2px;
  border-radius: 8px;
}

.time-tab {
  padding: 0.3rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
  line-height: 1.4;
}

.time-tab:hover {
  color: #334155;
  background: #f1f5f9;
}

.time-tab.active {
  background: #fff;
  color: #2563eb;
  box-shadow: 0 1px 3px rgba(0,0,0,.1);
}

/* ── Reset button ─────────────────────────────────────── */
.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.reset-btn:hover {
  background: #f1f5f9;
  color: #334155;
  border-color: #cbd5e1;
}

.reset-btn .pi {
  font-size: 0.75rem;
}

/* ── Item dropdown ────────────────────────────────────── */
.item-dropdown {
  width: 15rem;
}

.dropdown-value {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  max-width: 12rem;
  overflow: hidden;
}

.dropdown-value .pi {
  font-size: 0.75rem;
  color: #64748b;
  flex-shrink: 0;
}

.dropdown-option {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.option-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.option-meta {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* ── Loading state ────────────────────────────────────── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 5rem 0;
}

.loading-text {
  font-size: 0.875rem;
  color: #94a3b8;
  font-weight: 500;
}

/* ── Chart area ───────────────────────────────────────── */
.chart-area {
  background: #fff;
  border-radius: 10px;
  height: 400px;
}

/* ── Detail section ───────────────────────────────────── */
.detail-section {
  margin-top: 1.75rem;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.detail-period {
  font-size: 0.875rem;
  font-weight: 400;
  color: #64748b;
}

.detail-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
}

.badge-blue  { background: #dbeafe; color: #1d4ed8; }
.badge-yellow { background: #fef9c3; color: #a16207; }
.badge-green { background: #d1fae5; color: #065f46; }

.detail-table {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

:deep(.detail-table .p-datatable-thead > tr > th) {
  background: #f8fafc;
}

.table-empty {
  text-align: center;
  padding: 1.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

/* ── Calendar & SelectButton overrides ───────────────── */
:deep(.report-calendar .p-inputtext) {
  font-size: 0.8125rem;
  padding: 0.3rem 0.5rem;
  width: 8rem;
  border-radius: 7px;
}

:deep(.report-calendar .p-datepicker-trigger) {
  padding: 0.3rem 0.45rem;
}

:deep(.report-calendar .p-datepicker-dropdown) {
  padding: 0.45rem;
}

:deep(.report-calendar) {
  display: flex;
  align-items: center;
}

:deep(.trend-select .p-button) {
  padding: 0.4rem 1rem;
  font-weight: 600;
  font-size: 0.8125rem;
}
</style>