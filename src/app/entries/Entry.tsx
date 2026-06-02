import Image from "next/image";
import Link from "next/link";
import { Gallery, SpoilerImage, IsotopeGallery, PostReactions, PollBlock } from "@leinadeez/ui-nicorn";
import type { Post } from "./entries";
import { resolveImageUrl } from "./entries";
import { parseInlineMarkdown } from "../lib/markdown";

function toEmbedUrl(url: string): string {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`
    const vimeo = url.match(/vimeo\.com\/(\d+)/)
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
    return url
}

const renderContent = (cont: Post['content'][number], i: number) => {
    switch (cont.type) {
        case 'paragraph':
            return <p key={i} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cont.text) }} />
        case 'image':
            if (cont.spoiler) return <SpoilerImage key={i} src={cont.src} alt={cont.alt} />
            return (
                <Image
                    key={i}
                    src={resolveImageUrl(cont.src)}
                    alt={cont.alt}
                    width={0}
                    height={0}
                    style={{ width: '100%', height: 'auto' }}
                />
            )
        case 'gallery':
            return <Gallery key={i} images={cont.images.map((img: { src: string; id: string; alt: string }) => ({ ...img, src: resolveImageUrl(img.src) }))} />
        case 'isotope':
            return <IsotopeGallery key={i} images={cont.images.map(img => ({ ...img, src: resolveImageUrl(img.src) }))} />
        case 'list':
            return (
                <ul key={i}>
                    {cont.items.map((item: string, j) => <li key={j}>{item}</li>)}
                </ul>
            )
        case 'video':
            return (
                <figure key={i}>
                    <video controls style={{ width: '100%' }} src={resolveImageUrl(cont.src)}>
                        Your browser does not support video.
                    </video>
                    {cont.caption && <figcaption><small>{cont.caption}</small></figcaption>}
                </figure>
            )
        case 'embed':
            return (
                <div key={i} style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe
                        src={toEmbedUrl(cont.url)}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                </div>
            )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: if ((cont as any).type === 'poll') { const p = cont as any; return <PollBlock key={i} pollId={p.pollId} question={p.question} options={p.options} apiUrl={process.env.NEXT_PUBLIC_API_URL} /> }
    }
}

export default function Post({ id, title, date, content, tags, reactions }: Post) {
    return (
        <section className="border border-solid border-[var(--color-border)] px-2 mb-1 pt-4">
            <h3 id={id}><Link href={`/entry/${id}`}>{title}</Link></h3>
            <div className="flex items-center gap-3 flex-wrap mb-1">
                <small>{date}</small>
                {tags && tags.length > 0 && tags.map(tag => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`}>
                        <small style={{ color: 'var(--color-accent)' }}>#{tag.name}</small>
                    </Link>
                ))}
            </div>
            <div>
                {content.map((block, i) => renderContent(block, i))}
            </div>
            <PostReactions postId={id} initialReactions={reactions} apiUrl={process.env.NEXT_PUBLIC_API_URL} />
        </section>
    )
}
