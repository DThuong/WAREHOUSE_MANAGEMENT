import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useItemStore } from './itemStore'
import { useOrderStore } from './orderStore'
import { useStockinStore } from './stockinStore'
import { useUserStore } from './userStore'
import type { Item } from '@/types/item.types'
import type { OrderStatus } from '@/types/order.types'

// Dashboard specific types
interface DashboardStats {
  totalPurchase: StatItem
  totalOrders: StatItem
  totalStockins: StatItem
  totalStock: StatItem
}

interface StatItem {
  value: number
  change: number
  label: string
}

interface TopItem {
  id: number
  name: string
  code: string
  totalOrdered: number
  percentage: number
  image: string
  stockQty: number
}

interface LowStockItem {
  id: number
  name: string
  code: string
  stockQty: number
  safetyStock: number
  image: string
  status: 'critical' | 'low' | 'warning'
}

interface OrderStatusItem {
  id: number
  orderNumber: string
  orderDate: string
  status: OrderStatus
  totalItems: number
  totalQty: number
  workerName: string
}

interface OrderStatusSummary {
  pending: number
  approved: number
  completed: number
  rejected: number
  total: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const itemStore = useItemStore()
  const orderStore = useOrderStore()
  const stockinStore = useStockinStore()
  const userStore = useUserStore()

  // ============ HELPER FUNCTIONS ============
  
  const getItemName = (item: Item): string => {
    if (item.eng) return item.eng.partname
    if (item.com) return item.com.name
    return `Item #${item.id}`
  }

  const getItemCode = (item: Item): string => {
    return `ITEM-${String(item.id)}`
  }

  const getItemPrice = (item: Item): number => {
    const price = parseFloat(item.price)
    return isNaN(price) ? 0 : price
  }

  const getItemImageUrl = (item: Item): string => {
    if (!item.picture || item.picture.length === 0) {
      return '/placeholder-item.png'
    }
    const firstPicture = item.picture[0]
    if (firstPicture.startsWith('http')) {
      return firstPicture
    }
    return `${import.meta.env.VUE_APP_WAREHOUSE_URL}${firstPicture}`
  }

  // ============ COMPUTED STATS ============
  
  const totalPurchaseValue = computed(() => {
    return itemStore.items.reduce((total, item) => {
      const price = getItemPrice(item)
      return total + (item.stockQty * price)
    }, 0)
  })

  const orderStatusSummary = computed<OrderStatusSummary>(() => ({
    pending: orderStore.pendingOrders.length,
    approved: orderStore.approvedOrders.length,
    completed: orderStore.completedOrders.length,
    rejected: orderStore.rejectedOrders.length,
    total: orderStore.totalOrders
  }))

  const dashboardStats = computed<DashboardStats>(() => ({
    totalPurchase: {
      value: totalPurchaseValue.value,
      change: 5,
      label: 'Tổng giá trị kho'
    },
    totalOrders: {
      value: orderStore.totalOrders,
      change: 12,
      label: 'Tổng đơn hàng'
    },
    totalStockins: {
      value: stockinStore.stockins.length,
      change: 8,
      label: 'Tổng nhập kho'
    },
    totalStock: {
      value: itemStore.totalItems,
      change: 3,
      label: 'Tổng tồn kho'
    }
  }))

  // ============ TOP ITEMS - Most Ordered ============
  
  const topOrderedItems = computed<TopItem[]>(() => {
    const itemOrderMap = new Map<number, number>()
    const TOP_LIMIT = 10
    orderStore.orders
    .filter(order => order.status === 'Completed')
    .forEach(order => {
      order.orderDetails.forEach(detail => {
        const id = detail.item?.id ?? detail.itemId
        if (!id) return
        const currentQty = itemOrderMap.get(id) || 0
        itemOrderMap.set(id, currentQty + detail.orderQty)
      })
    })

    const itemsWithOrderCount = itemStore.items
      .map(item => ({
        item,
        totalOrdered: itemOrderMap.get(item.id!) || 0
      }))
      .filter(({ totalOrdered }) => totalOrdered > 0)
      .sort((a, b) => b.totalOrdered - a.totalOrdered)

    const maxOrdered = itemsWithOrderCount[0]?.totalOrdered || 1
    
    return itemsWithOrderCount.slice(0, TOP_LIMIT).map(({ item, totalOrdered }) => ({
      id: item.id!,
      name: getItemName(item),
      code: getItemCode(item),
      totalOrdered,
      percentage: Math.round((totalOrdered / maxOrdered) * 100),
      image: getItemImageUrl(item),
      stockQty: item.stockQty
    }))
  })

