import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pagestash.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/dashboard/*',
          '/api/',
          '/api/*',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

