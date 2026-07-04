<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Download, X } from 'lucide-vue-next'

const deferredPrompt = ref<any>(null)
const showPrompt = ref(false)
const hasScrolled = ref(false)
const dismissed = ref(false)

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault()
  deferredPrompt.value = e
  showPrompt.value = true
}

const handleScroll = () => {
  if (!hasScrolled.value && window.scrollY > window.innerHeight * 0.5) {
    hasScrolled.value = true
  }
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('scroll', handleScroll)
})

const install = async () => {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') {
    showPrompt.value = false
  }
  deferredPrompt.value = null
}

const dismiss = (e: Event) => {
  e.stopPropagation()
  dismissed.value = true
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    enter-from-class="opacity-0 translate-x-[40px]"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 translate-x-[40px]"
  >
    <div
      v-if="showPrompt && hasScrolled && !dismissed"
      @click="install"
      class="group fixed bottom-6 right-6 md:w-12 md:h-12 w-14 h-14 bg-foreground text-background rounded-full shadow-[var(--shadow-lg)] z-[999] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-180"
      title="Install App"
    >
      <Download class="w-5 h-5 text-background" />

      <!-- Dismiss button (appears on hover on desktop, always visible on mobile as small dot) -->
      <button
        @click.stop="dismiss"
        class="absolute -top-1 -left-1 w-5 h-5 bg-background text-foreground rounded-full border border-neutral-200 flex items-center justify-center shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Dismiss install prompt"
      >
        <X class="w-3 h-3" />
      </button>
    </div>
  </Transition>
</template>
