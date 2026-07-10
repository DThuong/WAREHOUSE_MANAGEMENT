import api from './api'
import type {
  Item,
  CreateItemRequest,
  UpdateItemRequest,
  UsedInRangeItem,
  DailyMovement,
  ItemTransactionResponse,
  ItemTransactionQuery,
  MachineUsageItem
} from '@/types/item.types'

export const itemAPI = {
  // order and stockin history for item
  getTransactions: async (
    itemId: number,
    query?: ItemTransactionQuery,
  ): Promise<ItemTransactionResponse> => {
    try {
      const params = new URLSearchParams()

      if (query?.fromDate) {
        params.append("fromDate", query.fromDate)
      }

      if (query?.toDate) {
        params.append("toDate", query.toDate)
      }

      const queryString = params.toString()
      const url = `/api/Item/${itemId}/transactions${queryString ? `?${queryString}` : ""}`

      return await api.get<ItemTransactionResponse>(url)
    } catch (error: any) {
      console.error("Error loading item transactions:", error)
      throw error
    }
  },
  // Get all items
  getAll: async (): Promise<Item[]> => {
    try {
      return await api.get<Item[]>(`/api/Item`)
    } catch (error: any) {
      console.error('Error fetching items:', error)
      return []
    }
  },

  // Get item by ID
  getById: async (id: number): Promise<Item> => {
    try {
      return await api.get<Item>(`/api/Item/${id}`)
    } catch (error: any) {
      console.error('Error fetching item:', error)
      throw error
    }
  },

  // Create new item
  create: async (data: CreateItemRequest): Promise<Item> => {
    try {
      return await api.post<Item>(`/api/Item`, data)
    } catch (error: any) {
      console.error('Error creating item:', error)
      throw error
    }
  },

  // Update item
  update: async (id: number, data: UpdateItemRequest): Promise<Item> => {
    try {
      return await api.put<Item>(`/api/Item/${id}`, data)
    } catch (error: any) {
      console.error('Error updating item:', error)
      throw error
    }
  },

  // Delete item
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete<void>(`/api/Item/${id}`)
    } catch (error: any) {
      console.error('Error deleting item:', error)
      throw error
    }
  },

  // Upload SINGLE image - PUT /api/Item/image/{id}
  uploadImage: async (itemId: number, image: File): Promise<void> => {
    try {
      const formData = new FormData()
      formData.append('image', image)

      await api.put<void>(`/api/Item/image/${itemId}`, formData, {
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
  uploadImagesSequentially: async (itemId: number, images: File[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> => {
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const image of images) {
      try {
        await itemAPI.uploadImage(itemId, image)
        success++
      } catch (error: any) {
        failed++
        errors.push(`${image.name}: ${error.message}`)
      }
    }

    return { success, failed, errors }
  },
  // Get image by filename - GET /api/Item/image/{fileName}
  getImage: async (fileName: string) => {
    try {
      const res = await api.get<Item>(`/api/Item/image/${fileName}`)
      return res
    } catch (error: any) {
      console.error('Error get image:', error)
      throw error
    }
  },

  // Delete image - DELETE /api/Item/image/{id}/{imageName}
  deleteImage: async (itemId: number, imageName: string): Promise<void> => {
    try {
      const res = await api.delete<void>(`/api/Item/image/${itemId}/${imageName}`)
      return res
    } catch (error: any) {
      console.error('Error deleting image:', error)
      throw error
    }
  },

  checkUsedInrange: async (fromDate: string, toDate: string): Promise<UsedInRangeItem[]> => {
    try {
      const res = await api.get<UsedInRangeItem[]>(`/api/Item/used-in-range`, {
        params: {
          fromDate,
          toDate
        }
      })
      return res
    } catch (error: any) {
      console.error('Error loading used in range:', error)
      throw error
    }
  },

  getItemRange: async (fromDate: string, toDate: string): Promise<DailyMovement[]> => {
    try {
      return await api.get<DailyMovement[]>(`/api/Item/range`, {
        params: { fromDate, toDate }
      })
    } catch (error: any) {
      console.error('Error loading item range:', error)
      return []
    }
  },

  // Item usage stats for a machine - GET /api/Item/by-machine/{machineId}
  getByMachine: async (
    machineId: number,
    fromDate?: string,
    toDate?: string,
  ): Promise<MachineUsageItem[]> => {
    try {
      const params: Record<string, string> = {}
      if (fromDate) params.fromDate = fromDate
      if (toDate) params.toDate = toDate

      return await api.get<MachineUsageItem[]>(`/api/Item/by-machine/${machineId}`, {
        params,
      })
    } catch (error: any) {
      console.error('Error loading item usage by machine:', error)
      throw error
    }
  },

  // Export Excel - GET /api/Item/export-excel
  exportExcel: async (params: {
    areapart?: string
  }): Promise<void> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.areapart) queryParams.append('areapart', params.areapart)

      const queryString = queryParams.toString()
      const url = `/api/Item/export-excel${queryString ? `?${queryString}` : ''}`

      const response = await api.get(url, { responseType: 'blob' }) as any
      const blob = response instanceof Blob ? response : new Blob([response])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `inventory_report_${new Date().toISOString().slice(0, 10)}.xlsx`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error: any) {
      console.error('Error exporting item excel:', error)
      throw error
    }
  },
}