<template>
  <MainLayout>
    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold mb-4 text-gray-900">Quản lý hàng tồn kho</h2>
          <p class="text-gray-600">Quản lý tất cả sản phẩm trong kho</p>
        </div>
        <Button label="Thêm sản phẩm mới" icon="pi pi-plus" class="btn-primary" />
      </div>

      <Card>
        <template #content>
          <DataTable 
            :value="products" 
            :paginator="true" 
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} sản phẩm"
            responsiveLayout="scroll"
          >
            <Column field="id" header="ID" sortable class="w-20"></Column>
            <Column header="Sản phẩm">
              <template #body="slotProps">
                <div class="flex items-center gap-2">
                  <img 
                    :src="slotProps.data.image" 
                    :alt="slotProps.data.name" 
                    class="w-12 h-12 rounded-lg object-cover" 
                  />
                  <div>
                    <p class="font-semibold text-gray-900">{{ slotProps.data.name }}</p>
                    <p class="text-sm text-gray-500">{{ slotProps.data.category }}</p>
                  </div>
                </div>
              </template>
            </Column>
            <Column field="sku" header="SKU" sortable></Column>
            <Column field="price" header="Giá" sortable>
              <template #body="slotProps">
                <span class="font-medium">${{ slotProps.data.price.toLocaleString('vi-VN') }}</span>
              </template>
            </Column>
            <Column field="stock" header="Tồn kho" sortable>
              <template #body="slotProps">
                <Chip 
                  :label="slotProps.data.stock + ' đơn vị'" 
                  :class="slotProps.data.stock < 10 ? 'p-chip-danger' : 'p-chip-success'"
                />
              </template>
            </Column>
            <Column field="status" header="Trạng thái">
              <template #body="slotProps">
                <span 
                  class="badge"
                  :class="slotProps.data.status === 'active' ? 'badge-success' : 'badge-danger'"
                >
                  {{ slotProps.data.status === 'active' ? 'Hoạt động' : 'Ngừng' }}
                </span>
              </template>
            </Column>
            <Column header="Hành động" class="w-36">
              <template #body>
                <div class="flex gap-2">
                  <Button icon="pi pi-pencil" text rounded severity="secondary" />
                  <Button icon="pi pi-trash" text rounded severity="danger" />
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

const products = ref([
  {
    id: 1,
    name: 'Tai nghe không dây Sony WH-1000XM5',
    category: 'Âm thanh',
    sku: 'SKU-001',
    price: 399,
    stock: 45,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'
  },
  {
    id: 2,
    name: 'MacBook Pro 16" M3 Max',
    category: 'Máy tính',
    sku: 'SKU-002',
    price: 3499,
    stock: 12,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop'
  },
  {
    id: 3,
    name: 'Samsung Galaxy Watch 6',
    category: 'Đồng hồ',
    sku: 'SKU-004',
    price: 299,
    stock: 23,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=100&h=100&fit=crop'
  },
  {
    id: 4,
    name: 'iPad Air 11" M2',
    category: 'Máy tính bảng',
    sku: 'SKU-005',
    price: 599,
    stock: 5,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&h=100&fit=crop'
  }
])
</script>