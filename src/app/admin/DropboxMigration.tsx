'use client'
import { useEffect, useState } from 'react'

type Failure = { key: string; title: string; field: string; error: string }

// Admin banner: shows how many product images are still hotlinked from
// Dropbox (which throttles them, so visitors see broken thumbnails) and
// moves them to Supabase Storage in one click, batch by batch.
export default function DropboxMigration({ password }: { password: string }) {
  const [remaining, setRemaining] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [moved, setMoved] = useState(0)
  const [failures, setFailures] = useState<Failure[]>([])
  const [error, setError] = useState('')

  async function refresh() {
    try {
      const res = await fetch('/api/admin/migrate-images-to-storage', { headers: { 'x-admin-password': password } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not check images.')
      setRemaining(data.remainingImages ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not check images.')
    }
  }

  useEffect(() => { if (password) refresh() }, [password]) // eslint-disable-line react-hooks/exhaustive-deps

  async function run() {
    setRunning(true); setError(''); setMoved(0); setFailures([])
    const skip: string[] = []
    let total = 0
    try {
      for (let i = 0; i < 60; i++) {
        const res = await fetch('/api/admin/migrate-images-to-storage', {
          method: 'POST',
          headers: { 'x-admin-password': password, 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagesOnly: true, limit: 4, skip }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Migration failed (HTTP ${res.status}).`)
        total += data.migrated.length
        setMoved(total)
        for (const f of data.failed as Failure[]) { skip.push(f.key); setFailures(prev => [...prev, f]) }
        setRemaining(data.remainingDropboxFields)
        if (data.processedThisCall === 0) break
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Migration failed.')
    }
    setRunning(false)
    refresh()
  }

  if (remaining === null && !error) return null
  if (remaining === 0 && !running && failures.length === 0 && !error) {
    return <div className="dbx dbxDone">All product images are on Supabase Storage.{moved > 0 ? ` Moved ${moved} just now.` : ''}</div>
  }

  return (
    <div className="dbx">
      <div className="dbxRow">
        <div>
          <strong>{remaining} product image{remaining === 1 ? '' : 's'} still load from Dropbox.</strong>
          <span> Dropbox blocks these under traffic, so visitors see broken thumbnails. Move them to your own storage:</span>
        </div>
        <button type="button" className="dbxBtn" onClick={run} disabled={running}>
          {running ? `Moving… ${moved} done` : 'Move images off Dropbox'}
        </button>
      </div>
      {error && <p className="dbxErr">{error}</p>}
      {failures.length > 0 && (
        <div className="dbxFails">
          <p>{failures.length} couldn&apos;t be copied (Dropbox refused them). Re-upload these images in Edit product:</p>
          <ul>{failures.map(f => <li key={f.key}>{f.title} — {f.field}</li>)}</ul>
        </div>
      )}
      <style>{`
        .dbx { margin: 0 0 24px; padding: 16px 18px; border: 1px solid rgba(246,236,62,0.5); background: rgba(246,236,62,0.08); border-radius: 10px; color: #f0ede8; font: 14px/1.5 system-ui, sans-serif; }
        .dbxDone { border-color: rgba(120,200,120,0.4); background: rgba(120,200,120,0.08); }
        .dbxRow { display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
        .dbxRow span { color: #b8b5ae; }
        .dbxBtn { background: #f6ec3e; color: #ea1c24; border: 2px solid #ea1c24; border-radius: 100px; padding: 10px 18px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .dbxBtn:disabled { opacity: 0.7; cursor: wait; }
        .dbxErr { color: #ff6259; margin-top: 8px; }
        .dbxFails { margin-top: 10px; color: #b8b5ae; }
        .dbxFails ul { margin: 6px 0 0 18px; }
      `}</style>
    </div>
  )
}
