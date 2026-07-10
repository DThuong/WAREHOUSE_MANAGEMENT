<template>
  <MainLayout>
    <div class="page-gradient-bg">
    <div class="animate-fade-in">
      <!-- 3 report cards -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <template #content>
            <div style="text-align: left; padding: 2rem">
              <i class="pi pi-cart-arrow-down" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem">{{ t("reports.import.title") }}</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem">{{ t("reports.import.description") }}</p>
              <Button :label="t('reports.viewReport')" outlined @click="navigateToReport('stockin')" />
            </div>
          </template>
        </Card>
        <Card>
          <template #content>
            <div style="text-align: left; padding: 2rem">
              <i class="pi pi-shopping-cart" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem">{{ t("reports.order.title") }}</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem">{{ t("reports.order.description") }}</p>
              <Button :label="t('reports.viewReport')" outlined @click="navigateToReport('orders')" />
            </div>
          </template>
        </Card>
        <Card>
          <template #content>
            <div style="text-align: left; padding: 2rem">
              <i class="pi pi-box" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem">{{ t("reports.inventory.title") }}</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem">{{ t("reports.inventory.description") }}</p>
              <Button :label="t('reports.viewReport')" outlined @click="navigateToReport('inventory')" />
            </div>
          </template>
        </Card>
      </div>

      <!-- FILTER BAR (TOP) -->
      <Card v-if="!isMobile" class="mb-6">
        <template #content>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <i class="pi pi-filter text-slate-500"></i>
                <span class="font-semibold text-slate-700">Bộ lọc:</span>
              </div>
              <Dropdown
                v-model="selectedArea" :options="areaOptions" optionLabel="label" optionValue="value"
                class="w-40" style="height: 40px; display: flex; align-items: center;" @change="onAreaChange"
              />
              
              <div class="divider-v" style="width: 1px; height: 24px; background: #e2e8f0;"></div>
              
              <div class="flex items-center bg-slate-100 rounded-lg p-1! gap-1" style="height: 40px;">
                <button
                  v-for="opt in timeOptions" :key="opt"
                  :class="['w-24 h-full text-sm font-medium rounded-md transition-colors flex items-center justify-center', selectedTime === opt ? 'bg-white shadow text-primary' : 'text-slate-600 hover:bg-slate-200']"
                  @click="onTimeTabClick(opt)"
                >{{ opt === '1 ngày' ? t('reports.chart.period1') : opt === '7 ngày' ? t('reports.chart.period7') : opt === '30 ngày' ? t('reports.chart.period30') : t('reports.chart.periodAll') }}</button>
              </div>

              <div class="divider-v" style="width: 1px; height: 24px; background: #e2e8f0;"></div>

              <div class="flex items-center gap-2" style="height: 40px;">
                <Button icon="pi pi-chevron-left" text rounded severity="secondary" @click="prevPeriod" :disabled="selectedTime === 'Tất cả'" style="width: 40px; height: 40px;" />
                <span class="font-bold text-slate-700 min-w-[150px] text-center" v-html="periodLabel"></span>
                <Button icon="pi pi-chevron-right" text rounded severity="secondary" @click="nextPeriod" :disabled="isNextDisabled" style="width: 40px; height: 40px;" />
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Button outlined severity="secondary" icon="pi pi-refresh" :label="t('reports.chart.reset')" @click="onResetRange" style="height: 40px;" />
              <Button
                icon="pi pi-file-excel"
                :label="'Excel'"
                severity="success"
                outlined
                :loading="exporting"
                @click="onExportExcel"
                style="height: 40px;"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Summary Cards -->
      <div v-if="!isMobile && !loading" class="summary-cards mb-6">
        <div class="summary-card summary-card-blue">
          <div class="summary-icon"><i class="pi pi-cart-arrow-down"></i></div>
          <div class="summary-info">
            <div class="summary-value">{{ summaryData.stockinCount }} <span class="summary-unit">phiếu</span></div>
            <div class="summary-money">{{ formatCurrency(summaryData.stockinValue) }}</div>
            <div class="summary-label">Tổng nhập kho</div>
          </div>
        </div>
        <div class="summary-card summary-card-yellow">
          <div class="summary-icon"><i class="pi pi-shopping-cart"></i></div>
          <div class="summary-info">
            <div class="summary-value">{{ summaryData.orderCount }} <span class="summary-unit">đơn</span></div>
            <div class="summary-money">{{ formatCurrency(summaryData.orderValue) }}</div>
            <div class="summary-label">Tổng đơn hàng</div>
          </div>
        </div>
        <div class="summary-card summary-card-green">
          <div class="summary-icon"><i class="pi pi-box"></i></div>
          <div class="summary-info">
            <div class="summary-value">{{ summaryData.totalItems }} <span class="summary-unit">loại</span></div>
            <div class="summary-money">{{ formatNumber(summaryData.totalQty) }} sản phẩm</div>
            <div class="summary-label">Tổng SP nhập</div>
          </div>
        </div>
      </div>

      <!-- BAR CHART -->
      <Card v-if="!isMobile" class="mb-6 chart-card">
        <template #content>
          <div class="chart-wrapper">
            <!-- Row 1: Title -->
            <div class="chart-header">
              <h3 class="chart-title">
                <i class="pi pi-chart-bar"></i>
                Phân tích Tồn kho
              </h3>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="loading-state" style="min-height: 400px">
              <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="4" />
              <span class="loading-text">{{ t('reports.chart.loading') }}</span>
            </div>

            <div v-else>
              <!-- Chart -->
              <div class="chart-area">
                <Chart type="bar" :data="chartData" :options="chartOptions" :plugins="[centerLoneBarsPlugin]" style="height: 100%; width: 100%" @click="onChartClick" />
              </div>

              <!-- Detail table -->
              <div v-if="selectedChartData.length > 0 || detailLoading" class="detail-section animate-fade-in">
                <div class="detail-header">
                  <h4 class="detail-title">
                    {{ t('reports.chart.detailTitle') }}
                    <span class="detail-period">{{ selectedChunkLabel }}</span>
                    <span v-if="detailClickedCol" class="detail-badge"
                      :class="{
                        'badge-blue': detailClickedCol === 'stockin',
                        'badge-yellow': detailClickedCol === 'order',
                        'badge-green': detailClickedCol === 'items',
                      }">
                      {{ detailClickedCol === 'stockin' 
                        ? t('reports.chart.badge.stockin') 
                        : detailClickedCol === 'order' 
                          ? t('reports.chart.badge.order') 
                          : t('reports.chart.badge.items') 
                      }}
                    </span>
                  </h4>
                  <Button icon="pi pi-times" rounded text severity="secondary" size="small" @click="selectedChartData = []; detailClickedCol = ''" />
                </div>

                <div v-if="detailLoading" class="flex justify-center py-8">
                  <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="4" />
                </div>

                <!-- Total trend: Phiếu nhập — CÓ GIÁ TIỀN -->
                <DataTable v-if="detailClickedCol === 'stockin'"
                  :value="selectedChartData"
                  class="p-datatable-sm detail-table"
                  responsiveLayout="scroll" stripedRows :paginator="selectedChartData.length > 10" :rows="10" :rowsPerPageOptions="[10, 25, 50]">
                  <template #empty><div class="table-empty">{{ t('reports.chart.empty.stockin') }}</div></template>
                  <Column :header="t('reports.chart.col.receiptCode')" style="width: 90px">
                    <template #body="{ data }"><span class="font-bold text-blue-600">#{{ data.id }}</span></template>
                  </Column>
                  <Column :header="t('reports.chart.col.importDate')"><template #body="{ data }">{{ formatDate(data.stockInDate) }}</template></Column>
                  <Column :header="t('reports.chart.col.creator')"><template #body="{ data }">{{ data.account?.username || "-" }}</template></Column>
                  <Column :header="t('reports.chart.col.productTypeCount')">
                    <template #body="{ data }"><div class="font-semibold text-slate-700">{{ data.stockInDetails?.length || 0 }} {{ t('common.categoryItemCount') }}</div></template>
                  </Column>
                  <Column :header="t('reports.chart.col.totalQty')">
                    <template #body="{ data }"><div class="font-semibold text-slate-700">{{ calcStockinTotalQty(data) }}</div></template>
                  </Column>
                  <Column :header="t('reports.chart.col.totalValue')">
                    <template #body="{ data }">
                      <div class="font-bold text-emerald-600">{{ formatCurrency(calcStockinTotalValue(data)) }}</div>
                    </template>
                  </Column>
                  <Column :header="t('common.action')" style="width: 70px">
                    <template #body="{ data }">
                      <Button
                        icon="pi pi-eye"
                        text rounded severity="info" size="small"
                        @click="openStockinDetail(data)"
                      />
                    </template>
                  </Column>
                  <!-- Footer with chunk totals -->
                  <template #footer>
                    <div class="detail-footer">
                      <span class="detail-footer-label">{{ t('reports.chart.totalSum') }}</span>
                      <span class="detail-footer-count">{{ t('reports.chart.receiptCount', { count: selectedChartData.length }) }}</span>
                      <span class="detail-footer-value">{{ formatCurrency(selectedChartData.reduce((s: number, d: any) => s + calcStockinTotalValue(d), 0)) }}</span>
                    </div>
                  </template>
                </DataTable>

                <!-- Total trend: Đơn hoàn thành — CÓ GIÁ TIỀN -->
                <DataTable v-else-if="detailClickedCol === 'order'"
                  :value="selectedChartData"
                  class="p-datatable-sm detail-table"
                  responsiveLayout="scroll" stripedRows :paginator="selectedChartData.length > 10" :rows="10" :rowsPerPageOptions="[10, 25, 50]">
                  <template #empty><div class="table-empty">{{ t('reports.chart.empty.order') }}</div></template>
                  <Column :header="t('reports.chart.col.orderCode')" style="width: 90px">
                    <template #body="{ data }"><span class="font-bold text-yellow-600">#{{ data.id }}</span></template>
                  </Column>
                  <Column :header="t('reports.chart.col.orderDate')"><template #body="{ data }">{{ formatDate(data.orderDate) }}</template></Column>
                  <Column :header="t('reports.chart.col.orderer')"><template #body="{ data }">{{ data.nameWorker || data.account?.username || "-" }}</template></Column>
                  <Column :header="t('reports.chart.col.department')"><template #body="{ data }">{{ data.account?.department || "-" }}</template></Column>
                  <Column :header="t('reports.chart.col.productTypeCount')">
                    <template #body="{ data }"><div class="font-semibold text-slate-700">{{ data.orderDetails?.length || 0 }} {{ t('common.categoryItemCount') }}</div></template>
                  </Column>
                  <Column :header="t('reports.chart.col.totalQty')">
                    <template #body="{ data }"><div class="font-semibold text-slate-700">{{ calcOrderTotalQty(data) }}</div></template>
                  </Column>
                  <Column :header="t('reports.chart.col.totalValue')">
                    <template #body="{ data }">
                      <div class="font-bold text-emerald-600">{{ formatCurrency(calcOrderTotalValue(data)) }}</div>
                    </template>
                  </Column>
                  <Column :header="t('common.action')" style="width: 70px">
                    <template #body="{ data }">
                      <Button
                        icon="pi pi-eye"
                        text rounded severity="info" size="small"
                        @click="openOrderDetail(data)"
                      />
                    </template>
                  </Column>
                  <template #footer>
                    <div class="detail-footer">
                      <span class="detail-footer-label">{{ t('reports.chart.totalSum') }}</span>
                      <span class="detail-footer-count">{{ t('reports.chart.orderCount', { count: selectedChartData.length }) }}</span>
                      <span class="detail-footer-value">{{ formatCurrency(selectedChartData.reduce((s: number, d: any) => s + calcOrderTotalValue(d), 0)) }}</span>
                    </div>
                  </template>
                </DataTable>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
    </div>

    <!-- Mobile dialog -->
    <Dialog v-model:visible="showUnsupportedDialog" :modal="true" :draggable="false" :style="{ width: '85vw', maxWidth: '320px' }" :showHeader="false" :closable="false">
      <div style="text-align: left; padding: 1.5rem 1rem">
        <i class="pi pi-mobile" style="font-size: 2.5rem; color: #f59e0b; margin-bottom: 1rem; display: block"></i>
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b">{{ t("reports.mobileNotSupported.title") }}</h3>
        <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5">{{ t("reports.mobileNotSupported.description") }}</p>
        <Button :label="t('common.close')" style="width: 100%" @click="showUnsupportedDialog = false" />
      </div>
    </Dialog>

    <!-- Stockin Detail Dialog -->
    <Dialog
      v-model:visible="showStockinDetail"
      :header="detailStockin ? t('importManagement.detailDialog.header', { id: detailStockin.id }) : t('importManagement.title')"
      :style="{ width: '800px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
    >
      <div v-if="detailDialogLoading" class="flex justify-center py-8">
        <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
      </div>
      <div v-else-if="detailStockin" class="mt-2">
        <div class="grid grid-cols-2 gap-4 mb-4 p-4! bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ t('importManagement.detailDialog.stockInDate') }}</p>
            <p class="font-semibold">{{ formatDate(detailStockin.stockInDate) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ t('importManagement.detailDialog.createdBy') }}</p>
            <p class="font-semibold">{{ detailStockin.account?.username || "-" }}</p>
          </div>
          <div class="col-span-2">
            <p class="text-sm text-gray-500 mb-1">{{ t('importManagement.detailDialog.note') }}</p>
            <p>{{ detailStockin.note || "-" }}</p>
          </div>
        </div>

        <h4 class="font-semibold mb-3">
          {{ t('importManagement.detailDialog.productList', { count: detailStockin.stockInDetails?.length || 0 }) }}
        </h4>
        
        <DataTable :value="detailStockin.stockInDetails" class="p-datatable-sm" responsiveLayout="scroll">
          <Column :header="t('common.product')">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <img
                  v-if="data.item?.picture?.length"
                  :src="getItemImageUrl(data.item.picture[0])"
                  class="w-10 h-10 rounded object-cover"
                />
                <div v-else class="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                  <i class="pi pi-image text-gray-400"></i>
                </div>
                <div>
                  <p class="font-semibold text-sm">{{ getItemName(data.item) }}</p>
                  <p class="text-xs text-gray-500">{{ data.item?.type || "-" }}</p>
                </div>
              </div>
            </template>
          </Column>
          <Column :header="t('reports.chart.col.unitPrice')">
            <template #body="{ data }">
              <span class="font-medium">{{ formatCurrency(parseFloat(data.price || data.item?.price || "0")) }}</span>
            </template>
          </Column>
          <Column field="quantity" :header="t('common.quantity')">
            <template #body="{ data }">
              <span class="font-medium text-emerald-600">+{{ data.quantity }} {{ data.item?.unit || "" }}</span>
            </template>
          </Column>
          <Column :header="t('reports.chart.col.totalAmount')">
            <template #body="{ data }">
              <div class="font-bold text-emerald-600">{{ formatCurrency(data.quantity * parseFloat(data.price || data.item?.price || "0")) }}</div>
            </template>
          </Column>
        </DataTable>

        <!-- Total -->
        <div class="mt-4! p-3! bg-blue-50 rounded-lg border border-blue-200 flex justify-between items-center">
          <span class="font-semibold text-slate-700">{{ t('reports.chart.totalStockinValue') }}</span>
          <span class="text-lg font-bold text-blue-700">{{ formatCurrency(calcStockinTotalValue(detailStockin)) }}</span>
        </div>
      </div>
      <template #footer>
        <Button :label="t('common.close')" icon="pi pi-times" text @click="showStockinDetail = false" />
      </template>
    </Dialog>

    <!-- Order Detail Dialog -->
    <Dialog
      v-model:visible="showOrderDetail"
      :header="detailOrder ? `${t('orderManagement.orders')} #${detailOrder.id}` : t('orderManagement.orderDetail.title')"
      :style="{ width: '800px' }"
      :breakpoints="{ '768px': 'calc(100vw - 2rem)' }"
      :modal="true"
    >
      <div v-if="detailDialogLoading" class="flex justify-center py-8">
        <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
      </div>
      <div v-else-if="detailOrder" class="mt-2">
        <div class="grid grid-cols-2 gap-4 mb-4 p-4! bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ t('orderManagement.orderDetail.orderDate') }}</p>
            <p class="font-semibold">{{ formatDate(detailOrder.orderDate) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ t('orderManagement.orderDetail.orderedBy') }}</p>
            <p class="font-semibold">{{ detailOrder.nameWorker || detailOrder.account?.username || "-" }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ t('orderManagement.orderDetail.department') }}</p>
            <p class="font-semibold">{{ detailOrder.account?.department || "-" }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ t('orderManagement.orderDetail.status') }}</p>
            <Chip
              :label="detailOrder.status ? t(`orderManagement.${detailOrder.status.toLowerCase()}`) : ''"
              style="background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; font-weight: 600"
            />
          </div>
        </div>

        <h4 class="font-semibold mb-3">
          {{ t('orderManagement.orderDetail.productList') }} ({{ detailOrder.orderDetails?.length || 0 }})
        </h4>

        <DataTable :value="detailOrder.orderDetails" class="p-datatable-sm" responsiveLayout="scroll">
          <Column :header="t('common.product')">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <img
                  v-if="data.item?.picture?.length"
                  :src="getItemImageUrl(data.item.picture[0])"
                  class="w-10 h-10 rounded object-cover"
                />
                <div v-else class="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                  <i class="pi pi-image text-gray-400"></i>
                </div>
                <div>
                  <p class="font-semibold text-sm">{{ getItemName(data.item) }}</p>
                  <p class="text-xs text-gray-500">{{ data.item?.itemIndentifyId || "-" }}</p>
                </div>
              </div>
            </template>
          </Column>
          <Column :header="t('reports.chart.col.unitPrice')">
            <template #body="{ data }">
              <span class="font-medium">{{ formatCurrency(parseFloat(data.item?.price || "0")) }}</span>
            </template>
          </Column>
          <Column field="orderQty" :header="t('common.quantity')">
            <template #body="{ data }">
              <span class="font-medium">{{ data.orderQty }} {{ data.item?.unit || "" }}</span>
            </template>
          </Column>
          <Column :header="t('reports.chart.col.totalAmount')">
            <template #body="{ data }">
              <div class="font-bold text-emerald-600">{{ formatCurrency(data.orderQty * parseFloat(data.item?.price || "0")) }}</div>
            </template>
          </Column>
          <Column :header="t('common.form.purposeNote')">
            <template #body="{ data }">
              <span class="text-sm text-gray-600">{{ data.note || "-" }}</span>
            </template>
          </Column>
        </DataTable>
        <!-- Total -->
        <div class="mt-4 p-3! bg-yellow-50 rounded-lg border border-yellow-200 flex justify-between items-center">
          <span class="font-semibold text-slate-700">{{ t('reports.chart.totalOrderValue') }}</span>
          <span class="text-lg font-bold text-yellow-700">{{ formatCurrency(calcOrderTotalValue(detailOrder)) }}</span>
        </div>
      </div>
      <template #footer>
        <Button :label="t('common.close')" icon="pi pi-times" text @click="showOrderDetail = false" />
      </template>
    </Dialog>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
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
import Chip from "primevue/chip";
import { useI18n } from "vue-i18n";
import { itemAPI } from "@/services/itemAPI";
import { stockinAPI } from "@/services/stockinAPI";
import { orderAPI } from "@/services/orderAPI";
import type { Item, DailyMovement, DailyMovementItem } from "@/types/item.types";
import { useDashboardStore, type AreaKey } from "@/stores/dashboard";

