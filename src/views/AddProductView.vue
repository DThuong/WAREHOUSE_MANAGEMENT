<template>
  <MainLayout>
    <div class="animate-fade-in" style="max-width: 900px; margin: 0 auto;">
      <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">Thêm sản phẩm mới</h2>

      <Card>
        <template #content>
          <!-- Tab Selection -->
          <TabView v-model:activeIndex="activeTab">
            <!-- Engineer Tab -->
            <TabPanel header="Hàng kỹ thuật">
              <form @submit.prevent="handleSubmit" class="grid gap-6">
                <!-- Common Fields -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                      Type <span style="color: #ef4444;">*</span>
                    </label>

                    <InputText 
                      value="Engineer"
                      disabled
                      style="width: 100%; background-color: var(--surface-100); cursor: not-allowed;"
                    />
                  </div>
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Unit <span style="color: #ef4444;">*</span></label>
                    <InputText v-model="form.unit" placeholder="VD: cái, hộp, kg" style="width: 100%;" />
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Price <span style="color: #ef4444;">*</span></label>
                    <InputText type="number" v-model="form.price" placeholder="0" style="width: 100%;" />
                  </div>
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Safe Quantity <span style="color: #ef4444;">*</span></label>
                    <InputText v-model.number="form.saveQuantity" type="number" placeholder="0" style="width: 100%;" />
                  </div>
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Inventory Quantity <span style="color: #ef4444;">*</span></label>
                    <InputText v-model.number="form.stockQty" type="number" placeholder="0" style="width: 100%;" />
                  </div>
                </div>

                <!-- Engineer Specific Fields -->
                <div style="border-top: 2px solid var(--gray-200); padding-top: 1.5rem; margin-top: 1rem;">
                  <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; color: var(--primary-color);">
                    <i class="pi pi-cog" style="margin-right: 0.5rem;"></i>
                    Thông tin hàng kỹ thuật
                  </h3>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Part Name <span style="color: #ef4444;">*</span></label>
                      <InputText v-model="form.eng.partname" placeholder="Nhập tên part" style="width: 100%;" />
                    </div>
                    <div>
                      <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Location <span style="color: #ef4444;">*</span></label>
                      <InputText v-model="form.eng.location" placeholder="Nhập vị trí" style="width: 100%;" />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4" style="margin-top: 1rem;">
                    <div>
                      <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Vendor <span style="color: #ef4444;">*</span></label>
                      <InputText v-model="form.eng.vender" placeholder="Nhập nhà cung cấp" style="width: 100%;" />
                    </div>
                    <div>
                      <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description <span style="color: #ef4444;">*</span></label>
                      <InputText v-model="form.eng.description" placeholder="Nhập mô tả" style="width: 100%;" />
                    </div>
                  </div>
                </div>

                <!-- Image Upload -->
                <div>
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Product Images</label>
                  <div 
                    style="border: 2px dashed var(--gray-300); border-radius: 12px; padding: 2rem; text-align: center; cursor: pointer;"
                    @click="triggerFileInput"
                  >
                    <i class="pi pi-cloud-upload" style="font-size: 2.5rem; color: var(--gray-400); margin-bottom: 0.5rem;"></i>
                    <p style="color: var(--gray-600); margin-bottom: 0.25rem; font-size: 0.875rem;">Kéo thả hình ảnh vào đây hoặc click để chọn</p>
                    <p style="font-size: 0.75rem; color: var(--gray-500);">PNG, JPG, WEBP (Max. 5MB)</p>
                    <input 
                      ref="fileInput" 
                      type="file" 
                      accept="image/*"
                      multiple
                      style="display: none;" 
                      @change="handleFileChange"
                    />
                  </div>
                  
                  <!-- Preview Images -->
                  <div v-if="form.picture.length > 0" style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                    <div 
                      v-for="(img, index) in form.picture" 
                      :key="index"
                      style="position: relative; width: 100px; height: 100px; border-radius: 8px; overflow: hidden; border: 2px solid var(--gray-200);"
                    >
                      <img :src="img" style="width: 100%; height: 100%; object-fit: cover;" />
                      <Button 
                        icon="pi pi-times" 
                        rounded 
                        text
                        severity="danger"
                        size="small"
                        style="position: absolute; top: 2px; right: 2px; background: white;"
                        @click="removeImage(index)"
                      />
                    </div>
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="flex gap-2" style="padding-top: 1rem; border-top: 1px solid var(--gray-200); justify-content: flex-end;">
                  <Button label="Hủy" severity="secondary" outlined @click="resetForm" />
                  <Button label="Lưu sản phẩm" type="submit" icon="pi pi-check" :loading="loading" />
                </div>
              </form>
            </TabPanel>

            <!-- Consumer Tab -->
            <TabPanel header="Hàng tiêu dùng">
              <form @submit.prevent="handleSubmit" class="grid gap-6">
                <!-- Common Fields -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                      Type <span style="color: #ef4444;">*</span>
                    </label>

                    <InputText 
                      value="Consumer"
                      disabled
                      style="width: 100%; background-color: var(--surface-100); cursor: not-allowed;"
                    />
                  </div>
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Unit <span style="color: #ef4444;">*</span></label>
                    <InputText v-model="form.unit" placeholder="VD: cái, hộp, kg" style="width: 100%;" />
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Price <span style="color: #ef4444;">*</span></label>
                    <InputText v-model="form.price" type="number" placeholder="0" style="width: 100%;" />
                  </div>
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Safe Quantity <span style="color: #ef4444;">*</span></label>
                    <InputText v-model.number="form.saveQuantity" type="number" placeholder="0" style="width: 100%;" />
                  </div>
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Inventory Quantity <span style="color: #ef4444;">*</span></label>
                    <InputText v-model.number="form.stockQty" type="number" placeholder="0" style="width: 100%;" />
                  </div>
                </div>

                <!-- Consumer Specific Fields -->
                <div style="border-top: 2px solid var(--gray-200); padding-top: 1.5rem; margin-top: 1rem;">
                  <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; color: var(--primary-color);">
                    <i class="pi pi-shopping-cart" style="margin-right: 0.5rem;"></i>
                    Thông tin hàng tiêu dùng
                  </h3>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Product name <span style="color: #ef4444;">*</span></label>
                      <InputText v-model="form.com.name" placeholder="Nhập tên sản phẩm" style="width: 100%;" />
                    </div>
                    <div>
                      <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Location <span style="color: #ef4444;">*</span></label>
                      <InputText v-model="form.com.location" placeholder="Nhập vị trí" style="width: 100%;" />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4" style="margin-top: 1rem;">
                    <div>
                      <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Manufacturer <span style="color: #ef4444;">*</span></label>
                      <InputText v-model="form.com.manufacturer" placeholder="Nhập nhà sản xuất" style="width: 100%;" />
                    </div>
                    <div>
                      <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Product Specifications <span style="color: #ef4444;">*</span></label>
                      <InputText v-model="form.com.specifications" placeholder="Nhập thông số" style="width: 100%;" />
                    </div>
                  </div>
                </div>

                <!-- Image Upload -->
                <div>
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Product Images</label>
                  <div 
                    style="border: 2px dashed var(--gray-300); border-radius: 12px; padding: 2rem; text-align: center; cursor: pointer;"
                    @click="triggerFileInput"
                  >
                    <i class="pi pi-cloud-upload" style="font-size: 2.5rem; color: var(--gray-400); margin-bottom: 0.5rem;"></i>
                    <p style="color: var(--gray-600); margin-bottom: 0.25rem; font-size: 0.875rem;">Kéo thả hình ảnh vào đây hoặc click để chọn</p>
                    <p style="font-size: 0.75rem; color: var(--gray-500);">PNG, JPG, WEBP (Max. 5MB)</p>
                    <input 
                      ref="fileInput" 
                      type="file" 
                      accept="image/*"
                      multiple
                      style="display: none;" 
                      @change="handleFileChange"
                    />
                  </div>
                  
                  <!-- Preview Images -->
                  <div v-if="form.picture.length > 0" style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                    <div 
                      v-for="(img, index) in form.picture" 
                      :key="index"
                      style="position: relative; width: 100px; height: 100px; border-radius: 8px; overflow: hidden; border: 2px solid var(--gray-200);"
                    >
                      <img :src="img" style="width: 100%; height: 100%; object-fit: cover;" />
                      <Button 
                        icon="pi pi-times" 
                        rounded 
                        text
                        severity="danger"
                        size="small"
                        style="position: absolute; top: 2px; right: 2px; background: white;"
                        @click="removeImage(index)"
                      />
                    </div>
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="flex gap-2" style="padding-top: 1rem; border-top: 1px solid var(--gray-200); justify-content: flex-end;">
                  <Button label="Hủy" severity="secondary" outlined @click="resetForm" />
                  <Button label="Lưu sản phẩm" type="submit" icon="pi pi-check" :loading="loading"/>
                </div>
              </form>
            </TabPanel>
          </TabView>
        </template>
      </Card>
    </div>

    <!-- Toast for notifications -->
    <Toast />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useItem } from '@/composables/useItem'
