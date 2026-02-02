// stockinAPI.ts
import api from './api'
import type { Stockin, CreateStockin } from '@/types/stockin.types'

export const stockinAPI = {
    // Get all stockin
    getAllStockin: async (): Promise<Stockin[]> => {
        try {
            return await api.get<Stockin[]>(`/api/StockIn`)
        } catch (error: any) {
            console.error('Error fetching stockins:', error)
            throw error
        }
    },

    // Get stockin by id
    getStockinById: async (id: number): Promise<Stockin> => {
        try {
            return await api.get<Stockin>(`/api/StockIn/${id}`)
        } catch (error: any) {
            console.error('Error fetching stockin:', error)
            throw error
        }
    },

    // Filter stockin by date range
    filterStockin: async (fromDate?: string, toDate?: string): Promise<Stockin[]> => {
        try {
            const params = new URLSearchParams()
            if (fromDate) params.append('fromDate', fromDate)
            if (toDate) params.append('toDate', toDate)
            
            const queryString = params.toString()
            const url = `/api/StockIn/filter${queryString ? `?${queryString}` : ''}`
            
            return await api.get<Stockin[]>(url)
        } catch (error: any) {
            console.error('Error filtering stockins:', error)
            throw error
        }
    },

    // Create stockin
    createStockin: async (data: CreateStockin): Promise<Stockin> => {
        try {
            return await api.post<Stockin>(`/api/StockIn`, data)
        } catch (error: any) {
            console.error('Error creating stockin:', error)
            throw error
        }
    },

    // Delete stockin
    deleteStockin: async (id: number): Promise<void> => {
        try {
            await api.delete<void>(`/api/StockIn/${id}`)
        } catch (error: any) {
            console.error('Error deleting stockin:', error)
            throw error
        }
    },

    // Upload SINGLE image - PUT /api/StockIn/image/{id}
    uploadImage: async (stockinId: number, image: File): Promise<void> => {
        try {
            const formData = new FormData()
            formData.append('image', image)

            await api.put<void>(`/api/StockIn/image/${stockinId}`, formData, {
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
    uploadImagesSequentially: async (stockinId: number, images: File[]): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }> => {
        let success = 0
        let failed = 0
        const errors: string[] = []

        for (const image of images) {
            try {
                await stockinAPI.uploadImage(stockinId, image)
                success++
            } catch (error: any) {
                failed++
                errors.push(`${image.name}: ${error.message}`)
            }
        }

        return { success, failed, errors }
    },

    // Get image by filename
    getImage: async (fileName: string) => {
        try {
            return await api.get<Blob>(`/api/StockIn/image/${fileName}`, {
                responseType: 'blob'
            })
        } catch (error: any) {
            console.error('Error getting image:', error)
            throw error
        }
    },

    // Delete image
    deleteImage: async (stockinId: number, imageName: string): Promise<void> => {
        try {
            await api.delete<void>(`/api/StockIn/image/${stockinId}/${imageName}`)
        } catch (error: any) {
            console.error('Error deleting image:', error)
            throw error
        }
    }
}