import { useGoBack } from '@/hooks/useGoBack'
import { ArrowLeft } from 'lucide-react'
import { StrengthTools } from '@/components/modules/workout/tools/StrengthTools'

/** Deep-linkable Tools view — the same panel the Train tab renders. */
export default function Tools() {
  const goBack = useGoBack('/workout')

  return (
    <div className="page-container space-y-4">
      <button
        onClick={goBack}
        className="flex items-center gap-1.5 text-[12px] uppercase tracking-widest transition-opacity hover:opacity-70"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="pt-1">
        <div className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Lab</div>
        <h1 className="text-[20px] uppercase tracking-wide" style={{ color: 'var(--accent)' }}>Tools</h1>
      </div>

      <StrengthTools />
    </div>
  )
}
