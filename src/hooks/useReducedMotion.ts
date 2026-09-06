import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function prefersReduced(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(QUERY).matches
  )
}

/**
 * Whether the viewer has asked their OS to reduce motion.
 *
 * Read in JS rather than left to a stylesheet because the exercise figures
 * animate with SMIL, and SMIL ignores CSS: `display: none` on an <animate>
 * element computes to `none` and the animation keeps running regardless
 * (verified in Chrome — the animated value advances exactly as it does with
 * the rule absent). Skipping the elements is what actually stops them.
 *
 * CSS-animated figures — the yoga poses — are fine with `animation: none` in a
 * reduced-motion media query and do not need this.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReduced)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(QUERY)
    // The preference can have changed between first render and this effect.
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
