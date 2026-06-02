'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '../matrix-rain/MatrixRain.module.css'

const CELL_SIZE = 20
const COLUMN_WIDTH = 3
const TRAIL = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]

interface ColumnsProps {
    delay?: number
    speed?: number
}

export default function Columns({ delay = 200, speed = 60 }: ColumnsProps) {
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
            row.id = `columns-row${i}`
            for (let j = 0; j < totalCols; j++) {
                row.appendChild(document.createElement('td'))
            }
            table.appendChild(row)
        }

        const setCell = (x: number, y: number, opacity: number) => {
            if (x < 0 || x >= totalCols || y < 0 || y >= totalRows) return
            const row = document.getElementById(`columns-row${y}`)
            if (!row || !row.children[x]) return
            ;(row.children[x] as HTMLElement).style.opacity = String(opacity / 100)
        }

        const allIntervals = new Set<ReturnType<typeof setInterval>>()

        const column = (startCol: number) => {
            let headY = totalRows
            const interval = setInterval(() => {
                headY--
                TRAIL.forEach((opacity, trailIndex) => {
                    const rowY = headY + trailIndex // trail is below the rising head
                    for (let w = 0; w < COLUMN_WIDTH; w++) {
                        setCell(startCol + w, rowY, opacity)
                    }
                })
                if (headY < -TRAIL.length) {
                    clearInterval(interval)
                    allIntervals.delete(interval)
                }
            }, speed)
            allIntervals.add(interval)
        }

        const mainInterval = setInterval(() => {
            const startCol = Math.floor(Math.random() * (totalCols - COLUMN_WIDTH))
            column(startCol)
        }, delay)

        return () => {
            clearInterval(mainInterval)
            allIntervals.forEach(clearInterval)
            while (table.firstChild) table.removeChild(table.firstChild)
        }
    }, [delay, speed, resizeKey])

    return (
        <div className={styles.wrapper}>
            <table ref={tableRef} className={styles.table} cellPadding={0} cellSpacing={0} />
        </div>
    )
}
