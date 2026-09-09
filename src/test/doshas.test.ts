import { describe, it, expect, beforeEach } from 'vitest'
import { DOSHAS, DOSHA_GUIDANCE, guidanceFor, dailyTipFor } from '@/data/doshas'
import { useProfileSettingsStore } from '@/store/useProfileSettingsStore'
import { PROFILES, PROFILE_ID } from '@/config/profiles'

// ── Guidance data ────────────────────────────────────────────────────────────

describe('DOSHA_GUIDANCE', () => {
  it('covers all three doshas', () => {
    for (const d of DOSHAS) expect(DOSHA_GUIDANCE[d]).toBeDefined()
    expect(DOSHAS).toHaveLength(3)
  })

  it('gives each one real content rather than a stub', () => {
    // Vata and Kapha were added alongside an already-detailed Pitta entry; thin
    // filler for two of three would make the selector look functional while
    // being useless for anyone who is not Pitta.
    for (const d of DOSHAS) {
      const g = DOSHA_GUIDANCE[d]
      expect(g.qualities.length).toBeGreaterThanOrEqual(5)
      expect(g.balanced.length).toBeGreaterThanOrEqual(4)
      expect(g.excess.length).toBeGreaterThanOrEqual(5)
      expect(g.favorFoods.length).toBeGreaterThanOrEqual(6)
      expect(g.reduceFoods.length).toBeGreaterThanOrEqual(5)
      expect(g.daily.length).toBeGreaterThanOrEqual(5)
      expect(g.training.approach.length).toBeGreaterThan(40)
      expect(g.training.watchFor.length).toBeGreaterThan(30)
      expect(g.principle.length).toBeGreaterThan(30)
    }
  })

  it('gives each dosha its own guidance, not one copied three times', () => {
    const approaches = DOSHAS.map(d => DOSHA_GUIDANCE[d].training.approach)
    expect(new Set(approaches).size).toBe(3)

    const bestTimes = DOSHAS.map(d => DOSHA_GUIDANCE[d].training.bestTime)
    expect(new Set(bestTimes).size).toBe(3)
  })

  it('never tells a dosha to both favour and reduce the same taste', () => {
    for (const d of DOSHAS) {
      const g = DOSHA_GUIDANCE[d]
      const overlap = g.favorTastes.filter(t => g.reduceTastes.includes(t))
      expect(overlap).toEqual([])
    }
  })

  it('accounts for all six tastes across favour and reduce', () => {
    // The classical set. A missing taste means guidance silently says nothing
    // about a third of what someone eats.
    const SIX = ['sweet', 'sour', 'salty', 'pungent', 'bitter', 'astringent']
    for (const d of DOSHAS) {
      const g = DOSHA_GUIDANCE[d]
      expect([...g.favorTastes, ...g.reduceTastes].sort()).toEqual([...SIX].sort())
    }
  })

  it('keeps the classical opposites: what one favours, another reduces', () => {
    // Kapha is heavy and cold, Vata light and dry — their advice should differ,
    // not merely be differently worded.
    expect(DOSHA_GUIDANCE.Kapha.favorTastes).toContain('pungent')
    expect(DOSHA_GUIDANCE.Pitta.reduceTastes).toContain('pungent')
    expect(DOSHA_GUIDANCE.Vata.favorTastes).toContain('sweet')
    expect(DOSHA_GUIDANCE.Kapha.reduceTastes).toContain('sweet')
  })
})

// ── Lookup ───────────────────────────────────────────────────────────────────

describe('guidanceFor', () => {
  it('returns the guidance for a known dosha', () => {
    expect(guidanceFor('Kapha').dosha).toBe('Kapha')
  })

  it('falls back to Pitta for anything it does not recognise', () => {
    // The stored value predates the selector on existing installs.
    expect(guidanceFor(undefined).dosha).toBe('Pitta')
    expect(guidanceFor('').dosha).toBe('Pitta')
    expect(guidanceFor('Tridoshic').dosha).toBe('Pitta')
  })
})

describe('dailyTipFor', () => {
  it('returns one of that dosha’s own tips', () => {
    const tip = dailyTipFor('Vata', '2026-09-09')
    expect(DOSHA_GUIDANCE.Vata.daily).toContain(tip)
  })

  it('is stable through a day and moves between days', () => {
    expect(dailyTipFor('Kapha', '2026-09-09')).toBe(dailyTipFor('Kapha', '2026-09-09'))

    const week = ['2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13']
      .map(d => dailyTipFor('Kapha', d))
    expect(new Set(week).size).toBeGreaterThan(1)
  })

  it('survives a date it cannot parse', () => {
    const tip = dailyTipFor('Pitta', 'not-a-date')
    expect(DOSHA_GUIDANCE.Pitta.daily).toContain(tip)
  })
})

// ── The editable profile ─────────────────────────────────────────────────────

describe('useProfileSettingsStore', () => {
  beforeEach(() => useProfileSettingsStore.getState().reset())

  it('starts from the values in config', () => {
    const s = useProfileSettingsStore.getState()
    expect(s.name).toBe(PROFILES[PROFILE_ID].name)
    expect(s.dosha).toBe(PROFILES[PROFILE_ID].dosha)
  })

  it('takes a new name', () => {
    useProfileSettingsStore.getState().setName('Aishwarya')
    expect(useProfileSettingsStore.getState().name).toBe('Aishwarya')
  })

  it('refuses a blank name rather than rendering an empty heading', () => {
    useProfileSettingsStore.getState().setName('   ')
    expect(useProfileSettingsStore.getState().name).toBe(PROFILES[PROFILE_ID].name)

    useProfileSettingsStore.getState().setName('')
    expect(useProfileSettingsStore.getState().name).toBe(PROFILES[PROFILE_ID].name)
  })

  it('keeps a name with internal spaces intact', () => {
    useProfileSettingsStore.getState().setName('Anna Maria')
    expect(useProfileSettingsStore.getState().name).toBe('Anna Maria')
  })

  it('takes each of the three doshas', () => {
    for (const d of DOSHAS) {
      useProfileSettingsStore.getState().setDosha(d)
      expect(useProfileSettingsStore.getState().dosha).toBe(d)
    }
  })
})
