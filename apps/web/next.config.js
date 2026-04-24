/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep console.error and console.warn for critical issues
    } : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gwvsltgmjreructvbpzg.supabase.co',
        pathname: '/**',
      },
      {
        // Unsplash CDN — used for all blog post featured images and in-content photos
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        // Unsplash source/direct links that some posts may reference
        protocol: 'https',
        hostname: 'unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Suppress Edge Runtime warnings for Supabase
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore Node.js modules in client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  },
  // Suppress specific warnings
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Add cache headers for better performance
  async headers() {
    return [
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year cache for optimized images
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0', // No cache for API routes
          },
        ],
      },
    ]
  },
  // Enforce canonical host at the edge: apex (pagestash.app) and the Vercel
  // preview URL (pagepouch-web.vercel.app) both 301 to https://www.pagestash.app.
  // This prevents Google from indexing duplicate origins — the root cause of
  // the "Alternative page with proper canonical tag" errors in Search Console.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'pagestash.app' }],
        destination: 'https://www.pagestash.app/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'pagepouch-web.vercel.app' }],
        destination: 'https://www.pagestash.app/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
