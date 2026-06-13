<template>
  <div class="area-trend-chart">
    <div class="area-trend-header">
      <h3 class="area-trend-title">{{ title }}</h3>
      <SelectButton
        v-model="periodModel"
        :options="periodOptions"
        optionLabel="label"
        optionValue="value"
        :allowEmpty="false"
        class="area-trend-period"
      />
    </div>

    <div v-if="loading" class="area-trend-loading">
      <ProgressSpinner style="width: 32px; height: 32px" strokeWidth="4" />
    </div>

    <div v-else-if="!labels.length" class="area-trend-empty">
      <i class="pi pi-chart-line" style="font-size: 2rem; color: #cbd5e1"></i>
      <p>{{ emptyText || t('areaTrendChart.noData') }}</p>
    </div>

    <div v-else class="area-trend-canvas-wrap">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <p v-if="labels.length" class="area-trend-hint">
      <i class="pi pi-info-circle"></i>
      {{ t('areaTrendChart.hint') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import SelectButton from "primevue/selectbutton";
import ProgressSpinner from "primevue/progressspinner";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

interface Props {
  title: string;
  labels: string[];
  smdData: number[];
  mainlineData: number[];
  valueLabel?: string;
  loading?: boolean;
  emptyText?: string;
  period: "7" | "30" | "all";
}

const { t } = useI18n();

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  (e: "update:period", value: "7" | "30" | "all"): void;
  (e: "point-click", index: number): void;
}>();

const periodOptions = computed(() => [
  { label: t("areaTrendChart.period7"), value: "7" },
  { label: t("areaTrendChart.period30"), value: "30" },
  { label: t("areaTrendChart.periodAll"), value: "all" },
]);

const periodModel = ref(props.period);

watch(periodModel, (val) => emit("update:period", val));
watch(
  () => props.period,
  (val) => {
    periodModel.value = val;
  },
);

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const createChart = () => {
  if (!chartCanvas.value) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: props.labels,
      datasets: [
        {
          label: `SMD - ${props.valueLabel || t('areaTrendChart.valueLabel')}`,
          data: props.smdData,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.12)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: "#3b82f6",
        },
        {
          label: `MAINLINE - ${props.valueLabel || t('areaTrendChart.valueLabel')}`,
          data: props.mainlineData,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: "#10b981",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      onClick: (event, elements, chart) => {
        const points = chart.getElementsAtEventForMode(
          event as any,
          "index",
          { intersect: false },
          false,
        );
        if (points.length) {
          emit("point-click", points[0].index);
        }
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            font: { size: 12, weight: 600 as any },
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || "";
              const value = Number(context.parsed.y || 0).toLocaleString(
                "vi-VN",
              );
              return `${label}: ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(148, 163, 184, 0.18)" },
          ticks: {
            callback: (value) => Number(value).toLocaleString("vi-VN"),
          },
        },
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 7,
          hitRadius: 8,
        },
      },
    },
  });

  if (chartCanvas.value) {
    chartCanvas.value.style.cursor = "pointer";
  }
};

onMounted(() => {
  createChart();
});

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy();
});

watch(
  [() => props.labels, () => props.smdData, () => props.mainlineData, () => props.loading],
  async () => {
    await nextTick();
    createChart();
  },
  { deep: true },
);
</script>

<style scoped>
.area-trend-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.area-trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.area-trend-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: var(--gray-900);
}

.area-trend-canvas-wrap {
  width: 100%;
  height: 320px;
  position: relative;
}

.area-trend-loading,
.area-trend-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 240px;
  color: var(--gray-500);
}

.area-trend-hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

:deep(.area-trend-period .p-button) {
  font-size: 0.8rem;
  padding: 0.4rem 0.75rem;
}

@media (max-width: 768px) {
  .area-trend-canvas-wrap {
    height: 260px;
  }
}
</style>
