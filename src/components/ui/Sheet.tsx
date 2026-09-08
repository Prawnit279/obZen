import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Props {
  /** Sheet title. Rendered as the dialog's accessible name. */
  title: ReactNode
  /** Optional line under the title — a prescription, a date, a count. */
  subtitle?: ReactNode
  /** Extra controls in the header, left of the close button. */
  action?: ReactNode
  /**
   * Content pinned between the header and the scrolling body — a tab strip or
   * a search field, which should stay put rather than scroll away with the
   * list it filters.
   */
  pinned?: ReactNode
  onClose: () => void
  children: ReactNode
  /** How tall the panel may grow. Defaults to most of the screen. */
  maxHeight?: string
  /** Drop the built-in padding when the body manages its own. */
  noPadding?: boolean
  className?: string
}

/**
 * The app's bottom sheet: a panel that rises from the bottom edge over a dimmed
 * page, for a list or anything with actions of its own.
 *
 * The body is the only scrolling region and carries `min-height: 0`, because a
 * flex child will not shrink below its content without it — the failure mode is
 * silent, clipping whatever sits at the bottom with no scrollbar to hint at it.
 *
 * Escape closes, and focus moves into the panel on open so a keyboard user is
 * not left behind on the page underneath.
 */
export function Sheet({
  title, subtitle, action, pinned, onClose, children,
  maxHeight = '88vh', noPadding, className,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(6,5,10,0.68)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn('flex flex-col focus:outline-none', className)}
        style={{
          maxHeight,
          borderRadius: '26px 26px 0 0',
          borderTop: '1px solid rgba(167,139,250,0.22)',
          background: 'linear-gradient(170deg, #191428 0%, #0D0B14 100%)',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Grab handle — the affordance that says this panel is a sheet. */}
        <div
          aria-hidden="true"
          style={{
            width: 38, height: 4, borderRadius: 2, margin: '10px auto 2px',
            background: 'rgba(255,255,255,0.18)', flexShrink: 0,
          }}
        />

        <header
          className="flex items-start justify-between gap-3 px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--hairline)' }}
        >
          <div className="min-w-0">
            <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              {title}
            </h2>
            {subtitle && (
              <p
                className="uppercase"
                style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--ink-dim)', marginTop: 2 }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {action}
            <button onClick={onClose} aria-label="Close">
              <X size={18} style={{ color: 'var(--ink-faint)' }} />
            </button>
          </div>
        </header>

        {pinned && <div className="shrink-0">{pinned}</div>}

        <div
          className={cn('flex-1 overflow-y-auto', !noPadding && 'p-4')}
          style={{ minHeight: 0 }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
