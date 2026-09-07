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

/**
 * `primary` is the one variant that fills — it takes the accent gradient and
 * should appear at most once per screen. Everything else is an outline on the
 * hairline, so a screen never reads as having several equal calls to action.
 */
const variantClasses: Record<Variant, string> = {
  default: 'border-[color:var(--hairline)] text-[color:var(--ink-2)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--ink)] bg-transparent',
  primary: 'border-transparent text-[#0A0810] bg-gradient-to-br from-[color:var(--violet-200)] to-[color:var(--violet-700)] shadow-[0_8px_26px_rgba(124,58,237,0.42)] active:scale-[0.98]',
  ghost: 'border-transparent text-[color:var(--ink-dim)] hover:text-[color:var(--ink)] bg-transparent',
  danger: 'border-[color:var(--skip-border)] text-[color:var(--skip-text)] hover:bg-[color:var(--skip-bg)] bg-transparent',
}

/** `sm` sits at the 11px floor rather than below it. */
const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[11px]',
  md: 'px-4 py-2 text-[12px]',
  lg: 'px-5 py-2.5 text-[13px]',
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
        'border rounded-[var(--r-control)] uppercase tracking-widest font-medium transition-all duration-150 cursor-pointer',
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
