<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside
      class="sidebar"
      :class="{
        'sidebar-collapsed': !sidebarOpen,
        'mobile-open': mobileSidebarOpen,
      }"
    >
      <div class="sidebar-content" style="padding: 1.5rem">
        <!-- Logo -->
        <router-link
          to="/"
          class="logo-container flex items-center gap-2 mb-4"
          style="margin-bottom: 2rem; text-decoration: none"
        >
          <div
            style="
              width: 40px;
              height: 40px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            "
          >
            <img
              :src="logoImg"
              alt="Dongyang Logo"
              style="width: 100%; height: 100%; object-fit: cover"
            />
          </div>
          <div class="">
            <h2
              style="
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--gray-900);
              "
            >
              Dongyang
            </h2>
            <p style="font-size: 0.75rem; color: var(--gray-500)">
              {{ t("mainLayout.sidebar.subtitle") }}
            </p>
          </div>
        </router-link>

        <!-- Navigation -->
        <nav>
          <div style="margin-bottom: 1.5rem">
            <p
              style="
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--gray-500);
                letter-spacing: 0.05em;
                margin-bottom: 0.75rem;
                padding-left: 1rem;
              "
            >
              {{ t("mainLayout.sidebar.sectionMain") }}
            </p>
            <router-link
              v-for="link in mainLinks"
              :key="link.path"
              :to="link.path"
              class="nav-link"
              :class="{ active: $route.path === link.path }"
              @click="mobileSidebarOpen = false"
            >
              <i :class="link.icon"></i>
              <span>{{ link.label }}</span>
            </router-link>
          </div>

          <div>
            <p
              style="
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--gray-500);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 0.75rem;
                padding-left: 1rem;
              "
            >
              {{ t("mainLayout.sidebar.sectionAccount") }}
            </p>
            <template v-if="userStore.isAuthenticated">
              <a href="/signin" class="nav-link" @click.prevent="handleLogout">
                <i class="pi pi-sign-out"></i>
                <span>{{ t("mainLayout.sidebar.logout") }}</span>
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
      <header class="navbar" ref="navbarRef">
        <div class="flex items-center gap-4">
          <Button
            :icon="
              isMobile
                ? 'pi pi-bars'
                : sidebarOpen
                  ? 'pi pi-angle-double-left'
                  : 'pi pi-angle-double-right'
            "
            text
            rounded
            @click="toggleSidebar"
            style="color: var(--gray-700)"
          />
          <h1
            style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900)"
          >
            {{ pageTitle }}
          </h1>
        </div>

        <div class="flex items-center gap-2">
          <!-- SignalR Connection Status -->
          <div v-if="showConnectionStatus" style="margin-right: 0.5rem">
            <Badge
              :value="connectionStatusText"
              :severity="connectionStatusSeverity"
              style="font-size: 0.7rem"
            />
          </div>

          <!-- Notifications Bell -->
          <div
            style="
              position: relative;
              display: inline-block;
              margin-right: 0.2rem;
            "
          >
            <Button
              icon="pi pi-bell"
              text
              rounded
              severity="secondary"
              style="color: var(--gray-600)"
              @click="toggleNotifications"
            />
            <span
              v-if="notificationStore.unreadCount > 0"
              style="
                position: absolute;
                top: -1px;
                right: 0px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                min-width: 18px;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 600;
                border: 2px solid white;
                line-height: 1;
              "
            >
              {{
                notificationStore.unreadCount > 99
                  ? "99+"
                  : notificationStore.unreadCount
              }}
            </span>
          </div>

          <!-- Language Switcher: desktop/tablet hiện đủ 3 nút -->
          <div class="lang-switcher" v-if="!isMobile">
            <button
              v-for="lang in languageOptions"
              :key="lang.code"
              type="button"
              class="lang-btn"
              :class="{ active: locale === lang.code }"
              :title="lang.label"
              @click="setLanguage(lang.code)"
            >
              {{ lang.flag }}
            </button>
          </div>

          <!-- Language Switcher: mobile chỉ hiện 1 nút + dropdown để đỡ chiếm chỗ -->
          <div class="lang-switcher-mobile" v-else>
            <button
              type="button"
              class="lang-btn-current"
              @click="langMenuOpen = !langMenuOpen"
            >
              {{ locale.toUpperCase() }}
            </button>
            <div
              v-if="langMenuOpen"
              class="lang-dropdown-backdrop"
              @click="langMenuOpen = false"
            />
            <div v-if="langMenuOpen" class="lang-dropdown">
              <button
                v-for="lang in languageOptions"
                :key="lang.code"
                type="button"
                class="lang-dropdown-item"
                :class="{ active: locale === lang.code }"
                @click="
                  setLanguage(lang.code);
                  langMenuOpen = false;
                "
              >
                <span>{{ lang.flag }}</span>
                <span>{{ lang.label }}</span>
              </button>
            </div>
          </div>

          <!-- User Menu -->
          <Avatar
            :label="userAvatar"
            shape="circle"
            size="medium"
            @click="toggleMenu"
            style="
              cursor: pointer;
              margin-right: 1rem;
              background-color: #6366f1;
              color: white;
              font-weight: 600;
            "
          />

          <Menu ref="menu" :model="menuItems" :popup="true">
            <template #start>
              <div
                style="
                  padding: 1rem;
                  border-bottom: 1px solid var(--gray-200);
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                "
              >
                <Avatar
                  :label="userAvatar"
                  shape="circle"
                  size="large"
                  style="
                    background-color: #6366f1;
                    color: white;
                    font-weight: 600;
                  "
                />
                <div>
                  <div style="font-weight: 600">
                    {{ currentUser?.username || "unknown" }}
                  </div>
                  <div style="font-size: 0.875rem; color: var(--gray-600)">
                    @{{ currentUser?.role || "username" }}
                  </div>
                </div>
              </div>
            </template>
          </Menu>
        </div>
      </header>

      <!-- Page Content -->
      <div class="content-area" :class="{ 'content-area-dashboard': route.path === '/' }">
        <slot />
      </div>
    </div>

    <!-- ── DESKTOP: OverlayPanel ── -->
    <OverlayPanel
      v-if="!isMobile"
      ref="notificationPanel"
      appendTo="body"
      style="width: 400px; max-width: 400px"
    >
      <!-- Header -->
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 0 0.75rem 0;
          border-bottom: 1px solid var(--gray-200);
          margin-bottom: 0.5rem;
        "
      >
        <h3 style="font-weight: 600; margin: 0; font-size: 1.125rem">
          {{ t("mainLayout.notifications.title") }}
        </h3>
        <div style="display: flex; align-items: center; gap: 0.5rem">
          <Button
            v-if="notificationStore.unreadCount > 0"
            :label="t('mainLayout.notifications.markAllRead')"
            text
            size="small"
            @click="markAllAsRead"
            style="font-size: 0.75rem"
          />
          <Button
            v-if="
              allNotificationsRead && notificationStore.notifications.length > 0
            "
            :label="t('mainLayout.notifications.deleteAll')"
            text
            size="small"
            icon="pi pi-trash"
            @click="deleteAllNoti"
            style="font-size: 0.75rem"
          />
        </div>
      </div>

      <!-- Loading -->
      <div
        v-if="notificationStore.loading"
        style="text-align: center; padding: 3rem"
      >
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      </div>

      <!-- Empty -->
      <div
        v-else-if="notificationStore.recentNotifications.length === 0"
        style="text-align: center; padding: 3rem 2rem; color: var(--gray-500)"
      >
        <i
          class="pi pi-bell"
          style="
            font-size: 3rem;
            opacity: 0.3;
            display: block;
            margin-bottom: 1rem;
          "
        ></i>
        <p style="margin: 0">{{ t("mainLayout.notifications.empty") }}</p>
      </div>

      <!-- List -->
      <div
        v-else
        style="max-height: 400px; overflow-y: auto; margin: 0 -0.75rem"
      >
        <div
          v-for="notification in notificationStore.recentNotifications"
          :key="notification.id"
          class="notification-item"
          style="
            padding: 0.875rem 1rem;
            border-bottom: 1px solid var(--gray-100);
            cursor: pointer;
            transition: background 0.15s;
          "
          :style="{
            background: notification.isRead ? 'transparent' : 'var(--blue-50)',
          }"
          @click="handleNotificationClick(notification)"
        >
          <div style="display: flex; gap: 0.75rem; align-items: flex-start">
            <Avatar
              :icon="getNotificationIcon(notification.type)"
              shape="circle"
              size="normal"
              :style="{
                backgroundColor: getNotificationColor(notification.type),
                color: 'white',
                flexShrink: 0,
              }"
            />
            <div style="flex: 1; min-width: 0">
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 0.25rem;
                "
              >
                <p
                  style="
                    font-weight: 600;
                    font-size: 0.875rem;
                    margin: 0;
                    color: var(--gray-900);
                  "
                >
                  {{ getNotificationTitle(notification.type) }}
                </p>
                <Badge
                  v-if="!notification.isRead"
                  value=" "
                  severity="info"
                  style="
                    width: 8px;
                    height: 8px;
                    min-width: 8px;
                    padding: 0;
                    margin-left: 0.5rem;
                    flex-shrink: 0;
                  "
                />
              </div>
              <p
                style="
                  font-size: 0.875rem;
                  color: var(--gray-700);
                  margin: 0.25rem 0;
                  word-break: break-word;
                "
              >
                {{ notification.message }}
              </p>
              <p
                style="
                  font-size: 0.75rem;
                  color: var(--gray-400);
                  margin: 0.25rem 0 0 0;
                "
              >
                {{ formatTime(notification.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </OverlayPanel>

    <!-- ── MOBILE: Fixed dropdown từ navbar xuống ── -->
    <Teleport to="body">
      <div
        v-if="isMobile && mobileNotiVisible"
        style="position: fixed; inset: 0; z-index: 9999"
        @click.self="mobileNotiVisible = false"
      >
        <!-- Backdrop mờ -->
        <div
          style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.3)"
          @click="mobileNotiVisible = false"
        />

        <!-- Dropdown panel - fixed ngay dưới navbar -->
        <div
          class="mobile-noti-panel"
          :style="{
            position: 'fixed',
            top: navbarHeight + 'px',
            left: '0.75rem',
            right: '0.75rem',
            width: 'auto',
            maxHeight: `calc(100vh - ${navbarHeight}px - 1rem)`,
            background: 'white',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            borderRadius: '12px',
            zIndex: 10000,
          }"
        >
          <!-- Header -->
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1rem 1.25rem 0.75rem;
              border-bottom: 1px solid var(--gray-200);
              position: sticky;
              top: 0;
              background: white;
              z-index: 1;
            "
          >
            <h3 style="font-weight: 600; margin: 0; font-size: 1.125rem">
              {{ t("mainLayout.notifications.title") }}
            </h3>
            <div style="display: flex; align-items: center; gap: 0.5rem">
              <Button
                v-if="notificationStore.unreadCount > 0"
                :label="t('mainLayout.notifications.markAllRead')"
                text
                size="small"
                @click="markAllAsRead"
                style="font-size: 0.75rem"
              />
              <Button
                v-if="
                  allNotificationsRead &&
                  notificationStore.notifications.length > 0
                "
                :label="t('mainLayout.notifications.deleteAll')"
                text
                size="small"
                icon="pi pi-trash"
                @click="deleteAllNoti"
                style="font-size: 0.75rem"
              />
              <Button
                icon="pi pi-times"
                text
                rounded
                size="small"
                @click="mobileNotiVisible = false"
              />
            </div>
          </div>

          <!-- Loading -->
          <div
            v-if="notificationStore.loading"
            style="text-align: center; padding: 3rem"
          >
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          </div>

          <!-- Empty -->
          <div
            v-else-if="notificationStore.recentNotifications.length === 0"
            style="
              text-align: center;
              padding: 3rem 2rem;
              color: var(--gray-500);
            "
          >
            <i
              class="pi pi-bell"
              style="
                font-size: 3rem;
                opacity: 0.3;
                display: block;
                margin-bottom: 1rem;
              "
            ></i>
            <p style="margin: 0">{{ t("mainLayout.notifications.empty") }}</p>
          </div>

          <!-- List -->
          <div v-else style="max-height: calc(100vh - 200px); overflow-y: auto">
            <div
              v-for="notification in notificationStore.recentNotifications"
              :key="notification.id"
              style="
                padding: 0.875rem 1.25rem;
                border-bottom: 1px solid var(--gray-100);
                cursor: pointer;
                transition: background 0.15s;
              "
              :style="{
                background: notification.isRead
                  ? 'transparent'
                  : 'var(--blue-50)',
              }"
              @click="handleNotificationClick(notification)"
            >
              <div style="display: flex; gap: 0.75rem; align-items: flex-start">
                <Avatar
                  :icon="getNotificationIcon(notification.type)"
                  shape="circle"
                  size="normal"
                  :style="{
                    backgroundColor: getNotificationColor(notification.type),
                    color: 'white',
                    flexShrink: 0,
                  }"
                />
                <div style="flex: 1; min-width: 0">
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      align-items: flex-start;
                      margin-bottom: 0.25rem;
                    "
                  >
                    <p
                      style="
                        font-weight: 600;
                        font-size: 0.875rem;
                        margin: 0;
                        color: var(--gray-900);
                      "
                    >
                      {{ getNotificationTitle(notification.type) }}
                    </p>
                    <Badge
                      v-if="!notification.isRead"
                      value=" "
                      severity="info"
                      style="
                        width: 8px;
                        height: 8px;
                        min-width: 8px;
                        padding: 0;
                        margin-left: 0.5rem;
                        flex-shrink: 0;
                      "
                    />
                  </div>
                  <p
                    style="
                      font-size: 0.875rem;
                      color: var(--gray-700);
                      margin: 0.25rem 0;
                      word-break: break-word;
                    "
                  >
                    {{ notification.message }}
                  </p>
                  <p
                    style="
                      font-size: 0.75rem;
                      color: var(--gray-400);
                      margin: 0.25rem 0 0 0;
                    "
                  >
                    {{ formatTime(notification.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Sidebar overlay -->
    <div
      v-if="mobileSidebarOpen"
      class="sidebar-overlay"
      @click="mobileSidebarOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { signalRService } from "@/services/signalrService";
import Menu from "primevue/menu";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Badge from "primevue/badge";
import OverlayPanel from "primevue/overlaypanel";
import { useToast } from "primevue/usetoast";
import logoImg from "../assets/images/newLogo.jpg";
import type { Notification } from "@/types/notification.types";
import notificationSound from "@/assets/notiSound/notification-sound.mp3";
import { useI18n } from "vue-i18n";
// import { useFaviconBadge } from '@/composables/useFaviconBadge'

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const { t, locale } = useI18n();
const toast = useToast();

// Language switcher
const languageOptions = [
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "ko", flag: "🇰🇷", label: "한국어" },
];

const setLanguage = (lang: string) => {
  localStorage.setItem("dashboardLanguage", lang);
  window.location.reload();
};
// useFaviconBadge()

const sidebarOpen = ref(true);
const mobileSidebarOpen = ref(false);
const langMenuOpen = ref(false);
const notificationPanel = ref(null);
const menu = ref();
const showConnectionStatus = ref(false);
const isMobile = ref(window.innerWidth < 768);
const mobileNotiVisible = ref(false);
const navbarRef = ref<HTMLElement | null>(null);
const navbarHeight = ref(60); // fallback

// Computed
const currentUser = computed(() => userStore.currentUser);
const userAvatar = computed(() => {
  return currentUser?.value?.username?.charAt(0).toUpperCase() || "U";
});

const allNotificationsRead = computed(() => {
  return notificationStore.notifications.every(
    (notification: Notification) => notification.isRead,
  );
});

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    mobileSidebarOpen.value = false;
    mobileNotiVisible.value = false;
  }
  // Cập nhật navbar height khi resize
  if (navbarRef.value) {
    navbarHeight.value = navbarRef.value.offsetHeight;
  }
};

