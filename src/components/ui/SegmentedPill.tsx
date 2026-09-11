import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string | number> {
  value: T
  label: string
}

interface Props<T extends string | number> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible name for the group as a whole, e.g. 'Train section'. */
  label: string
  /** Segments share the width equally. Off, they hug their labels. */
  grow?: boolean
  /** Let the strip scroll sideways when the segments will not fit. */
  scrollable?: boolean
  className?: string
}

/**
 * The app's one segmented control: a pill track with the selected segment on
 * the accent gradient.
 *
 * Selection is announced through `aria-pressed` rather than left to the
 * background colour, and the group carries a name, so which of several strips
 * on a screen you are in is never implied by position alone.
 */
export function SegmentedPill<T extends string | number>({
  options, value, onChange, label, grow, scrollable, className,
}: Props<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex', scrollable && 'overflow-x-auto', className)}
      style={{
        gap: 2,
        padding: 2,
        borderRadius: 'var(--r-pill)',
        background: 'rgba(255,255,255,0.05)',
        ...(scrollable ? { scrollbarWidth: 'none' as const } : {}),
      }}
    >
      {options.map(opt => {
        const on = opt.value === value
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            aria-pressed={on}
            className={cn(
              'transition-colors whitespace-nowrap',
              grow && 'flex-1'
            )}
            style={{
              // 10px, not 12: five segments at 375px need the four saved
              // pixels each to fit without the strip starting to scroll.
              padding: '6px 10px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 'var(--r-pill)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.03em',
              background: on
                ? 'linear-gradient(140deg, var(--violet-400), var(--violet-900))'
                : 'transparent',
              color: on ? 'var(--on-accent)' : 'var(--ink-faint)',
              boxShadow: on ? '0 2px 14px rgba(76,29,149,0.6)' : 'none',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
