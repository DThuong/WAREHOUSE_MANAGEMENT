<template>
  <Dialog
    :visible="visible"
    @update:visible="(val) => emit('update:visible', val)"
    :header="t('inventoryManagement.transactionDialog.header', { id: itemCode })"
    :style="{ width: '1400px', maxWidth: '95vw' }"
    :breakpoints="{ '960px': 'calc(100vw - 2rem)' }"
    :modal="true"
    :dismissableMask="true"
  >
    <!-- Filter -->
    <div class="mt-2 flex flex-col gap-5">
      <div class="transaction-filter-card">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="block mb-2 text-sm font-semibold text-gray-700">
              {{ t("inventoryManagement.transactionDialog.filterByIdMachine") }}
            </label>
            <InputText
              v-model="transactionIdFilter"
              placeholder="Order ID, Detail ID, StockIn ID, Machine..."
              class="w-full"
            />
          </div>

          <TimeRangeFilter 
            ref="timeRangeFilterRef" 
            class="flex-[3]"
            @update:fromDate="val => transactionFilterFromDate = val"
            @update:toDate="val => transactionFilterToDate = val"
          />

          <div class="flex items-center gap-2 mb-[2px]">
            <Button
              :label="t('inventoryManagement.transactionDialog.filter')"
              icon="pi pi-search"
              :loading="transactionLoading"
              @click="applyTransactionFilters"
            />
            <Button
              icon="pi pi-refresh"
              severity="secondary"
              :disabled="transactionLoading"
              @click="resetTransactionFilters"
            />
          </div>
        </div>
      </div>

      <div
        v-if="transactionLoading"
        class="flex justify-center items-center py-12"
      >
        <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
      </div>

      <div v-else-if="itemTransactions" class="flex flex-col gap-6">

        <!-- Orders History -->
        <div>
          <div class="flex items-center justify-between mb-3! gap-3">
            <h3 class="text-lg font-bold text-gray-900">{{ t("inventoryManagement.transactionDialog.ordersHistory") }}</h3>

            <Chip
              :label="t('inventoryManagement.transactionDialog.ordersCount', { count: filteredTransactionOrders.length })"
              class="chip-warning"
            />
          </div>

          <DataTable
            v-if="filteredTransactionOrders.length > 0"
            :value="paginatedTransactionOrders"
            responsiveLayout="scroll"
            class="transaction-table"
          >
            <Column field="orderId" header="Order ID">
              <template #body="{ data }">
                <span class="font-semibold">#{{ data.orderId }}</span>
              </template>
            </Column>

            <Column field="orderDetailId" header="Detail ID">
              <template #body="{ data }">
                <span>#{{ data.orderDetailId }}</span>
              </template>
            </Column>

            <Column field="orderDate" :header="t('inventoryManagement.transactionDialog.colOrderDate')">
              <template #body="{ data }">
                {{ formatDateTime(data.orderDate) }}
              </template>
            </Column>

            <Column field="machineName" :header="t('inventoryManagement.transactionDialog.colMachine')">
              <template #body="{ data }">
                <div class="flex flex-col">
                  <span class="font-semibold">
                    {{ data.machineName || "-" }}
                  </span>
                </div>
              </template>
            </Column>

            <Column field="lineName" :header="t('inventoryManagement.transactionDialog.colLine')">
              <template #body="{ data }">
                <div class="flex flex-col">
                  <span class="font-semibold">
                    {{ data.lineName || "-" }}
                  </span>
                </div>
              </template>
            </Column>

            <Column field="orderQty" :header="t('inventoryManagement.transactionDialog.colQty')">
              <template #body="{ data }">
                <span class="transaction-qty-text">
                  {{ data.orderQty }}
                </span>
              </template>
            </Column>

            <Column field="detailTotal" :header="t('inventoryManagement.transactionDialog.colItemAmount')">
              <template #body="{ data }">
                <span class="font-semibold">
                  {{ formatCurrency(data.detailTotal) }}
                </span>
              </template>
            </Column>

            <Column field="status" :header="t('inventoryManagement.transactionDialog.colStatus')">
              <template #body="{ data }">
                <Chip
                  :label="getStatusLabel(data.status)"
                  :class="getStatusClass(data.status)"
                />
              </template>
            </Column>
          </DataTable>

          <div v-else class="transaction-empty">
            <i class="pi pi-shopping-cart text-3xl text-gray-400"></i>
            <p>{{ t("inventoryManagement.transactionDialog.noOrdersHistory") }}</p>
          </div>

          <div
            v-if="filteredTransactionOrders.length > 0"
            class="transaction-mini-pagination"
          >
            <span>{{ transactionOrderPageInfo }}</span>

            <div class="flex gap-2">
              <Button
                icon="pi pi-angle-left"
                size="small"
                text
                rounded
                :disabled="transactionOrderPage <= 1"
                @click="goTransactionOrderPage(transactionOrderPage - 1)"
              />

              <span class="transaction-page-badge">
                {{ transactionOrderPage }} / {{ transactionOrderTotalPages }}
              </span>

              <Button
                icon="pi pi-angle-right"
                size="small"
                text
                rounded
                :disabled="transactionOrderPage >= transactionOrderTotalPages"
                @click="goTransactionOrderPage(transactionOrderPage + 1)"
              />
            </div>
          </div>
        </div>

        <!-- StockIn History -->
        <div>
          <div class="flex items-center justify-between mb-3! gap-3">
            <h3 class="text-lg font-bold text-gray-900">{{ t("inventoryManagement.transactionDialog.stockinHistory") }}</h3>

            <Chip
              :label="t('inventoryManagement.transactionDialog.stockinCount', { count: filteredTransactionStockIns.length })"
              class="chip-normal"
            />
          </div>

          <DataTable
            v-if="filteredTransactionStockIns.length > 0"
            :value="paginatedTransactionStockIns"
            responsiveLayout="scroll"
            class="transaction-table"
          >
            <Column field="stockInId" header="StockIn ID">
              <template #body="{ data }">
                <span class="font-semibold">#{{ data.stockInId }}</span>
              </template>
            </Column>

            <Column field="stockInDetailId" header="Detail ID">
              <template #body="{ data }">
                <span>#{{ data.stockInDetailId }}</span>
              </template>
            </Column>

            <Column field="stockInDate" :header="t('inventoryManagement.transactionDialog.colStockinDate')">
              <template #body="{ data }">
                {{ formatDateTime(data.stockInDate) }}
              </template>
            </Column>

            <Column field="quantity" :header="t('inventoryManagement.transactionDialog.colStockinQty')">
              <template #body="{ data }">
                <span class="transaction-qty-text">
                  {{ data.quantity }}
                </span>
              </template>
            </Column>
          </DataTable>

          <div v-else class="transaction-empty">
            <i class="pi pi-download text-3xl text-gray-400"></i>
            <p>{{ t("inventoryManagement.transactionDialog.noStockinHistory") }}</p>
          </div>

          <div
            v-if="filteredTransactionStockIns.length > 0"
            class="transaction-mini-pagination"
          >
            <span>{{ transactionStockInPageInfo }}</span>

            <div class="flex gap-2">
              <Button
                icon="pi pi-angle-left"
                size="small"
                text
                rounded
                :disabled="transactionStockInPage <= 1"
                @click="goTransactionStockInPage(transactionStockInPage - 1)"
              />

              <span class="transaction-page-badge">
                {{ transactionStockInPage }} / {{ transactionStockInTotalPages }}
              </span>

              <Button
                icon="pi pi-angle-right"
                size="small"
                text
                rounded
                :disabled="transactionStockInPage >= transactionStockInTotalPages"
                @click="goTransactionStockInPage(transactionStockInPage + 1)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        :label="t('inventoryManagement.transactionDialog.close')"
        icon="pi pi-times"
        @click="emit('update:visible', false)"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Chip from 'primevue/chip';
