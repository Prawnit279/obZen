import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'accent' | 'red' | 'dim'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const badgeVariants: Record<BadgeVariant, { border: string; color: string }> = {
  default: { border: 'rgba(255,255,255,0.13)', color: 'var(--ink-dim)' },
  accent:  { border: 'rgba(167,139,250,0.34)', color: 'var(--violet-100)' },
  red:     { border: 'rgba(248,113,113,0.38)', color: 'var(--red)' },
  dim:     { border: 'var(--hairline)',        color: 'var(--ink-faint)' },
}

/** Pill, at the label size floor — 11px is the smallest text the system uses. */
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const v = badgeVariants[variant]
  return (
    <span
      className={cn('inline-flex items-center uppercase', className)}
      style={{
        padding: '3px 10px',
        borderRadius: 'var(--r-pill)',
        border: `1px solid ${v.border}`,
        color: v.color,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.08em',
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  )
}

interface DifficultyBadgeProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <Badge
      variant={
        difficulty === 'beginner' ? 'dim' :
        difficulty === 'intermediate' ? 'accent' :
        'red'
      }
    >
      {difficulty}
    </Badge>
  )
}
