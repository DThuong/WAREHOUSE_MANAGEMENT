<template>
  <MainLayout>
    <Toast />
    <div class="user-management">
      <!-- Header -->
      <div class="page-header">
        <h2>{{ t("userManagement.title") }}</h2>
        <Button
          :label="t('userManagement.addAccount')"
          icon="pi pi-plus"
          severity="success"
          @click="openAddDialog"
        />
      </div>

      <!-- Main Card -->
      <Card>
        <template #content>
          <!-- Loading Skeleton -->
          <div
            v-if="userStore.loading && userStore.users.length === 0"
            class="skeleton-container"
          >
            <Skeleton height="3rem" class="mb-3"></Skeleton>
            <Skeleton height="3rem" class="mb-3"></Skeleton>
            <Skeleton height="3rem"></Skeleton>
          </div>

          <template v-else>
            <!-- Table Header (search + count) - shared -->
            <div class="table-header">
              <span class="total-count">
                {{
                  t("userManagement.summary.total", {
                    count: userStore.totalUsers,
                  })
                }}
              </span>
              <span class="p-input-icon-left">
                <InputText
                  v-model="searchValue"
                  :placeholder="t('userManagement.search')"
                  class="search-input"
                />
              </span>
            </div>

            <!-- ========== DESKTOP: DataTable ========== -->
            <DataTable
              v-if="!isMobile"
              :value="mobilePagination.paginatedList.value"
              :loading="userStore.loading"
              responsiveLayout="scroll"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            >
              <!-- Empty State -->
              <template #empty>
                <div class="empty-state">
                  <i
                    class="pi pi-users"
                    style="font-size: 3rem; color: #94a3b8"
                  ></i>
                  <p>{{ t("userManagement.empty") }}</p>
                </div>
              </template>

              <!-- Columns -->
              <Column
                field="id"
                :header="t('userManagement.table.id')"
                sortable
                style="min-width: 80px"
              >
                <template #body="slotProps">
                  <strong>{{ slotProps.data.id }}</strong>
                </template>
              </Column>

              <Column
                :header="t('userManagement.table.info')"
                style="min-width: 250px"
              >
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
                      <div class="phone-number-table">
                        {{ slotProps.data.phoneNumber }}
                      </div>
                    </div>
                  </div>
                </template>
              </Column>

              <Column
                field="role"
                :header="t('userManagement.table.role')"
                sortable
                style="min-width: 120px"
              >
                <template #body="slotProps">
                  <Tag
                    :value="slotProps.data.role"
                    :severity="getRoleSeverity(slotProps.data.role)"
                  />
                </template>
              </Column>

              <Column
                field="department"
                :header="t('userManagement.table.department')"
                sortable
                style="min-width: 180px"
              >
                <template #body="slotProps">
                  <span class="department-text">{{ getDepartmentLabel(slotProps.data.department) }}</span>
                </template>
              </Column>

              <Column
                field="areaPart"
                header="Xưởng"
                sortable
                style="min-width: 140px"
              >
                <template #body="slotProps">
                  <Tag
                    :value="getAreaPartLabel(slotProps.data.areaPart)"
                    :severity="getAreaPartSeverity(slotProps.data.areaPart)"
                  />
                </template>
              </Column>

              <Column
                field="isActive"
                :header="t('userManagement.table.status')"
                sortable
                style="min-width: 140px"
              >
                <template #body="slotProps">
                  <Tag
                    :value="
                      slotProps.data.isActive
                        ? t('userManagement.status.active')
                        : t('userManagement.status.inactive')
                    "
                    :severity="slotProps.data.isActive ? 'success' : 'danger'"
                  />
                </template>
              </Column>

              <Column
                field="createdAt"
                :header="t('userManagement.table.createdAt')"
                sortable
                style="min-width: 180px"
              >
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.createdAt) }}
                </template>
              </Column>

              <Column
                :header="t('userManagement.table.actions')"
                :frozen="true"
                alignFrozen="right"
                style="min-width: 180px"
              >
                <template #body="slotProps">
                  <div class="action-buttons">
                    <Button
                      icon="pi pi-eye"
                      text
                      rounded
                      severity="secondary"
                      v-tooltip.top="t('userManagement.tooltip.view')"
                      @click="viewUser(slotProps.data)"
                    />
                    <Button
                      icon="pi pi-pencil"
                      text
                      rounded
                      severity="secondary"
                      v-tooltip.top="t('userManagement.tooltip.edit')"
                      @click="editUser(slotProps.data)"
                    />
                    <Button
                      icon="pi pi-key"
                      text
                      rounded
                      severity="warning"
                      v-tooltip.top="t('userManagement.tooltip.changePassword')"
                      @click="openChangePasswordDialog(slotProps.data)"
                    />
                    <Button
                      icon="pi pi-trash"
                      text
                      rounded
                      severity="danger"
                      v-tooltip.top="t('userManagement.tooltip.delete')"
                      @click="confirmDelete(slotProps.data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>

            <!-- ========== MOBILE: Card List ========== -->
            <div v-else class="mobile-card-list">
              <div v-if="filteredUsers.length === 0" class="empty-state">
                <i
                  class="pi pi-users"
                  style="font-size: 3rem; color: #94a3b8"
                ></i>
                <p>{{ t("userManagement.empty") }}</p>
              </div>

              <div
                v-for="user in mobilePagination.paginatedList.value"
                :key="user.id"
                class="mobile-user-card"
                @click="viewUser(user)"
              >
                <!-- Card Top -->
                <div class="mobile-card-top">
                  <div class="mobile-user-info">
                    <Avatar
                      :label="user.username.charAt(0).toUpperCase()"
                      shape="circle"
                      size="large"
                      class="user-avatar"
                    />
                    <div>
                      <div class="mobile-username">{{ user.username }}</div>
                      <div class="mobile-phone">
                        <i class="pi pi-phone" style="font-size: 0.75rem"></i>
                        {{ user.phoneNumber }}
                      </div>
                    </div>
                  </div>
                  <Tag
                    :value="
                      user.isActive
                        ? t('userManagement.status.active')
                        : t('userManagement.status.inactive')
                    "
                    :severity="user.isActive ? 'success' : 'danger'"
                    class="mobile-status-tag"
                  />
                </div>

                <!-- Card Meta -->
                <div class="mobile-card-meta">
                  <div class="mobile-meta-item">
                    <span class="meta-label">{{
                      t("userManagement.mobile.role")
                    }}</span>
                    <Tag
                      :value="user.role"
                      :severity="getRoleSeverity(user.role)"
                    />
                  </div>
                  <div class="mobile-meta-item">
                    <span class="meta-label">{{
                      t("userManagement.mobile.department")
                    }}</span>
                    <span class="meta-value">{{ getDepartmentLabel(user.department) }}</span>
                  </div>
                  <div class="mobile-meta-item">
                    <span class="meta-label">Xưởng</span>
                    <Tag
                      :value="getAreaPartLabel(user.areaPart)"
                      :severity="getAreaPartSeverity(user.areaPart)"
                    />
                  </div>
                  <div class="mobile-meta-item">
                    <span class="meta-label">{{
                      t("userManagement.mobile.createdAt")
                    }}</span>
                    <span class="meta-value">{{
                      formatDate(user.createdAt)
                    }}</span>
                  </div>
                </div>

                <!-- Card Actions -->
                <div class="mobile-card-actions">
                  <Button
                    icon="pi pi-eye"
                    text
                    size="small"
                    class="action-btn btn-view"
                    severity="secondary"
                    @click.stop="viewUser(user)"
                  />
                  <Button
                    icon="pi pi-pencil"
                    text
                    size="small"
                    class="action-btn btn-edit"
                    severity="secondary"
                    @click.stop="editUser(user)"
                  />
                  <Button
                    icon="pi pi-key"
                    text
                    size="small"
                    class="action-btn btn-key"
                    severity="warning"
                    @click.stop="openChangePasswordDialog(user)"
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    size="small"
                    class="action-btn btn-delete"
                    severity="danger"
                    @click.stop="confirmDelete(user)"
                  />
                </div>
              </div>
            </div>
            <AppPagination
              :current-page="mobilePagination.currentPage.value"
              :total-pages="mobilePagination.totalPages.value"
              :total-items="mobilePagination.totalItems.value"
              :page-info="mobilePagination.pageInfo.value"
              v-model:model-page-size="mobilePagination.pageSize.value"
              :page-size-options="[5, 10, 20]"
              @prev="mobilePagination.prevPage()"
              @next="mobilePagination.nextPage()"
              @first="mobilePagination.firstPage()"
              @last="mobilePagination.lastPage()"
              @goto="mobilePagination.goToPage"
            />
          </template>
        </template>
      </Card>
    </div>

    <!-- Add/Edit Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="
        isEditing
          ? t('userManagement.addDialog.headerEdit')
          : t('userManagement.addDialog.headerAdd')
      "
      :style="{ width: isMobile ? '95vw' : '550px' }"
      :modal="true"
      :draggable="false"
    >
      <div class="dialog-content">
        <!-- Username -->
        <div class="field">
          <label for="username">
            {{ t("userManagement.addDialog.username") }}
            <span class="required">*</span>
          </label>
          <InputText
            id="username"
            v-model="formData.username"
            :disabled="isEditing"
            :placeholder="t('userManagement.addDialog.usernamePlaceholder')"
            class="w-full"
          />
        </div>

        <!-- Password (chỉ hiện khi thêm mới) -->
        <div class="field" v-if="!isEditing">
          <label for="password">
            {{ t("userManagement.addDialog.password") }}
            <span class="required">*</span>
          </label>
          <Password
            id="password"
            v-model="formData.password"
            toggleMask
            :feedback="false"
            :placeholder="t('userManagement.addDialog.passwordPlaceholder')"
            class="w-full"
          />
        </div>

        <!-- Phone Number -->
        <div class="field">
          <label for="phoneNumber">
            {{ t("userManagement.addDialog.phoneNumber") }}
            <span class="required">*</span>
          </label>
          <InputText
            id="phoneNumber"
            v-model="formData.phoneNumber"
            :placeholder="t('userManagement.addDialog.phoneNumberPlaceholder')"
            class="w-full"
          />
        </div>

        <!-- Role -->
        <div class="field">
          <label for="role">
            {{ t("userManagement.addDialog.role") }}
            <span class="required">*</span>
          </label>
          <Dropdown
            id="role"
            v-model="formData.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('userManagement.addDialog.rolePlaceholder')"
            class="w-full"
          />
        </div>

        <!-- Department -->
        <div class="field">
          <label for="department">
            {{ t("userManagement.addDialog.department") }}
            <span class="required">*</span>
          </label>
          <Dropdown
            id="department"
            v-model="formData.department"
            :options="departmentOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('userManagement.addDialog.departmentPlaceholder')"
            class="w-full"
          />
        </div>

        <!-- Area Part -->
        <div class="field">
          <label for="areaPart">
            Xưởng
            <span class="required">*</span>
          </label>
          <Dropdown
            id="areaPart"
            v-model="formData.areaPart"
            :options="areaPartOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn xưởng"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button
          :label="t('userManagement.addDialog.cancel')"
          icon="pi pi-times"
          text
          @click="closeDialog"
          :disabled="userStore.loading"
        />
        <Button
          :label="
            isEditing
              ? t('userManagement.addDialog.update')
              : t('userManagement.addDialog.add')
          "
          icon="pi pi-check"
          @click="saveUser"
          :loading="userStore.loading"
        />
      </template>
    </Dialog>

    <!-- View User Dialog -->
    <Dialog
      v-model:visible="showViewDialog"
      :header="t('userManagement.viewDialog.header')"
      :style="{ width: isMobile ? '95vw' : '500px' }"
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
            <span class="label">{{ t("userManagement.viewDialog.id") }}</span>
            <span class="value">{{ selectedUser.id }}</span>
          </div>

          <div class="detail-item">
            <span class="label">{{ t("userManagement.viewDialog.role") }}</span>
            <Tag
              :value="selectedUser.role"
              :severity="getRoleSeverity(selectedUser.role)"
            />
          </div>

          <div class="detail-item">
            <span class="label">{{
              t("userManagement.viewDialog.department")
            }}</span>
            <span class="value">{{ getDepartmentLabel(selectedUser.department) }}</span>
          </div>

          <div class="detail-item">
            <span class="label">Xưởng</span>
            <Tag
              :value="getAreaPartLabel(selectedUser.areaPart)"
              :severity="getAreaPartSeverity(selectedUser.areaPart)"
            />
          </div>

          <div class="detail-item">
            <span class="label">{{
              t("userManagement.viewDialog.status")
            }}</span>
            <Tag
              :value="
                selectedUser.isActive
                  ? t('userManagement.status.active')
                  : t('userManagement.status.inactive')
              "
              :severity="selectedUser.isActive ? 'success' : 'danger'"
            />
          </div>

          <div class="detail-item full-width">
            <span class="label">{{
              t("userManagement.viewDialog.createdAt")
            }}</span>
            <span class="value">{{ formatDate(selectedUser.createdAt) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          :label="t('userManagement.viewDialog.close')"
          icon="pi pi-times"
          text
          @click="showViewDialog = false"
        />
        <Button
          :label="t('userManagement.viewDialog.edit')"
          icon="pi pi-pencil"
          @click="editFromView"
        />
      </template>
    </Dialog>

    <!-- Change Password Dialog -->
    <Dialog
      v-model:visible="showPasswordDialog"
      :header="t('userManagement.passwordDialog.header')"
      :style="{ width: isMobile ? '95vw' : '450px' }"
      :modal="true"
    >
      <div class="dialog-content">
        <div class="field">
          <label for="newPassword">
            {{ t("userManagement.passwordDialog.newPassword") }}
            <span class="required">*</span>
          </label>
          <Password
            id="newPassword"
            v-model="newPassword"
            toggleMask
            :feedback="false"
            :placeholder="
              t('userManagement.passwordDialog.newPasswordPlaceholder')
            "
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="confirmPassword">
            {{ t("userManagement.passwordDialog.confirmPassword") }}
            <span class="required">*</span>
          </label>
          <Password
            id="confirmPassword"
            v-model="confirmPassword"
            toggleMask
            :feedback="false"
            :placeholder="
              t('userManagement.passwordDialog.confirmPasswordPlaceholder')
            "
            class="w-full"
          />
          <small
            v-if="confirmPassword && newPassword !== confirmPassword"
            class="p-error"
          >
            {{ t("userManagement.passwordDialog.mismatch") }}
          </small>
        </div>
      </div>

      <template #footer>
        <Button
          :label="t('userManagement.passwordDialog.cancel')"
          icon="pi pi-times"
          text
          @click="closePasswordDialog"
          :disabled="userStore.loading"
        />
        <Button
          :label="t('userManagement.passwordDialog.submit')"
          icon="pi pi-check"
          @click="savePassword"
          :loading="userStore.loading"
        />
      </template>
    </Dialog>

    <!-- Confirm Dialog -->
    <ConfirmDialog></ConfirmDialog>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import MainLayout from "@/components/MainLayout.vue";
import type { User, RegisterData } from "@/types/user.types";
import { usePagination } from "@/composables/usePagination";
import AppPagination from "@/components/AppPagination.vue";

// PrimeVue Components
import Button from "primevue/button";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Avatar from "primevue/avatar";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Dropdown from "primevue/dropdown";
import Tag from "primevue/tag";
import Skeleton from "primevue/skeleton";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const userStore = useUserStore();
const toast = useToast();
const confirm = useConfirm();

// ==================== RESPONSIVE ====================
const isMobile = ref(window.innerWidth < 768);

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(async () => {
  window.addEventListener("resize", handleResize);
  await userStore.fetchUsers();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

// ==================== STATES ====================
const showDialog = ref(false);
const showViewDialog = ref(false);
const showPasswordDialog = ref(false);
const isEditing = ref(false);
const editingUserId = ref<number | null>(null);
const selectedUser = ref<User | null>(null);
const searchValue = ref("");

const formData = ref<RegisterData>({
  username: "",
  password: "",
  phoneNumber: "",
  role: "",
  department: "",
  areaPart: "",
});

const newPassword = ref("");
const confirmPassword = ref("");
const changingPasswordFor = ref<number | null>(null);

// Options
const roleOptions = [
  { label: "Admin", value: "Admin" },
  { label: "User", value: "User" },
];

const departmentOptions = computed(() => [
  { label: t("userManagement.departments.qc"), value: "QC" },
  { label: t("userManagement.departments.kho"), value: "KHO" },
  { label: t("userManagement.departments.repair"), value: "REPAIR" },
  { label: t("userManagement.departments.engineer"), value: "ENGINEER" },
  { label: t("userManagement.departments.sanXuatA"), value: "SẢN XUẤT CA A" },
  { label: t("userManagement.departments.sanXuatB"), value: "SẢN XUẤT CA B" },
]);

const areaPartOptions = [
  { label: "Admin", value: "ADMIN" },
  { label: "SMD", value: "SMD" },
  { label: "Mainline", value: "Mainline" },
];

// Helper: value từ API → label đã dịch
const getDepartmentLabel = (value?: string | null): string => {
  return departmentOptions.value.find((d) => d.value === value)?.label ?? value ?? "-";
};

const getAreaPartLabel = (value?: string | null): string => {
  return areaPartOptions.find((area) => area.value === value)?.label ?? value ?? "-";
};

const getAreaPartSeverity = (value?: string | null): string => {
  const normalized = String(value ?? "").toUpperCase();

  if (normalized === "ADMIN") return "danger";
  if (normalized === "SMD") return "info";
  if (normalized === "MAINLINE") return "success";

  return "secondary";
};

// ==================== COMPUTED ====================

// Shared filtered users (for both desktop DataTable and mobile cards)
const filteredUsers = computed(() => {
  if (!searchValue.value) return userStore.users;
  const q = searchValue.value.toLowerCase();
  return userStore.users.filter(
    (u) =>
      u.username?.toLowerCase().includes(q) ||
      u.phoneNumber?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      u.areaPart?.toLowerCase().includes(q),
  );
});

// Mobile pagination
const mobilePagination = usePagination(
  () => filteredUsers.value,
  isMobile.value ? 5 : 10,
);
watch(isMobile, (mobile) => {
  mobilePagination.setPageSize(mobile ? 5 : 10);
});

// ==================== METHODS ====================

const openAddDialog = () => {
  isEditing.value = false;
  editingUserId.value = null;
  resetForm();
  showDialog.value = true;
};

const viewUser = (user: User) => {
  selectedUser.value = user;
  showViewDialog.value = true;
};

const editUser = (user: User) => {
  isEditing.value = true;
  editingUserId.value = user.id;
  formData.value = {
    username: user.username,
    password: "",
    phoneNumber: user.phoneNumber,
    role: user.role,
    department: user.department,
    areaPart: user.areaPart || "",
  };
  showDialog.value = true;
};

const editFromView = () => {
  if (selectedUser.value) {
    showViewDialog.value = false;
    editUser(selectedUser.value);
  }
};

const saveUser = async () => {
  if (
    !formData.value.username ||
    !formData.value.phoneNumber ||
    !formData.value.role ||
    !formData.value.department ||
    !formData.value.areaPart
  ) {
    toast.add({
      severity: "warn",
      summary: t("userManagement.toast.warningTitle"),
      detail: t("userManagement.toast.requiredFields"),
      life: 3000,
    });
    return;
  }

  if (!isEditing.value && !formData.value.password) {
    toast.add({
      severity: "warn",
      summary: t("userManagement.toast.warningTitle"),
      detail: t("userManagement.toast.requiredPassword"),
      life: 3000,
    });
    return;
  }

  try {
    let result;
    if (isEditing.value && editingUserId.value) {
      result = await userStore.updateUser(editingUserId.value, {
        phoneNumber: formData.value.phoneNumber,
        role: formData.value.role,
        department: formData.value.department,
        areaPart: formData.value.areaPart,
      });
    } else {
      result = await userStore.addUser(formData.value);
    }
    if (result?.success !== false) {
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: isEditing.value
          ? "Cập nhật người dùng thành công."
          : "Thêm người dùng thành công.",
        life: 3000,
      });

      closeDialog();
      await userStore.fetchUsers();
    }
  } catch (error) {
    console.error("❌ Save user error:", error);
    toast.add({
      severity: "error",
      summary: t("userManagement.toast.errorTitle"),
      detail: t("userManagement.toast.saveError"),
      life: 3000,
    });
  }
};

const confirmDelete = (user: User) => {
  confirm.require({
    message: t("userManagement.confirmDelete.message", {
      username: user.username,
    }),
    header: t("userManagement.confirmDelete.header"),
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("userManagement.confirmDelete.accept"),
    rejectLabel: t("userManagement.confirmDelete.reject"),
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        const result = (await userStore.deleteUser(user.id)) as
          | { success?: boolean }
          | undefined;

        if (result?.success !== false) {
          toast.add({
            severity: "success",
            summary: "Thành công",
            detail: "Xóa người dùng thành công.",
            life: 3000,
          });

          await userStore.fetchUsers();
        }
      } catch (error) {
        console.error("❌ Delete user error:", error);
        toast.add({
          severity: "error",
          summary: t("userManagement.toast.errorTitle"),
          detail: "Không thể xóa người dùng.",
          life: 3000,
        });
      }
    },
    reject: () => {
      console.log("❌ Delete cancelled");
    },
  });
};

