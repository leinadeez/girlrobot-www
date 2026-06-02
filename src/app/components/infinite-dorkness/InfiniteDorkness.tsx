'use client'

import Link from "next/link"
import { useState } from "react"
import type { SiteLink, Recommendation } from "../../lib/settings"

export default function InfiniteDorkness({ links, recommendations }: { links: SiteLink[]; recommendations?: Recommendation[] }) {
    const [open, setOpen] = useState(false)
    const recs = recommendations ?? []

    return (
        <div className="text-right border border-solid border-[var(--color-border)] px-2 py-3 bg-[var(--color-background)] flex">
            <p className="font-bold cursor-pointer" onClick={() => setOpen(!open)}>{open ? ">" : "<"}</p>
            <div className={open ? "block" : "hidden"}>
                <h2>Infinite Dorkness</h2>
                <ul>
                    {links.map((link, i) => (
                        <li key={i}>
                            <Link href={link.url} target="_blank">
                                {link.label}{link.lang ? ` (${link.lang})` : ''}
                            </Link>
                        </li>
                    ))}
                </ul>
                {recs.length > 0 && (
                    <>
                        <hr style={{ borderColor: 'var(--color-border)', margin: '0.5rem 0' }} />
                        <ul>
                            {recs.map((rec, i) => (
                                <li key={i}>
                                    <Link href={rec.url} target="_blank">{rec.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    )
}
