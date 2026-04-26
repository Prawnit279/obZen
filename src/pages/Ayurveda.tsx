import { useState } from 'react'
import { PITTA_PROFILE, PITTA_DINACHARYA, PITTA_REMEDIES } from '@/data/ayurveda'
import { useAyurvedaStore } from '@/store/useAyurvedaStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { CheckSquare, Square, ChevronDown, ChevronRight } from 'lucide-react'

type Tab = 'profile' | 'routine' | 'remedies'

export default function Ayurveda() {
  const [tab, setTab] = useState<Tab>('routine')

  return (
    <div className="page-container space-y-4">
      <div className="pt-2">
        <div className="text-[11px] uppercase tracking-widest text-noir-muted">Pitta Dosha</div>
        <div className="text-[18px] uppercase tracking-wide text-noir-white">Ayurveda</div>
      </div>

      <div className="flex border border-noir-border rounded-[2px] overflow-hidden">
        {(['routine', 'profile', 'remedies'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-[10px] uppercase tracking-widest transition-colors border-r border-noir-border last:border-r-0',
              tab === t ? 'bg-noir-elevated text-noir-white' : 'text-noir-dim hover:text-noir-muted hover:bg-noir-elevated/30'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'routine' && <RoutineTab />}
      {tab === 'profile' && <ProfileTab />}
      {tab === 'remedies' && <RemediesTab />}
    </div>
  )
}

function RoutineTab() {
  const { todayCompleted, toggleRoutineItem } = useAyurvedaStore()

  const morningTotal = PITTA_DINACHARYA.morningPractices.length
  const eveningTotal = PITTA_DINACHARYA.eveningPractices.length
  const morningDone = PITTA_DINACHARYA.morningPractices.filter(p => todayCompleted.includes(p.id)).length
  const eveningDone = PITTA_DINACHARYA.eveningPractices.filter(p => todayCompleted.includes(p.id)).length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          label="Morning Practices"
          action={<span className="text-[11px] text-noir-muted">{morningDone}/{morningTotal}</span>}
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
                <div className={cn('mt-0.5 shrink-0 transition-colors', done ? 'text-noir-accent' : 'text-noir-dim group-hover:text-noir-muted')}>
                  {done ? <CheckSquare size={14} /> : <Square size={14} />}
                </div>
                <div>
                  <div className={cn('text-[12px] transition-colors', done ? 'text-noir-muted line-through' : 'text-noir-accent')}>
                    {practice.label}
                  </div>
                  <div className="text-[11px] text-noir-dim">{practice.note}</div>
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <Card>
        <CardHeader
          label="Evening Practices"
          action={<span className="text-[11px] text-noir-muted">{eveningDone}/{eveningTotal}</span>}
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
                <div className={cn('mt-0.5 shrink-0 transition-colors', done ? 'text-noir-accent' : 'text-noir-dim group-hover:text-noir-muted')}>
                  {done ? <CheckSquare size={14} /> : <Square size={14} />}
                </div>
                <div>
                  <div className={cn('text-[12px] transition-colors', done ? 'text-noir-muted line-through' : 'text-noir-accent')}>
                    {practice.label}
                  </div>
                  <div className="text-[11px] text-noir-dim">{practice.note}</div>
                </div>
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function ProfileTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader label="Pitta Dosha" />
        <div className="text-[11px] uppercase tracking-widest text-noir-dim mb-3">{PITTA_PROFILE.elements}</div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-2">Qualities</div>
          <div className="flex flex-wrap gap-1.5">
            {PITTA_PROFILE.qualities.map(q => (
              <span key={q} className="text-[11px] border border-noir-border rounded-[2px] px-2 py-0.5 text-noir-muted">
                {q}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader label="When Balanced" />
        <ul className="space-y-1.5">
          {PITTA_PROFILE.balancedSigns.map(sign => (
            <li key={sign} className="text-[12px] text-noir-muted flex gap-2">
              <span className="text-noir-dim">·</span>{sign}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader label="When Imbalanced" />
        <ul className="space-y-1.5">
          {PITTA_PROFILE.imbalancedSigns.map(sign => (
            <li key={sign} className="text-[12px] text-noir-red flex gap-2">
              <span>·</span>{sign}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader label="Daily Timing" />
        <div className="space-y-2">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-noir-dim">Pitta Peak Hours</span>
            <div className="text-[13px] text-noir-accent mt-0.5">{PITTA_PROFILE.pittaTime}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-noir-dim">Best Exercise Time</span>
            <div className="text-[13px] text-noir-accent mt-0.5">{PITTA_PROFILE.bestExerciseTime}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-noir-dim">High Risk Season</span>
            <div className="text-[13px] text-noir-accent mt-0.5">{PITTA_PROFILE.season}</div>
          </div>
        </div>
      </Card>
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
            <span className="text-[13px] text-noir-accent">{remedy.condition}</span>
            {expanded === remedy.condition ? <ChevronDown size={14} className="text-noir-dim" /> : <ChevronRight size={14} className="text-noir-dim" />}
          </button>
          {expanded === remedy.condition && (
            <div className="px-4 pb-4 space-y-3 border-t border-noir-border pt-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-2">Remedies</div>
                <ul className="space-y-1">
                  {remedy.remedies.map((r, j) => (
                    <li key={j} className="text-[12px] text-noir-muted flex gap-2">
                      <span className="text-noir-dim shrink-0">·</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-1.5">Herbs</div>
                <div className="flex flex-wrap gap-1.5">
                  {remedy.herbs.map(h => (
                    <span key={h} className="text-[11px] border border-noir-border rounded-[2px] px-2 py-0.5 text-noir-muted">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-noir-dim mb-1">Lifestyle</div>
                <p className="text-[12px] text-noir-muted">{remedy.lifestyle}</p>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
