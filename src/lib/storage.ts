/**
 * Persistent-storage request.
 *
 * All of obZen's data lives in IndexedDB and localStorage, which browsers may
 * evict under storage pressure. iOS Safari is the sharp edge: it deletes
 * script-writable storage after 7 days without a visit unless the site is
 * installed to the Home Screen. `navigator.storage.persist()` asks the browser
 * to exempt this origin from that eviction.
 *
 * Called once at startup so the request happens regardless of which page the
 * user opens first. The browser decides — Chrome grants it on engagement
 * signals, Safari on Home Screen install — and once granted it stays granted,
 * so repeat calls are cheap and idempotent.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist || !navigator.storage?.persisted) return false
    // Don't re-prompt if the browser already granted it.
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    // Unsupported or blocked (e.g. private browsing) — the app still works,
    // the data is just evictable.
    return false
  }
}
