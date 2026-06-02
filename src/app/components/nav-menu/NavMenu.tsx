import Link from 'next/link'
import type { Page } from '@leinadeez/not-my-types'
import RandomPostButton from '../random-post/RandomPostButton'
import ViewToggle from '../view-toggle/ViewToggle'

export default function NavMenu({ pages }: { pages: Page[] }) {
  return (
    <nav className="border border-solid border-[var(--color-border)] px-2 py-1 mb-1 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap gap-4">
        <ViewToggle />
        {pages.map(page => (
          <Link
            key={page.slug}
            href={`/${page.slug}`}
            style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}
          >
            {page.title}
          </Link>
        ))}
      </div>
      <RandomPostButton />
    </nav>
  )
}
