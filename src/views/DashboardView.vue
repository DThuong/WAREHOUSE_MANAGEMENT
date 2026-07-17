<template>
  <MainLayout>
    <div class="dashboard-page">
      <!-- Loading -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-card">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
      </div>

      <!-- Header -->
      <section class="dash-header">
        <div class="dash-header-text">
          <p class="hero-eyebrow">{{ t('dashboard.eyebrow') }}</p>
          <h1>{{ t('dashboard.heading') }}</h1>
          <p>{{ t('dashboard.subtitle') }}</p>
        </div>

        <div class="dash-header-actions">
          <SelectButton
            v-model="selectedAreaModel"
            :options="areaOptions"
            optionLabel="label"
            optionValue="value"
            :allowEmpty="false"
          />
          <Button
            icon="pi pi-refresh"
            :loading="loading"
            class="refresh-btn"
            @click="fetchDashboardData"
            :aria-label="t('dashboard.refresh')"
          />
        </div>
      </section>

      <!-- Alert banner -->
      <section
        v-if="alertTotal > 0"
        class="alert-banner"
        role="button"
        tabindex="0"
        @click="activeTab = 0"
        @keyup.enter="activeTab = 0"
      >
        <span class="alert-icon"><i class="pi pi-exclamation-triangle"></i></span>
        <div class="alert-text">
          <strong>{{ t('dashboard.alertBanner.title', { count: alertTotal }) }}</strong>
          <span>
            {{ t('dashboard.alertBanner.subtitle', {
              critical: current.stockStatus.critical,
              out: current.stockStatus.outOfStock,
            }) }}
          </span>
        </div>
        <span class="alert-action">
          {{ t('dashboard.alertBanner.action') }}
          <i class="pi pi-arrow-right"></i>
        </span>
      </section>

      <section v-else class="ok-banner">
        <span class="ok-icon"><i class="pi pi-check-circle"></i></span>
        <span>{{ t('dashboard.alertBanner.ok') }}</span>
      </section>

      <!-- KPI grid -->
      <section class="kpi-grid">
        <button class="kpi-card" type="button" @click="goTo('/inventory')">
          <span class="kpi-icon purple"><i class="pi pi-box"></i></span>
          <span class="kpi-label">{{ t('dashboard.kpi.totalItems') }}</span>
          <strong>{{ formatNumber(current.totalItems) }}</strong>
          <small>{{ t('dashboard.kpi.totalItemsDetail', { eng: current.engineerItems, com: current.consumerItems }) }}</small>
        </button>

        <button class="kpi-card" type="button" @click="goTo('/inventory')">
          <span class="kpi-icon green"><i class="pi pi-wallet"></i></span>
          <span class="kpi-label">{{ t('dashboard.kpi.stockValue') }}</span>
          <strong>{{ formatCurrency(current.totalStockValue) }}</strong>
          <small>{{ t('dashboard.kpi.stockValueDetail', { qty: formatNumber(current.totalStockQty) }) }}</small>
        </button>

        <button
          class="kpi-card"
          :class="{ danger: alertTotal > 0 }"
          type="button"
          @click="activeTab = 0"
        >
          <span class="kpi-icon red"><i class="pi pi-exclamation-triangle"></i></span>
          <span class="kpi-label">{{ t('dashboard.kpi.alerts') }}</span>
          <strong>{{ formatNumber(alertTotal) }}</strong>
          <small>
            {{ t('dashboard.kpi.alertsDetail', {
              critical: current.stockStatus.critical,
              out: current.stockStatus.outOfStock,
            }) }}
          </small>
        </button>

        <div class="kpi-card kpi-pending" :class="{ danger: current.pendingOrders > 0 }">
          <span
            v-if="current.pendingOrders > 0"
            class="pending-badge"
            :title="t('dashboard.kpi.pendingBadge', { count: current.pendingOrders })"
          >
            {{ current.pendingOrders }}
          </span>
          <span class="kpi-icon orange"><i class="pi pi-shopping-cart"></i></span>
          <span class="kpi-label">{{ t('dashboard.kpi.pendingOrders') }}</span>
          <strong>{{ formatNumber(current.pendingOrders) }}</strong>
          <small>{{ t('dashboard.kpi.pendingOrdersDetail', { total: formatNumber(current.totalOrders) }) }}</small>

          <div class="pending-area-links">
            <button
              type="button"
              class="pending-area-link smd"
              @click="goToPendingOrders('SMD')"
            >
              SMD
              <span class="pending-area-count">{{ formatNumber(dashboardStore.areaSummaries.SMD.pendingOrders) }}</span>
            </button>
            <button
              type="button"
              class="pending-area-link mainline"
              @click="goToPendingOrders('MAINLINE')"
            >
              MAINLINE
              <span class="pending-area-count">{{ formatNumber(dashboardStore.areaSummaries.MAINLINE.pendingOrders) }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Area comparison -->
      <section class="area-grid">
        <article
          v-for="area in areaCards"
          :key="area.key"
          class="area-card"
          :class="area.key.toLowerCase()"
        >
          <header class="area-card-header">
            <span class="area-badge" :class="area.key.toLowerCase()">{{ area.key }}</span>
            <button type="button" class="text-btn" @click="onSelectArea(area.key)">
              {{ t('dashboard.areaCard.viewDetail') }}
              <i class="pi pi-arrow-right"></i>
            </button>
          </header>

          <div class="area-card-body">
            <div class="area-stat">
              <span class="area-stat-label">{{ t('dashboard.areaCard.stockValue') }}</span>
              <strong>{{ formatCurrency(area.summary.totalStockValue) }}</strong>
            </div>
            <div class="area-stat">
              <span class="area-stat-label">{{ t('dashboard.areaCard.stockQty') }}</span>
              <strong>{{ formatNumber(area.summary.totalStockQty) }}</strong>
            </div>
            <div class="area-stat">
              <span class="area-stat-label">{{ t('dashboard.areaCard.items') }}</span>
              <strong>{{ formatNumber(area.summary.totalItems) }}</strong>
            </div>
            <div class="area-stat">
              <span class="area-stat-label">{{ t('dashboard.areaCard.alerts') }}</span>
              <strong :class="{ 'text-danger': areaAlertCount(area.summary) > 0 }">
                {{ formatNumber(areaAlertCount(area.summary)) }}
              </strong>
            </div>
          </div>

          <div class="area-card-footer">
            <span>
              <i class="pi pi-sitemap"></i>
              {{ t('dashboard.areaCard.lines', { count: area.summary.totalLines }) }}
            </span>
            <span>
              <i class="pi pi-cog"></i>
              {{ t('dashboard.areaCard.machines', { count: area.summary.totalMachines }) }}
            </span>
          </div>
        </article>
      </section>

      <!-- Tabs -->
      <section class="dash-tabs">
        <TabView v-model:activeIndex="activeTab">
          <!-- Alerts tab -->
          <TabPanel :header="t('dashboard.tabs.alerts')">
            <div class="tab-head">
              <p>{{ t('dashboard.alertsTab.description') }}</p>
              <button type="button" class="text-btn" @click="goTo('/inventory')">
                {{ t('dashboard.alertsTab.viewAll') }}
                <i class="pi pi-arrow-right"></i>
              </button>
            </div>

            <DataTable
              :value="dashboardStore.alertStockItems"
              :rows="8"
              paginator
              responsiveLayout="scroll"
              class="alert-table"
            >
              <template #empty>
                <div class="empty-state">
                  <i class="pi pi-check-circle"></i>
                  <p>{{ t('dashboard.alertsTab.empty') }}</p>
                </div>
              </template>

              <Column :header="t('dashboard.alertsTab.colItem')">
                <template #body="{ data }">
                  <div class="item-cell">
                    <img :src="data.image" :alt="data.name" />
                    <div>
                      <strong>{{ data.name }}</strong>
                      <span>{{ data.code }}</span>
                    </div>
                  </div>
                </template>
              </Column>

              <Column :header="t('dashboard.alertsTab.colArea')">
                <template #body="{ data }">
                  <span class="area-badge" :class="data.areaPart.toLowerCase()">{{ data.areaPart }}</span>
                </template>
              </Column>

              <Column :header="t('dashboard.alertsTab.colStock')">
                <template #body="{ data }">
                  {{ formatNumber(data.stockQty) }} {{ data.unit }}
                </template>
              </Column>

              <Column :header="t('dashboard.alertsTab.colSafety')">
                <template #body="{ data }">
                  {{ formatNumber(data.safetyStock) }} {{ data.unit }}
                </template>
              </Column>

              <Column :header="t('dashboard.alertsTab.colStatus')">
                <template #body="{ data }">
                  <span :class="['status-chip', data.status]">
                    {{ getStockStatusLabel(data.status) }}
                  </span>
                </template>
              </Column>
            </DataTable>
          </TabPanel>

          <!-- Activity tab -->
          <TabPanel :header="t('dashboard.tabs.activity')">
            <div class="activity-grid">
              <article class="panel list-panel">
                <div class="panel-header">
                  <div>
                    <h3>{{ t('dashboard.activity.recentOrders') }}</h3>
                    <p>{{ t('dashboard.activity.recentOrdersDesc') }}</p>
                  </div>
                  <button type="button" class="text-btn" @click="goTo('/orders')">
                    {{ t('dashboard.activity.viewAll') }}
                  </button>
                </div>

                <div v-if="dashboardStore.recentOrderStatus.length === 0" class="empty-state">
                  <i class="pi pi-list"></i>
                  <p>{{ t('dashboard.activity.noOrders') }}</p>
                </div>

                <div v-else class="simple-list">
                  <button
                    v-for="order in dashboardStore.recentOrderStatus"
                    :key="order.id"
                    type="button"
                    class="simple-row"
                    @click="goTo(`/orders?orderId=${order.id}`)"
                  >
                    <div>
                      <strong>#{{ order.id }} · <span class="area-badge" :class="order.areaPart.toLowerCase()">{{ order.areaPart }}</span></strong>
                      <span>{{ order.workerName }} · {{ formatDate(order.orderDate) }}</span>
                    </div>
                    <span :class="['order-status', order.status.toLowerCase()]">
                      {{ getOrderStatusLabel(order.status) }}
                    </span>
                  </button>
                </div>
              </article>

              <article class="panel list-panel">
                <div class="panel-header">
                  <div>
                    <h3>{{ t('dashboard.activity.recentStockins') }}</h3>
                    <p>{{ t('dashboard.activity.recentStockinsDesc') }}</p>
                  </div>
                  <button type="button" class="text-btn" @click="goTo('/stockin')">
                    {{ t('dashboard.activity.viewAll') }}
                  </button>
                </div>

                <div v-if="dashboardStore.recentStockins.length === 0" class="empty-state">
                  <i class="pi pi-inbox"></i>
                  <p>{{ t('dashboard.activity.noStockins') }}</p>
                </div>

                <div v-else class="simple-list">
                  <button
                    v-for="stockin in dashboardStore.recentStockins"
                    :key="stockin.id"
                    type="button"
                    class="simple-row"
                    @click="goTo('/stockin')"
                  >
                    <div>
                      <strong>#{{ stockin.id }} · <span class="area-badge" :class="stockin.areaPart.toLowerCase()">{{ stockin.areaPart }}</span></strong>
                      <span>{{ stockin.creatorName }} · {{ formatDate(stockin.stockInDate) }}</span>
                    </div>
                    <b>{{ formatNumber(stockin.totalQty) }}</b>
                  </button>
                </div>
              </article>

              <article class="panel list-panel wide">
                <div class="panel-header">
                  <div>
                    <h3>{{ t('dashboard.activity.topOrdered') }}</h3>
                    <p>{{ t('dashboard.activity.topOrderedDesc') }}</p>
                  </div>
                </div>

                <div v-if="dashboardStore.topOrderedItems.length === 0" class="empty-state">
                  <i class="pi pi-chart-bar"></i>
                  <p>{{ t('dashboard.activity.noTopOrdered') }}</p>
                </div>

                <div v-else class="top-items">
                  <div v-for="item in dashboardStore.topOrderedItems" :key="item.id" class="top-item">
                    <img :src="item.image" :alt="item.name" />
                    <div class="item-main">
                      <strong>{{ item.name }}</strong>
                      <span>{{ item.code }} · <span class="area-badge" :class="item.areaPart.toLowerCase()">{{ item.areaPart }}</span></span>
                      <div class="progress">
                        <span :style="{ width: item.percentage + '%' }"></span>
                      </div>
                    </div>
                    <div class="item-side">
                      <b>{{ formatNumber(item.totalOrdered) }}</b>
                      <small>{{ t('dashboard.activity.ordered') }}</small>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </TabPanel>

          <!-- Charts tab -->
          <TabPanel :header="t('dashboard.tabs.charts')">
            <div class="chart-grid single">
              <article class="panel chart-panel wide">
                <div class="chart-panel-header">
                  <div>
                    <h3>{{ t('dashboard.charts.dailyMovement') }}</h3>
                    <p class="chart-panel-desc">{{ t('dashboard.charts.dailyMovementDesc') }}</p>
                  </div>
                  <SelectButton
                    v-model="chartRange"
                    :options="rangeOptions"
                    optionLabel="label"
                    optionValue="value"
                    :allowEmpty="false"
                  />
                </div>
                <div class="chart-box">
                  <LineChart :chart-data="dailyChart.chartData" @point-click="onChartPointClick" />
                </div>
              </article>
            </div>

            <!-- Detail theo ngày được chọn -->
            <div v-if="selectedDateKey" class="date-detail-grid">
              <article class="panel list-panel">
                <div class="panel-header">
                  <div>
                    <h3>
                      <span class="dot green"></span>
                      {{ t('dashboard.charts.stockinOnDate', { date: formatDateLabel(selectedDateKey) }) }}
                    </h3>
                  </div>
                </div>

                <div v-if="stockinsForSelectedDate.length === 0" class="empty-state">
                  <i class="pi pi-inbox"></i>
                  <p>{{ t('dashboard.charts.noStockinOnDate') }}</p>
                </div>

                <div v-else class="simple-list">
                  <button
                    v-for="stockin in stockinsForSelectedDate"
                    :key="stockin.id"
                    type="button"
                    class="simple-row"
                    @click="goTo('/stockin')"
                  >
                    <div>
                      <strong>#{{ stockin.id }} · <span class="area-badge" :class="stockin.areaPart.toLowerCase()">{{ stockin.areaPart }}</span></strong>
                      <span>{{ stockin.account?.username || '-' }} · {{ formatDate(stockin.stockInDate) }}</span>
                    </div>
                    <b>{{ formatNumber(stockinTotalQty(stockin)) }}</b>
                  </button>
                </div>
              </article>

              <article class="panel list-panel">
                <div class="panel-header">
                  <div>
                    <h3>
                      <span class="dot orange"></span>
                      {{ t('dashboard.charts.orderOnDate', { date: formatDateLabel(selectedDateKey) }) }}
                    </h3>
                  </div>
                </div>

                <div v-if="ordersForSelectedDate.length === 0" class="empty-state">
                  <i class="pi pi-shopping-cart"></i>
                  <p>{{ t('dashboard.charts.noOrderOnDate') }}</p>
                </div>

                <template v-else>
                  <div class="simple-list">
                    <div
                      v-for="order in pagedOrders"
                      :key="order.id"
                      class="simple-row order-row"
                    >
                      <div>
                        <strong>#{{ order.id }} · <span class="area-badge" :class="dashboardStore.getOrderArea(order).toLowerCase()">{{ dashboardStore.getOrderArea(order) }}</span></strong>
                        <span>{{ order.account?.username || order.nameWorker || '-' }} · {{ formatDate(order.orderDate) }}</span>
                      </div>
                      <span :class="['order-status', order.status.toLowerCase()]">
                        {{ getOrderStatusLabel(order.status) }}
                      </span>
                      <button
                        type="button"
                        class="icon-btn"
                        :title="t('dashboard.charts.colAction')"
                        @click="openOrderModal(order)"
                      >
                        <i class="pi pi-eye"></i>
                      </button>
                    </div>
                  </div>

                  <Paginator
                    v-if="ordersForSelectedDate.length > pageSize"
                    :rows="pageSize"
                    :totalRecords="ordersForSelectedDate.length"
                    :first="(orderPage - 1) * pageSize"
                    @page="onOrderPageChange"
                  />
                </template>
              </article>
            </div>

            <div v-else class="select-date-hint">
              <i class="pi pi-info-circle"></i>
              <span>{{ t('dashboard.charts.selectDateHint') }}</span>
            </div>
          </TabPanel>
        </TabView>
      </section>
    </div>

    <!-- Order Detail Modal -->
    <Dialog
      v-model:visible="orderModalVisible"
      modal
      :header="orderModalTitle"
      :style="{ width: '720px', maxWidth: '95vw' }"
    >
      <div v-if="selectedOrder" class="order-modal-body">
        <div class="order-modal-info">
          <div>
            <span class="order-modal-label">{{ t('dashboard.orderModal.orderDate') }}</span>
            <strong>{{ formatDate(selectedOrder.orderDate) }}</strong>
          </div>
          <div>
            <span class="order-modal-label">{{ t('dashboard.orderModal.worker') }}</span>
            <strong>{{ selectedOrder.account?.username || selectedOrder.nameWorker || '-' }}</strong>
          </div>
          <div>
            <span class="order-modal-label">{{ t('dashboard.orderModal.status') }}</span>
            <span :class="['order-status', selectedOrder.status.toLowerCase()]">
              {{ getOrderStatusLabel(selectedOrder.status) }}
            </span>
          </div>
          <div class="order-modal-note" v-if="selectedOrder.note">
            <span class="order-modal-label">{{ t('dashboard.orderModal.note') }}</span>
            <p>{{ selectedOrder.note }}</p>
          </div>
        </div>

        <h4>{{ t('dashboard.orderModal.items') }}</h4>
        <DataTable :value="selectedOrder.orderDetails" responsiveLayout="scroll" class="order-modal-table">
          <Column :header="t('dashboard.orderModal.colItem')">
            <template #body="{ data }">
              <div class="item-cell">
                <img
                  v-if="data.item?.picture?.length"
                  :src="getItemImageUrl(data.item.picture[0])"
                  :alt="getItemName(data.item)"
                />
                <div v-else class="item-cell-noimg">
                  <i class="pi pi-image"></i>
                </div>
                <div>
                  <strong>{{ getItemName(data.item) }}</strong>
                  <span>{{ data.item?.itemIndentifyId || '-' }}</span>
                </div>
              </div>
            </template>
          </Column>
          <Column :header="t('dashboard.orderModal.colMachine')">
            <template #body="{ data }">
              {{ data.machine?.machineName || '-' }}
            </template>
          </Column>
          <Column :header="t('dashboard.orderModal.colQty')">
            <template #body="{ data }">
              {{ formatNumber(data.orderQty) }} {{ data.item?.unit || '' }}
            </template>
          </Column>
          <Column :header="t('dashboard.orderModal.colNote')">
            <template #body="{ data }">
              {{ data.note || '-' }}
            </template>
          </Column>
        </DataTable>

        <h4>{{ t('dashboard.orderModal.images') }}</h4>
        <div v-if="selectedOrder.image && selectedOrder.image.length > 0" class="order-modal-images">
          <img
            v-for="(img, idx) in selectedOrder.image"
            :key="idx"
            :src="getOrderImageUrl(img)"
            :alt="`order-image-${idx}`"
          />
        </div>
        <div v-else class="empty-state">
          <i class="pi pi-image"></i>
          <p>{{ t('dashboard.orderModal.noImages') }}</p>
        </div>
      </div>
    </Dialog>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import MainLayout from "@/components/MainLayout.vue";
import SelectButton from "primevue/selectbutton";
import Button from "primevue/button";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import Paginator from "primevue/paginator";
import LineChart from "@/components/charts/LineChart.vue";

import { useDashboardStore, type AreaKey, type AreaSummary } from "@/stores/dashboard";
import { useItemStore } from "@/stores/itemStore";
import { useOrderStore } from "@/stores/orderStore";
import { useStockinStore } from "@/stores/stockinStore";
import { useLineMachineStore } from "@/stores/line_machine";

import { itemAPI } from "@/services/itemAPI";
import { orderAPI } from "@/services/orderAPI";
import { stockinAPI } from "@/services/stockinAPI";

const router = useRouter();
const { t, locale } = useI18n();

const dashboardStore = useDashboardStore();
const itemStore = useItemStore();
const orderStore = useOrderStore();
const stockinStore = useStockinStore();
const lineMachineStore = useLineMachineStore();

const loading = ref(false);
const activeTab = ref(0);

const areaOptions = computed<Array<{ label: string; value: AreaKey }>>(() => [
  { label: t("reports.common.areaAll"), value: "ALL" },
  { label: "SMD", value: "SMD" },
  { label: "MAINLINE", value: "MAINLINE" },
]);

const selectedAreaModel = computed<AreaKey>({
  get: () => dashboardStore.selectedArea,
  set: (value) => dashboardStore.setSelectedArea(value),
});

const onSelectArea = (area: AreaKey) => {
  dashboardStore.setSelectedArea(area);
};

const current = computed(() => dashboardStore.currentSummary);

const areaCards = computed(() => [
  { key: "SMD" as AreaKey, summary: dashboardStore.areaSummaries.SMD },
  { key: "MAINLINE" as AreaKey, summary: dashboardStore.areaSummaries.MAINLINE },
]);

const areaAlertCount = (summary: AreaSummary) => {
  const s = summary.stockStatus;
  return s.critical + s.low + s.warning + s.outOfStock + s.notConfigured;
};

const alertTotal = computed(() => {
  const s = current.value.stockStatus;
  return s.critical + s.low + s.warning + s.outOfStock + s.notConfigured;
});

const localeMap: Record<string, string> = {
  vi: "vi-VN",
  en: "en-US",
  ko: "ko-KR",
};

const formatNumber = (value: number) => {
  return Number(value || 0).toLocaleString(localeMap[locale.value] || "vi-VN");
};

const formatCurrency = (value: number) => {
  return Number(value || 0).toLocaleString(localeMap[locale.value] || "vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
};

const formatDate = (date: string) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString(localeMap[locale.value] || "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const stockStatusKeyMap: Record<string, string> = {
  normal: "normal",
  warning: "warning",
  low: "low",
  critical: "critical",
  "out-of-stock": "outOfStock",
  "not-configured": "notConfigured",
};

const getStockStatusLabel = (status: string) => {
  const key = stockStatusKeyMap[status] || "normal";
  return t(`reports.inventoryReport.stockStatus.${key}`);
};

const orderStatusKeyMap: Record<string, string> = {
  Pending: "pending",
  Approved: "approved",
  Completed: "completed",
  Rejected: "rejected",
};

const getOrderStatusLabel = (status: string) => {
  const key = orderStatusKeyMap[status] || status.toLowerCase();
  return t(`reports.orderReport.statusOptions.${key}`);
};

const goTo = (path: string) => {
  router.push(path);
};

const goToPendingOrders = (area: "SMD" | "MAINLINE") => {
  router.push({
    path: "/orders",
    query: {
      status: "Pending",
      areaPart: area === "SMD" ? "SMD" : "Mainline",
    },
  });
};

// ===== Daily movement chart (Vấn đề 1) =====
const chartRange = ref<"7d" | "30d" | "all">("7d");

const rangeOptions = computed(() => [
  { label: t("dashboard.charts.range7d"), value: "7d" },
  { label: t("dashboard.charts.range30d"), value: "30d" },
  { label: t("dashboard.charts.rangeAll"), value: "all" },
]);

const dailyChart = computed(() => dashboardStore.getDailyMovementChartData(chartRange.value));

const selectedDateKey = ref<string | null>(null);
const orderPage = ref(1);
const pageSize = 10;

const onChartPointClick = (payload: { datasetIndex: number; index: number; label: string }) => {
  const key = dailyChart.value.dates[payload.index];
  if (!key) return;
  selectedDateKey.value = key;
  orderPage.value = 1;
};

const formatDateLabel = (dateKey: string) => {
  const parsed = new Date(dateKey);
  if (Number.isNaN(parsed.getTime())) return dateKey;
  return parsed.toLocaleDateString(localeMap[locale.value] || "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const stockinsForSelectedDate = computed(() => {
  if (!selectedDateKey.value) return [];
  return dashboardStore.getStockinsForDate(dashboardStore.selectedArea, selectedDateKey.value);
});

const ordersForSelectedDate = computed(() => {
  if (!selectedDateKey.value) return [];
  return dashboardStore.getOrdersForDate(dashboardStore.selectedArea, selectedDateKey.value);
});

const pagedOrders = computed(() => {
  const start = (orderPage.value - 1) * pageSize;
  return ordersForSelectedDate.value.slice(start, start + pageSize);
});

const onOrderPageChange = (event: { page: number }) => {
  orderPage.value = event.page + 1;
};

const stockinTotalQty = (stockin: any) => {
  return (
    stockin.stockInDetails?.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0) || 0
  );
};

// ===== Order detail modal =====
const orderModalVisible = ref(false);
const selectedOrder = ref<any | null>(null);

const orderModalTitle = computed(() =>
  selectedOrder.value ? t("dashboard.orderModal.title", { id: selectedOrder.value.id }) : "",
);

const openOrderModal = (order: any) => {
  selectedOrder.value = order;
  orderModalVisible.value = true;
};

const getItemName = (item: any) => item?.eng?.partname || item?.com?.name || "Unknown";

const getItemImageUrl = (filename: string) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${import.meta.env.WAREHOUSE_URL}/api/Item/image/${filename}`;
};

const getOrderImageUrl = (filename: string) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${import.meta.env.WAREHOUSE_URL}/api/Order/image/${filename}`;
};