const connectionStatusText = computed(() => {
  const state = signalRService.getConnectionState();
  switch (state) {
    case 0:
      return t("mainLayout.connection.connected");
    case 1:
      return t("mainLayout.connection.connecting");
    case 2:
      return t("mainLayout.connection.reconnecting");
    case 4:
      return t("mainLayout.connection.disconnected");
    default:
      return t("mainLayout.connection.unknown");
  }
});

const connectionStatusSeverity = computed(() => {
  const state = signalRService.getConnectionState();
  switch (state) {
    case 0:
      return "success";
    case 1:
      return "warning";
    case 2:
      return "warning";
    case 4:
      return "danger";
    default:
      return "secondary";
  }
});

const deleteAllNoti = async () => {
  await notificationStore.deleteAll();
};

// Đóng khung thông báo (và dropdown ngôn ngữ mobile) ngay khi user scroll trang,
// tránh panel "trôi" theo / vỡ layout
const handleGlobalScroll = (event: Event) => {
  const target = event.target as HTMLElement | Document;
  if (target instanceof Element && (target.closest('.p-overlaypanel') || target.closest('.mobile-noti-panel'))) {
    return;
  }
  
  notificationPanel.value?.hide();
  mobileNotiVisible.value = false;
  langMenuOpen.value = false;
};

