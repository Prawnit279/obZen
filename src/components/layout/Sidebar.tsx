import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  Music2,
  CalendarDays,
  UtensilsCrossed,
  FolderKanban,
  Users,
  Flame,
  Star,
  PersonStanding,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SHOW_NUTRITION, SHOW_VEDIC, SHOW_YOGA } from '@/config/features'

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/workout', label: 'Train', icon: Dumbbell },
  { path: '/workout/progress', label: 'Progress', icon: TrendingUp },
  { path: '/drum', label: 'Drums', icon: Music2 },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/nutrition', label: 'Food', icon: UtensilsCrossed },
  { path: '/yoga', label: 'Yoga', icon: PersonStanding },
  { path: '/ayurveda', label: 'Ayurveda', icon: Flame },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/meetings', label: 'Meetings', icon: Users },
  { path: '/vedic', label: 'Vedic', icon: Star },
  { path: '/settings', label: 'Settings', icon: Settings },
].filter(item =>
  (SHOW_NUTRITION || item.path !== '/nutrition') &&
  (SHOW_VEDIC || item.path !== '/vedic') &&
  (SHOW_YOGA || item.path !== '/yoga')
)

export function Sidebar() {
  return (
    <aside
      className="hidden md:flex flex-col w-52 min-h-screen shrink-0"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--hairline)' }}
    >
      <div className="px-4 py-5" style={{ borderBottom: '1px solid var(--hairline)' }}>
        <span
          className="uppercase"
          style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--ink)' }}
        >
          Obzen
        </span>
        {/* The app has two profiles; this used to read "Pronit's OS". */}
        <div
          className="uppercase"
          style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--ink-faint)', marginTop: 2 }}
        >
          Training log
        </div>
      </div>
      <nav className="flex flex-col flex-1 py-2" aria-label="Main navigation">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            // Train must not stay lit while Progress is open; Progress is
            // nested under /workout, so both need an exact match.
            end={path === '/' || path === '/workout'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-2.5 text-[11px] uppercase tracking-widest transition-colors border-l',
              isActive
                ? 'text-[color:var(--ink)] bg-white/[0.05] border-l-[color:var(--violet-400)]'
                : 'text-[color:var(--ink-faint)] hover:text-[color:var(--ink-2)] hover:bg-white/[0.03] border-l-transparent'
            )}
          >
            <Icon size={14} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--hairline)' }}>
        <div
          className="uppercase"
          style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--ink-ghost)' }}
        >
          v1.0.0
        </div>
      </div>
    </aside>
  )
}
