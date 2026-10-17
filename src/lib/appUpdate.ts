/**
 * Picking up a new build.
 *
 * `registerType: 'autoUpdate'` only means the new service worker takes control
 * without asking. It does not reload the page, and the page is what is running
 * the old JavaScript — so an installed PWA would fetch a new build in the
 * background and go on showing the previous one, in some cases for days. A
 * feature could ship, deploy green, be verified live in a browser, and still be
 * absent on the phone, with nothing anywhere saying why.
 *
 * Two things fix that, and both are needed:
 *
 * Reload when a new worker takes control. `clientsClaim` hands it the page
 * mid-session; without a reload the page keeps its old bundle until something
 * else happens to reload it. Guarded against looping, because `controllerchange`
 * also fires on the very first registration, when there is no old build to
 * replace and nothing to reload for.
 *
 * And ask, periodically. The browser checks for a new worker on navigation,
 * which an installed PWA resumed from the background may not do for a long
 * time. An hourly check costs one conditional request against a file that is
 * usually unchanged.
 */

/** How often a running app asks whether there is a newer build. */
export const UPDATE_CHECK_MS = 60 * 60 * 1000

interface Options {
  /** Swapped in tests. */
  navigator?: Pick<Navigator, 'serviceWorker'>
  reload?: () => void
  setInterval?: (fn: () => void, ms: number) => unknown
}

/**
 * Returns a cleanup function, so a caller that needs to stop watching can —
 * and so the test can.
 */
export function watchForUpdates(opts: Options = {}): () => void {
  const nav = opts.navigator ?? (typeof navigator !== 'undefined' ? navigator : undefined)
  const sw = nav?.serviceWorker
  if (!sw) return () => {}

  const reload = opts.reload ?? (() => window.location.reload())
  const every = opts.setInterval ?? ((fn, ms) => window.setInterval(fn, ms))

  // A page that was already controlled had a previous build; one that was not
  // is registering for the first time, and the controller it gains is for the
  // build it is already running.
  const hadController = sw.controller !== null
  let reloading = false

  const onControllerChange = () => {
    if (!hadController || reloading) return
    reloading = true
    reload()
  }
  sw.addEventListener('controllerchange', onControllerChange)

  const timer = every(() => {
    // `getRegistration` rather than a stored handle: the registration can be
    // replaced underneath a long-lived page.
    void sw.getRegistration?.()?.then(r => r?.update())
  }, UPDATE_CHECK_MS)

  return () => {
    sw.removeEventListener('controllerchange', onControllerChange)
    if (typeof timer === 'number') clearInterval(timer)
  }
}
