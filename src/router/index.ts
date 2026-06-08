import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { authGuard } from './guards'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue' as string),
    meta: { title: 'Dashboard', requiresAuth: true, role: 'Admin' }
  },
  {
    path: '/line-machine',
    name: 'line-machine',
    component: () => import('@/views/LineMachineView.vue' as string),
    meta: { title: 'Quản lý line + machine', requiresAuth: true, role: 'Admin' }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/InventoryView.vue' as string),
    meta: { title: 'Quản lý hàng tồn kho', requiresAuth: true, role: 'Admin' }
  },
  {
    path: '/add-product',
    name: 'AddProduct',
    component: () => import('@/views/AddProductView.vue' as string),
    meta: { title: 'Thêm sản phẩm', requiresAuth: true, role: 'Admin'  }
  },
  {
    path: '/stockin',
    name: 'Stockin',
    component: () => import('@/views/Stockin.vue' as string),
    meta: { title: 'Nhập hàng', requiresAuth: true, role: 'Admin'  }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/ReportsView.vue' as string),
    meta: { title: 'Báo cáo', requiresAuth: true, role: 'Admin'  }
  },
  {
    path: '/reports/stockin',
    name: 'StockinReport',
    component: () => import('@/views/reports/StockinReportView.vue' as string),
    meta: { title: 'Báo cáo nhập kho', requiresAuth: true, role: 'Admin' }
  },
  {
    path: '/reports/orders',
    name: 'OrdersReport',
    component: () => import('@/views/reports/OrdersReportView.vue' as string),
    meta: { title: 'Báo cáo đơn hàng', requiresAuth: true, role: 'Admin' }
  },
  {
    path: '/reports/inventory',
    name: 'InventoryReport',
    component: () => import('@/views/reports/InventoryReportView.vue' as string),
    meta: { title: 'Báo cáo tồn kho', requiresAuth: true, role: 'Admin' }
  },
  {
    path: '/users',
    name: 'Người dùng',
    component: () => import('@/views/UsersView.vue' as string),
    meta: { title: 'Người dùng', requiresAuth: true, role: 'Admin'  }
  },
  {
    path: '/signin',
    name: 'Signin',
    component: () => import('@/views/Signin.vue'),
    meta: { title: 'Đăng nhập', requiresAuth: false }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/OrdersView.vue' as string),
    meta: { title: 'Đơn hàng', requiresAuth: true, role: 'Admin' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue' as string),
    meta: { title: 'Cấu hình', requiresAuth: true, role: 'Admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(authGuard)

export default router