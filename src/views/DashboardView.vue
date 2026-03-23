<template>
  <MainLayout>
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i
          class="pi pi-spin pi-spinner"
          style="font-size: 3rem; color: #8b7ab8"
        ></i>
        <p>{{ t("common.loadingData") }}</p>
      </div>
    </div>

    <!-- Stats Cards Row -->
    <div class="stats-grid">
      <div
        v-for="(stat, key, index) in dashboardStore.dashboardStats"
        :key="key"
        class="stat-card-compact"
        :class="
          (getStatCardClass(index),
          { 'cursor-pointer': statRoutes[key as string] })
        "
        @click="navigateToStat(key as string)"
      >
        <div class="stat-icon" :class="getIconBgClass(index)">
          <i :class="getIconClass(index)"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label-compact">{{ statLabels[key as string] }}</div>
          <div class="stat-value-compact">
            <article></article>
            {{
              key === "totalPurchase" ? formatCurrency(stat.value) : stat.value
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- Order Status Summary Row -->
    <div class="order-status-grid">
      <div
        class="status-card status-pending clickable-status-card"
        :class="{
          'pulse-animation': hasPendingOrders,
          'has-update': hasPendingOrders,
          'has-new-update': hasNewPending,
        }"
        @click="navigateToOrdersByStatus('Pending')"
      >
        <div class="status-icon">
          <i class="pi pi-clock"></i>
        </div>
        <div class="status-content">
          <div class="status-value">
            {{ dashboardStore.orderStatusSummary.pending }}
          </div>
          <div class="status-label">{{ t("dashboard.pendingOrders") }}</div>
        </div>
        <i class="pi pi-chevron-right nav-arrow"></i>

        <!-- Badge thông báo - hiển thị số lượng -->
        <div v-if="hasPendingOrders" class="update-badge">
          <span class="badge-count"
            >{{ dashboardStore.orderStatusSummary.pending }}
            {{ t("dashboard.orderToProcess") }}</span
          >
        </div>
      </div>

      <div
        class="status-card status-approved clickable-status-card"
        :class="{
          'pulse-animation': hasApprovedOrders,
          'has-update': hasApprovedOrders,
          'has-new-update': hasNewApproved,
        }"
        @click="navigateToOrdersByStatus('Approved')"
      >
        <div class="status-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="status-content">
          <div class="status-value">
            {{ dashboardStore.orderStatusSummary.approved }}
          </div>
          <div class="status-label">{{ t("dashboard.approvedOrders") }}</div>
        </div>
        <i class="pi pi-chevron-right nav-arrow"></i>

        <!-- Badge thông báo - hiển thị số lượng -->
        <div v-if="hasApprovedOrders" class="update-badge approved-badge">
          <span class="badge-count"
            >{{ dashboardStore.orderStatusSummary.approved }}
            {{ t("dashboard.orderToProcess") }}</span
          >
        </div>
      </div>

      <!-- Completed và Rejected cards giữ nguyên -->
      <div
        class="status-card status-completed clickable-status-card"
        @click="navigateToOrdersByStatus('Completed')"
      >
        <div class="status-icon">
          <i class="pi pi-check"></i>
        </div>
        <div class="status-content">
          <div class="status-value">
            {{ dashboardStore.orderStatusSummary.completed }}
          </div>
          <div class="status-label">{{ t("dashboard.completedOrders") }}</div>
        </div>
        <i class="pi pi-chevron-right nav-arrow"></i>
      </div>

      <div
        class="status-card status-rejected clickable-status-card"
        @click="navigateToOrdersByStatus('Rejected')"
      >
        <div class="status-icon">
          <i class="pi pi-times-circle"></i>
        </div>
        <div class="status-content">
          <div class="status-value">
            {{ dashboardStore.orderStatusSummary.rejected }}
          </div>
          <div class="status-label">{{ t("dashboard.rejectedOrders") }}</div>
        </div>
        <i class="pi pi-chevron-right nav-arrow"></i>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Orders Status Chart -->
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">{{ t("dashboard.orderStatusChart") }}</h3>
        </div>
        <div class="chart-wrapper">
          <DoughnutChart
            :chartData="dashboardStore.ordersByStatusChartData"
            :height="300"
          />
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color" style="background: #ffd6a5"></span>
            <span>{{ t("dashboard.pending") }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #a0c4ff"></span>
            <span>{{ t("dashboard.approved") }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #caffbf"></span>
            <span>{{ t("dashboard.completed") }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #ffadad"></span>
            <span>{{ t("dashboard.rejected") }}</span>
          </div>
        </div>
      </div>

      <!-- Stock Value Chart -->
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">{{ t("dashboard.orderCategoryChart") }}</h3>
        </div>
        <div class="chart-wrapper">
          <DoughnutChart
            :chartData="dashboardStore.stockValueChartData"
            :height="300"
          />
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color" style="background: #bdb2ff"></span>
            <span>{{ t("inventoryManagement.category.engineering") }}</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #ffc6ff"></span>
            <span>{{ t("inventoryManagement.category.consumer") }}</span>
          </div>
        </div>
      </div>

      <!-- Overview Stats -->
      <div class="overview-container">
        <div class="chart-header">
          <h3 class="chart-title">{{ t("dashboard.systemOverview") }}</h3>
        </div>
        <div class="overview-grid">
          <RouterLink to="/inventory" class="overview-item overview-purple">
            <div class="overview-icon">
              <i class="pi pi-box"></i>
            </div>
            <div class="overview-content">
              <div class="overview-value">
                {{ dashboardStore.overviewStats.totalItems }}
              </div>
              <div class="overview-label">{{ t("dashboard.stock") }}</div>
            </div>
          </RouterLink>

          <RouterLink to="/users" class="overview-item overview-green">
            <div class="overview-icon">
              <i class="pi pi-users"></i>
            </div>
            <div class="overview-content">
              <div class="overview-value">
                {{ dashboardStore.overviewStats.totalUsers }}
              </div>
              <div class="overview-label">{{ t("dashboard.users") }}</div>
            </div>
          </RouterLink>

          <RouterLink to="/stockin" class="overview-item overview-yellow">
            <div class="overview-icon">
              <i class="pi pi-sign-in"></i>
            </div>
            <div class="overview-content">
              <div class="overview-value">
                {{ dashboardStore.overviewStats.totalStockins }}
              </div>
              <div class="overview-label">
                {{ t("dashboard.importReceipts") }}
              </div>
            </div>
          </RouterLink>

          <RouterLink to="/orders" class="overview-item overview-pink">
            <div class="overview-icon">
              <i class="pi pi-database" style="font-size: 1.5rem"></i>
            </div>
            <div class="overview-content">
              <div class="overview-value">{{ totalOrders }}</div>
              <div class="overview-label">{{ t("dashboard.orders") }}</div>
            </div>
          </RouterLink>

          <div
            class="overview-item overview-gray clickable-overview"
            @click="scrollToSection('top-orders-section')"
          >
            <div class="overview-icon">
              <i class="pi pi-cart-arrow-down" style="font-size: 1.5rem"></i>
            </div>
            <div class="overview-content">
              <div class="overview-value">
                {{ dashboardStore.topOrderedItems.length }}
              </div>
              <div class="overview-label">{{ t("dashboard.topOrders") }}</div>
            </div>
          </div>

          <div
            class="overview-item overview-critical clickable-overview"
            :class="{
              'has-critical-stock':
                dashboardStore.lowStockCountByStatus.critical > 0,
            }"
            @click="scrollToSection('critical-stock-section')"
          >
            <div class="overview-icon">
              <i
                class="pi pi-exclamation-triangle"
                style="font-size: 1.5rem"
              ></i>
            </div>
            <div class="overview-content">
              <div class="overview-value">
                {{ dashboardStore.lowStockCountByStatus.critical }}
              </div>
              <div class="overview-label">{{ t("dashboard.critical") }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Products & Orders Row -->
    <div class="lists-row">
      <!-- Top Ordered Items -->
      <div id="top-orders-section" class="list-container">
        <div class="list-header">
          <h3 class="list-title">
            <i class="pi pi-chart-line"></i>
            {{ t("dashboard.topOrderedMaterials") }}
          </h3>
        </div>
        <div class="list-content">
          <div
            v-for="item in dashboardStore.topOrderedItems"
            :key="item.id"
            class="list-item"
          >
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-code">{{ item.code }}</div>
            </div>
            <div class="item-stats">
              <div class="item-qty">
                {{ t("dashboard.orderCount") }}: {{ item.totalOrdered }}
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: item.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
          <div
            v-if="dashboardStore.topOrderedItems.length === 0"
            class="empty-state"
          >
            <i class="pi pi-cart-arrow-down"></i>
            <p>{{ t("dashboard.noOrders") }}</p>
          </div>
        </div>
      </div>

      <!-- Low Stock Items -->
      <div id="critical-stock-section" class="list-container">
        <div class="list-header">
          <h3 class="list-title">
            <i class="pi pi-exclamation-triangle"></i>
            {{ t("dashboard.criticalStock") }} ({{
              dashboardStore.lowStockCountByStatus.critical
            }})
          </h3>
        </div>
        <div class="list-content">
          <div
            v-for="item in dashboardStore.criticalStockItems.slice(0, 50)"
            :key="item.id"
            class="list-item"
          >
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-code">{{ item.code }}</div>
            </div>
            <div class="item-stock">
              <div class="stock-badge" :class="'badge-' + item.status">
                {{ item.stockQty }}/{{ item.safetyStock }}
              </div>
              <div class="stock-label">
                {{ getStockStatusLabel(item.status) }}
              </div>
            </div>
          </div>
          <div
            v-if="dashboardStore.criticalStockItems.length === 0"
            class="empty-state"
          >
            <i class="pi pi-check-circle"></i>
            <p>{{ t("dashboard.noLowStock") }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="list-container">
        <div class="list-header">
          <h3 class="list-title">
            <i class="pi pi-list"></i>
            {{ t("dashboard.recentOrders") }}
          </h3>
        </div>
        <div class="list-content">
          <div
            v-for="order in dashboardStore.recentOrderStatus.slice(0, 10)"
            :key="order.id"
            class="list-item"
          >
            <div
              class="order-icon"
              :class="'order-icon-' + order.status.toLowerCase()"
            >
              <i :class="getOrderStatusIcon(order.status)"></i>
            </div>
            <div class="order-info">
              <div class="order-number">Order ID: {{ order.id }}</div>
              <div class="order-meta">
                {{ order.workerName }} - Order: {{ order.totalItems }}
                {{ t("common.product") }} - {{ t("common.quantity") }}:
                {{ order.totalQty }}
              </div>
            </div>
            <div class="order-status">
              <span
                class="status-badge"
                :class="'status-' + order.status.toLowerCase()"
              >
                {{ getOrderStatusLabel(order.status) }}
              </span>
              <div class="order-date">{{ formatDate(order.orderDate) }}</div>
            </div>
          </div>
          <div
            v-if="dashboardStore.recentOrderStatus.length === 0"
            class="empty-state"
          >
            <i class="pi pi-cart-arrow-down"></i>
            <p>{{ t("dashboard.noOrders") }}</p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from "vue";
import { useDashboardStore } from "@/stores/dashboard";
import { useItemStore } from "@/stores/itemStore";
import { useOrderStore } from "@/stores/orderStore";
import { useStockinStore } from "@/stores/stockinStore";
import { useUserStore } from "@/stores/userStore";
import { itemAPI } from "@/services/itemAPI";
import { orderAPI } from "@/services/orderAPI";
import { stockinAPI } from "@/services/stockinAPI";
import { userAPI } from "@/services/userAPI";
import MainLayout from "@/components/MainLayout.vue";
import DoughnutChart from "@/components/DoughnutChart.vue";
import { useToast } from "primevue/usetoast";
import { useRouter, useRoute } from "vue-router";
import { signalRService } from "@/services/orderNotiService";
import type { OrderPendingRealtime } from "@/types/order.types";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const dashboardStore = useDashboardStore();
const itemStore = useItemStore();
const orderStore = useOrderStore();
const stockinStore = useStockinStore();
const userStore = useUserStore();
const toast = useToast();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const hasPendingOrders = computed(
  () => dashboardStore.orderStatusSummary.pending > 0,
);
const hasApprovedOrders = computed(
  () => dashboardStore.orderStatusSummary.approved > 0,
);

const totalOrders = computed(() => orderStore.totalOrders);

const statRoutes: Record<string, string> = {
  totalOrders: "/orders",
  totalStockins: "/stockin",
  totalStock: "/inventory",
  totalPurchase: "",
};

const statLabels: Record<string, string> = computed(() => ({
  totalPurchase: t("dashboard.totalPurchaseValue"),
  totalOrders: t("dashboard.totalOrders"),
  totalStockins: t("dashboard.totalImports"),
  totalStock: t("dashboard.totalStock"),
}));

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Highlight effect (optional)
    element.classList.add("highlight-section");
    setTimeout(() => {
      element.classList.remove("highlight-section");
    }, 2000);
  }
};

const navigateToStat = (key: string) => {
  const route = statRoutes[key];
  if (route) {
    router.push(route);
  }
};

const navigateToOrdersByStatus = (status: string | null) => {
  router.push({
    path: "/orders",
    query: status ? { status } : {},
  });
};

const fetchAllData = async () => {
  loading.value = true;

  try {
    const [items, orders, stockins, users] = await Promise.all([
      itemAPI.getAll(),
      orderAPI.getAll(),
      stockinAPI.getAllStockin(),
      userAPI.getAllAccounts(),
    ]);

    itemStore.setItems(items);
    orderStore.setOrders(orders);
    stockinStore.setStockins(stockins);
    userStore.users = users;
  } catch (error: any) {
    console.error("❌ Error loading dashboard data:", error);
    toast.add({
      severity: "error",
      summary: "Lỗi tải dữ liệu",
      detail: "Không thể tải dữ liệu dashboard",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getStatCardClass = (index: number): string => {
  const classes = ["card-blue", "card-pink", "card-yellow", "card-purple"];
  return classes[index] || "card-blue";
};

const getIconBgClass = (index: number): string => {
  const classes = [
    "icon-bg-blue",
    "icon-bg-pink",
    "icon-bg-yellow",
    "icon-bg-purple",
  ];
  return classes[index] || "icon-bg-blue";
};

const getIconClass = (index: number): string => {
  const icons = [
    "pi pi-shopping-cart",
    "pi pi-file",
    "pi pi-sign-in",
    "pi pi-database",
  ];
  return icons[index] || "pi pi-shopping-cart";
};

const getStockStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    critical: t("dashboard.critical"),
    low: t("dashboard.low"),
    warning: t("dashboard.warning"),
  };
  return labels[status] || status;
};

const getOrderStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    Pending: "pi pi-clock",
    Approved: "pi pi-check-circle",
    Completed: "pi pi-check",
    Rejected: "pi pi-times-circle",
  };
  return icons[status] || "pi pi-file";
};

const getOrderStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    Pending: t("dashboard.pending"),
    Approved: t("dashboard.approved"),
    Completed: t("dashboard.completed"),
    Rejected: t("dashboard.rejected"),
  };
  return labels[status] || status;
};

