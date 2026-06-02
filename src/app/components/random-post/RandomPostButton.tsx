'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function RandomPostButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/posts`)
      if (!res.ok) return
      const posts: { id: string; published: boolean }[] = await res.json()
      const published = posts.filter(p => p.published !== false)
      if (published.length === 0) return
      const pick = published[Math.floor(Math.random() * published.length)]
      router.push(`/entry/${pick.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--color-accent)',
        cursor: loading ? 'wait' : 'pointer',
        fontSize: '0.8rem',
        padding: 0,
        opacity: loading ? 0.5 : 1,
        textDecoration: 'underline',
      }}
    >
      {loading ? '...' : '? random'}
    </button>
  )
}
