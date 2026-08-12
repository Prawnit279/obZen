import { describe, it, expect, afterEach, vi } from 'vitest'
import { requestPersistentStorage } from '@/lib/storage'

/** Install a fake navigator.storage for one test. */
function stubStorage(impl: Partial<StorageManager> | undefined) {
  vi.stubGlobal('navigator', { ...navigator, storage: impl })
}

afterEach(() => vi.unstubAllGlobals())

describe('requestPersistentStorage', () => {
  it('requests persistence when not yet granted', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    stubStorage({ persisted: vi.fn().mockResolvedValue(false), persist } as Partial<StorageManager>)

    await expect(requestPersistentStorage()).resolves.toBe(true)
    expect(persist).toHaveBeenCalledOnce()
  })

  it('does not re-prompt when the browser already granted it', async () => {
    const persist = vi.fn()
    stubStorage({ persisted: vi.fn().mockResolvedValue(true), persist } as Partial<StorageManager>)

    await expect(requestPersistentStorage()).resolves.toBe(true)
    expect(persist).not.toHaveBeenCalled()
  })

  it('reports false when the browser declines', async () => {
    stubStorage({
      persisted: vi.fn().mockResolvedValue(false),
      persist: vi.fn().mockResolvedValue(false),
    } as Partial<StorageManager>)

    await expect(requestPersistentStorage()).resolves.toBe(false)
  })

  it('returns false when the Storage API is unavailable', async () => {
    stubStorage(undefined)
    await expect(requestPersistentStorage()).resolves.toBe(false)
  })

  it('swallows errors (e.g. private browsing) rather than breaking startup', async () => {
    stubStorage({
      persisted: vi.fn().mockRejectedValue(new Error('blocked')),
      persist: vi.fn(),
    } as Partial<StorageManager>)

    await expect(requestPersistentStorage()).resolves.toBe(false)
  })
})
