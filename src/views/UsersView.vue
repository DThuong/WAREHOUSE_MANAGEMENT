<template>
  <MainLayout>
    <div class="animate-fade-in">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin: 0;">Quản lý tài khoản</h2>
        <Button 
          label="Thêm tài khoản" 
          icon="pi pi-plus"
          @click="openAddDialog"
        />
      </div>

      <!-- Error Message -->
      <Message v-if="error" severity="error" :closable="true" @close="clearError">
        {{ error }}
      </Message>

      <!-- Main Content -->
      <Card>
        <template #content>
          <!-- Loading Skeleton -->
          <div v-if="loading" style="display: flex; flex-direction: column; gap: 1rem;">
            <Skeleton height="3rem"></Skeleton>
            <Skeleton height="3rem"></Skeleton>
            <Skeleton height="3rem"></Skeleton>
          </div>

          <!-- Data Table -->
          <DataTable 
            v-else
            :value="users" 
            :paginator="true" 
            :rows="10" 
            responsiveLayout="scroll"
            :loading="loading"
            v-model:filters="filters"
            :globalFilterFields="['username', 'phoneNumber', 'role', 'department']"
          >
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 1.25rem; font-weight: 600;">
                  Tổng: {{ totalAccounts }} tài khoản
                </span>
                <span class="p-input-icon-left">
                  <InputText 
                    v-model="filters.global.value" 
                    placeholder="Tìm kiếm..." 
                  />
                </span>
              </div>
            </template>

            <template #empty>
              <div style="text-align: center; padding: 2rem 0;">
                <i class="pi pi-users" style="font-size: 3rem; color: #94a3b8;"></i>
                <p style="margin-top: 1rem; color: #64748b;">Chưa có tài khoản nào</p>
              </div>
            </template>

            <Column field="id" header="ID" sortable style="min-width: 80px"></Column>
            
            <Column header="Thông tin" style="min-width: 250px">
              <template #body="slotProps">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <Avatar 
                    :label="slotProps.data.username.charAt(0).toUpperCase()" 
                    shape="circle"
                    style="background-color: var(--primary-color); color: white;"
                  />
                  <div>
                    <p style="font-weight: 600; margin: 0;">{{ slotProps.data.username }}</p>
                    <p style="font-size: 0.875rem; color: #64748b; margin: 0.25rem 0 0 0;">
                      {{ slotProps.data.phoneNumber }}
                    </p>
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
            
            <Column field="department" header="Phòng ban" sortable style="min-width: 150px"></Column>
            
            <Column field="isActive" header="Trạng thái" sortable style="min-width: 120px">
              <template #body="slotProps">
                <Tag 
                  :value="slotProps.data.isActive ? 'Hoạt động' : 'Không hoạt động'" 
                  :severity="slotProps.data.isActive ? 'success' : 'danger'"
                />
              </template>
            </Column>
            
            <Column field="createdAt" header="Ngày tạo" sortable style="min-width: 150px">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.createdAt) }}
              </template>
            </Column>
            
            <Column header="Hành động" style="min-width: 180px">
              <template #body="slotProps">
                <div style="display: flex; gap: 0.5rem;">
                  <Button 
                    icon="pi pi-eye" 
                    text 
                    rounded 
                    severity="secondary"
                    v-tooltip.top="'Xem'"
                    @click="viewAccount(slotProps.data)"
                  />
                  <Button 
                    icon="pi pi-pencil" 
                    text 
                    rounded 
                    severity="secondary"
                    v-tooltip.top="'Sửa'"
                    @click="editAccount(slotProps.data)"
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
      :style="{ width: '500px' }"
      :modal="true"
    >
      <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
        <div>
          <label for="username" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Tên đăng nhập <span style="color: #ef4444;">*</span>
          </label>
          <InputText 
            id="username" 
            v-model="formData.username" 
            style="width: 100%;"
            :disabled="isEditing"
            :class="{ 'p-invalid': submitted && !formData.username }"
            placeholder="Nhập tên đăng nhập"
          />
          <small v-if="submitted && !formData.username" style="color: #ef4444;">
            Tên đăng nhập là bắt buộc
          </small>
        </div>

        <div v-if="!isEditing">
          <label for="password" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Mật khẩu <span style="color: #ef4444;">*</span>
          </label>
          <Password 
            id="password" 
            v-model="formData.password" 
            style="width: 100%;"
            :class="{ 'p-invalid': submitted && !formData.password }"
            toggleMask
            :feedback="false"
            placeholder="Nhập mật khẩu"
          />
          <small v-if="submitted && !formData.password" style="color: #ef4444;">
            Mật khẩu là bắt buộc
          </small>
        </div>

        <div>
          <label for="phoneNumber" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Số điện thoại <span style="color: #ef4444;">*</span>
          </label>
          <InputText 
            id="phoneNumber" 
            v-model="formData.phoneNumber" 
            style="width: 100%;"
            :class="{ 'p-invalid': submitted && !formData.phoneNumber }"
            placeholder="Nhập số điện thoại"
          />
          <small v-if="submitted && !formData.phoneNumber" style="color: #ef4444;">
            Số điện thoại là bắt buộc
          </small>
        </div>

        <div>
          <label for="role" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Vai trò <span style="color: #ef4444;">*</span>
          </label>
          <Dropdown 
            id="role"
            v-model="formData.role" 
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn vai trò"
            style="width: 100%;"
            :class="{ 'p-invalid': submitted && !formData.role }"
          />
          <small v-if="submitted && !formData.role" style="color: #ef4444;">
            Vai trò là bắt buộc
          </small>
        </div>

        <div>
          <label for="department" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Phòng ban <span style="color: #ef4444;">*</span>
          </label>
          <Dropdown 
            id="department"
            v-model="formData.department" 
            :options="departmentOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn phòng ban"
            style="width: 100%;"
            :class="{ 'p-invalid': submitted && !formData.department }"
          />
          <small v-if="submitted && !formData.department" style="color: #ef4444;">
            Phòng ban là bắt buộc
          </small>
        </div>
      </div>

      <template #footer>
        <Button 
          label="Hủy" 
          icon="pi pi-times" 
          text 
          @click="closeDialog"
          :disabled="loading"
        />
        <Button 
          :label="isEditing ? 'Cập nhật' : 'Thêm'" 
          icon="pi pi-check" 
          @click="saveAccount"
          :loading="loading"
        />
      </template>
    </Dialog>

    <!-- View Account Dialog -->
    <Dialog 
      v-model:visible="showViewDialog" 
      header="Thông tin tài khoản"
      :style="{ width: '500px' }"
      :modal="true"
    >
      <div v-if="selectedAccount">
        <!-- User Avatar and Name -->
        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px; margin-bottom: 1.5rem;">
          <Avatar 
            :label="selectedAccount.username.charAt(0).toUpperCase()" 
            size="xlarge"
            shape="circle"
            style="background-color: var(--primary-color); color: white; font-size: 2rem;"
          />
          <div>
            <h3 style="margin: 0; font-size: 1.25rem;">{{ selectedAccount.username }}</h3>
            <p style="margin: 0.25rem 0 0 0; color: #64748b;">{{ selectedAccount.phoneNumber }}</p>
          </div>
        </div>

        <!-- Account Details Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div>
            <p style="margin: 0 0 0.25rem 0; font-size: 0.875rem; color: #64748b;">ID</p>
            <p style="margin: 0; font-weight: 600;">{{ selectedAccount.id }}</p>
          </div>

          <div>
            <p style="margin: 0 0 0.25rem 0; font-size: 0.875rem; color: #64748b;">Vai trò</p>
            <Tag :value="selectedAccount.role" :severity="getRoleSeverity(selectedAccount.role)" />
          </div>

          <div>
            <p style="margin: 0 0 0.25rem 0; font-size: 0.875rem; color: #64748b;">Phòng ban</p>
            <p style="margin: 0; font-weight: 600;">{{ selectedAccount.department }}</p>
          </div>

          <div>
            <p style="margin: 0 0 0.25rem 0; font-size: 0.875rem; color: #64748b;">Trạng thái</p>
            <Tag 
              :value="selectedAccount.isActive ? 'Hoạt động' : 'Không hoạt động'" 
              :severity="selectedAccount.isActive ? 'success' : 'danger'"
            />
          </div>

          <div style="grid-column: 1 / -1;">
            <p style="margin: 0 0 0.25rem 0; font-size: 0.875rem; color: #64748b;">Ngày tạo</p>
            <p style="margin: 0; font-weight: 600;">{{ formatDate(selectedAccount.createdAt) }}</p>
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
      :style="{ width: '400px' }"
      :modal="true"
    >
      <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
        <div>
          <label for="newPassword" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Mật khẩu mới <span style="color: #ef4444;">*</span>
          </label>
          <Password 
            id="newPassword" 
            v-model="newPassword" 
            style="width: 100%;"
            :class="{ 'p-invalid': passwordSubmitted && !newPassword }"
            toggleMask
            :feedback="false"
            placeholder="Nhập mật khẩu mới"
          />
          <small v-if="passwordSubmitted && !newPassword" style="color: #ef4444;">
            Mật khẩu mới là bắt buộc
          </small>
        </div>

        <div>
          <label for="confirmPassword" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
            Xác nhận mật khẩu <span style="color: #ef4444;">*</span>
          </label>
          <Password 
            id="confirmPassword" 
            v-model="confirmPassword" 
            style="width: 100%;"
            :class="{ 'p-invalid': passwordSubmitted && (!confirmPassword || newPassword !== confirmPassword) }"
            toggleMask
            :feedback="false"
            placeholder="Nhập lại mật khẩu mới"
          />
          <small v-if="passwordSubmitted && !confirmPassword" style="color: #ef4444;">
            Xác nhận mật khẩu là bắt buộc
          </small>
          <small v-else-if="passwordSubmitted && newPassword !== confirmPassword" style="color: #ef4444;">
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
          :disabled="loading"
        />
        <Button 
          label="Đổi mật khẩu" 
          icon="pi pi-check" 
          @click="savePassword"
          :loading="loading"
        />
      </template>
    </Dialog>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog></ConfirmDialog>
    
    <!-- Toast for notifications -->
    <Toast />
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUser } from '@/composables/useUser'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import MainLayout from '@/components/MainLayout.vue'
import type { User, RegisterData } from '@/types/user.types'

