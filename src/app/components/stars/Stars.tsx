'use client'

import { useEffect, useRef } from 'react'
import styles from './Stars.module.css'

const STAR_COUNT = 250
const ACCENT_COLORS = ['#ffdd44', '#ff6688', '#44ddff', '#aaffaa', '#ff9944']
const ACCENT_CHANCE = 0.03

interface Star {
    x: number
    y: number
    size: number
    speed: number
    color: string
}

export default function Stars() {
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

        const randomColor = () => ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]

        const stars: Star[] = Array.from({ length: STAR_COUNT }, () => {
            const size = Math.random() * 2.5 + 0.5
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size,
                speed: size * 0.6 + 0.2,
                color: Math.random() < ACCENT_CHANCE ? randomColor() : 'white',
            }
        })

        let rafId: number
        const animate = () => {
            ctx.fillStyle = 'black'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            for (const star of stars) {
                star.x -= star.speed
                if (star.x + star.size < 0) {
                    star.x = canvas.width + star.size
                    star.y = Math.random() * canvas.height
                    star.color = Math.random() < ACCENT_CHANCE ? randomColor() : 'white'
                }
                ctx.fillStyle = star.color
                ctx.beginPath()
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
                ctx.fill()
            }

            rafId = requestAnimationFrame(animate)
        }
        animate()

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return <canvas ref={canvasRef} className={styles.canvas} />
}
