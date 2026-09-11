/**
 * The personal half of a backup: weigh-ins, the weight goal, name, dosha and
 * progression ladder rungs. These live in localStorage rather than IndexedDB,
 * so the database export never saw them — a backup restored onto a new phone
 * came back without a single weigh-in.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/db/dexie'
import { collectPersonal, validatePersonal, restorePersonal } from '@/lib/personalBackup'
import { importAllDataFromJSON, exportAllDataAsJSON } from '@/lib/export'
import { useProgressStore } from '@/store/useProgressStore'
import { useProfileSettingsStore, PROFILE_SETTINGS_DEFAULTS } from '@/store/useProfileSettingsStore'
import { PROFILE_ID } from '@/config/profiles'
import { lbToKg } from '@/lib/progress'

beforeEach(async () => {
  localStorage.clear()
  useProgressStore.setState({ rungs: {}, bodyweight: {} })
  useProfileSettingsStore.getState().reset()
  await db.delete()
  await db.open()
})

afterEach(() => vi.restoreAllMocks())

const progress = () => useProgressStore.getState()
const settings = () => useProfileSettingsStore.getState()

/** jsdom's File lacks `.text()`; the importer only needs that. */
function backupFile(personal: unknown): File {
  const text = JSON.stringify({
    metadata: { exportDate: '2026-09-10T00:00:00.000Z', appVersion: '1.0.0' },
    data: personal === undefined ? {} : { personal },
  })
  return { text: async () => text } as unknown as File
}

// ── collectPersonal ──────────────────────────────────────────────────────────

describe('collectPersonal', () => {
  it('gathers the weigh-ins, goal, name, dosha and ladder rungs', () => {
    progress().logBodyweight(PROFILE_ID, '2026-09-01', 75)
    progress().logBodyweight(PROFILE_ID, '2026-09-08', 75.4)
    progress().setRung(PROFILE_ID, 'assisted-pull-up', 2)
    settings().setName('Pronit')
    settings().setDosha('Vata')
    settings().setWeightGoal({ direction: 'gain', pace: 'gentle' })

    const p = collectPersonal()
    expect(p.bodyweight).toEqual([{ date: '2026-09-01', kg: 75 }, { date: '2026-09-08', kg: 75.4 }])
    expect(p.ladderRungs).toEqual({ [`${PROFILE_ID}::assisted-pull-up`]: 2 })
    expect(p.profile).toEqual({ name: 'Pronit', dosha: 'Vata', weightGoal: { direction: 'gain', pace: 'gentle' } })
  })

  it('survives a trip through JSON unchanged', () => {
    progress().logBodyweight(PROFILE_ID, '2026-09-01', 75)
    settings().setWeightGoal({ direction: 'maintain' })
    const p = collectPersonal()
    expect(validatePersonal(JSON.parse(JSON.stringify(p)))).toEqual(p)
  })
})

// ── validatePersonal ─────────────────────────────────────────────────────────

describe('validatePersonal', () => {
  it('accepts a section with any part missing', () => {
    expect(validatePersonal({})).toEqual({})
    expect(validatePersonal({ bodyweight: [] })).toEqual({ bodyweight: [] })
  })

  it('rejects anything that is not an object', () => {
    for (const bad of [null, [], 'x', 3]) expect(() => validatePersonal(bad)).toThrow(/personal/)
  })

  it('rejects a weigh-in with a malformed date', () => {
    expect(() => validatePersonal({ bodyweight: [{ date: '09/01/2026', kg: 75 }] }))
      .toThrow(/personal\.bodyweight\[0\]\.date/)
  })

  it('rejects a weigh-in outside the plausible range, as the logger would', () => {
    expect(() => validatePersonal({ bodyweight: [{ date: '2026-09-01', kg: 750 }] }))
      .toThrow(/personal\.bodyweight\[0\]\.kg/)
    expect(() => validatePersonal({ bodyweight: [{ date: '2026-09-01', kg: 'heavy' }] }))
      .toThrow(/kg/)
  })

  it('rejects a dosha that is not one of the three', () => {
    expect(() => validatePersonal({ profile: { dosha: 'Fire' } })).toThrow(/dosha/)
  })

  it('rejects a goal the app could not have written', () => {
    expect(() => validatePersonal({ profile: { weightGoal: { direction: 'bulk' } } })).toThrow(/weightGoal/)
    // A gain with no pace would leave the reading with nothing to compare against.
    expect(() => validatePersonal({ profile: { weightGoal: { direction: 'gain' } } })).toThrow(/weightGoal/)
  })

  it('rejects a blank name', () => {
    expect(() => validatePersonal({ profile: { name: '   ' } })).toThrow(/name/)
  })

  it('rejects a ladder rung that is not a small whole number', () => {
    expect(() => validatePersonal({ ladderRungs: { 'pronit::x': -1 } })).toThrow(/ladderRungs/)
    expect(() => validatePersonal({ ladderRungs: { 'pronit::x': 1.5 } })).toThrow(/ladderRungs/)
  })
})

// ── restorePersonal ──────────────────────────────────────────────────────────

