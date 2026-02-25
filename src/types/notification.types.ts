import { User } from "./user.types";

export interface Notification{
    id: number
    message: string
    type: string
    accountId: number
    isRead: boolean
    createdAt: string
    orderId: number
    account: User
}