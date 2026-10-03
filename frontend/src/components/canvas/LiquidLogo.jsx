import { useEffect, useRef } from 'react'

/**
 * LiquidLogo
 * Interactive WebGL / Canvas liquid metal distortion logo component.
 * Inspired by collidingScopes/liquid-logo.
 * Features undulating liquid chrome reflections and interactive fluid ripples on hover/movement.
 */
export default function LiquidLogo({ onRipple }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let startTime = performance.now()
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 }
    let ripples = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const currentX = e.clientX - rect.left
      const currentY = e.clientY - rect.top

      mouse.vx = currentX - mouse.lastX
      mouse.vy = currentY - mouse.lastY
      mouse.x = currentX
      mouse.y = currentY
      mouse.lastX = currentX
      mouse.lastY = currentY

      // Add ripple on movement over canvas
      if (Math.hypot(mouse.vx, mouse.vy) > 3) {
        ripples.push({
          x: currentX,
          y: currentY,
          radius: 4,
          maxRadius: 65,
          alpha: 0.6,
          speed: 2.2
        })
        if (ripples.length > 12) ripples.shift()
      }
    }

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      // Generates an impactful liquid shockwave
      ripples.push({
        x: clickX,
        y: clickY,
        radius: 5,
        maxRadius: 120,
        alpha: 0.9,
        speed: 4.5
      })

      if (onRipple) onRipple()
    }

    const currentCanvas = canvas
    currentCanvas.addEventListener('mousemove', handleMouseMove)
    currentCanvas.addEventListener('click', handleClick)

    const render = () => {
      const elapsed = (performance.now() - startTime) * 0.001
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      ctx.clearRect(0, 0, w, h)

      // Base Typography Layout
      const centerX = w / 2
      const centerY = h * 0.42

      // Dynamic Liquid Gradient
      const gradient = ctx.createLinearGradient(0, centerY - 40, w, centerY + 40)
      const shift = Math.sin(elapsed * 1.5) * 0.2 + 0.5
      gradient.addColorStop(0, '#FFFFFF')
      gradient.addColorStop(Math.max(0, shift - 0.2), '#B0B0C0')
      gradient.addColorStop(shift, '#3B82F6') // Electric blue streak
      gradient.addColorStop(Math.min(1, shift + 0.2), '#E2E8F0')
      gradient.addColorStop(1, '#8E8EA0')

      // Draw Main Liquid Title: "LASTFIX"
      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Responsive font size
      const fontSize = Math.min(w * 0.16, 76)
      ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      ctx.letterSpacing = '6px'

      // Layer 1: Ambient Liquid Glow
      ctx.shadowColor = 'rgba(59, 130, 246, 0.4)'
      ctx.shadowBlur = 32
      ctx.fillStyle = gradient
      ctx.fillText('LASTFIX', centerX, centerY)

      // Layer 2: Specular Highlights & Chrome Sheen
      ctx.shadowBlur = 0
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
      ctx.lineWidth = 1.5
      ctx.strokeText('LASTFIX', centerX, centerY)

      // Draw Interactive Liquid Wave Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += r.speed
        r.alpha *= 0.94

        if (r.alpha <= 0.02 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha})`
        ctx.lineWidth = 2.5
        ctx.shadowColor = '#3B82F6'
        ctx.shadowBlur = 10
        ctx.stroke()
        ctx.restore()
      }

      // Draw Tagline: "You fixed it before. You just forgot how."
      const taglineFontSize = Math.max(14, Math.min(w * 0.035, 18))
      ctx.font = `500 ${taglineFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      ctx.letterSpacing = '1px'

      // Shimmer effect on tagline
      const tagGrad = ctx.createLinearGradient(centerX - 180, 0, centerX + 180, 0)
      const tagShift = (Math.sin(elapsed * 2.0) + 1) / 2
      tagGrad.addColorStop(0, '#8E8EA0')
      tagGrad.addColorStop(tagShift, '#EDEDF2')
      tagGrad.addColorStop(1, '#8E8EA0')

      ctx.fillStyle = tagGrad
      ctx.fillText('You fixed it before. You just forgot how.', centerX, centerY + fontSize * 0.68)

      ctx.restore()
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      currentCanvas.removeEventListener('mousemove', handleMouseMove)
      currentCanvas.removeEventListener('click', handleClick)
      cancelAnimationFrame(animationFrameId)
    }
  }, [onRipple])

  return (
    <div className="relative w-full max-w-3xl mx-auto h-40 sm:h-48 md:h-56 select-none cursor-pointer">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
        title="Interactive Liquid Logo - Hover or click to create liquid chrome shockwaves"
      />
    </div>
  )
}
