import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { StoragePanel } from '@/components/ui/StoragePanel'
import { exportAllDataAsJSON, importAllDataFromJSON } from '@/lib/export'
import { importWorkoutData } from '@/utils/importWorkoutData'
import { SHOW_VEDIC } from '@/config/features'
import { PROFILES, PROFILE_IDS } from '@/config/profiles'
import { useProfileStore } from '@/store/useProfileStore'
import { cn } from '@/lib/utils'

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-noir-dim shrink-0">{label}</span>
      <span className="text-noir-accent text-right">{value}</span>
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
  const { used, quota, persisted } = useStorageEstimate()
  const { activeId, setActive } = useProfileStore()
  const profile = PROFILES[activeId]

  const [exporting, setExporting]   = useState(false)
  const [exportDone, setExportDone] = useState(false)

  const [importing, setImporting]   = useState(false)
  const [importMsg, setImportMsg]   = useState<{ ok: boolean; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [migrating, setMigrating]   = useState(false)
  const [migrateMsg, setMigrateMsg] = useState<{ ok: boolean; text: string } | null>(null)

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
    <div className="page-container space-y-4">
      <div className="pt-2">
        <div className="text-[11px] uppercase tracking-widest text-noir-muted">Preferences</div>
        <div className="text-[18px] uppercase tracking-wide text-noir-white">Settings</div>
      </div>

      <Card>
        <CardHeader label="Appearance" />
        <ThemeSwitcher />
      </Card>

      <Card>
        <CardHeader label="Profile" />

        {/* Profile switcher */}
        <div className="flex gap-2 mb-3">
          {PROFILE_IDS.map(id => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                'flex-1 py-2 rounded-[2px] text-[11px] uppercase tracking-widest transition-colors border',
                id === activeId
                  ? 'border-noir-accent text-noir-white bg-noir-elevated'
                  : 'border-noir-border text-noir-dim hover:border-noir-strong hover:text-noir-muted'
              )}
              aria-pressed={id === activeId}
            >
              {PROFILES[id].name}
            </button>
          ))}
        </div>

        {/* Active profile details */}
        <div className="space-y-2 text-[13px]">
          <ProfileRow label="Name" value={profile.name} />
          <ProfileRow label="Bodyweight" value={profile.body.bodyweight} />
          {profile.program && <ProfileRow label="Program" value={profile.program} />}
          {profile.body.bodyFat && <ProfileRow label="Body Fat" value={profile.body.bodyFat} />}
          {profile.body.fatMass && <ProfileRow label="Fat Mass" value={profile.body.fatMass} />}
          {profile.body.leanMass && <ProfileRow label="Lean Mass" value={profile.body.leanMass} />}
          <ProfileRow label="Protein" value={`${profile.targets.proteinG} g/day`} />
          {profile.targets.steps && <ProfileRow label="Steps" value={profile.targets.steps} />}
          {profile.dosha && <ProfileRow label="Dosha" value={profile.dosha} />}
          {SHOW_VEDIC && profile.mahadasha && <ProfileRow label="Mahadasha" value={profile.mahadasha} />}
          {SHOW_VEDIC && profile.atmakaraka && <ProfileRow label="Atmakaraka" value={profile.atmakaraka} />}
          {profile.body.goal && (
            <p className="text-[12px] leading-relaxed pt-1" style={{ color: '#888888' }}>
              {profile.body.goal}
            </p>
          )}
        </div>
      </Card>

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
          {importMsg && (
            <p
              className="text-[11px] text-center pt-1"
              style={{ color: importMsg.ok ? '#34d399' : '#fb7185' }}
            >
              {importMsg.text}
            </p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader label="Image Cache" />
        <StoragePanel />
      </Card>

      <Card>
        <CardHeader label="Storage" />
        <div className="space-y-2 text-[12px]">
          <div className="flex justify-between">
            <span className="text-noir-dim">Used</span>
            <span className="text-noir-muted">{used !== null ? formatBytes(used) : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-noir-dim">Quota</span>
            <span className="text-noir-muted">{quota !== null ? formatBytes(quota) : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-noir-dim">Persistent</span>
            <span className={persisted ? 'text-green-400' : 'text-noir-muted'}>
              {persisted === null ? '—' : persisted ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </Card>

      {/* ── One-time migration — remove this card after successful import ── */}
      <Card>
        <CardHeader label="Migration" />
        <div className="space-y-2">
          <p className="text-[10px] leading-relaxed" style={{ color: '#555555' }}>
            Import historical workout data from{' '}
            <span style={{ color: '#888888' }}>obZen_workout_import.json</span>.
            Place the file in the <span style={{ color: '#888888' }}>/public</span> folder
            before clicking. Safe to re-run — duplicate records are skipped.
          </p>
          <Button variant="ghost" fullWidth onClick={handleWorkoutMigration} disabled={migrating}>
            {migrating ? 'Importing…' : 'Import Historical Workout Data'}
          </Button>
          {migrateMsg && (
            <p
              className="text-[11px] text-center pt-1"
              style={{ color: migrateMsg.ok ? '#34d399' : '#fb7185' }}
            >
              {migrateMsg.text}
            </p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader label="App" />
        <div className="space-y-2 text-[12px]">
          <div className="flex justify-between">
            <span className="text-noir-dim">Version</span>
            <span className="text-noir-muted">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-noir-dim">Storage</span>
            <span className="text-noir-muted">IndexedDB (offline)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-noir-dim">Mode</span>
            <span className="text-noir-muted">PWA / Offline-first</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
