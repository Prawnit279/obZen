import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  Music2,
  CalendarDays,
  UtensilsCrossed,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SHOW_NUTRITION } from '@/config/features'

/**
 * One vocabulary, shared with the sidebar: a destination is called the same
 * thing whatever the screen width.
 */
const PRIMARY_NAV = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/workout', label: 'Train', icon: Dumbbell },
  { path: '/workout/progress', label: 'Progress', icon: TrendingUp },
  { path: '/drum', label: 'Drums', icon: Music2 },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/nutrition', label: 'Food', icon: UtensilsCrossed },
  { path: '/more', label: 'More', icon: MoreHorizontal },
].filter(item => SHOW_NUTRITION || item.path !== '/nutrition')

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--hairline)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch">
        {PRIMARY_NAV.map(({ path, label, icon: Icon }) => {
          // Exact match for Home, and for Progress — it lives under /workout,
          // so a prefix test would light Train at the same time.
          const isActive = path === '/' || path === '/workout/progress'
            ? pathname === path
            : path === '/workout'
              ? pathname === '/workout'
              : pathname.startsWith(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors min-w-0',
                isActive
                  ? 'text-[color:var(--violet-100)]'
                  : 'text-[color:var(--ink-faint)] hover:text-[color:var(--ink-dim)]'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span
                className="uppercase w-full text-center"
                style={{
                  fontSize: 11, letterSpacing: '0.04em',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
