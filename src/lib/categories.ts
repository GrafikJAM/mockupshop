// Shared category taxonomy for the SEO landing pages at /mockups/[category].
// `tag` must match the exact value stored in `products.tags` in Supabase.
// `slug` is the URL segment. `intro` is unique per-category copy — deliberately
// not templated, so each landing page has genuinely distinct content instead
// of the same paragraph with one word swapped (which reads as duplicate
// content to search engines and hurts all the pages together, not just one).
export type Category = {
  slug: string
  tag: string
  label: string
  metaTitle: string
  metaDescription: string
  intro: string
}

export const CATEGORIES: Category[] = [
  {
    slug: 'billboard',
    tag: 'Billboard',
    label: 'Billboard Mockups',
    metaTitle: 'Billboard Mockups — Photoshop PSD',
    metaDescription: 'Realistic billboard mockups for outdoor ad campaign presentations. Smart Object PSD files, built from real client work. Free and paid licenses available.',
    intro: 'Billboard mockups for showing outdoor ad creative the way a client will actually see it in the field — wide shots, close-ups, and a few unusual angles like fisheye and double-billboard setups for campaigns that need more than one straight-on view.',
  },
  {
    slug: 'vehicle',
    tag: 'Vehicle',
    label: 'Vehicle Mockups',
    metaTitle: 'Vehicle Branding Mockups — Photoshop PSD',
    metaDescription: 'Truck, van, taxi, and car mockups for vehicle branding and fleet advertising presentations. Smart Object PSD files. Free and paid licenses available.',
    intro: 'Vehicle mockups for fleet branding and transit advertising — trucks, vans, taxi rooftops and in-car screens — for the moment a client needs to see a wrap or decal on an actual vehicle instead of a flat panel.',
  },
  {
    slug: 'screen',
    tag: 'Screen',
    label: 'Screen Mockups',
    metaTitle: 'Digital Screen Mockups — Photoshop PSD',
    metaDescription: 'Digital screen and display mockups for app, ad, and UI presentations — event screens, airport displays, in-car screens. Free and paid licenses available.',
    intro: 'Screen mockups for anything that lives on a digital display — event screens, airport and transit displays, in-car dashboards — for presenting UI, ad creative, or motion-graphic stills in the context they\'ll actually run in.',
  },
  {
    slug: 'poster',
    tag: 'Poster',
    label: 'Poster Mockups',
    metaTitle: 'Poster Mockups — Photoshop PSD',
    metaDescription: 'Poster mockups for ad campaigns and print presentations, indoor and outdoor. Smart Object PSD files. Free and paid licenses available.',
    intro: 'Poster mockups spanning indoor and outdoor placements — banners, hoarding boards, construction-site posters — for showing print creative pinned up in a real environment rather than floating on a white background.',
  },
  {
    slug: 'apparel',
    tag: 'Apparel',
    label: 'Apparel Mockups',
    metaTitle: 'Apparel Mockups — Photoshop PSD',
    metaDescription: 'Shirt, hat, and merch mockups for clothing and apparel brand presentations. Smart Object PSD files. Free and paid licenses available.',
    intro: 'Apparel mockups for merch and clothing brands — shirts, hats, tags and labels — for showing a print or embroidery design the way it\'ll actually sit on fabric.',
  },
  {
    slug: 'print',
    tag: 'Print',
    label: 'Print Mockups',
    metaTitle: 'Print Mockups — Photoshop PSD',
    metaDescription: 'Magazine, business card, and print collateral mockups for editorial and brand identity presentations. Free and paid licenses available.',
    intro: 'Print mockups for editorial and brand collateral — magazines, business cards, menus — for presenting layout and print design in a realistic, held-in-hand context instead of a flat spread.',
  },
  {
    slug: 'signage',
    tag: 'Signage',
    label: 'Signage Mockups',
    metaTitle: 'Signage Mockups — Photoshop PSD',
    metaDescription: 'Storefront, lightbox, and wayfinding signage mockups for environmental brand presentations. Free and paid licenses available.',
    intro: 'Signage mockups for storefronts, lightboxes and wayfinding — the environmental, walk-past-it-on-the-street side of a brand, as opposed to a single flat panel.',
  },
  {
    slug: 'packaging',
    tag: 'Packaging',
    label: 'Packaging Mockups',
    metaTitle: 'Packaging Mockups — Photoshop PSD',
    metaDescription: 'Product packaging mockups — bags, boxes, labels — for packaging and product design presentations. Free and paid licenses available.',
    intro: 'Packaging mockups for product design presentations — bags, labels, sealed packaging — for the moment a client needs to see a design on the actual object it\'ll ship on.',
  },
  {
    slug: 'devices',
    tag: 'Devices',
    label: 'Device Mockups',
    metaTitle: 'Device Mockups — Photoshop PSD',
    metaDescription: 'Phone, display, and product device mockups for app, UI, and product design presentations. Free and paid licenses available.',
    intro: 'Device mockups for app and product design work — phone screens, displays, cards — for presenting a UI or product design the way a user would actually hold or view it.',
  },
  {
    slug: 'outdoor',
    tag: 'Outdoor',
    label: 'Outdoor Mockups',
    metaTitle: 'Outdoor Advertising Mockups — Photoshop PSD',
    metaDescription: 'Outdoor advertising mockups spanning billboards, banners, and street-level placements. Free and paid licenses available.',
    intro: 'Outdoor advertising mockups spanning billboards, banners and street-level placements — the full out-of-home range in one place, for campaigns that touch more than one outdoor format.',
  },
  {
    slug: 'human',
    tag: 'Human',
    label: 'Lifestyle Mockups',
    metaTitle: 'Lifestyle Mockups (With People) — Photoshop PSD',
    metaDescription: 'Lifestyle mockups showing real people interacting with a design — worn, held, or viewed in context. Free and paid licenses available.',
    intro: 'Lifestyle mockups that put a real person into the scene — wearing, holding, or looking at your design — for presentations where context and human scale matter more than a clean isolated shot.',
  },
  {
    slug: 'interior',
    tag: 'Interior',
    label: 'Interior Mockups',
    metaTitle: 'Interior Scene Mockups — Photoshop PSD',
    metaDescription: 'Indoor and interior scene mockups for signage, displays, and print shown in real indoor environments. Free and paid licenses available.',
    intro: 'Interior mockups for signage, displays and print shown indoors — cafes, offices, retail interiors — for brand work that lives inside a space rather than out on the street.',
  },
  {
    slug: 'stationery',
    tag: 'Stationery',
    label: 'Stationery Mockups',
    metaTitle: 'Stationery Mockups — Photoshop PSD',
    metaDescription: 'Business card and stationery mockups for brand identity presentations. Smart Object PSD files. Free and paid licenses available.',
    intro: 'Stationery mockups for brand identity work — business cards and paper goods — for showing a mark or layout the way it\'ll actually print, not just on screen.',
  },
  {
    slug: 'other',
    tag: 'Other',
    label: 'More Mockups',
    metaTitle: 'More Photoshop Mockups',
    metaDescription: 'Additional Photoshop mockups that don\'t fit a single category. Smart Object PSD files. Free and paid licenses available.',
    intro: 'A mix of mockups that don\'t sit neatly in one category — worth a look if you didn\'t find what you needed above.',
  },
]

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find(c => c.slug === slug)
}