const handleNewOrderCreated = async (orderData: OrderPendingRealtime) => {
  // Reload data (animation sẽ tự động chạy vì computed)
  await fetchAllData();
};

const handleOrderStatusUpdated = async (data: any) => {
  // Reload data
  await fetchAllData();
};

onMounted(async () => {
  // Kết nối SignalR
  if (!signalRService.isConnected()) {
    await signalRService.start();
  }

  // Register event handlers
  signalRService.on("NewOrderCreated", handleNewOrderCreated);
  signalRService.on("OrderStatusUpdated", handleOrderStatusUpdated);

  // Load data
  await fetchAllData();
  dashboardStore.refreshDashboard();
});

onUnmounted(() => {
  signalRService.off("NewOrderCreated");
  signalRService.off("OrderStatusUpdated");
});
</script>

<style scoped>
/* Pastel Color Palette */
:root {
  --pastel-blue: #a0c4ff;
  --pastel-pink: #ffc6ff;
  --pastel-yellow: #ffd6a5;
  --pastel-purple: #bdb2ff;
  --pastel-green: #caffbf;
  --pastel-red: #ffadad;
  --pastel-orange: #fdffb6;
  --pastel-mint: #9bf6ff;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
}

.loading-spinner p {
  margin-top: 1rem;
  font-size: 1rem;
  color: #8b7ab8;
  font-weight: 500;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Stat Cards - Pastel Colors */
.stat-card-compact {
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-card-compact:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-blue {
  background: linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%);
}

.card-pink {
  background: linear-gradient(135deg, #fff0ff 0%, #ffe0ff 100%);
}

.card-yellow {
  background: linear-gradient(135deg, #fff8e8 0%, #ffe8c8 100%);
}

.card-purple {
  background: linear-gradient(135deg, #e0dbfa 0%, #e7e4f8 100%);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 1.5rem;
  color: white;
}

.icon-bg-blue {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.icon-bg-pink {
  background: linear-gradient(135deg, #d81b60, #c2185b);
  box-shadow: 0 4px 12px rgba(216, 27, 96, 0.3);
}

.icon-bg-yellow {
  background: linear-gradient(135deg, #f57c00, #ef6c00);
  box-shadow: 0 4px 12px rgba(245, 124, 0, 0.3);
}

.icon-bg-purple {
  background: linear-gradient(135deg, #7b1fa2, #6a1b9a);
  box-shadow: 0 4px 12px rgba(123, 31, 162, 0.3);
}

.stat-content {
  flex: 1;
}

.stat-label-compact {
  font-size: 0.875rem;
  color: #5a4a7a;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.stat-value-compact {
  font-size: 2rem;
  font-weight: 800;
  color: #2d2d2d;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

/* Order Status Grid - Pastel */
.order-status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-card {
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.status-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.status-pending {
  background-color: #ffecb3;
  /* border-color: var(--pastel-yellow); */
}

.status-approved {
  background-color: #bbdefb;
  /* border-color: var(--pastel-blue); */
}

.status-completed {
  background-color: #c8e6c9;
  /* border-color: var(--pastel-green); */
}

.status-rejected {
  background-color: #ffcdd2;
  /* border-color: var(--pastel-red); */
}

.status-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-pending .status-icon {
  background: linear-gradient(135deg, #f57c00, #ef6c00);
  color: white;
}

.status-approved .status-icon {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: white;
}

.status-completed .status-icon {
  background: linear-gradient(135deg, #388e3c, #2e7d32);
  color: white;
}

.status-rejected .status-icon {
  background: linear-gradient(135deg, #d32f2f, #c62828);
  color: white;
}

.status-icon i {
  font-size: 1.75rem;
}

.status-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d2d2d;
  margin-bottom: 0.25rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

.status-label {
  font-size: 0.875rem;
  color: #5a4a7a;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* Charts Row */
.charts-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-container,
.overview-container {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.chart-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f5f3ff;
}

.chart-title,
.list-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #000;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-title i,
.list-title i {
  color: #000;
}

.chart-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b6b6b;
  font-weight: 500;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Overview Grid - Pastel */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.overview-item:hover {
  transform: scale(1.02);
}

.overview-blue {
  background: linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%);
}

.overview-pink {
  background: linear-gradient(135deg, #fff0ff 0%, #ffe0ff 100%);
}

.overview-green {
  background: linear-gradient(135deg, #f0fff0 0%, #e0ffe0 100%);
}

.overview-yellow {
  background: linear-gradient(135deg, #fff8e8 0%, #ffe8c8 100%);
}

.overview-purple {
  background: linear-gradient(135deg, #e0dbfa 0%, #e7e4f8 100%);
}
.overview-gray {
  background: linear-gradient(135deg, #e0e0e0 0%, #e0e0e0 100%);
}

/* Critical stock - màu đỏ nhạt với animation */
.overview-critical {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
}

.overview-critical .overview-icon {
  background: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.overview-critical .overview-icon i {
  color: #ef4444;
  font-size: 1.5rem;
}

/* Animation pulse khi có stock nguy cấp */
.overview-critical.has-critical-stock {
  animation: criticalPulse 3s ease-in-out infinite;
  border: 2px solid #ef4444;
}

@keyframes criticalPulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
  }
  50% {
    transform: scale(1.03);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
  }
}

.overview-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.overview-blue .overview-icon i {
  color: var(--pastel-blue);
  font-size: 1.5rem;
}

.overview-pink .overview-icon i {
  color: var(--pastel-pink);
  font-size: 1.5rem;
}

.overview-green .overview-icon i {
  color: var(--pastel-green);
  font-size: 1.5rem;
}

.overview-yellow .overview-icon i {
  color: var(--pastel-yellow);
  font-size: 1.5rem;
}

.overview-value {
  font-size: 2rem;
  font-weight: 700;
  color: #4a4a4a;
  margin-bottom: 0.25rem;
}

.overview-label {
  font-size: 0.8125rem;
  color: #8b7ab8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-grid > *,
.order-status-grid > *,
.charts-row > *,
.lists-row > * {
  min-width: 0;
}

/* Lists Row */
.lists-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.list-container {
  background: white;
  border-radius: 16px;
  border: 2px solid #f0f0f0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.list-header {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #fff1e6 0%, #ffe5d9 100%);
}

.list-title {
  color: #000 !important;
  /* text-shadow: 0 1px 2px rgba(0,0,0,0.1); */
  font-weight: 700;
}

.list-title i {
  color: #000 !important;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
  font-size: 1.3rem;
}

.list-content {
  max-height: 500px;
  overflow-y: auto;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f5f3ff;
  transition: background 0.2s;
}

.list-item:hover {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
}

.list-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid var(--pastel-purple);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #4a4a4a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.item-code {
  font-size: 0.8125rem;
  color: #8b7ab8;
  font-weight: 500;
}

.item-stats {
  text-align: right;
}

.item-qty {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--pastel-purple);
  margin-bottom: 0.5rem;
}

.progress-bar {
  width: 90px;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #1a1ee6;
  border-radius: 4px;
  transition: width 0.3s;
}

.item-stock {
  text-align: right;
}

.stock-badge {
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  margin-bottom: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.badge-critical {
  background: var(--pastel-red);
  color: #b84a4a;
}

.badge-low {
  background: var(--pastel-yellow);
  color: #b8860b;
}

.badge-warning {
  background: var(--pastel-orange);
  color: #b89f0b;
}

.stock-label {
  font-size: 0.75rem;
  color: #8b7ab8;
  font-weight: 500;
}

.order-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.order-icon i {
  font-size: 1.25rem;
}

.order-icon-pending {
  background: var(--pastel-yellow);
  color: #b8860b;
}

.order-icon-approved {
  background: var(--pastel-blue);
  color: #4a80c0;
}

.order-icon-completed {
  background: var(--pastel-green);
  color: #5fa85f;
}

.order-icon-rejected {
  background: var(--pastel-red);
  color: #d66b6b;
}

.order-info {
  flex: 1;
}

.order-number {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #4a4a4a;
  margin-bottom: 0.25rem;
}

.order-meta {
  font-size: 0.8125rem;
  color: #8b7ab8;
  font-weight: 500;
}

.order-status {
  text-align: right;
}

.status-badge {
  font-size: 0.8125rem;
  font-weight: 700;
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.status-pending {
  background: var(--pastel-yellow);
  color: #b8860b;
}

.status-approved {
  background: var(--pastel-blue);
  color: #4a80c0;
}

.status-completed {
  background: var(--pastel-green);
  color: #5fa85f;
}

.status-rejected {
  background: var(--pastel-red);
  color: #d66b6b;
}

.order-date {
  font-size: 0.75rem;
  color: #8b7ab8;
  font-weight: 500;
}

.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--pastel-purple);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 1280px) {
  .stats-grid,
  .order-status-grid,
  .charts-row,
  .lists-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid,
  .order-status-grid,
  .charts-row,
  .lists-row {
    grid-template-columns: 1fr !important;
  }

  .stat-card-compact {
    padding: 1.25rem !important;
  }
  .status-card {
    padding: 1rem !important;
  }
  .stat-value-compact {
    font-size: 1.5rem !important;
  }
  .status-value {
    font-size: 1.75rem !important;
  }

  .chart-container,
  .overview-container,
  .list-container {
    min-width: 0 !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  /* Overview grid: mobile 1 cột */
  .overview-grid {
    grid-template-columns: 1fr !important;
    gap: 0.75rem !important;
  }

  .overview-item {
    padding: 1rem !important;
  }
}

/* Thêm vào <style scoped> */
.stat-card-compact.cursor-pointer {
  cursor: pointer;
}

.stat-card-compact.cursor-pointer:hover {
  transform: translateY(-6px); /* Tăng hiệu ứng hover */
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.stat-card-compact.cursor-pointer:active {
  transform: translateY(-2px);
}

/* DashboardView.vue - Style */
.clickable-status-card {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.clickable-status-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.clickable-status-card:active {
  transform: translateY(-2px) scale(1.01);
}

/* Nav arrow indicator */
.nav-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(0, 0, 0, 0.3);
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.clickable-status-card:hover .nav-arrow {
  color: rgba(0, 0, 0, 0.6);
  transform: translateY(-50%) translateX(4px);
}

/* Subtle shine effect on hover */
.clickable-status-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.clickable-status-card:hover::before {
  opacity: 1;
}

/* Badge thông báo - FIX */
.update-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  min-width: auto;
  height: auto;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
  animation: badgeBounce 1.5s ease-in-out infinite;
  z-index: 10;
  white-space: nowrap;
}

.update-badge.approved-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
}

.badge-count {
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Animation cho Pending/Approved cards */
.pulse-animation {
  position: relative;
  overflow: visible;
}

/* Animation nhẹ - luôn chạy khi có đơn */
.pulse-animation.has-update {
  animation: cardPulseSoft 3s ease-in-out infinite;
}

@keyframes cardPulseSoft {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  50% {
    transform: scale(1.01);
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.2);
  }
}

/* Animation mạnh - chỉ chạy khi có đơn MỚI */
.pulse-animation.has-new-update {
  animation: cardPulseStrong 0.8s ease-in-out infinite !important;
}

@keyframes cardPulseStrong {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(245, 158, 11, 0.5);
  }
}

.status-approved.has-update {
  animation: cardPulseSoftBlue 3s ease-in-out infinite;
}

@keyframes cardPulseSoftBlue {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  50% {
    transform: scale(1.01);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.2);
  }
}

.status-approved.has-new-update {
  animation: cardPulseStrongBlue 0.8s ease-in-out infinite !important;
}

@keyframes cardPulseStrongBlue {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5);
  }
}

/* Clickable overview items */
.clickable-overview {
  cursor: pointer;
  text-decoration: none;
}

.clickable-overview:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Highlight animation khi scroll đến */
.highlight-section {
  animation: highlightPulse 2s ease-in-out;
}

@keyframes highlightPulse {
  0% {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 8px 24px rgba(139, 122, 184, 0.4);
    transform: scale(1.01);
  }
  100% {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transform: scale(1);
  }
}

/* Thêm vào cuối <style scoped> */
@media (max-width: 480px) {
  .stats-grid,
  .order-status-grid,
  .charts-row,
  .lists-row {
    grid-template-columns: 1fr !important;
  }

  .stat-card-compact {
    padding: 1.25rem;
  }

  .status-card {
    padding: 1rem;
  }

  .status-value {
    font-size: 1.75rem;
  }

  .stat-value-compact {
    font-size: 1.5rem;
  }
}
</style>
