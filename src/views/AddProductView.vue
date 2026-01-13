<template>
  <MainLayout>
    <div class="animate-fade-in" style="max-width: 900px;">
      <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem;">Thêm sản phẩm mới</h2>

      <Card>
        <template #content>
          <form @submit.prevent="handleSubmit" class="grid gap-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Tên sản phẩm *</label>
                <InputText v-model="form.name" placeholder="Nhập tên sản phẩm" style="width: 100%;" />
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">SKU *</label>
                <InputText v-model="form.sku" placeholder="SKU-XXX" style="width: 100%;" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Danh mục *</label>
                <Dropdown 
                  v-model="form.category" 
                  :options="categories" 
                  optionLabel="label" 
                  placeholder="Chọn danh mục" 
                  style="width: 100%;"
                />
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nhà cung cấp *</label>
                <Dropdown 
                  v-model="form.supplier" 
                  :options="suppliers" 
                  optionLabel="label" 
                  placeholder="Chọn nhà cung cấp" 
                  style="width: 100%;"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Giá nhập ($) *</label>
                <InputText v-model.number="form.costPrice" type="number" placeholder="0.00" style="width: 100%;" />
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Giá bán ($) *</label>
                <InputText v-model.number="form.sellingPrice" type="number" placeholder="0.00" style="width: 100%;" />
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Số lượng *</label>
                <InputText v-model.number="form.quantity" type="number" placeholder="0" style="width: 100%;" />
              </div>
            </div>

            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Mô tả</label>
              <textarea 
                v-model="form.description" 
                rows="4" 
                placeholder="Nhập mô tả sản phẩm..."
                style="width: 100%; padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: 8px; font-family: inherit; resize: vertical;"
              ></textarea>
            </div>

            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Hình ảnh sản phẩm</label>
              <div 
                style="border: 2px dashed var(--gray-300); border-radius: 12px; padding: 3rem; text-align: center; cursor: pointer;"
                @click="triggerFileInput"
              >
                <i class="pi pi-cloud-upload" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                <p style="color: var(--gray-600); margin-bottom: 0.5rem;">Kéo thả hình ảnh vào đây hoặc click để chọn</p>
                <p style="font-size: 0.875rem; color: var(--gray-500);">PNG, JPG, WEBP (Max. 5MB)</p>
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept="image/*" 
                  style="display: none;" 
                  @change="handleFileChange"
                />
              </div>
            </div>

            <div class="flex gap-3 justify-end" style="padding-top: 1rem; border-top: 1px solid var(--gray-200);">
              <Button label="Hủy" severity="secondary" outlined />
              <Button label="Lưu sản phẩm" type="submit" icon="pi pi-check" />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import MainLayout from '@/components/MainLayout.vue'

const fileInput = ref(null)

const form = ref({
  name: '',
  sku: '',
  category: null,
  supplier: null,
  costPrice: 0,
  sellingPrice: 0,
  quantity: 0,
  description: '',
  images: []
})

const categories = [
  { label: 'Điện thoại', value: 'phones' },
  { label: 'Máy tính', value: 'computers' },
  { label: 'Âm thanh', value: 'audio' },
  { label: 'Phụ kiện', value: 'accessories' },
  { label: 'Đồng hồ', value: 'watches' }
]

const suppliers = [
  { label: 'Apple Inc.', value: 'apple' },
  { label: 'Samsung Electronics', value: 'samsung' },
  { label: 'Sony Corporation', value: 'sony' },
  { label: 'LG Electronics', value: 'lg' },
  { label: 'Dell Technologies', value: 'dell' }
]

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    form.value.images.push(...files)
  }
}

const handleSubmit = () => {
  console.log('Form submitted:', form.value)
  // Handle form submission logic here
}
</script>
