import * as signalR from '@microsoft/signalr'
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore'

class SignalRService {
  private connection: signalR.HubConnection | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  async start() {
    const userStore = useUserStore()
    
    // Kiểm tra authentication
    if (!userStore.isAuthenticated) {
      console.warn('❌ User not authenticated, cannot connect to SignalR')
      return
    }

    // Nếu đã có connection đang hoạt động, không tạo mới
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`http://172.16.162.103:5002/notificationHub`, {
          accessTokenFactory: () => {
            // Lấy token từ localStorage để đảm bảo luôn có token mới nhất
            const token = localStorage.getItem("auth_token");
            console.log("🔑 SignalR TOKEN:", token ? `${token.substring(0, 20)}... ✅` : "NULL ❌");
            return token || "";
          },
          withCredentials: true,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
          skipNegotiation: false
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < 3) {
              return 2000
            } else if (retryContext.previousRetryCount < 7) {
              return 5000
            } else {
              return 10000
            }
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build()

      // Lắng nghe sự kiện nhận thông báo
      this.setupEventHandlers()

      // Bắt đầu kết nối
      await this.connection.start()
      console.log('✅ SignalR Connected successfully!')
      console.log('🆔 Connection ID:', this.connection.connectionId)
      this.reconnectAttempts = 0

      // Xử lý reconnect
      this.connection.onreconnecting((error) => {
        console.warn('⚠️ SignalR reconnecting...', error)
      })

      this.connection.onreconnected((connectionId) => {
        console.log('✅ SignalR reconnected! Connection ID:', connectionId)
        this.reconnectAttempts = 0
      })

      this.connection.onclose(async (error) => {
        console.error('❌ SignalR connection closed:', error)
        await this.handleReconnect()
      })

    } catch (error) {
      console.error('💥 SignalR connection error:', error)
      await this.handleReconnect()
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return

    const notificationStore = useNotificationStore()
    const userStore = useUserStore()
    
    // Lấy role từ localStorage để đảm bảo đúng
    const role = userStore.currentUser?.role || 'User'
    const isAdmin = role.toLowerCase() === 'admin'

    console.log('👤 Current user role:', role)
    console.log('🔐 Is Admin:', isAdmin)
    
    // Nhận thông báo chung
    this.connection.on('ReceiveNotification', (notification: any) => {
      console.log('📬 [SignalR] Received notification:', notification)
      console.log('📊 [Before] Store notifications count:', notificationStore.notifications.length)
      console.log('🔔 [Before] Unread count:', notificationStore.unreadCount)
      
      // Thêm vào store
      notificationStore.addNotification(notification)
      
      console.log('📊 [After] Store notifications count:', notificationStore.notifications.length)
      console.log('🔔 [After] Unread count:', notificationStore.unreadCount)
      
      // Hiển thị toast
      this.showToastNotification(notification)
    })

    console.log('✅ SignalR event handlers setup complete')
  }

  private showToastNotification(notification: any) {
    const event = new CustomEvent('signalr-notification', {
      detail: notification
    })
    window.dispatchEvent(event)
  }

  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    setTimeout(() => {
      this.start()
    }, this.reconnectDelay)
  }

  async stop() {
    if (this.connection) {
      try {
        await this.connection.stop()
        console.log('🛑 SignalR disconnected')
        this.connection = null
      } catch (error) {
        console.error('❌ Error stopping SignalR:', error)
      }
    }
  }

  // Gửi thông báo (nếu cần)
  async sendNotification(message: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SendNotification', message)
        console.log('✅ Notification sent')
      } catch (error) {
        console.error('❌ Error sending notification:', error)
      }
    } else {
      console.warn('⚠️ SignalR not connected, cannot send notification')
    }
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }
}

export const signalRService = new SignalRService()