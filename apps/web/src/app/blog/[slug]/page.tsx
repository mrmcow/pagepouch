import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { LogoWithText } from '@/components/ui/logo'
import { Calendar, Clock, ArrowLeft, Tag, ArrowRight } from 'lucide-react'
import { getPostBySlug, getRelatedPosts, formatDate, getCategoryLabel, getAllPosts } from '@/lib/blog'
import { SITE_URL } from '@/lib/site-url'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Breadcrumbs } from '@/components/blog/Breadcrumbs'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | PageStash Blog',
      description: 'The blog post you are looking for could not be found.',
    }
  }

  const postUrl = `${SITE_URL}/blog/${post.slug}`
  const imageUrl = post.featuredImage || `${SITE_URL}/icons/icon-128.png`

  return {
    title: `${post.title} | PageStash Blog`,
    description: post.description,
    authors: [{ name: post.author }],
    keywords: post.tags.join(', '),
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      url: postUrl,
      siteName: 'PageStash',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [imageUrl],
      creator: '@PageStash',
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  
  if (!post) {
    notFound()
  }
  
  const relatedPosts = getRelatedPosts(params.slug, 3)

  // JSON-LD structured data for SEO
  const siteUrl = SITE_URL
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.featuredImage || `${siteUrl}/icons/icon-128.png`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PageStash',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icons/icon-128.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  }

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${siteUrl}/blog/${post.slug}`,
      },
    ],
  }

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ]

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
        {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between gap-3">
            {/* Left: back-arrow + small logo on mobile, full logo on desktop */}
            <div className="flex items-center gap-2 min-w-0">
              <Link
                href="/blog"
                aria-label="Back to blog"
                className="flex items-center justify-center h-9 w-9 -ml-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors sm:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/" className="flex items-center min-w-0">
                <LogoWithText
                  size={32}
                  clickable={false}
                  textClassName="!text-slate-900 dark:!text-white !text-sm sm:!text-base"
                />
              </Link>
            </div>

            {/* Right: desktop "Back to Blog" text link + CTA; CTA-only on mobile */}
            <div className="flex items-center gap-2">
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Blog
              </Link>
              <Button
                size="sm"
                className="h-8 px-3 text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                asChild
              >
                <Link href="/auth/signup">Start free</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="flex-1">
        {/* Article Header */}
        <section className="pt-5 md:pt-8 bg-white dark:bg-slate-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Breadcrumbs items={breadcrumbItems} />

            <Badge variant="secondary" className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              {getCategoryLabel(post.category)}
            </Badge>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 leading-tight tracking-tight">
              {post.title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              {post.description}
            </p>

            {/* Author row — compact on mobile */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 pb-5 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                  {post.author.charAt(0)}
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300">{post.author}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {formatDate(post.publishedAt)}
              </div>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {post.readingTime} min
              </div>
            </div>

            {/* Featured image — visible in page body so Google indexes it and it
                matches the og:image / JSON-LD image. Full-bleed on mobile. */}
            {post.featuredImage && (
              <div className="mt-5 md:mt-8 -mx-4 sm:mx-0 sm:rounded-xl overflow-hidden">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  width={800}
                  height={420}
                  className="w-full object-cover"
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 768px, 800px"
                />
              </div>
            )}
          </div>
        </section>

        {/* Article Body */}
        <article className="pt-6 pb-10 md:pt-10 md:pb-16 bg-white dark:bg-slate-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Professional Article Styling — headings scale down on mobile */}
            <div className="prose max-w-none
              [&>*]:font-sans

              [&_h1:first-child]:hidden

              [&_h1]:text-xl
              md:[&_h1]:text-3xl
              [&_h1]:font-bold
              [&_h1]:text-slate-900
              dark:[&_h1]:text-slate-50
              [&_h1]:mb-4
              [&_h1]:mt-8
              [&_h1]:leading-tight

              [&_h2]:text-lg
              md:[&_h2]:text-2xl
              [&_h2]:font-bold
              [&_h2]:text-slate-900
              dark:[&_h2]:text-slate-50
              [&_h2]:mt-8
              md:[&_h2]:mt-12
              [&_h2]:mb-3
              md:[&_h2]:mb-4
              [&_h2]:leading-snug
              [&_h2]:pb-2
              md:[&_h2]:pb-3
              [&_h2]:border-b
              [&_h2]:border-slate-100
              dark:[&_h2]:border-slate-800

              [&_h3]:text-base
              md:[&_h3]:text-xl
              [&_h3]:font-semibold
              [&_h3]:text-slate-900
              dark:[&_h3]:text-slate-100
              [&_h3]:mt-6
              md:[&_h3]:mt-8
              [&_h3]:mb-2
              md:[&_h3]:mb-3
              [&_h3]:leading-snug

              [&_h4]:text-sm
              md:[&_h4]:text-lg
              [&_h4]:font-semibold
              [&_h4]:text-slate-800
              dark:[&_h4]:text-slate-200
              [&_h4]:mt-5
              md:[&_h4]:mt-6
              [&_h4]:mb-2
              
              [&_p]:text-slate-700
              dark:[&_p]:text-slate-300
              [&_p]:text-[15px]
              md:[&_p]:text-lg
              [&_p]:leading-[1.65]
              md:[&_p]:leading-relaxed
              [&_p]:mb-4

              [&_p_strong]:text-slate-900
              dark:[&_p_strong]:text-white
              [&_p_strong]:font-semibold

              [&_em]:text-slate-600
              dark:[&_em]:text-slate-400

              [&_a]:text-blue-600
              dark:[&_a]:text-blue-400
              [&_a]:font-medium
              [&_a]:no-underline
              [&_a:hover]:text-blue-700
              dark:[&_a:hover]:text-blue-300
              [&_a:hover]:underline

              [&_ul]:my-4
              md:[&_ul]:my-5
              [&_ul]:space-y-1.5
              md:[&_ul]:space-y-2
              [&_ul]:pl-0

              [&_ol]:my-4
              md:[&_ol]:my-5
              [&_ol]:space-y-1.5
              md:[&_ol]:space-y-2
              [&_ol]:pl-0

              [&_li]:text-slate-700
              dark:[&_li]:text-slate-300
              [&_li]:text-[15px]
              md:[&_li]:text-lg
              [&_li]:leading-[1.6]
              md:[&_li]:leading-relaxed
              [&_li]:ml-5
              
              [&_ul_li]:list-disc
              [&_ol_li]:list-decimal
              
              [&_li::marker]:text-blue-500
              dark:[&_li::marker]:text-blue-400
              
              [&_code]:text-[13px]
              md:[&_code]:text-sm
              [&_code]:font-mono
              [&_code]:bg-slate-100
              dark:[&_code]:bg-slate-800
              [&_code]:text-slate-800
              dark:[&_code]:text-slate-100
              [&_code]:px-1.5
              [&_code]:py-0.5
              [&_code]:rounded
              [&_code]:font-medium

              [&_pre]:bg-slate-900
              [&_pre]:text-slate-100
              [&_pre]:rounded-lg
              [&_pre]:p-3
              md:[&_pre]:p-4
              [&_pre]:my-4
              md:[&_pre]:my-6
              [&_pre]:overflow-x-auto
              [&_pre]:text-[13px]
              md:[&_pre]:text-sm

              [&_blockquote]:border-l-4
              [&_blockquote]:border-blue-500
              dark:[&_blockquote]:border-blue-400
              [&_blockquote]:bg-blue-50
              dark:[&_blockquote]:bg-slate-800/60
              [&_blockquote]:pl-3
              md:[&_blockquote]:pl-4
              [&_blockquote]:pr-3
              md:[&_blockquote]:pr-4
              [&_blockquote]:py-2.5
              md:[&_blockquote]:py-3
              [&_blockquote]:my-4
              md:[&_blockquote]:my-6
              [&_blockquote]:rounded-r
              [&_blockquote]:italic
              [&_blockquote]:text-slate-700
              dark:[&_blockquote]:text-slate-300
              [&_blockquote_p]:text-[15px]
              md:[&_blockquote_p]:text-base

              [&_hr]:border-t
              [&_hr]:border-slate-200
              dark:[&_hr]:border-slate-700
              [&_hr]:my-8
              md:[&_hr]:my-12

              [&_img]:rounded-lg
              [&_img]:shadow-sm
              [&_img]:my-5
              md:[&_img]:my-8
              [&_img]:w-full

              [&_table]:w-full
              [&_table]:my-5
              md:[&_table]:my-8
              [&_table]:border-collapse
              [&_table]:bg-white
              dark:[&_table]:bg-slate-900
              [&_table]:shadow-sm
              [&_table]:rounded-lg
              [&_table]:overflow-hidden
              [&_table]:border
              [&_table]:border-slate-200
              dark:[&_table]:border-slate-700

              [&_thead]:bg-slate-900
              dark:[&_thead]:bg-slate-800

              [&_th]:px-3
              md:[&_th]:px-4
              [&_th]:py-3
              md:[&_th]:py-4
              [&_th]:text-left
              [&_th]:text-[11px]
              md:[&_th]:text-xs
              [&_th]:font-semibold
              [&_th]:text-white
              [&_th]:uppercase
              [&_th]:tracking-wider

              [&_td]:px-3
              md:[&_td]:px-4
              [&_td]:py-3
              md:[&_td]:py-4
              [&_td]:text-left
              [&_td]:text-[13px]
              md:[&_td]:text-sm
              [&_td]:text-slate-700
              dark:[&_td]:text-slate-200
              [&_td]:border-b
              [&_td]:border-slate-100
              dark:[&_td]:border-slate-700
              [&_td:first-child]:font-medium
              [&_td:first-child]:text-slate-900
              dark:[&_td:first-child]:text-slate-100
              
              [&_tbody_tr:last-child_td]:border-b-0
              [&_tbody_tr:hover]:bg-blue-50
              dark:[&_tbody_tr:hover]:bg-slate-800/80
              [&_tbody_tr]:transition-all
              [&_tbody_tr]:duration-200
              
              [&_th_img]:inline-block
              [&_th_img]:w-8
              [&_th_img]:h-8
              [&_th_img]:object-contain
              [&_th_img]:rounded-md
              [&_th_img]:mr-0
              [&_th_img]:align-middle
              [&_th_img]:shadow-none
              [&_th_img]:my-0
              [&_th_img]:bg-white
              dark:[&_th_img]:bg-slate-800
              [&_th_img]:p-1.5
              [&_th_img]:border
              [&_th_img]:border-blue-200
              dark:[&_th_img]:border-slate-600
              
              [&_td_img]:inline-block
              [&_td_img]:w-6
              [&_td_img]:h-6
              [&_td_img]:object-contain
              [&_td_img]:rounded
              [&_td_img]:mr-2
              [&_td_img]:align-middle
              [&_td_img]:shadow-none
              [&_td_img]:my-0
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // Custom components for better formatting
                  p: ({node, ...props}) => <p className="mb-5" {...props} />,
                  ul: ({node, ...props}) => <ul className="space-y-3 my-6" {...props} />,
                  ol: ({node, ...props}) => <ol className="space-y-3 my-6" {...props} />,
                  li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                  h1: ({node, ...props}) => <h1 className="scroll-mt-20" {...props} />,
                  h2: ({node, ...props}) => <h2 className="scroll-mt-20" {...props} />,
                  h3: ({node, ...props}) => <h3 className="scroll-mt-20" {...props} />,
                  // Enhanced table styling
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto -mx-4 sm:mx-0 my-8">
                      <table className="min-w-full" {...props} />
                    </div>
                  ),
                  th: ({node, ...props}) => (
                    <th className="whitespace-nowrap" {...props} />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        {/* Tags */}
        <section className="py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Topics</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-medium">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 md:py-12 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 sm:p-10 text-center text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-3">
                Put these tips into action
              </h3>
              <p className="text-sm sm:text-base text-blue-100 mb-6 max-w-md mx-auto">
                Start organising your research with PageStash — 10 clips/month free, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="default" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow" asChild>
                  <Link href="/auth/signup">Start free</Link>
                </Button>
                <Button
                  size="default"
                  className="bg-transparent border border-white/50 text-white hover:bg-white/10 transition-all"
                  asChild
                >
                  <Link href="/dashboard">View dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="py-8 md:py-12 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <h2 className="text-base font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
                Continue reading
              </h2>
              <div className="flex flex-col gap-4">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="block group">
                    <div className="flex gap-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 p-4 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm transition-all">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                        <Image
                          src={relatedPost.featuredImage || "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=300&h=300&fit=crop&auto=format"}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          sizes="96px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="mb-1.5 text-xs">
                          {getCategoryLabel(relatedPost.category)}
                        </Badge>
                        <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          Read more <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="pagestash-container py-12 px-4">
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            &copy; 2026 PageStash. All rights reserved.
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}

