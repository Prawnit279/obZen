/**
 * Renaming the profile.
 *
 * The bug this pins: the field was bound straight to the store, which rejected
 * a blank name. Deleting the last character therefore put the old name
 * straight back, mid-word, so there was no way to clear it and type a new one.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Settings from '@/pages/Settings'
import { useProfileSettingsStore, PROFILE_SETTINGS_DEFAULTS } from '@/store/useProfileSettingsStore'

beforeEach(() => {
  localStorage.clear()
  useProfileSettingsStore.setState({ ...PROFILE_SETTINGS_DEFAULTS })
})
afterEach(cleanup)

function openSettings() {
  render(<MemoryRouter><Settings /></MemoryRouter>)
  return screen.getByLabelText(/^name$/i) as HTMLInputElement
}

const storedName = () => useProfileSettingsStore.getState().name

describe('changing the profile name', () => {
  it('can be cleared completely and retyped', async () => {
    const user = userEvent.setup()
    const field = openSettings()
    expect(field.value).toBe(PROFILE_SETTINGS_DEFAULTS.name)

    await user.clear(field)
    // The field must actually be empty. It used to snap back on the keystroke
    // that emptied it, which is what made renaming impossible.
    expect(field.value).toBe('')

    await user.type(field, 'Sam')
    await user.tab()

    expect(field.value).toBe('Sam')
    expect(storedName()).toBe('Sam')
  })

  it('survives deleting one character at a time', async () => {
    const user = userEvent.setup()
    const field = openSettings()

    for (let i = 0; i < PROFILE_SETTINGS_DEFAULTS.name.length; i++) {
      await user.type(field, '{backspace}')
    }
    expect(field.value).toBe('')
  })

  it('does not store the name until the field is left', async () => {
    const user = userEvent.setup()
    const field = openSettings()
    await user.clear(field)
    await user.type(field, 'Sa')

    // Mid-word, the store still holds the old name — a half-typed name is not
    // a name, and every heading reads from the store.
    expect(storedName()).toBe(PROFILE_SETTINGS_DEFAULTS.name)
    await user.tab()
    expect(storedName()).toBe('Sa')
  })

  it('commits on Enter as well as on blur', async () => {
    const user = userEvent.setup()
    const field = openSettings()
    await user.clear(field)
    await user.type(field, 'Alex{enter}')
    expect(storedName()).toBe('Alex')
  })

  it('treats a cleared field left blank as no change', async () => {
    const user = userEvent.setup()
    const field = openSettings()
    useProfileSettingsStore.setState({ name: 'Sam' })

    await user.clear(field)
    await user.tab()

    // Not reset to the config name — back to the name that was there.
    expect(storedName()).toBe('Sam')
    expect(field.value).toBe('Sam')
  })

  it('drops whitespace around the name', async () => {
    const user = userEvent.setup()
    const field = openSettings()
    await user.clear(field)
    await user.type(field, '  Sam  ')
    await user.tab()
    expect(storedName()).toBe('Sam')
  })

  it('keeps a name with spaces inside it', async () => {
    const user = userEvent.setup()
    const field = openSettings()
    await user.clear(field)
    await user.type(field, 'Anna Maria')
    await user.tab()
    expect(storedName()).toBe('Anna Maria')
  })
})
