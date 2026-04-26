import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-[10px] uppercase tracking-widest text-noir-muted">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'bg-noir-surface border border-noir-border rounded-[2px] px-3 py-2',
          'text-[13px] text-noir-accent placeholder:text-noir-dim',
          'focus:outline-none focus:border-noir-strong transition-colors duration-150 w-full',
          error && 'border-noir-red',
          className
        )}
        {...props}
      />
      {error && <span className="text-[11px] text-noir-red">{error}</span>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-[10px] uppercase tracking-widest text-noir-muted">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'bg-noir-surface border border-noir-border rounded-[2px] px-3 py-2',
          'text-[13px] text-noir-accent placeholder:text-noir-dim resize-none',
          'focus:outline-none focus:border-noir-strong transition-colors duration-150 w-full',
          error && 'border-noir-red',
          className
        )}
        {...props}
      />
      {error && <span className="text-[11px] text-noir-red">{error}</span>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  error?: string
}

export function Select({ label, options, error, className, id, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-[10px] uppercase tracking-widest text-noir-muted">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'bg-noir-surface border border-noir-border rounded-[2px] px-3 py-2',
          'text-[13px] text-noir-accent',
          'focus:outline-none focus:border-noir-strong transition-colors duration-150 w-full',
          error && 'border-noir-red',
          className
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-noir-surface">
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[11px] text-noir-red">{error}</span>}
    </div>
  )
}