import { useToast } from 'primevue'
import type { CreateItemRequest } from '@/types/item.types'
import MainLayout from '@/components/MainLayout.vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Toast from 'primevue/toast'

const fileInput = ref<HTMLInputElement | null>(null)
const activeTab = ref(0) // 0 = Engineer, 1 = Consumer
const router = useRouter()
const toast = useToast()
const { createItem, loading } = useItem()

const form = ref<CreateItemRequest>({
  type: '',
  saveQuantity: 0,
  price: '',
  unit: '',
  stockQty: 0,
  picture: [] as string[],
  eng: {
    partname: '',
    location: '',
    description: '',
    vender: ''
  },
  com: {
    name: '',
    location: '',
    specifications: '',
    manufacturer: ''
  }
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files && files.length > 0) {
    // Convert files to base64 or URLs for preview
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          form.value.picture.push(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeImage = (index: number) => {
  form.value.picture.splice(index, 1)
}

const validateForm = (): boolean => {
  // Common fields validation
  if (!form.value.type || !form.value.unit || !form.value.price) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng điền đầy đủ các trường bắt buộc',
      life: 3000
    })
    return false
  }

  // Engineer specific validation
  if (activeTab.value === 0) {
    if (!form.value.eng.partname || !form.value.eng.location || !form.value.eng.vender) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng điền đầy đủ thông tin Engineer',
        life: 3000
      })
      return false
    }
  }

  // Consumer specific validation
  if (activeTab.value === 1) {
    if (!form.value.com.name || !form.value.com.location || !form.value.com.manufacturer) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng điền đầy đủ thông tin hàng tiêu dùng',
        life: 3000
      })
      return false
    }
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  // Prepare payload based on active tab
  const payload: CreateItemRequest = {
    type: form.value.type,
    saveQuantity: form.value.saveQuantity,
    price: form.value.price,
    unit: form.value.unit,
    stockQty: form.value.stockQty,
    picture: form.value.picture,
    ...(activeTab.value === 0 
      ? { eng: form.value.eng } 
      : { com: form.value.com }
    )
  }

  const result = await createItem(payload)

  if (result.success) {
    resetForm()
    setTimeout(() => {
      router.push('/inventory')
    }, 500)
  }
}

const resetForm = () => {
  form.value = {
    type: 'ENG',
    saveQuantity: 0,
    price: '',
    unit: '',
    stockQty: 0,
    picture: [],
    eng: {
      partname: '',
      location: '',
      description: '',
      vender: ''
    },
    com: {
      name: '',
      location: '',
      specifications: '',
      manufacturer: ''
    }
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

watch(activeTab, (tab) => {
  form.value.type = tab === 0 ? 'ENG' : 'COM'
}, { immediate: true })

</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.p-tabview .p-tabview-nav) {
  background: transparent;
  border-bottom: 2px solid var(--gray-200);
}

:deep(.p-tabview .p-tabview-nav .p-tabview-nav-link) {
  padding: 1rem 1.5rem;
  font-weight: 600;
}

:deep(.p-tabview .p-tabview-panels) {
  padding: 1.5rem 0;
}
</style>