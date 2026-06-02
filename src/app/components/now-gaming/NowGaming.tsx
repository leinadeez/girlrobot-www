'use client'

import { useState, useEffect } from 'react'

type NowGamingData =
  | { gaming: false }
  | { gaming: true; game: { name: string; appId: string; headerArt: string } }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function NowGaming() {
  const [data, setData] = useState<NowGamingData | null>(null)

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/now-gaming`)
        if (!res.ok) return
        setData(await res.json())
      } catch {}
    }
    poll()
    const id = setInterval(poll, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!data || !data.gaming) return null

  const { game } = data

  return (
    <a
      href={`https://store.steampowered.com/app/${game.appId}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block', width: '185px' }}
    >
    <div
      className="border border-solid border-[var(--color-border)] bg-[var(--color-background)]"
      style={{ width: '185px' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={game.headerArt}
        alt={game.name}
        style={{ width: '100%', height: '60px', objectFit: 'cover', display: 'block' }}
      />
      <div className="px-1.5 py-1">
        <div style={{
          color: 'var(--color-accent)',
          fontSize: '0.63rem',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.4,
        }}>
          {game.name}
        </div>
        <div style={{ color: 'var(--color-foreground)', fontSize: '0.58rem', opacity: 0.5, lineHeight: 1.4 }}>
          on Steam
        </div>
      </div>
    </div>
    </a>
  )
}
