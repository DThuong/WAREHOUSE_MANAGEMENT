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

      <AnalysisChart />
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


  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { useI18n } from "vue-i18n";
import AnalysisChart from "@/components/AnalysisChart.vue";

const router = useRouter();
const { t } = useI18n();

const isMobile = ref(window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
const handleResize = () => { isMobile.value = window.innerWidth < 768; };
const showUnsupportedDialog = ref(false);
const navigateToReport = (type: string) => {
  if (isMobile.value) { showUnsupportedDialog.value = true; return; }
  router.push({ name: `${type.charAt(0).toUpperCase() + type.slice(1)}Report` });
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

