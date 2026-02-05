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
    return `${process.env.VUE_APP_WAREHOUSE_URL}${firstPicture}`
  }

  // ============ COMPUTED STATS ============
  
  const totalPurchaseValue = computed(() => {
    return itemStore.items.reduce((total, item) => {
      const price = getItemPrice(item)
      return total + (item.stockQty * price)
    }, 0)
  })

  // Tổng số lượng tồn kho (tổng stockQty của tất cả items)
  // const totalStockQuantity = computed(() => {
  //   return itemStore.items.reduce((total, item) => {
  //     return total + item.stockQty
  //   }, 0)
  // })

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
      .filter(({ totalOrdered }) => totalOrdered > 0)
      .sort((a, b) => b.totalOrdered - a.totalOrdered)

    const maxOrdered = itemsWithOrderCount[0]?.totalOrdered || 1
    
    return itemsWithOrderCount.slice(0, 5).map(({ item, totalOrdered }) => ({
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
    
    return itemsWithOrderCount.slice(0, 5).map(({ item, totalOrdered }) => ({
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
  
  const lowStockItems = computed<LowStockItem[]>(() => {
    return itemStore.items
      .filter(item => item.stockQty < item.saveQuantity)
      .map(item => {
        const stockPercentage = (item.stockQty / item.saveQuantity) * 100
        
        let status: 'critical' | 'low' | 'warning'
        if (stockPercentage <= 25) status = 'critical'
        else if (stockPercentage <= 50) status = 'low'
        else status = 'warning'

        return {
          id: item.id!,
          name: getItemName(item),
          code: getItemCode(item),
          stockQty: item.stockQty,
          safetyStock: item.saveQuantity,
          image: getItemImageUrl(item),
          status
        }
      })
      .sort((a, b) => {
        const statusOrder = { critical: 0, low: 1, warning: 2 }
        return statusOrder[a.status] - statusOrder[b.status]
      })
      .slice(0, 10)
  })

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
    lowStockCount: lowStockItems.value.length
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
    lowStockItems,
    recentOrderStatus,
    
    // Charts
    ordersByStatusChartData,
    stockValueChartData,
    
    // Actions
    refreshDashboard
  }
})