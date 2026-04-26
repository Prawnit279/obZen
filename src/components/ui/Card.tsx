import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
  noPadding?: boolean
}

export function Card({ children, elevated, noPadding, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'border border-noir-border rounded-[2px]',
        elevated ? 'bg-noir-elevated' : 'bg-noir-surface',
        !noPadding && 'p-4',
        className
      )}
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

export function CardHeader({ label, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <span className="text-[10px] uppercase tracking-widest text-noir-muted">{label}</span>
      {action}
    </div>
  )
}
