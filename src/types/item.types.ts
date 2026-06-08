// Item Types
export interface EngItem {
  partname: string
  location: string
  description: string
  vender: string
}

export interface ComItem {
  name: string
  location: string
  specifications: string
  manufacturer: string
}

export interface Item {
  id?: number
  itemIndentifyId?: string
  type: string
  saveQuantity: number
  areaPart: string
  price: string
  unit: string
  stockPrice: number
  stockQty: number
  picture: string[]
  eng?: EngItem
  com?: ComItem
}

export interface CreateItemRequest {
  type: string
  saveQuantity: number
  price: string
  unit: string
  stockQty: number
  picture: string[]
  eng?: EngItem
  com?: ComItem
}

export interface UpdateItemRequest {
  type?: string
  saveQuantity?: number
  price?: string
  unit?: string
  stockQty?: number
  picture?: string[]
  eng?: EngItem
  com?: ComItem
}

export interface UsedInRangeItem {
  itemId: number
  totalOrdered: number
  totalStockIn: number
  item: Item
}

// Enum for item category
export enum ItemCategory {
  ENGINEER = 'ENGINEER',
  CONSUMER = 'CONSUMER'
}

export interface DailyMovementItem {
  itemId: number
  itemName: string
  totalOrdered: number
  totalStockIn: number
  openingStock: number
  closingStock: number
  item: Item
}

export interface DailyMovement {
  date: string
  items: DailyMovementItem[]
}

export interface ItemOrderTransaction {
  orderDetailId: number
  orderId: number
  orderDate: string
  orderQty: number
  status: string

  lineName: string | null
  machineName: string | null

  detailTotal: number
  orderTotal: number
}

export interface ItemStockInTransaction {
  stockInDetailId: number
  stockInId: number
  stockInDate: string
  quantity: number
}

export interface ItemTransactionResponse {
  itemId: number
  itemIndentifyId: string
  orders: ItemOrderTransaction[]
  stockIns: ItemStockInTransaction[]
}

export interface ItemTransactionQuery {
  fromDate?: string
  toDate?: string
}