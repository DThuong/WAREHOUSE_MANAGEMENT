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
            <template v-if="userStore.isAuthenticated">
               <a 
                href="/signin"
                class="nav-link"
                @click.prevent="handleLogout"
              >
                <i class="pi pi-sign-out"></i>
                <span>Đăng xuất</span>
              </a>
            </template>
            <template v-else>
            <router-link 
              v-for="link in accountLinks" 
              :key="link.path"
              :to="link.path"
              class="nav-link"
            >
              <i :class="link.icon"></i>
              <span>{{ link.label }}</span>
            </router-link>
            </template>
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
          <!-- SignalR Connection Status -->
          <div v-if="showConnectionStatus" style="margin-right: 0.5rem;">
            <Badge 
              :value="connectionStatusText" 
              :severity="connectionStatusSeverity"
              style="font-size: 0.7rem;"
            />
          </div>

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
          <!-- Badge tùy chỉnh để đảm bảo reactive -->
          <span 
            v-if="notificationStore.unreadCount > 0"
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
            {{ notificationStore.unreadCount }}
          </span>
        </div>

          <!-- User Menu -->
          <Avatar 
            :label="userAvatar"
            shape="circle" 
            size="medium"
            @click="toggleMenu"
            style="cursor: pointer; margin-right: 1rem; background-color: #6366f1; color: white; font-weight: 600;"
          />
          
          <Menu ref="menu" :model="menuItems" :popup="true">
            <template #start>
              <div style="padding: 1rem; border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: 0.75rem;">
                <Avatar 
                  :label="userAvatar"
                  shape="circle" 
                  size="large"
                  style="background-color: #6366f1; color: white; font-weight: 600;"
                />
                <div>
                  <div style="font-weight: 600;">{{ currentUser?.username || 'unknown' }}</div>
                  <div style="font-size: 0.875rem; color: var(--gray-600);">@{{ currentUser?.role || 'username' }}</div>
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
    <OverlayPanel ref="notificationPanel" style="width: 400px;">
  <div style="min-width: 360px; max-width: 400px;">
    <!-- Header với nút actions -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--gray-200);">
      <h3 style="font-weight: 600; margin: 0; font-size: 1.125rem;">Thông báo</h3>
      <Button 
        v-if="notificationStore.unreadCount > 0"
        label="Đánh dấu tất cả đã đọc" 
        text 
        size="small"
        @click="markAllAsRead"
        style="font-size: 0.75rem; color: var(--primary-color);"
        icon="pi pi-check"
      />
    </div>

    <div v-if="notificationStore.loading" style="text-align: center; padding: 2rem;">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
    </div>

    <div v-else-if="notificationStore.recentNotifications.length === 0" style="text-align: center; padding: 2rem; color: var(--gray-500);">
      <i class="pi pi-bell" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
      <p style="margin: 0;">Không có thông báo mới</p>
    </div>

    <div v-else style="max-height: 400px; overflow-y: auto;">
      <div 
        v-for="notification in notificationStore.recentNotifications" 
        :key="notification.id" 
        style="padding: 0.75rem; border-bottom: 1px solid var(--gray-100); cursor: pointer; transition: background 0.2s;"
        :style="{ background: notification.isRead ? 'transparent' : 'var(--blue-50)' }"
        class="notification-item"
        @click="handleNotificationClick(notification)"
      >
        <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
          <div style="flex-shrink: 0;">
            <Avatar 
              :icon="getNotificationIcon(notification.type)" 
              shape="circle"
              size="normal"
              :style="{ backgroundColor: getNotificationColor(notification.type), color: 'white' }"
            />
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem;">
              <p style="font-weight: 600; font-size: 0.875rem; margin: 0; color: var(--gray-900);">
                {{ getNotificationTitle(notification.type) }}
              </p>
              <Badge 
                v-if="!notification.isRead" 
                value=" " 
                severity="info"
                style="width: 8px; height: 8px; min-width: 8px; padding: 0; margin-left: 0.5rem;"
              />
            </div>
            <p style="font-size: 0.875rem; color: var(--gray-700); margin: 0.25rem 0; word-wrap: break-word;">
              {{ notification.message }}
            </p>
            <p style="font-size: 0.75rem; color: var(--gray-400); margin: 0.25rem 0 0 0;">
              {{ formatTime(notification.createdAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
    </OverlayPanel>

    <!-- Toast for real-time notifications -->
    <Toast position="top-right" group="notification" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { signalRService } from '@/services/signalrService'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import OverlayPanel from 'primevue/overlaypanel'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import logoImg from '../assets/images/newLogo.jpg'
import type { Notification } from '@/types/notification.types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const toast = useToast()

const sidebarOpen = ref(true)
const mobileSidebarOpen = ref(false)
const notificationPanel = ref(null)
const menu = ref()
const showConnectionStatus = ref(false) // Set to true nếu muốn hiển thị connection status

// Computed
const currentUser = computed(() => userStore.currentUser)
const userAvatar = computed(() => {
  return currentUser?.value?.username?.charAt(0).toUpperCase() || 'U'
})

const connectionStatusText = computed(() => {
  const state = signalRService.getConnectionState()
  switch (state) {
    case 0: return 'Đã kết nối'
    case 1: return 'Đang kết nối...'
    case 2: return 'Đang kết nối lại...'
    case 4: return 'Mất kết nối'
    default: return 'Không xác định'
  }
})

const connectionStatusSeverity = computed(() => {
  const state = signalRService.getConnectionState()
  switch (state) {
    case 0: return 'success'
    case 1: return 'warning'
    case 2: return 'warning'
    case 4: return 'danger'
    default: return 'secondary'
  }
})

// Lifecycle hooks
onMounted(async () => {
  // Load notifications từ API
  await notificationStore.fetchNotifications()

  // Kết nối SignalR nếu user đã đăng nhập
  if (userStore.isAuthenticated) {
    await signalRService.start()
  }

  // Lắng nghe event từ SignalR service
  window.addEventListener('signalr-notification', handleSignalRNotification)
})

onUnmounted(() => {
  window.removeEventListener('signalr-notification', handleSignalRNotification)
})

// Methods
const handleSignalRNotification = (event: any) => {
  const notification = event.detail
  
  // Hiển thị toast notification
  toast.add({
    severity: getToastSeverity(notification.type),
    summary: getNotificationTitle(notification.type),
    detail: notification.message,
    life: 5000,
    group: 'notification'
  })

  // Play sound (optional)
  playNotificationSound()
}

const getNotificationIcon = (type: string): string => {
  switch (type?.toLowerCase()) {
    case 'order':
    case 'neworder':
      return 'pi pi-shopping-cart'
    case 'orderapproved':
    case 'orderrejected':
    case 'orderstatus':
      return 'pi pi-check-circle'
    case 'stockin':
      return 'pi pi-box'
    case 'user':
      return 'pi pi-user'
    default:
      return 'pi pi-bell'
  }
}

const getNotificationColor = (type: string): string => {
  switch (type?.toLowerCase()) {
    case 'order':
    case 'neworder':
      return '#3b82f6' // blue
    case 'orderapproved':
      return '#10b981' // green
    case 'orderrejected':
      return '#ef4444' // red
    case 'stockin':
      return '#8b5cf6' // purple
    case 'user':
      return '#f59e0b' // amber
    default:
      return '#6366f1' // indigo
  }
}

const getNotificationTitle = (type: string): string => {
  switch (type?.toLowerCase()) {
    case 'order':
    case 'neworder':
      return 'Đơn hàng mới'
    case 'orderapproved':
      return 'Đơn hàng đã duyệt'
    case 'orderrejected':
      return 'Đơn hàng bị từ chối'
    case 'orderstatus':
      return 'Cập nhật đơn hàng'
    case 'stockin':
      return 'Nhập kho'
    case 'user':
      return 'Người dùng'
    default:
      return 'Thông báo'
  }
}

const getToastSeverity = (type: string): 'success' | 'info' | 'warn' | 'error' => {
  switch (type?.toLowerCase()) {
    case 'orderapproved':
      return 'success'
    case 'orderrejected':
      return 'error'
    case 'neworder':
      return 'info'
    default:
      return 'info'
  }
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  
  return date.toLocaleDateString('vi-VN')
}

const playNotificationSound = () => {
  // Optional: Play notification sound
  const audio = new Audio('/notification-sound.mp3')
  audio.volume = 0.3
  audio.play().catch(err => console.log('Cannot play sound:', err))
}

const handleNotificationClick = async (notification: Notification) => {
  // Đánh dấu đã đọc
  await notificationStore.markAsRead(notification.id)
  
  // Navigate based on notification type
  if (notification.type?.toLowerCase().includes('order')) {
    router.push('/orders')
  }
  
  // Đóng panel
  notificationPanel.value?.hide()
}

const markAllAsRead = async () => {
  await notificationStore.markAllRead()
}

const toggleMenu = (event: Event) => {
  menu.value.toggle(event)
}

const handleLogout = async () => {
  try {
    // Ngắt kết nối SignalR trước khi logout
    await signalRService.stop()
    
    await userStore.logout()
    router.push('/signin')
  } catch (error) {
    console.error('Logout error:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể đăng xuất',
      life: 3000
    })
  }
}

const menuItems = [
  { 
    label: 'Trang chủ', 
    icon: 'pi pi-home',
    command: () => router.push('/')
  },
  { separator: true },
  { 
    label: 'Đăng xuất', 
    icon: 'pi pi-sign-out',
    command: handleLogout
  },
]

const mainLinks = [
  { path: '/', label: 'Bảng điều khiển', icon: 'pi pi-home' },
  { path: '/orders', label: 'Quản lý đơn hàng', icon: 'pi pi-flag' },
  { path: '/inventory', label: 'Quản lý tồn kho', icon: 'pi pi-box' },
  { path: '/stockin', label: 'Quản lý nhập kho', icon: 'pi pi-cart-arrow-down' },
  { path: '/add-product', label: 'Thêm tồn kho', icon: 'pi pi-plus-circle' },
  { path: '/users', label: 'Người dùng', icon: 'pi pi-user' },
  { path: '/reports', label: 'Báo cáo', icon: 'pi pi-chart-bar' },
]

const accountLinks = [
  { path: '/signin', label: 'Đăng nhập', icon: 'pi pi-sign-in' },
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
  background: var(--gray-50) !important;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--gray-700);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  margin-bottom: 0.25rem;
}

.nav-link:hover {
  background: var(--gray-100);
  color: var(--primary-color);
}

.nav-link.active {
  background: var(--primary-color);
  color: white;
}

.nav-link i {
  font-size: 1.125rem;
}
</style>