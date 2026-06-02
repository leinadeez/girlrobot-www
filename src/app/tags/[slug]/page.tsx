import Post from '@/app/entries/Entry'
import { fetchPostsByTag } from '@/app/entries/entries'
import { Breadcrumbs } from '@leinadeez/ui-nicorn'

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const posts = await fetchPostsByTag(slug)

    return (
        <>
            <Breadcrumbs crumbs={[{ label: 'home', href: '/' }, { label: `#${slug}` }]} />
            {posts.length === 0
                ? <p className="px-2 py-4 text-sm">No posts with this tag yet.</p>
                : posts.map(post => <Post key={post.id} {...post} />)
            }
        </>
    )
}
