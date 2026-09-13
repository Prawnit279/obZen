import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeId =
  | 'amethyst' | 'cobalt' | 'raspberry' | 'lagoon' | 'ember'
  | 'light'
  | 'amethyst-light' | 'cobalt-light' | 'raspberry-light' | 'lagoon-light'

/** The default, and where a retired theme lands. */
export const DEFAULT_THEME: ThemeId = 'amethyst'

/**
 * Themes that existed once and no longer do.
 *
 * The choice is stored, so removing a theme strands whoever had it selected:
 * the id rehydrates into the store, matches no swatch, and the switcher shows
 * nothing as active while the page renders the base tokens. Mapping them here
 * keeps that from happening — same reasoning as `exercise-renames.ts`, and the
 * entries are just as permanent.
 *
 * Violet was the default, so this is the migration most devices will take.
 */
const RETIRED_THEMES: Record<string, ThemeId> = {
  noircut: 'amethyst',   // Violet — the closest surviving hue
  void: 'amethyst',      // Void Purple, likewise
  crimson: 'raspberry',  // the nearest thing left to a red
  steel: 'cobalt',       // the nearest thing left to a blue
}

/** A usable theme id, whatever was stored — retired, unknown or current. */
export function resolveThemeId(stored: string | undefined): ThemeId {
  if (!stored) return DEFAULT_THEME
  if (THEMES.some(t => t.id === stored)) return stored as ThemeId
  return RETIRED_THEMES[stored] ?? DEFAULT_THEME
}

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
 * Raspberry, Lagoon — exist in both modes; Ember and Daylight are one-offs.
 *
 * Amethyst is the default and so defines the base ramp in `:root` rather than
 * overriding it, which is why its block there only registers `color-scheme`.
 */
export const THEMES: ThemeMeta[] = [
  { id: 'amethyst',  name: 'Amethyst',    mode: 'dark',  dot: '#0A0611', borderActive: '#A945D4', textActive: '#E6C4F4' },
  { id: 'cobalt',    name: 'Cobalt',      mode: 'dark',  dot: '#05070E', borderActive: '#4B58DC', textActive: '#C3CAFF' },
  { id: 'raspberry', name: 'Raspberry',   mode: 'dark',  dot: '#0B0508', borderActive: '#D42E79', textActive: '#FBB8D6' },
  { id: 'lagoon',    name: 'Lagoon',      mode: 'dark',  dot: '#03080A', borderActive: '#0091AD', textActive: '#7FE9F8' },
  { id: 'ember',     name: 'Ember',       mode: 'dark',  dot: '#1C0E04', borderActive: '#F97316', textActive: '#FDBA74' },

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

const STORAGE_KEY = 'obzen-theme-v2'

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      activeTheme: DEFAULT_THEME,
      setTheme: (id) => {
        document.documentElement.setAttribute('data-theme', id)
        set({ activeTheme: id })
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      /**
       * Retired themes land on a survivor. Without this the store rehydrates an
       * id nothing matches — no swatch reads as active, while the page renders
       * whatever `:root` gives it. `applyStoredTheme` resolves the same way, so
       * the DOM and the store cannot disagree about which theme is on.
       */
      migrate: (persisted) => {
        const state = persisted as Partial<ThemeState> | undefined
        return { ...state, activeTheme: resolveThemeId(state?.activeTheme) } as ThemeState
      },
    }
  )
)

// Apply stored theme immediately (called in main.tsx before first render)
export function applyStoredTheme() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as { state?: { activeTheme?: string } }
    document.documentElement.setAttribute('data-theme', resolveThemeId(parsed?.state?.activeTheme))
  } catch {
    // ignore
  }
}
