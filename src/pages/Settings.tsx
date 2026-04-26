import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { StoragePanel } from '@/components/ui/StoragePanel'

export default function Settings() {
  const handleExport = () => {
    alert('Export: coming in Phase 7')
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
          <Button variant="default" fullWidth onClick={handleExport}>
            Export All Data (JSON)
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
