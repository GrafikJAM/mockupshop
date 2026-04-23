// ─────────────────────────────────────────────────────────────
//  SITE CONFIG  — Edit this file to customize your entire site
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: 'Your Brand',
  tagline: 'High-quality Photoshop mockups',
  description: 'We create standout mockups with unique scenes and exceptional quality. Backed by years of branding experience.',
  established: '2025',
  founderName: 'Your Name',
  founderBio: `My name is Your Name and this is my playground for exploring what Photoshop mockups can really be.\n\nI've been building mockups since 2020, refining details and raising the bar along the way.\n\nThe goal is simple: I want to help you present your work in the quality it deserves.`,
  nav: [
    { label: 'Mockups', href: '/mockups' },
    { label: 'Blog', href: '/blog' },
  ],
  footer: [
    { label: 'Help', href: '/help' },
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
  ],
}

export const PRICING = {
  headline: 'Pay once & Access forever',
  subline: 'The best deal in the market. The price of a few mockups. Access to everything.',
  badge: 'Great deal',
  amount: '$129',
  description: 'Access 200+ mockups & all new mockups for life',
  cta: 'Purchase',
  // Replace with your actual payment link (Lemon Squeezy, Gumroad, Stripe, etc.)
  href: 'https://your-payment-link.com',
}

// ─── Featured products (marquee strip at top) ─────────────────
// Replace image URLs with your actual product images
export const FEATURED_PRODUCTS = [
  {
    id: 'lightbox-01',
    title: 'Lightbox Mockup',
    href: '/product/lightbox-01',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
  },
  {
    id: 'billboard-01',
    title: 'Billboard Mockup',
    href: '/product/billboard-01',
    image: 'https://images.unsplash.com/photo-1562155955-1cb2d73488d7?w=600&q=80',
  },
  {
    id: 'tote-01',
    title: 'Tote Bag Mockup',
    href: '/product/tote-01',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
  },
  {
    id: 'screen-01',
    title: 'Screen Mockup',
    href: '/product/screen-01',
    image: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=600&q=80',
  },
  {
    id: 'shirt-01',
    title: 'T-Shirt Mockup',
    href: '/product/shirt-01',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
  },
  {
    id: 'signage-01',
    title: 'Signage Mockup',
    href: '/product/signage-01',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
]

// ─── Access-all products (second marquee) ─────────────────────
export const ALL_PRODUCTS = [
  ...FEATURED_PRODUCTS,
  {
    id: 'notebook-01',
    title: 'Notebook Mockup',
    href: '/product/notebook-01',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80',
  },
  {
    id: 'macbook-01',
    title: 'MacBook Mockup',
    href: '/product/macbook-01',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
  },
  {
    id: 'poster-01',
    title: 'Poster Mockup',
    href: '/product/poster-01',
    image: 'https://images.unsplash.com/photo-1541185934-01b600ea069c?w=600&q=80',
  },
  {
    id: 'card-01',
    title: 'Business Card Mockup',
    href: '/product/card-01',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80',
  },
]

// ─── Latest products grid ─────────────────────────────────────
export const LATEST_PRODUCTS = ALL_PRODUCTS.slice(0, 8)

// ─── Social proof testimonials ────────────────────────────────
export const TESTIMONIALS = [
  {
    handle: '@designer_one',
    name: 'Alex Chen',
    avatar: 'https://i.pravatar.cc/48?img=1',
    text: "I've looked through a million mockups and these are the best.",
  },
  {
    handle: '@brandlab',
    name: 'Sarah Kim',
    avatar: 'https://i.pravatar.cc/48?img=5',
    text: 'Some of the best mockups out there! Keep up the great work!',
  },
  {
    handle: '@creativestudio',
    name: 'Marcus Liu',
    avatar: 'https://i.pravatar.cc/48?img=8',
    text: 'A gem discovery of the month. Immediately purchased.',
  },
  {
    handle: '@motiondesign',
    name: 'Priya Patel',
    avatar: 'https://i.pravatar.cc/48?img=10',
    text: 'These mockups are seriously awesome 🔥',
  },
  {
    handle: '@typographer',
    name: 'James Wright',
    avatar: 'https://i.pravatar.cc/48?img=12',
    text: 'Incredible quality. Worth every penny for the lifetime access.',
  },
  {
    handle: '@uidesigner',
    name: 'Emma Torres',
    avatar: 'https://i.pravatar.cc/48?img=15',
    text: 'Gorgeous mockups. My clients love the presentations.',
  },
  {
    handle: '@branddesigner',
    name: 'Noah Davis',
    avatar: 'https://i.pravatar.cc/48?img=18',
    text: 'Bought immediately after seeing a recommendation. Zero regrets.',
  },
]
