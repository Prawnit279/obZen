import { useState, useEffect } from 'react'
import { SegmentedPill } from '@/components/ui/SegmentedPill'
import { PITTA_DINACHARYA, PITTA_REMEDIES } from '@/data/ayurveda'
import { DoshaGuidanceCard } from '@/components/modules/ayurveda/DoshaGuidanceCard'
import { useAyurvedaStore } from '@/store/useAyurvedaStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { CheckSquare, Square, ChevronDown, ChevronRight } from 'lucide-react'
import { db } from '@/db/dexie'

type Tab = 'profile' | 'routine' | 'remedies'

export default function Ayurveda() {
  const [tab, setTab] = useState<Tab>('routine')

  return (
    <div className="page-container space-y-4">
      <div className="pt-2">
        <div className="text-[11px] uppercase tracking-widest text-[color:var(--ink-dim)]">Pitta Dosha</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
          Ayurveda
        </h1>
      </div>

      <SegmentedPill
        label="Ayurveda section"
        value={tab}
        onChange={setTab}
        grow
        options={[
          { value: 'routine' as Tab, label: 'Routine' },
          { value: 'profile' as Tab, label: 'Profile' },
          { value: 'remedies' as Tab, label: 'Remedies' },
        ]}
      />

      {tab === 'routine' && <RoutineTab />}
      {tab === 'profile' && <ProfileTab />}
      {tab === 'remedies' && <RemediesTab />}
    </div>
  )
}

function RoutineTab() {
  const { todayCompleted, toggleRoutineItem } = useAyurvedaStore()
  const today = new Date().toISOString().split('T')[0]

  // Persist to Dexie whenever completed items change
  useEffect(() => {
    const save = async () => {
      const existing = await db.ayurvedaLogs.where('date').equals(today).first()
      if (existing) {
        await db.ayurvedaLogs.update(existing.id!, { completedItems: todayCompleted })
      } else if (todayCompleted.length > 0) {
        await db.ayurvedaLogs.add({ date: today, completedItems: todayCompleted })
      }
    }
    save()
  }, [todayCompleted, today])

  const morningTotal = PITTA_DINACHARYA.morningPractices.length
  const eveningTotal = PITTA_DINACHARYA.eveningPractices.length
  const morningDone = PITTA_DINACHARYA.morningPractices.filter(p => todayCompleted.includes(p.id)).length
  const eveningDone = PITTA_DINACHARYA.eveningPractices.filter(p => todayCompleted.includes(p.id)).length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          label="Morning Practices"
          action={<span className="text-[11px] text-[color:var(--ink-dim)]">{morningDone}/{morningTotal}</span>}
        />
        <div className="space-y-2">
          {PITTA_DINACHARYA.morningPractices.map(practice => {
            const done = todayCompleted.includes(practice.id)
            return (
              <button
                key={practice.id}
                onClick={() => toggleRoutineItem(practice.id)}
                className="w-full flex items-start gap-3 py-1.5 text-left transition-colors group"
              >
                <div className={cn('mt-0.5 shrink-0 transition-colors', done ? 'text-[color:var(--ink-2)]' : 'text-[color:var(--ink-faint)] group-hover:text-[color:var(--ink-dim)]')}>
                  {done ? <CheckSquare size={14} /> : <Square size={14} />}
                </div>
                <div>
                  <div className={cn('text-[12px] transition-colors', done ? 'text-[color:var(--ink-dim)] line-through' : 'text-[color:var(--ink-2)]')}>
                    {practice.label}
                  </div>
                  <div className="text-[11px] text-[color:var(--ink-faint)]">{practice.note}</div>
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <Card>
        <CardHeader
          label="Evening Practices"
          action={<span className="text-[11px] text-[color:var(--ink-dim)]">{eveningDone}/{eveningTotal}</span>}
        />
        <div className="space-y-2">
          {PITTA_DINACHARYA.eveningPractices.map(practice => {
            const done = todayCompleted.includes(practice.id)
            return (
              <button
                key={practice.id}
                onClick={() => toggleRoutineItem(practice.id)}
                className="w-full flex items-start gap-3 py-1.5 text-left transition-colors group"
              >
                <div className={cn('mt-0.5 shrink-0 transition-colors', done ? 'text-[color:var(--ink-2)]' : 'text-[color:var(--ink-faint)] group-hover:text-[color:var(--ink-dim)]')}>
                  {done ? <CheckSquare size={14} /> : <Square size={14} />}
                </div>
                <div>
                  <div className={cn('text-[12px] transition-colors', done ? 'text-[color:var(--ink-dim)] line-through' : 'text-[color:var(--ink-2)]')}>
                    {practice.label}
                  </div>
                  <div className="text-[11px] text-[color:var(--ink-faint)]">{practice.note}</div>
                </div>
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

/**
 * The dosha profile, following whichever type is set rather than the Pitta this
 * screen used to assume for everyone.
 */
function ProfileTab() {
  return (
    <div className="space-y-4">
      <DoshaGuidanceCard />
    </div>
  )
}

function RemediesTab() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {PITTA_REMEDIES.map((remedy, i) => (
        <Card key={i} noPadding>
          <button
            onClick={() => setExpanded(expanded === remedy.condition ? null : remedy.condition)}
            className="w-full text-left p-4 flex items-center justify-between"
          >
            <span className="text-[13px] text-[color:var(--ink-2)]">{remedy.condition}</span>
            {expanded === remedy.condition ? <ChevronDown size={14} className="text-[color:var(--ink-faint)]" /> : <ChevronRight size={14} className="text-[color:var(--ink-faint)]" />}
          </button>
          {expanded === remedy.condition && (
            <div className="px-4 pb-4 space-y-3 border-t border-[color:var(--hairline)] pt-3">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-[color:var(--ink-faint)] mb-2">Remedies</div>
                <ul className="space-y-1">
                  {remedy.remedies.map((r, j) => (
                    <li key={j} className="text-[12px] text-[color:var(--ink-dim)] flex gap-2">
                      <span className="text-[color:var(--ink-faint)] shrink-0">·</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-[color:var(--ink-faint)] mb-1.5">Herbs</div>
                <div className="flex flex-wrap gap-1.5">
                  {remedy.herbs.map(h => (
                    <span key={h} className="text-[11px] border border-[color:var(--hairline)] rounded-[var(--r-control)] px-2 py-0.5 text-[color:var(--ink-dim)]">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-[color:var(--ink-faint)] mb-1">Lifestyle</div>
                <p className="text-[12px] text-[color:var(--ink-dim)]">{remedy.lifestyle}</p>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