const router = useRouter();
const dashboardStore = useDashboardStore();
const { t } = useI18n();
const selectedArea = ref<AreaKey>("ALL");
const areaOptions = [
  { label: t("reports.common.areaAll"), value: "ALL" as AreaKey },
  { label: "SMD", value: "SMD" as AreaKey },
  { label: "MAINLINE", value: "MAINLINE" as AreaKey },
];
const showStockinDetail = ref(false);
const showOrderDetail = ref(false);
const detailStockin = ref<any>(null);
const detailOrder = ref<any>(null);
const detailDialogLoading = ref(false);
const exporting = ref(false);

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
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
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

// ── Price calculators ─────────────────────────────────────
const calcStockinTotalQty = (stockin: any): number => {
  return (stockin.stockInDetails || []).reduce((sum: number, d: any) => sum + (d.quantity || 0), 0);
};
const calcStockinTotalValue = (stockin: any): number => {
  return (stockin.stockInDetails || []).reduce((sum: number, d: any) => {
    const price = parseFloat(d.price || d.item?.price || "0");
    return sum + (d.quantity || 0) * price;
  }, 0);
};
const calcOrderTotalQty = (order: any): number => {
  return (order.orderDetails || []).reduce((sum: number, d: any) => sum + (d.orderQty || 0), 0);
};
const calcOrderTotalValue = (order: any): number => {
  return (order.orderDetails || []).reduce((sum: number, d: any) => {
    const price = parseFloat(d.item?.price || "0");
    return sum + (d.orderQty || 0) * price;
  }, 0);
};