import TimeRangeFilter from '@/components/common/TimeRangeFilter.vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { itemAPI } from '@/services/itemAPI';
import type { ItemTransactionResponse } from '@/types/item.types';

const props = defineProps<{
  visible: boolean;
  itemId: number | null;
  itemCode: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const { t, locale } = useI18n();
const toast = useToast();

const transactionLoading = ref(false);
const itemTransactions = ref<ItemTransactionResponse | null>(null);

const transactionIdFilter = ref("");
const transactionFilterFromDate = ref("");
const transactionFilterToDate = ref("");
const timeRangeFilterRef = ref<any>(null);
const transactionOrderPage = ref(1);
const transactionStockInPage = ref(1);
const transactionPageSize = 10;

const resetTransactionDateFilters = () => {
  if (timeRangeFilterRef.value) {
    timeRangeFilterRef.value.resetFilters();
  }
};

const buildVnDateTimeOffset = (
  dateValue: string,
  timeValue: "08:00:00" | "07:59:59",
) => {
  if (!dateValue) return "";
  return `${dateValue}T${timeValue}+07:00`;
};

const transactionQuery = computed(() => {
  const finalFromDate = transactionFilterFromDate.value;
  const finalToDate = transactionFilterToDate.value;

  const fromDate = buildVnDateTimeOffset(
    finalFromDate,
    "08:00:00",
  );
  const toDate = buildVnDateTimeOffset(
    finalToDate,
    "07:59:59",
  );

  if (!fromDate && !toDate) return undefined;

  return {
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
  };
});

const transactionDateRangeLabel = computed(() => {
  if (!transactionQuery.value) return t("inventoryManagement.transactionDialog.allHistory");
  return t("inventoryManagement.transactionDialog.selectedDateRange");
});

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return `${Number(value).toLocaleString("vi-VN")} VND`;
};

