<template>
  <div class="line-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
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

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  tension?: number;
  fill?: boolean;
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
  height: 300,
});

const emit = defineEmits<{
  pointClick: [payload: { datasetIndex: number; index: number; label: string }];
}>();

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
    type: "line",
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      onHover: (event, elements) => {
        if (event.native?.target) {
          (event.native.target as HTMLElement).style.cursor =
            elements.length ? "pointer" : "default";
        }
      },
      onClick: (_event, elements) => {
        if (!elements.length) return;
        const el = elements[0];
        const label = String(props.chartData.labels[el.index] ?? "");
        emit("pointClick", {
          datasetIndex: el.datasetIndex,
          index: el.index,
          label,
        });
      },
      plugins: {
        legend: {
          display: true,
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
              return `${label}: ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
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
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
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
.line-chart-container {
  width: 100%;
  height: 100%;
  min-height: 280px;
}
</style>