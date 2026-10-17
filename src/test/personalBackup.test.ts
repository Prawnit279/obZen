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
import { useIntakeStore } from '@/store/useIntakeStore'
import { useBlockStore } from '@/store/useBlockStore'
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
    expect(p.profile).toMatchObject({
      name: 'Pronit', dosha: 'Vata', weightGoal: { direction: 'gain', pace: 'gentle' },
    })
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

  it('rejects a date that never existed, however well shaped', () => {
    // `Date.parse` does not reject these — it rolls 2026-02-30 forward to
    // 2026-03-02. The row would then sort as February and compute its day gaps
    // as March, so the trend's spacing and its ordering would disagree.
    for (const date of ['2026-02-30', '2026-04-31', '2027-02-29']) {
      expect(() => validatePersonal({ bodyweight: [{ date, kg: 75 }] }))
        .toThrow(/personal\.bodyweight\[0\]\.date/)
    }
  })

  it('still accepts a real leap day', () => {
    expect(validatePersonal({ bodyweight: [{ date: '2028-02-29', kg: 75 }] }).bodyweight)
      .toEqual([{ date: '2028-02-29', kg: 75 }])
  })

  it('keeps one entry per date when a file carries the same day twice', () => {
    // Two exports concatenated by hand. On the device, logging the same day
    // twice overwrites; an import must not be the one way to get duplicates.
    const out = validatePersonal({ bodyweight: [
      { date: '2026-09-01', kg: 75 },
      { date: '2026-09-02', kg: 76 },
      { date: '2026-09-01', kg: 80 },
    ] })
    expect(out.bodyweight).toEqual([
      { date: '2026-09-01', kg: 80 },   // the later row wins, as re-logging does
      { date: '2026-09-02', kg: 76 },
    ])
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

  it('does not double-log a date the file repeated', () => {
    restorePersonal(validatePersonal({ bodyweight: [
      { date: '2026-09-01', kg: 75 }, { date: '2026-09-01', kg: 80 },
    ] }))
    expect(progress().getBodyweight(PROFILE_ID)).toEqual([{ date: '2026-09-01', kg: 80 }])
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
  it('carries the questionnaire, the block and the settings through a wipe', async () => {
    // The complaint this answers: a phone taken off and put back on came back
    // with every workout and an unanswered questionnaire, because none of this
    // was in the file at all.
    const answers = {
      'primary-goal': { kind: 'single' as const, value: 'strength' },
      sleep: { kind: 'single' as const, value: '7-8' },
      soreness: { kind: 'scale' as const, value: 3 },
    }
    const block = {
      programId: 'five-three-one', templateId: null, startedOn: '2026-09-07',
      trainingMaxLb: { 'barbell-squat': 315, 'bench-press': 225 },
    }
    useIntakeStore.setState({ answers, seen: Object.keys(answers), completedAt: '2026-10-01T09:00:00.000Z' })
    useBlockStore.setState({ block })
    settings().setTrainingDays(5)
    settings().setBarMode('plates-only')

    const text = await exportedText()

    // The reinstall: storage gone, stores back at their defaults.
    await db.delete()
    await db.open()
    useIntakeStore.setState({ answers: {}, seen: [], completedAt: null })
    useBlockStore.setState({ block: null })
    useProfileSettingsStore.setState({ ...PROFILE_SETTINGS_DEFAULTS })

    // jsdom's File has no `text()`, so the same stand-in the other cases use.
    await importAllDataFromJSON({ text: async () => text } as unknown as File)

    expect(useIntakeStore.getState().answers).toEqual(answers)
    expect(useIntakeStore.getState().completedAt).toBe('2026-10-01T09:00:00.000Z')
    expect(useBlockStore.getState().block).toEqual(block)
    expect(useProfileSettingsStore.getState().trainingDays).toBe(5)
    expect(useProfileSettingsStore.getState().barMode).toBe('plates-only')
  })

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

describe('when storage refuses the personal half', () => {
  it('says the workouts landed rather than reporting a total failure', async () => {
    // Restore runs after the database transaction commits, so "it failed" would
    // be untrue — the workouts are already in.
    const real = useProgressStore.getState().logBodyweight
    useProgressStore.setState({
      logBodyweight: () => { throw new Error('QuotaExceededError') },
    })
    // setState itself is what throws in the real failure, so break that instead.
    const setState = useProgressStore.setState
    useProgressStore.setState = (() => { throw new Error('QuotaExceededError') }) as typeof setState

    try {
      await expect(importAllDataFromJSON(backupFile({ bodyweight: [{ date: '2026-09-01', kg: 75 }] })))
        .rejects.toThrow(/workouts were imported/i)
    } finally {
      useProgressStore.setState = setState
      useProgressStore.setState({ logBodyweight: real })
    }
  })
})

// ── The things a reinstall used to lose ──────────────────────────────────────

describe('the questionnaire, the block, and the rest of the settings', () => {
  /**
   * These were absent from the backup entirely. A phone wiped and restored came
   * back with every workout, every weigh-in — and an unanswered questionnaire,
   * no running programme, and the training-days setting back at its default.
   * The one thing a reinstall most obviously costs was the one thing the
   * backup did not carry.
   */
  const answers = {
    'primary-goal': { kind: 'single' as const, value: 'strength' },
    sleep: { kind: 'single' as const, value: '7-8' },
  }

  it('carries the questionnaire out', () => {
    useIntakeStore.setState({ answers, seen: ['primary-goal', 'sleep'], completedAt: '2026-10-01T09:00:00.000Z' })
    const section = collectPersonal()
    expect(section.intake?.answers).toEqual(answers)
    expect(section.intake?.seen).toEqual(['primary-goal', 'sleep'])
    expect(section.intake?.completedAt).toBe('2026-10-01T09:00:00.000Z')
  })

  it('puts it back on a device that has never been asked', () => {
    useIntakeStore.setState({ answers: {}, seen: [], completedAt: null })
    restorePersonal(validatePersonal({
      intake: { answers, seen: ['primary-goal'], completedAt: '2026-10-01T09:00:00.000Z' },
    }))
    expect(useIntakeStore.getState().answers).toEqual(answers)
    expect(useIntakeStore.getState().completedAt).toBe('2026-10-01T09:00:00.000Z')
  })

  it('never overwrites answers already given here', () => {
    // The same rule the rest of the restore follows: fill gaps, replace
    // nothing. Someone restoring an old backup onto a phone they have been
    // using must not lose the answers they gave on it.
    const mine = { 'primary-goal': { kind: 'single' as const, value: 'size' } }
    useIntakeStore.setState({ answers: mine, seen: ['primary-goal'], completedAt: '2026-10-10T09:00:00.000Z' })
    restorePersonal(validatePersonal({ intake: { answers, seen: [], completedAt: '2026-01-01T00:00:00.000Z' } }))
    expect(useIntakeStore.getState().answers).toEqual(mine)
    expect(useIntakeStore.getState().completedAt).toBe('2026-10-10T09:00:00.000Z')
  })

  it('carries the running block, training maxes and all', () => {
    const block = {
      programId: 'five-three-one', templateId: null, startedOn: '2026-09-07',
      trainingMaxLb: { 'barbell-squat': 315 },
    }
    useBlockStore.setState({ block })
    expect(collectPersonal().block).toEqual(block)

    useBlockStore.setState({ block: null })
    restorePersonal(validatePersonal({ block }))
    expect(useBlockStore.getState().block).toEqual(block)
  })

  it('leaves a block already running alone', () => {
    const mine = {
      programId: 'bbb', templateId: null, startedOn: '2026-10-05',
      trainingMaxLb: { 'bench-press': 225 },
    }
    useBlockStore.setState({ block: mine })
    restorePersonal(validatePersonal({
      block: { programId: 'five-three-one', templateId: null, startedOn: '2026-01-01', trainingMaxLb: {} },
    }))
    expect(useBlockStore.getState().block).toEqual(mine)
  })

  it('carries the training days and bar mode', () => {
    useProfileSettingsStore.setState({ trainingDays: 5, barMode: 'plates-only' })
    const section = collectPersonal()
    expect(section.profile?.trainingDays).toBe(5)
    expect(section.profile?.barMode).toBe('plates-only')

    useProfileSettingsStore.setState({ ...PROFILE_SETTINGS_DEFAULTS })
    restorePersonal(validatePersonal({ profile: { trainingDays: 5, barMode: 'plates-only' } }))
    expect(useProfileSettingsStore.getState().trainingDays).toBe(5)
    expect(useProfileSettingsStore.getState().barMode).toBe('plates-only')
  })

  it('refuses a questionnaire that is not one', () => {
    // A backup file is untrusted input, and these answers feed the programme
    // recommendation — a malformed one must be rejected whole, not half-read.
    expect(() => validatePersonal({ intake: { answers: 'nope' } })).toThrow(/intake/i)
    expect(() => validatePersonal({ intake: { answers: { q: 7 } } })).toThrow(/intake/i)
    expect(() => validatePersonal({ intake: { completedAt: 42 } })).toThrow(/intake/i)
    // An object shaped like an answer but of a kind the app cannot read. The
    // case above is caught by the plain-object check before the kind is ever
    // looked at, so without this one the kind check could be deleted.
    expect(() => validatePersonal({ intake: { answers: { q: { kind: 'telepathy', value: 'x' } } } }))
      .toThrow(/intake/i)
    expect(() => validatePersonal({ intake: { answers: { q: { value: 'no kind at all' } } } }))
      .toThrow(/intake/i)
  })

  it('refuses a block that is not one', () => {
    expect(() => validatePersonal({ block: { startedOn: '2026-09-07' } })).toThrow(/block/i)
    expect(() => validatePersonal({ block: { programId: 'x', startedOn: 'last tuesday', trainingMaxLb: {} } })).toThrow(/block/i)
    expect(() => validatePersonal({ block: { programId: 'x', startedOn: '2026-09-07', trainingMaxLb: { squat: 'heavy' } } })).toThrow(/block/i)
  })

  it('refuses settings that are out of range', () => {
    expect(() => validatePersonal({ profile: { trainingDays: 9 } })).toThrow(/trainingDays/i)
    expect(() => validatePersonal({ profile: { barMode: 'sideways' } })).toThrow(/barMode/i)
  })

  it('survives a backup written before any of this existed', () => {
    // Older files simply have no such sections, which must read as "nothing to
    // restore" rather than as a malformed file.
    expect(() => validatePersonal({ bodyweight: [] })).not.toThrow()
    expect(validatePersonal({ bodyweight: [] }).intake).toBeUndefined()
  })
})
