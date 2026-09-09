import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Go back to wherever the user actually came from, with a way out when there
 * is no "back".
 *
 * A plain `navigate(-1)` is right almost always and wrong in the one case that
 * matters most here: the app is installed to a home screen, so it is regularly
 * opened straight onto a deep link. Stepping back from the first page of a
 * session leaves the app entirely — on an installed PWA that looks like a
 * crash. React Router keeps an index on the history entry it owns; at zero
 * there is nothing of ours behind us, and the fallback is used instead.
 */
export function useGoBack(fallback: string): () => void {
  const navigate = useNavigate()

  return useCallback(() => {
    // `idx` is React Router's own counter on the history entry. Absent means a
    // history this router never wrote, which is equally not ours to step into.
    const idx = (window.history.state as { idx?: number } | null)?.idx
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1)
    } else {
      navigate(fallback, { replace: true })
    }
  }, [navigate, fallback])
}