const openChangePasswordDialog = (user: User) => {
  changingPasswordFor.value = user.id;
  selectedUser.value = user;
  newPassword.value = "";
  confirmPassword.value = "";
  showPasswordDialog.value = true;
};

const savePassword = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    toast.add({
      severity: "warn",
      summary: t("userManagement.toast.warningTitle"),
      detail: t("userManagement.toast.requiredPasswordFields"),
      life: 3000,
    });
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.add({
      severity: "error",
      summary: t("userManagement.toast.errorTitle"),
      detail: t("userManagement.toast.passwordMismatch"),
      life: 3000,
    });
    return;
  }
  if (changingPasswordFor.value) {
    const result = await userStore.changePassword(
      changingPasswordFor.value,
      newPassword.value,
    );
    if (result?.success !== false) {
      toast.add({
        severity: "success",
        summary: "Thành công",
        detail: "Đổi mật khẩu thành công.",
        life: 3000,
      });
      closePasswordDialog();
    }
  }
};

const closeDialog = () => {
  showDialog.value = false;
  resetForm();
};

const closePasswordDialog = () => {
  showPasswordDialog.value = false;
  newPassword.value = "";
  confirmPassword.value = "";
  changingPasswordFor.value = null;
};

const resetForm = () => {
  formData.value = {
    username: "",
    password: "",
    phoneNumber: "",
    role: "",
    department: "",
    areaPart: "",
  };
  editingUserId.value = null;
};

