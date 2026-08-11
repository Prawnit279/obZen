export const CARD = { background: '#161616', border: '1px solid #323232' } as const
export const INPUT = { border: '1px solid #323232', color: '#e2e2e2' } as const

export function ToolCard({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2px] p-4" style={CARD}>
      <h3 className="text-[11px] uppercase tracking-widest" style={{ color: '#a6a6a6' }}>{label}</h3>
      {sub && <p className="text-[12px] mt-0.5 mb-3" style={{ color: '#6f6f6f' }}>{sub}</p>}
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
      <label className="text-[11px] uppercase tracking-widest block mb-1" style={{ color: '#8a8a8a' }}>{label}</label>
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
        {suffix && <span className="text-[12px] shrink-0" style={{ color: '#8a8a8a' }}>{suffix}</span>}
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
    <div className="flex border rounded-[2px] overflow-hidden" style={{ borderColor: '#323232' }}>
      {options.map(opt => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className="flex-1 py-2 text-[11px] uppercase tracking-widest transition-colors"
          style={{
            background: value === opt.value ? '#252525' : 'transparent',
            color: value === opt.value ? '#e2e2e2' : '#6f6f6f',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
