export const SITE = {
  name: 'GrafikJAM Mockups',
  tagline: "Photoshop mockups that don't blend in",
  description: 'GrafikJAM mockups.\nMade for real brands.',
  established: '2021',
  founderName: 'Jekabs A. Mucenieks',
  founderBio: `My name is Jekabs A. Mucenieks — I'm a brand designer and the person behind GrafikJAM.\n\nI've been crafting mockups since 2021, not as a side project, but as part of my actual branding work. Every file I sell is something I'd use myself.`,  nav: [
    { label: 'Mockups', href: '/mockups' },
    { label: 'Free mockup', href: '/free-mockup' },
  ],
  footer: [
    { label: 'Free Mockup', href: '/free-mockup' },
    { label: 'Licenses', href: '/licenses' },
    { label: 'Help', href: '/help' },
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
  ],
}

export const PRICING = {
  headline: 'One price. Every mockup. Forever.',
  subline: "Less than a stock-photo subscription, minus the recurring bill you'll forget to cancel.",
  badge: 'Zero regrets',
  amount: '$129',
  amountValue: 129,
  description: 'The whole library, plus everything I make next — no subscriptions, no catch',
  cta: 'Get Full Access',
  href: 'https://your-payment-link.com',
}

export const LICENSE_TIERS = [
  { key: 'freelancer', label: 'Freelancer', scale: '1–2 person design team', price: 19, fullAccessPrice: 129 },
  { key: 'studio', label: 'Studio', scale: '3–6 person design team', price: 39, fullAccessPrice: 229 },
  { key: 'commercial', label: 'Commercial', scale: '7+ person design team', price: 69, fullAccessPrice: 349 },
]

export const LICENSES_HREF = '/licenses'
