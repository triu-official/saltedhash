export const vRipple = {
  mounted(el: HTMLElement) {
    el.style.position = 'relative'

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
      ripple.style.pointerEvents = 'none'
      ripple.style.zIndex = '1'

      const bg = window.getComputedStyle(el).backgroundColor
      const isDark = !bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent'
        ? false
        : (parseInt(bg.replace('rgb(', '').replace(')', '').split(',')[0]) < 128)

      ripple.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.12)'

      const size = Math.max(rect.width, rect.height) * 2

      el.appendChild(ripple)

      const animation = ripple.animate([
        { width: '0px', height: '0px', opacity: 0.7 },
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
