'use client'
import { useState, useRef } from 'react'
import { toDirectImageUrl } from '@/lib/imageUrl'
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
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'add' | 'manage'>('add')
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
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { 'x-admin-password': password } })
    if (!res.ok) {
      const e = await res.json().catch(() => ({ error: 'Delete failed' }))
      setMsg('Error: ' + (e.error || 'Delete failed'))
      return
    }
    loadProducts()
  }

  function editProduct(p: Product) {
    setForm({
      title: p.title,
      description:
