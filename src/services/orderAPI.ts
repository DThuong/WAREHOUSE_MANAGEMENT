import api from './api'
import type { 
  Order,
  CreateOrderRequest, 
} from '@/types/order.types'

export const orderAPI = {
  // Get all orders - GET /api/Order
  getAll: async (): Promise<Order[]> => {
    try {
      return await api.get<Order[]>(`/api/Order`)
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      return []
    }
  },

  // Filter orders - GET /api/Order/filter
  filterOrders: async (params: {
    id?: number
    fromDate?: string
    toDate?: string
    status?: string
    department?: string
    areaPart?: string
  }): Promise<Order[]> => {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.id) queryParams.append('Id', params.id.toString())
      if (params.fromDate) queryParams.append('FromDate', params.fromDate)
      if (params.toDate) queryParams.append('ToDate', params.toDate)
      if (params.status) queryParams.append('Status', params.status)
      if (params.department) queryParams.append('Department', params.department)
      if (params.areaPart) queryParams.append('AreaPart', params.areaPart)

      const queryString = queryParams.toString()
      const url = `/api/Order/filter${queryString ? `?${queryString}` : ''}`
      
      return await api.get<Order[]>(url)
    } catch (error: any) {
      console.error('Error filtering orders:', error)
      return []
    }
  },

  // Get order by ID - GET /api/Order/{id}
  getById: async (id: number): Promise<Order> => {
    try {
      return await api.get<Order>(`/api/Order/${id}`)
    } catch (error: any) {
      console.error('Error fetching order:', error)
      throw error
    }
  },

  // Create new order - POST /api/Order
  create: async (data: CreateOrderRequest): Promise<Order> => {
    try {
      return await api.post<Order>(`/api/Order`, data)
    } catch (error: any) {
      console.error('Error creating order:', error)
      throw error
    }
  },

  // Delete order - DELETE /api/Order/{id}
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete<void>(`/api/Order/${id}`)
    } catch (error: any) {
      console.error('Error deleting order:', error)
      throw error
    }
  },

  // Update order status - PUT /api/Order/status/{id}
  updateStatus: async (id: number, status: string, note?: string): Promise<Order> => {
  try {
    const payload = {
      newStatus: status,
      note: note || null 
    }
    
    return await api.put<Order>(
      `/api/Order/status/${id}`, 
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error: any) {
    console.error('Error updating order status:', error)
    throw error
  }
},

  // ===================== IMAGE APIs =====================

  // Upload SINGLE image - PUT /api/Order/image/{id}
  uploadImage: async (orderId: number, image: File): Promise<void> => {
    try {
      const formData = new FormData()
      formData.append('image', image)

      await api.put<void>(`/api/Order/image/${orderId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error: any) {
      console.error('Error uploading image:', error)
      throw error
    }
  },

  // Upload MULTIPLE images sequentially
  uploadImagesSequentially: async (orderId: number, images: File[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> => {
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const image of images) {
      try {
        await orderAPI.uploadImage(orderId, image)
        success++
      } catch (error: any) {
        failed++
        errors.push(`${image.name}: ${error.message}`)
      }
    }

    return { success, failed, errors }
  },

  // Get image by filename - GET /api/Order/image/{fileName}
  getImage: async (fileName: string): Promise<any> => {
    try {
      return await api.get<any>(`/api/Order/image/${fileName}`)
    } catch (error: any) {
      console.error('Error getting image:', error)
      throw error
    }
  },

  // Delete image - DELETE /api/Order/image/{id}/{imageName}
  deleteImage: async (orderId: number, imageName: string): Promise<void> => {
    try {
      await api.delete<void>(`/api/Order/image/${orderId}/${imageName}`)
    } catch (error: any) {
      console.error('Error deleting image:', error)
      throw error
    }
  }
}