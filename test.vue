<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': !sidebarOpen, 'mobile-open': mobileSidebarOpen }">
      <div class="sidebar-content" style="padding: 1.5rem;">
        <!-- Logo -->
        <div class="flex items-center gap-2 mb-4" style="margin-bottom: 2rem;">
          <div style="width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <img :src="logoImg" alt="Dongyang Logo" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div class="">
            <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">Dongyang</h2>
            <p style="font-size: 0.75rem; color: var(--gray-500);">Quản lý kho</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav>
          <div style="margin-bottom: 1.5rem;">
            <p style="font-size: 0.75rem; font-weight: 600; color: var(--gray-500); letter-spacing: 0.05em; margin-bottom: 0.75rem; padding-left: 1rem;">
              Main
            </p>
            <router-link 
              v-for="link in mainLinks" 
              :key="link.path"
              :to="link.path"
              class="nav-link"
              :class="{ active: $route.path === link.path }"
            >
              <i :class="link.icon"></i>
              <span>{{ link.label }}</span>
            </router-link>
          </div>

          <div>
            <p style="font-size: 0.75rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; padding-left: 1rem;">
              Tài khoản
            </p>
            <router-link 
              v-for="link in accountLinks" 
              :key="link.path"
              :to="link.path"
              class="nav-link"
            >
              <i :class="link.icon"></i>
              <span>{{ link.label }}</span>
            </router-link>
          </div>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content" :class="{ expanded: !sidebarOpen }">
      <!-- Navbar -->
      <header class="navbar">
        <div class="flex items-center gap-4">
          <Button 
            :icon="sidebarOpen ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right'"
            text 
            rounded 
            @click="toggleSidebar"
            style="color: var(--gray-700);"
          />
          <h1 style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">
            {{ pageTitle }}
          </h1>
        </div>

        <div class="flex items-center gap-2">
          <!-- Notifications -->
          <div style="position: relative; display: inline-block; margin-right: 0.2rem;">
            <Button 
              icon="pi pi-bell" 
              text 
              rounded
              severity="secondary"
              style="color: var(--gray-600);"
              @click="toggleNotifications"
            />
            <span 
              style="
                position: absolute;
                top: 1px;
                right: 5px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 600;
                border: 2px solid white;
              "
            >
              2
            </span>
          </div>

          <!-- User Menu -->
          <Avatar 
            :image="userStore.currentUser?.avatar || 'https://i.pravatar.cc/150?img=1'" 
            shape="circle" 
            size="medium"
            @click="toggleMenu"
            style="cursor: pointer; margin-right: 1rem;"
          />
          
          <Menu ref="menu" :model="menuItems" :popup="true">
            <template #start>
              <div style="padding: 1rem; border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: 0.75rem;">
                <Avatar 
                  :image="userStore.currentUser?.avatar || 'https://i.pravatar.cc/150?img=1'" 
                  shape="circle" 
                  size="large"
                />
                <div>
                  <div style="font-weight: 600;">{{ userStore.currentUser?.userName || 'User' }}</div>
                  <div style="font-size: 0.875rem; color: var(--gray-600);">@{{ userStore.currentUser?.userName || 'username' }}</div>
                </div>
              </div>
            </template>
          </Menu>
        </div>
      </header>

      <!-- Page Content -->
      <div class="content-area">
        <slot />
      </div>
    </div>

    <!-- Notification Panel -->
    <OverlayPanel ref="notificationPanel">
      <div style="width: 320px">
        <h3 style="font-weight: 600; margin-bottom: 1rem;">Thông báo</h3>
        <div v-for="notification in notifications" :key="notification.id" style="padding: 0.75rem; border-bottom: 1px solid var(--gray-200); cursor: pointer;" class="notification-item">
          <div class="flex gap-2">
            <Avatar :image="notification.avatar" shape="circle" />
            <div style="flex: 1;">
              <p style="font-weight: 500; font-size: 0.875rem; margin-bottom: 0.25rem;">{{ notification.title }}</p>
              <p style="font-size: 0.75rem; color: var(--gray-600); margin-bottom: 0.25rem;">{{ notification.message }}</p>
              <p style="font-size: 0.75rem; color: var(--gray-400);">{{ notification.time }}</p>
            </div>
          </div>
        </div>
        <div style="padding: 0.75rem; text-align: center;">
          <a href="#" style="color: var(--primary-color); font-size: 0.875rem; font-weight: 500;">Xem tất cả thông báo</a>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'
import { useToast } from 'primevue/usetoast'
import logoImg from '../assets/images/newLogo.jpg'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

const sidebarOpen = ref(true)
const mobileSidebarOpen = ref(false)
const notificationPanel = ref(null)
const menu = ref()

const toggleMenu = (event: Event) => {
  menu.value.toggle(event)
}

// ✅ Handle logout
const handleLogout = async () => {
  try {
    const result = await userStore.logout()
    
    if (result.success) {
      toast.add({
        severity: 'success',
        summary: 'Đăng xuất thành công',
        detail: 'Hẹn gặp lại!',
        life: 3000
      })
      
      router.push('/signin')
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Lỗi đăng xuất',
        detail: result.error || 'Đã xảy ra lỗi',
        life: 3000
      })
      
      // Vẫn redirect về signin dù có lỗi
      router.push('/signin')
    }
  } catch (error) {
    console.error('Logout error:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể đăng xuất',
      life: 3000
    })
    
    router.push('/signin')
  }
}

const menuItems = [
  { 
    label: 'Trang chủ', 
    icon: 'pi pi-home',
    command: () => router.push('/')
  },
  { 
    label: 'Cài đặt tài khoản', 
    icon: 'pi pi-cog',
    command: () => router.push('/settings')
  },
  { separator: true },
  { 
    label: 'Đăng xuất', 
    icon: 'pi pi-sign-out',
    command: handleLogout
  },
]

const mainLinks = [
  { path: '/', label: 'Dashboard', icon: 'pi pi-home' },
  { path: '/inventory', label: 'Hàng tồn kho', icon: 'pi pi-box' },
  { path: '/add-product', label: 'Thêm sản phẩm', icon: 'pi pi-plus-circle' },
  { path: '/users', label: 'Người dùng', icon: 'pi pi-user' },
  { path: '/reports', label: 'Báo cáo', icon: 'pi pi-chart-bar' },
]

const accountLinks = [
  { path: '/signin', label: 'Đăng nhập', icon: 'pi pi-sign-in' },
]

const notifications = [
  {
    id: 1,
    title: 'Đơn hàng mới',
    message: 'Đơn hàng #12345 đã được đặt',
    time: '5 phút trước',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 2,
    title: 'Người dùng mới đăng ký',
    message: 'Người dùng @john_doe đã đăng ký',
    time: '30 phút trước',
    avatar: 'https://i.pravatar.cc/150?img=4'
  },
  {
    id: 3,
    title: 'Thanh toán xác nhận',
    message: 'Thanh toán $299 đã được nhận',
    time: '1 giờ trước',
    avatar: 'https://i.pravatar.cc/150?img=2'
  }
]

const pageTitle = computed(() => {
  const currentRoute = mainLinks.find(link => link.path === route.path)
  return currentRoute ? currentRoute.label : 'Dashboard'
})

const toggleSidebar = () => {
  if (window.innerWidth < 768) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  } else {
    sidebarOpen.value = !sidebarOpen.value
  }
}

const toggleNotifications = (event: Event) => {
  notificationPanel.value?.toggle(event)
}
</script>

<style scoped>
.notification-item:hover {
  background: var(--gray-50);
}
</style>