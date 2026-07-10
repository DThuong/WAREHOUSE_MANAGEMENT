// stockin.types.ts
import { User } from "./user.types"
import { Item } from "./item.types"

export type AreaPart = 'SMD' | 'MAINLINE'

export interface StockinDetail {
    id: number
    stockInId: number
    itemId: number
    quantity: number
    price?: string
    stockIn: Stockin | null
    item: Item
}

export interface Stockin {
    id: number
    accountId: number
    stockInDate: string
    note: string
    areaPart: string
    image: string[]
    account: User
    stockInDetails: StockinDetail[]
}

export interface CreateStockinDetail {
    itemId: number
    quantity: number
    price: string
}

export interface CreateStockin {
    note: string
    areaPart: string
    items: CreateStockinDetail[]
}