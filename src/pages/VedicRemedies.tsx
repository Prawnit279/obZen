import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { VEDIC_REMEDIES, PLANETARY_DAYS, RAHU_MAHADASHA } from '@/data/vedic-remedies'
import { Card, CardHeader } from '@/components/ui/Card'
import { getPlanetaryDay } from '@/lib/utils'
import { ChevronDown, ChevronRight, Plus, X, Trash2 } from 'lucide-react'
import { db } from '@/db/dexie'
import type { VedicLog } from '@/db/dexie'

const PLANETS = VEDIC_REMEDIES.map(r => r.planet)

function AddLogForm({ onClose }: { onClose: () => void }) {
  const [planet, setPlanet]   = useState(PLANETS[0])
  const [practice, setPractice] = useState('')
  const [mantra, setMantra]   = useState('')
  const [count, setCount]     = useState('')
  const [notes, setNotes]     = useState('')
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving]   = useState(false)

  const handleSave = async () => {
    if (!practice.trim()) return
    setSaving(true)
    await db.vedicLogs.add({
      date,
      planet,
      practice: practice.trim(),
      mantra: mantra.trim() || undefined,
      mantraCount: count ? parseInt(count, 10) : undefined,
      notes: notes.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="p-3 rounded-[2px] space-y-2.5" style={{ background: '#0d0d0d', border: '1px solid #2a2a2a' }}>
      <div className="flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-widest" style={{ color: '#555555' }}>New Log</p>
        <button onClick={onClose} aria-label="Close"><X size={12} style={{ color: '#555555' }} /></button>
      </div>
      <div>
        <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#3a3a3a' }}>Planet</label>
        <select className="input w-full text-[11px]" value={planet} onChange={e => setPlanet(e.target.value)}>
          {PLANETS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#3a3a3a' }}>Practice *</label>
        <input className="input w-full" value={practice} onChange={e => setPractice(e.target.value)} placeholder="e.g. Mantra recitation, fasting..." autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#3a3a3a' }}>Mantra</label>
          <input className="input w-full" value={mantra} onChange={e => setMantra(e.target.value)} placeholder="Om Shani Namaha..." />
        </div>
        <div>
          <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#3a3a3a' }}>Count</label>
          <input type="number" className="input w-full" value={count} onChange={e => setCount(e.target.value)} placeholder="108" min="1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#3a3a3a' }}>Date</label>
          <input type="date" className="input w-full" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: '#3a3a3a' }}>Notes</label>
          <input className="input w-full" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional..." />
        </div>
      </div>
      <button onClick={handleSave} disabled={!practice.trim() || saving}
        className="w-full py-2 rounded-[2px] text-[10px] uppercase tracking-widest disabled:opacity-30"
        style={{ border: '1px solid #d4d4d4', color: '#d4d4d4' }}>
        {saving ? 'Saving…' : 'Log Practice'}
      </button>
    </div>
  )
}

