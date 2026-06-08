// api/machineApi.ts
import api from './api'
import type {
  Machine,
  CreateAndUpdateMachineRequest,
} from '@/types/line_machine.types'

export const machineAPI = {
  // GET /api/Machines
  getAllMachines: async (): Promise<Machine[]> => {
    try {
      return await api.get<Machine[]>(`/api/Machines`)
    } catch (error: any) {
      console.error('Error fetching machines:', error)
      throw error
    }
  },

  // GET /api/Machines/{id}
  getMachineById: async (id: number): Promise<Machine> => {
    try {
      return await api.get<Machine>(`/api/Machines/${id}`)
    } catch (error: any) {
      console.error('Error fetching machine:', error)
      throw error
    }
  },

  // POST /api/Machines
  createMachine: async (
    data: CreateAndUpdateMachineRequest,
  ): Promise<Machine> => {
    try {
      return await api.post<Machine>(`/api/Machines`, data)
    } catch (error: any) {
      console.error('Error creating machine:', error)
      throw error
    }
  },

  // PUT /api/Machines/{id}
  updateMachine: async (
    id: number,
    data: CreateAndUpdateMachineRequest,
  ): Promise<Machine> => {
    try {
      return await api.put<Machine>(`/api/Machines/${id}`, data)
    } catch (error: any) {
      console.error('Error updating machine:', error)
      throw error
    }
  },

  // DELETE /api/Machines/{id}
  deleteMachine: async (id: number): Promise<void> => {
    try {
      await api.delete<void>(`/api/Machines/${id}`)
    } catch (error: any) {
      console.error('Error deleting machine:', error)
      throw error
    }
  },
}