onMounted(async () => {
  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleGlobalScroll, true);
  await notificationStore.fetchNotifications();
  if (userStore.isAuthenticated) {
    await signalRService.start();
  }
  window.addEventListener("signalr-notification", handleSignalRNotification);

  // Đo navbar height sau khi render
  await nextTick();
  if (navbarRef.value) {
    navbarHeight.value = navbarRef.value.offsetHeight;
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("scroll", handleGlobalScroll, true);
  window.removeEventListener("signalr-notification", handleSignalRNotification);
});

const handleSignalRNotification = (event: any) => {
  const notification = event.detail;
  toast.add({
    severity: getToastSeverity(notification.type),
    summary: getNotificationTitle(notification.type),
    detail: notification.message,
    life: 5000,
    group: "notification",
  });
  playNotificationSound();
};

const getNotificationIcon = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "order":
    case "neworder":
      return "pi pi-shopping-cart";
    case "orderapproved":
    case "orderrejected":
    case "orderstatus":
      return "pi pi-check-circle";
    case "stockin":
      return "pi pi-box";
    case "user":
      return "pi pi-user";
    default:
      return "pi pi-bell";
  }
};

const getNotificationColor = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "order":
    case "neworder":
      return "#3b82f6";
    case "orderapproved":
      return "#10b981";
    case "orderrejected":
      return "#ef4444";
    case "stockin":
      return "#8b5cf6";
    case "user":
      return "#f59e0b";
    default:
      return "#6366f1";
  }
};

