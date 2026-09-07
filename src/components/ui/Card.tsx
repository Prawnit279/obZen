import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** The one card that leads a screen. Takes the violet-cast surface. */
  elevated?: boolean
  noPadding?: boolean
}

/**
 * Two variants only. Depth comes from the gradient surface and a hairline
 * border, never from a drop shadow — the accent variant is reserved for the
 * single card that leads a screen, so it keeps meaning something.
 */
export function Card({ children, elevated, noPadding, className, style, ...props }: CardProps) {
  return (
    <div
      className={cn('flex flex-col', className)}
      style={{
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-card)',
        background: elevated ? 'var(--card-accent)' : 'var(--card)',
        padding: noPadding ? undefined : '16px 18px',
        gap: noPadding ? undefined : 13,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  label: string
  action?: ReactNode
  className?: string
}

/** Section label. The figure beneath it carries the hierarchy, not this. */
export function CardHeader({ label, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span
        className="uppercase"
        style={{
          fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)',
        }}
      >
        {label}
      </span>
      {action}
    </div>
  )
}
