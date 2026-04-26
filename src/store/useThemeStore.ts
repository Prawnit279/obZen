import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeId = 'noircut' | 'crimson' | 'void' | 'steel' | 'ember'

export interface ThemeMeta {
  id: ThemeId
  name: string
  dot: string         // swatch fill color
  borderActive: string
  textActive: string
}

export const THEMES: ThemeMeta[] = [
  { id: 'noircut', name: 'Noircut',      dot: '#2a2a2a', borderActive: '#d4d4d4', textActive: '#ffffff' },
  { id: 'crimson', name: 'Crimson',      dot: '#2d1515', borderActive: '#dc2626', textActive: '#fca5a5' },
  { id: 'void',    name: 'Void Purple',  dot: '#2a1f3d', borderActive: '#9333ea', textActive: '#d8b4fe' },
  { id: 'steel',   name: 'Steel Blue',   dot: '#1a2236', borderActive: '#3b82f6', textActive: '#93c5fd' },
  { id: 'ember',   name: 'Ember',        dot: '#2e1a0a', borderActive: '#f97316', textActive: '#fdba74' },
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
