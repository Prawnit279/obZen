/** The number tiles that head the Progress screen. */
export function Stat({ value, unit, label, sub, hero }: {
  value: string; unit?: string; label: string; sub?: string; hero?: boolean
}) {
  return (
    <div
      className="flex-1 min-w-[104px] flex flex-col"
      style={{
        gap: 6, padding: '14px 16px',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-card)',
        background: hero ? 'var(--card-accent)' : 'var(--card)',
      }}
    >
      <span
        className="uppercase"
        style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
      >
        {label}
      </span>
      <div className="flex items-baseline" style={{ gap: 5 }}>
        <span
          style={{
            fontSize: hero ? 36 : 22, fontWeight: 700,
            lineHeight: hero ? 0.9 : 1,
            letterSpacing: hero ? '-0.03em' : '-0.02em',
            color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {unit && <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-faint)' }}>{unit}</span>}
      </div>
      {sub && <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{sub}</span>}
    </div>
  )
}
