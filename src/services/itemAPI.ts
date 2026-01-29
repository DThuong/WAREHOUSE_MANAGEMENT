import api from './api'
import type { 
  Item,
  CreateItemRequest, 
  UpdateItemRequest,
} from '@/types/item.types'

export const itemAPI = {
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
  }
}