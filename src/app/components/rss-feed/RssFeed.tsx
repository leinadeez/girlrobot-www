import Link from 'next/link'

export default function RssFeed() {
    return (
        <Link
            href="/rss.xml"
            target="_blank"
            title="RSS feed"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '52px',
                height: '52px',
                borderRadius: '10px',
                background: 'var(--accent-complement)',
                lineHeight: 0,
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="var(--color-background)"
            >
                <circle cx="4" cy="20" r="2" />
                <path d="M4 14a6 6 0 0 1 6 6H8a4 4 0 0 0-4-4v-2z" />
                <path d="M4 8a12 12 0 0 1 12 12h-2A10 10 0 0 0 4 10V8z" />
            </svg>
        </Link>
    )
}
