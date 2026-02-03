import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, OrderStatus } from '@/types/order.types'

export const useOrderStore = defineStore('order', () => {
  // State
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // State for image operations
  const uploadingImages = ref(false)
  const deletingImage = ref(false)

  // Getters
  const totalOrders = computed(() => orders.value.length)
  
  const pendingOrders = computed(() => 
    orders.value.filter(order => order.status === 'Pending')
  )
  
  const approvedOrders = computed(() => 
    orders.value.filter(order => order.status === 'Approved')
  )

  const completedOrders = computed(() => 
    orders.value.filter(order => order.status === 'Completed')
  )

  const rejectedOrders = computed(() => 
    orders.value.filter(order => order.status === 'Rejected')
  )

  // Filter orders by status
  const getOrdersByStatus = (status: OrderStatus) => 
    orders.value.filter(order => order.status === status)

  // Get total quantity of all orders
  const totalOrderQuantity = computed(() => 
    orders.value.reduce((total, order) => 
      total + order.orderDetails.reduce((sum, detail) => sum + detail.orderQty, 0), 0
    )
  )

  // Actions
  const setOrders = (newOrders: Order[]) => {
    orders.value = [...newOrders]
  }

  const setCurrentOrder = (order: Order | null) => {
    currentOrder.value = order
  }

  const addOrder = (order: Order) => {
    orders.value = [...orders.value, order]
  }

  const updateOrderInStore = (id: number, updatedOrder: Partial<Order>) => {
    const index = orders.value.findIndex(order => order.id === id)
    if (index !== -1) {
      orders.value[index] = { ...orders.value[index], ...updatedOrder }
      orders.value = [...orders.value]
    }

    // Update currentOrder if it's the same
    if (currentOrder.value?.id === id) {
      currentOrder.value = { ...currentOrder.value, ...updatedOrder }
    }
  }

  const removeOrder = (id: number) => {
    orders.value = orders.value.filter(order => order.id !== id)
    
    // Clear currentOrder if it was deleted
    if (currentOrder.value?.id === id) {
      currentOrder.value = null
    }
  }

  // ===================== IMAGE Actions =====================
  
  // Update images in store after upload
  const updateOrderImages = (orderId: number, newImages: string[]) => {
    const index = orders.value.findIndex(order => order.id === orderId)
    if (index !== -1) {
      orders.value[index].image = newImages
      orders.value = [...orders.value]
    }
    
    // Update currentOrder if it's the same
    if (currentOrder.value?.id === orderId) {
      currentOrder.value.image = newImages
    }
  }

  // Remove specific image from order
  const removeOrderImage = (orderId: number, imageName: string) => {
    const index = orders.value.findIndex(order => order.id === orderId)
    if (index !== -1) {
      orders.value[index].image = orders.value[index].image.filter(
        img => !img.includes(imageName)
      )
      orders.value = [...orders.value]
    }
    
    // Update currentOrder if it's the same
    if (currentOrder.value?.id === orderId) {
      currentOrder.value.image = currentOrder.value.image.filter(
        img => !img.includes(imageName)
      )
    }
  }

  const setUploadingImages = (value: boolean) => {
    uploadingImages.value = value
  }

  const setDeletingImage = (value: boolean) => {
    deletingImage.value = value
  }

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const clearOrders = () => {
    orders.value = []
    currentOrder.value = null
  }

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,
    uploadingImages,
    deletingImage,
    
    // Getters
    totalOrders,
    pendingOrders,
    approvedOrders,
    completedOrders,
    rejectedOrders,
    totalOrderQuantity,
    getOrdersByStatus,
    
    // Actions
    setOrders,
    setCurrentOrder,
    addOrder,
    updateOrderInStore,
    removeOrder,
    updateOrderImages,
    removeOrderImage,
    setUploadingImages,
    setDeletingImage,
    setLoading,
    setError,
    clearError,
    clearOrders
  }
})