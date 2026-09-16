/**
 * Where an unmatched route lands.
 *
 * Hiding a module leaves its path behind in bookmarks, history and whatever the
 * PWA restores on launch. Without a catch-all those paths rendered the shell
 * with nothing inside it — indistinguishable from a load that failed.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'

afterEach(cleanup)

function at(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

/** Home is the only screen with the check-in prompt on it. */
const onHome = () => screen.findByText(/log today's check-in/i)

describe('unmatched routes', () => {
  it('sends a hidden module’s route Home rather than rendering nothing', async () => {
    at('/drum')
    expect(await onHome()).toBeInTheDocument()
  })

  it('does the same for every other hidden module', async () => {
    for (const path of ['/yoga', '/nutrition', '/vedic']) {
      at(path)
      expect(await onHome()).toBeInTheDocument()
      cleanup()
    }
  })

  it('sends a typo Home too', async () => {
    at('/wrokout')
    expect(await onHome()).toBeInTheDocument()
  })

  it('still renders the routes that do exist', async () => {
    at('/settings')
    await waitFor(() => expect(screen.getByText(/preferences/i)).toBeInTheDocument())
  })
})
