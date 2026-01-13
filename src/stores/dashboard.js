import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const stats = ref({
    totalSales: {
      value: 25000,
      change: 5,
      label: 'Tổng doanh thu'
    },
    totalPurchase: {
      value: 18000,
      change: 22,
      label: 'Tổng mua hàng'
    },
    totalExpenses: {
      value: 9000,
      change: 10,
      label: 'Tổng chi phí'
    },
    invoiceDue: {
      value: 25000,
      change: 35,
      label: 'Hóa đơn chưa thanh toán'
    }
  })

  const detailedStats = ref([
    {
      title: 'Tổng lợi nhuận',
      value: 25458,
      change: 35,
      label: 'so với tháng trước'
    },
    {
      title: 'Hoàn trả thanh toán',
      value: 45458,
      change: -20,
      label: 'so với tháng trước'
    },
    {
      title: 'Tổng chi phí',
      value: 34458,
      change: -20,
      label: 'so với tháng trước'
    }
  ])

  const topProducts = ref([
    {
      id: 1,
      name: 'Tai nghe không dây',
      price: 89,
      units: 1250,
      percentage: 18,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      name: 'Tay cầm chơi game',
      price: 49,
      units: 5420,
      percentage: 32,
      image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      name: 'Đồng hồ thông minh Pro',
      price: 98,
      units: 862,
      percentage: 22,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'
    },
    {
      id: 4,
      name: 'Sạc nhanh USB-C',
      price: 35,
      units: 3200,
      percentage: 28,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&h=100&fit=crop'
    },
    {
      id: 5,
      name: 'Loa Bluetooth di động',
      price: 65,
      units: 2890,
      percentage: 25,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop'
    }
  ])

  const lowStockProducts = ref([
    {
      id: 554433,
      name: 'Tai nghe không dây',
      stock: 6,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop'
    },
    {
      id: 887766,
      name: 'Bộ cáp USB-C',
      stock: 9,
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=100&h=100&fit=crop'
    },
    {
      id: 332211,
      name: 'Miếng dán bảo vệ màn hình',
      stock: 3,
      image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=100&h=100&fit=crop'
    },
    {
      id: 998877,
      name: 'Pin dự phòng 20000mAh',
      stock: 7,
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=100&h=100&fit=crop'
    },
    {
      id: 665544,
      name: 'Bàn phím cơ RGB',
      stock: 2,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&h=100&fit=crop'
    }
  ])

  const recentSales = ref([
    {
      id: 1,
      name: 'MacBook Pro 16"',
      category: 'Máy tính',
      price: 2499,
      quantity: 2,
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      name: 'AirPods Pro Max',
      category: 'Âm thanh',
      price: 549,
      quantity: 1,
      status: 'processing',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100&h=100&fit=crop'
    },
    {
      id: 3,
      name: 'iPad Air 11"',
      category: 'Máy tính bảng',
      price: 799,
      quantity: 1,
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&h=100&fit=crop'
    },
    {
      id: 4,
      name: 'Apple Watch Ultra',
      category: 'Đồng hồ',
      price: 799,
      quantity: 1,
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=100&h=100&fit=crop'
    },
    {
      id: 5,
      name: 'Magic Keyboard',
      category: 'Phụ kiện',
      price: 299,
      quantity: 1,
      status: 'cancelled',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&h=100&fit=crop'
    }
  ])

  const overviewStats = ref({
    suppliers: 6987,
    customers: 4896,
    orders: 487
  })

  const customerOverview = ref({
    firstTime: { count: 5500, percentage: 25 },
    return: { count: 3500, percentage: 21 }
  })

  // Getters
  const totalRevenue = computed(() => {
    return stats.value.totalSales.value - stats.value.totalExpenses.value
  })

  // Actions
  const updateStats = (newStats) => {
    stats.value = { ...stats.value, ...newStats }
  }

  return {
    stats,
    detailedStats,
    topProducts,
    lowStockProducts,
    recentSales,
    overviewStats,
    customerOverview,
    totalRevenue,
    updateStats
  }
})
