import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useGoBack } from '@/hooks/useGoBack'

const navigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

function BackButton({ fallback }: { fallback: string }) {
  const goBack = useGoBack(fallback)
  return <button onClick={goBack}>Back</button>
}

/** Put React Router's history index where a given situation would leave it. */
function historyAt(idx: number | undefined) {
  window.history.replaceState(idx === undefined ? {} : { idx }, '', '/')
}

beforeEach(() => navigate.mockClear())
afterEach(cleanup)

describe('useGoBack', () => {
  it('steps back when there is somewhere of ours to step back to', async () => {
    historyAt(2)
    render(<MemoryRouter><BackButton fallback="/workout" /></MemoryRouter>)
    await userEvent.click(screen.getByText('Back'))

    expect(navigate).toHaveBeenCalledWith(-1)
  })

  it('uses the fallback on the first entry, rather than leaving the app', async () => {
    // Opened straight onto a deep link — an installed shortcut does this every
    // time. Stepping back from here exits, which on a home-screen app reads as
    // a crash.
    historyAt(0)
    render(<MemoryRouter><BackButton fallback="/workout" /></MemoryRouter>)
    await userEvent.click(screen.getByText('Back'))

    expect(navigate).toHaveBeenCalledWith('/workout', { replace: true })
  })

  it('uses the fallback when the history entry is not ours at all', async () => {
    historyAt(undefined)
    render(<MemoryRouter><BackButton fallback="/workout/tools" /></MemoryRouter>)
    await userEvent.click(screen.getByText('Back'))

    expect(navigate).toHaveBeenCalledWith('/workout/tools', { replace: true })
  })

  it('replaces rather than pushes, so back does not bounce', async () => {
    // Pushing the fallback would leave the deep-linked page behind it, and the
    // next press would land right back where it started.
    historyAt(0)
    render(<MemoryRouter><BackButton fallback="/workout" /></MemoryRouter>)
    await userEvent.click(screen.getByText('Back'))

    expect(navigate.mock.calls[0][1]).toEqual({ replace: true })
  })

  it('honours whatever fallback it was given', async () => {
    historyAt(0)
    render(<MemoryRouter><BackButton fallback="/workout?tab=history" /></MemoryRouter>)
    await userEvent.click(screen.getByText('Back'))

    expect(navigate).toHaveBeenCalledWith('/workout?tab=history', { replace: true })
  })
})
