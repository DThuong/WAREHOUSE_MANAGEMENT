<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition name="preview-fade">
      <div
        v-if="visible"
        class="image-preview-backdrop"
        @click.self="handleBackdropClick"
        @wheel.prevent="handleWheel"
      >
        <!-- Toolbar -->
        <div class="image-preview-toolbar">
          <!-- Counter -->
          <span v-if="images.length > 1" class="preview-counter">
            {{ currentIndex + 1 }} / {{ images.length }}
          </span>

          <div class="preview-actions">
            <button class="preview-btn" :title="t('imagePreview.rotateLeft')" @click="rotate(-90)">
              <i class="pi pi-replay"></i>
            </button>
            <button class="preview-btn" :title="t('imagePreview.rotateRight')" @click="rotate(90)">
              <i class="pi pi-refresh"></i>
            </button>
            <button class="preview-btn" :title="t('imagePreview.zoomOut')" @click="zoom(-0.25)">
              <i class="pi pi-search-minus"></i>
            </button>
            <span class="preview-zoom-label">{{ Math.round(scale * 100) }}%</span>
            <button class="preview-btn" :title="t('imagePreview.zoomIn')" @click="zoom(0.25)">
              <i class="pi pi-search-plus"></i>
            </button>
            <button class="preview-btn" :title="t('imagePreview.reset')" @click="resetTransform">
              <i class="pi pi-expand"></i>
            </button>
            <button class="preview-btn" :title="t('imagePreview.download')" @click="download">
              <i class="pi pi-download"></i>
            </button>
            <button class="preview-btn preview-btn-close" :title="t('imagePreview.close')" @click="emit('close')">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>

        <!-- Prev button -->
        <button
          v-if="images.length > 1 && currentIndex > 0"
          class="preview-nav preview-nav-prev"
          @click="emit('prev')"
        >
          <i class="pi pi-chevron-left"></i>
        </button>

        <!-- Image wrapper -->
        <div
          ref="containerRef"
          class="image-preview-container"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
          @touchstart.prevent="startTouch"
          @touchmove.prevent="onTouch"
          @touchend="stopTouch"
          @dblclick="handleDoubleClick"
        >
          <img
            ref="imgRef"
            :src="currentSrc"
            class="preview-image"
            :style="imgStyle"
            draggable="false"
            @load="onImageLoad"
          />
        </div>

        <!-- Next button -->
        <button
          v-if="images.length > 1 && currentIndex < images.length - 1"
          class="preview-nav preview-nav-next"
          @click="emit('next')"
        >
          <i class="pi pi-chevron-right"></i>
        </button>

        <!-- Thumbnails -->
        <div v-if="images.length > 1" class="preview-thumbnails">
          <div
            v-for="(img, idx) in images"
            :key="idx"
            class="preview-thumb"
            :class="{ active: idx === currentIndex }"
            @click="emit('goto', idx)"
          >
            <img :src="img" draggable="false" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  visible: boolean
  currentSrc: string
  images: string[]
  currentIndex: number
}>()

const emit = defineEmits<{
  close: []
  prev: []
  next: []
  goto: [index: number]
}>()

// Transform state
const scale = ref(1)
const rotation = ref(0)
const translateX = ref(0)
const translateY = ref(0)

// Drag state
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// Touch / pinch state
const lastTouchDist = ref(0)
const lastTouchCenter = ref({ x: 0, y: 0 })

const imgRef = ref<HTMLImageElement>()
const containerRef = ref<HTMLDivElement>()

const imgStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) rotate(${rotation.value}deg) scale(${scale.value})`,
  cursor: isDragging.value ? 'grabbing' : 'grab',
  transition: isDragging.value ? 'none' : 'transform 0.15s ease',
}))

// Reset khi đổi ảnh
watch(() => props.currentSrc, () => {
  resetTransform()
})

// Đóng bằng Escape
const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.visible) return
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') emit('prev')
  if (e.key === 'ArrowRight') emit('next')
}

watch(() => props.visible, (val) => {
  if (val) {
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
  } else {
    window.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
    resetTransform()
  }
})

const onImageLoad = () => {
  resetTransform()
}

// ========================
// TRANSFORM FUNCTIONS
// ========================
const resetTransform = () => {
  scale.value = 1
  rotation.value = 0
  translateX.value = 0
  translateY.value = 0
}

const rotate = (deg: number) => {
  rotation.value += deg
}

const zoom = (delta: number) => {
  const newScale = Math.min(Math.max(scale.value + delta, 0.25), 5)
  scale.value = newScale
}

const handleWheel = (e: WheelEvent) => {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  zoom(delta)
}

const handleDoubleClick = () => {
  if (scale.value !== 1) {
    resetTransform()
  } else {
    scale.value = 2
  }
}

const handleBackdropClick = () => {
  emit('close')
}

// ========================
// MOUSE DRAG
// ========================
const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - translateX.value,
    y: e.clientY - translateY.value,
  }
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  translateX.value = e.clientX - dragStart.value.x
  translateY.value = e.clientY - dragStart.value.y
}

const stopDrag = () => {
  isDragging.value = false
}

// ========================
// TOUCH (pinch zoom + drag)
// ========================
const startTouch = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    isDragging.value = true
    dragStart.value = {
      x: e.touches[0].clientX - translateX.value,
      y: e.touches[0].clientY - translateY.value,
    }
  } else if (e.touches.length === 2) {
    isDragging.value = false
    lastTouchDist.value = getTouchDist(e)
    lastTouchCenter.value = getTouchCenter(e)
  }
}

const onTouch = (e: TouchEvent) => {
  if (e.touches.length === 1 && isDragging.value) {
    translateX.value = e.touches[0].clientX - dragStart.value.x
    translateY.value = e.touches[0].clientY - dragStart.value.y
  } else if (e.touches.length === 2) {
    const dist = getTouchDist(e)
    const ratio = dist / lastTouchDist.value
    zoom((ratio - 1) * scale.value * 0.5)
    lastTouchDist.value = dist
  }
}

const stopTouch = () => {
  isDragging.value = false
}

const getTouchDist = (e: TouchEvent) => {
  const dx = e.touches[0].clientX - e.touches[1].clientX
  const dy = e.touches[0].clientY - e.touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const getTouchCenter = (e: TouchEvent) => ({
  x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
  y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
})

// ========================
// DOWNLOAD
// ========================
const download = () => {
  const a = document.createElement('a')
  a.href = props.currentSrc
  a.download = props.currentSrc.split('/').pop() || 'image'
  a.target = '_blank'
  a.click()
}
</script>

<style scoped>
.image-preview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

/* Toolbar */
.image-preview-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: 10;
}

.preview-counter {
  color: rgba(255,255,255,0.85);
  font-size: 0.875rem;
  font-weight: 500;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.preview-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(255,255,255,0.12);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.preview-btn:hover {
  background: rgba(255,255,255,0.25);
}

.preview-btn-close {
  background: rgba(239, 68, 68, 0.5);
  margin-left: 0.5rem;
}

.preview-btn-close:hover {
  background: rgba(239, 68, 68, 0.85);
}

.preview-zoom-label {
  color: rgba(255,255,255,0.7);
  font-size: 0.75rem;
  min-width: 40px;
  text-align: center;
}

/* Image container */
.image-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  will-change: transform;
}

/* Nav buttons */
.preview-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: background 0.15s;
  z-index: 10;
}

.preview-nav:hover {
  background: rgba(255,255,255,0.3);
}

.preview-nav-prev { left: 1rem; }
.preview-nav-next { right: 1rem; }

/* Thumbnails */
.preview-thumbnails {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: linear-gradient(to top, rgba(0,0,0,0.75), transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1rem;
  overflow-x: auto;
  z-index: 10;
}

.preview-thumb {
  width: 52px;
  height: 52px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.15s, border-color 0.15s;
}

.preview-thumb.active {
  border-color: white;
  opacity: 1;
}

.preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Transition */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.2s ease;
}
.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

/* Mobile */
@media (max-width: 767px) {
  .preview-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .preview-zoom-label {
    display: none;
  }

  .preview-nav {
    width: 36px;
    height: 36px;
  }

  .preview-nav-prev { left: 0.5rem; }
  .preview-nav-next { right: 0.5rem; }
}
</style>