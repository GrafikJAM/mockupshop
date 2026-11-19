import { productBaseName } from './seoName'

// Readable, keyword-bearing product URLs: /product/tote-bag-mockup-3eb9e94a
// The trailing 8 characters are the start of the product's id, which is what
// the page actually looks the product up by — so the words in front can
// change (e.g. the title is edited) without breaking old links: the page
// just redirects to the current spelling. Old /product/<full-uuid> links
// redirect too.

function slugify(s: string): string {
  return s
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function productSlug(p: { id: string; title: string }): string {
  return `${slugify(productBaseName(p.title)) || 'mockup'}-mockup-${p.id.slice(0, 8)}`
}

export function productPath(p: { id: string; title: string }): string {
  return `/product/${productSlug(p)}`
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// What a /product/<param> URL points at: a full id (old links) or an id prefix.
export function parseProductParam(param: string): { id: string } | { prefix: string } | null {
  if (UUID_RE.test(param)) return { id: param.toLowerCase() }
  const m = param.match(/-([0-9a-f]{8})$/i)
  return m ? { prefix: m[1].toLowerCase() } : null
}
