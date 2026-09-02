'use client'
import { useState, useRef } from 'react'
import styles from './page.module.css'

type Product = {
  id: string
  title: string
  description: string
  download_url: string
  image_default: string
  image_hover: string
  images_extra: string[]
  category: string
  tags: string[]
  price: string
  active: boolean
  created_at: string
  sort_order: number | null
}

const ALL_TAGS = ['Human', 'Devices', 'Outdoor', 'Poster', 'Billboard', 'Screen', 'Apparel', 'Print', 'Signage', 'Packaging', 'Vehicle', 'Interior', 'Stationery', 'Other']

const empty = {
  title: '',
  description: '',
  download_url: '',
  image_default: '',
  image_hover: '',
  images_extra: ['', '', ''],
  category: 'Other',
  tags: [] as string[],
  price: '',
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'add' | 'manage'>('add')
  const [reordering, setReordering] = useState(false)
  const dragIndex = useRef<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  async function login() {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'x-admin-password': password, 'Content-Type': 'application/json' },
      body: JSON.stringify({ _test: true }),
    })
    if (res.status !== 401) { setAuthed(true); loadProducts() }
    else setAuthError(true)
  }

  async function loadProducts() {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
  }

  function toggleTag(tag: string) {
    const tags = form.tags.includes(tag)
      ? form.tags.filter(t => t !== tag)
      : [...form.tags, tag]
    setForm({ ...form, tags, category: tags[0] || 'Other' })
  }

  async function save() {
    setSaving(true); setMsg('')
    const payload = {
      ...form,
      images_extra: form.images_extra.filter(Boolean),
      tags: form.tags,
      category: form.tags[0] || 'Other',
    }
    const url = editId ? `/api/products/${editId}` : '/api/products'
    const res = await fetch(url, {
      method: editId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(payload),
    })
    if (res.ok) { setMsg(editId ? 'Updated!' : 'Product added!'); setForm(empty); setEditId(null); loadProducts(); setTab('manage') }
    else { const e = await res.json(); setMsg('Error: ' + e.error) }
    setSaving(false)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Remove this product?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } })
    loadProducts()
  }

  function editProduct(p: Product) {
    setForm({
      title: p.title,
      description: p.description,
      download_url: p.download_url,
      image_default: p.image_default,
      image_hover: p.image_hover,
      images_extra: [...(p.images_extra || []), '', '', ''].slice(0, 3),
      category: p.category,
      tags: p.tags || [],
      price: p.price || '',
    })
    setEditId(p.id); setTab('add'); window.scrollTo(0, 0)
  }

  function handleDragStart(e: React.DragEvent, i: number) {
    const target = e.target as HTMLElement
    if (!target.closest(`.${styles.dragHandle}`)) { e.preventDefault(); return }
    dragIndex.current = i
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnter(i: number) {
    if (dragIndex.current === null || dragIndex.current === i) return
    setProducts(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex.current!, 1)
      next.splice(i, 0, moved)
      return next
    })
    dragIndex.current = i
    setOverIndex(i)
  }

  async function handleDragEnd() {
    dragIndex.current = null
    setOverIndex(null)
    setReordering(true)
    await fetch('/api/products/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ ids: products.map(p => p.id) }),
    })
    setReordering(false)
  }

  if (!authed) return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Admin</h1>
        <p className={styles.loginSub}>Enter your admin password</p>
        <input className={styles.input} type="password" placeholder="Password" value={password}
          onChange={e => { setPassword(e.target.value); setAuthError(false) }}
          onKeyDown={e => e.key === 'Enter' && login()} />
        {authError && <p className={styles.error}>Wrong password</p>}
        <button className={styles.btnPrimary} onClick={login}>Enter</button>
      </div>
    </div>
  )
