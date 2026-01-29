import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useItemStore } from '@/stores/itemsStore'
import { itemAPI } from '@/services/itemAPI'
import { useToast } from 'primevue/usetoast'
import { CreateItemRequest, UpdateItemRequest} from '@/types/item.types'

export function useItem() {
  const itemStore = useItemStore()
  const toast = useToast()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { 
    items, 
    currentItem, 
    totalItems, 
    engineerItems, 
    consumerItems, 
    lowStockItems 
  } = storeToRefs(itemStore)

  const getImageUrl = (url: string) => {
    if (!url || url.includes('string')) {
      return 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=100&h=100&fit=crop'
    }
    return url
  }

  // Fetch all items
  const fetchItems = async () => {
    loading.value = true
    itemStore.setLoading(true)

    try {
      const itemsData = await itemAPI.getAll()
      if (Array.isArray(itemsData)) {
        itemStore.setItems(itemsData)
      }
    } catch (err: any) {
      error.value = err.message
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải danh sách sản phẩm',
        life: 3000
      })
    } finally {
      loading.value = false
      itemStore.setLoading(false)
    }
  }

  // Fetch item by ID
  const getById = async (id: number) => {
    loading.value = true
    itemStore.setLoading(true)
    error.value = null

    try {
      const data = await itemAPI.getById(id)
      itemStore.setCurrentItem(data)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Lấy thông tin sản phẩm thành công',
        life: 3000
      })
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải thông tin sản phẩm',
        life: 3000
      })
      return { success: false }
    } finally {
      loading.value = false
      itemStore.setLoading(false)
    }
  }

  // Create new item
  const createItem = async (data: CreateItemRequest) => {
    loading.value = true
    itemStore.setLoading(true)
    error.value = null

    try {
      const result = await itemAPI.create(data)
      itemStore.addItem(result)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Thêm sản phẩm thành công',
        life: 3000
      })
      return { success: true, data: result }
    } catch (err: any) {
      error.value = err.message
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể thêm sản phẩm',
        life: 3000
      })
      return { success: false }
    } finally {
      loading.value = false
      itemStore.setLoading(false)
    }
  }

  // Update item
  const updateItem = async (id: number, data: UpdateItemRequest) => {
    loading.value = true
    itemStore.setLoading(true)
    error.value = null

    try {
      const result = await itemAPI.update(id, data)
      itemStore.updateItemInStore(id, result)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật sản phẩm thành công',
        life: 3000
      })
      return { success: true, data: result }
    } catch (err: any) {
      error.value = err.message
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể cập nhật sản phẩm',
        life: 3000
      })
      return { success: false }
    } finally {
      loading.value = false
      itemStore.setLoading(false)
    }
  }

  // Delete item
  const deleteItem = async (id: number) => {
    loading.value = true
    itemStore.setLoading(true)
    error.value = null

    try {
      await itemAPI.delete(id)
      itemStore.removeItem(id)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Xóa sản phẩm thành công',
        life: 3000
      })
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể xóa sản phẩm',
        life: 3000
      })
      return { success: false }
    } finally {
      loading.value = false
      itemStore.setLoading(false)
    }
  }

  const clearError = () => {
    error.value = null
    itemStore.clearError()
  }

  return {
    loading,
    error,
    items,
    currentItem,
    totalItems,
    engineerItems,
    consumerItems,
    lowStockItems,
    fetchItems,
    getById,
    createItem,
    updateItem,
    deleteItem,
    clearError,
    getImageUrl
  }
}