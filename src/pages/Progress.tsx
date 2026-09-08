import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { PROFILES } from '@/config/profiles'
import { useProfileStore } from '@/store/useProfileStore'
import { WorkoutProgress } from '@/components/modules/workout/progress/WorkoutProgress'

/** Long-form date for the printed masthead, e.g. '8 September 2026'. */
function printedOn(): string {
  return new Date().toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

/** Deep-linkable Progress view — the same panel the Train tab renders. */
export default function Progress() {
  const navigate = useNavigate()
  const { activeId } = useProfileStore()

  return (
    <div className="page-container wide space-y-4">
      <button
        onClick={() => navigate('/workout')}
        className="print-hide flex items-center gap-1.5 text-[12px] uppercase tracking-widest transition-opacity hover:opacity-70"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft size={14} /> Train
      </button>

      <div className="flex items-end justify-between gap-3 pt-1">
        <div>
          <div className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            {PROFILES[activeId].name}
          </div>
          <h1 className="text-[20px] uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
            Progress
          </h1>
        </div>

        {/* The browser's own print dialog saves a PDF with selectable text, so
            this needs a print layout rather than a PDF library. */}
        <button
          onClick={() => window.print()}
          className="print-hide flex items-center gap-1.5 shrink-0 text-[11px] uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ color: 'var(--ink-dim)' }}
        >
          <Printer size={13} /> Print
        </button>
      </div>

      {/* A printed page arrives with no context of its own — whose numbers
          these are, and when they were true. */}
      <div className="print-only" style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          obZen — training log
        </div>
        <div style={{ fontSize: 12 }}>
          {PROFILES[activeId].name} · printed {printedOn()}
        </div>
      </div>

      <WorkoutProgress />
    </div>
  )
}
