import type { SiteSettings } from '@leinadeez/not-my-types'

export type { SiteLink, SiteSettings, Recommendation } from '@leinadeez/not-my-types'

const DEFAULTS: SiteSettings = {
  seoTitle: "",
  title: "",
  tagline: "",
  faviconPath: "",
  links: [],
  socials: [],
}

export async function fetchSettings(): Promise<SiteSettings> {
  const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  try {
    const res = await fetch(`${api}/settings`, { next: { revalidate: 60 } })
    if (!res.ok) return DEFAULTS
    return res.json() as Promise<SiteSettings>
  } catch {
    return DEFAULTS
  }
}
