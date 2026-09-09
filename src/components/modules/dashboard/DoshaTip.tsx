import { Card } from '@/components/ui/Card'
import { useProfileSettingsStore } from '@/store/useProfileSettingsStore'
import { dailyTipFor, guidanceFor } from '@/data/doshas'
import { todayISO } from '@/lib/utils'

/**
 * One line of dosha guidance for today.
 *
 * Rotates by date rather than on render, so it is the same line all day — a tip
 * that changes every time the screen redraws is wallpaper, not advice.
 *
 * Framed as a suggestion throughout. This is a traditional system, and the card
 * says which type it is speaking to so the reader can weigh it rather than
 * receive it as a instruction from the app.
 */
export function DoshaTip() {
  const dosha = useProfileSettingsStore(s => s.dosha)
  const guidance = guidanceFor(dosha)
  const tip = dailyTipFor(dosha, todayISO())

  return (
    <Card label={`${guidance.dosha} today`}>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)' }}>{tip}</p>
      <p style={{ fontSize: 11, color: 'var(--ink-ghost)' }}>
        {guidance.training.bestTime} suits {guidance.dosha} training best.
      </p>
    </Card>
  )
}