const fetchDashboardData = async () => {
  loading.value = true;

  try {
    const [items, orders, stockins] = await Promise.all([
      itemAPI.getAll(),
      orderAPI.getAll(),
      stockinAPI.getAllStockin(),
      lineMachineStore.fetchInitialData(),
    ]);

    itemStore.setItems(items);
    orderStore.setOrders(orders);
    stockinStore.setStockins(stockins);
  } catch (error) {
    console.error("Error loading dashboard:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchDashboardData();
});
</script>

<style scoped>
.dashboard-page {
  width: 100%;
  max-width: none;
  min-height: 100vh;
  padding: 1.25rem 2rem;
  background:
    radial-gradient(circle at top left, rgba(30, 58, 95, 0.08), transparent 32rem),
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent 30rem),
    #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  background: rgba(248, 250, 252, 0.75);
  backdrop-filter: blur(6px);
}

.loading-card {
  display: grid;
  place-items: center;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: white;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
  font-weight: 700;
  color: #334155;
}

.loading-card i {
  font-size: 2rem;
  color: #4f46e5;
}

/* Header */
.dash-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.06);
}

.hero-eyebrow {
  margin: 0 0 0.35rem;
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dash-header-text h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.45rem, 3vw, 2.25rem);
  font-weight: 900;
}

