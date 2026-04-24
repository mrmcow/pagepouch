import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { GlobalProviders } from '@/components/GlobalProviders'
import { MarketingHomeTheme } from '@/components/MarketingHomeTheme'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import { SITE_URL } from '@/lib/site-url'

const inter = Inter({ subsets: ['latin'] })

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PageStash - Web Clipping & Archive Tool | Save Pages Permanently',
    template: '%s | PageStash'
  },
  description: 'The #1 web clipping and archival tool for researchers. Capture, organize, and search web pages permanently. Join 10,000+ professionals. Free trial - no credit card required.',
  keywords: [
    'web clipper',
    'web archival tool', 
    'research tool',
    'content capture',
    'screenshot tool',
    'web capture extension',
    'research organization',
    'knowledge management',
    'web scraper',
    'page capture',
    'content management',
    'research workflow',
    'academic research tool',
    'market research',
    'competitive intelligence',
    'threat intelligence',
    'bookmark manager',
    'note taking',
    'chrome extension',
    'firefox extension'
  ],
  authors: [{ name: 'PageStash Team', url: SITE_URL }],
  creator: 'PageStash',
  publisher: 'PageStash',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: 'PageStash - Web Archival Tool for Researchers & Analysts',
    description: 'Capture, organize, and search web content like a pro. Built for researchers who demand instant capture, intelligent search, and beautiful organization.',
    siteName: 'PageStash',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PageStash - Web Archival Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageStash - Web Archival Tool for Researchers & Analysts',
    description: 'Capture, organize, and search web content like a pro. Free trial with 10 clips/month.',
    images: ['/og-image.png'],
    creator: '@pagestash',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'BM_hzkXetg6H2NBYAoaM0mMoskxuVDp2zmMxlGMj2ec',
    other: {
      'msvalidate.01': '36BB3EACD2254D72426D4F213F483787',
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
    ],
    shortcut: '/icons/icon-32.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var p=location.pathname||'';if(p==='/'||p===''){document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';return;}var t=localStorage.getItem('pagestash-theme');if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='';}catch(e){}})()` }} />
        <link rel="dns-prefetch" href="https://gwvsltgmjreructvbpzg.supabase.co" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        {/* WebSite + Organization schema — establishes entity authority for Google Knowledge Panel
            and GEO (Perplexity / ChatGPT citations). SearchAction enables Sitelinks Search Box. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                url: SITE_URL,
                name: 'PageStash',
                description: 'Web clipping and archival tool for researchers, analysts, and knowledge workers.',
                publisher: { '@id': `${SITE_URL}/#organization` },
                potentialAction: {
                  '@type': 'SearchAction',
                  target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@type': 'Organization',
                '@id': `${SITE_URL}/#organization`,
                name: 'PageStash',
                url: SITE_URL,
                logo: {
                  '@type': 'ImageObject',
                  url: `${SITE_URL}/icons/icon-128.png`,
                  width: 128,
                  height: 128,
                },
                sameAs: [
                  'https://twitter.com/pagestash',
                  'https://github.com/pagestash',
                ],
              },
            ],
          })}}
        />
        {/* Google Analytics 4 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <GlobalProviders>
          <AnalyticsProvider />
          <MarketingHomeTheme />
          {children}
        </GlobalProviders>
      </body>
    </html>
  )
}
