import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'default' | 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  default: 'border-noir-border text-noir-accent hover:border-noir-strong hover:text-noir-white bg-transparent',
  primary: 'border-noir-accent text-noir-bg bg-noir-accent hover:bg-noir-white hover:border-noir-white',
  ghost: 'border-transparent text-noir-muted hover:text-noir-accent bg-transparent',
  danger: 'border-noir-red text-noir-red hover:bg-noir-red hover:text-noir-white bg-transparent',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-2 py-1 text-[10px]',
  md: 'px-3 py-1.5 text-[12px]',
  lg: 'px-4 py-2 text-[13px]',
}

export function Button({
  variant = 'default',
  size = 'md',
  children,
  fullWidth,
  className,
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'border rounded-[2px] uppercase tracking-widest font-normal transition-colors duration-150 cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