.dash-header-text p {
  max-width: 680px;
  margin: 0.5rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.dash-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* SelectButton Overrides */
:deep(.p-selectbutton .p-button) {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
}
:deep(.p-selectbutton .p-button.p-highlight) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
  font-weight: 700;
}

/* Refresh button override */
.btn-refresh {
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
}

/* Alert banners */
.alert-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #ef4444;
  border-radius: 0.75rem;
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: 0.2s ease;
}

.alert-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(220, 38, 38, 0.12);
}

.alert-icon {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  color: #dc2626;
  background: transparent;
}

.alert-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.alert-text strong {
  color: #991b1b;
  font-size: 1.05rem;
  font-weight: 800;
}

.alert-text span {
  color: #b91c1c;
  font-size: 0.85rem;
}

.alert-action {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #dc2626;
  font-weight: 800;
  font-size: 0.85rem;
  white-space: nowrap;
}

.ok-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border: 1px solid #bbf7d0;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, #f0fdf4, #fff);
  color: #15803d;
  font-weight: 700;
}

.ok-icon {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 1rem;
  font-size: 1rem;
  color: #16a34a;
  background: #dcfce7;
}

/* KPI grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.kpi-card {
  position: relative;
  display: flex;
  min-height: 140px;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.45rem;
  padding: 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: white;
  text-align: left;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition: 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.09);
}

.kpi-card.danger {
  border-color: #fecaca;
  background: linear-gradient(135deg, #fff, #fff1f2);
}

.kpi-icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: 1rem;
  font-size: 1.15rem;
}

.kpi-icon.purple {
  color: var(--primary-color);
  background: rgba(30, 58, 95, 0.08);
}

.kpi-icon.green {
  color: var(--primary-light);
  background: rgba(45, 90, 142, 0.08);
}

.kpi-icon.red {
  color: #dc2626;
  background: #fee2e2;
}

.kpi-icon.orange {
  color: var(--primary-dark);
  background: rgba(15, 39, 68, 0.08);
}

.kpi-label {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 800;
}

.kpi-card strong {
  color: #0f172a;
  font-size: 1.55rem;
  font-weight: 900;
}

.kpi-card small {
  color: #94a3b8;
  font-size: 0.78rem;
}

/* Area comparison */
.area-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.area-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: white;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
}

