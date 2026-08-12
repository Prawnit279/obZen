import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import { applyStoredTheme } from './store/useThemeStore'
import { requestPersistentStorage } from './lib/storage'

// Apply saved theme before first paint — prevents flash
applyStoredTheme()

// Ask the browser not to evict our IndexedDB/localStorage. Fire-and-forget:
// nothing blocks on the answer, and the app works either way.
void requestPersistentStorage()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>
)
