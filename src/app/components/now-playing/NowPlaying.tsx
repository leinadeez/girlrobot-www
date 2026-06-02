'use client'

import { useState, useEffect, useRef } from 'react'

type NowPlayingData =
  | { playing: false }
  | { playing: true; track: { name: string; artist: string; album: string; albumArt: string; url: string; progress: number; duration: number } }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const BAR_COUNT = 8

function Marquee({ text, style }: { text: string; style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [overflow, setOverflow] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const span = textRef.current
    if (container && span) {
      setOverflow(span.scrollWidth > container.clientWidth)
    }
  }, [text])

  return (
    <div ref={containerRef} style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...style }}>
      {overflow ? (
        // Duplicate text so translateX(-50%) creates a seamless loop
        <span style={{ display: 'inline-block', animation: 'marquee-scroll 8s linear infinite' }}>
          <span ref={textRef} style={{ paddingRight: '3rem' }}>{text}</span>
          <span style={{ paddingRight: '3rem' }}>{text}</span>
        </span>
      ) : (
        <span ref={textRef}>{text}</span>
      )}
    </div>
  )
}

export default function NowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null)
  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(0.1))
  const [localProgress, setLocalProgress] = useState(0)
  const [fetchedAt, setFetchedAt] = useState(0)

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/now-playing`)
        if (!res.ok) return
        const json: NowPlayingData = await res.json()
        setData(json)
        setFetchedAt(Date.now())
        if (json.playing) setLocalProgress(json.track.progress / json.track.duration)
      } catch {}
    }
    poll()
    const id = setInterval(poll, 30_000)
    return () => clearInterval(id)
  }, [])

  // Advance progress bar locally between polls
  useEffect(() => {
    if (!data?.playing) return
    const { progress, duration } = data.track
    const id = setInterval(() => {
      const elapsed = Date.now() - fetchedAt
      setLocalProgress(Math.min((progress + elapsed) / duration, 1))
    }, 1000)
    return () => clearInterval(id)
  }, [data, fetchedAt])

  // Animate EQ bars
  useEffect(() => {
    if (!data?.playing) {
      setBars(Array(BAR_COUNT).fill(0.08))
      return
    }
    const id = setInterval(() => {
      setBars(Array(BAR_COUNT).fill(0).map(() => 0.15 + Math.random() * 0.85))
    }, 130)
    return () => clearInterval(id)
  }, [data?.playing])

  if (!data || !data.playing) return null

  const { track } = data

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block', width: '185px' }}
    >
    <div
      className="border border-solid border-[var(--color-border)] bg-[var(--color-background)]"
      style={{ width: '185px' }}
    >
      <div className="flex gap-1.5 p-1.5">
        {track.albumArt && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.albumArt} alt={track.album} width={44} height={44} style={{ flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Marquee text={track.name} style={{
            color: 'var(--color-accent)',
            fontSize: '0.63rem',
            fontWeight: 'bold',
            lineHeight: 1.4,
          }} />
          <Marquee text={track.artist} style={{
            color: 'var(--color-foreground)',
            fontSize: '0.58rem',
            opacity: 0.6,
            lineHeight: 1.4,
          }} />
          <div className="flex items-end gap-px mt-1" style={{ height: '14px' }}>
            {bars.map((h, i) => (
              <div key={i} style={{
                width: '3px',
                height: `${Math.round(h * 14)}px`,
                background: 'var(--color-accent)',
                transition: 'height 0.1s ease-out',
                flexShrink: 0,
              }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: '2px', background: 'var(--color-border)' }}>
        <div style={{
          height: '100%',
          width: `${localProgress * 100}%`,
          background: 'var(--color-accent)',
          transition: 'width 1s linear',
        }} />
      </div>
    </div>
    </a>
  )
}
