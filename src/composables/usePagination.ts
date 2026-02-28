import { ref, computed, watch } from 'vue'

export function usePagination<T>(
  sourceList: () => T[],
  defaultPageSize = 10
) {
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)

  // Reset về trang 1 khi danh sách nguồn thay đổi
  watch(
    () => sourceList().length,
    () => { currentPage.value = 1 }
  )

  const totalItems = computed(() => sourceList().length)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalItems.value / pageSize.value))
  )

  // Đảm bảo currentPage không vượt quá totalPages
  watch(totalPages, (newTotal) => {
    if (currentPage.value > newTotal) currentPage.value = newTotal
  })

  const paginatedList = computed<T[]>(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return sourceList().slice(start, start + pageSize.value)
  })

  const pageInfo = computed(() => ({
    from: totalItems.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1,
    to: Math.min(currentPage.value * pageSize.value, totalItems.value),
    total: totalItems.value,
  }))

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) currentPage.value = page
  }

  const nextPage = () => goToPage(currentPage.value + 1)
  const prevPage = () => goToPage(currentPage.value - 1)
  const firstPage = () => goToPage(1)
  const lastPage = () => goToPage(totalPages.value)

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedList,
    pageInfo,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
  }
}