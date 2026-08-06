export interface Line {
  id: number
  lineName: string
  areaPart: string
  machines: Machine[] | null
}

export interface Machine {
  id: number
  machineName: string
  lineId: number
  line?: Line | null
  lineName?: string | null
  managementCode?: string | null
  modelMachine?: string | null
  seriNumber?: string | null
  vendor?: string | null
  dateInput?: string | null
}

// POST /api/Lines
export interface CreateLineRequest {
  lineName: string
  areaPart: string
}

// PUT /api/Lines/{id}
// Backend hiện tại chỉ nhận lineName
export interface UpdateLineRequest {
  lineName: string
}

// POST + PUT /api/Machines/{id}
export interface CreateAndUpdateMachineRequest {
  machineName: string
  lineId: number
  managementCode?: string | null
  modelMachine?: string | null
  seriNumber?: string | null
  vendor?: string | null
  dateInput?: string | null
}

// Nếu source cũ đang import chữ thường thì giữ alias này để không lỗi nhiều chỗ
export type line = Line
export type machine = Machine
export type createAndUpdateMachineRequest = CreateAndUpdateMachineRequest

// Cũ của bạn chỉ có lineName, nhưng POST Line bây giờ cần areaPart.
// Không nên dùng alias này cho cả create/update nữa.
export type createAndUpdateLineRequest = UpdateLineRequest