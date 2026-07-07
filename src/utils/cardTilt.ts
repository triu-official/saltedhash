const cleanupKey = '__tiltCleanup'

export const vCardTilt = {
  mounted(el: HTMLElement) {
    el.style.transformStyle = 'preserve-3d'
    el.style.willChange = 'transform'
    el.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, border-color 0.3s ease'

    let rect: DOMRect | null = null

    const handleMouseEnter = () => {
      rect = el.getBoundingClientRect()
      el.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!rect) return
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Calculate rotation (-5 to 5 degrees)
      const tiltY = ((x - rect.width / 2) / (rect.width / 2)) * 5
      const tiltX = -((y - rect.height / 2) / (rect.height / 2)) * 5

      el.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
    }

    const handleMouseLeave = () => {
      rect = null
      el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, border-color 0.3s ease'
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    }

    el.addEventListener('mouseenter', handleMouseEnter, { passive: true })
    el.addEventListener('mousemove', handleMouseMove, { passive: true })
    el.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    ;(el as any)[cleanupKey] = () => {
      el.removeEventListener('mouseenter', handleMouseEnter)
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  },
  unmounted(el: HTMLElement) {
    const cleanup = (el as any)[cleanupKey]
    if (cleanup) cleanup()
  }
}
