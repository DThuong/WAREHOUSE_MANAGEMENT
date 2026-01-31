<template>
  <MainLayout>
    <div class="user-management">
      <!-- Header -->
      <div class="page-header">
        <h2>Quản lý tài khoản</h2>
        <Button 
          label="Thêm tài khoản" 
          icon="pi pi-plus"
          severity="success"
          @click="openAddDialog"
        />
      </div>

      <!-- Main Card -->
      <Card>
        <template #content>
          <!-- Loading Skeleton -->
          <div v-if="userStore.loading && userStore.users.length === 0" class="skeleton-container">
            <Skeleton height="3rem" class="mb-3"></Skeleton>
            <Skeleton height="3rem" class="mb-3"></Skeleton>
            <Skeleton height="3rem"></Skeleton>
          </div>

          <!-- DataTable -->
          <DataTable 
            v-else
            :value="userStore.users" 
            :loading="userStore.loading"
            :paginator="true" 
            :rows="10"
            responsiveLayout="scroll"
            v-model:filters="filters"
            :globalFilterFields="['username', 'phoneNumber', 'role', 'department']"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          >
            <!-- Header with Search -->
            <template #header>
              <div class="table-header">
                <span class="total-count">
                  Tổng: <strong>{{ userStore.totalUsers }}</strong> tài khoản
                </span>
                <span class="p-input-icon-left">
                  <InputText 
                    v-model="filters.global.value" 
                    placeholder="Tìm kiếm..." 
                    class="search-input"
                  />
                </span>
              </div>
            </template>

            <!-- Empty State -->
            <template #empty>
              <div class="empty-state">
                <i class="pi pi-users" style="font-size: 3rem; color: #94a3b8;"></i>
                <p>Chưa có tài khoản nào</p>
              </div>
            </template>

            <!-- Columns -->
            <Column field="id" header="ID" sortable style="min-width: 80px">
              <template #body="slotProps">
                <strong>{{ slotProps.data.id }}</strong>
              </template>
            </Column>
            
            <Column header="Thông tin" style="min-width: 250px">
              <template #body="slotProps">
                <div class="user-info">
                  <Avatar 
                    :label="slotProps.data.username.charAt(0).toUpperCase()" 
                    shape="circle"
                    size="large"
                    class="user-avatar"
                  />
                  <div>
                    <div class="username">{{ slotProps.data.username }}</div>
                    <div class="phone-number">{{ slotProps.data.phoneNumber }}</div>
                  </div>
                </div>
              </template>
            </Column>
            
            <Column field="role" header="Vai trò" sortable style="min-width: 120px">
              <template #body="slotProps">
                <Tag 
                  :value="slotProps.data.role" 
                  :severity="getRoleSeverity(slotProps.data.role)"
                />
              </template>
            </Column>
            
            <Column field="department" header="Phòng ban" sortable style="min-width: 180px">
              <template #body="slotProps">
                <span class="department-text">{{ slotProps.data.department }}</span>
              </template>
            </Column>
            
            <Column field="isActive" header="Trạng thái" sortable style="min-width: 140px">
              <template #body="slotProps">
                <Tag 
                  :value="slotProps.data.isActive ? 'Hoạt động' : 'Không hoạt động'" 
                  :severity="slotProps.data.isActive ? 'success' : 'danger'"
                />
              </template>
            </Column>
            
            <Column field="createdAt" header="Ngày tạo" sortable style="min-width: 180px">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.createdAt) }}
              </template>
            </Column>
            
            <Column header="Hành động" :frozen="true" alignFrozen="right" style="min-width: 180px">
              <template #body="slotProps">
                <div class="action-buttons">
                  <Button 
                    icon="pi pi-eye" 
                    text 
                    rounded 
                    severity="secondary"
                    v-tooltip.top="'Xem chi tiết'"
                    @click="viewUser(slotProps.data)"
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    text 
                    rounded 
                    severity="secondary"
                    v-tooltip.top="'Chỉnh sửa'"
                    @click="editUser(slotProps.data)"
                  />
                  <Button 
                    icon="pi pi-key" 
                    text 
                    rounded 
                    severity="warning"
                    v-tooltip.top="'Đổi mật khẩu'"
                    @click="openChangePasswordDialog(slotProps.data)"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    text 
                    rounded 
                    severity="danger"
                    v-tooltip.top="'Xóa'"
                    @click="confirmDelete(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Add/Edit Dialog -->
    <Dialog 
      v-model:visible="showDialog" 
      :header="isEditing ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'"
      :style="{ width: '550px' }"
      :modal="true"
      :draggable="false"
    >
      <div class="dialog-content">
        <!-- Username -->
        <div class="field">
          <label for="username">
            Tên đăng nhập <span class="required">*</span>
          </label>
          <InputText 
            id="username" 
            v-model="formData.username" 
            :disabled="isEditing"
            placeholder="Nhập tên đăng nhập"
            class="w-full"
          />
        </div>

        <!-- Password (chỉ hiện khi thêm mới) -->
        <div class="field" v-if="!isEditing">
          <label for="password">
            Mật khẩu <span class="required">*</span>
          </label>
          <Password 
            id="password" 
            v-model="formData.password" 
            toggleMask
            :feedback="false"
            placeholder="Nhập mật khẩu"
            class="w-full"
          />
        </div>

        <!-- Phone Number -->
        <div class="field">
          <label for="phoneNumber">
            Số điện thoại <span class="required">*</span>
          </label>
          <InputText 
            id="phoneNumber" 
            v-model="formData.phoneNumber" 
            placeholder="Nhập số điện thoại"
            class="w-full"
          />
        </div>

        <!-- Role -->
        <div class="field">
          <label for="role">
            Vai trò <span class="required">*</span>
          </label>
          <Dropdown 
            id="role"
            v-model="formData.role" 
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn vai trò"
            class="w-full"
          />
        </div>

        <!-- Department -->
        <div class="field">
          <label for="department">
            Phòng ban <span class="required">*</span>
          </label>
          <Dropdown 
            id="department"
            v-model="formData.department" 
            :options="departmentOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn phòng ban"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button 
          label="Hủy" 
          icon="pi pi-times" 
          text 
          @click="closeDialog"
          :disabled="userStore.loading"
        />
        <Button 
          :label="isEditing ? 'Cập nhật' : 'Thêm'" 
          icon="pi pi-check" 
          @click="saveUser"
          :loading="userStore.loading"
        />
      </template>
    </Dialog>

    <!-- View User Dialog -->
    <Dialog 
      v-model:visible="showViewDialog" 
      header="Thông tin chi tiết tài khoản"
      :style="{ width: '500px' }"
      :modal="true"
    >
      <div v-if="selectedUser" class="view-dialog-content">
        <!-- User Header -->
        <div class="user-header">
          <Avatar 
            :label="selectedUser.username.charAt(0).toUpperCase()" 
            size="xlarge"
            shape="circle"
            class="large-avatar"
          />
          <div>
            <h3 class="text-white!">{{ selectedUser.username }}</h3>
            <p class="phone-number">{{ selectedUser.phoneNumber }}</p>
          </div>
        </div>

        <!-- User Details -->
        <div class="user-details">
          <div class="detail-item">
            <span class="label">ID</span>
            <span class="value">{{ selectedUser.id }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Vai trò</span>
            <Tag :value="selectedUser.role" :severity="getRoleSeverity(selectedUser.role)" />
          </div>

          <div class="detail-item">
            <span class="label">Phòng ban</span>
            <span class="value">{{ selectedUser.department }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Trạng thái</span>
            <Tag 
              :value="selectedUser.isActive ? 'Hoạt động' : 'Không hoạt động'" 
              :severity="selectedUser.isActive ? 'success' : 'danger'"
            />
          </div>

          <div class="detail-item full-width">
            <span class="label">Ngày tạo</span>
            <span class="value">{{ formatDate(selectedUser.createdAt) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button 
          label="Đóng" 
          icon="pi pi-times" 
          text 
          @click="showViewDialog = false"
        />
        <Button 
          label="Chỉnh sửa" 
          icon="pi pi-pencil" 
          @click="editFromView"
        />
      </template>
    </Dialog>

    <!-- Change Password Dialog -->
    <Dialog 
      v-model:visible="showPasswordDialog" 
      header="Đổi mật khẩu"
      :style="{ width: '450px' }"
      :modal="true"
    >
      <div class="dialog-content">
        <div class="field">
          <label for="newPassword">
            Mật khẩu mới <span class="required">*</span>
          </label>
          <Password 
            id="newPassword" 
            v-model="newPassword" 
            toggleMask
            :feedback="false"
            placeholder="Nhập mật khẩu mới"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="confirmPassword">
            Xác nhận mật khẩu <span class="required">*</span>
          </label>
          <Password 
            id="confirmPassword" 
            v-model="confirmPassword" 
            toggleMask
            :feedback="false"
            placeholder="Nhập lại mật khẩu mới"
            class="w-full"
          />
          <small v-if="confirmPassword && newPassword !== confirmPassword" class="p-error">
            Mật khẩu không khớp
          </small>
        </div>
      </div>

      <template #footer>
        <Button 
          label="Hủy" 
          icon="pi pi-times" 
          text 
          @click="closePasswordDialog"
          :disabled="userStore.loading"
        />
        <Button 
          label="Đổi mật khẩu" 
          icon="pi pi-check" 
          @click="savePassword"
          :loading="userStore.loading"
        />
      </template>
    </Dialog>

    <!-- Confirm Dialog -->
    <ConfirmDialog></ConfirmDialog>
    
    <!-- Toast -->
    <Toast />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import MainLayout from '@/components/MainLayout.vue'
import type { User, RegisterData } from '@/types/user.types'

// PrimeVue Components
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

// Khởi tạo store và utilities
const userStore = useUserStore()
const toast = useToast()
const confirm = useConfirm()

// ==================== STATES ====================
const showDialog = ref(false)
const showViewDialog = ref(false)
const showPasswordDialog = ref(false)
const isEditing = ref(false)
const editingUserId = ref<number | null>(null)
const selectedUser = ref<User | null>(null)

const formData = ref<RegisterData>({
  username: '',
  password: '',
  phoneNumber: '',
  role: '',
  department: ''
})

const newPassword = ref('')
const confirmPassword = ref('')
const changingPasswordFor = ref<number | null>(null)

// Options
const roleOptions = [
  { label: 'Admin', value: 'Admin' },
  { label: 'User', value: 'User' },
]

const departmentOptions = [
  { label: 'QC', value: 'QC' },
  { label: 'KHO', value: 'KHO' },
  { label: 'REPAIR', value: 'REPAIR' },
  { label: 'ENGINEER', value: 'ENGINEER' },
  { label: 'SẢN XUẤT CA CƯỜNG', value: 'SẢN XUẤT CA CƯỜNG' },
  { label: 'SẢN XUẤT CA LUÂN', value: 'SẢN XUẤT CA LUÂN' }
]

// Filters
const FilterMatchMode = { CONTAINS: 'contains' }
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

// ==================== METHODS ====================

const openAddDialog = () => {
  console.log('🔵 Opening Add Dialog')
  isEditing.value = false
  editingUserId.value = null
  resetForm()
  showDialog.value = true
}

const viewUser = (user: User) => {
  console.log('👁️ Viewing user:', user)
  selectedUser.value = user
  showViewDialog.value = true
}

const editUser = (user: User) => {
  console.log('✏️ Editing user:', user)
  isEditing.value = true
  editingUserId.value = user.id
  formData.value = {
    username: user.username,
    password: '',
    phoneNumber: user.phoneNumber,
    role: user.role,
    department: user.department
  }
  showDialog.value = true
}

const editFromView = () => {
  if (selectedUser.value) {
    showViewDialog.value = false
    editUser(selectedUser.value)
  }
}

const saveUser = async () => {
  console.log('💾 Saving user...', formData.value)
  
  // Validation
  if (!formData.value.username || !formData.value.phoneNumber || 
      !formData.value.role || !formData.value.department) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng điền đầy đủ thông tin',
      life: 3000
    })
    return
  }

  if (!isEditing.value && !formData.value.password) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng nhập mật khẩu',
      life: 3000
    })
    return
  }

  try {
    let result
    
    if (isEditing.value && editingUserId.value) {
      console.log('🔄 Updating user ID:', editingUserId.value)
      result = await userStore.updateUser(editingUserId.value, {
        phoneNumber: formData.value.phoneNumber,
        role: formData.value.role,
        department: formData.value.department
      })
    } else {
      console.log('➕ Adding new user')
      result = await userStore.addUser(formData.value)
    }

    console.log('✅ Save result:', result)

    if (result.success) {
      closeDialog()
    }
  } catch (error) {
    console.error('❌ Save user error:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể lưu tài khoản',
      life: 3000
    })
  }
}

