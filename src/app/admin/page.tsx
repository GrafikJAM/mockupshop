'use client'
import { useState, useRef } from 'react'
import { toDirectImageUrl } from '@/lib/imageUrl'
import FileDropField from './FileDropField'
import styles from './page.module.css'

type Order = {
  sessionId: string
  type: string
  email: string
  items: string[]
  amountTotal: number | null
  currency: string | null
  referralCode: string | null
  createdAt: string
}

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
  is_lead_magnet: boolean
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
  is_lead_magnet: false,
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoaded, setOrdersLoaded] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'add' | 'manage' | 'orders'>('add')
  const [reordering, setReordering] = useState(false)
  const dragIndex = useRef<number | null>(null)
  const handleActive = useRef(false)
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

  async function loadOrders() {
    const res = await fetch('/api/admin/orders', { headers: { 'x-admin-password': password } })
    if (res.ok) {
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    }
    setOrdersLoaded(true)
  }

  function openOrdersTab() {
    setTab('orders')
    if (!ordersLoaded) loadOrders()
  }

  function formatAmount(amountTotal: number | null, currency: string | null) {
    if (amountTotal === null || !currency) return '—'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amountTotal / 100)
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
    setMsg('')
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } })
    if (res.ok) {
      loadProducts()
    } else {
      // Most likely cause: the password in this session is stale (e.g. it
      // was rotated in Vercel after you logged in here) and the request
      // came back 401. Surface it instead of silently doing nothing —
      // refresh this page and log in again with the current password.
      const e = await res.json().catch(() => ({ error: `Delete failed (${res.status})` }))
      setMsg('Error: ' + (e.error || `Delete failed (${res.status})`) + ' — try refreshing and logging in again.')
    }
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
      is_lead_magnet: !!p.is_lead_magnet,
    })
    setEditId(p.id); setTab('add'); window.scrollTo(0, 0)
  }

  function handleDragStart(e: React.DragEvent, i: number) {
    if (!handleActive.current) { e.preventDefault(); return }
    dragIndex.current = i
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(i)) // Firefox needs this to allow the drag
  }

  function handleDragEnter(i: number) {
    if (dragIndex.current === null || dragIndex.current === i) return
    setOverIndex(i)
  }

  async function persistOrder(list: Product[]) {
    setReordering(true)
    await fetch('/api/products/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ ids: list.map(p => p.id) }),
    })
    setReordering(false)
  }

  function handleDrop(e: React.DragEvent, i: number) {
    e.preventDefault()
    const from = dragIndex.current
    setOverIndex(null)
    if (from === null || from === i) return
    setProducts(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(i, 0, moved)
      persistOrder(next)
      return next
    })
  }

  function handleDragEnd() {
    dragIndex.current = null
    handleActive.current = false
    setOverIndex(null)
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

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>Product Admin</h1>
        <span className={styles.count}>{products.length} products</span>
      </div>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'add' ? styles.tabActive : ''}`} onClick={() => { setTab('add'); setEditId(null); setForm(empty) }}>{editId ? 'Edit product' : '+ Add product'}</button>
        <button className={`${styles.tab} ${tab === 'manage' ? styles.tabActive : ''}`} onClick={() => setTab('manage')}>Manage ({products.length})</button>
        <button className={`${styles.tab} ${tab === 'orders' ? styles.tabActive : ''}`} onClick={openOrdersTab}>Orders{ordersLoaded ? ` (${orders.length})` : ''}</button>
      </div>

      {msg && <p className={msg.startsWith('Error') ? styles.error : styles.success}>{msg}</p>}

      {tab === 'add' && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Product title *</label>
              <input className={styles.input} placeholder="e.g. Billboard Mockup Vol. 1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Price</label>
              <input className={styles.input} placeholder="e.g. $19" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label}>Tags (select all that apply)</label>
              <div className={styles.tagGrid}>
                {ALL_TAGS.map(tag => (
                  <button key={tag} type="button"
                    className={`${styles.tagBtn} ${form.tags.includes(tag) ? styles.tagActive : ''}`}
                    onClick={() => toggleTag(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label}>Description</label>
              <textarea className={`${styles.input} ${styles.textarea}`} placeholder="What's included, specs, etc." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <FileDropField
                label="Download link"
                required
                value={form.download_url}
                onChange={url => setForm({ ...form, download_url: url })}
                password={password}
                folder="downloads"
                accept=".zip"
                placeholder="https://your-download-link.com"
              />
            </div>
            <div className={styles.field}>
              <FileDropField
                label="Default image"
                required
                value={form.image_default}
                onChange={url => setForm({ ...form, image_default: url })}
                password={password}
                folder="images"
                accept="image/*"
                placeholder="https://..."
                preview
              />
            </div>
            <div className={styles.field}>
              <FileDropField
                label="Hover image"
                value={form.image_hover}
                onChange={url => setForm({ ...form, image_hover: url })}
                password={password}
                folder="images"
                accept="image/*"
                placeholder="https://..."
                preview
              />
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <p className={styles.label}>Extra images (up to 3 files)</p>
              {form.images_extra.map((url, i) => (
                <div key={i} className={styles.extraField}>
                  <FileDropField
                    label={`Extra image ${i + 1}`}
                    value={url}
                    onChange={newUrl => { const n = [...form.images_extra]; n[i] = newUrl; setForm({ ...form, images_extra: n }) }}
                    password={password}
                    folder="images"
                    accept="image/*"
                    placeholder={`Extra image ${i + 1}`}
                    preview
                  />
                </div>
              ))}
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.is_lead_magnet}
                  onChange={e => setForm({ ...form, is_lead_magnet: e.target.checked })}
                />
                Give away free on /free-mockup (only one product should be flagged at a time)
              </label>
            </div>
          </div>
          <div className={styles.formActions}>
            {editId && <button className={styles.btnGhost} onClick={() => { setEditId(null); setForm(empty); setMsg('') }}>Cancel</button>}
            <button className={styles.btnPrimary} onClick={save} disabled={saving || !form.title || !form.image_default || !form.download_url}>
              {saving ? 'Saving…' : editId ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </div>
      )}

      {tab === 'manage' && (
        <div className={styles.productList}>
          {products.length > 0 && (
            <p className={styles.dragHint}>
              Drag the <span className={styles.dragHintIcon}>⠿</span> handle to reorder — this sets the order products appear in "Latest mockups" and the mockups grid.
              {reordering && <span className={styles.savingTag}> Saving order…</span>}
            </p>
          )}
          {products.length === 0 && <p className={styles.empty}>No products yet.</p>}
          {products.map((p, i) => (
            <div
              key={p.id}
              className={`${styles.productRow} ${overIndex === i ? styles.dragOver : ''}`}
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
            >
              <span
                className={styles.dragHandle}
                title="Drag to reorder"
                onMouseDown={() => { handleActive.current = true }}
                onMouseUp={() => { handleActive.current = false }}
              >⠿</span>
              <img src={toDirectImageUrl(p.image_default)} className={styles.thumb} alt={p.title} />
              <div className={styles.productInfo}>
                <div className={styles.productTitle}>{p.title} {p.price && <span style={{color:'#555450'}}>· {p.price}</span>}</div>
                <div className={styles.productMeta}>
                  {(p.tags || [p.category]).join(', ')} · {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className={styles.productActions}>
                <button className={styles.btnEdit} onClick={() => editProduct(p)}>Edit</button>
                <button className={styles.btnDelete} onClick={() => deleteProduct(p.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className={styles.orderList}>
          <div className={styles.orderListHead}>
            <p className={styles.dragHint}>Most recent 500 orders, newest first.</p>
            <button className={styles.btnGhost} onClick={loadOrders}>Refresh</button>
          </div>
          {!ordersLoaded && <p className={styles.empty}>Loading…</p>}
          {ordersLoaded && orders.length === 0 && <p className={styles.empty}>No orders yet.</p>}
          {orders.map(o => (
            <div key={o.sessionId} className={styles.orderRow}>
              <div className={styles.orderMain}>
                <div className={styles.orderTitle}>
                  {o.items.join(', ')}
                </div>
                <div className={styles.productMeta}>
                  {o.email} · {new Date(o.createdAt).toLocaleString()}
                  {o.referralCode && <> · ref: {o.referralCode}</>}
                </div>
              </div>
              <div className={styles.orderAmount}>{formatAmount(o.amountTotal, o.currency)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
