import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { fetchPage } from '@/app/lib/pages'
import type { ContentBlock } from '@leinadeez/not-my-types'
import { resolveImageUrl } from '@/app/entries/entries'
import { parseInlineMarkdown } from '@/app/lib/markdown'
import { Breadcrumbs, PollBlock, IsotopeGallery } from '@leinadeez/ui-nicorn'
import { fetchSettings } from '@/app/lib/settings'

function toEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return url
}

function renderBlock(block: ContentBlock, i: number) {
  switch (block.type) {
    case 'paragraph':
      return <p key={i} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(block.text) }} />
    case 'image':
      return (
        <Image
          key={i}
          src={resolveImageUrl(block.src)}
          alt={block.alt}
          width={0}
          height={0}
          style={{ width: '100%', height: 'auto' }}
        />
      )
    case 'gallery':
      return (
        <div key={i} className="flex flex-wrap gap-2">
          {block.images.map((img, j) => (
            <Image
              key={j}
              src={resolveImageUrl(img.src)}
              alt={img.alt}
              width={200}
              height={200}
              style={{ objectFit: 'cover' }}
            />
          ))}
        </div>
      )
    case 'isotope':
      return <IsotopeGallery key={i} images={block.images.map(img => ({ ...img, src: resolveImageUrl(img.src) }))} />
    case 'list':
      return <ul key={i}>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
    case 'video':
      return (
        <figure key={i}>
          <video controls style={{ width: '100%' }} src={resolveImageUrl(block.src)}>
            Your browser does not support video.
          </video>
          {block.caption && <figcaption><small>{block.caption}</small></figcaption>}
        </figure>
      )
    case 'embed':
      return (
        <div key={i} style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={toEmbedUrl(block.url)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: if ((block as any).type === 'poll') { const p = block as any; return <PollBlock key={i} pollId={p.pollId} question={p.question} options={p.options} apiUrl={process.env.NEXT_PUBLIC_API_URL} /> }
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const [page, settings] = await Promise.all([fetchPage(slug), fetchSettings()])
  if (!page) return {}
  return { title: `${page.title} — ${settings.seoTitle}` }
}

export default async function StaticPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const page = await fetchPage(slug)
  if (!page) notFound()

  return (
    <>
      <Breadcrumbs crumbs={[{ label: 'home', href: '/' }, { label: page.title }]} />
      <section className="border border-solid border-[var(--color-border)] px-2 mb-1 pt-4">
        <h3>{page.title}</h3>
        <div>{page.content.map((block, i) => renderBlock(block, i))}</div>
      </section>
    </>
  )
}
