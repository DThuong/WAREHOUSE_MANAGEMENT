<template>
  <MainLayout>
    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 style="font-size: 1.5rem; font-weight: 700;">Nhà cung cấp</h2>
        <Button label="Thêm nhà cung cấp" icon="pi pi-plus" />
      </div>

      <Card>
        <template #content>
          <DataTable :value="suppliers" :paginator="true" :rows="10">
            <Column field="id" header="ID" sortable></Column>
            <Column field="name" header="Tên nhà cung cấp" sortable></Column>
            <Column field="contact" header="Liên hệ"></Column>
            <Column field="email" header="Email" sortable></Column>
            <Column field="phone" header="Số điện thoại"></Column>
            <Column field="products" header="Sản phẩm" sortable></Column>
            <Column header="Hành động">
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

const suppliers = ref([
  { id: 1, name: 'Apple Inc.', contact: 'Tim Cook', email: 'supplier@apple.com', phone: '+1-408-996-1010', products: 45 },
  { id: 2, name: 'Samsung Electronics', contact: 'Kim Jong-hee', email: 'contact@samsung.com', phone: '+82-2-2255-0114', products: 62 },
  { id: 3, name: 'Sony Corporation', contact: 'Kenichiro Yoshida', email: 'info@sony.com', phone: '+81-3-6748-2111', products: 38 },
  { id: 4, name: 'LG Electronics', contact: 'Cho Joo-wan', email: 'support@lg.com', phone: '+82-2-3773-1114', products: 28 },
  { id: 5, name: 'Dell Technologies', contact: 'Michael Dell', email: 'contact@dell.com', phone: '+1-512-338-4400', products: 52 }
])
</script>