.area-card.smd {
  border-top: 4px solid var(--primary-light);
}

.area-card.mainline {
  border-top: 4px solid var(--primary-color);
}

.area-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.area-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.area-badge.smd {
  color: var(--primary-light);
  background: rgba(45, 90, 142, 0.1);
}

.area-badge.mainline {
  color: var(--primary-color);
  background: rgba(30, 58, 95, 0.1);
}

.area-card-body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.area-stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.area-stat-label {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
}

.area-stat strong {
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 800;
}

.area-stat strong.text-danger {
  color: #dc2626;
}

.area-card-footer {
  display: flex;
  gap: 1rem;
  padding-top: 0.6rem;
  border-top: 1px solid #f1f5f9;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
}

.area-card-footer span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.text-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 0;
  background: transparent;
  color: var(--primary-color);
  font-weight: 800;
  font-size: 0.82rem;
  cursor: pointer;
}

/* Tabs */
.dash-tabs {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: white;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
  padding: 0.5rem 1rem 1.25rem;
}

.tab-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.25rem 1rem;
  color: #64748b;
}

.tab-head p {
  margin: 0;
  font-size: 0.88rem;
}

.empty-state {
  display: grid;
  place-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  color: #94a3b8;
  text-align: center;
}

.empty-state i {
  font-size: 1.75rem;
}