const getNotificationTitle = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "order":
    case "neworder":
      return t("mainLayout.notifications.types.newOrder");
    case "orderapproved":
      return t("mainLayout.notifications.types.orderApproved");
    case "orderrejected":
      return t("mainLayout.notifications.types.orderRejected");
    case "orderstatus":
      return t("mainLayout.notifications.types.orderStatus");
    case "stockin":
      return t("mainLayout.notifications.types.stockin");
    case "user":
      return t("mainLayout.notifications.types.user");
    default:
      return t("mainLayout.notifications.types.default");
  }
};

const getToastSeverity = (
  type: string,
): "success" | "info" | "warn" | "error" => {
  switch (type?.toLowerCase()) {
    case "orderapproved":
      return "success";
    case "orderrejected":
      return "error";
    case "neworder":
      return "info";
    default:
      return "info";
  }
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t("mainLayout.notifications.time.justNow");
  if (minutes < 60)
    return t("mainLayout.notifications.time.minutesAgo", { n: minutes });
  if (hours < 24)
    return t("mainLayout.notifications.time.hoursAgo", { n: hours });
  if (days < 7) return t("mainLayout.notifications.time.daysAgo", { n: days });
  return date.toLocaleDateString("vi-VN");
};

const playNotificationSound = () => {
  const audio = new Audio(notificationSound);
  audio.volume = 0.3;
  audio.play().catch((err) => console.error("Cannot play sound:", err));
};

