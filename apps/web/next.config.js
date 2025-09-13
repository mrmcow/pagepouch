/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'gwvsltgmjreructvbpzg.supabase.co', // Your Supabase storage domain
      'localhost',
    ],
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
}

module.exports = nextConfig
