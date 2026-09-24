'use client'
import { useRef, useState } from 'react'
import { uploadAdminFile } from '@/lib/upload'
import { toDirectImageUrl } from '@/lib/imageUrl'
import styles from './FileDropField.module.css'

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
  password: string
  folder: string
  accept?: string
  placeholder?: string
  preview?: boolean
  required?: boolean
}

// A plain URL text field (unchanged behavior — paste any link, including an
// existing Dropbox one, and it works exactly as before) plus an optional
// drag-and-drop zone that uploads a file and fills the same field with its
// new public URL. Existing products keep whatever URL they already have
// until someone explicitly drops a replacement file on them.
export default function FileDropField({
  label, value, onChange, password, folder, accept, placeholder, preview, required,
}: Props) {
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | null | undefined) {
    if (!file) return
    setStatus('uploading')
    setError('')
    try {
      const url = await uploadAdminFile(file, password, folder)
      onChange(url)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}{required ? ' *' : ''}</label>
      <input
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <div
        className={`${styles.drop} ${dragging ? styles.dropActive : ''} ${status === 'uploading' ? styles.dropBusy : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        onClick={() => fileInput.current?.click()}
      >
        <input
          ref={fileInput}
          type="file"
          accept={accept}
          className={styles.hiddenInput}
          onChange={e => handleFile(e.target.files?.[0])}
        />
        <span>{status === 'uploading' ? 'Uploading…' : 'Drop a file here, or click to browse'}</span>
      </div>
      {status === 'error' && <p className={styles.error}>{error}</p>}
      {preview && value && <img src={toDirectImageUrl(value)} className={styles.preview} alt="preview" />}
    </div>
  )
}
