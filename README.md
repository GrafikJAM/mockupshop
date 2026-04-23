# Mockup Lab Framework

A production-ready Next.js framework inspired by mockuplab.shop. Dark editorial aesthetic with scrolling product marquees, testimonials, and a one-time pricing CTA.

---

## 🚀 Deploy to Vercel in 3 steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "initial"
   gh repo create my-mockup-site --public --push
   ```

2. **Import on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Framework: **Next.js** (auto-detected)
   - Click **Deploy**

3. **Done** — live in ~60 seconds.

---

## ✏️ Customize everything

All content lives in **one file**: `src/lib/config.ts`

```ts
// Site identity
SITE.name          → Your brand name
SITE.tagline       → Headline under the logo
SITE.founderBio    → About section copy

// Pricing
PRICING.amount     → "$129"
PRICING.href       → Your Lemon Squeezy / Gumroad / Stripe link
PRICING.cta        → Button label

// Products
FEATURED_PRODUCTS  → Marquee strip (6 items)
ALL_PRODUCTS       → All-access marquee + grid
LATEST_PRODUCTS    → "What's new" grid

// Testimonials
TESTIMONIALS       → Social proof cards
```

---

## 🗂️ Project structure

```
src/
  app/
    page.tsx              → Home page
    mockups/page.tsx      → All products listing
    product/[slug]/       → Individual product page
    layout.tsx            → Root layout
    globals.css           → Design tokens + global styles
  components/
    Nav.tsx               → Sticky top navigation
    Marquee.tsx           → Auto-scrolling product strip
    Testimonials.tsx      → Dual-row testimonial carousel
    PricingCard.tsx       → Pricing CTA card
    ProductGrid.tsx       → Responsive product grid
    Footer.tsx            → Simple footer
  lib/
    config.ts             → ← EDIT THIS FILE
```

---

## 🎨 Design tokens (globals.css)

| Variable | Default | Purpose |
|---|---|---|
| `--bg` | `#0c0c0b` | Page background |
| `--bg-card` | `#141413` | Card backgrounds |
| `--text-primary` | `#f0ede8` | Headings |
| `--text-secondary` | `#8a8880` | Body copy |
| `--accent-warm` | `#c9b99a` | Italic highlight color |
| `--cta-bg` | `#f0ede8` | CTA button background |
| `--font-display` | DM Serif Display | Headlines |
| `--font-body` | DM Sans | Body text |

---

## 💳 Payment integration

The framework is payment-provider agnostic. Set `PRICING.href` to any link:

- **Lemon Squeezy** → your product checkout URL
- **Gumroad** → `https://yourname.gumroad.com/l/yourproduct`
- **Stripe Payment Links** → your Stripe link
- **Paddle** → your Paddle overlay link

---

## 📦 Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **CSS Modules** (no Tailwind dependency)
- **Google Fonts** (DM Serif Display + DM Sans)
- **Vercel** for hosting