.empty-state p {
  margin: 0;
  font-weight: 700;
}

/* Alert table */
.item-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.item-cell img {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.65rem;
  object-fit: cover;
  background: #f1f5f9;
}

.item-cell div {
  display: flex;
  flex-direction: column;
}

.item-cell strong {
  color: #0f172a;
  font-size: 0.88rem;
}

.item-cell span {
  color: #94a3b8;
  font-size: 0.76rem;
}

.status-chip {
  display: inline-flex;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
}

.status-chip.normal {
  color: #15803d;
  background: #dcfce7;
}

.status-chip.warning {
  color: #b45309;
  background: #fef3c7;
}

.status-chip.low {
  color: #c2410c;
  background: #ffedd5;
}

.status-chip.critical {
  color: #b91c1c;
  background: #fee2e2;
}

.status-chip.out-of-stock {
  color: #fff;
  background: #ef4444;
}

.status-chip.not-configured {
  color: #475569;
  background: #e2e8f0;
}

/* Activity tab */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #f1f5f9;
  border-radius: 1rem;
}

.panel.wide {
  grid-column: span 2;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.panel-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.panel-header p {
  margin: 0.2rem 0 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

.simple-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.simple-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid #f1f5f9;
  border-radius: 0.85rem;
  background: #f8fafc;
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;
}

.simple-row:hover {
  border-color: #cbd5e1;
  background: #fff;
}

.simple-row div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.simple-row strong {
  color: #0f172a;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.simple-row span {
  color: #94a3b8;
  font-size: 0.75rem;
}

.order-status {
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}

.order-status.pending {
  color: #b45309;
  background: #fef3c7;
}

.order-status.approved {
  color: #1d4ed8;
  background: #dbeafe;
}

.order-status.completed {
  color: #15803d;
  background: #dcfce7;
}

.order-status.rejected {
  color: #b91c1c;
  background: #fee2e2;
}

.top-items {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid #f1f5f9;
  border-radius: 0.85rem;
  background: #f8fafc;
}

.top-item img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.65rem;
  object-fit: cover;
  background: #fff;
}

