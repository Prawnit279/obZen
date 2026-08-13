export const CARD = { background: 'var(--surface)', border: '1px solid var(--border)' } as const
export const INPUT = { border: '1px solid var(--border)', color: 'var(--accent)' } as const

export function ToolCard({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2px] p-4" style={CARD}>
      <h3 className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>{label}</h3>
      {sub && <p className="text-[12px] mt-0.5 mb-3" style={{ color: 'var(--dim)' }}>{sub}</p>}
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
  return (
    <div>
      <label className="text-[11px] uppercase tracking-widest block mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[2px] px-3 py-2 text-[15px] bg-transparent focus:outline-none"
          style={INPUT}
        />
        {suffix && <span className="text-[12px] shrink-0" style={{ color: 'var(--muted)' }}>{suffix}</span>}
      </div>
    </div>
  )
}

export function SegmentedToggle<T extends string | number>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex border rounded-[2px] overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      {options.map(opt => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className="flex-1 py-2 text-[11px] uppercase tracking-widest transition-colors"
          style={{
            background: value === opt.value ? 'var(--elevated)' : 'transparent',
            color: value === opt.value ? 'var(--accent)' : 'var(--dim)',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