const handleNotificationClick = async (notification: Notification) => {
  await notificationStore.markAsRead(notification.id);
  if (notification.type?.toLowerCase().includes("order")) {
    const orderId = notification.orderId;
    if (orderId) {
      router.push({ path: "/orders", query: { orderId: orderId.toString() } });
    } else {
      router.push("/orders");
    }
  }
  notificationPanel.value?.hide();
  mobileNotiVisible.value = false;
};

const markAllAsRead = async () => {
  await notificationStore.markAllRead();
};

const toggleMenu = (event: Event) => {
  menu.value.toggle(event);
};

const handleLogout = async () => {
  try {
    // Điều hướng sang trang đăng nhập TRƯỚC khi xoá thông tin user,
    // tránh avatar bị đổi A -> U trong lúc MainLayout vẫn còn hiển thị
    // (vì userStore.logout() reset currentUser khiến userAvatar fallback "U")
    await router.push("/signin");
    await signalRService.stop();
    await userStore.logout();
  } catch (error) {
    console.error("Logout error:", error);
    toast.add({
      severity: "error",
      summary: t("mainLayout.error.error"),
      detail: t("mainLayout.error.logoutFail"),
      life: 3000,
    });
  }
};

// menuItems → computed
const menuItems = computed(() => [
  {
    label: t("mainLayout.menu.home"),
    icon: "pi pi-home",
    command: () => router.push("/"),
  },
  { separator: true },
  {
    label: t("mainLayout.menu.logout"),
    icon: "pi pi-sign-out",
    command: handleLogout,
  },
]);
const mainLinks = computed(() => [
  { path: "/", label: t("mainLayout.nav.dashboard"), icon: "pi pi-home" },

  { path: "/orders", label: t("mainLayout.nav.orders"), icon: "pi pi-flag" },

  {
    path: "/inventory",
    label: t("mainLayout.nav.inventory"),
    icon: "pi pi-box",
  },

  {
    path: "/stockin",
    label: t("mainLayout.nav.stockin"),
    icon: "pi pi-cart-arrow-down",
  },

  {
    path: "/add-product",
    label: t("mainLayout.nav.addProduct"),
    icon: "pi pi-plus-circle",
  },

  {
    path: "/line-machine",
    label: t("mainLayout.nav.lineMachine"),
    icon: "pi pi-book",
  },

  { path: "/users", label: t("mainLayout.nav.users"), icon: "pi pi-user" },

  {
    path: "/reports",
    label: t("mainLayout.nav.reports"),
    icon: "pi pi-chart-bar",
  },

  { path: "/settings", label: t("mainLayout.nav.settings"), icon: "pi pi-cog" },
]);

