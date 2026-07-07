const cleanupKey = '__tiltCleanup'

export const vCardTilt = {
  mounted(el: HTMLElement) {
    el.style.transformStyle = 'preserve-3d'
    el.style.willChange = 'transform'

    let rect: DOMRect | null = null
    let isHovering = false

    const handleMouseEnter = () => {
      isHovering = true
      rect = el.getBoundingClientRect()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!rect || !isHovering) return
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const tiltY = ((x - rect.width / 2) / (rect.width / 2)) * 4
      const tiltX = -((y - rect.height / 2) / (rect.height / 2)) * 4

      el.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
    }

    const handleMouseLeave = () => {
      isHovering = false
      rect = null
      el.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    }

    el.addEventListener('mouseenter', handleMouseEnter, { passive: true })
    el.addEventListener('mousemove', handleMouseMove, { passive: true })
    el.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    ;(el as any)[cleanupKey] = () => {
      el.removeEventListener('mouseenter', handleMouseEnter)
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
      el.style.willChange = ''
    }
  },
  unmounted(el: HTMLElement) {
    const cleanup = (el as any)[cleanupKey]
    if (cleanup) cleanup()
  }
}
