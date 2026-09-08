import { useId } from 'react'

export const CARD = { background: 'var(--card)', border: '1px solid var(--border)' } as const
export const INPUT = { border: '1px solid var(--border)', color: 'var(--ink)' } as const

export function ToolCard({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--r-control)] p-4" style={CARD}>
      <h3 className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--ink-dim)' }}>{label}</h3>
      {sub && <p className="text-[12px] mt-0.5 mb-3" style={{ color: 'var(--ink-faint)' }}>{sub}</p>}
      {!sub && <div className="mb-3" />}
      {children}
    </section>
  )
}

export function NumberField({
  label, value, onChange, placeholder, suffix,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  suffix?: string
}) {
  // Without an id pairing the two, the visible label is decoration: assistive
  // tech announces an unnamed number box, and tapping the label does nothing.
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="text-[11px] uppercase tracking-widest block mb-1" style={{ color: 'var(--ink-dim)' }}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[var(--r-control)] px-3 py-2 text-[15px] bg-transparent focus:outline-none"
          style={INPUT}
        />
        {suffix && <span className="text-[12px] shrink-0" style={{ color: 'var(--ink-dim)' }}>{suffix}</span>}
      </div>
    </div>
  )
}

/** Free-text field — for labels like a lift name, which is not a number. */
export function TextField({
  label, value, onChange, placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="text-[11px] uppercase tracking-widest block mb-1" style={{ color: 'var(--ink-dim)' }}>{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[var(--r-control)] px-3 py-2 text-[15px] bg-transparent focus:outline-none"
        style={INPUT}
      />
    </div>
  )
}

/** Tells the user what still needs filling in, instead of rendering nothing. */
export function AwaitingInput({ need }: { need: string }) {
  return (
    <p className="text-[13px] mt-3" style={{ color: 'var(--ink-faint)' }}>
      Enter {need} to see results.
    </p>
  )
}
