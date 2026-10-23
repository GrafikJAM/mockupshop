/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Only hosts product images actually come from — keeps the optimizer
    // from being usable as an open image proxy for any site on the web.
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'dl.dropboxusercontent.com' },
      { protocol: 'https', hostname: 'www.dropbox.com' },
      { protocol: 'https', hostname: 'dropbox.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [256, 384],
    formats: ['image/webp'],
    // Uploaded files get unique names, so a resized copy never goes stale —
    // cache each one for 31 days instead of re-fetching from Supabase.
    minimumCacheTTL: 2678400,
  },
}

module.exports = nextConfig
