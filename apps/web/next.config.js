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
}

module.exports = nextConfig
