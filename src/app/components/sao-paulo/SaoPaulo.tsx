'use client'

import { useEffect, useRef, useState } from 'react'

type Point = [number, number]
type Poly = Point[]

// Sutherland-Hodgman clip: keep points closer to S than to T
function clipCell(poly: Poly, S: Point, T: Point): Poly {
  if (poly.length === 0) return poly
  const dx = T[0] - S[0], dy = T[1] - S[1]
  const C = T[0] * T[0] + T[1] * T[1] - S[0] * S[0] - S[1] * S[1]
  const inside = (p: Point) => 2 * (dx * p[0] + dy * p[1]) < C
  const out: Poly = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length]
    const aIn = inside(a), bIn = inside(b)
    if (aIn) out.push(a)
    if (aIn !== bIn) {
      const ex = b[0] - a[0], ey = b[1] - a[1]
      const denom = 2 * (dx * ex + dy * ey)
      if (Math.abs(denom) > 1e-10) {
        const t = (C - 2 * (dx * a[0] + dy * a[1])) / denom
        out.push([a[0] + t * ex, a[1] + t * ey])
      }
    }
  }
  return out
}

function dist2(a: Point, b: Point): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
}

interface Cell {
  seed: Point
  poly: Poly
  h: number
  s: number
  l: number
}

function buildCells(W: number, H: number): Cell[] {
  const spacing = 50
  const cols = Math.ceil(W / spacing) + 3
  const rows = Math.ceil(H / spacing) + 3
  const seeds: Point[] = []

  for (let r = -1; r < rows; r++) {
    for (let c = -1; c < cols; c++) {
      seeds.push([
        (c + 0.5) * spacing + (Math.random() - 0.5) * spacing * 0.72,
        (r + 0.5) * spacing + (Math.random() - 0.5) * spacing * 0.72,
      ])
    }
  }

  const bound: Poly = [[-2, -2], [W + 2, -2], [W + 2, H + 2], [-2, H + 2]]
  const cells: Cell[] = []

  for (const S of seeds) {
    // Skip seeds too far outside — their cells won't touch the canvas
    if (S[0] < -spacing * 2 || S[0] > W + spacing * 2 ||
        S[1] < -spacing * 2 || S[1] > H + spacing * 2) continue

    const neighbors = seeds
      .filter(T => T !== S)
      .sort((a, b) => dist2(a, S) - dist2(b, S))
      .slice(0, 20)

    let poly = [...bound] as Poly
    for (const T of neighbors) {
      poly = clipCell(poly, S, T)
      if (poly.length === 0) break
    }
    if (poly.length < 3) continue

    const rnd = Math.random()
    let h: number, s: number, l: number

    if (rnd < 0.03) {
      // Dark fragment
      h = 12; s = 30; l = 10 + Math.random() * 5
    } else if (rnd < 0.10) {
      // Amber accent tile — desaturated
      h = 28 + Math.random() * 12
      s = 52 + Math.random() * 14
      l = 38 + Math.random() * 10
    } else {
      // Terracotta — muted
      h = 6 + Math.random() * 14
      s = 40 + Math.random() * 18
      l = 28 + Math.random() * 16
    }

    cells.push({ seed: S, poly, h, s, l })
  }

  return cells
}

export default function SaoPaulo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(t); t = setTimeout(() => setKey(k => k + 1), 300) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t) }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const cells = buildCells(W, H)
    let rafId: number

    const render = (ts: number) => {
      const t = ts / 1000
      ctx.clearRect(0, 0, W, H)
      ctx.lineWidth = 1.4
      ctx.strokeStyle = 'rgba(190, 175, 160, 0.45)'

      for (const { seed: [cx, cy], poly, h, s, l } of cells) {
        // Slow diagonal shimmer — one wave sweeps the full canvas every ~7s
        const wave = Math.sin(cx * 0.001 + cy * 0.0005 - t * 0.22)
        const lAdj = l + wave * 5

        ctx.beginPath()
        ctx.moveTo(poly[0][0], poly[0][1])
        for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1])
        ctx.closePath()
        ctx.fillStyle = `hsl(${h}, ${s}%, ${lAdj}%)`
        ctx.fill()
        ctx.stroke()
      }

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafId)
  }, [key])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
    />
  )
}
