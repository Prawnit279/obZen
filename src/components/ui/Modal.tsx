import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({ open, onClose, title, children, className, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-noir-bg/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full bg-noir-surface border border-noir-border rounded-t-[2px] md:rounded-[2px]',
          'max-h-[90vh] overflow-y-auto',
          sizeClasses[size],
          'mx-auto',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-noir-border">
            <span className="text-[11px] uppercase tracking-widest text-noir-accent">{title}</span>
            <button
              onClick={onClose}
              className="text-noir-muted hover:text-noir-accent transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