const openStockinDetail = async (stockin: any) => {
  detailDialogLoading.value = true;
  showStockinDetail.value = true;
  try {
    detailStockin.value = await stockinAPI.getStockinById(stockin.id);
  } catch {
    detailStockin.value = stockin;
  } finally {
    detailDialogLoading.value = false;
  }
};

const openOrderDetail = async (order: any) => {
  detailDialogLoading.value = true;
  showOrderDetail.value = true;
  try {
    detailOrder.value = await orderAPI.getById(order.id);
  } catch {
    detailOrder.value = order;
  } finally {
    detailDialogLoading.value = false;
  }
};

const getItemImageUrl = (filename: string) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${import.meta.env.WAREHOUSE_URL}/api/Item/image/${filename}`;
};

const getItemName = (item: any) =>
  item?.eng?.partname || item?.com?.name || "Unknown";


// ── Today boundary ────────────────────────────────────────
const getTodayEnd = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

// ── Dataset config ────────────────────────────────────────
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

const timeOptions = ["1 ngày", "7 ngày", "30 ngày", "Tất cả"];
const selectedTime = ref("1 ngày");

const fullReportData = ref<any[]>([]);
const chartData = ref<any>(null);
const selectedChartData = ref<any[]>([]);
const selectedChunkLabel = ref("");
const fromDate = ref<Date>(new Date());
const toDate = ref<Date>(new Date());



const centerLoneBarsPlugin = {
  id: 'centerLoneBars',
  beforeDatasetsDraw(chart: any) {
    const meta0 = chart.getDatasetMeta(0);
    const meta1 = chart.getDatasetMeta(1);
    if (!meta0 || !meta1 || meta0.hidden || meta1.hidden) return;
    
    for (let i = 0; i < meta0.data.length; i++) {
      const bar0 = meta0.data[i];
      const bar1 = meta1.data[i];
      if (!bar0 || !bar1) continue;

      const val0 = chart.data.datasets[0].data[i];
      const val1 = chart.data.datasets[1].data[i];
      
      const hasVal0 = val0 && val0 > 0;
      const hasVal1 = val1 && val1 > 0;
      
      if (hasVal0 && !hasVal1) {
        bar0.x = chart.scales.x.getPixelForTick(i);
      } else if (!hasVal0 && hasVal1) {
        bar1.x = chart.scales.x.getPixelForTick(i);
      }
    }
  }
};

const periodLabel = computed(() => {
  if (selectedTime.value === "Tất cả") return "Tất cả";
  if (selectedTime.value === "1 ngày") return `${fmtDate(fromDate.value)}`;
  return `${fmtDate(fromDate.value)} - ${fmtDate(toDate.value)}`;
});

const isNextDisabled = computed(() => {
  const todayEnd = getTodayEnd();
  return toDate.value >= todayEnd || selectedTime.value === "Tất cả";
});

const prevPeriod = () => {
  if (selectedTime.value === "Tất cả") return;
  const days = selectedTime.value === "1 ngày" ? 1 : selectedTime.value === "7 ngày" ? 7 : 30;
  const newFrom = new Date(fromDate.value);
  const newTo = new Date(toDate.value);
  newFrom.setDate(newFrom.getDate() - days);
  newTo.setDate(newTo.getDate() - days);
  fromDate.value = newFrom;
  toDate.value = newTo;
  loadReportData();
};

const nextPeriod = () => {
  if (isNextDisabled.value || selectedTime.value === "Tất cả") return;
  const days = selectedTime.value === "7 ngày" ? 7 : 30;
  const newFrom = new Date(fromDate.value);
  const newTo = new Date(toDate.value);
  newFrom.setDate(newFrom.getDate() + days);
  newTo.setDate(newTo.getDate() + days);
  
  const todayEnd = getTodayEnd();
  if (newTo > todayEnd) {
    const diff = newTo.getTime() - todayEnd.getTime();
    newTo.setTime(todayEnd.getTime());
    newFrom.setTime(newFrom.getTime() - diff);
  }
  fromDate.value = newFrom;
  toDate.value = newTo;
  loadReportData();
};

// ── Summary ───────────────────────────────────────────────
const summaryData = computed(() => {
  let stockinCount = 0, stockinValue = 0, orderCount = 0, orderValue = 0, totalItems = 0, totalQty = 0;
  for (const chunk of fullReportData.value) {
    const stockins = chunk.rawStockins || [];
    const orders = chunk.rawOrders || [];
    stockinCount += stockins.length;
    orderCount += orders.length;
    for (const s of stockins) {
      stockinValue += calcStockinTotalValue(s);
      totalQty += calcStockinTotalQty(s);
      totalItems += (s.stockInDetails?.length || 0);
    }
    for (const o of orders) {
      orderValue += calcOrderTotalValue(o);
    }
  }
  return { stockinCount, stockinValue, orderCount, orderValue, totalItems, totalQty };
});

// ── Default range ─────────────────────────────────────────
const getDefaultRange = (type: string) => {
  const today = new Date();
  if (type === "1 ngày") {
    const from = new Date(today); from.setHours(0, 0, 0, 0);
    const to = new Date(today); to.setHours(23, 59, 59, 999);
    return { from, to };
  } else if (type === "7 ngày") {
    const from = new Date(today); from.setDate(today.getDate() - 6); from.setHours(0, 0, 0, 0);
    const to = new Date(today); to.setHours(23, 59, 59, 999);
    return { from, to };
  } else if (type === "30 ngày") {
    const from = new Date(today); from.setDate(today.getDate() - 29); from.setHours(0, 0, 0, 0);
    const to = new Date(today); to.setHours(23, 59, 59, 999);
    return { from, to };
  } else {
    const from = new Date(today.getFullYear() - 5, 0, 1, 0, 0, 0, 0);
    const to = new Date(today); to.setHours(23, 59, 59, 999);
    return { from, to };
  }
};

// ── Generate chunks ──────────────────────────────────────
const generateTimeChunks = (
  timeType: string,
  from: Date,
  to: Date,
) => {
  const chunks: { label: string; fromDate: Date; toDate: Date }[] = [];
  const todayEnd = getTodayEnd();
  const effectiveTo = to > todayEnd ? new Date(todayEnd) : new Date(to);
  effectiveTo.setHours(23, 59, 59, 999);

  if (timeType === "1 ngày" || timeType === "7 ngày" || timeType === "30 ngày") {
    const start = new Date(from); start.setHours(0, 0, 0, 0);
    const cursor = new Date(start);
    while (cursor <= effectiveTo) {
      const s = new Date(cursor); s.setHours(0, 0, 0, 0);
      const e = new Date(cursor); e.setHours(23, 59, 59, 999);
      chunks.push({ label: fmtDate(cursor), fromDate: s, toDate: e });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else {
    // Tất cả -> group by month
    
    const startYear = from.getFullYear();
    const endYear = effectiveTo.getFullYear();
    for (let y = startYear; y <= endYear; y++) {
      for (let m = 0; m < 12; m++) {
        const start = new Date(y, m, 1, 0, 0, 0, 0);
        const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
        if (end < from) continue;
        if (start > effectiveTo) break;
        const chunkTo = end > effectiveTo ? effectiveTo : end;
        chunks.push({ label: `T${m + 1}/${y}`, fromDate: start, toDate: chunkTo });
      }
    }
  }
  return chunks;
};

// ── TOTAL TREND — TIỀN (VND) ──────────────────────────────
const loadTotalTrend = async () => {
  const chunks = generateTimeChunks(selectedTime.value, fromDate.value, toDate.value);
  if (!chunks.length) { fullReportData.value = []; chartData.value = null; return; }

  const todayEnd = getTodayEnd();
  const validChunks = chunks.filter(c => c.fromDate <= todayEnd);
  
  let allStockins: any[] = [];
  let allOrders: any[] = [];

  if (validChunks.length > 0) {
    const overallFrom = validChunks[0].fromDate;
    const overallTo = validChunks[validChunks.length - 1].toDate;
    
    const [stockinsRes, ordersRes] = await Promise.all([
      stockinAPI.filterStockin(fmtAPI(overallFrom), fmtAPI(overallTo)),
      orderAPI.filterOrders({ fromDate: fmtAPI(overallFrom), toDate: fmtAPI(overallTo), status: "Completed" }),
    ]);
    allStockins = Array.isArray(stockinsRes) ? stockinsRes : [];
    allOrders = Array.isArray(ordersRes) ? ordersRes : [];

    if (selectedArea.value !== "ALL") {
      allStockins = allStockins.filter((s: any) => dashboardStore.getStockinArea(s) === selectedArea.value);
      allOrders = allOrders.filter((o: any) => dashboardStore.getOrderArea(o) === selectedArea.value);
    }
  }

  const results = chunks.map(chunk => {
    if (chunk.fromDate > todayEnd) {
      return { label: chunk.label, fromDate: chunk.fromDate, toDate: chunk.toDate, totalInValue: 0, totalOutValue: 0, rawStockins: [], rawOrders: [] };
    }
    
    const chunkStockins = allStockins.filter((s: any) => {
      const d = new Date(s.stockInDate);
      return d.getTime() >= chunk.fromDate.getTime() && d.getTime() <= chunk.toDate.getTime();
    });
    const chunkOrders = allOrders.filter((o: any) => {
      const d = new Date(o.orderDate);
      return d >= chunk.fromDate && d <= chunk.toDate;
    });

    // Tính TỔNG TIỀN thay vì đếm số phiếu
    const totalInValue = chunkStockins.reduce((sum: number, s: any) => sum + calcStockinTotalValue(s), 0);
    const totalOutValue = chunkOrders.reduce((sum: number, o: any) => sum + calcOrderTotalValue(o), 0);

    return { 
      label: chunk.label, 
      fromDate: chunk.fromDate, 
      toDate: chunk.toDate, 
      totalInValue,
      totalOutValue,
      rawStockins: chunkStockins,
      rawOrders: chunkOrders
    };
  });

  let finalResults = results.filter(r => r.rawStockins.length > 0 || r.rawOrders.length > 0);

  if (finalResults.length === 0) {
    if (selectedTime.value === "Tất cả") {
      finalResults = results.slice(-12);
    } else {
      finalResults = results;
    }
  }

  fullReportData.value = finalResults;

  chartData.value = {
    labels: finalResults.map(r => r.label),
    datasets: [
      { label: "Tiền nhập kho (VND)", backgroundColor: "#3b82f6", ...DS, data: finalResults.map(r => r.totalInValue > 0 ? r.totalInValue : null) },
      { label: "Tiền đơn hàng (VND)", backgroundColor: "#eab308", ...DS, data: finalResults.map(r => r.totalOutValue > 0 ? r.totalOutValue : null) },
    ],
  };
};

// ── Load ──────────────────────────────────────────────────
const loadReportData = async () => {
  loading.value = true;
  selectedChartData.value = []; selectedChunkLabel.value = ""; detailClickedCol.value = "";
  try {
    await loadTotalTrend();
  } catch (err) {
    console.error("Failed to load report:", err);
  } finally {
    loading.value = false;
  }
};

// ── Chart click ───────────────────────────────────────────
const onChartClick = async (event: any, elements: any[], chart: any) => {
  if (!elements.length) return;

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

  selectedChartData.value = [];
  if (label === "Tiền nhập kho (VND)") {
    detailClickedCol.value = "stockin";
    selectedChartData.value = clickedChunk.rawStockins || [];
  } else if (label === "Tiền đơn hàng (VND)") {
    detailClickedCol.value = "order";
    selectedChartData.value = clickedChunk.rawOrders || [];
  }
};

// ── Export Excel ──────────────────────────────────────────
const onExportExcel = async () => {
  exporting.value = true;
  try {
    const area = selectedArea.value === "ALL" ? undefined : selectedArea.value;
    
    let exportFrom = fromDate.value;
    let exportTo = toDate.value;
    if (fullReportData.value && fullReportData.value.length > 0) {
      exportFrom = fullReportData.value[0].fromDate;
      exportTo = fullReportData.value[fullReportData.value.length - 1].toDate;
    }

    // Export both stockin and order
    await Promise.all([
      stockinAPI.exportExcel({
        fromDate: fmtAPI(exportFrom),
        toDate: fmtAPI(exportTo),
        areapart: area,
      }),
      orderAPI.exportExcel({
        fromDate: fmtAPI(exportFrom),
        toDate: fmtAPI(exportTo),
        status: "Completed",
        areapart: area,
      }),
    ]);
  } catch (err) {
    console.error("Export failed:", err);
  } finally {
    exporting.value = false;
  }
};

// ── Event handlers ────────────────────────────────────────
const onTimeTabClick = (opt: string) => {
  if (selectedTime.value === opt) return;
  selectedTime.value = opt;
  selectedChartData.value = []; selectedChunkLabel.value = ""; detailClickedCol.value = "";
  chartData.value = null;

  const range = getDefaultRange(opt);
  fromDate.value = range.from; toDate.value = range.to;

  loadReportData();
};

const onResetRange = () => {
  selectedTime.value = "1 ngày";
  const range = getDefaultRange("1 ngày");
  fromDate.value = range.from; toDate.value = range.to;
  selectedChartData.value = []; selectedChunkLabel.value = ""; detailClickedCol.value = "";
  loadReportData();
};

const onAreaChange = () => {
  selectedChartData.value = []; selectedChunkLabel.value = ""; detailClickedCol.value = "";
  loadReportData();
};

// ── Chart options ─────────────────────────────────────────
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 500, easing: "easeOutQuart" },
  plugins: {
    centerLoneBars: {},
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
          // Format as VND for Total trend, as number for Items trend
          if (label.includes("VND")) {
            const val = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(ctx.parsed.y);
            return ` ${label.replace(" (VND)", "")}: ${val}`;
          }
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
        autoSkip: false,
      },
    },
    y: {
      beginAtZero: true,
      stacked: false,
      grid: { color: "#f1f5f9", borderDash: [4, 4] },
      ticks: {
        font: { family: "'Inter', sans-serif", size: 11 },
        callback: function(value: any) {
          // Format Y-axis: abbreviated VND for Total trend
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
          return value;
        },
      },
    },
  },
  interaction: {
    mode: "index" as const,
    axis: "x" as const,
    intersect: false,
  },
  onClick: onChartClick,
  onHover: (event: any, elements: any[], chart: any) => {
    if (chart && chart.canvas) {
      chart.canvas.style.cursor = elements && elements.length > 0 ? "pointer" : "default";
    }
  },
});

// ── Lifecycle ─────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener("resize", handleResize);
  const items = await itemAPI.getAll();
  allItems.value = items;
  selectedItem.value = items[0] ?? null;
  const range = getDefaultRange("1 ngày");
  fromDate.value = range.from; toDate.value = range.to;
  await loadReportData();
});

onUnmounted(() => { window.removeEventListener("resize", handleResize); });
</script>

<style scoped>
:deep(.content-area) {
  padding: 0 !important;
  max-width: none !important;
  margin: 0 !important;
}

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

/* ── Summary Cards ────────────────────────────────────── */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1px solid;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,.08);
}

.summary-card-blue {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #bfdbfe;
}

.summary-card-yellow {
  background: linear-gradient(135deg, #fefce8, #fef9c3);
  border-color: #fde68a;
}

.summary-card-green {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #bbf7d0;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.summary-card-blue .summary-icon {
  background: #3b82f6;
  color: white;
}

.summary-card-yellow .summary-icon {
  background: #eab308;
  color: white;
}

.summary-card-green .summary-icon {
  background: #10b981;
  color: white;
}

.summary-info {
  flex: 1;
  min-width: 0;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

.summary-unit {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.summary-money {
  font-size: 1rem;
  font-weight: 700;
  color: #059669;
  margin-top: 2px;
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  margin-top: 2px;
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



/* ── Area dropdown ────────────────────────────────────── */
.area-dropdown {
  width: 9rem;
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
  text-align: left;
  padding: 1.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

/* ── Detail footer ────────────────────────────────────── */
.detail-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 0.75rem 0;
}

.detail-footer-label {
  font-weight: 600;
  color: #475569;
}

.detail-footer-count {
  font-size: 0.875rem;
  color: #64748b;
  padding: 0.2rem 0.6rem;
  background: #f1f5f9;
  border-radius: 6px;
}

.detail-footer-value {
  font-size: 1.125rem;
  font-weight: 800;
  color: #059669;
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