const confirmDelete = (user: User) => {
  console.log('🗑️ Confirm delete user:', user)
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa tài khoản "${user.username}"?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    acceptClass: 'p-button-danger',
    accept: async () => {
      console.log('✅ Delete confirmed')
      await userStore.deleteUser(user.id)
    },
    reject: () => {
      console.log('❌ Delete cancelled')
    }
  })
}

const openChangePasswordDialog = (user: User) => {
  console.log('🔑 Opening change password for user:', user)
  changingPasswordFor.value = user.id
  selectedUser.value = user
  newPassword.value = ''
  confirmPassword.value = ''
  showPasswordDialog.value = true
}

const savePassword = async () => {
  console.log('🔐 Saving new password...')
  
  if (!newPassword.value || !confirmPassword.value) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng nhập đầy đủ thông tin',
      life: 3000
    })
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Mật khẩu không khớp',
      life: 3000
    })
    return
  }

  if (changingPasswordFor.value) {
    const result = await userStore.changePassword(
      changingPasswordFor.value,
      newPassword.value
    )

    if (result.success) {
      closePasswordDialog()
    }
  }
}

const closeDialog = () => {
  console.log('❌ Closing dialog')
  showDialog.value = false
  resetForm()
}

const closePasswordDialog = () => {
  console.log('❌ Closing password dialog')
  showPasswordDialog.value = false
  newPassword.value = ''
  confirmPassword.value = ''
  changingPasswordFor.value = null
}

