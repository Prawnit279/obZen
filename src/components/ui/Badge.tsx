import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'accent' | 'red' | 'dim'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'border-noir-strong text-noir-muted',
  accent: 'border-noir-dim text-noir-accent',
  red: 'border-noir-red text-noir-red',
  dim: 'border-noir-border text-noir-dim',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest border rounded-[2px]',
        badgeVariants[variant],
        className
      )}
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
