export const vRipple = {
  mounted(el: HTMLElement) {
    el.style.position = 'relative'
    el.style.overflow = 'hidden'

    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const ripple = document.createElement('span')
      ripple.style.position = 'absolute'
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      ripple.style.width = '0'
      ripple.style.height = '0'
      ripple.style.transform = 'translate(-50%, -50%)'
      ripple.style.borderRadius = '50%'
      ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
      ripple.style.pointerEvents = 'none'

      // Final size should be large enough to cover the button
      const size = Math.max(rect.width, rect.height) * 2

      el.appendChild(ripple)

      // Use Web Animations API
      const animation = ripple.animate([
        { width: '0px', height: '0px', opacity: 1 },
        { width: `${size}px`, height: `${size}px`, opacity: 0 }
      ], {
        duration: 400,
        easing: 'ease-out'
      })

      animation.onfinish = () => {
        ripple.remove()
      }
    })
  }
}
