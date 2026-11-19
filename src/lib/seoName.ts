// Product titles in the shop are internal-style names like "Tote Bag 01JAM"
// or "Billboard Mockup 04JAM". Nobody searches for "01JAM" — they search for
// "tote bag mockup psd". These helpers turn the stored title into the
// search-friendly wording used for page titles, image alt text and
// structured data, without renaming anything in the shop itself.

// "Tote Bag 01JAM" -> "Tote Bag", "Billboard Mockup 04JAM" -> "Billboard",
// "Airport Bench Screen JAM" -> "Airport Bench Screen"
export function productBaseName(title: string): string {
  const name = title
    .replace(/\s*\d*\s*JAM\s*$/i, '')
    .replace(/\s+mockups?\s*$/i, '')
    .trim()
  return name || title
}

// "Tote Bag Mockup PSD – Smart Object | GrafikJAM"
export function productSeoTitle(title: string): string {
  return `${productBaseName(title)} Mockup PSD – Smart Object | GrafikJAM`
}

// "Tote Bag mockup"
export function productAlt(title: string): string {
  return `${productBaseName(title)} mockup`
}
