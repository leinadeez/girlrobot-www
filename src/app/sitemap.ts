import type { MetadataRoute } from "next";
import { fetchPosts } from "./entries/entries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await fetchPosts()

    const postRoutes = posts.map(p => ({
        url: `${SITE_URL}/entry/${p.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 1,
        },
        ...postRoutes,
    ]
}
