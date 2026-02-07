<template>
  <MainLayout>
    <div class="animate-fade-in" style="max-width: 900px; margin: 0 auto;">
      <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">Thêm sản phẩm mới</h2>

      <Card>
        <template #content>
          <TabView v-model:activeIndex="activeTab">
            <!-- Engineer Tab -->
            <TabPanel header="Hàng kỹ thuật">
              <form @submit.prevent="handleSubmit" class="grid gap-6">
                <!-- Common Fields (giữ nguyên) -->
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

                <!-- ✅ FIXED Image Upload Section -->
                <div>
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                    Product Images
                    <span v-if="itemStore.uploadingImages" style="color: var(--primary-color); font-size: 0.875rem; margin-left: 0.5rem;">
                      <i class="pi pi-spin pi-spinner"></i> Đang tải lên {{ uploadProgress.current }}/{{ uploadProgress.total }}...
                    </span>
                  </label>
                  
                  <!-- ✅ FIXED Upload Area -->
                  <div class="image-upload-container">
                    <!-- ✅ FIXED Grid with consistent sizing -->
                    <div class="image-grid">
                      <!-- Uploaded Images (from server) -->
                      <div 
                        v-for="item in uploadedImagesWithKeys" 
                        :key="item.key"
                        class="image-item uploaded"
                      >
                        <img 
                          :src="getImageUrl(item.src)" 
                          class="image-thumbnail"
                        />
                        
                        <!-- Success Badge -->
                        <div class="image-badge success">
                          <i class="pi pi-check"></i>
                          Đã lưu
                        </div>
                        
                        <!-- Delete Button -->
                        <Button 
                          icon="pi pi-trash" 
                          rounded 
                          text
                          severity="danger"
                          size="small"
                          :loading="itemStore.deletingImage"
                          class="image-delete-btn"
                          @click="handleDeleteImage(item.src)"
                        />
                      </div>

                      <!-- Selected Files (waiting to upload) -->
                      <div 
                        v-for="item in selectedFilesWithKeys" 
                        :key="item.key"
                        class="image-item pending"
                      >
                        <img 
                          :src="item.preview" 
                          class="image-thumbnail"
                        />
                        
                        <!-- Pending Badge -->
                        <div class="image-badge pending">
                          <i class="pi pi-clock"></i>
                          Chờ up
                        </div>
                        
                        <!-- Remove Button -->
                        <Button 
                          icon="pi pi-times" 
                          rounded 
                          text
                          severity="danger"
                          size="small"
                          class="image-delete-btn"
                          @click="removeSelectedFile(item.index)"
                        />
                      </div>

                      <!-- Add More Button (always at the end) -->
                      <div 
                        class="add-image-btn"
                        :class="{ disabled: itemStore.uploadingImages }"
                        @click="triggerFileInput"
                      >
                        <i class="pi pi-plus"></i>
                        <span>Thêm ảnh</span>
                      </div>
                    </div>

                    <!-- Empty State (when no images) -->
                    <div 
                      v-if="allImages.length === 0"
                      class="empty-state"
                      :class="{ disabled: itemStore.uploadingImages }"
                      @click="triggerFileInput"
                    >
                      <i class="pi pi-cloud-upload"></i>
                      <p class="title">Kéo thả hình ảnh vào đây hoặc click để chọn</p>
                      <p class="subtitle">PNG, JPG, WEBP (Max. 5MB mỗi file)</p>
                      <p class="subtitle">Upload từng ảnh một, có thể chọn nhiều ảnh cùng lúc</p>
                    </div>

                    <!-- Hidden File Input -->
                    <input 
                      ref="fileInput" 
                      type="file" 
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      multiple
                      :disabled="itemStore.uploadingImages"
                      style="display: none;" 
                      @change="handleFileChange"
                    />
                  </div>

                  <!-- Image Count & Actions -->
                  <div v-if="allImages.length > 0" class="image-actions">
                    <div class="image-stats">
                      <span class="stat-item">
                        <i class="pi pi-check-circle"></i>
                        <strong>{{ (itemStore.currentItem?.picture || []).length }}</strong> đã lưu
                      </span>
                      <span class="stat-item">
                        <i class="pi pi-clock"></i>
                        <strong>{{ selectedFiles.length }}</strong> chờ upload
                      </span>
                    </div>
                    
                    <Button 
                      v-if="selectedFiles.length > 0"
                      label="Xóa file chờ" 
                      icon="pi pi-trash" 
                      text 
                      size="small"
                      severity="danger"
                      @click="clearSelectedFiles"
                    />
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="flex gap-2" style="padding-top: 1rem; border-top: 1px solid var(--gray-200); justify-content: flex-end;">
                  <Button 
                    label="Hủy" 
                    severity="secondary" 
                    outlined 
                    @click="handleCancel" 
                  />
                  <Button 
                    v-if="selectedFiles.length > 0 && createdItemId"
                    label="Tải lên hình ảnh" 
                    icon="pi pi-upload"
                    severity="info"
                    :loading="itemStore.uploadingImages"
                    @click="handleUploadImages"
                  />
                  <Button 
                    label="Lưu sản phẩm" 
                    type="submit" 
                    icon="pi pi-check" 
                    :loading="itemStore.loading" 
                  />
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

                <!-- Image Upload Section -->
                <div>
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                    Product Images
                    <span v-if="itemStore.uploadingImages" style="color: var(--primary-color); font-size: 0.875rem; margin-left: 0.5rem;">
                      <i class="pi pi-spin pi-spinner"></i> Đang tải lên {{ uploadProgress.current }}/{{ uploadProgress.total }}...
                    </span>
                  </label>
                  
                  <div class="image-upload-container">
                    <div class="image-grid">
                      <!-- Uploaded Images (from server) -->
                      <div 
                        v-for="item in uploadedImagesWithKeys" 
                        :key="item.key"
                        class="image-item uploaded"
                      >
                        <img 
                          :src="getImageUrl(item.src)" 
                          class="image-thumbnail"
                        />
                        
                        <div class="image-badge success">
                          <i class="pi pi-check"></i>
                          Đã lưu
                        </div>
                        
                        <Button 
                          icon="pi pi-trash" 
                          rounded 
                          text
                          severity="danger"
                          size="small"
                          :loading="itemStore.deletingImage"
                          class="image-delete-btn"
                          @click="handleDeleteImage(item.src)"
                        />
                      </div>

                      <!-- Selected Files (waiting to upload) -->
                      <div 
                        v-for="item in selectedFilesWithKeys" 
                        :key="item.key"
                        class="image-item pending"
                      >
                        <img 
                          :src="item.preview" 
                          class="image-thumbnail"
                        />
                        
                        <div class="image-badge pending">
                          <i class="pi pi-clock"></i>
                          Chờ up
                        </div>
                        
                        <Button 
                          icon="pi pi-times" 
                          rounded 
                          text
                          severity="danger"
                          size="small"
                          class="image-delete-btn"
                          @click="removeSelectedFile(item.index)"
                        />
                      </div>

                      <!-- Add More Button -->
                      <div 
                        class="add-image-btn"
                        :class="{ disabled: itemStore.uploadingImages }"
                        @click="triggerFileInput"
                      >
                        <i class="pi pi-plus"></i>
                        <span>Thêm ảnh</span>
                      </div>
                    </div>

                    <!-- Empty State (when no images) -->
                    <div 
                      v-if="allImages.length === 0"
                      class="empty-state"
                      :class="{ disabled: itemStore.uploadingImages }"
                      @click="triggerFileInput"
                    >
                      <i class="pi pi-cloud-upload"></i>
                      <p class="title">Kéo thả hình ảnh vào đây hoặc click để chọn</p>
                      <p class="subtitle">PNG, JPG, WEBP (Max. 5MB mỗi file)</p>
                      <p class="subtitle">Upload từng ảnh một, có thể chọn nhiều ảnh cùng lúc</p>
                    </div>

                    <!-- Hidden File Input -->
                    <input 
                      ref="fileInput" 
                      type="file" 
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      multiple
                      :disabled="itemStore.uploadingImages"
                      style="display: none;" 
                      @change="handleFileChange"
                    />
                  </div>

                  <!-- Image Count & Actions -->
                  <div v-if="allImages.length > 0" class="image-actions">
                    <div class="image-stats">
                      <span class="stat-item">
                        <i class="pi pi-check-circle"></i>
                        <strong>{{ (itemStore.currentItem?.picture || []).length }}</strong> đã lưu
                      </span>
                      <span class="stat-item">
                        <i class="pi pi-clock"></i>
                        <strong>{{ selectedFiles.length }}</strong> chờ upload
                      </span>
                    </div>
                    
                    <Button 
                      v-if="selectedFiles.length > 0"
                      label="Xóa file chờ" 
                      icon="pi pi-trash" 
                      text 
                      size="small"
                      severity="danger"
                      @click="clearSelectedFiles"
                    />
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="flex gap-2" style="padding-top: 1rem; border-top: 1px solid var(--gray-200); justify-content: flex-end;">
                  <Button 
                    label="Hủy" 
                    severity="secondary" 
                    outlined 
                    @click="handleCancel" 
                  />
                  <Button 
                    v-if="selectedFiles.length > 0 && createdItemId"
                    label="Tải lên hình ảnh" 
                    icon="pi pi-upload"
                    severity="info"
                    :loading="itemStore.uploadingImages"
                    @click="handleUploadImages"
                  />
                  <Button 
                    label="Lưu sản phẩm" 
                    type="submit" 
                    icon="pi pi-check" 
                    :loading="itemStore.loading" 
                  />
                </div>
              </form>
            </TabPanel>
          </TabView>
        </template>
      </Card>
    </div>

    <Toast />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { itemAPI } from '@/services/itemAPI'
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
const activeTab = ref(0)
const router = useRouter()
const toast = useToast()
const itemStore = useItemStore()

