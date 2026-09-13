import { useNavigate } from 'react-router-dom'
import { PersonStanding, Flame, Star, FolderKanban, Users, Settings } from 'lucide-react'
import { SHOW_VEDIC, SHOW_YOGA } from '@/config/features'

const MORE_ITEMS = [
  { path: '/yoga', label: 'Yoga', sub: '30-day progression + sequences', icon: PersonStanding },
  { path: '/ayurveda', label: 'Ayurveda', sub: 'Pitta routine, remedies', icon: Flame },
  { path: '/vedic', label: 'Vedic Remedies', sub: 'Planetary practices', icon: Star },
  { path: '/projects', label: 'Projects', sub: 'Kanban boards', icon: FolderKanban },
  { path: '/meetings', label: 'Meetings', sub: 'Notes + action items', icon: Users },
  { path: '/settings', label: 'Settings', sub: 'Data, export, profile', icon: Settings },
].filter(item =>
  (SHOW_VEDIC || item.path !== '/vedic') &&
  (SHOW_YOGA || item.path !== '/yoga')
)

export default function More() {
  const navigate = useNavigate()

  return (
    <div className="page-container space-y-2">
      <div className="pt-2">
        <div
          className="uppercase"
          style={{ fontSize: 'var(--text-sm)', fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-dim)' }}
        >
          All Modules
        </div>
        <h1 style={{ fontSize: 'var(--text-6xl)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
          More
        </h1>
      </div>

      {MORE_ITEMS.map(({ path, label, sub, icon: Icon }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className="w-full flex items-center gap-4 text-left transition-colors"
          style={{
            padding: 16,
            borderRadius: 'var(--r-card)',
            border: '1px solid var(--hairline)',
            background: 'var(--card)',
          }}
        >
          <Icon size={18} style={{ color: 'var(--ink-faint)' }} className="shrink-0" strokeWidth={1.5} />
          <div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
            <div style={{ fontSize: 'var(--text-base)', color: 'var(--ink-dim)' }}>{sub}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