  // ============ LEAST ORDERED ITEMS ============
  
  const leastOrderedItems = computed<TopItem[]>(() => {
    const itemOrderMap = new Map<number, number>()
    const TOP_LIMIT = 10
    orderStore.orders.forEach(order => {
      order.orderDetails.forEach(detail => {
        const currentQty = itemOrderMap.get(detail.itemId) || 0
        itemOrderMap.set(detail.itemId, currentQty + detail.orderQty)
      })
    })

    const itemsWithOrderCount = itemStore.items
      .map(item => ({
        item,
        totalOrdered: itemOrderMap.get(item.id!) || 0
      }))
      .sort((a, b) => a.totalOrdered - b.totalOrdered)

    const maxOrdered = Math.max(...itemsWithOrderCount.map(x => x.totalOrdered), 1)
    
    return itemsWithOrderCount.slice(0, TOP_LIMIT).map(({ item, totalOrdered }) => ({
      id: item.id!,
      name: getItemName(item),
      code: getItemCode(item),
      totalOrdered,
      percentage: totalOrdered === 0 ? 0 : Math.round((totalOrdered / maxOrdered) * 100),
      image: getItemImageUrl(item),
      stockQty: item.stockQty
    }))
  })

  // ============ LOW STOCK ITEMS ============
  // Thêm computed để lấy danh sách items theo từng status
const criticalStockItems = computed<LowStockItem[]>(() => {
  return itemStore.items
    .filter(item => getStockStatus(item) === 'critical')
    .map(item => ({
      id: item.id!,
      name: getItemName(item),
      code: getItemCode(item),
      stockQty: item.stockQty,
      safetyStock: item.saveQuantity,
      image: getItemImageUrl(item),
      status: 'critical' as const
    }))
    .sort((a, b) => {
      const aPercentage = (a.stockQty / a.safetyStock) * 100
      const bPercentage = (b.stockQty / b.safetyStock) * 100
      return aPercentage - bPercentage // Sắp xếp từ nguy cấp nhất
    })
})

const lowStockItemsByStatus = computed<LowStockItem[]>(() => {
  return itemStore.items
    .filter(item => getStockStatus(item) === 'low')
    .map(item => ({
      id: item.id!,
      name: getItemName(item),
      code: getItemCode(item),
      stockQty: item.stockQty,
      safetyStock: item.saveQuantity,
      image: getItemImageUrl(item),
      status: 'low' as const
    }))
})

const warningStockItems = computed<LowStockItem[]>(() => {
  return itemStore.items
    .filter(item => getStockStatus(item) === 'warning')
    .map(item => ({
      id: item.id!,
      name: getItemName(item),
      code: getItemCode(item),
      stockQty: item.stockQty,
      safetyStock: item.saveQuantity,
      image: getItemImageUrl(item),
      status: 'warning' as const
    }))
})

const notConfiguredItems = computed<LowStockItem[]>(() => {
  return itemStore.items
    .filter(item => getStockStatus(item) === 'not-configured')
    .map(item => ({
      id: item.id!,
      name: getItemName(item),
      code: getItemCode(item),
      stockQty: item.stockQty,
      safetyStock: item.saveQuantity,
      image: getItemImageUrl(item),
      status: 'warning' as const // Hoặc tạo type mới
    }))
})
  
