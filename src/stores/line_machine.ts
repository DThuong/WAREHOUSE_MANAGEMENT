import { defineStore } from 'pinia'
import { lineAPI } from '@/services/lineApi'
import { machineAPI } from '@/services/machineApi'
import type {
  Line,
  Machine,
  CreateLineRequest,
  UpdateLineRequest,
  CreateAndUpdateMachineRequest,
} from '@/types/line_machine.types'

interface LineMachineState {
  lines: Line[]
  machines: Machine[]
  selectedLine: Line | null
  selectedMachine: Machine | null
  loading: boolean
  error: string | null
}

export const useLineMachineStore = defineStore('lineMachine', {
  state: (): LineMachineState => ({
    lines: [],
    machines: [],
    selectedLine: null,
    selectedMachine: null,
    loading: false,
    error: null,
  }),

  getters: {
    smdLines: (state) => {
      return state.lines.filter(
        (line) => line.areaPart?.toLowerCase() === 'smd',
      )
    },

    mainlineLines: (state) => {
      return state.lines.filter(
        (line) => line.areaPart?.toLowerCase() === 'mainline',
      )
    },

    getMachinesByLineId: (state) => {
      return (lineId: number) =>
        state.machines.filter((machine) => machine.lineId === lineId)
    },
  },

  actions: {
    setLoading(value: boolean) {
      this.loading = value
    },

    setError(error: unknown) {
      if (error instanceof Error) {
        this.error = error.message
      } else {
        this.error = 'Có lỗi xảy ra'
      }
    },

    clearError() {
      this.error = null
    },

    // =====================
    // LINE ACTIONS
    // =====================

    async fetchLines() {
      this.loading = true
      this.error = null

      try {
        this.lines = await lineAPI.getAllLines()
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchLineById(id: number) {
      this.loading = true
      this.error = null

      try {
        const line = await lineAPI.getLineById(id)
        this.selectedLine = line
        return line
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createLine(data: CreateLineRequest) {
      this.loading = true
      this.error = null

      try {
        const createdLine = await lineAPI.createLine(data)

        // Backend POST trả machines: null nên vẫn push được
        this.lines.unshift(createdLine)

        return createdLine
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateLine(id: number, data: UpdateLineRequest) {
      this.loading = true
      this.error = null

      try {
        const updatedLine = await lineAPI.updateLine(id, data)

        const index = this.lines.findIndex((line) => line.id === id)
        if (index !== -1) {
          this.lines[index] = {
            ...this.lines[index],
            ...updatedLine,
          }
        }

        if (this.selectedLine?.id === id) {
          this.selectedLine = {
            ...this.selectedLine,
            ...updatedLine,
          }
        }

        return updatedLine
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteLine(id: number) {
      this.loading = true
      this.error = null

      try {
        await lineAPI.deleteLine(id)

        this.lines = this.lines.filter((line) => line.id !== id)
        this.machines = this.machines.filter((machine) => machine.lineId !== id)

        if (this.selectedLine?.id === id) {
          this.selectedLine = null
        }
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // =====================
    // MACHINE ACTIONS
    // =====================

    async fetchMachines() {
      this.loading = true
      this.error = null

      try {
        this.machines = await machineAPI.getAllMachines()
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMachineById(id: number) {
      this.loading = true
      this.error = null

      try {
        const machine = await machineAPI.getMachineById(id)
        this.selectedMachine = machine
        return machine
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createMachine(data: CreateAndUpdateMachineRequest) {
      this.loading = true
      this.error = null

      try {
        const createdMachine = await machineAPI.createMachine(data)

        this.machines.unshift(createdMachine)

        // Đồng bộ lại machines bên trong line tương ứng nếu đang có line đó
        const lineIndex = this.lines.findIndex((line) => line.id === data.lineId)
        if (lineIndex !== -1) {
          const currentMachines = this.lines[lineIndex].machines ?? []
          this.lines[lineIndex].machines = [
            ...currentMachines,
            createdMachine,
          ]
        }

        return createdMachine
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateMachine(id: number, data: CreateAndUpdateMachineRequest) {
      this.loading = true
      this.error = null

      try {
        const oldMachine = this.machines.find((machine) => machine.id === id)
        const oldLineId = oldMachine?.lineId

        const updatedMachine = await machineAPI.updateMachine(id, data)

        const index = this.machines.findIndex((machine) => machine.id === id)
        if (index !== -1) {
          this.machines[index] = {
            ...this.machines[index],
            ...updatedMachine,
          }
        }

        if (this.selectedMachine?.id === id) {
          this.selectedMachine = {
            ...this.selectedMachine,
            ...updatedMachine,
          }
        }

        // Nếu máy đổi line, remove khỏi line cũ
        if (oldLineId && oldLineId !== data.lineId) {
          const oldLineIndex = this.lines.findIndex(
            (line) => line.id === oldLineId,
          )

          if (oldLineIndex !== -1) {
            this.lines[oldLineIndex].machines =
              this.lines[oldLineIndex].machines?.filter(
                (machine) => machine.id !== id,
              ) ?? []
          }
        }

        // Add/update vào line mới
        const newLineIndex = this.lines.findIndex(
          (line) => line.id === data.lineId,
        )

        if (newLineIndex !== -1) {
          const currentMachines = this.lines[newLineIndex].machines ?? []
          const machineIndex = currentMachines.findIndex(
            (machine) => machine.id === id,
          )

          if (machineIndex !== -1) {
            currentMachines[machineIndex] = {
              ...currentMachines[machineIndex],
              ...updatedMachine,
            }

            this.lines[newLineIndex].machines = [...currentMachines]
          } else {
            this.lines[newLineIndex].machines = [
              ...currentMachines,
              updatedMachine,
            ]
          }
        }

        return updatedMachine
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteMachine(id: number) {
      this.loading = true
      this.error = null

      try {
        await machineAPI.deleteMachine(id)

        this.machines = this.machines.filter((machine) => machine.id !== id)

        this.lines = this.lines.map((line) => ({
          ...line,
          machines:
            line.machines?.filter((machine) => machine.id !== id) ?? [],
        }))

        if (this.selectedMachine?.id === id) {
          this.selectedMachine = null
        }
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // =====================
    // COMMON
    // =====================

    async fetchInitialData() {
      this.loading = true
      this.error = null

      try {
        const [lines, machines] = await Promise.all([
          lineAPI.getAllLines(),
          machineAPI.getAllMachines(),
        ])

        this.lines = lines
        this.machines = machines
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    resetSelected() {
      this.selectedLine = null
      this.selectedMachine = null
    },

    resetStore() {
      this.lines = []
      this.machines = []
      this.selectedLine = null
      this.selectedMachine = null
      this.loading = false
      this.error = null
    },
  },
})