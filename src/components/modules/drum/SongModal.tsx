import { useState } from 'react'
import type { Song } from '@/db/dexie'
import { addSong, updateSong } from '@/lib/drum'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  existing?: Song
  onClose: () => void
  onSaved: () => void
}

type Status = Song['status']
type Purpose = Song['purpose']

const STATUS_OPTIONS: Status[] = ['learning', 'ready', 'performed']
const PURPOSE_OPTIONS: Purpose[] = ['jam', 'recording', 'cover', 'original']

export function SongModal({ open, existing, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(existing?.title ?? '')
  const [artist, setArtist] = useState(existing?.artist ?? '')
  const [bpm, setBpm] = useState<string>(existing?.bpm?.toString() ?? '')
  const [timeSignature, setTimeSignature] = useState(existing?.timeSignature ?? '4/4')
  const [status, setStatus] = useState<Status>(existing?.status ?? 'learning')
  const [purpose, setPurpose] = useState<Purpose>(existing?.purpose ?? 'cover')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    const data = {
      title: title.trim(),
      artist: artist.trim(),
      bpm: bpm ? parseInt(bpm, 10) : undefined,
      timeSignature: timeSignature || undefined,
      status,
      purpose,
      notes: notes.trim() || undefined,
    }
    if (existing?.id != null) {
      await updateSong(existing.id, data)
    } else {
      await addSong(data)
    }
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Song' : 'Add Song'}>
      <div className="space-y-5">

        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-2">Title *</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Song title"
            className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] text-noir-accent placeholder:text-noir-dim focus:outline-none focus:border-noir-strong"
          />
          {error && <div className="text-[11px] text-noir-red mt-1">{error}</div>}
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-2">Artist</div>
          <input
            value={artist}
            onChange={e => setArtist(e.target.value)}
            placeholder="Artist / band"
            className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] text-noir-accent placeholder:text-noir-dim focus:outline-none focus:border-noir-strong"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-2">BPM</div>
            <input
              value={bpm}
              onChange={e => setBpm(e.target.value.replace(/\D/, ''))}
              placeholder="e.g. 120"
              className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] text-noir-accent placeholder:text-noir-dim focus:outline-none focus:border-noir-strong"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-2">Time Sig.</div>
            <select
              value={timeSignature}
              onChange={e => setTimeSignature(e.target.value)}
              className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] text-noir-accent focus:outline-none focus:border-noir-strong"
            >
              {['4/4', '3/4', '6/8', '5/4', '7/8', '12/8'].map(ts => (
                <option key={ts} value={ts}>{ts}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-2">Status</div>
          <div className="grid grid-cols-3 gap-1.5">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'py-2 border rounded-[2px] text-[10px] uppercase tracking-widest transition-colors',
                  status === s
                    ? 'border-noir-accent text-noir-white bg-noir-elevated'
                    : 'border-noir-border text-noir-dim hover:border-noir-strong'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-2">Purpose</div>
          <div className="grid grid-cols-4 gap-1.5">
            {PURPOSE_OPTIONS.map(p => (
              <button
                key={p}
                onClick={() => setPurpose(p)}
                className={cn(
                  'py-2 border rounded-[2px] text-[10px] uppercase tracking-widest transition-colors',
                  purpose === p
                    ? 'border-noir-accent text-noir-white bg-noir-elevated'
                    : 'border-noir-border text-noir-dim hover:border-noir-strong'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-noir-muted mb-2">Notes (optional)</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Key, difficulty, arrangement notes..."
            rows={2}
            className="w-full bg-noir-bg border border-noir-border rounded-[2px] px-3 py-2 text-[12px] text-noir-accent placeholder:text-noir-dim focus:outline-none focus:border-noir-strong resize-none"
          />
        </div>

        <Button variant="primary" fullWidth onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : existing ? 'Save Changes' : 'Add Song'}
        </Button>
      </div>
    </Modal>
  )
}
