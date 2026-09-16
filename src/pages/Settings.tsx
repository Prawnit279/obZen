import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { Button } from '@/components/ui/Button'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { useThemeStore, THEMES } from '@/store/useThemeStore'
import { StoragePanel } from '@/components/ui/StoragePanel'
import { exportAllDataAsJSON, importAllDataFromJSON } from '@/lib/export'
import { importWorkoutData } from '@/utils/importWorkoutData'
import { previewStranded, adoptStrandedSessions } from '@/utils/adoptSessions'
import type { AdoptPreview } from '@/utils/adoptSessions'
import { SHOW_VEDIC } from '@/config/features'
import { PROFILES } from '@/config/profiles'
import { SegmentedPill } from '@/components/ui/SegmentedPill'
import { useProfileStore } from '@/store/useProfileStore'
import { useProfileSettingsStore } from '@/store/useProfileSettingsStore'
import { DOSHAS, guidanceFor } from '@/data/doshas'
import { TRAINING_DAY_CHOICES } from '@/lib/trainingWeek'

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[color:var(--ink-dim)] shrink-0">{label}</span>
      <span className="text-[color:var(--ink-2)] text-right">{value}</span>
    </div>
  )
}

function useStorageEstimate() {
  const [used, setUsed]    = useState<number | null>(null)
  const [quota, setQuota]  = useState<number | null>(null)
  const [persisted, setPersisted] = useState<boolean | null>(null)

  useEffect(() => {
    navigator.storage?.estimate?.().then(est => {
      setUsed(est.usage ?? null)
      setQuota(est.quota ?? null)
    })
    navigator.storage?.persisted?.().then(setPersisted)
  }, [])

  return { used, quota, persisted }
}

