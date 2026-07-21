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
                >{{ opt === '1 ngày' ? t('reports.chart.period1') : opt === '7 ngày' ? t('reports.chart.period7') : opt === '30 ngày' ? t('reports.chart.period30') : opt === 'Tuần' ? t('reports.chart.periodWeek') : t('reports.chart.periodMonth') }}</button>
              </div>

              <div class="divider-v" style="width: 1px; height: 24px; background: #e2e8f0;"></div>

              <div class="flex items-center gap-2" style="height: 40px;">
                <Button icon="pi pi-chevron-left" text rounded severity="secondary" @click="prevPeriod" :disabled="selectedTime === 'Tháng' || selectedTime === 'Tuần'" style="width: 40px; height: 40px;" />
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
            <div class="summary-label">{{ t('reports.custom.totalStockin') }}</div>
          </div>
        </div>
        <div class="summary-card summary-card-yellow">
          <div class="summary-icon"><i class="pi pi-shopping-cart"></i></div>
          <div class="summary-info">
            <div class="summary-value">{{ summaryData.orderCount }} <span class="summary-unit">đơn</span></div>
            <div class="summary-money">{{ formatCurrency(summaryData.orderValue) }}</div>
            <div class="summary-label">{{ t('reports.custom.totalOrder') }}</div>
          </div>
        </div>
        <div class="summary-card summary-card-green">
          <div class="summary-icon"><i class="pi pi-box"></i></div>
          <div class="summary-info">
            <div class="summary-value">{{ summaryData.totalItems }} <span class="summary-unit">loại</span></div>
            <div class="summary-money">{{ formatNumber(summaryData.totalQty) }} sản phẩm</div>
            <div class="summary-label">{{ t('reports.custom.totalImportedProducts') }}</div>
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
                  <Column :header="t('reports.custom.productDetail')" style="width: 33%">
                    <template #body="{ data }">
                      <div class="flex flex-col gap-2 my-1 w-full">
                        <div v-for="d in data.stockInDetails" :key="d.id" class="flex items-center gap-3 p-2! bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm rounded-md transition-all">
                          <div class="shrink-0">
                            <img v-if="d.item?.picture && d.item.picture.length > 0" :src="d.item.picture[0]" class="w-8 h-8 object-cover rounded-md shadow-sm border border-slate-200" crossorigin="anonymous" />
                            <div v-else class="w-8 h-8 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-medium">IMG</div>
                          </div>
                          <div class="flex-1 min-w-0 flex flex-row items-center justify-between gap-2">
                            <div class="font-medium text-slate-700 text-xs line-clamp-2 leading-snug pr-2">
                              {{ getItemName(d.item) }}
                            </div>
                            <div class="shrink-0 w-20 inline-flex items-center justify-center px-2! py-2! rounded bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 whitespace-nowrap">
                              {{ d.quantity }} <span class="ml-1! text-[10px] font-semibold opacity-80">{{ d.item?.unit || '' }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </Column>
                  <Column class="align-center-col" style="min-width: 100px; width: 100px;">
                    <template #header><div>{{ t('reports.chart.col.totalQty') }}</div></template>
                    <template #body="{ data }">
                      <div class="w-9 h-9 mx-auto flex items-center justify-center rounded-full bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200">
                        {{ calcStockinTotalQty(data) }}
                      </div>
                    </template>
                  </Column>
                  <Column class="align-center-col" :header="t('reports.chart.col.totalValue')" style="min-width: 150px; width: 150px;">
                    <template #body="{ data }">
                      <div class="bg-emerald-500 text-white font-bold py-1! px-2! rounded-lg! shadow-sm w-[130px] mx-auto text-center inline-block">
                        {{ formatCurrency(calcStockinTotalValue(data)) }}
                      </div>
                    </template>
                  </Column>
                  <Column class="align-center-col" :header="t('common.action')" style="min-width: 100px; width: 100px;">
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
                  <Column :header="t('reports.custom.productDetail')" style="width: 33%">
                    <template #body="{ data }">
                      <div class="flex flex-col gap-2 my-1 w-full">
                        <div v-for="d in data.orderDetails" :key="d.id" class="flex items-center gap-3 p-2! bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm rounded-md transition-all">
                          <div class="shrink-0">
                            <img v-if="d.item?.picture && d.item.picture.length > 0" :src="d.item.picture[0]" class="w-8 h-8 object-cover rounded-md shadow-sm border border-slate-200" crossorigin="anonymous" />
                            <div v-else class="w-8 h-8 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-medium">IMG</div>
                          </div>
                          <div class="flex-1 min-w-0 flex flex-row items-center justify-between gap-2">
                            <div class="font-medium text-slate-700 text-xs line-clamp-2 leading-snug pr-2">
                              {{ getItemName(d.item) }}
                            </div>
                            <div class="shrink-0 w-20 inline-flex items-center justify-center px-2! py-2! rounded bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 whitespace-nowrap">
                              {{ d.orderQty }} <span class="ml-1! text-[10px] font-semibold opacity-80">{{ d.item?.unit || '' }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </Column>
                  <Column class="align-center-col" style="min-width: 100px; width: 100px;">
                    <template #header><div>{{ t('reports.chart.col.totalQty') }}</div></template>
                    <template #body="{ data }">
                      <div class="w-9 h-9 mx-auto flex items-center justify-center rounded-full bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200">
                        {{ calcOrderTotalQty(data) }}
                      </div>
                    </template>
                  </Column>
                  <Column class="align-center-col" :header="t('reports.chart.col.totalValue')" style="min-width: 150px; width: 150px;">
                    <template #body="{ data }">
                      <div class="bg-emerald-500 text-white font-bold py-1! px-2! rounded-lg shadow-sm w-[130px] mx-auto text-center inline-block">
                        {{ formatCurrency(calcOrderTotalValue(data)) }}
                      </div>
                    </template>
                  </Column>
                  <Column class="align-center-col" :header="t('common.action')" style="min-width: 100px; width: 100px;">
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
          <Column :header="t('common.product')" style="width: 40%">
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
          <Column :header="t('reports.chart.col.unitPrice')" style="width: 20%">
            <template #body="{ data }">
              <span class="font-medium">{{ formatCurrency(parseFloat(data.item?.price || "0")) }}</span>
            </template>
          </Column>
          <Column field="orderQty" :header="t('common.quantity')" style="width: 20%">
            <template #body="{ data }">
              <span class="font-medium">{{ data.orderQty }} {{ data.item?.unit || "" }}</span>
            </template>
          </Column>
          <Column :header="t('reports.chart.col.totalAmount')" style="width: 20%">
            <template #body="{ data }">
              <div class="font-bold text-emerald-600">{{ formatCurrency(data.orderQty * parseFloat(data.item?.price || "0")) }}</div>
            </template>
          </Column>
        </DataTable>
        <!-- Total -->
        <div class="mt-4! p-3! bg-yellow-50 rounded-lg border border-yellow-200 flex justify-between items-center">
          <span class="font-semibold text-slate-700">{{ t('reports.chart.totalOrderValue') }}</span>
          <span class="text-lg font-bold text-yellow-700">{{ formatCurrency(calcOrderTotalValue(detailOrder)) }}</span>
        </div>
      </div>
      <template #footer>
        <Button :label="t('common.close')" icon="pi pi-times" text @click="showOrderDetail = false" />
      </template>
    </Dialog>

    <!-- Export Excel Dialog -->
    <Dialog
      v-model:visible="showExportDialog"
      modal
      :header="t('reports.exportOptions.title')"
      :style="{ width: '90vw', maxWidth: '400px' }"
      class="p-fluid"
      :dismissableMask="true"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="field">
          <label class="font-medium text-slate-700 block mb-2">{{ t('reports.exportOptions.timeType') }}</label>
          <div class="flex gap-4">
            <div class="flex items-center">
              <RadioButton v-model="exportType" inputId="exDay" name="exportType" value="day" />
              <label for="exDay" class="ml-2">{{ t('reports.exportOptions.day') }}</label>
            </div>
            <div class="flex items-center">
              <RadioButton v-model="exportType" inputId="exWeek" name="exportType" value="week" />
              <label for="exWeek" class="ml-2">{{ t('reports.exportOptions.week') }}</label>
            </div>
            <div class="flex items-center">
              <RadioButton v-model="exportType" inputId="exMonth" name="exportType" value="month" />
              <label for="exMonth" class="ml-2">{{ t('reports.exportOptions.month') }}</label>
            </div>
          </div>
        </div>

        <div class="field flex flex-col gap-3" v-if="exportType === 'day'">
          <div>
            <label class="font-medium text-slate-700 block mb-2">Từ ngày</label>
            <Calendar v-model="exportDateFrom" dateFormat="dd/mm/yy" :showIcon="true" class="w-full" inputClass="w-full" />
          </div>
          <div>
            <label class="font-medium text-slate-700 block mb-2">Đến ngày</label>
            <Calendar v-model="exportDateTo" dateFormat="dd/mm/yy" :showIcon="true" class="w-full" inputClass="w-full" />
          </div>
        </div>

        <div class="field flex flex-col gap-3" v-if="exportType === 'week'">
          <div>
            <label class="font-medium text-slate-700 block mb-2">Từ tuần (Năm-Tuần)</label>
            <input type="week" v-model="exportWeekFrom" class="p-inputtext p-component w-full" />
          </div>
          <div>
            <label class="font-medium text-slate-700 block mb-2">Đến tuần (Năm-Tuần)</label>
            <input type="week" v-model="exportWeekTo" class="p-inputtext p-component w-full" />
          </div>
        </div>

        <div class="field flex flex-col gap-3" v-if="exportType === 'month'">
          <div>
            <label class="font-medium text-slate-700 block mb-2">Từ tháng</label>
            <Calendar v-model="exportMonthFrom" view="month" dateFormat="mm/yy" :showIcon="true" class="w-full" inputClass="w-full" />
          </div>
          <div>
            <label class="font-medium text-slate-700 block mb-2">Đến tháng</label>
            <Calendar v-model="exportMonthTo" view="month" dateFormat="mm/yy" :showIcon="true" class="w-full" inputClass="w-full" />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 mt-4">
          <Button :label="t('reports.exportOptions.cancel')" icon="pi pi-times" text @click="showExportDialog = false" />
          <Button :label="t('reports.exportOptions.confirmExport')" icon="pi pi-check" @click="executeExport" :loading="exporting" />
        </div>
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
import RadioButton from "primevue/radiobutton";
import { useI18n } from "vue-i18n";
import { itemAPI } from "@/services/itemAPI";
import { stockinAPI } from "@/services/stockinAPI";
import { orderAPI } from "@/services/orderAPI";
import type { Item, DailyMovement, DailyMovementItem } from "@/types/item.types";
import { useDashboardStore, type AreaKey } from "@/stores/dashboard";
import * as XLSX from "xlsx";

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
const showExportDialog = ref(false);
const exportType = ref('day');
const exportDateFrom = ref<Date>(new Date());
const exportDateTo = ref<Date>(new Date());
const exportMonthFrom = ref<Date>(new Date());
const exportMonthTo = ref<Date>(new Date());
const getWeekString = (d: Date) => {
  const dClone = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = dClone.getUTCDay() || 7;
  dClone.setUTCDate(dClone.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dClone.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((dClone.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  return dClone.getUTCFullYear() + '-W' + String(weekNo).padStart(2, '0');
};
const exportWeekFrom = ref<string>(getWeekString(new Date()));
const exportWeekTo = ref<string>(getWeekString(new Date()));

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

const getWeekNumber = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
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
  categoryPercentage: 0.5,
  borderRadius: 2,
  borderWidth: 0,
};

// ── State ─────────────────────────────────────────────────
const loading = ref(false);
const detailLoading = ref(false);
const detailClickedCol = ref("");

const timeOptions = ["1 ngày", "7 ngày", "30 ngày", "Tuần", "Tháng"];
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
  if (selectedTime.value === "Tháng" || selectedTime.value === "Tuần") return t("reports.chart.periodAll");
  if (selectedTime.value === "1 ngày") return `${fmtDate(fromDate.value)}`;
  return `${fmtDate(fromDate.value)} - ${fmtDate(toDate.value)}`;
});

const isNextDisabled = computed(() => {
  const todayEnd = getTodayEnd();
  return toDate.value >= todayEnd || selectedTime.value === "Tháng" || selectedTime.value === "Tuần";
});

const prevPeriod = () => {
  if (selectedTime.value === "Tháng" || selectedTime.value === "Tuần") return;
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
  if (isNextDisabled.value || selectedTime.value === "Tháng" || selectedTime.value === "Tuần") return;
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
  } else if (type === "Tuần") {
    // Tuần: chỉ lấy 1 năm gần nhất tính từ hôm nay trở lại
    const from = new Date(today); from.setFullYear(today.getFullYear() - 1); from.setHours(0, 0, 0, 0);
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
  } else if (timeType === "Tuần") {
    // Tuần -> group by week (Monday -> Sunday), mỗi cột = 1 tuần
    const start = new Date(from); start.setHours(0, 0, 0, 0);
    // lùi về thứ Hai của tuần chứa "from" (getDay: 0=CN, 1=T2, ...)
    const dow = start.getDay();
    const diffToMonday = dow === 0 ? -6 : 1 - dow;
    start.setDate(start.getDate() + diffToMonday);
    const cursor = new Date(start);
    while (cursor <= effectiveTo) {
      const s = new Date(cursor); s.setHours(0, 0, 0, 0);
      const e = new Date(cursor); e.setDate(e.getDate() + 6); e.setHours(23, 59, 59, 999);
      const chunkTo = e > effectiveTo ? new Date(effectiveTo) : e;
      const { week, year } = getWeekNumber(s);
      chunks.push({ label: `${t('reports.chart.weekShort')}${week}/${year}`, fromDate: s, toDate: chunkTo });
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    // Tháng -> group by month

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
    if (selectedTime.value === "Tháng" || selectedTime.value === "Tuần") {
      finalResults = results.slice(-12);
    } else {
      finalResults = results;
    }
  }

  fullReportData.value = finalResults;

  chartData.value = {
    labels: finalResults.map(r => r.label),
    datasets: [
      { label: t("reports.custom.stockinMoney"), backgroundColor: "#3b82f6", ...DS, data: finalResults.map(r => r.totalInValue) },
      { label: t("reports.custom.orderMoney"), backgroundColor: "#eab308", ...DS, data: finalResults.map(r => r.totalOutValue) },
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
  if (label === t("reports.custom.stockinMoney")) {
    detailClickedCol.value = "stockin";
    selectedChartData.value = clickedChunk.rawStockins || [];
  } else if (label === t("reports.custom.orderMoney")) {
    detailClickedCol.value = "order";
    selectedChartData.value = clickedChunk.rawOrders || [];
  }
};

// ── Export Excel ──────────────────────────────────────────
const onExportExcel = () => {
  showExportDialog.value = true;
};

const executeExport = async () => {
  if (exportType.value === 'day' && (!exportDateFrom.value || !exportDateTo.value)) return;
  if (exportType.value === 'week' && (!exportWeekFrom.value || !exportWeekTo.value)) return;
  if (exportType.value === 'month' && (!exportMonthFrom.value || !exportMonthTo.value)) return;

  exporting.value = true;
  try {
    let exportFrom: Date;
    let exportTo: Date;
    let label = '';

    if (exportType.value === 'day') {
      const dFrom = exportDateFrom.value as Date;
      const dTo = exportDateTo.value as Date;
      exportFrom = new Date(dFrom); exportFrom.setHours(0, 0, 0, 0);
      exportTo = new Date(dTo); exportTo.setHours(23, 59, 59, 999);
      label = `${fmtAPI(exportFrom)}_${fmtAPI(exportTo)}`;
    } else if (exportType.value === 'week') {
      const [yearFromStr, weekFromStr] = exportWeekFrom.value.split('-W');
      const [yearToStr, weekToStr] = exportWeekTo.value.split('-W');
      
      const yearFrom = parseInt(yearFromStr);
      const weekFrom = parseInt(weekFromStr);
      const jan4From = new Date(yearFrom, 0, 4);
      const dayOfWeekFrom = jan4From.getDay() || 7;
      const week1StartFrom = new Date(yearFrom, 0, 4 - dayOfWeekFrom + 1);
      exportFrom = new Date(week1StartFrom.getTime() + (weekFrom - 1) * 7 * 86400000);
      exportFrom.setHours(0, 0, 0, 0);

      const yearTo = parseInt(yearToStr);
      const weekTo = parseInt(weekToStr);
      const jan4To = new Date(yearTo, 0, 4);
      const dayOfWeekTo = jan4To.getDay() || 7;
      const week1StartTo = new Date(yearTo, 0, 4 - dayOfWeekTo + 1);
      const exportToStart = new Date(week1StartTo.getTime() + (weekTo - 1) * 7 * 86400000);
      exportTo = new Date(exportToStart.getTime() + 6 * 86400000);
      exportTo.setHours(23, 59, 59, 999);

      label = `Tu_Tuan_${weekFrom}_${yearFrom}_Den_Tuan_${weekTo}_${yearTo}`;
    } else {
      const mFrom = exportMonthFrom.value as Date;
      const mTo = exportMonthTo.value as Date;
      exportFrom = new Date(mFrom.getFullYear(), mFrom.getMonth(), 1);
      exportFrom.setHours(0, 0, 0, 0);
      exportTo = new Date(mTo.getFullYear(), mTo.getMonth() + 1, 0);
      exportTo.setHours(23, 59, 59, 999);
      label = `Tu_Thang_${String(mFrom.getMonth() + 1).padStart(2, '0')}_${mFrom.getFullYear()}_Den_Thang_${String(mTo.getMonth() + 1).padStart(2, '0')}_${mTo.getFullYear()}`;
    }

    const fDate = fmtAPI(exportFrom);
    const tDate = fmtAPI(exportTo);
    
    let stockinData = await stockinAPI.filterStockin(fDate, tDate);
    let orderData = await orderAPI.filterOrders({ fromDate: fDate, toDate: tDate, status: "Completed" });

    if (selectedArea.value !== "ALL") {
      stockinData = stockinData.filter((s: any) => s.area === selectedArea.value);
      orderData = orderData.filter((o: any) => o.area === selectedArea.value);
    }

    const allStockins = stockinData || [];
    const allOrders = orderData || [];

    const stockinRows: any[] = [];
    allStockins.forEach((s: any) => {
      const sDetails = s.stockInDetails || [];
      if (sDetails.length === 0) {
        stockinRows.push({
          "Mã phiếu": s.id,
          "Ngày nhập": formatDate(s.stockInDate),
          "Người tạo": s.account?.username || "-",
          "Tên sản phẩm": "-",
          "Số lượng": 0,
          "Đơn vị": "-",
          "Đơn giá (VNĐ)": 0,
          "Thành tiền (VNĐ)": 0,
        });
      } else {
        sDetails.forEach((d: any) => {
          stockinRows.push({
            "Mã phiếu": s.id,
            "Ngày nhập": formatDate(s.stockInDate),
            "Người tạo": s.account?.username || "-",
            "Tên sản phẩm": getItemName(d.item),
            "Số lượng": d.quantity || 0,
            "Đơn vị": d.item?.unit || "-",
            "Đơn giá (VNĐ)": d.item?.price || 0,
            "Thành tiền (VNĐ)": (d.quantity || 0) * (d.item?.price || 0),
          });
        });
      }
    });

    const orderRows: any[] = [];
    allOrders.forEach((o: any) => {
      const oDetails = o.orderDetails || [];
      if (oDetails.length === 0) {
        orderRows.push({
          "Mã đơn": o.id,
          "Ngày đặt": formatDate(o.orderDate),
          "Người đặt": o.nameWorker || o.account?.username || "-",
          "Bộ phận": o.account?.department || "-",
          "Tên sản phẩm": "-",
          "Số lượng": 0,
          "Đơn vị": "-",
          "Đơn giá (VNĐ)": 0,
          "Thành tiền (VNĐ)": 0,
        });
      } else {
        oDetails.forEach((d: any) => {
          orderRows.push({
            "Mã đơn": o.id,
            "Ngày đặt": formatDate(o.orderDate),
            "Người đặt": o.nameWorker || o.account?.username || "-",
            "Bộ phận": o.account?.department || "-",
            "Tên sản phẩm": getItemName(d.item),
            "Số lượng": d.orderQty || 0,
            "Đơn vị": d.item?.unit || "-",
            "Đơn giá (VNĐ)": d.item?.price || 0,
            "Thành tiền (VNĐ)": (d.orderQty || 0) * (d.item?.price || 0),
          });
        });
      }
    });

    const wb = XLSX.utils.book_new();

    const wsStockin = XLSX.utils.json_to_sheet(
      stockinRows.length
        ? stockinRows
        : [{ "Mã phiếu": "", "Ngày nhập": "", "Người tạo": "", "Tên sản phẩm": "", "Số loại SP": "", "Tổng số lượng": "", "Tổng tiền (VND)": "" }]
    );
    wsStockin["!cols"] = [{ wch: 10 }, { wch: 20 }, { wch: 18 }, { wch: 40 }, { wch: 12 }, { wch: 14 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsStockin, "Nhập kho");

    const wsOrder = XLSX.utils.json_to_sheet(
      orderRows.length
        ? orderRows
        : [{ "Mã đơn": "", "Ngày đặt": "", "Người đặt": "", "Bộ phận": "", "Tên sản phẩm": "", "Số loại SP": "", "Tổng số lượng": "", "Tổng tiền (VND)": "" }]
    );
    wsOrder["!cols"] = [{ wch: 10 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 40 }, { wch: 12 }, { wch: 14 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsOrder, "Đơn hàng");

    const areaSuffix = selectedArea.value === "ALL" ? "" : `_${selectedArea.value}`;
    const fileName = `bao_cao${areaSuffix}_${label}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    showExportDialog.value = false;
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
  
  selectedTime.value = ""; // reset to bypass early return
  onTimeTabClick("1 ngày");
});

onUnmounted(() => { window.removeEventListener("resize", handleResize); });
</script>

<style scoped>
:deep(.align-center-col .p-column-header-content) {
  justify-content: center !important;
}
:deep(.align-center-col) {
  text-align: center !important;
}

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