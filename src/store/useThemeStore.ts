import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeId = 'noircut' | 'light' | 'crimson' | 'void' | 'steel' | 'ember'

export interface ThemeMeta {
  id: ThemeId
  name: string
  dot: string         // swatch fill color
  borderActive: string
  textActive: string
}

/**
 * Each theme is an accent family over the same near-black ground — the swatch
 * shows the accent it actually applies, not a background sample. Daylight is
 * the exception and restates the whole token set.
 */
export const THEMES: ThemeMeta[] = [
  { id: 'noircut', name: 'Violet',       dot: '#1A1226', borderActive: '#8B5CF6', textActive: '#C4B5FD' },
  { id: 'light',   name: 'Daylight',     dot: '#F4F4F7', borderActive: '#7C3AED', textActive: '#16121F' },
  { id: 'crimson', name: 'Crimson',      dot: '#1E0B0C', borderActive: '#DC2626', textActive: '#FCA5A5' },
  { id: 'void',    name: 'Void Purple',  dot: '#150B1F', borderActive: '#9333EA', textActive: '#D8B4FE' },
  { id: 'steel',   name: 'Steel Blue',   dot: '#0A111C', borderActive: '#3B82F6', textActive: '#93C5FD' },
  { id: 'ember',   name: 'Ember',        dot: '#1C0E04', borderActive: '#F97316', textActive: '#FDBA74' },
]

interface ThemeState {
  activeTheme: ThemeId
  setTheme: (id: ThemeId) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      activeTheme: 'noircut',
      setTheme: (id) => {
        document.documentElement.setAttribute('data-theme', id)
        set({ activeTheme: id })
      },
    }),
    { name: 'obzen-theme-v2' }
  )
)

// Apply stored theme immediately (called in main.tsx before first render)
export function applyStoredTheme() {
  try {
    const raw = localStorage.getItem('obzen-theme-v2')
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { activeTheme?: ThemeId } }
      const candidate = parsed?.state?.activeTheme
      // Guard: only apply if it's a known theme id
      const theme = THEMES.some(t => t.id === candidate) ? candidate! : 'noircut'
      document.documentElement.setAttribute('data-theme', theme)
    }
  } catch {
    // ignore
  }
}
