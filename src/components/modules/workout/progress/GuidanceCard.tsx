import { AlertTriangle, Lightbulb, Info } from 'lucide-react'
import type { Tip, TipTone } from '@/lib/guidance'
import { Card } from '@/components/ui/Card'

interface Props {
  tips: Tip[]
}

const ICON: Record<TipTone, typeof Info> = {
  watch: AlertTriangle,
  suggest: Lightbulb,
  note: Info,
}

/**
 * Tone carries meaning here rather than decoration: `watch` is the only one
 * that takes the warm colour, so it keeps meaning something. `suggest` takes
 * the accent and `note` stays in the dim ink the rest of the card uses — a
 * screen where everything is highlighted highlights nothing.
 *
 * `--skip-text` is the app's existing negative signal — the danger button and
 * the warning icons already use it — rather than a new token. A new one would
 * have to be defined for every theme, and a theme that missed it would fall
 * back silently to the base ramp's colour, which is the failure this palette is
 * most prone to.
 */
const COLOR: Record<TipTone, string> = {
  watch: 'var(--skip-text)',
  suggest: 'var(--accent)',
  note: 'var(--ink-faint)',
}

/**
 * What is worth knowing about the training, read from what is already recorded.
 *
 * Absent entirely when there is nothing to say, which is the usual state and
 * the intended one. A card that always has advice is a card that has learned to
 * fill itself, and the reader stops believing the times it is right.
 */
export function GuidanceCard({ tips }: Props) {
  if (tips.length === 0) return null

  return (
    <Card label="Worth knowing">
      {tips.map((tip, i) => {
        const Icon = ICON[tip.tone]
        return (
          <div
            key={tip.id}
            style={{
              display: 'flex', gap: 10,
              paddingTop: i === 0 ? 0 : 12,
              borderTop: i === 0 ? undefined : '1px solid var(--hairline-soft)',
            }}
          >
            <Icon
              size={15}
              aria-hidden
              style={{ flexShrink: 0, marginTop: 3, color: COLOR[tip.tone] }}
            />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-2)' }}>
                {tip.headline}
              </p>
              <p style={{ fontSize: 'var(--text-md)', color: 'var(--ink-dim)', marginTop: 3 }}>
                {tip.action}
              </p>
              {/* Every tip says what it read. Without it these are assertions,
                  and an assertion you cannot check is one you cannot argue
                  with — which is the wrong relationship to have with a number
                  about your own training. */}
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)', marginTop: 4 }}>
                {tip.basis}
              </p>
            </div>
          </div>
        )
      })}
    </Card>
  )
}
