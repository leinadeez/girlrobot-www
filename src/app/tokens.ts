export const themes = {
    matrix: {
        accent: '#00ff00',
        border: '#00dd00',
        complement: '#ff00ff',
    },
    ripple: {
        accent: '#ff0000',
        border: '#dd0000',
        complement: '#00ffff',
    },
    columns: {
        accent: '#4455ff',
        border: '#2233dd',
        complement: '#ffaa00',
    },
    stars: {
        accent: '#ffffff',
        border: '#aaaaaa',
        complement: '#ffd700',
    },
    spiral: {
        accent: '#aa00ff',
        border: '#7700cc',
        complement: '#55ff00',
    },
    hexfire: {
        accent: '#ff9900',
        border: '#cc7700',
        complement: '#0044cc',
    },
    hexcorp: {
        accent: '#cc00ff',
        border: '#9900cc',
        complement: '#33ff00',
    },
    cubes: {
        accent: '#e8a060',
        border: '#b87333',
        complement: '#6090e8',
    },
    saopaulo: {
        accent: '#e87030',
        border: '#b83820',
        complement: '#30b8e8',
    },
    frutiger: {
        accent: '#4dd9f0',
        border: '#2ab0c8',
        complement: '#a8ff78',
    },
    candy: {
        accent: '#0098a0',
        border: '#007880',
        complement: '#ff8c00',
    },
} as const

export type ThemeName = keyof typeof themes

export const colors = {
    background:      '#000000',
    foregroundDark:  '#ededed',
    foregroundLight: '#171717',
} as const

export const typography = {
    h1: '3rem',
    h2: '1.3rem',
    h3: '1.2rem',
    p:  '0.5rem',
} as const

// CSS variable names — use these when referencing tokens from CSS/Tailwind
export const cssVars = {
    accent:     'var(--color-accent)',
    border:     'var(--color-border)',
    background: 'var(--color-background)',
    foreground: 'var(--color-foreground)',
} as const

// SSR default — client-side ThemeProvider overrides on mount
export function buildCssVariables(darkMode: boolean, themeName: ThemeName = 'matrix'): string {
    const fg = darkMode ? colors.foregroundDark : colors.foregroundLight
    const theme = themes[themeName]
    return `
        :root {
            --color-accent:      ${theme.accent};
            --color-border:      ${theme.border};
            --accent-complement: ${theme.complement};
            --color-background:  ${colors.background};
            --color-foreground:  ${fg};
            --font-h1: ${typography.h1};
            --font-h2: ${typography.h2};
            --font-h3: ${typography.h3};
        }
    `
}
