import { useThemeStore, THEMES } from '@/store/useThemeStore'
import type { ThemeId, ThemeMeta } from '@/store/useThemeStore'
import { cn } from '@/lib/utils'

interface SwatchProps {
  theme: ThemeMeta
  isActive: boolean
  onSelect: (id: ThemeId) => void
}

function Swatch({ theme, isActive, onSelect }: SwatchProps) {
  return (
    <button
      onClick={() => onSelect(theme.id)}
      className={cn('flex flex-col items-center gap-1.5 transition-opacity', !isActive && 'hover:opacity-70')}
      // Four families exist in both modes, so the name alone does not identify
      // the theme.
      aria-label={`Switch to ${theme.name} ${theme.mode} theme`}
      aria-pressed={isActive}
    >
      {/* Swatch circle — the ground it paints, ringed and dotted in its accent */}
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

      <span
        className="uppercase"
        style={{
          fontSize: 'var(--text-sm)', letterSpacing: '0.08em',
          color: isActive ? 'var(--ink)' : 'var(--ink-faint)',
        }}
      >
        {theme.name}
      </span>
    </button>
  )
}

const GROUPS: { mode: ThemeMeta['mode']; label: string }[] = [
  { mode: 'dark', label: 'Dark' },
  { mode: 'light', label: 'Light' },
]

export function ThemeSwitcher() {
  const { activeTheme, setTheme } = useThemeStore()

  return (
    /* No heading here — every caller already labels the section, and two
       "Appearance" headings stacked was the result. The mode headings below sit
       inside that section: fourteen swatches in one row read as a soup, and
       four of the names appear twice, once per mode. */
    <div className="space-y-4">
      {GROUPS.map(group => (
        <div key={group.mode} className="space-y-2">
          <div
            className="uppercase"
            style={{
              fontSize: 'var(--text-2xs)', letterSpacing: '0.14em',
              color: 'var(--ink-off)',
            }}
          >
            {group.label}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {THEMES.filter(t => t.mode === group.mode).map(theme => (
              <Swatch
                key={theme.id}
                theme={theme}
                isActive={activeTheme === theme.id}
                onSelect={setTheme}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
