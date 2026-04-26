import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Dumbbell,
  Music2,
  CalendarDays,
  UtensilsCrossed,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIMARY_NAV = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/workout', label: 'Train', icon: Dumbbell },
  { path: '/drum', label: 'Drum', icon: Music2 },
  { path: '/calendar', label: 'Cal', icon: CalendarDays },
  { path: '/nutrition', label: 'Food', icon: UtensilsCrossed },
  { path: '/more', label: 'More', icon: MoreHorizontal },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-noir-bg border-t border-noir-border md:hidden"
      aria-label="Main navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {PRIMARY_NAV.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/'
            ? pathname === '/'
            : pathname.startsWith(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors',
                isActive ? 'text-noir-white' : 'text-noir-dim hover:text-noir-muted'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] uppercase tracking-widest">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
