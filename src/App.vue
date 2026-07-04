<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from '@/components/ui/NavBar.vue'
import ProductPanel from '@/components/ui/ProductPanel.vue'
import InstallPrompt from '@/components/pwa/InstallPrompt.vue'
import UpdateBanner from '@/components/pwa/UpdateBanner.vue'
import { useProductsStore } from '@/stores/products'

const isOnline = ref(navigator.onLine)
const store = useProductsStore()

// Scroll Velocity Tilt
const appContainer = ref<HTMLElement | null>(null)
let lastScrollY = window.scrollY
let targetTilt = 0
let currentTilt = 0
let rafId: number

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const updateTilt = () => {
  currentTilt = lerp(currentTilt, targetTilt, 0.1)
  if (appContainer.value) {
    appContainer.value.style.transform = `perspective(1000px) rotateX(${currentTilt}deg)`
  }

  // Decay target tilt back to 0
  targetTilt = lerp(targetTilt, 0, 0.1)

  rafId = requestAnimationFrame(updateTilt)
}

const handleScroll = () => {
  const scrollY = window.scrollY
  const velocity = scrollY - lastScrollY
  lastScrollY = scrollY

  // Map velocity to tilt, max 0.5deg
  let newTilt = velocity * 0.05
  newTilt = Math.max(-0.5, Math.min(0.5, newTilt))
  targetTilt = newTilt
}

// Cursor Glow
const cursorX = ref(0)
const cursorY = ref(0)
const currentCursorX = ref(0)
const currentCursorY = ref(0)
const isHoveringInteractive = ref(false)
let cursorRafId: number

const updateCursor = () => {
  currentCursorX.value = lerp(currentCursorX.value, cursorX.value, 0.15)
  currentCursorY.value = lerp(currentCursorY.value, cursorY.value, 0.15)
  cursorRafId = requestAnimationFrame(updateCursor)
}

const handleMouseMove = (e: MouseEvent) => {
  cursorX.value = e.clientX
  cursorY.value = e.clientY

  const target = e.target as HTMLElement
  const isInteractive = target.closest('a, button, input, textarea, [role="button"], .cursor-pointer')
  isHoveringInteractive.value = !!isInteractive
}

const updateOnlineStatus = () => { isOnline.value = navigator.onLine }

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  window.addEventListener('scroll', handleScroll, { passive: true })

  // Only add mouse move on desktop (coarse pointer check)
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', handleMouseMove)
    updateCursor()
  }

  updateTilt()

  // Initialize product data globally once
  store.fetchProducts()
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  cancelAnimationFrame(rafId)
  cancelAnimationFrame(cursorRafId)
})

provide('isOnline', isOnline)
</script>

<template>
  <UpdateBanner />
  <NavBar :is-online="isOnline" />

  <!-- Cursor Glow (Desktop Only) -->
  <div
    class="hidden md:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    aria-hidden="true"
  >
    <div
      class="absolute rounded-full transition-all duration-200 ease-out will-change-transform"
      :class="isHoveringInteractive ? 'w-12 h-12 bg-tech/25 blur-md' : 'w-4 h-4 bg-tech/15 blur-[6px]'"
      :style="{
        transform: `translate3d(${currentCursorX - (isHoveringInteractive ? 24 : 8)}px, ${currentCursorY - (isHoveringInteractive ? 24 : 8)}px, 0)`
      }"
    ></div>
  </div>

  <div ref="appContainer" class="origin-top will-change-transform" style="transform-style: preserve-3d;">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>

  <ProductPanel />
  <InstallPrompt />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
</style>