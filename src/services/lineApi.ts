// api/lineApi.ts
import api from './api'
import type {
  Line,
  CreateLineRequest,
  UpdateLineRequest,
} from '@/types/line_machine.types'

export const lineAPI = {
  // GET /api/Lines
  getAllLines: async (): Promise<Line[]> => {
    try {
      return await api.get<Line[]>(`/api/Lines`)
    } catch (error: any) {
      console.error('Error fetching lines:', error)
      throw error
    }
  },

  // GET /api/Lines/{id}
  getLineById: async (id: number): Promise<Line> => {
    try {
      return await api.get<Line>(`/api/Lines/${id}`)
    } catch (error: any) {
      console.error('Error fetching line:', error)
      throw error
    }
  },

  // POST /api/Lines
  createLine: async (data: CreateLineRequest): Promise<Line> => {
    try {
      return await api.post<Line>(`/api/Lines`, data)
    } catch (error: any) {
      console.error('Error creating line:', error)
      throw error
    }
  },

  // PUT /api/Lines/{id}
  updateLine: async (
    id: number,
    data: UpdateLineRequest,
  ): Promise<Line> => {
    try {
      return await api.put<Line>(`/api/Lines/${id}`, data)
    } catch (error: any) {
      console.error('Error updating line:', error)
      throw error
    }
  },

  // DELETE /api/Lines/{id}
  deleteLine: async (id: number): Promise<void> => {
    try {
      await api.delete<void>(`/api/Lines/${id}`)
    } catch (error: any) {
      console.error('Error deleting line:', error)
      throw error
    }
  },
}