.item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.item-main strong {
  color: #0f172a;
  font-size: 0.85rem;
}

.item-main span {
  color: #94a3b8;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.progress {
  height: 0.35rem;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.progress span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--primary-color);
}

.item-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
  white-space: nowrap;
}

.item-side b {
  color: #0f172a;
  font-size: 0.95rem;
}

.item-side small {
  color: #94a3b8;
  font-size: 0.72rem;
}

/* Charts tab */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.chart-panel {
  border: 1px solid #f1f5f9;
  border-radius: 1rem;
  padding: 1rem;
}

.chart-panel.wide {
  grid-column: span 2;
}

.chart-panel h3 {
  margin: 0 0 0.75rem;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 800;
}

.chart-box {
  height: 260px;
  position: relative;
}

.chart-box.small {
  height: 220px;
}

.chart-grid.single {
  grid-template-columns: 1fr;
}

.chart-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.chart-panel-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 800;
}

.chart-panel-desc {
  margin: 0.2rem 0 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

.chart-grid.single .chart-box {
  height: 320px;
}

/* Date detail grid */
.date-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.dot {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  margin-right: 0.3rem;
}

.dot.green {
  background: #16a34a;
}

.dot.orange {
  background: #f97316;
}

.order-row {
  cursor: default;
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
  color: #475569;
  cursor: pointer;
  transition: 0.2s ease;
  flex-shrink: 0;
}

.icon-btn:hover {
  border-color: #cbd5e1;
  color: var(--primary-color);
  background: #f8fafc;
}

.select-date-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border: 1px dashed #e2e8f0;
  border-radius: 0.85rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Order detail modal */
.order-modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-modal-info {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.order-modal-info > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-modal-label {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
}

.order-modal-note {
  grid-column: 1 / -1;
}

.order-modal-note p {
  margin: 0;
  color: #334155;
}

.order-modal-body h4 {
  margin: 0;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 800;
}

.item-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.item-cell img,
.item-cell-noimg {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.6rem;
  object-fit: cover;
  background: #f1f5f9;
}

.item-cell-noimg {
  display: grid;
  place-items: center;
  color: #94a3b8;
}

.item-cell div {
  display: flex;
  flex-direction: column;
}

.item-cell strong {
  color: #0f172a;
  font-size: 0.85rem;
}

.item-cell span {
  color: #94a3b8;
  font-size: 0.75rem;
}

.order-modal-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.order-modal-images img {
  width: 5rem;
  height: 5rem;
  border-radius: 0.65rem;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

/* KPI pending card */
.kpi-pending {
  position: relative;
}

.pending-badge {
  position: absolute;
  top: -0.6rem;
  right: -0.6rem;
  display: grid;
  place-items: center;
  min-width: 1.6rem;
  height: 1.6rem;
  padding: 0 0.4rem;
  border-radius: 999px;
  background: var(--danger-color);
  color: white;
  font-size: 0.78rem;
  font-weight: 900;
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.pending-area-links {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  margin-top: auto;
}

.pending-area-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.65rem;
  background: #f8fafc;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.pending-area-link:hover {
  border-color: #cbd5e1;
  background: white;
}

.pending-area-link.smd:hover {
  border-color: #93c5fd;
  color: #1d4ed8;
}

.pending-area-link.mainline:hover {
  border-color: #86efac;
  color: #15803d;
}

.pending-area-count {
  display: grid;
  place-items: center;
  min-width: 1.35rem;
  height: 1.35rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: #e2e8f0;
  color: #0f172a;
  font-size: 0.7rem;
  font-weight: 900;
}

/* Responsive */
@media (max-width: 1180px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .area-grid {
    grid-template-columns: 1fr;
  }

  .activity-grid,
  .chart-grid,
  .date-detail-grid,
  .order-modal-info {
    grid-template-columns: 1fr;
  }

  .panel.wide,
  .chart-panel.wide {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .dashboard-page {
    padding: 1rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .dash-header {
    flex-direction: column;
    align-items: stretch;
  }

  .dash-header-actions {
    justify-content: space-between;
  }
}

/* Custom Header Action Buttons */
.dash-header-actions :deep(.p-selectbutton .p-button.p-highlight) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}
.dash-header-actions :deep(.p-selectbutton .p-button.p-highlight:hover) {
  background: var(--primary-light);
  border-color: var(--primary-light);
}
.refresh-btn {
  background: white !important;
  color: var(--primary-color) !important;
  border: 1px solid var(--gray-200) !important;
}
.refresh-btn:hover {
  background: var(--gray-50) !important;
  border-color: var(--primary-light) !important;
}
</style>
