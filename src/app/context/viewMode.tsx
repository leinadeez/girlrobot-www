'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ViewMode = 'grid' | 'full'

interface ViewModeContextValue {
    viewMode: ViewMode
    setViewMode: (mode: ViewMode) => void
}

const ViewModeContext = createContext<ViewModeContextValue>({
    viewMode: 'grid',
    setViewMode: () => {},
})

export function ViewModeContextProvider({ children }: { children: React.ReactNode }) {
    const [viewMode, setViewModeState] = useState<ViewMode>('grid')

    useEffect(() => {
        const saved = localStorage.getItem('view-mode') as ViewMode | null
        if (saved === 'full' || saved === 'grid') setViewModeState(saved)
    }, [])

    const setViewMode = (mode: ViewMode) => {
        localStorage.setItem('view-mode', mode)
        setViewModeState(mode)
    }

    return (
        <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
            {children}
        </ViewModeContext.Provider>
    )
}

export function useViewMode() {
    return useContext(ViewModeContext)
}
