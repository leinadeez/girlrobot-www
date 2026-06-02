'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './MatrixRain.module.css'

const CELL_SIZE = 20

interface MatrixRainProps {
    delay?: number
    speed?: number
}

export default function MatrixRain({ delay = 100, speed = 100 }: MatrixRainProps) {
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

        const totalColunas = Math.ceil(window.innerWidth / CELL_SIZE)
        const totalLinhas = Math.ceil(window.innerHeight / CELL_SIZE)

        for (let i = 0; i < totalLinhas; i++) {
            const row = document.createElement('tr')
            row.id = `matrix-row${i}`
            for (let j = 0; j < totalColunas; j++) {
                row.appendChild(document.createElement('td'))
            }
            table.appendChild(row)
        }

        const alpha = (indexX: number, indexY: number, value: number) => {
            const subtractor = (() => {
                switch (value) {
                    case 100: return 0
                    case 80:  return 1
                    case 60:  return 2
                    case 40:  return 3
                    case 20:  return 4
                    default:  return 5
                }
            })()
            const rowIndex = indexY - subtractor
            if (rowIndex < 0 || rowIndex >= totalLinhas) return
            const row = document.getElementById(`matrix-row${rowIndex}`)
            if (!row || !row.children[indexX]) return
            ;(row.children[indexX] as HTMLElement).style.opacity = String(value / 100)
        }

        const allIntervals = new Set<ReturnType<typeof setInterval>>()

        const column = (coluna: number) => {
            let y = 0
            const interval = setInterval(() => {
                switch (y) {
                    case 0:
                        alpha(coluna, y, 100)
                        break
                    case 1:
                        alpha(coluna, y, 100); alpha(coluna, y, 80)
                        break
                    case 2:
                        alpha(coluna, y, 100); alpha(coluna, y, 80); alpha(coluna, y, 60)
                        break
                    case 3:
                        alpha(coluna, y, 100); alpha(coluna, y, 80); alpha(coluna, y, 60); alpha(coluna, y, 40)
                        break
                    case 4:
                        alpha(coluna, y, 100); alpha(coluna, y, 80); alpha(coluna, y, 60); alpha(coluna, y, 40); alpha(coluna, y, 20)
                        break
                    case totalLinhas:
                        alpha(coluna, y, 80); alpha(coluna, y, 60); alpha(coluna, y, 40); alpha(coluna, y, 20); alpha(coluna, y, 0)
                        break
                    case totalLinhas + 1:
                        alpha(coluna, y, 60); alpha(coluna, y, 40); alpha(coluna, y, 20); alpha(coluna, y, 0)
                        break
                    case totalLinhas + 2:
                        alpha(coluna, y, 40); alpha(coluna, y, 20); alpha(coluna, y, 0)
                        break
                    case totalLinhas + 3:
                        alpha(coluna, y, 20); alpha(coluna, y, 0)
                        break
                    case totalLinhas + 4:
                        alpha(coluna, y, 0)
                        break
                    default:
                        alpha(coluna, y, 100); alpha(coluna, y, 80); alpha(coluna, y, 60); alpha(coluna, y, 40); alpha(coluna, y, 20); alpha(coluna, y, 0)
                }
                y++
                if (y >= totalLinhas + 5) {
                    clearInterval(interval)
                    allIntervals.delete(interval)
                }
            }, speed)
            allIntervals.add(interval)
        }

        const mainInterval = setInterval(() => {
            column(Math.floor(Math.random() * totalColunas))
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
