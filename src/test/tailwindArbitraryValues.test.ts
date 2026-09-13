import { describe, it, expect } from 'vitest'

/**
 * Tailwind arbitrary values must not contain raw spaces — whitespace has to be
 * written `_`. A space makes Tailwind skip the candidate entirely: no class is
 * generated, no error is raised, and the element simply renders without that
 * style.
 *
 * This exists because a mechanical sweep turned `rgba(124,58,237,0.42)` into
 * `rgb(var(--accent-rgb) / 0.42)` inside `shadow-[...]`, and the primary
 * button silently lost its shadow in every theme. Nothing caught it: the types
 * were fine, the tests were fine, the build was fine, and the class was simply
 * absent from the output CSS.
 *
 * Sources are read through `import.meta.glob` rather than `node:fs` — this repo
 * has no `@types/node`, and `npm run build` runs `tsc` first, so a node import
 * here would fail the build rather than guard it.
 */

const SOURCES = import.meta.glob('../**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** `shadow-[...]`, `text-[...]`, `w-[...]` — a utility with a bracketed value. */
const ARBITRARY = /[\w-]+-\[[^\]\n]*\]/g

describe('tailwind arbitrary values', () => {
  it('reads the component sources it is meant to be checking', () => {
    // A glob that silently matched nothing would make the assertion below
    // vacuous — the same shape of failure this file exists to catch.
    expect(Object.keys(SOURCES).length).toBeGreaterThan(20)
  })

  it('contain no raw spaces, which silently drop the whole class', () => {
    const offenders: string[] = []

    for (const [path, source] of Object.entries(SOURCES)) {
      source.split('\n').forEach((line, i) => {
        for (const match of line.match(ARBITRARY) ?? []) {
          if (/\s/.test(match)) offenders.push(`${path}:${i + 1}  ${match}`)
        }
      })
    }

    expect(offenders, `use _ instead of a space:\n${offenders.join('\n')}`).toEqual([])
  })
})
