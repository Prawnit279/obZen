import { useNavigate } from 'react-router-dom'
import { PersonStanding, Flame, Star, FolderKanban, Users, Settings } from 'lucide-react'

const MORE_ITEMS = [
  { path: '/yoga', label: 'Yoga', sub: '30-day progression + sequences', icon: PersonStanding },
  { path: '/ayurveda', label: 'Ayurveda', sub: 'Pitta routine, remedies', icon: Flame },
  { path: '/vedic', label: 'Vedic Remedies', sub: 'Planetary practices', icon: Star },
  { path: '/projects', label: 'Projects', sub: 'Kanban boards', icon: FolderKanban },
  { path: '/meetings', label: 'Meetings', sub: 'Notes + action items', icon: Users },
  { path: '/settings', label: 'Settings', sub: 'Data, export, profile', icon: Settings },
]

export default function More() {
  const navigate = useNavigate()

  return (
    <div className="page-container space-y-2">
      <div className="pt-2">
        <div className="text-[11px] uppercase tracking-widest text-noir-muted">All Modules</div>
        <div className="text-[18px] uppercase tracking-wide text-noir-white">More</div>
      </div>

      {MORE_ITEMS.map(({ path, label, sub, icon: Icon }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className="w-full flex items-center gap-4 p-4 border border-noir-border rounded-[2px] bg-noir-surface hover:border-noir-strong hover:bg-noir-elevated transition-colors text-left"
        >
          <Icon size={18} className="text-noir-dim shrink-0" strokeWidth={1.5} />
          <div>
            <div className="text-[13px] text-noir-accent">{label}</div>
            <div className="text-[11px] text-noir-dim">{sub}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