// Define FilterMatchMode manually
const FilterMatchMode = {
  CONTAINS: 'contains'
}

// PrimeVue components
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
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

// Composables
const { 
  users, 
  loading, 
  error,
  totalAccounts,
  fetchAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  changePasswordByAdmin,
  clearError
} = useUser()

const toast = useToast()
const confirm = useConfirm()

// States
const showDialog = ref(false)
const showViewDialog = ref(false)
const showPasswordDialog = ref(false)
const isEditing = ref(false)
const submitted = ref(false)
const passwordSubmitted = ref(false)
const selectedAccount = ref<User | null>(null)
const editingAccountId = ref<number | null>(null)

// Form data
const formData = ref<RegisterData>({
  username: '',
  password: '',
  phoneNumber: '',
  role: '',
  department: ''
})

// Password change
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
  { label: 'SẢN XUẤT CA LUẬN', value: 'SẢN XUẤT CA LUẬN' }
]

// Filters
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

// Methods
const loadAccounts = async () => {
  await fetchAccounts()
}

const openAddDialog = () => {
  isEditing.value = false
  resetForm()
  showDialog.value = true
}

const viewAccount = (account: User) => {
  selectedAccount.value = account
  showViewDialog.value = true
}

const editAccount = (account: User) => {
  isEditing.value = true
  editingAccountId.value = account.id
  formData.value = {
    username: account.username,
    password: '',
    phoneNumber: account.phoneNumber,
    role: account.role,
    department: account.department
  }
  showDialog.value = true
}

