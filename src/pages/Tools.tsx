import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { StrengthTools } from '@/components/modules/workout/tools/StrengthTools'

/** Deep-linkable Tools view — the same panel the Train tab renders. */
export default function Tools() {
  const navigate = useNavigate()

  return (
    <div className="page-container space-y-4">
      <button
        onClick={() => navigate('/workout')}
        className="flex items-center gap-1.5 text-[12px] uppercase tracking-widest transition-opacity hover:opacity-70"
        style={{ color: '#a6a6a6' }}
      >
        <ArrowLeft size={14} /> Train
      </button>

      <div className="pt-1">
        <div className="text-[11px] uppercase tracking-widest" style={{ color: '#a6a6a6' }}>Lab</div>
        <h1 className="text-[20px] uppercase tracking-wide" style={{ color: '#e2e2e2' }}>Tools</h1>
      </div>

      <StrengthTools />
    </div>
  )
}