const getRoleSeverity = (role: string): string => {
  const severityMap: Record<string, string> = {
    Admin: "danger",
    User: "success",
  };
  return severityMap[role] || "info";
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
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

.phone-number-table {
  font-size: 0.875rem;
  color: #64748b;
}

.phone-number {
  font-size: 0.875rem;
  color: #fff;
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

/* ========== MOBILE CARD LIST ========== */
.mobile-card-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.mobile-user-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.mobile-user-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mobile-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.875rem;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-username {
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
}

.mobile-phone {
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.2rem;
}

.mobile-card-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0.75rem;
}

.mobile-meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

/* Last item (Ngày tạo) spans full width */
.mobile-card-meta .mobile-meta-item:last-child {
  grid-column: 1 / -1;
}

.meta-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.meta-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.mobile-card-actions {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

/* ========== DIALOG ========== */
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

.mobile-card-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 0.9rem;
  transition:
    background 0.18s,
    border-color 0.18s,
    color 0.18s,
    transform 0.12s;
  background: transparent;
}
.action-btn:active {
  transform: scale(0.93);
}

.btn-view {
  color: #64748b;
}
.btn-view:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.btn-edit {
  color: #2563eb;
}
.btn-edit:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.btn-key {
  color: #d97706;
}
.btn-key:hover {
  background: #fffbeb;
  border-color: #fcd34d;
  color: #b45309;
}

.btn-delete {
  color: #ef4444;
}
.btn-delete:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* ========== PRIMEVUE OVERRIDES ========== */
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

:deep(.p-datatable-header) {
  padding: 0;
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

/* ========== RESPONSIVE ========== */
@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
    align-items: start;
    gap: 1rem;
  }

  .table-header {
    flex-direction: column;
    align-items: start;
    gap: 0.5rem;
  }

  .search-input {
    width: 100%;
  }

  .table-header .p-input-icon-left {
    width: 100%;
  }
}
</style>

