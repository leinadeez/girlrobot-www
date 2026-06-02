'use client'

import { useViewMode } from '../../context/viewMode'

export default function ViewToggle() {
    const { viewMode, setViewMode } = useViewMode()

    return (
        <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'full' : 'grid')}
            style={{
                fontSize: '0.8rem',
                color: 'var(--color-accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
            }}
        >
            {viewMode === 'grid' ? 'Full Posts ↔' : 'Grid ↔'}
        </button>
    )
}