interface SelectedFile {
  id: string
  file: File
  preview: string
}

const selectedFiles = ref<SelectedFile[]>([])
const createdItemId = ref<number | null>(null)
const uploadProgress = ref({ current: 0, total: 0 })

const allImages = computed(() => {
  const uploaded = itemStore.currentItem?.picture || []
  const selected = selectedFiles.value.map(f => f.preview)
  return [...uploaded, ...selected]
})

const uploadedImagesWithKeys = computed(() =>
  (itemStore.currentItem?.picture || []).map(img => ({
    src: img,
    key: `uploaded-${img}`
  }))
)

const selectedFilesWithKeys = computed(() => 
  selectedFiles.value.map((item, index) => ({
    file: item.file,
    preview: item.preview,
    key: item.id,
    index
  }))
)

const form = ref<CreateItemRequest>({
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
})

const getImageUrl = (filename: string) => {
  if (!filename) return ''
  if (filename.startsWith('http')) return filename
  return `${import.meta.env.VUE_APP_WAREHOUSE_URL}/api/Item/image/${filename}`
}

const triggerFileInput = () => {
  if (!itemStore.uploadingImages) {
    fileInput.value?.click()
  }
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  
  if (!files || files.length === 0) return

  const maxSize = 5 * 1024 * 1024
  let counter = 0

  Array.from(files).forEach(file => {
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: `File ${file.name} không đúng định dạng`,
        life: 3000
      })
      return
    }

    if (file.size > maxSize) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: `File ${file.name} quá lớn (tối đa 5MB)`,
        life: 3000
      })
      return
    }

    const id = `${Date.now()}-${Math.random()}-${counter++}`
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        selectedFiles.value.push({
          id,
          file,
          preview: e.target.result as string
        })
      }
    }
    reader.readAsDataURL(file)
  })

  input.value = ''
}

const removeSelectedFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const clearSelectedFiles = () => {
  selectedFiles.value = []
}

const handleUploadImages = async () => {
  if (!createdItemId.value || selectedFiles.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Không có file nào được chọn',
      life: 3000
    })
    return
  }

  itemStore.setUploadingImages(true)
  uploadProgress.value = { current: 0, total: selectedFiles.value.length }

  try {
    const files = selectedFiles.value.map(item => item.file)
    const result = await itemAPI.uploadImagesSequentially(createdItemId.value, files)
    
    uploadProgress.value.current = result.success

    if (result.success > 0) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Đã tải lên ${result.success}/${selectedFiles.value.length} ảnh`,
        life: 3000
      })

      clearSelectedFiles()
      
      if (createdItemId.value) {
        const itemResult = await itemAPI.getById(createdItemId.value)
        itemStore.setCurrentItem(itemResult)
      }
    }

    if (result.failed > 0) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: `${result.failed} ảnh tải lên thất bại`,
        life: 5000
      })
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể tải lên hình ảnh',
      life: 3000
    })
  } finally {
    itemStore.setUploadingImages(false)
    uploadProgress.value = { current: 0, total: 0 }
  }
}

const handleDeleteImage = async (imageName: string) => {
  if (!createdItemId.value) return

  const filename = imageName.split('/').pop() || imageName

  itemStore.setDeletingImage(true)
  
  try {
    await itemAPI.deleteImage(createdItemId.value, filename)
    
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đã xóa hình ảnh',
      life: 3000
    })

    if (createdItemId.value) {
      const itemResult = await itemAPI.getById(createdItemId.value)
      itemStore.setCurrentItem(itemResult)
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể xóa hình ảnh',
      life: 3000
    })
  } finally {
    itemStore.setDeletingImage(false)
  }
}

const validateForm = (): boolean => {
  if (!form.value.type || !form.value.unit || !form.value.price) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng điền đầy đủ các trường bắt buộc',
      life: 3000
    })
    return false
  }

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

  const payload: CreateItemRequest = {
    type: form.value.type,
    saveQuantity: form.value.saveQuantity,
    price: form.value.price,
    unit: form.value.unit,
    stockQty: form.value.stockQty,
    picture: [],
    ...(activeTab.value === 0 
      ? { eng: form.value.eng } 
      : { com: form.value.com }
    )
  }

  itemStore.setLoading(true)

  try {
    const createdItem = await itemAPI.create(payload)
    
    if (createdItem?.id) {
      createdItemId.value = createdItem.id
      itemStore.setCurrentItem(createdItem)

      if (selectedFiles.value.length > 0) {
        await handleUploadImages()
      }

      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Sản phẩm đã được tạo. Bạn có thể tiếp tục thêm hình ảnh hoặc quay lại danh sách.',
        life: 5000
      })

      resetForm()
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể tạo sản phẩm',
      life: 3000
    })
  } finally {
    itemStore.setLoading(false)
  }
}

const handleCancel = () => {
  resetForm()
  router.push('/inventory')
}

const resetForm = () => {
  form.value = {
    type: activeTab.value === 0 ? 'ENG' : 'COM',
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
  clearSelectedFiles()
  createdItemId.value = null
  itemStore.setCurrentItem(null)
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

onUnmounted(() => {
  itemStore.setCurrentItem(null)
  console.log('AddProductView unmounted - cleared currentItem')
})

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

/* ========================================
   ✅ FIXED IMAGE UPLOAD STYLES
   ======================================== */

.image-upload-container {
  border: 2px dashed var(--gray-300);
  border-radius: 12px;
  min-height: 200px;
  position: relative;
  overflow: hidden;
}

/* ✅ FIXED: Consistent grid with fixed columns */
.image-grid {
  display: grid;
  /* FIX: Use fixed 120px columns instead of minmax */
  grid-template-columns: repeat(auto-fill, 120px);
  gap: 0.75rem;
  padding: 1rem;
  justify-content: start; /* FIX: Align items to start */
}

/* ✅ FIXED: Image item with fixed aspect ratio */
.image-item {
  position: relative;
  width: 120px; /* FIX: Fixed width */
  height: 120px; /* FIX: Fixed height */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0; /* FIX: Prevent shrinking */
}

.image-item.uploaded {
  border: 2px solid var(--green-500);
}

.image-item.pending {
  border: 2px solid var(--orange-400);
}

/* ✅ Image thumbnail */
.image-thumbnail {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ✅ Image badges */
.image-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  color: white;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
  z-index: 2;
}

.image-badge.success {
  background: var(--green-500);
}

.image-badge.pending {
  background: var(--orange-400);
}

.image-badge i {
  font-size: 0.625rem;
}

/* ✅ Delete button */
.image-delete-btn {
  position: absolute !important;
  top: 4px !important;
  right: 4px !important;
  background: rgba(255, 255, 255, 0.95) !important;
  width: 28px !important;
  height: 28px !important;
  z-index: 2;
}

/* ✅ FIXED: Add image button with fixed size */
.add-image-btn {
  position: relative;
  width: 120px; /* FIX: Match image item size */
  height: 120px; /* FIX: Match image item size */
  border: 2px dashed var(--gray-400);
  border-radius: 8px;
  cursor: pointer;
  background: var(--gray-50);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex-shrink: 0; /* FIX: Prevent shrinking */
}

.add-image-btn:hover {
  background: var(--gray-100);
  border-color: var(--gray-500);
}

.add-image-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.add-image-btn i {
  font-size: 1.5rem;
  color: var(--gray-400);
}

.add-image-btn span {
  font-size: 0.625rem;
  color: var(--gray-500);
  font-weight: 500;
}

/* ✅ Empty state */
.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-state.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.empty-state i {
  font-size: 3rem;
  color: var(--gray-400);
  margin-bottom: 1rem;
}

.empty-state .title {
  color: var(--gray-600);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.empty-state .subtitle {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-top: 0.25rem;
}

/* ✅ Image actions */
.image-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.image-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stat-item {
  font-size: 0.875rem;
  color: var(--gray-700);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-item i {
  font-size: 0.875rem;
}

.stat-item i.pi-check-circle {
  color: var(--green-500);
}

.stat-item i.pi-clock {
  color: var(--orange-400);
}

/* ========================================
   TabView Styles
   ======================================== */

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