describe('restorePersonal', () => {
  it('puts everything back on a device that has nothing', () => {
    // The lost-phone case.
    const count = restorePersonal({
      bodyweight: [{ date: '2026-09-01', kg: 75 }, { date: '2026-09-08', kg: 75.4 }],
      ladderRungs: { [`${PROFILE_ID}::assisted-pull-up`]: 3 },
      profile: { name: 'Pronit', dosha: 'Kapha', weightGoal: { direction: 'lose', pace: 'steady' } },
    })

    expect(progress().getBodyweight(PROFILE_ID)).toHaveLength(2)
    expect(progress().getRung(PROFILE_ID, 'assisted-pull-up')).toBe(3)
    expect(settings().dosha).toBe('Kapha')
    expect(settings().weightGoal).toEqual({ direction: 'lose', pace: 'steady' })
    expect(count).toBeGreaterThan(0)
  })

  it('never replaces a weigh-in already logged on this device for that date', () => {
    progress().logBodyweight(PROFILE_ID, '2026-09-08', 74)
    restorePersonal({ bodyweight: [{ date: '2026-09-01', kg: 75 }, { date: '2026-09-08', kg: 99 }] })

    const entries = progress().getBodyweight(PROFILE_ID)
    expect(entries.map(e => e.date)).toEqual(['2026-09-01', '2026-09-08'])
    expect(entries[1].kg).toBe(74)
  })

  it('keeps a name the person has set on this device', () => {
    // Importing a friend's backup must not rename you.
    settings().setName('Aishwarya')
    restorePersonal({ profile: { name: 'Pronit' } })
    expect(settings().name).toBe('Aishwarya')
  })

  it('fills a name that was never changed from the default', () => {
    expect(settings().name).toBe(PROFILE_SETTINGS_DEFAULTS.name)
    restorePersonal({ profile: { name: 'Sam' } })
    expect(settings().name).toBe('Sam')
  })

  it('keeps a goal already chosen on this device', () => {
    settings().setWeightGoal({ direction: 'maintain' })
    restorePersonal({ profile: { weightGoal: { direction: 'gain', pace: 'steady' } } })
    expect(settings().weightGoal).toEqual({ direction: 'maintain' })
  })

  it('adds ladder rungs this device lacks and leaves its own alone', () => {
    progress().setRung(PROFILE_ID, 'assisted-pull-up', 4)
    restorePersonal({
      ladderRungs: { [`${PROFILE_ID}::assisted-pull-up`]: 1, [`${PROFILE_ID}::assisted-dip`]: 2 },
    })
    expect(progress().getRung(PROFILE_ID, 'assisted-pull-up')).toBe(4)
    expect(progress().getRung(PROFILE_ID, 'assisted-dip')).toBe(2)
  })

  it('reports nothing restored when there was nothing new', () => {
    progress().logBodyweight(PROFILE_ID, '2026-09-01', 75)
    expect(restorePersonal({ bodyweight: [{ date: '2026-09-01', kg: 76 }] })).toBe(0)
  })
})

// ── Through the real importer ────────────────────────────────────────────────

describe('importing a backup', () => {
  it('brings the weigh-ins back', async () => {
    await importAllDataFromJSON(backupFile({ bodyweight: [{ date: '2026-09-01', kg: lbToKg(165) }] }))
    expect(progress().getBodyweight(PROFILE_ID)).toHaveLength(1)
  })

  it('still imports a backup made before this section existed', async () => {
    progress().logBodyweight(PROFILE_ID, '2026-09-01', 75)
    await expect(importAllDataFromJSON(backupFile(undefined))).resolves.toBeDefined()
    expect(progress().getBodyweight(PROFILE_ID)).toHaveLength(1) // untouched
  })

  it('rejects a corrupt personal section before writing anything at all', async () => {
    const text = JSON.stringify({
      metadata: { exportDate: '2026-09-10T00:00:00.000Z' },
      data: {
        app: { checkIns: [{ id: 1, date: '2026-09-10', mood: 3, energy: 3, soreness: 'none', forearmFatigue: false }] },
        personal: { bodyweight: [{ date: 'yesterday', kg: 75 }] },
      },
    })
    await expect(importAllDataFromJSON({ text: async () => text } as unknown as File)).rejects.toThrow(/date/)
    // The database half was not written either — the file is rejected whole.
    expect(await db.checkIns.count()).toBe(0)
  })
})

// ── The whole trip ───────────────────────────────────────────────────────────

/** Run the real export and hand back the file it would have downloaded. */
async function exportedText(): Promise<string> {
  let captured: Blob | undefined
  // jsdom implements neither, so define rather than spy.
  Object.defineProperty(URL, 'createObjectURL', {
    value: vi.fn((blob: Blob) => { captured = blob; return 'blob:test' }), configurable: true,
  })
  Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

  await exportAllDataAsJSON()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(captured!)
  })
}

describe('a backup, end to end', () => {
  it('carries weigh-ins, goal and name through export, a wiped phone, and import', async () => {
    // The case this section exists for: before it, a restored backup came back
    // with every workout and not a single weigh-in.
    progress().logBodyweight(PROFILE_ID, '2026-09-01', lbToKg(165))
    progress().logBodyweight(PROFILE_ID, '2026-09-08', lbToKg(166))
    settings().setWeightGoal({ direction: 'gain', pace: 'gentle' })
    settings().setName('Sam')

    const text = await exportedText()
    expect(JSON.parse(text).data.personal.bodyweight).toHaveLength(2)

    // A new phone.
    localStorage.clear()
    useProgressStore.setState({ rungs: {}, bodyweight: {} })
    settings().reset()
    await db.delete()
    await db.open()
    expect(progress().getBodyweight(PROFILE_ID)).toEqual([])

    await importAllDataFromJSON({ text: async () => text } as unknown as File)

    expect(progress().getBodyweight(PROFILE_ID).map(e => e.date)).toEqual(['2026-09-01', '2026-09-08'])
    expect(settings().weightGoal).toEqual({ direction: 'gain', pace: 'gentle' })
    expect(settings().name).toBe('Sam')
  })
})
