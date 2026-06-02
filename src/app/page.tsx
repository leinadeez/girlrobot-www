'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchPosts, fetchTags, resolveImageUrl } from './entries/entries'
import type { Post, Tag } from './entries/entries'
import FullPost from './entries/Entry'
import { useViewMode } from './context/viewMode'

// ─── Grid helpers ───────────────────────────────────────────────

function getThumb(post: Post): { src: string; alt: string } | null {
    const block = post.content.find(b => b.type === 'image')
    if (!block || block.type !== 'image') return null
    return { src: resolveImageUrl(block.src), alt: block.alt }
}

function getExcerpt(post: Post): string {
    const block = post.content.find(b => b.type === 'paragraph')
    if (!block || block.type !== 'paragraph') return ''
    return block.text.replace(/<[^>]+>/g, '').slice(0, 120)
}

function PostCard({ post }: { post: Post }) {
    const thumb = getThumb(post)
    const excerpt = getExcerpt(post)
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
        >
            <Link href={`/entry/${post.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="border border-solid border-[var(--color-border)]">
                    {thumb && (
                        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                            <Image src={thumb.src} alt={thumb.alt} fill style={{ objectFit: 'cover' }} />
                        </div>
                    )}
                    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', lineHeight: 1.3 }}>{post.title}</div>
                        <small style={{ opacity: 0.55 }}>{post.date}</small>
                        {post.tags && post.tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                                {post.tags.map(tag => (
                                    <span key={tag.id} style={{ fontSize: '0.7rem', color: 'var(--color-accent)' }}>#{tag.name}</span>
                                ))}
                            </div>
                        )}
                        {excerpt && (
                            <p style={{ fontSize: '0.78rem', opacity: 0.65, margin: 0, marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                                {excerpt}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                color: active ? 'var(--color-background)' : 'var(--color-accent)',
                background: active ? 'var(--color-accent)' : 'transparent',
                border: '1px solid var(--color-accent)',
                padding: '2px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'background 0.15s, color 0.15s',
            }}
        >{label}</button>
    )
}

// ─── Grid view ──────────────────────────────────────────────────

const BATCH_SIZE = 3

function GridView({ posts, tags }: { posts: Post[]; tags: Tag[] }) {
    const [activeTag, setActiveTag] = useState<string | null>(null)
    const [cols, setCols] = useState(3)

    useEffect(() => {
        const update = () => setCols(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3)
        update()
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [])

    const visible = activeTag ? posts.filter(p => p.tags?.some(t => t.slug === activeTag)) : posts
    const columns = Array.from({ length: cols }, (_, colIdx) => visible.filter((_, i) => i % cols === colIdx))

    return (
        <>
            <nav className="border border-solid border-[var(--color-border)] px-2 py-1 mb-1 flex flex-wrap gap-2 items-center">
                <FilterButton label="all" active={activeTag === null} onClick={() => setActiveTag(null)} />
                {tags.map(tag => (
                    <FilterButton key={tag.id} label={`#${tag.name}`} active={activeTag === tag.slug} onClick={() => setActiveTag(tag.slug)} />
                ))}
            </nav>
            <div style={{ display: 'flex', gap: 4, alignItems: 'start' }}>
                {columns.map((colPosts, colIdx) => (
                    <div key={colIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <AnimatePresence mode="popLayout">
                            {colPosts.map(post => <PostCard key={post.id} post={post} />)}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </>
    )
}

// ─── Full posts view ─────────────────────────────────────────────

function FullView({ posts }: { posts: Post[] }) {
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
    const sentinelRef = useRef<HTMLDivElement>(null)

    useEffect(() => { setVisibleCount(BATCH_SIZE) }, [posts])

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return
        const observer = new IntersectionObserver(observed => {
            if (observed[0].isIntersecting) setVisibleCount(prev => Math.min(prev + BATCH_SIZE, posts.length))
        }, { rootMargin: '200px' })
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [visibleCount, posts.length])

    const visiblePosts = posts.slice(0, visibleCount)
    const allLoaded = visibleCount >= posts.length

    return (
        <>
            {visiblePosts.map(post => <FullPost key={post.id} {...post} />)}
            {!allLoaded && <div ref={sentinelRef} />}
        </>
    )
}

// ─── Page ────────────────────────────────────────────────────────

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const { viewMode } = useViewMode()

    useEffect(() => {
        fetchPosts().then(setPosts)
        fetchTags().then(setTags)
    }, [])

    return viewMode === 'grid'
        ? <GridView posts={posts} tags={tags} />
        : <FullView posts={posts} />
}
