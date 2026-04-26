import { cn } from '@/lib/utils'
import { clamp } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  showLabel?: boolean
  label?: string
  compact?: boolean
}

export function ProgressBar({ value, max, className, showLabel, label, compact }: ProgressBarProps) {
  const pct = max > 0 ? clamp(Math.round((value / max) * 100), 0, 100) : 0
  const over = value > max

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-[10px] uppercase tracking-widest text-noir-muted">{label}</span>}
          {showLabel && (
            <span className={cn('text-[11px]', over ? 'text-noir-red' : 'text-noir-muted')}>
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className={cn('bg-noir-border rounded-[1px] overflow-hidden', compact ? 'h-0.5' : 'h-1')}>
        <div
          className={cn(
            'h-full rounded-[1px] transition-all duration-300',
            over ? 'bg-noir-red' : 'bg-noir-accent'
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}
