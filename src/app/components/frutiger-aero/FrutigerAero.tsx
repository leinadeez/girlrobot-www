'use client'

import { useEffect, useRef } from 'react'

const BUBBLE_COUNT = 28

interface Bubble {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  opacity: number
  hue: number
}

function randomBubble(w: number, h: number, fromBottom = false): Bubble {
  const r = 50 + Math.random() * 130
  return {
    x: Math.random() * w,
    y: fromBottom ? h + r : Math.random() * h,
    r,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(0.2 + Math.random() * 0.45),
    opacity: 0.55 + Math.random() * 0.35,
    hue: 185 + Math.random() * 30,
  }
}

function drawBubble(ctx: CanvasRenderingContext2D, b: Bubble) {
  const { x, y, r, opacity, hue } = b

  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.clip()

  // Transparent aqua body
  const body = ctx.createRadialGradient(x, y + r * 0.2, r * 0.05, x, y, r)
  body.addColorStop(0,   `hsla(${hue}, 70%, 80%, ${opacity * 0.15})`)
  body.addColorStop(0.7, `hsla(${hue}, 80%, 60%, ${opacity * 0.25})`)
  body.addColorStop(1,   `hsla(${hue}, 90%, 40%, ${opacity * 0.55})`)
  ctx.fillStyle = body
  ctx.fillRect(x - r, y - r, r * 2, r * 2)

  // Large soft top highlight — diffuse glow
  const glow = ctx.createRadialGradient(x - r * 0.2, y - r * 0.25, 0, x - r * 0.2, y - r * 0.2, r * 0.85)
  glow.addColorStop(0,   `rgba(255, 255, 255, ${opacity * 0.22})`)
  glow.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.08})`)
  glow.addColorStop(1,   'rgba(255, 255, 255, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(x - r, y - r, r * 2, r * 2)

  // Sharp bright specular spot — top left
  const spec = ctx.createRadialGradient(x - r * 0.42, y - r * 0.42, 0, x - r * 0.42, y - r * 0.42, r * 0.32)
  spec.addColorStop(0,    `rgba(255, 255, 255, ${opacity * 1.0})`)
  spec.addColorStop(0.35, `rgba(255, 255, 255, ${opacity * 0.6})`)
  spec.addColorStop(0.7,  `rgba(255, 255, 255, ${opacity * 0.15})`)
  spec.addColorStop(1,    'rgba(255, 255, 255, 0)')
  ctx.fillStyle = spec
  ctx.fillRect(x - r, y - r, r * 2, r * 2)

  // Bottom caustic / inner reflection
  const caustic = ctx.createRadialGradient(x + r * 0.25, y + r * 0.55, 0, x + r * 0.25, y + r * 0.55, r * 0.3)
  caustic.addColorStop(0,   `rgba(200, 245, 255, ${opacity * 0.35})`)
  caustic.addColorStop(0.5, `rgba(200, 245, 255, ${opacity * 0.12})`)
  caustic.addColorStop(1,   'rgba(200, 245, 255, 0)')
  ctx.fillStyle = caustic
  ctx.fillRect(x - r, y - r, r * 2, r * 2)

  ctx.restore()

  // Bright rim with inner darker edge for depth
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.7})`
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(x, y, r - 3, 0, Math.PI * 2)
  ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${opacity * 0.3})`
  ctx.lineWidth = 2
  ctx.stroke()
}

interface Ray {
  angle: number
  spread: number
  opacity: number
}

interface RayLayer {
  rays: Ray[]
  speed: number
  lengthMult: number
  fadeStart: number
}

function drawRayLayer(ctx: CanvasRenderingContext2D, w: number, h: number, layer: RayLayer, time: number) {
  const cx = w * 1.2
  const cy = -h * 0.15
  const len = Math.sqrt(w * w + h * h) * layer.lengthMult

  ctx.save()
  for (const ray of layer.rays) {
    const a = ray.angle + time * layer.speed
    const a1 = a - ray.spread / 2
    const a2 = a + ray.spread / 2

    const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len)
    grad.addColorStop(0,              `rgba(255, 255, 235, ${ray.opacity})`)
    grad.addColorStop(layer.fadeStart, `rgba(255, 255, 235, ${ray.opacity * 0.45})`)
    grad.addColorStop(0.85,           `rgba(255, 255, 235, ${ray.opacity * 0.08})`)
    grad.addColorStop(1,              'rgba(255, 255, 235, 0)')

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a1) * len, cy + Math.sin(a1) * len)
    ctx.lineTo(cx + Math.cos(a2) * len, cy + Math.sin(a2) * len)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
  }
  ctx.restore()
}

function makeRays(count: number, opacityMin: number, opacityMax: number, spreadMin: number, spreadMax: number): Ray[] {
  return Array.from({ length: count }, (_, i) => ({
    angle: (Math.PI * 0.45) + (i / (count - 1)) * (Math.PI * 0.65),
    spread: spreadMin + Math.random() * (spreadMax - spreadMin),
    opacity: opacityMin + Math.random() * (opacityMax - opacityMin),
  }))
}

export default function FrutigerAero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let bubbles: Bubble[] = Array.from({ length: BUBBLE_COUNT }, () =>
      randomBubble(canvas.width, canvas.height)
    )

    // Three ray layers — background (wide/soft), mid, foreground (narrow/bright)
    const rayLayers: RayLayer[] = [
      { rays: makeRays(10, 0.06, 0.12, 0.10, 0.22), speed: 0.00005, lengthMult: 1.4, fadeStart: 0.25 },
      { rays: makeRays(14, 0.12, 0.20, 0.04, 0.12), speed: 0.00008, lengthMult: 1.3, fadeStart: 0.35 },
      { rays: makeRays(8,  0.18, 0.30, 0.02, 0.06), speed: 0.00012, lengthMult: 1.2, fadeStart: 0.20 },
    ]

    let time = 0
    let animId: number

    const draw = () => {
      time++
      // Sky-to-earth gradient — Frutiger Aero signature
      const sky = ctx.createLinearGradient(0, 0, 0, canvas.height)
      sky.addColorStop(0,    '#1a6fb5')
      sky.addColorStop(0.3,  '#2aaddc')
      sky.addColorStop(0.55, '#6edaf0')
      sky.addColorStop(0.72, '#b8f0a0')
      sky.addColorStop(0.85, '#4db86a')
      sky.addColorStop(1,    '#1a6630')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const layer of rayLayers) drawRayLayer(ctx, canvas.width, canvas.height, layer, time)

      for (const b of bubbles) {
        drawBubble(ctx, b)
        b.x += b.vx
        b.vy -= 0.0008 // slight upward acceleration
        b.y += b.vy
        b.vx += (Math.random() - 0.5) * 0.02 // gentle drift

        if (b.y + b.r < 0) {
          Object.assign(b, randomBubble(canvas.width, canvas.height, true))
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: -1 }}
    />
  )
}
