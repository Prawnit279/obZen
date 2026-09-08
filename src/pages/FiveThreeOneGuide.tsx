import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const CARD = { background: 'var(--card)', border: '1px solid var(--border)' } as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--r-control)] p-4" style={CARD}>
      <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{title}</h2>
      <div className="text-[13px] leading-relaxed mt-2 space-y-2" style={{ color: 'var(--ink-dim)' }}>
        {children}
      </div>
    </section>
  )
}

/**
 * Static reference for the 5/3/1 method (Jim Wendler). Read-only — explains
 * what the Tools calculators compute; it does not drive any logging.
 */
export default function FiveThreeOneGuide() {
  const navigate = useNavigate()

  return (
    <div className="page-container space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[12px] uppercase tracking-widest transition-opacity hover:opacity-70"
        style={{ color: 'var(--ink-dim)' }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="pt-1">
        <div className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>Reference</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
          5/3/1 Guide
        </h1>
      </div>

      <Section title="Training Max">
        <p>
          Everything in 5/3/1 is a percentage of a Training Max (TM), not your true 1-rep max.
          TM is set at 90% of an estimated 1RM — lifting slightly under your ceiling so every
          prescribed set is achievable with room to spare, which is what makes the AMRAP sets
          below meaningful rather than a grind to failure every week.
        </p>
      </Section>

      <Section title="The 3-week wave">
        <p>Each week is three working sets at rising intensity, off the Training Max:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><span style={{ color: 'var(--ink)' }}>Week 1 — 5s:</span> 65% / 75% / 85%, for 5/5/5+ reps</li>
          <li><span style={{ color: 'var(--ink)' }}>Week 2 — 3s:</span> 70% / 80% / 90%, for 3/3/3+ reps</li>
          <li><span style={{ color: 'var(--ink)' }}>Week 3 — 5/3/1:</span> 75% / 85% / 95%, for 5/3/1+ reps</li>
        </ul>
        <p>The percentage climbs and the reps drop, so the bar always feels heavy without being maxed out.</p>
      </Section>

      <Section title="The AMRAP top set">
        <p>
          The final set of each week is marked with a <span style={{ color: 'var(--complete-text)' }}>+</span> — As Many
          Reps As Possible at that weight, stopping a rep or two short of failure. It is both the hardest set
          of the week and the data point that tells you whether the Training Max is still accurate: beating
          the prescribed rep count by a wide margin most cycles is the usual signal to raise it.
        </p>
      </Section>

      <Section title="Cycle progression">
        <p>
          After a full 3-week wave (and deload, if you took one), the Training Max goes up for the next
          cycle — typically <span style={{ color: 'var(--ink)' }}>+5 lb</span> on upper-body lifts and{' '}
          <span style={{ color: 'var(--ink)' }}>+10 lb</span> on lower-body lifts. Small, steady increases are
          the point — 5/3/1 is built for consistency over months, not a fast ramp.
        </p>
      </Section>

      <Section title="The deload">
        <p>
          An optional light week — 40% / 50% / 60% for 5/5/5, no AMRAP set — inserted every few cycles to
          let fatigue dissipate before it becomes an injury risk. Nothing is maxed out; the week exists to
          let the next cycle start fresh.
        </p>
      </Section>

      <Section title="Joker sets">
        <p>
          If the AMRAP top set felt strong, Joker sets are optional heavier singles, doubles or triples
          added on top — typically +5%, +10%, +15% above that set. They are autoregulated: only take them
          on a good day, and stop the moment a rep grinds. Skipping them entirely is completely normal.
        </p>
      </Section>

      <Section title="Boring But Big (BBB)">
        <p>
          A high-volume accessory block — 5 sets of 10 — done after the main lift, at a percentage of the
          Training Max (50% is the standard starting point). It can be the same movement as the main lift
          for pure volume, or the opposite movement (e.g. squat day, deadlift BBB) to balance the week. It
          is deliberately monotonous — the name is the whole pitch.
        </p>
      </Section>
    </div>
  )
}
