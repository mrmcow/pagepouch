import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Web Clipping & Research Tips | PagePouch',
  description: 'Learn how to save, organize, and retrieve web content efficiently. Expert guides on web clipping, research organization, and productivity tips.',
  keywords: 'web clipping, web capture, research organization, productivity, save web pages, organize research',
  openGraph: {
    title: 'PagePouch Blog - Web Capture & Research Tips',
    description: 'Expert guides on web clipping, research organization, and productivity.',
    type: 'website',
    siteName: 'PagePouch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PagePouch Blog',
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

