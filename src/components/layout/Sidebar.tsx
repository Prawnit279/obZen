import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Dumbbell,
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

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/workout', label: 'Workout', icon: Dumbbell },
  { path: '/drum', label: 'Drum Studio', icon: Music2 },
  { path: '/yoga', label: 'Yoga', icon: PersonStanding },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/meetings', label: 'Meetings', icon: Users },
  { path: '/ayurveda', label: 'Ayurveda', icon: Flame },
  { path: '/vedic', label: 'Vedic', icon: Star },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-52 bg-noir-surface border-r border-noir-border min-h-screen shrink-0">
      <div className="px-4 py-5 border-b border-noir-border">
        <span className="text-[11px] uppercase tracking-[0.2em] text-noir-white font-medium">Obzen</span>
        <div className="text-[9px] uppercase tracking-widest text-noir-dim mt-0.5">Pronit's OS</div>
      </div>
      <nav className="flex flex-col flex-1 py-2" aria-label="Main navigation">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-2.5 text-[11px] uppercase tracking-widest transition-colors',
              isActive
                ? 'text-noir-white bg-noir-elevated border-l border-noir-accent'
                : 'text-noir-dim hover:text-noir-accent hover:bg-noir-elevated/50 border-l border-transparent'
            )}
          >
            <Icon size={14} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-noir-border">
        <div className="text-[9px] uppercase tracking-widest text-noir-dim">v1.0.0</div>
      </div>
    </aside>
  )
}
