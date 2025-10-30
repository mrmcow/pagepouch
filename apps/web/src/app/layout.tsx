import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'

// Trigger rebuild with environment variables configured

const inter = Inter({ subsets: ['latin'] })

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  title: 'PageStash - Capture, Organize, Retrieve',
  description: 'The most frictionless way to capture, organize, and retrieve web content',
  keywords: ['web clipper', 'research tool', 'content capture', 'threat intelligence'],
  authors: [{ name: 'PageStash Team' }],
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
