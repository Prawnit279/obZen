/**
 * `--accent` is not the accent colour.
 *
 * It is a legacy noircut alias, declared in `globals.css` as
 * `--accent: var(--ink)` — the primary *text* colour — and marked there as
 * something to remove as screens migrate. Reading the name rather than the
 * declaration is an easy mistake and a silent one: on a dark theme `--ink` is
 * near-white, so a button filled with it and labelled `--on-accent` (white)
 * renders white on white. Nothing errors, nothing logs, and the type checker
 * has no opinion about CSS custom properties.
 *
 * It happened twice — the "Start this block" and "Create circuit" buttons were
 * both illegible in every theme — plus once more on the questionnaire's
 * progress bar, which merely came out the wrong colour. This pins the fix.
 *
 * The real accent fills are the two gradients: `violet-200 → violet-700` with
 * dark text (the `primary` Button variant) and `violet-400 → violet-900` with
 * `--on-accent` white text (SegmentedPill, WeightGoalPicker).
 */
import { describe, it, expect } from 'vitest'

const SOURCES = import.meta.glob('../**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const CSS = import.meta.glob('../styles/globals.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * A background whose value mentions the alias, in any of the spellings the
 * codebase uses — including the ternary form a plain grep for
 * `background: 'var(--accent)'` misses, which is how the second of the two
 * broken buttons escaped the first sweep.
 *
 * Scoped to backgrounds deliberately. `color: 'var(--accent)'` is all over the
 * Yoga screens and is harmless: it resolves to the ink colour, which is what
 * text should be anyway. It is only filling a surface with it that goes wrong.
 */
const AS_BACKGROUND = [
  /background(?:Color)?\s*:\s*[^,\n}]*var\(--accent\)/,
  /bg-\[color:var\(--accent\)\]/,
]

/**
 * Comments are stripped before matching. This file's own findings are written
 * up in comments beside the code they fixed, and a rule that cannot tell a
 * fill from a note about a fill would flag its own explanation.
 */
function code(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

describe('the legacy --accent alias', () => {
  it('reads the sources it is meant to be checking', () => {
    // A glob that silently matched nothing would make the rule below vacuous —
    // the same shape of failure this file exists to catch.
    expect(Object.keys(SOURCES).length).toBeGreaterThan(50)
  })

  it('is never painted as a background', () => {
    const offenders: string[] = []
    for (const [path, source] of Object.entries(SOURCES)) {
      if (path.includes('/test/')) continue
      const src = code(source)
      for (const pattern of AS_BACKGROUND) {
        if (pattern.test(src)) offenders.push(path)
      }
    }
    expect(
      offenders,
      `--accent resolves to var(--ink), the text colour. Filling with it and `
      + `labelling with --on-accent gives white on white. Use the primary `
      + `Button variant, or the violet-400 → violet-900 gradient.\n`
      + offenders.join('\n')
    ).toEqual([])
  })

  it.skip('would check the alias still resolves to ink, if it could read CSS', () => {
    // It cannot. Vitest hands stylesheets back as an empty string — `?raw` does
    // not apply to CSS under this config — and `node:fs` is unavailable here
    // for the reason given at the top of the file. Left skipped and explained
    // rather than deleted: the premise of the rule above is that
    // `--accent: var(--ink)`, and if that declaration is ever changed this
    // whole file should be reconsidered rather than silently kept.
    //
    // Written as a passing assertion it would have read an empty string and
    // succeeded against nothing, which is precisely the failure this suite
    // keeps catching elsewhere.
    expect(Object.values(CSS)[0]).toMatch(/--accent:\s*var\(--ink\);/)
  })
})