const formatDateTime = (date?: string) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    Pending: "p-chip-warning",
    Approved: "p-chip-info",
    Completed: "p-chip-success",
    Rejected: "p-chip-danger",
  };
  return (classes[status] || "p-chip-secondary") + " status-chip-fixed";
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    Pending: t("orderManagement.pending"),
    Approved: t("orderManagement.approved"),
    Completed: t("orderManagement.completed"),
    Rejected: t("orderManagement.rejected"),
  };
  return labels[status] || status;
};

const filteredTransactionOrders = computed(() => {
  const orders = itemTransactions.value?.orders || [];
  const term = transactionIdFilter.value.trim().toLowerCase();

  if (!term) return orders;

  return orders.filter((order) => {
    return (
      order.orderId.toString().includes(term) ||
      order.orderDetailId.toString().includes(term) ||
      order.machineName?.toLowerCase().includes(term) || 
      order.lineName?.toLowerCase().includes(term)
    );
  });
});

const filteredTransactionStockIns = computed(() => {
  const stockIns = itemTransactions.value?.stockIns || [];
  const term = transactionIdFilter.value.trim().toLowerCase();

  if (!term) return stockIns;

  return stockIns.filter((stockIn) => {
    return (
      stockIn.stockInId.toString().includes(term) ||
      stockIn.stockInDetailId.toString().includes(term)
    );
  });
});

const transactionOrderTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredTransactionOrders.value.length / transactionPageSize));
});

const transactionStockInTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredTransactionStockIns.value.length / transactionPageSize));
});

const paginatedTransactionOrders = computed(() => {
  const start = (transactionOrderPage.value - 1) * transactionPageSize;
  return filteredTransactionOrders.value.slice(start, start + transactionPageSize);
});

const paginatedTransactionStockIns = computed(() => {
  const start = (transactionStockInPage.value - 1) * transactionPageSize;
  return filteredTransactionStockIns.value.slice(start, start + transactionPageSize);
});

const transactionOrderPageInfo = computed(() => {
  const total = filteredTransactionOrders.value.length;
  if (total === 0) return "0 / 0";

  const start = (transactionOrderPage.value - 1) * transactionPageSize + 1;
  const end = Math.min(transactionOrderPage.value * transactionPageSize, total);

  return `${start} - ${end} / ${total}`;
});

const transactionStockInPageInfo = computed(() => {
  const total = filteredTransactionStockIns.value.length;
  if (total === 0) return "0 / 0";

  const start = (transactionStockInPage.value - 1) * transactionPageSize + 1;
  const end = Math.min(transactionStockInPage.value * transactionPageSize, total);

  return `${start} - ${end} / ${total}`;
});