export default function Settings() {
  const navigate = useNavigate()
  const { used, quota, persisted } = useStorageEstimate()

  // The folded Appearance card still answers its own question.
  const activeTheme = useThemeStore(s => s.activeTheme)
  const themeMeta = THEMES.find(t => t.id === activeTheme)
  const themeSummary = themeMeta && `${themeMeta.name} · ${themeMeta.mode}`
  const { activeId } = useProfileStore()
  const { name, dosha, trainingDays, setName, setDosha, setTrainingDays } = useProfileSettingsStore()

  /**
   * The name field holds a draft, and the store only hears about it on blur.
   *
   * Bound straight to the store it could not be cleared: deleting the last
   * character produced a blank, the store rejected the blank, and the old name
   * reappeared mid-word — so there was no way to type a different one.
   */
  const [nameDraft, setNameDraft] = useState(name)
  useEffect(() => { setNameDraft(name) }, [name])

  const commitName = () => {
    // Blank is "no change", so the field goes back to what is stored.
    if (nameDraft.trim()) setName(nameDraft)
    else setNameDraft(name)
  }
  const guidance = guidanceFor(dosha)
  const profile = PROFILES[activeId]

  const [exporting, setExporting]   = useState(false)
  const [exportDone, setExportDone] = useState(false)

  const [importing, setImporting]   = useState(false)
  const [importMsg, setImportMsg]   = useState<{ ok: boolean; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [migrating, setMigrating]   = useState(false)
  const [migrateMsg, setMigrateMsg] = useState<{ ok: boolean; text: string } | null>(null)


  // Workouts stored under a profile the app no longer has — from an older
  // build, or a backup restored before imports adopted automatically.
  const [stranded, setStranded] = useState<AdoptPreview | null>(null)
  const [adopting, setAdopting] = useState(false)

  useEffect(() => { previewStranded().then(setStranded).catch(() => setStranded(null)) }, [])

  const handleAdopt = async () => {
    setAdopting(true)
    try {
      const moved = await adoptStrandedSessions()
      setStranded(await previewStranded())
      setImportMsg({
        ok: true,
        text: `✓ ${moved} workout${moved === 1 ? '' : 's'} added to your history.`,
      })
    } catch (err) {
      setImportMsg({ ok: false, text: err instanceof Error ? err.message : 'Could not add them.' })
    } finally {
      setAdopting(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportAllDataAsJSON()
      setExportDone(true)
      setTimeout(() => setExportDone(false), 3000)
    } finally {
      setExporting(false)
    }
  }

  const handleImportClick = () => {
    setImportMsg(null)
    fileInputRef.current?.click()
  }

  const handleWorkoutMigration = async () => {
    setMigrating(true)
    setMigrateMsg(null)
    try {
      const result = await importWorkoutData()
      if (result.skipped) {
        setMigrateMsg({ ok: true, text: 'Already imported — no changes made.' })
      } else {
        const parts = [
          `${result.sessions} sessions`,
          `${result.exercises} exercises`,
          result.daySessions > 0 ? `${result.daySessions} day sessions` : null,
        ].filter(Boolean).join(', ')
        setMigrateMsg({ ok: true, text: `✓ Imported ${parts}` })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed.'
      setMigrateMsg({ ok: false, text: msg })
    } finally {
      setMigrating(false)
      setTimeout(() => setMigrateMsg(null), 8000)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset so the same file can be re-selected after an error
    e.target.value = ''
    setImporting(true)
    setImportMsg(null)
    try {
      const result = await importAllDataFromJSON(file)
      const d = new Date(result.exportDate).toLocaleDateString()
      setImportMsg({ ok: true, text: `✓ ${result.totalRecords} records restored (backup from ${d})` })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed.'
      setImportMsg({ ok: false, text: msg })
    } finally {
      setImporting(false)
      setTimeout(() => setImportMsg(null), 6000)
    }
  }

  return (
    <div className="page-container wide">
      <div className="card-grid">
        <div className="card-grid-full pt-2">
          <div className="text-[length:var(--text-sm)] uppercase tracking-widest text-[color:var(--ink-dim)]">Preferences</div>
          <h1 style={{ fontSize: 'var(--text-6xl)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
            Settings
          </h1>
        </div>

        <Card>
          <CardHeader label="Profile" />

          {/* The two fields that describe the person rather than the plan. */}
          <div className="space-y-3 pb-1">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-[length:var(--text-sm)] uppercase tracking-widest pb-1.5"
                style={{ color: 'var(--ink-faint)' }}
              >
                Name
              </label>
              <input
                id="profile-name"
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
                placeholder={profile.name}
                className="w-full rounded-[var(--r-control)] border bg-transparent text-[length:var(--text-lg)] focus:outline-none transition-colors"
                style={{ color: 'var(--ink)', borderColor: 'var(--hairline)', padding: '8px 10px' }}
              />
            </div>

            <div>
              <SegmentedPill
                label="Ayurvedic type"
                value={dosha}
                onChange={setDosha}
                grow
                options={DOSHAS.map(d => ({ value: d, label: d }))}
              />
              <p className="text-[length:var(--text-md)] leading-relaxed pt-2" style={{ color: 'var(--ink-dim)' }}>
                {guidance.elements} · {guidance.qualities.slice(0, 3).join(', ')}.
                {' '}{guidance.principle}
              </p>
              <p className="text-[length:var(--text-sm)] leading-relaxed pt-1.5" style={{ color: 'var(--ink-dim)' }}>
                A traditional framework, not medical advice. It shapes the tips
                the app offers, nothing it calculates.
              </p>
            </div>

            <div>
              <SegmentedPill
                label="Training days a week"
                value={trainingDays}
                onChange={setTrainingDays}
                grow
                options={TRAINING_DAY_CHOICES.map(n => ({ value: n, label: String(n) }))}
              />
              <p className="text-[length:var(--text-md)] leading-relaxed pt-2" style={{ color: 'var(--ink-dim)' }}>
                Days a week the plan asks for. Train shows this many, and the
                week counts against it.
              </p>
              <p className="text-[length:var(--text-sm)] leading-relaxed pt-1.5" style={{ color: 'var(--ink-dim)' }}>
                Train more than you planned and the week simply grows — lowering
                this never hides a session you already logged.
              </p>
            </div>
          </div>

          {/* Active profile details */}
          <div className="space-y-2 text-[length:var(--text-base)]">
            <ProfileRow label="Bodyweight" value={profile.body.bodyweight} />
            {profile.program && <ProfileRow label="Program" value={profile.program} />}
            {profile.body.bodyFat && <ProfileRow label="Body Fat" value={profile.body.bodyFat} />}
            {profile.body.fatMass && <ProfileRow label="Fat Mass" value={profile.body.fatMass} />}
            {profile.body.leanMass && <ProfileRow label="Lean Mass" value={profile.body.leanMass} />}
            <ProfileRow label="Protein" value={`${profile.targets.proteinG} g/day`} />
            {profile.targets.steps && <ProfileRow label="Steps" value={profile.targets.steps} />}
            {SHOW_VEDIC && profile.mahadasha && <ProfileRow label="Mahadasha" value={profile.mahadasha} />}
            {SHOW_VEDIC && profile.atmakaraka && <ProfileRow label="Atmakaraka" value={profile.atmakaraka} />}
            {profile.body.goal && (
              <p className="text-[length:var(--text-md)] leading-relaxed pt-1" style={{ color: 'var(--ink-dim)' }}>
                {profile.body.goal}
              </p>
            )}
          </div>
        </Card>

        <CollapsibleCard label="Appearance" summary={themeSummary}>
          <ThemeSwitcher />
        </CollapsibleCard>

        <Card>
          <CardHeader label="Data" />
          <div className="space-y-2">
            <Button variant="default" fullWidth onClick={handleExport} disabled={exporting}>
              {exporting ? 'Exporting...' : exportDone ? '✓ Backup downloaded' : 'Export All Data (JSON)'}
            </Button>
            {/* Hidden file picker — triggered programmatically */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="ghost" fullWidth onClick={handleImportClick} disabled={importing}>
              {importing ? 'Importing…' : 'Import Backup'}
            </Button>
            {/* Only shown when there is something to recover — an empty state
                here would be a permanent question about a problem nobody has. */}
            {stranded && stranded.count > 0 && (
              <div className="pt-1">
                <p className="text-[length:var(--text-md)] leading-relaxed pb-2" style={{ color: 'var(--ink-dim)' }}>
                  {stranded.count} workout{stranded.count === 1 ? '' : 's'}
                  {stranded.range && ` from ${stranded.range.from} to ${stranded.range.to}`}
                  {' '}are stored on this device under an older profile, so nothing
                  shows them. Add them to your history to see them in Progress.
                </p>
                <Button variant="default" fullWidth onClick={handleAdopt} disabled={adopting}>
                  {adopting ? 'Adding…' : `Add ${stranded.count} hidden workout${stranded.count === 1 ? '' : 's'}`}
                </Button>
              </div>
            )}

            {/* The JSON backup is for restoring; a printed sheet is for reading
                and keeping. Progress is the page worth putting on paper, so the
                print control lives there rather than being duplicated here. */}
            <Button variant="ghost" fullWidth onClick={() => navigate('/workout/progress')}>
              Print a progress sheet
            </Button>
            {importMsg && (
              <p
                className="text-[length:var(--text-sm)] text-center pt-1"
                style={{ color: importMsg.ok ? 'var(--complete-text)' : 'var(--skip-text)' }}
              >
                {importMsg.text}
              </p>
            )}
          </div>
        </Card>

        <CollapsibleCard
          label="Storage"
          summary={used !== null ? formatBytes(used) : undefined}
        >
          <div className="space-y-2 text-[length:var(--text-md)]">
            <div className="flex justify-between">
              <span className="text-[color:var(--ink-faint)]">Used</span>
              <span className="text-[color:var(--ink-dim)]">{used !== null ? formatBytes(used) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[color:var(--ink-faint)]">Quota</span>
              <span className="text-[color:var(--ink-dim)]">{quota !== null ? formatBytes(quota) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[color:var(--ink-faint)]">Persistent</span>
              <span className={persisted ? 'text-green-400' : 'text-[color:var(--ink-dim)]'}>
                {persisted === null ? '—' : persisted ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard label="Image Cache">
          <StoragePanel />
        </CollapsibleCard>

        {/* ── One-time migration — remove this card after successful import ── */}
        <CollapsibleCard label="Migration">
          <div className="space-y-2">
            <p className="text-[length:var(--text-sm)] leading-relaxed" style={{ color: 'var(--ink-faint)' }}>
              Import historical workout data from{' '}
              <span style={{ color: 'var(--ink-dim)' }}>obZen_workout_import.json</span>.
              Place the file in the <span style={{ color: 'var(--ink-dim)' }}>/public</span> folder
              before clicking. Safe to re-run — duplicate records are skipped.
            </p>
            <Button variant="ghost" fullWidth onClick={handleWorkoutMigration} disabled={migrating}>
              {migrating ? 'Importing…' : 'Import Historical Workout Data'}
            </Button>
            {migrateMsg && (
              <p
                className="text-[length:var(--text-sm)] text-center pt-1"
                style={{ color: migrateMsg.ok ? 'var(--complete-text)' : 'var(--skip-text)' }}
              >
                {migrateMsg.text}
              </p>
            )}
          </div>
        </CollapsibleCard>

        <CollapsibleCard label="App" summary="1.0.0">
          <div className="space-y-2 text-[length:var(--text-md)]">
            <div className="flex justify-between">
              <span className="text-[color:var(--ink-faint)]">Version</span>
              <span className="text-[color:var(--ink-dim)]">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[color:var(--ink-faint)]">Storage</span>
              <span className="text-[color:var(--ink-dim)]">IndexedDB (offline)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[color:var(--ink-faint)]">Mode</span>
              <span className="text-[color:var(--ink-dim)]">PWA / Offline-first</span>
            </div>
          </div>
        </CollapsibleCard>
      </div>
    </div>
  )
}
