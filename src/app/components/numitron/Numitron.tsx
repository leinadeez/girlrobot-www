'use client'

import React, { useEffect, useState } from 'react'

// Segments order: a (top), b (top-right), c (bot-right), d (bottom), e (bot-left), f (top-left), g (middle)
const DIGIT_MAP: Record<string, boolean[]> = {
  '0': [true,  true,  true,  true,  true,  true,  false],
  '1': [false, true,  true,  false, false, false, false],
  '2': [true,  true,  false, true,  true,  false, true ],
  '3': [true,  true,  true,  true,  false, false, true ],
  '4': [false, true,  true,  false, false, true,  true ],
  '5': [true,  false, true,  true,  false, true,  true ],
  '6': [true,  false, true,  true,  true,  true,  true ],
  '7': [true,  true,  true,  false, false, false, false],
  '8': [true,  true,  true,  true,  true,  true,  true ],
  '9': [true,  true,  true,  true,  false, true,  true ],
  '-': [false, false, false, false, false, false, true ],
}

const SEG_POSITIONS: React.CSSProperties[] = [
  { top: 1,  left: 5,  width: 18, height: 4  }, // a
  { top: 6,  right: 1, width: 4,  height: 16 }, // b
  { top: 29, right: 1, width: 4,  height: 16 }, // c
  { top: 46, left: 5,  width: 18, height: 4  }, // d
  { top: 29, left: 1,  width: 4,  height: 16 }, // e
  { top: 6,  left: 1,  width: 4,  height: 16 }, // f
  { top: 24, left: 5,  width: 18, height: 4  }, // g
]

// Different delays and durations per digit so flickers never sync up
const DELAYS =    [0, 0.8, 1.6, 2.4, 3.2, 4.0]
const DURATIONS = [4.7, 5.1, 4.3, 5.7, 4.9, 5.3]

const DIGITS = 6

function Digit({ char, index }: { char: string; index: number }) {
  const segs = DIGIT_MAP[char] ?? DIGIT_MAP['-']
  const delay    = DELAYS[index % DELAYS.length]
  const duration = DURATIONS[index % DURATIONS.length]

  return (
    <div className="numitron-display" style={{
      position: 'relative',
      width: 28,
      height: 51,
      background: 'rgba(6, 3, 0, 0.7)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: 2,
      flexShrink: 0,
    }}>
      {SEG_POSITIONS.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            background: segs[i] ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
            boxShadow: segs[i]
              ? '0 0 3px var(--color-accent), 0 0 8px var(--color-accent), 0 0 16px var(--color-accent)'
              : 'none',
            animation: segs[i]
              ? `numitron-flicker ${duration}s ease-in-out ${delay}s infinite`
              : 'none',
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  )
}

export default function Numitron() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    const counted = sessionStorage.getItem('visit_counted')

    if (!counted) {
      fetch(`${api}/visits`, { method: 'POST' })
        .then(r => r.json())
        .then(({ count }: { count: number }) => {
          setCount(count)
          sessionStorage.setItem('visit_counted', '1')
        })
        .catch(() => {})
    } else {
      fetch(`${api}/visits`)
        .then(r => r.json())
        .then(({ count }: { count: number }) => setCount(count))
        .catch(() => {})
    }
  }, [])

  const str = count === null ? null : String(count)
  const digits = str === null
    ? Array(DIGITS).fill('-')
    : (str.length <= DIGITS ? str.padStart(DIGITS, '0') : str.slice(-DIGITS)).split('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <small style={{
        fontFamily: 'monospace',
        fontSize: 9,
        color: 'var(--color-accent)',
        letterSpacing: '0.15em',
        opacity: 0.7,
        textTransform: 'uppercase',
      }}>
        visitors
      </small>
      <div style={{ display: 'flex', gap: 3 }}>
        {digits.map((d, i) => (
          <Digit key={i} char={d} index={i} />
        ))}
      </div>
    </div>
  )
}
