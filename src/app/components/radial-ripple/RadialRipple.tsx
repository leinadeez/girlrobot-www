'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '../matrix-rain/MatrixRain.module.css'

const CELL_SIZE = 20
const TRAIL = [100, 80, 60, 40, 20, 0]

interface RadialRippleProps {
    delay?: number
    speed?: number
}

interface Ripple {
    cx: number
    cy: number
    r: number
    maxR: number
}

export default function RadialRipple({ delay = 700, speed = 80 }: RadialRippleProps) {
    const tableRef = useRef<HTMLTableElement>(null)
    const [resizeKey, setResizeKey] = useState(0)

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>
        const onResize = () => {
            clearTimeout(timeout)
            timeout = setTimeout(() => setResizeKey(k => k + 1), 300)
        }
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
            clearTimeout(timeout)
        }
    }, [])

    useEffect(() => {
        const table = tableRef.current
        if (!table) return

        const totalCols = Math.ceil(window.innerWidth / CELL_SIZE)
        const totalRows = Math.ceil(window.innerHeight / CELL_SIZE)

        for (let i = 0; i < totalRows; i++) {
            const row = document.createElement('tr')
            row.id = `ripple-row${i}`
            for (let j = 0; j < totalCols; j++) {
                row.appendChild(document.createElement('td'))
            }
            table.appendChild(row)
        }

        const setCell = (x: number, y: number, opacity: number) => {
            const row = document.getElementById(`ripple-row${y}`)
            if (!row || !row.children[x]) return
            ;(row.children[x] as HTMLElement).style.opacity = String(opacity / 100)
        }

        let ripples: Ripple[] = []
        const maxR = Math.ceil(Math.sqrt(totalCols ** 2 + totalRows ** 2)) + TRAIL.length

        const renderInterval = setInterval(() => {
            for (const rip of ripples) rip.r++
            ripples = ripples.filter(rip => rip.r <= rip.maxR)

            for (let y = 0; y < totalRows; y++) {
                for (let x = 0; x < totalCols; x++) {
                    let maxOpacity = 0
                    for (const rip of ripples) {
                        const dist = Math.round(Math.sqrt((x - rip.cx) ** 2 + (y - rip.cy) ** 2))
                        const trailIndex = rip.r - dist
                        if (trailIndex >= 0 && trailIndex < TRAIL.length) {
                            maxOpacity = Math.max(maxOpacity, TRAIL[trailIndex])
                        }
                    }
                    setCell(x, y, maxOpacity)
                }
            }
        }, speed)

        const spawnInterval = setInterval(() => {
            ripples.push({
                cx: Math.floor(Math.random() * totalCols),
                cy: Math.floor(Math.random() * totalRows),
                r: 0,
                maxR,
            })
        }, delay)

        return () => {
            clearInterval(renderInterval)
            clearInterval(spawnInterval)
            while (table.firstChild) table.removeChild(table.firstChild)
        }
    }, [delay, speed, resizeKey])

    return (
        <div className={styles.wrapper}>
            <table ref={tableRef} className={styles.table} cellPadding={0} cellSpacing={0} />
        </div>
    )
}
