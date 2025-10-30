import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'

// Trigger rebuild with environment variables configured

const inter = Inter({ subsets: ['latin'] })

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pagestash.app'),
  title: {
    default: 'PageStash - Web Archival Tool for Researchers & Analysts',
    template: '%s | PageStash'
  },
  description: 'The only web archival tool built for researchers, analysts, and professionals. Capture full-page screenshots, extract text, organize with folders, and find content instantly. Free trial with 50 clips per month.',
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
  authors: [{ name: 'PageStash Team', url: 'https://www.pagestash.app' }],
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
    url: 'https://www.pagestash.app',
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
    description: 'Capture, organize, and search web content like a pro. Free trial with 50 clips/month.',
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
    google: 'your-google-verification-code', // Add this from Google Search Console
  },
  alternates: {
    canonical: 'https://www.pagestash.app',
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

export const viewport = 'width=device-width, initial-scale=1'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
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
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}
