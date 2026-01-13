<template>
  <MainLayout>
    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-4">
        <h2 style="font-size: 1.5rem; font-weight: 700;"></h2>
        <Button label="Thêm khách hàng" icon="pi pi-plus" />
      </div>

      <Card>
        <template #content>
          <DataTable :value="customers" :paginator="true" :rows="10"  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown">
            <Column field="id" header="ID" sortable></Column>
            <Column header="Khách hàng">
              <template #body="slotProps">
                <div class="flex items-center gap-2">
                  <Avatar :image="slotProps.data.avatar" shape="circle" />
                  <div>
                    <p style="font-weight: 600;">{{ slotProps.data.name }}</p>
                    <p style="font-size: 0.875rem; color: var(--gray-500);">{{ slotProps.data.email }}</p>
                  </div>
                </div>
              </template>
            </Column>
            <Column field="phone" header="Số điện thoại"></Column>
            <Column field="orders" header="Đơn hàng" sortable></Column>
            <Column field="totalSpent" header="Tổng chi tiêu" sortable>
              <template #body="slotProps">
                ${{ slotProps.data.totalSpent.toLocaleString('vi-VN') }}
              </template>
            </Column>
            <Column field="type" header="Loại">
              <template #body="slotProps">
                <span 
                  class="badge"
                  :class="slotProps.data.type === 'vip' ? 'badge-warning' : 'badge-info'"
                >
                  {{ slotProps.data.type === 'vip' ? 'VIP' : 'Thường' }}
                </span>
              </template>
            </Column>
            <Column header="Hành động">
              <template #body>
                <div class="flex gap-2">
                  <Button icon="pi pi-eye" text rounded severity="secondary" />
                  <Button icon="pi pi-pencil" text rounded severity="secondary" />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import MainLayout from '@/components/MainLayout.vue'

const customers = ref([
  { 
    id: 1, 
    name: 'John Doe', 
    email: 'john.doe@email.com', 
    phone: '+1-555-0123', 
    orders: 24, 
    totalSpent: 12450, 
    type: 'vip',
    avatar: 'https://i.pravatar.cc/150?img=12'
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    email: 'jane.smith@email.com', 
    phone: '+1-555-0124', 
    orders: 8, 
    totalSpent: 3200, 
    type: 'regular',
    avatar: 'https://i.pravatar.cc/150?img=5'
  },
  { 
    id: 3, 
    name: 'Mike Johnson', 
    email: 'mike.j@email.com', 
    phone: '+1-555-0125', 
    orders: 15, 
    totalSpent: 8750, 
    type: 'vip',
    avatar: 'https://i.pravatar.cc/150?img=8'
  },
  { 
    id: 4, 
    name: 'Sarah Williams', 
    email: 'sarah.w@email.com', 
    phone: '+1-555-0126', 
    orders: 5, 
    totalSpent: 1890, 
    type: 'regular',
    avatar: 'https://i.pravatar.cc/150?img=10'
  },
  { 
    id: 5, 
    name: 'David Brown', 
    email: 'david.brown@email.com', 
    phone: '+1-555-0127', 
    orders: 32, 
    totalSpent: 18900, 
    type: 'vip',
    avatar: 'https://i.pravatar.cc/150?img=15'
  }
])
</script>

<style scoped>
:deep(nav.p-datatable-paginator-bottom) {
  border-bottom: none !important;
}
</style>
