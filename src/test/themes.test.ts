import { describe, it, expect } from 'vitest'
import { THEMES, DEFAULT_THEME, resolveThemeId } from '@/store/useThemeStore'

describe('themes', () => {
  it('offers each id once, and each ground in both modes', () => {
    const ids = THEMES.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(THEMES.some(t => t.mode === 'dark')).toBe(true)
    expect(THEMES.some(t => t.mode === 'light')).toBe(true)
  })

  it('defaults to a theme that exists', () => {
    // The default is also where every retired theme lands, so it failing this
    // would strand everyone at once.
    expect(THEMES.some(t => t.id === DEFAULT_THEME)).toBe(true)
  })

  it('keeps a current choice', () => {
    for (const theme of THEMES) {
      expect(resolveThemeId(theme.id)).toBe(theme.id)
    }
  })

  it('moves a retired theme to a survivor rather than dropping it', () => {
    // Violet was the default, so this is the migration most devices take. A
    // stored id that resolves to nothing shows no swatch as active while the
    // page renders the base tokens — the store and the DOM disagreeing.
    expect(resolveThemeId('noircut')).toBe('amethyst')
    expect(resolveThemeId('void')).toBe('amethyst')
    expect(resolveThemeId('crimson')).toBe('raspberry')
    expect(resolveThemeId('steel')).toBe('cobalt')
  })

  it('lands every retirement on a theme that still exists', () => {
    for (const retired of ['noircut', 'void', 'crimson', 'steel']) {
      const resolved = resolveThemeId(retired)
      expect(THEMES.some(t => t.id === resolved), `${retired} → ${resolved}`).toBe(true)
    }
  })

  it('falls back for an id it has never heard of, or none at all', () => {
    expect(resolveThemeId('not-a-theme')).toBe(DEFAULT_THEME)
    expect(resolveThemeId(undefined)).toBe(DEFAULT_THEME)
    expect(resolveThemeId('')).toBe(DEFAULT_THEME)
  })

  it('no longer offers the retired four', () => {
    const ids = THEMES.map(t => t.id) as string[]
    for (const gone of ['noircut', 'crimson', 'void', 'steel']) {
      expect(ids).not.toContain(gone)
    }
  })
})
