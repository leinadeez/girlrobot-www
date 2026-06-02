'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { SiteLink } from '@leinadeez/not-my-types'

export default function Socials({ links }: { links: SiteLink[] }) {
    const [open, setOpen] = useState(false)
    if (links.length === 0) return null

    return (
        <div className="text-right border border-solid border-[var(--color-border)] px-2 py-3 bg-[var(--color-background)] flex flex-col items-end">
            <p className="font-bold cursor-pointer" onClick={() => setOpen(!open)}>{open ? '>' : '<'}</p>
            <div className={open ? 'block' : 'hidden'}>
                <h2>Socials</h2>
                <ul>
                    {links.map(link => (
                        <li key={link.url}>
                            <Link href={link.url} target="_blank">{link.label}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
