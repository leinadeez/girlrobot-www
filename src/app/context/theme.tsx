'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { themes, type ThemeName } from '../tokens'

const themeNames = Object.keys(themes) as ThemeName[]

interface ThemeContextValue {
    theme: ThemeName | null
    setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: null, setTheme: () => {} })

function applyTheme(theme: ThemeName) {
    const { accent, border, complement } = themes[theme]
    document.documentElement.style.setProperty('--color-accent', accent)
    document.documentElement.style.setProperty('--color-border', border)
    document.documentElement.style.setProperty('--accent-complement', complement)
    document.body.setAttribute('data-theme', theme)
}

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeName | null>(null)

    useEffect(() => {
        const saved = localStorage.getItem('theme') as ThemeName | null
        const picked = saved && themes[saved] ? saved : themeNames[Math.floor(Math.random() * themeNames.length)]
        applyTheme(picked)
        setThemeState(picked)
    }, [])

    const setTheme = (t: ThemeName) => {
        localStorage.setItem('theme', t)
        applyTheme(t)
        setThemeState(t)
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
