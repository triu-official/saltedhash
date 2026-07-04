<script setup lang="ts">
import { logger } from '@/utils/logger'
import { ref, onMounted } from 'vue'
import { useTresContext, useLoop } from '@tresjs/core'
import { CanvasTexture, DoubleSide, TextureLoader } from 'three'
import type { PerspectiveCamera } from 'three'
import { useProductsStore } from '@/stores/products'
import type { Product } from '@/composables/useProducts'

const props = defineProps<{
  product: Product;
  position: [number, number, number];
  isDimmed?: boolean;
}>()

const emit = defineEmits<{
  hover: [id: string];
  unhover: [];
}>()

const store = useProductsStore()
const meshRef = ref()
const materialRef = ref()
const { camera } = useTresContext()
const { onBeforeRender } = useLoop()
const hovered = ref(false)
const startTime = ref(0)
const entryDuration = 1.5

const categoryColor = (cat: string | undefined): string => {
  const map: Record<string, string> = { tech: '#233CB5', natural: '#2F4F2F' }
  return map[cat || ''] || '#666666'
}

function drawCanvasTexture(): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 682
  const ctx = canvas.getContext('2d')!
  const w = 512, h = 682
  const R = 24

  const cat = props.product.category || ''
  const col = categoryColor(cat)
  const name = props.product.name
  const price = props.product.price
  const brand = props.product.brand_code

  ctx.beginPath()
  ctx.moveTo(R, 0)
  ctx.lineTo(w - R, 0)
  ctx.quadraticCurveTo(w, 0, w, R)
  ctx.lineTo(w, h - R)
  ctx.quadraticCurveTo(w, h, w - R, h)
  ctx.lineTo(R, h)
  ctx.quadraticCurveTo(0, h, 0, h - R)
  ctx.lineTo(0, R)
  ctx.quadraticCurveTo(0, 0, R, 0)
  ctx.closePath()

  ctx.fillStyle = '#FAF9F6'
  ctx.fill()

  ctx.strokeStyle = '#d4d4d4'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(R, 0)
  ctx.lineTo(w - R, 0)
  ctx.quadraticCurveTo(w, 0, w, R)
  ctx.lineTo(w, h - R)
  ctx.quadraticCurveTo(w, h, w - R, h)
  ctx.lineTo(R, h)
  ctx.quadraticCurveTo(0, h, 0, h - R)
  ctx.lineTo(0, R)
  ctx.quadraticCurveTo(0, 0, R, 0)
  ctx.closePath()
  ctx.clip()

  ctx.fillStyle = col
  ctx.fillRect(0, 0, 6, h)

  ctx.textAlign = 'left'
  ctx.font = '600 11px "Inter", sans-serif'
  ctx.fillStyle = col
  ctx.fillText(cat.toUpperCase(), 28, 44)

  ctx.textAlign = 'center'
  ctx.font = '700 24px "Playfair Display", Georgia, serif'
  ctx.fillStyle = '#111827'

  const words = name.split(' ')
  let line = ''
  let ly = h / 2 - 24
  const maxW = w - 56
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, w / 2, ly)
      line = word
      ly += 32
    } else {
      line = test
    }
  }
  ctx.fillText(line, w / 2, ly)

  if (price) {
    ly += 48
    ctx.textAlign = 'center'
    ctx.font = '600 22px "Inter", sans-serif'
    ctx.fillStyle = '#111827'
    ctx.fillText(`\u20B9${price.toFixed(2)}`, w / 2, ly)
  }

  ctx.textAlign = 'right'
  ctx.font = '400 10px "JetBrains Mono", monospace'
  ctx.fillStyle = '#a3a3a3'
  ctx.fillText(brand, w - 20, h - 16)

  ctx.restore()

  return new CanvasTexture(canvas)
}

onMounted(async () => {
  startTime.value = performance.now()

  if (materialRef.value) {
    if (props.product.imageFileId) {
      const textureLoader = new TextureLoader()
      try {
        const textureUrl = store.getImageUrl(props.product.imageFileId)
        if (textureUrl) {
          const texture = await textureLoader.loadAsync(textureUrl)
          materialRef.value.map = texture
          materialRef.value.needsUpdate = true
          return
        }
      } catch (e) {
        logger.error('Error loading texture', e)
      }
    }

    const tex = drawCanvasTexture()
    materialRef.value.map = tex
    materialRef.value.needsUpdate = true
  }

  if (meshRef.value) {
    meshRef.value.scale.set(0.01, 0.01, 0.01)
  }
})

onBeforeRender(() => {
  if (!meshRef.value) return

  const now = performance.now()
  const progress = Math.min((now - startTime.value) / 1000 / entryDuration, 1)

  const easeOutBack = (t: number): number => {
    const c = 1.70158
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
  }
  const s = easeOutBack(progress)

  meshRef.value.scale.set(s, s, s)

  const baseY = props.position[1]
  const floatOffset = Math.sin(now / 1000 * 2 + props.position[0]) * 0.2 * (progress >= 1 ? 1 : 0)
  const dropY = (1 - progress) * 5
  meshRef.value.position.set(props.position[0], baseY + floatOffset - dropY, props.position[2])

  if (materialRef.value && progress >= 1) {
    if (props.isDimmed) {
      materialRef.value.opacity = 0.6
    } else {
      materialRef.value.opacity = 1.0
    }
  }

  const cam = (camera && 'value' in camera ? camera.value : camera) as PerspectiveCamera | undefined
  if (cam?.position) {
    meshRef.value.lookAt(cam.position)
  }
})

const handleClick = () => {
  store.openProductPanel(props.product)
}

const handlePointerOver = () => {
  document.body.style.cursor = 'pointer'
  hovered.value = true
  emit('hover', props.product.$id)
}

const handlePointerOut = () => {
  document.body.style.cursor = 'default'
  hovered.value = false
  emit('unhover')
}
</script>

<template>
  <TresMesh
    ref="meshRef"
    @click="handleClick"
    @pointer-enter="handlePointerOver"
    @pointer-leave="handlePointerOut"
  >
    <TresPlaneGeometry :args="[3, 4]" />
    <TresMeshBasicMaterial
      ref="materialRef"
      :side="DoubleSide"
      :transparent="true"
    />
  </TresMesh>
</template>