const goTransactionOrderPage = (page: number) => {
  transactionOrderPage.value = Math.min(
    Math.max(page, 1),
    transactionOrderTotalPages.value,
  );
};

const goTransactionStockInPage = (page: number) => {
  transactionStockInPage.value = Math.min(
    Math.max(page, 1),
    transactionStockInTotalPages.value,
  );
};

watch(transactionIdFilter, () => {
  transactionOrderPage.value = 1;
  transactionStockInPage.value = 1;
});

watch(filteredTransactionOrders, () => {
  if (transactionOrderPage.value > transactionOrderTotalPages.value) {
    transactionOrderPage.value = transactionOrderTotalPages.value;
  }
});

watch(filteredTransactionStockIns, () => {
  if (transactionStockInPage.value > transactionStockInTotalPages.value) {
    transactionStockInPage.value = transactionStockInTotalPages.value;
  }
});

const fetchItemTransactions = async (id: number) => {
  try {
    transactionLoading.value = true;
    const data = transactionQuery.value
      ? await itemAPI.getTransactions(id, transactionQuery.value)
      : await itemAPI.getTransactions(id);
      
    itemTransactions.value = {
      ...data,
      orders: data.orders || [],
      stockIns: data.stockIns || [],
    };
  } catch (error) {
    console.error("Failed to fetch item transactions:", error);
    toast.add({
      severity: "error",
      summary: t("common.toast.error"),
      detail: t("inventoryManagement.messages.fetchTransactionsFailed"),
      life: 3000,
    });
  } finally {
    transactionLoading.value = false;
  }
};

const applyTransactionFilters = () => {
  if (props.itemId) {
    fetchItemTransactions(props.itemId);
  }
};

const resetTransactionFilters = () => {
  transactionIdFilter.value = "";
  resetTransactionDateFilters();
  if (props.itemId) {
    fetchItemTransactions(props.itemId);
  }
};

watch(() => props.visible, async (newVal) => {
  if (newVal && props.itemId) {
    transactionIdFilter.value = "";
    resetTransactionDateFilters();
    transactionOrderPage.value = 1;
    transactionStockInPage.value = 1;
    await fetchItemTransactions(props.itemId);
  } else if (!newVal) {
    itemTransactions.value = null;
  }
});
</script>

<style scoped>
.transaction-summary-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.transaction-summary-card strong {
  font-size: 18px;
  color: #111827;
}

.transaction-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  border: 2px dashed #e5e7eb;
  border-radius: 14px;
  background: #f9fafb;
  color: #6b7280;
}

.transaction-table :deep(.p-datatable-tbody > tr) {
  cursor: default;
}

.transaction-table :deep(.p-datatable-thead > tr > th),
.transaction-table :deep(.p-datatable-tbody > tr > td) {
  white-space: nowrap;
}

.transaction-table :deep(.p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}

.transaction-filter-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.transaction-qty-text {
  display: inline-flex;
  min-width: 42px;
  font-weight: 700;
  color: #111827;
}

.transaction-mini-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  color: #4b5563;
  font-size: 13px;
}

.transaction-page-badge {
  min-width: 72px;
  height: 32px;
  padding: 0 10px;
  border-radius: 999px;
  background: white;
  border: 1px solid #e5e7eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #111827;
}

@media (max-width: 768px) {
  .transaction-mini-pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .transaction-mini-pagination > div {
    justify-content: center;
  }
}

/* Chip Status Styles - Pastel Colors from OrdersView */
:deep(.p-chip-warning) {
  background: #fef3c7 !important;
  color: #d97706 !important;
  border: 1px solid #fde68a !important;
  font-weight: 600 !important;
}

:deep(.p-chip-info) {
  background: #f8fafc !important; 
  color: #2563eb !important;
  font-weight: 600 !important;
}

:deep(.p-chip-success) {
  background: #dcfce7 !important;
  color: #16a34a !important;
  border: 1px solid #bbf7d0 !important;
  font-weight: 600 !important;
}

:deep(.p-chip-danger) {
  background: #fee2e2 !important;
  color: #dc2626 !important;
  border: 1px solid #fecaca !important;
  font-weight: 600 !important;
}

:deep(.status-chip-fixed) {
  width: 120px !important;
  justify-content: center !important;
}
</style>
