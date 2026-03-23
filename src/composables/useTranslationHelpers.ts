// composables/useTranslationHelpers.ts
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'

export function useTranslationHelpers() {
  const { t } = useI18n()
  const dashboardStore = useDashboardStore()

  const departmentOptions = computed(() => [
    { label: t("userManagement.departments.qc"), value: "QC" },
    { label: t("userManagement.departments.kho"), value: "KHO" },
    { label: t("userManagement.departments.repair"), value: "REPAIR" },
    { label: t("userManagement.departments.engineer"), value: "ENGINEER" },
    { label: t("userManagement.departments.sanXuatA"), value: "SẢN XUẤT CA A" },
    { label: t("userManagement.departments.sanXuatB"), value: "SẢN XUẤT CA B" },
  ])

  const unitOptions = computed(() => [
    { label: t('inventoryManagement.units.cai'), value: 'cái' },
    { label: t('inventoryManagement.units.hop'), value: 'hộp' },
    { label: t('inventoryManagement.units.bich'), value: 'bịch' },
    { label: t('inventoryManagement.units.kg'), value: 'kg' },
    { label: t('inventoryManagement.units.cuon'), value: 'cuộn' },
    { label: t('inventoryManagement.units.doi'), value: 'đôi' },
  ])

  const typeOptions = computed(() => [
    { label: t('reports.inventoryReport.typeOptions.all'), value: null },
    { label: t('reports.inventoryReport.typeOptions.engineer'), value: 'ENG' },
    { label: t('reports.inventoryReport.typeOptions.consumer'), value: 'COM' },
    ])

    const stockStatusOptions = computed(() => [
        { label: t('reports.inventoryReport.stockStatusOptions.all'), value: null },
        { label: t('reports.inventoryReport.stockStatusOptions.normal'), value: 'normal' },
        { label: t('reports.inventoryReport.stockStatusOptions.warning'), value: 'warning' },
        { label: t('reports.inventoryReport.stockStatusOptions.low'), value: 'low' },
        { label: t('reports.inventoryReport.stockStatusOptions.critical'), value: 'critical' },
        { label: t('reports.inventoryReport.stockStatusOptions.outOfStock'), value: 'out-of-stock' },
        { label: t('reports.inventoryReport.stockStatusOptions.notConfigured'), value: 'not-configured' },
    ])

    const statusOptions = computed(() => [
        { label: t('reports.orderReport.statusOptions.all'), value: null },
        { label: t('reports.orderReport.statusOptions.pending'), value: 'Pending' },
        { label: t('reports.orderReport.statusOptions.approved'), value: 'Approved' },
        { label: t('reports.orderReport.statusOptions.completed'), value: 'Completed' },
        { label: t('reports.orderReport.statusOptions.rejected'), value: 'Rejected' },
        ])

  const getDepartmentLabel = (value: string | undefined) =>
    departmentOptions.value.find(d => d.value === value)?.label ?? (value || '-')

  const getUnitLabel = (value: string | undefined) =>
    unitOptions.value.find(u => u.value === value)?.label ?? (value || '')

  // Sử dụng logic từ dashboardStore
    const getStockStatusLabel = (item: any) => {
    const status = dashboardStore.getStockStatus(item)
    const key = `reports.inventoryReport.stockStatus.${status.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`
    return t(key, t('reports.inventoryReport.stockStatus.unknown'))
    }

  return { getDepartmentLabel, getUnitLabel, typeOptions, stockStatusOptions, getStockStatusLabel, statusOptions, unitOptions }
}