  // Thêm helper function để tính stock status
  const getStockStatus = (item: Item): 'critical' | 'low' | 'warning' | 'normal' | 'out-of-stock' | 'not-configured' => {
    const stockQty = item.stockQty || 0
    const saveQty = item.saveQuantity || 0
    // Case 1: Hết hàng hoàn toàn
    if (stockQty === 0) {
      return 'out-of-stock'
    }
    // Case 2: Chưa cấu hình tồn an toàn (CHECK TRƯỚC khi so sánh)
    if (saveQty === 0) {
      return 'not-configured'
    }
    // Case 3: So sánh bình thường khi đã có cả stockQty và saveQty
    if (stockQty >= saveQty) {
      return 'normal'
    }
    // Case 4: Tính % khi stockQty < saveQty
    const stockPercentage = (stockQty / saveQty) * 100
  
    if (stockPercentage <= 25) return 'critical'
    if (stockPercentage <= 50) return 'low'
    return 'warning'
  }

// Thêm computed để đếm theo từng loại
const lowStockCountByStatus = computed(() => ({
  normal: itemStore.items.filter(item => getStockStatus(item) === 'normal').length,
  critical: itemStore.items.filter(item => getStockStatus(item) === 'critical' && item.stockQty > 0).length,
  low: itemStore.items.filter(item => getStockStatus(item) === 'low').length,
  warning: itemStore.items.filter(item => getStockStatus(item) === 'warning').length,
  notConfigured: itemStore.items.filter(item => getStockStatus(item) === 'not-configured').length,
  total: itemStore.items.filter(item => item.stockQty < item.saveQuantity && item.stockQty > 0).length
}))

  // ============ RECENT ORDER STATUS ============
  
  const recentOrderStatus = computed<OrderStatusItem[]>(() => {
    return orderStore.orders
      .map(order => ({
        id: order.id,
        orderNumber: `ORD-${String(order.id).padStart(5, '0')}`,
        orderDate: order.orderDate,
        status: order.status,
        totalItems: order.orderDetails.length,
        totalQty: order.orderDetails.reduce((sum, detail) => sum + detail.orderQty, 0),
        workerName: order.nameWorker
      }))
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 10)
  })

  // ============ OVERVIEW STATS ============
  
  const overviewStats = computed(() => ({
    totalItems: itemStore.totalItems,
    totalUsers: userStore.totalUsers,
    totalStockins: stockinStore.stockins.length,
    lowStockCount: itemStore.items.filter(
      item => item.stockQty > 0 && item.stockQty < item.saveQuantity
    ).length
  }))

  // ============ CHART DATA - Orders by Status ============
  
  const ordersByStatusChartData = computed(() => ({
    labels: ['Pending', 'Approved', 'Completed', 'Rejected'],
    datasets: [{
      data: [
        orderStatusSummary.value.pending,
        orderStatusSummary.value.approved,
        orderStatusSummary.value.completed,
        orderStatusSummary.value.rejected
      ],
      backgroundColor: ['#F2A65A', '#6594B1', '#C5D89D', '#FD7979'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  }))

  // ============ CHART DATA - Stock Value by Category ============
  
  const stockValueChartData = computed(() => {
    let engValue = 0
    let comValue = 0
    
    itemStore.items.forEach(item => {
      const price = getItemPrice(item)
      const value = item.stockQty * price
      
      if (item.eng) {
        engValue += value
      }
      if (item.com) {
        comValue += value
      }
    })

    return {
      labels: ['Engineer', 'Consumer'],
      datasets: [{
        data: [engValue, comValue],
        backgroundColor: ['#696FC7', '#F2AEBB'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    }
  })

  // ============ ACTIONS ============
  
  const refreshDashboard = async () => {
    console.log('Dashboard refreshed')
  }

  return {
    // Stats
    dashboardStats,
    orderStatusSummary,
    overviewStats,
    
    // Lists
    topOrderedItems,
    leastOrderedItems,
    getStockStatus,
    lowStockCountByStatus,
    recentOrderStatus,

    // lowStockItems
    lowStockItemsByStatus,
    warningStockItems,
    criticalStockItems,
    notConfiguredItems,
    
    // Charts
    ordersByStatusChartData,
    stockValueChartData,
    
    // Actions
    refreshDashboard
  }
})