import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeId =
  | 'noircut' | 'crimson' | 'void' | 'steel' | 'ember'
  | 'amethyst' | 'cobalt' | 'raspberry' | 'lagoon'
  | 'light'
  | 'amethyst-light' | 'cobalt-light' | 'raspberry-light' | 'lagoon-light'

export interface ThemeMeta {
  id: ThemeId
  name: string
  /** Which ground the theme paints — the switcher groups on this. */
  mode: 'dark' | 'light'
  dot: string         // swatch fill color
  borderActive: string
  textActive: string
}

/**
 * Each theme is an accent family over a ground: near-black for the dark ones,
 * paper for the light ones. The swatch shows the ground it paints with the
 * accent it applies on top, so the two modes are told apart at a glance.
 *
 * A dark theme is defined by `--bg` and six accent steps and nothing else. A
 * light theme shares one restatement of the whole token set (see globals.css)
 * and likewise adds only its own ramp. Four families — Amethyst, Cobalt,
 * Raspberry, Lagoon — exist in both modes; the rest are one-offs.
 */
export const THEMES: ThemeMeta[] = [
  { id: 'noircut',   name: 'Violet',      mode: 'dark',  dot: '#1A1226', borderActive: '#8B5CF6', textActive: '#C4B5FD' },
  { id: 'crimson',   name: 'Crimson',     mode: 'dark',  dot: '#1E0B0C', borderActive: '#DC2626', textActive: '#FCA5A5' },
  { id: 'void',      name: 'Void Purple', mode: 'dark',  dot: '#150B1F', borderActive: '#9333EA', textActive: '#D8B4FE' },
  { id: 'steel',     name: 'Steel Blue',  mode: 'dark',  dot: '#0A111C', borderActive: '#3B82F6', textActive: '#93C5FD' },
  { id: 'ember',     name: 'Ember',       mode: 'dark',  dot: '#1C0E04', borderActive: '#F97316', textActive: '#FDBA74' },
  { id: 'amethyst',  name: 'Amethyst',    mode: 'dark',  dot: '#0A0611', borderActive: '#A945D4', textActive: '#E6C4F4' },
  { id: 'cobalt',    name: 'Cobalt',      mode: 'dark',  dot: '#05070E', borderActive: '#4B58DC', textActive: '#C3CAFF' },
  { id: 'raspberry', name: 'Raspberry',   mode: 'dark',  dot: '#0B0508', borderActive: '#D42E79', textActive: '#FBB8D6' },
  { id: 'lagoon',    name: 'Lagoon',      mode: 'dark',  dot: '#03080A', borderActive: '#0091AD', textActive: '#7FE9F8' },

  { id: 'light',           name: 'Daylight',  mode: 'light', dot: '#F4F4F7', borderActive: '#7C3AED', textActive: '#16121F' },
  { id: 'amethyst-light',  name: 'Amethyst',  mode: 'light', dot: '#F6F3F8', borderActive: '#723C70', textActive: '#442656' },
  { id: 'cobalt-light',    name: 'Cobalt',    mode: 'light', dot: '#F3F4F8', borderActive: '#2D36A8', textActive: '#161A32' },
  { id: 'raspberry-light', name: 'Raspberry', mode: 'light', dot: '#F8F3F5', borderActive: '#A01A58', textActive: '#5A1B40' },
  { id: 'lagoon-light',    name: 'Lagoon',    mode: 'light', dot: '#F1F6F8', borderActive: '#02798F', textActive: '#06333E' },
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
