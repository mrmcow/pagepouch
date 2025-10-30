import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Web Clipping & Research Tips | PageStash',
  description: 'Learn how to save, organize, and retrieve web content efficiently. Expert guides on web clipping, research organization, and productivity tips.',
  keywords: 'web clipping, web capture, research organization, productivity, save web pages, organize research',
  openGraph: {
    title: 'PageStash Blog - Web Capture & Research Tips',
    description: 'Expert guides on web clipping, research organization, and productivity.',
    type: 'website',
    siteName: 'PageStash',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PageStash Blog',
    description: 'Expert guides on web clipping, research organization, and productivity.',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

