<template>
  <div class="flex flex-wrap items-end gap-2" :class="{ 'gap-4': !compact }">
    <div :class="compact ? '' : 'flex-1 min-w-[140px]'">
      <label v-if="showLabels" class="block mb-2 text-sm font-semibold text-gray-700">
        {{ t('reports.exportOptions.timeType') }}
      </label>
      <div class="flex gap-2">
        <Dropdown 
          v-model="timeType" 
          :options="timeTypeOptions" 
          optionLabel="label" 
          optionValue="value" 
          :class="compact ? 'w-[120px]' : 'w-full'" 
        />
        <Dropdown 
          v-show="timeType === 'week' || timeType === 'month'" 
          v-model="year" 
          :options="yearOptions" 
          optionLabel="label" 
          optionValue="value" 
          :class="compact ? 'w-[120px]' : 'w-[130px]'" 
        />
      </div>
    </div>

    <div :class="compact ? '' : 'flex-1 min-w-[180px]'">
      <label v-if="showLabels" class="block mb-2 text-sm font-semibold text-gray-700">
        {{ t("reports.chart.from") }}
      </label>
      <InputText v-show="timeType === 'day'" v-model="filterFromDate" type="date" :class="compact ? 'w-[140px]' : 'w-full'" />
      <Dropdown v-show="timeType === 'week'" v-model="filterWeekFrom" :options="weekOptions" optionLabel="label" optionValue="value" :class="compact ? 'w-[200px]' : 'w-full'" filter :filterPlaceholder="t('common.search')" />
      <Dropdown v-show="timeType === 'month'" v-model="filterMonthFrom" :options="monthOptions" optionLabel="label" optionValue="value" :class="compact ? 'w-[140px]' : 'w-full'" />
    </div>

    <div :class="compact ? '' : 'flex-1 min-w-[180px]'">
      <label v-if="showLabels" class="block mb-2 text-sm font-semibold text-gray-700">
        {{ t("reports.chart.to") }}
      </label>
      <InputText v-show="timeType === 'day'" v-model="filterToDate" type="date" :class="compact ? 'w-[140px]' : 'w-full'" />
      <Dropdown v-show="timeType === 'week'" v-model="filterWeekTo" :options="weekOptions" optionLabel="label" optionValue="value" :class="compact ? 'w-[200px]' : 'w-full'" filter :filterPlaceholder="t('common.search')" />
      <Dropdown v-show="timeType === 'month'" v-model="filterMonthTo" :options="monthOptions" optionLabel="label" optionValue="value" :class="compact ? 'w-[140px]' : 'w-full'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';

const props = withDefaults(defineProps<{
  showLabels?: boolean;
  compact?: boolean;
}>(), {
  showLabels: true,
  compact: false,
});

const emit = defineEmits<{
  (e: 'update:fromDate', val: string): void;
  (e: 'update:toDate', val: string): void;
}>();

const { t, locale } = useI18n();

const timeType = ref<'day' | 'week' | 'month'>('day');
const filterWeekFrom = ref<string>("");
const filterWeekTo = ref<string>("");
const filterMonthFrom = ref<string>("");
const filterMonthTo = ref<string>("");

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const formatDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const filterFromDate = ref<string>(formatDateString(firstDayOfMonth));
const filterToDate = ref<string>(formatDateString(today));

const year = ref<number>(new Date().getFullYear());
const yearOptions = computed(() => {
  const y = new Date().getFullYear();
  return [y, y - 1, y - 2, y - 3, y - 4].map(v => ({ label: v.toString(), value: v }));
});

watch(year, () => {
  filterWeekFrom.value = "";
  filterWeekTo.value = "";
  filterMonthFrom.value = "";
  filterMonthTo.value = "";
});

const timeTypeOptions = computed(() => [
  { label: t('reports.exportOptions.day') || 'Ngày', value: 'day' },
  { label: t('reports.chart.periodWeek'), value: 'week' },
  { label: t('reports.chart.periodMonth'), value: 'month' },
]);

const getDateFromWeek = (weekStr: string) => {
  if (!weekStr) return new Date();
  const [yearStr, weekNumStr] = weekStr.split('-W');
  const y = parseInt(yearStr);
  const w = parseInt(weekNumStr);
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getUTCDay();
  const ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
};

const fmtDate = (d: Date) => {
  const currentLocale = locale.value || 'vi-VN';
  return d.toLocaleDateString(currentLocale, { day: '2-digit', month: '2-digit' });
};

const weekOptions = computed(() => {
  const opts = [];
  const y = year.value;
  for (let week = 1; week <= 52; week++) {
    const from = getDateFromWeek(`${y}-W${week.toString().padStart(2, '0')}`);
    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    opts.push({
      label: `${t('reports.chart.periodWeek')} ${week} (${fmtDate(from)}-${fmtDate(to)})`,
      value: `${y}-W${week.toString().padStart(2, '0')}`,
    });
  }
  return opts;
});

const monthOptions = computed(() => {
  const opts = [];
  const y = year.value;
  for (let month = 1; month <= 12; month++) {
    opts.push({
      label: `${t('reports.chart.periodMonth')} ${month}`,
      value: `${y}-${month.toString().padStart(2, '0')}`,
    });
  }
  return opts;
});

const emitUpdates = () => {
  let finalFrom = "";
  let finalTo = "";

  if (timeType.value === 'day') {
    finalFrom = filterFromDate.value;
    finalTo = filterToDate.value;
  } else if (timeType.value === 'week') {
    if (filterWeekFrom.value) {
      const from = getDateFromWeek(filterWeekFrom.value);
      finalFrom = `${from.getFullYear()}-${(from.getMonth()+1).toString().padStart(2,'0')}-${from.getDate().toString().padStart(2,'0')}`;
    }
    if (filterWeekTo.value) {
      const to = getDateFromWeek(filterWeekTo.value);
      to.setDate(to.getDate() + 6);
      finalTo = `${to.getFullYear()}-${(to.getMonth()+1).toString().padStart(2,'0')}-${to.getDate().toString().padStart(2,'0')}`;
    }
  } else if (timeType.value === 'month') {
    if (filterMonthFrom.value) {
      finalFrom = `${filterMonthFrom.value}-01`;
    }
    if (filterMonthTo.value) {
      const [y, m] = filterMonthTo.value.split('-');
      const to = new Date(parseInt(y), parseInt(m), 0);
      finalTo = `${to.getFullYear()}-${(to.getMonth()+1).toString().padStart(2,'0')}-${to.getDate().toString().padStart(2,'0')}`;
    }
  }

  emit('update:fromDate', finalFrom);
  emit('update:toDate', finalTo);
};

const resetFilters = () => {
  filterFromDate.value = "";
  filterToDate.value = "";
  timeType.value = 'day';
  filterWeekFrom.value = "";
  filterWeekTo.value = "";
  filterMonthFrom.value = "";
  filterMonthTo.value = "";
};

defineExpose({
  resetFilters,
});

watch([
  timeType, 
  filterFromDate, filterToDate, 
  filterWeekFrom, filterWeekTo, 
  filterMonthFrom, filterMonthTo
], emitUpdates, { deep: true });

onMounted(() => {
  emitUpdates();
});
</script>
