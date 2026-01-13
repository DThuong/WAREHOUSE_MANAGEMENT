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
            <p style="font-size: 0.75rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; padding-left: 1rem;">
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
            icon="pi pi-bars" 
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
          <Button 
            icon="pi pi-bell" 
            text 
            rounded
            badge="2"
            badgeClass="p-badge-danger"
            style="position: relative; color: var(--gray-600);"
            @click="toggleNotifications"
          />

          <!-- User Menu -->
          <div class="flex items-center gap-2 cursor-pointer" @click="toggleUserMenu" style="padding: 0.5rem; border-radius: 8px; transition: background 0.2s;" @mouseover="$event.currentTarget.style.background = 'var(--gray-50)'" @mouseleave="$event.currentTarget.style.background = 'transparent'">
            <Avatar 
              image="https://i.pravatar.cc/150?img=1" 
              shape="circle" 
              size="large"
            />
          </div>
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

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import logoImg from '../assets/images/logo.png'

const route = useRoute()
const sidebarOpen = ref(true)
const mobileSidebarOpen = ref(false)
const notificationPanel = ref(null)

const mainLinks = [
  { path: '/', label: 'Dashboard', icon: 'pi pi-home' },
  { path: '/inventory', label: 'Hàng tồn kho', icon: 'pi pi-box' },
  { path: '/add-product', label: 'Thêm sản phẩm', icon: 'pi pi-plus-circle' },
  { path: '/reports', label: 'Báo cáo', icon: 'pi pi-chart-bar' },
  { path: '/suppliers', label: 'Nhà cung cấp', icon: 'pi pi-users' },
  { path: '/customers', label: 'Khách hàng', icon: 'pi pi-user' }
]

const accountLinks = [
  { path: '/signin', label: 'Đăng nhập', icon: 'pi pi-sign-in' },
  { path: '/signup', label: 'Đăng ký', icon: 'pi pi-user-plus' }
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

const toggleNotifications = (event) => {
  notificationPanel.value.toggle(event)
}

const toggleUserMenu = () => {
  // Handle user menu toggle
}
</script>

<style scoped>
.notification-item:hover {
  background: var(--gray-50);
}
</style>