const allRouteLabels = computed(() => [
  ...mainLinks.value,
  { path: "/reports/stockin", label: t("reports.importReport.title") },
  { path: "/reports/orders", label: t("reports.orderReport.title") },
  { path: "/reports/inventory", label: t("reports.inventoryReport.title") },
])

const accountLinks = computed(() => [
  {
    path: "/signin",
    label: t("mainLayout.sidebar.login"),
    icon: "pi pi-sign-in",
  },
]);

const pageTitle = computed(() => {
  const currentRoute = allRouteLabels.value.find((link) => link.path === route.path)
  return currentRoute ? currentRoute.label : 'Dashboard'
})

const toggleSidebar = () => {
  if (window.innerWidth < 768) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value;
  } else {
    sidebarOpen.value = !sidebarOpen.value;
  }
};

const toggleNotifications = (event: Event) => {
  if (isMobile.value) {
    mobileNotiVisible.value = !mobileNotiVisible.value;
  } else {
    notificationPanel.value?.toggle(event);
  }
};
</script>

<style scoped>
.content-area {
  overflow-x: hidden;
  min-width: 0;
  width: 100%;
}

/* Chỉ riêng Dashboard mới bung full width */
.content-area-dashboard {
  width: 100%;
  max-width: none;
  padding: 0;
}

/* Ép phần tử con của dashboard không bị giới hạn max-width */
.content-area-dashboard :deep(.dashboard-page) {
  width: 100%;
  max-width: none;
  margin: 0;
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

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  backdrop-filter: blur(2px);
}

.lang-switcher {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 0.75rem;
  padding: 4px;
  border-radius: 12px;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
}

.lang-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 1.05rem;
  line-height: 1;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
  opacity: 0.55;
  transition: all 0.15s ease;
}

.lang-btn:hover {
  opacity: 1;
  background: var(--gray-200);
  border-color: var(--gray-300);
}

.lang-btn.active {
  opacity: 1;
  background: white;
  border-color: var(--primary-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

@media (max-width: 767px) {
  .lang-switcher {
    gap: 2px;
    margin-right: 0.25rem;
    padding: 3px;
  }
  .lang-btn {
    width: 28px;
    height: 28px;
    font-size: 0.95rem;
  }
}

/* Mobile: 1 nút ngôn ngữ hiện tại + dropdown chọn ngôn ngữ khác */
.lang-switcher-mobile {
  position: relative;
  margin-right: 0.25rem;
}

.lang-btn-current {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 28px;
  padding: 0 6px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--gray-700);
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  cursor: pointer;
}

.lang-dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 998;
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 999;
  min-width: 130px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  padding: 4px;
  display: flex;
  flex-direction: column;
}

