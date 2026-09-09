import { Card } from '@/components/ui/Card'
import { useProfileSettingsStore } from '@/store/useProfileSettingsStore'
import { guidanceFor } from '@/data/doshas'

function Chips({ items, tone }: { items: string[]; tone: 'favor' | 'reduce' }) {
  return (
    <div className="flex flex-wrap" style={{ gap: 6 }}>
      {items.map(item => (
        <span
          key={item}
          className="capitalize"
          style={{
            fontSize: 11, padding: '3px 9px', borderRadius: 'var(--r-pill)',
            color: tone === 'favor' ? 'var(--ink-2)' : 'var(--ink-dim)',
            border: `1px solid ${tone === 'favor' ? 'rgba(167,139,250,0.35)' : 'var(--hairline)'}`,
            background: tone === 'favor' ? 'rgba(139,92,246,0.08)' : 'transparent',
          }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      <h4
        className="uppercase"
        style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
      >
        {title}
      </h4>
      {children}
    </div>
  )
}

/**
 * What the selected dosha is classically advised — qualities, how to train,
 * what to eat, and what excess looks like.
 *
 * Follows the profile's Ayurvedic type rather than being fixed to one, which is
 * the point: the screen used to speak only to Pitta whoever was reading it.
 */
export function DoshaGuidanceCard() {
  const dosha = useProfileSettingsStore(s => s.dosha)
  const g = guidanceFor(dosha)

  return (
    <Card label={`${g.dosha} — ${g.elements}`}>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>{g.principle}</p>

      <Section title="Qualities">
        <Chips items={g.qualities} tone="reduce" />
      </Section>

      <Section title="Training">
        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-dim)' }}>{g.training.approach}</p>
        <p style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
          Best time: {g.training.bestTime}
        </p>
        <p
          style={{
            fontSize: 12, lineHeight: 1.5, color: 'var(--ink-dim)',
            padding: '10px 12px', borderRadius: 'var(--r-inset)',
            border: '1px solid rgba(167,139,250,0.30)', background: 'rgba(139,92,246,0.07)',
          }}
        >
          Watch for: {g.training.watchFor}
        </p>
      </Section>

      <Section title={`Favour — ${g.favorTastes.join(', ')}`}>
        <Chips items={g.favorFoods} tone="favor" />
      </Section>

      <Section title={`Reduce — ${g.reduceTastes.join(', ')}`}>
        <Chips items={g.reduceFoods} tone="reduce" />
      </Section>

      <Section title="Daily">
        <ul className="flex flex-col" style={{ gap: 5 }}>
          {g.daily.map(d => (
            <li key={d} className="flex" style={{ gap: 8, fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.45 }}>
              <span aria-hidden="true" style={{ color: 'var(--violet-200)' }}>·</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`In excess, ${g.dosha} looks like`}>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-dim)' }}>
          {g.excess.join(', ')}. Balanced, it reads as {g.balanced.join(', ')}.
        </p>
        <p style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
          Accumulates in: {g.season}
        </p>
      </Section>

      <p
        style={{
          fontSize: 11, lineHeight: 1.5, color: 'var(--ink-ghost)',
          paddingTop: 12, borderTop: '1px solid var(--hairline-soft)',
        }}
      >
        Ayurveda is a traditional framework, not a clinical one. Read this as a
        lens for noticing patterns and for choosing between options that are all
        fine anyway — not as medical advice, and not in place of it. Change your
        type in Settings.
      </p>
    </Card>
  )
}
