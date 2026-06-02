import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchPost, fetchPosts, getDescription, resolveImageUrl } from "@/app/entries/entries";
import Post from "@/app/entries/Entry";
import { Breadcrumbs } from "@leinadeez/ui-nicorn";
import { fetchSettings } from "@/app/lib/settings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ''

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params
    const [post, settings] = await Promise.all([fetchPost(id), fetchSettings()])
    if (!post) return {}

    const description = getDescription(post)
    const firstImage = post.content.find(b => b.type === 'image')

    return {
        title: `${post.title} — ${settings.seoTitle}`,
        description,
        openGraph: {
            title: post.title,
            description,
            url: `${SITE_URL}/entry/${id}`,
            siteName: settings.seoTitle,
            type: 'article',
            publishedTime: post.date,
            ...(firstImage && firstImage.type === 'image' && {
                images: [{ url: resolveImageUrl(firstImage.src) }],
            }),
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description,
        },
    }
}

export default async function PostPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const [post, allPosts] = await Promise.all([fetchPost(id), fetchPosts()])
    if (!post) notFound()

    const idx = allPosts.findIndex(p => p.id === id)
    const newer = idx > 0 ? allPosts[idx - 1] : null
    const older = idx < allPosts.length - 1 ? allPosts[idx + 1] : null

    return (
        <>
            <Breadcrumbs crumbs={[{ label: 'home', href: '/' }, { label: post.title }]} />
            <Post {...post} />
            {(newer || older) && (
                <div className="border border-solid border-[var(--color-border)] px-2 py-2 mb-1 flex justify-between items-center" style={{ fontSize: '0.8rem' }}>
                    {newer
                        ? <Link href={`/entry/${newer.id}`} style={{ color: 'var(--color-accent)' }}>← {newer.title}</Link>
                        : <span />
                    }
                    {older
                        ? <Link href={`/entry/${older.id}`} style={{ color: 'var(--color-accent)', textAlign: 'right' }}>{older.title} →</Link>
                        : <span />
                    }
                </div>
            )}
        </>
    )
}