const editFromView = () => {
  if (selectedAccount.value) {
    showViewDialog.value = false
    editAccount(selectedAccount.value)
  }
}

const saveAccount = async () => {
  submitted.value = true

  if (!formData.value.username || !formData.value.phoneNumber || 
      !formData.value.role || !formData.value.department) {
    return
  }

  if (!isEditing.value && !formData.value.password) {
    return
  }

  if (isEditing.value && editingAccountId.value) {
    const result = await updateAccount(editingAccountId.value, {
      phoneNumber: formData.value.phoneNumber,
      role: formData.value.role,
      department: formData.value.department
    })

    if (result.success) {
      closeDialog()
      await loadAccounts()
    }
  } else {
    const result = await addAccount(formData.value)

    if (result.success) {
      closeDialog()
      await loadAccounts()
    }
  }
}

const confirmDelete = (account: User) => {
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa tài khoản "${account.username}"?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Xóa',
    rejectLabel: 'Hủy',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await deleteAccount(account.id)
      await loadAccounts()
    }
  })
}

const openChangePasswordDialog = (account: User) => {
  changingPasswordFor.value = account.id
  selectedAccount.value = account
  newPassword.value = ''
  confirmPassword.value = ''
  passwordSubmitted.value = false
  showPasswordDialog.value = true
}

const savePassword = async () => {
  passwordSubmitted.value = true

  if (!newPassword.value || !confirmPassword.value) {
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    return
  }

  if (changingPasswordFor.value) {
    const result = await changePasswordByAdmin({
      accountId: changingPasswordFor.value,
      newPassword: newPassword.value
    })

    if (result.success) {
      closePasswordDialog()
    }
  }
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  newPassword.value = ''
  confirmPassword.value = ''
  changingPasswordFor.value = null
  passwordSubmitted.value = false
}

const resetForm = () => {
  formData.value = {
    username: '',
    password: '',
    phoneNumber: '',
    role: '',
    department: ''
  }
  submitted.value = false
  editingAccountId.value = null
}

const getRoleSeverity = (role: string) => {
  const severityMap: Record<string, string> = {
    'Admin': 'danger',
    'User': 'success'
  }
  return severityMap[role] || 'info'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadAccounts()
})
</script>

<style scoped>
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password input) {
  width: 100%;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8fafc;
  font-weight: 600;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}

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
</style>