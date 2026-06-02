export const dynamic = 'force-static'

import type { MetadataRoute } from "next";

const AI_CRAWLERS = [
    'GPTBot',         // OpenAI
    'ChatGPT-User',   // OpenAI
    'OAI-SearchBot',  // OpenAI
    'CCBot',          // Common Crawl (LLM training datasets)
    'Google-Extended', // Google AI (Gemini)
    'anthropic-ai',   // Anthropic
    'ClaudeBot',      // Anthropic
    'cohere-ai',      // Cohere
    'PerplexityBot',  // Perplexity
    'Bytespider',     // ByteDance/TikTok
    'Diffbot',        // Diffbot AI
    'FacebookBot',    // Meta AI
    'Omgilibot',      // AI training data
    'YouBot',         // You.com
]

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
            ...AI_CRAWLERS.map(userAgent => ({
                userAgent,
                disallow: '/',
            })),
        ],
        sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/sitemap.xml`,
    }
}
