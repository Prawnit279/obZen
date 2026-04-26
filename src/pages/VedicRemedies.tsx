import { useState } from 'react'
import { VEDIC_REMEDIES, PLANETARY_DAYS, RAHU_MAHADASHA } from '@/data/vedic-remedies'
import { Card, CardHeader } from '@/components/ui/Card'
import { getPlanetaryDay } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'

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
