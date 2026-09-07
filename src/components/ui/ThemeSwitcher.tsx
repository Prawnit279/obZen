import { useThemeStore, THEMES } from '@/store/useThemeStore'
import type { ThemeId } from '@/store/useThemeStore'
import { cn } from '@/lib/utils'

export function ThemeSwitcher() {
  const { activeTheme, setTheme } = useThemeStore()

  return (
    <div className="space-y-3">
      {/* No heading here — every caller already labels the section, and two
          "Appearance" headings stacked was the result. */}
      <div className="flex items-center gap-4 flex-wrap">
        {THEMES.map(theme => {
          const isActive = activeTheme === theme.id
          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id as ThemeId)}
              className={cn('flex flex-col items-center gap-1.5 transition-opacity', !isActive && 'hover:opacity-70')}
              aria-label={`Switch to ${theme.name} theme`}
              aria-pressed={isActive}
            >
              {/* Swatch circle */}
              <div
                className="flex items-center justify-center"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--r-pill)',
                  background: theme.dot,
                  border: `1px solid ${theme.borderActive}`,
                  boxShadow: isActive
                    ? `0 0 0 2px var(--bg), 0 0 0 3px ${theme.textActive}`
                    : 'none',
                }}
              >
                {/* Center dot */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 'var(--r-pill)',
                    background: theme.borderActive,
                    opacity: isActive ? 1 : 0.5,
                  }}
                />
              </div>

              {/* Label — only under active swatch */}
              <span
                className="uppercase"
                style={{
                  fontSize: 11, letterSpacing: '0.08em',
                  color: isActive ? 'var(--ink)' : 'var(--ink-faint)',
                }}
              >
                {theme.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
