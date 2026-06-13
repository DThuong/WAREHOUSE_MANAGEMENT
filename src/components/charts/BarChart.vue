<template>
  <div class="bar-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface Props {
  chartData: ChartData;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  height: 280,
});

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const createChart = () => {
  if (!chartCanvas.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: props.chartData.datasets.length > 1,
          position: "bottom",
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            font: {
              size: 12,
              weight: "600",
            },
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
              const value = Number(context.parsed.y || 0).toLocaleString("vi-VN");
              return label ? `${label}: ${value}` : value;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 12,
              weight: "600",
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(148, 163, 184, 0.18)",
          },
          ticks: {
            callback: (value) => Number(value).toLocaleString("vi-VN"),
          },
        },
      },
    },
  });
};

onMounted(createChart);

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

watch(
  () => props.chartData,
  () => createChart(),
  { deep: true },
);
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 100%;
  min-height: 260px;
}
</style>