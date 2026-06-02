'use client'

import { useEffect, useRef } from 'react'

// Translucent candy plastic colors
const CANDY_COLORS = [
  { r: 0,   g: 180, b: 190 }, // Teal
  { r: 240, g: 50,  b: 90  }, // Raspberry
  { r: 80,  g: 210, b: 50  }, // Lime
  { r: 255, g: 140, b: 0   }, // Tangerine
  { r: 120, g: 60,  b: 200 }, // Grape
  { r: 0,   g: 150, b: 255 }, // Blueberry
]

const BLOB_COUNT = 10

interface Blob {
  x: number
  y: number
  r: number
  colorIndex: number
  nextColorIndex: number
  colorT: number        // 0→1 lerp between current and next color
  colorSpeed: number
  ox: number            // origin x (sine wave center)
  oy: number
  phase: number         // sine wave phase
  freq: number
  amp: number
  opacity: number
}

function lerpColor(a: typeof CANDY_COLORS[0], b: typeof CANDY_COLORS[0], t: number) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  }
}

function randomBlob(w: number, h: number, index: number): Blob {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    r: 180 + Math.random() * 220,
    colorIndex: index % CANDY_COLORS.length,
    nextColorIndex: (index + 1) % CANDY_COLORS.length,
    colorT: Math.random(),
    colorSpeed: 0.0002 + Math.random() * 0.0002,
    ox: Math.random() * w,
    oy: Math.random() * h,
    phase: Math.random() * Math.PI * 2,
    freq: 0.0002 + Math.random() * 0.0002,
    amp: 50 + Math.random() * 70,
    opacity: 0.30 + Math.random() * 0.20,
  }
}

function drawBlob(ctx: CanvasRenderingContext2D, b: Blob) {
  const { x, y, r, opacity } = b
  const c = lerpColor(CANDY_COLORS[b.colorIndex], CANDY_COLORS[b.nextColorIndex], b.colorT)

  // Outer soft glow
  const glow = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 1.4)
  glow.addColorStop(0,   `rgba(${c.r}, ${c.g}, ${c.b}, ${opacity * 0.15})`)
  glow.addColorStop(1,   `rgba(${c.r}, ${c.g}, ${c.b}, 0)`)
  ctx.beginPath()
  ctx.arc(x, y, r * 1.4, 0, Math.PI * 2)
  ctx.fillStyle = glow
  ctx.fill()

  // Main plastic body — soft, not glassy
  const body = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.05, x, y, r)
  body.addColorStop(0,   `rgba(${Math.min(c.r + 60, 255)}, ${Math.min(c.g + 60, 255)}, ${Math.min(c.b + 60, 255)}, ${opacity * 0.85})`)
  body.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, ${opacity * 0.65})`)
  body.addColorStop(1,   `rgba(${Math.max(c.r - 40, 0)}, ${Math.max(c.g - 40, 0)}, ${Math.max(c.b - 40, 0)}, ${opacity * 0.4})`)
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = body
  ctx.fill()

  // Soft top sheen — plastic, not glass (wide and diffuse)
  const sheen = ctx.createRadialGradient(x - r * 0.2, y - r * 0.3, 0, x - r * 0.1, y - r * 0.2, r * 0.75)
  sheen.addColorStop(0,   `rgba(255, 255, 255, ${opacity * 0.35})`)
  sheen.addColorStop(0.6, `rgba(255, 255, 255, ${opacity * 0.08})`)
  sheen.addColorStop(1,   'rgba(255, 255, 255, 0)')
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = sheen
  ctx.fill()
}

function drawPinstripes(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  for (let y = 0; y < h; y += 3) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'
    ctx.fillRect(0, y, w, 1)
  }
  ctx.restore()
}

function drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  for (let y = 0; y < h; y += 2) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
    ctx.fillRect(0, y, w, 1)
  }
  ctx.restore()
}

export default function Candy() {
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

    const blobs: Blob[] = Array.from({ length: BLOB_COUNT }, (_, i) =>
      randomBlob(canvas.width, canvas.height, i)
    )

    let time = 0
    let animId: number

    const draw = () => {
      time++

      // Light Platinum background — classic Mac off-white
      ctx.fillStyle = '#e8e6ec'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawPinstripes(ctx, canvas.width, canvas.height)

      // Update and draw blobs
      for (const b of blobs) {
        // Slow sine-wave drift
        b.x = b.ox + Math.sin(time * b.freq + b.phase) * b.amp
        b.y = b.oy + Math.cos(time * b.freq * 0.7 + b.phase) * b.amp * 0.6

        // Slowly cycle through candy colors
        b.colorT += b.colorSpeed
        if (b.colorT >= 1) {
          b.colorT = 0
          b.colorIndex = b.nextColorIndex
          b.nextColorIndex = (b.nextColorIndex + 1) % CANDY_COLORS.length
        }

        drawBlob(ctx, b)
      }

      drawScanlines(ctx, canvas.width, canvas.height)

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
