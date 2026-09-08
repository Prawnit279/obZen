import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PROFILES } from '@/config/profiles'
import { useProfileStore } from '@/store/useProfileStore'
import { WorkoutProgress } from '@/components/modules/workout/progress/WorkoutProgress'

/** Deep-linkable Progress view — the same panel the Train tab renders. */
export default function Progress() {
  const navigate = useNavigate()
  const { activeId } = useProfileStore()

  return (
    <div className="page-container wide space-y-4">
      <button
        onClick={() => navigate('/workout')}
        className="flex items-center gap-1.5 text-[12px] uppercase tracking-widest transition-opacity hover:opacity-70"
        style={{ color: 'var(--muted)' }}
      >
        <ArrowLeft size={14} /> Train
      </button>

      <div className="pt-1">
        <div className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          {PROFILES[activeId].name}
        </div>
        <h1 className="text-[20px] uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
          Progress
        </h1>
      </div>

      <WorkoutProgress />
    </div>
  )
}