.lang-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  font-size: 0.85rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  color: var(--gray-700);
}

.lang-dropdown-item:hover {
  background: var(--gray-100);
}

.lang-dropdown-item.active {
  background: var(--gray-100);
  font-weight: 600;
  color: var(--primary-color);
}

.notification-item:hover {
  background: rgba(159, 197, 241, 0.5) !important;
}

.main-content {
  min-width: 0;
  width: calc(100% - 260px);
  margin-left: 260px;
  transition: margin-left 0.2s ease, width 0.2s ease;
}

.main-content.expanded {
  width: calc(100% - 72px);
  margin-left: 72px;
}

/* === DESKTOP COLLAPSED SIDEBAR (icons-only) === */
@media (min-width: 1024px) {
  /* style.css có rule global ".sidebar-collapsed { transform: translateX(-100%) }"
     khiến sidebar trượt hẳn ra ngoài màn hình (mất luôn icon). Override lại
     để sidebar ở lại, chỉ thu nhỏ width còn icon. */
  .sidebar.sidebar-collapsed {
    width: 72px !important;
    transform: translateX(0) !important;
  }

  .sidebar.sidebar-collapsed .sidebar-content {
    padding: 1.5rem 0.5rem !important;
  }

  .sidebar.sidebar-collapsed .logo-container {
    justify-content: center;
  }

  /* Không dùng display:none để ẩn/hiện chữ (gây "kéo chữ" xuống nhiều dòng
     rồi co lại khi sidebar đang animate width). Thay vào đó luôn giữ text
     trên 1 dòng (nowrap) và cắt bằng overflow: hidden theo width của sidebar
     -> chữ chỉ co/giãn theo chiều ngang mượt mà, không bị xuống dòng. */
  .logo-container,
  .nav-link {
    overflow: hidden;
  }

  .logo-container div:last-child,
  .nav-link span,
  nav > div > p {
    white-space: nowrap;
    opacity: 1;
    transition: opacity 0.2s ease, width 0.2s ease, margin 0.2s ease;
  }

  .sidebar.sidebar-collapsed .logo-container div:last-child,
  .sidebar.sidebar-collapsed nav span,
  .sidebar.sidebar-collapsed nav > div > p {
    width: 0;
    opacity: 0;
    margin: 0;
  }

  /* Bỏ gap khi collapsed, nếu không phần gap (do span rỗng để lại) sẽ
     đẩy lệch icon + làm khung nền (active/hover) bị dư padding bên phải */
  .sidebar.sidebar-collapsed .logo-container,
  .sidebar.sidebar-collapsed .nav-link {
    gap: 0;
  }

  .sidebar.sidebar-collapsed .nav-link {
    justify-content: center;
    padding: 0.75rem;
  }

  .sidebar.sidebar-collapsed .nav-link i {
    margin: 0;
    font-size: 1.25rem;
  }
}

/* === MOBILE === */
@media (max-width: 767px) {
  :global(html, body) {
    overflow-x: hidden;
    width: 100%;
    /* position: relative; */
  }

  .app-container {
    overflow-x: hidden;
    width: 100%;
    max-width: 100vw;
  }

  .main-content {
    overflow-x: hidden;
    max-width: 100vw;
  }

  .content-area {
    overflow-x: hidden;
    max-width: 100vw;
  }
  .sidebar {
    position: fixed !important;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 260px !important;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0 !important;
    width: 100% !important;
  }

  .main-content.expanded {
    margin-left: 0 !important;
  }

  .navbar h1 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
    font-size: 1.1rem !important;
  }

  .navbar .flex.items-center.gap-2 {
    gap: 0.35rem !important;
  }

  .navbar :deep(.p-avatar) {
    margin-right: 0 !important;
  }
}

/* === TABLET === */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: 220px !important;
  }

  .sidebar.sidebar-collapsed {
    width: 64px !important;
    transform: translateX(0) !important;
  }

  .sidebar.sidebar-collapsed .sidebar-content > a div:last-child,
  .sidebar.sidebar-collapsed nav span,
  .sidebar.sidebar-collapsed nav p {
    width: 0;
    opacity: 0;
  }

  .sidebar.sidebar-collapsed .nav-link {
    justify-content: center;
    padding: 0.75rem;
  }

  .sidebar.sidebar-collapsed .logo-container div:last-child {
    display: none;
  }
}
</style>
