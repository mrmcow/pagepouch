import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, formatDate, getCategoryLabel } from '@/lib/blog'
import { SITE_URL } from '@/lib/site-url'

const PAGE_URL = `${SITE_URL}/blog/all-posts`

export const metadata: Metadata = {
  title: 'All articles (A–Z)',
  description:
    'Complete list of PageStash research and productivity articles—every guide, comparison, and workflow in one place.',
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  openGraph: {
    title: 'All articles | PageStash Blog',
    description:
      'Complete list of PageStash research and productivity articles—every guide, comparison, and workflow in one place.',
    type: 'website',
    url: PAGE_URL,
    siteName: 'PageStash',
  },
}

export default function BlogAllPostsPage() {
  const posts = getAllPosts().slice().sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      <header className="border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl">
        <div className="pagestash-container px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
              PageStash blog
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All articles</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
              Alphabetical list of every post ({posts.length} articles). The main{' '}
              <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                blog home
              </Link>{' '}
              offers search, filters, and featured layout.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-white/15 px-5 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shrink-0"
          >
            ← Blog home
          </Link>
        </div>
      </header>

      <main className="pagestash-container px-4 sm:px-6 py-10 pb-16">
        <nav aria-label="All blog articles A–Z">
          <ul className="columns-1 md:columns-2 xl:columns-3 gap-x-10 gap-y-3 text-sm [column-fill:balance] list-none p-0 m-0">
            {posts.map((post) => (
              <li key={post.slug} className="break-inside-avoid py-1.5 border-b border-slate-100 dark:border-white/5">
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {post.title}
                </Link>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>{getCategoryLabel(post.category)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  )
}
