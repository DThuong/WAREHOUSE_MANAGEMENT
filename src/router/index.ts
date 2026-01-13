import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue' as string),
    meta: { title: 'Dashboard' }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/InventoryView.vue' as string),
    meta: { title: 'Quản lý hàng tồn kho' }
  },
  {
    path: '/add-product',
    name: 'AddProduct',
    component: () => import('@/views/AddProductView.vue' as string),
    meta: { title: 'Thêm sản phẩm' }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/ReportsView.vue' as string),
    meta: { title: 'Báo cáo' }
  },
  {
    path: '/suppliers',
    name: 'Suppliers',
    component: () => import('@/views/SuppliersView.vue' as string),
    meta: { title: 'Nhà cung cấp' }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('@/views/CustomersView.vue' as string),
    meta: { title: 'Khách hàng' }
  },
  {
    path: '/signin',
    name: 'Signin',
    component: () => import('@/views/Signin.vue'),
    meta: { title: 'Đăng nhập' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title 
    ? `${to.meta.title as string} - DongYang` 
    : 'DongYang - Quản Lý Kho'
  next()
})

export default router