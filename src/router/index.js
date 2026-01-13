import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Dashboard' }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/InventoryView.vue'),
    meta: { title: 'Quản lý hàng tồn kho' }
  },
  {
    path: '/add-product',
    name: 'AddProduct',
    component: () => import('@/views/AddProductView.vue'),
    meta: { title: 'Thêm sản phẩm' }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/ReportsView.vue'),
    meta: { title: 'Báo cáo' }
  },
  {
    path: '/suppliers',
    name: 'Suppliers',
    component: () => import('@/views/SuppliersView.vue'),
    meta: { title: 'Nhà cung cấp' }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('@/views/CustomersView.vue'),
    meta: { title: 'Khách hàng' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - InApp` : 'InApp - Quản Lý Kho'
  next()
})

export default router
