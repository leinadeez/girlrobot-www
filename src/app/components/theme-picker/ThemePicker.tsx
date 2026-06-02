'use client'

import { useState } from 'react'
import { themes, type ThemeName } from '../../tokens'
import { useTheme } from '../../context/theme'

const LABELS: Record<ThemeName, string> = {
    matrix:   'Matrix',
    ripple:   'Ripple',
    columns:  'Columns',
    stars:    'Stars',
    spiral:   'Spiral',
    hexfire:  'Hex Fire',
    hexcorp:  'Hex Corp',
    cubes:    'Cubes',
    saopaulo: 'São Paulo',
    frutiger: 'Frutiger Aero',
    candy:   'Candy',
}

const themeNames = Object.keys(themes) as ThemeName[]

export default function ThemePicker() {
    const [open, setOpen] = useState(false)
    const { theme, setTheme } = useTheme()

    return (
        <div className="text-right border border-solid border-[var(--color-border)] px-2 py-3 bg-[var(--color-background)] flex flex-col items-end">
            <p className="font-bold cursor-pointer" onClick={() => setOpen(!open)}>{open ? ">" : "<"}</p>
            <div className={open ? "block" : "hidden"}>
                <h2>Theme</h2>
                <ul>
                    {themeNames.map(name => (
                        <li key={name}>
                            <button
                                onClick={() => setTheme(name)}
                                className={`cursor-pointer underline ${theme === name ? 'text-[var(--color-accent)] font-bold' : ''}`}
                                style={{ color: theme === name ? 'var(--color-accent)' : 'var(--color-foreground)' }}
                            >
                                {LABELS[name]}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
