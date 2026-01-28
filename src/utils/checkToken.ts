/**
 * Kiểm tra token đã hết hạn chưa
 * @param expiresAt - ISO date string từ backend
 * @returns true nếu token đã hết hạn
 */
export function isTokenExpired(expiresAt?: string | { expiresAt: string }): boolean {
  // Xử lý trường hợp truyền vào cả object user
  let expirationDate: string | undefined
  
  if (typeof expiresAt === 'string') {
    expirationDate = expiresAt
  } else if (expiresAt && typeof expiresAt === 'object' && 'expiresAt' in expiresAt) {
    expirationDate = expiresAt.expiresAt
  }
  
  if (!expirationDate) {
    return false
  }

  try {
    const expirationTime = new Date(expirationDate).getTime()
    const currentTime = Date.now()
    const isExpired = currentTime >= expirationTime
    return isExpired
  } catch (error) {
    console.error('❌ Error parsing expiresAt:', error)
    return false
  }
}

/**
 * Lấy thời gian còn lại của token (milliseconds)
 * @param expiresAt - ISO date string từ backend
 * @returns milliseconds còn lại, hoặc 0 nếu đã hết hạn
 */
export function getTokenTimeRemaining(expiresAt?: string): number {
  if (!expiresAt) return 0
  
  try {
    const expirationTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()
    const remaining = Math.max(0, expirationTime - currentTime)
    
    return remaining
  } catch (error) {
    console.error('❌ Error parsing expiresAt:', error)
    return 0
  }
}

/**
 * Format thời gian còn lại thành string dễ đọc
 * @param expiresAt - ISO date string từ backend
 * @returns "2 hours 30 minutes" hoặc "EXPIRED"
 */
export function formatTokenTimeRemaining(expiresAt?: string): string {
  const remaining = getTokenTimeRemaining(expiresAt)
  
  if (remaining === 0) return 'EXPIRED'
  
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}