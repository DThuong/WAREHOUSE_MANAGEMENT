// composables/useFaviconBadge.ts
import { watch } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import logoUrl from '@/assets/images/logo.png'

export function useFaviconBadge() {
  const notificationStore = useNotificationStore()

  const SIZE = 32

  const applyFavicon = (canvas: HTMLCanvasElement) => {
    document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove())
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = canvas.toDataURL('image/png')
    document.head.appendChild(link)
  }

  const drawBadge = (ctx: CanvasRenderingContext2D, count: number) => {
    const label = count > 99 ? '99+' : String(count)
    const badgeR = label.length > 2 ? 16 : 13 // bán kính badge

    const cx = SIZE - badgeR - 2       // tâm X: góc phải
    const cy = badgeR + 2               // tâm Y: góc trên

    // Viền trắng
    ctx.beginPath()
    ctx.arc(cx, cy, badgeR + 2, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()

    // Nền đỏ
    ctx.beginPath()
    ctx.arc(cx, cy, badgeR, 0, Math.PI * 2)
    ctx.fillStyle = '#ef4444'
    ctx.fill()

    // Số
    ctx.fillStyle = 'white'
    ctx.font = `bold ${badgeR * 1.1}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, cx, cy + 1)
  }

  const updateFavicon = (count: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')!

    const img = new Image()
    img.src = logoUrl + '?v=' + Date.now()

    img.onload = () => {
      ctx.clearRect(0, 0, SIZE, SIZE)
      ctx.drawImage(img, 0, 0, SIZE, SIZE)
      if (count > 0) drawBadge(ctx, count)
      applyFavicon(canvas)
    }

    img.onerror = () => {
      ctx.fillStyle = '#6366f1'
      ctx.beginPath()
      ctx.roundRect(0, 0, SIZE, SIZE, 10)
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('D', SIZE / 2, SIZE / 2)
      if (count > 0) drawBadge(ctx, count)
      applyFavicon(canvas)
    }
  }

  watch(
    () => notificationStore.unreadCount,
    (count) => updateFavicon(count),
    { immediate: true }
  )
}