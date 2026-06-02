import type { Page } from '@leinadeez/not-my-types'

export type { Page } from '@leinadeez/not-my-types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function fetchNavPages(): Promise<Page[]> {
  try {
    const res = await fetch(`${API}/pages`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return res.json() as Promise<Page[]>
  } catch {
    return []
  }
}

export async function fetchPage(slug: string): Promise<Page | null> {
  try {
    const res = await fetch(`${API}/pages/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json() as Promise<Page>
  } catch {
    return null
  }
}
