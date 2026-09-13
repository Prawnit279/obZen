import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

interface CollapsibleCardProps {
  label: string
  /** Shown on the header while closed — the answer, so opening is a choice. */
  summary?: ReactNode
  /** Open on first render. Settings that are read more often than they are set. */
  defaultOpen?: boolean
  children: ReactNode
}

/**
 * A Card whose body folds away.
 *
 * Settings is a long page of sections that are mostly read once and never
 * touched again — storage figures, the migration tool, the cache. Folding those
 * puts the two things that actually get edited at the top of the screen instead
 * of below a scroll.
 *
 * The header carries a summary so a closed section still answers its own
 * question: Appearance says which theme is on, Storage says how much is used.
 * A closed section that tells you nothing just costs a tap.
 *
 * Geometry matches `Card` rather than importing it — the header has to be the
 * button, so the padding lives on the two halves instead of the container.
 */
export function CollapsibleCard({ label, summary, defaultOpen = false, children }: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section
      className="flex flex-col"
      style={{
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-card)',
        background: 'var(--card)',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex items-center justify-between w-full text-left transition-opacity hover:opacity-80"
        style={{ padding: '16px 18px', gap: 12 }}
      >
        <h3
          className="uppercase"
          style={{ fontSize: 'var(--text-sm)', fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
        >
          {label}
        </h3>
        <span className="flex items-center shrink-0" style={{ gap: 10 }}>
          {summary && (
            <span style={{ fontSize: 'var(--text-md)', color: 'var(--ink-faint)' }}>{summary}</span>
          )}
          <ChevronDown
            size={15}
            style={{
              color: 'var(--ink-dim)',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform var(--t-fast) var(--ease-out)',
            }}
          />
        </span>
      </button>

      {open && (
        <div className="flex flex-col" style={{ padding: '0 18px 16px', gap: 13 }}>
          {children}
        </div>
      )}
    </section>
  )
}
