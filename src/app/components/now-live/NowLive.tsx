'use client'
import { useState, useEffect } from 'react'

type NowLiveData =
    | { live: false }
    | { live: true; game: string; title: string; username: string }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function NowLive() {
    const [data, setData] = useState<NowLiveData | null>(null)

    useEffect(() => {
        const poll = async () => {
            try {
                const res = await fetch(`${API_URL}/now-live`)
                if (!res.ok) return
                setData(await res.json())
            } catch {}
        }
        poll()
        const id = setInterval(poll, 60_000)
        return () => clearInterval(id)
    }, [])

    if (!data || !data.live) return null

    return (
        <a
            href={`https://twitch.tv/${data.username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'block', width: '185px' }}
        >
            <div
                className="border border-solid border-[var(--color-border)] bg-[var(--color-background)]"
                style={{ width: '185px', padding: '6px 8px' }}
            >
                <div style={{
                    color: 'var(--color-accent)',
                    fontSize: '0.63rem',
                    fontWeight: 'bold',
                    lineHeight: 1.4,
                }}>
                    🔴 live on Twitch
                </div>
                <div style={{
                    color: 'var(--color-foreground)',
                    fontSize: '0.63rem',
                    lineHeight: 1.4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    playing {data.game}
                </div>
            </div>
        </a>
    )
}
