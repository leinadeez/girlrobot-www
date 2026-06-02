import { fetchPosts, resolveImageUrl } from '../entries/entries'
import { fetchSettings } from '../lib/settings'
import { parseInlineMarkdown } from '../lib/markdown'
import type { ContentBlock } from '@leinadeez/not-my-types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

function blocksToHtml(content: ContentBlock[]): string {
    return content.map(block => {
        switch (block.type) {
            case 'paragraph':
                return `<p>${parseInlineMarkdown(block.text)}</p>`
            case 'image':
                return `<img src="${resolveImageUrl(block.src)}" alt="${block.alt}" />`
            case 'gallery':
                return block.images.map(img =>
                    `<img src="${resolveImageUrl(img.src)}" alt="${img.alt}" />`
                ).join('\n')
            case 'list':
                return `<ul>${block.items.map(item => `<li>${item}</li>`).join('')}</ul>`
            case 'video':
                return `<video controls src="${resolveImageUrl(block.src)}">${block.caption ?? ''}</video>`
            case 'embed':
                return `<a href="${block.url}">${block.url}</a>`
        }
    }).join('\n')
}

export async function GET() {
    const [posts, settings] = await Promise.all([fetchPosts(), fetchSettings()])

    const items = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/entry/${post.id}</link>
      <guid>${SITE_URL}/entry/${post.id}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${blocksToHtml(post.content)}]]></description>
    </item>`).join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${settings.title}]]></title>
    <link>${SITE_URL}</link>
    <description><![CDATA[${settings.tagline}]]></description>
    <language>pt-br</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
    })
}
