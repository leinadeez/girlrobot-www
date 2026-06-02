'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '../matrix-rain/MatrixRain.module.css'

const CELL_SIZE = 20
const ARMS = 3
const TIGHTNESS = 0.6
const SPEED = 0.03

export default function HypnoSpiral() {
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
        const centerCol = totalCols / 2
        const centerRow = totalRows / 2

        for (let y = 0; y < totalRows; y++) {
            const row = document.createElement('tr')
            row.id = `spiral-row${y}`
            for (let x = 0; x < totalCols; x++) {
                row.appendChild(document.createElement('td'))
            }
            table.appendChild(row)
        }

        // Precompute per-cell angle and distance — these never change
        const angle: number[][] = []
        const dist: number[][] = []
        for (let y = 0; y < totalRows; y++) {
            angle[y] = []
            dist[y] = []
            for (let x = 0; x < totalCols; x++) {
                angle[y][x] = Math.atan2(y - centerRow, x - centerCol)
                dist[y][x] = Math.sqrt((x - centerCol) ** 2 + (y - centerRow) ** 2)
            }
        }

        // Cache DOM references to avoid repeated getElementById/children lookups
        const cells: HTMLElement[][] = []
        for (let y = 0; y < totalRows; y++) {
            cells[y] = []
            const row = document.getElementById(`spiral-row${y}`)!
            for (let x = 0; x < totalCols; x++) {
                cells[y][x] = row.children[x] as HTMLElement
            }
        }

        let t = 0
        let rafId: number

        const render = () => {
            t += SPEED
            for (let y = 0; y < totalRows; y++) {
                for (let x = 0; x < totalCols; x++) {
                    const phase = angle[y][x] * ARMS + dist[y][x] * TIGHTNESS - t
                    cells[y][x].style.opacity = ((Math.sin(phase) + 1) / 2).toFixed(3)
                }
            }
            rafId = requestAnimationFrame(render)
        }

        rafId = requestAnimationFrame(render)

        return () => {
            cancelAnimationFrame(rafId)
            while (table.firstChild) table.removeChild(table.firstChild)
        }
    }, [resizeKey])

    return (
        <div className={styles.wrapper}>
            <table ref={tableRef} className={styles.table} cellPadding={0} cellSpacing={0} />
        </div>
    )
}
