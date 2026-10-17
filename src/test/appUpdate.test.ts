/**
 * Picking up a new build.
 *
 * `autoUpdate` means a new service worker takes control without asking — not
 * that the page running the old JavaScript ever reloads. An installed PWA
 * would fetch a new build in the background and keep showing the previous one,
 * which is how a feature came to be deployed, verified live in a browser, and
 * still absent on the phone.
 */
import { describe, it, expect, vi } from 'vitest'
import { watchForUpdates, UPDATE_CHECK_MS } from '@/lib/appUpdate'

/** A service worker container that can be driven by hand. */
function fakeSW(controller: object | null) {
  const listeners: Record<string, (() => void)[]> = {}
  const registration = { update: vi.fn() }
  return {
    container: {
      controller,
      addEventListener: (type: string, fn: () => void) => {
        (listeners[type] ??= []).push(fn)
      },
      removeEventListener: (type: string, fn: () => void) => {
        listeners[type] = (listeners[type] ?? []).filter(l => l !== fn)
      },
      getRegistration: () => Promise.resolve(registration),
    },
    fire: (type: string) => (listeners[type] ?? []).forEach(l => l()),
    listenerCount: (type: string) => (listeners[type] ?? []).length,
    registration,
  }
}

describe('watchForUpdates', () => {
  it('reloads when a new worker takes over a page that already had one', () => {
    const sw = fakeSW({})          // already controlled — there is an old build
    const reload = vi.fn()
    watchForUpdates({ navigator: { serviceWorker: sw.container } as never, reload, setInterval: () => 0 })

    sw.fire('controllerchange')
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('does not reload on the very first registration', () => {
    // `controllerchange` also fires when a page gains its first controller.
    // There is no previous build to replace, and reloading would be a pointless
    // flash on every first visit.
    const sw = fakeSW(null)
    const reload = vi.fn()
    watchForUpdates({ navigator: { serviceWorker: sw.container } as never, reload, setInterval: () => 0 })

    sw.fire('controllerchange')
    expect(reload).not.toHaveBeenCalled()
  })

  it('reloads once, however many times the event fires', () => {
    // A reload that triggers another `controllerchange` would loop.
    const sw = fakeSW({})
    const reload = vi.fn()
    watchForUpdates({ navigator: { serviceWorker: sw.container } as never, reload, setInterval: () => 0 })

    sw.fire('controllerchange')
    sw.fire('controllerchange')
    sw.fire('controllerchange')
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('asks for a newer worker on a timer', async () => {
    // The browser checks on navigation, which an installed app resumed from the
    // background may not do for days.
    const sw = fakeSW({})
    let tick: (() => void) | null = null
    watchForUpdates({
      navigator: { serviceWorker: sw.container } as never,
      reload: () => {},
      setInterval: (fn, ms) => { expect(ms).toBe(UPDATE_CHECK_MS); tick = fn; return 1 },
    })

    expect(tick).not.toBeNull()
    tick!()
    await Promise.resolve()
    await Promise.resolve()
    expect(sw.registration.update).toHaveBeenCalled()
  })

  it('stops watching when told to', () => {
    const sw = fakeSW({})
    const reload = vi.fn()
    const stop = watchForUpdates({
      navigator: { serviceWorker: sw.container } as never, reload, setInterval: () => 0,
    })

    stop()
    expect(sw.listenerCount('controllerchange')).toBe(0)
    sw.fire('controllerchange')
    expect(reload).not.toHaveBeenCalled()
  })

  it('does nothing at all where there is no service worker', () => {
    // Older browsers, and any non-secure context.
    expect(() => watchForUpdates({ navigator: {} as never })()).not.toThrow()
  })
})
