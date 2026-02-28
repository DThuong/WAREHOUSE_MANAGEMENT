<template>
  <div v-if="totalItems > 0" class="app-pagination">
    <!-- Info + Page Size -->
    <div class="pagination-meta">
      <span class="pagination-info">
        Hiển thị
        <strong>{{ pageInfo.from }}–{{ pageInfo.to }}</strong>
        / {{ pageInfo.total }}
      </span>

      <div class="pagesize-select" v-if="showPageSize">
        <div class="pagesize-options">
          <button
            v-for="size in pageSizeOptions"
            :key="size"
            class="pagesize-btn"
            :class="{ active: modelPageSize === size }"
            @click="$emit('update:modelPageSize', size)"
          >
            {{ size }}
          </button>
        </div>
      </div>
    </div>

    <!-- Page Controls -->
    <div class="pagination-controls" v-if="totalPages > 1">
      <!-- First + Prev -->
      <button
        class="page-btn icon-btn btn-first"
        :disabled="currentPage === 1"
        title="Trang đầu"
        @click="$emit('first')"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2v10M5 7l5-4v8L5 7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        class="page-btn icon-btn"
        :disabled="currentPage === 1"
        title="Trang trước"
        @click="$emit('prev')"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Page Numbers -->
      <template v-for="page in visiblePages" :key="page">
        <span v-if="page === '...'" class="page-ellipsis">···</span>
        <button
          v-else
          class="page-btn number-btn"
          :class="{ active: currentPage === page }"
          @click="$emit('goto', page as number)"
        >
          {{ page }}
        </button>
      </template>

      <!-- Next + Last -->
      <button
        class="page-btn icon-btn"
        :disabled="currentPage === totalPages"
        title="Trang sau"
        @click="$emit('next')"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        class="page-btn icon-btn btn-last"
        :disabled="currentPage === totalPages"
        title="Trang cuối"
        @click="$emit('last')"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M12 2v10M9 7L4 3v8l5-4z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface PageInfo {
  from: number
  to: number
  total: number
}

const props = withDefaults(defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
  pageInfo: PageInfo
  modelPageSize?: number
  pageSizeOptions?: number[]
  showPageSize?: boolean
  maxVisible?: number
}>(), {
  modelPageSize: 10,
  pageSizeOptions: () => [5, 10, 20, 50],
  showPageSize: true,
  maxVisible: 5,
})

defineEmits<{
  prev: []
  next: []
  first: []
  last: []
  goto: [page: number]
  'update:modelPageSize': [size: number]
}>()

const visiblePages = computed<(number | '...')[]>(() => {
  const total = props.totalPages
  const cur = props.currentPage
  const max = props.maxVisible

  if (total <= max + 2) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const half = Math.floor(max / 2)
  let start = Math.max(2, cur - half)
  let end = Math.min(total - 1, cur + half)

  if (cur - half <= 2) end = Math.min(total - 1, max)
  if (cur + half >= total - 1) start = Math.max(2, total - max + 1)

  const pages: (number | '...')[] = [1]

  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('...')

  pages.push(total)
  return pages
})
</script>

<style scoped>
.app-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.875rem 0.25rem 0;
  margin-top: 0.5rem;
  min-width: 0;
  overflow: hidden;
}

/* ── Meta row ── */
.pagination-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.pagination-info {
  font-size: 0.8125rem;
  color: #6b7280;
  white-space: nowrap;
}

.pagination-info strong {
  color: #111827;
  font-weight: 600;
}

/* Page size */
.pagesize-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagesize-options {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.pagesize-btn {
  padding: 0.25rem 0.625rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #4b5563;
  background: white;
  border: none;
  border-right: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  line-height: 1.5;
}

.pagesize-btn:last-child {
  border-right: none;
}

.pagesize-btn:hover:not(.active) {
  background: #f3f4f6;
}

.pagesize-btn.active {
  background: #2563eb;
  color: white;
}

/* ── Controls ── */
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;        /* wrap nếu quá nhiều trang */
  justify-content: flex-end;
  min-width: 0;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;
  color: #374151;
  flex-shrink: 0;         /* không bị co lại */
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}

.number-btn {
  min-width: 2rem;
  height: 2rem;
  font-size: 0.8125rem;
  padding: 0 0.375rem;
}

.number-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35);
}

.icon-btn {
  width: 2rem;
  height: 2rem;
  color: #6b7280;
}

.page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-size: 0.875rem;
  color: #9ca3af;
  letter-spacing: 0.05em;
  user-select: none;
  flex-shrink: 0;
}

/* ── Mobile ── */
@media (max-width: 767px) {
  .app-pagination {
    border-top: 1px solid #e5e7eb;
    flex-direction: column;
    align-items: stretch;
    gap: 0.625rem;
  }

  .pagination-meta {
    justify-content: space-between;
  }

  .pagination-controls {
    justify-content: center;
  }

  /* Ẩn first/last trên mobile để bớt chật */
  .btn-first,
  .btn-last {
    display: none;
  }
}
</style>