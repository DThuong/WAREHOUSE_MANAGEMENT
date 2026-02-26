import { ref } from 'vue'

export const useImagePreview = () => {
  const visible = ref(false)
  const currentSrc = ref('')
  const images = ref<string[]>([])
  const currentIndex = ref(0)

  const open = (src: string, imageList?: string[]) => {
    currentSrc.value = src
    images.value = imageList || [src]
    currentIndex.value = images.value.indexOf(src)
    if (currentIndex.value === -1) currentIndex.value = 0
    visible.value = true
  }

  const close = () => {
    visible.value = false
  }

  const prev = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      currentSrc.value = images.value[currentIndex.value]
    }
  }

  const next = () => {
    if (currentIndex.value < images.value.length - 1) {
      currentIndex.value++
      currentSrc.value = images.value[currentIndex.value]
    }
  }

  return { visible, currentSrc, images, currentIndex, open, close, prev, next }
}