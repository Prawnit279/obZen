import { execSync } from 'child_process'

/**
 * Which build this is, stamped into the bundle at compile time.
 *
 * Shared by `vite.config.ts` and `vitest.config.ts` rather than written in
 * both: a `define` that exists for the build and not for the tests fails only
 * at render time, in whichever component happens to read it, which is how this
 * was first noticed.
 *
 * The version string used to be a hardcoded `1.0.0` in two places, which
 * answers nothing — an installed PWA serving a week-old cached build said
 * exactly the same as a fresh one, so "am I seeing the latest?" could not be
 * answered from inside the app.
 */
export function buildDefines(): Record<string, string> {
  let id = 'unknown'
  try {
    id = execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    // Building outside a checkout is legitimate; saying so beats a wrong sha.
  }
  return {
    __BUILD_ID__: JSON.stringify(id),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  }
}