const resetForm = () => {
  formData.value = {
    username: '',
    password: '',
    phoneNumber: '',
    role: '',
    department: ''
  }
  editingUserId.value = null
}

const getRoleSeverity = (role: string): string => {
  const severityMap: Record<string, string> = {
    'Admin': 'danger',
    'User': 'success'
  }
  return severityMap[role] || 'info'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ==================== LIFECYCLE ====================
onMounted(async () => {
  console.log('🚀 UserView mounted, loading users...')
  await userStore.fetchUsers()
  console.log('✅ Users loaded:', userStore.users.length)
})
</script>

<style scoped>
.user-management {
  animation: fadeIn 0.3s ease-in;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.skeleton-container {
  padding: 1rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.total-count {
  font-size: 1rem;
  color: #64748b;
}

.search-input {
  width: 300px;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.empty-state p {
  margin-top: 1rem;
  color: #64748b;
  font-size: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
}

.username {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.phone-number {
  font-size: 0.875rem;
  color: #475569;
}

.department-text {
  color: #475569;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 0.2rem;
  justify-content: flex-start;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}

.required {
  color: #ef4444;
}

.w-full {
  width: 100%;
}

.view-dialog-content {
  padding: 0.5rem 0;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #2d3f92;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  color: white;
}

.large-avatar {
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

.user-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.user-header .phone-number {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

.user-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 0 0.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item .label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.detail-item .value {
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password input) {
  width: 100%;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: all 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}

:deep(.p-dialog .p-dialog-header) {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.p-dropdown) {
  width: 100%;
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

.mb-3 {
  margin-bottom: 1rem;
}
</style>