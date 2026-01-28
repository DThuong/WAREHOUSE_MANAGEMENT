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
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/ReportsView.vue' as string),
    meta: { title: 'Báo cáo', requiresAuth: true, role: 'Admin'  }
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(authGuard)

export default router