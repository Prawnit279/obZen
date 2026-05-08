import { useState, useEffect } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { StoragePanel } from '@/components/ui/StoragePanel'
import { exportAllDataAsJSON } from '@/lib/export'

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
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

  const [exporting, setExporting]   = useState(false)
  const [exportDone, setExportDone] = useState(false)

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
        <CardHeader label="User Profile" />
        <div className="space-y-2 text-[12px]">
          <div className="flex justify-between">
            <span className="text-noir-dim">Name</span>
            <span className="text-noir-accent">Pronit</span>
          </div>
          <div className="flex justify-between">
            <span className="text-noir-dim">Bodyweight</span>
            <span className="text-noir-accent">75 kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-noir-dim">Dosha</span>
            <span className="text-noir-accent">Pitta</span>
          </div>
          <div className="flex justify-between">
            <span className="text-noir-dim">Mahadasha</span>
            <span className="text-noir-accent">Rahu (~2030)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-noir-dim">Atmakaraka</span>
            <span className="text-noir-accent">Saturn</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader label="Data" />
        <div className="space-y-2">
          <Button variant="default" fullWidth onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : exportDone ? '✓ Backup downloaded' : 'Export All Data (JSON)'}
          </Button>
          <Button variant="ghost" fullWidth>
            Import Backup
          </Button>
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