function PracticeLog() {
  const [showForm, setShowForm] = useState(false)
  const logs = useLiveQuery(() => db.vedicLogs.orderBy('date').reverse().toArray(), []) ?? []

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <CardHeader label="Practice Log" />
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-[9px] uppercase tracking-widest"
          style={{ border: '1px solid #2a2a2a', color: '#555555' }}>
          <Plus size={9} /> Add
        </button>
      </div>
      {showForm && <AddLogForm onClose={() => setShowForm(false)} />}
      {logs.length === 0 && !showForm && (
        <p className="text-[11px] text-center py-4" style={{ color: '#333333' }}>No logs yet. Tap + to record a practice.</p>
      )}
      {logs.length > 0 && (
        <div className="space-y-1.5 mt-2">
          {logs.map((log: VedicLog) => (
            <div key={log.id} className="flex items-start gap-2 px-3 py-2.5 rounded-[2px]" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px]" style={{ color: '#d4d4d4' }}>{log.practice}</span>
                  {log.mantraCount && <span className="text-[10px] px-1.5 py-0.5 rounded-[2px]" style={{ background: '#1a1a1a', color: '#888888' }}>×{log.mantraCount}</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px]" style={{ color: '#555555' }}>{log.date}</span>
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: '#3a3a3a' }}>{log.planet.split(' ')[0]}</span>
                  {log.mantra && <span className="text-[10px] italic" style={{ color: '#555555' }}>{log.mantra}</span>}
                </div>
                {log.notes && <p className="text-[10px] mt-0.5" style={{ color: '#444444' }}>{log.notes}</p>}
              </div>
              <button onClick={() => db.vedicLogs.delete(log.id!)} aria-label="Delete log" className="shrink-0 mt-0.5">
                <Trash2 size={12} style={{ color: '#3a3a3a' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default function VedicRemedies() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const todayPlanet = getPlanetaryDay()

  const now = new Date()
  const start = new Date(RAHU_MAHADASHA.start)
  const end = new Date(RAHU_MAHADASHA.end)
  const total = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()
  const rahuPct = Math.min(100, Math.round((elapsed / total) * 100))

  const dayOfWeek = now.getDay()
  const planetInfo = PLANETARY_DAYS[dayOfWeek as keyof typeof PLANETARY_DAYS]

  return (
    <div className="page-container space-y-4">
      <div className="pt-2">
        <div className="text-[11px] uppercase tracking-widest text-noir-muted">Jyotish</div>
        <div className="text-[18px] uppercase tracking-wide text-noir-white">Vedic Remedies</div>
      </div>

      <PracticeLog />

      {/* Today's planetary day */}
      <Card>
        <CardHeader label="Today" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[16px] text-noir-white">{todayPlanet.planet} Day</div>
            <div className="text-[11px] text-noir-muted mt-0.5">{planetInfo?.color}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-noir-dim uppercase tracking-widest">Mantra</div>
            <div className="text-[12px] text-noir-accent mt-0.5">{planetInfo?.mantra}</div>
          </div>
        </div>
      </Card>

      {/* Rahu Mahadasha tracker */}
      <Card>
        <CardHeader label="Rahu Mahadasha" action={<span className="text-[11px] text-noir-muted">{rahuPct}% elapsed</span>} />
        <div className="text-[11px] text-noir-muted mb-3">{RAHU_MAHADASHA.theme}</div>
        <div className="bg-noir-border rounded-[1px] h-1 mb-3">
          <div
            className="h-full bg-noir-accent rounded-[1px] transition-all"
            style={{ width: `${rahuPct}%` }}
          />
        </div>
        <div className="text-[10px] uppercase tracking-widest text-noir-dim">
          {RAHU_MAHADASHA.start} → {RAHU_MAHADASHA.end}
        </div>
        <div className="mt-3 space-y-1.5">
          {RAHU_MAHADASHA.guidance.map((g, i) => (
            <div key={i} className="text-[11px] text-noir-muted flex gap-2">
              <span className="text-noir-dim shrink-0">·</span>{g}
            </div>
          ))}
        </div>
      </Card>

      {/* Remedy cards */}
      <div className="space-y-2">
        {VEDIC_REMEDIES.map((remedy) => (
          <Card key={remedy.planet} noPadding>
            <button
              onClick={() => setExpanded(expanded === remedy.planet ? null : remedy.planet)}
              className="w-full text-left p-4 flex items-start justify-between gap-2"
            >
              <div>
                <div className="text-[13px] text-noir-accent">{remedy.planet}</div>
                <div className="text-[11px] text-noir-dim mt-0.5">{remedy.theme}</div>
                {remedy.day && (
                  <div className="text-[10px] uppercase tracking-widest text-noir-dim mt-1">
                    {remedy.day}
                    {remedy.color && ` · ${remedy.color}`}
                  </div>
                )}
              </div>
              {expanded === remedy.planet
                ? <ChevronDown size={14} className="text-noir-dim shrink-0 mt-1" />
                : <ChevronRight size={14} className="text-noir-dim shrink-0 mt-1" />
              }
            </button>

            {expanded === remedy.planet && (
              <div className="border-t border-noir-border px-4 pb-4 pt-3 space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-2">Practices</div>
                  <ul className="space-y-1.5">
                    {remedy.remedies.map((r, i) => (
                      <li key={i} className="text-[12px] text-noir-muted flex gap-2">
                        <span className="text-noir-dim shrink-0">·</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-1">Meditation</div>
                  <p className="text-[12px] text-noir-muted">{remedy.meditation}</p>
                </div>
                <div className="border-l-2 border-noir-strong pl-3">
                  <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-1">Affirmation</div>
                  <p className="text-[13px] text-noir-accent italic">"{remedy.affirmation}"</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
