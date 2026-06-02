import type { Post } from '@leinadeez/not-my-types'

export type { Post, ContentBlock, Tag } from '@leinadeez/not-my-types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function resolveImageUrl(src: string): string {
    if (src.startsWith('/uploads/')) return `${API_URL}${src}`
    return src
}

export function getDescription(post: Post): string {
    const first = post.content.find(b => b.type === 'paragraph')
    if (!first || first.type !== 'paragraph') return ''
    return first.text.replace(/<[^>]+>/g, '').slice(0, 160)
}

export async function fetchPosts(): Promise<Post[]> {
    const res = await fetch(`${API_URL}/posts`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch posts')
    return res.json()
}

export async function fetchPostsByTag(slug: string): Promise<Post[]> {
    const res = await fetch(`${API_URL}/posts?tag=${encodeURIComponent(slug)}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch posts')
    return res.json()
}

export async function fetchTags() {
    const res = await fetch(`${API_URL}/tags`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
}

export async function fetchPost(id: string): Promise<Post | null> {
    const res = await fetch(`${API_URL}/posts/${id}`, { cache: 'no-store' })
    if (res.status === 404) return null
    if (!res.ok) throw new Error('Failed to fetch post')
    return res.json()
}
