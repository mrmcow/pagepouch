import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { LogoWithText } from '@/components/ui/logo'
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, Tag, ArrowRight } from 'lucide-react'
import { getPostBySlug, getRelatedPosts, formatDate, getCategoryLabel, getAllPosts } from '@/lib/blog'
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

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pagestash.com'
  const postUrl = `${siteUrl}/blog/${post.slug}`
  const imageUrl = post.featuredImage || `${siteUrl}/icons/icon-128.png`

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
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pagestash.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.featuredImage || `${siteUrl}/icons/icon-128.png`,
    datePublished: post.publishedAt,
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
      
      <div className="flex flex-col min-h-screen bg-white">
        {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="pagestash-container">
          <div className="px-4 py-4 flex items-center justify-between">
            <Link href="/">
              <LogoWithText size={40} clickable={false} />
            </Link>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
              <Button size="sm" className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" asChild>
                <Link href="/auth/signup">Start Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="flex-1">
        {/* Article Header */}
        <section className="py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4">
            <Breadcrumbs items={breadcrumbItems} />
            
            <div className="mb-6">
              <Link href="/blog">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  All Articles
                </Button>
              </Link>
            </div>
            
            <Badge className="mb-4">{getCategoryLabel(post.category)}</Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              {post.title}
            </h1>
            
            <p className="text-xl text-slate-600 mb-8">
              {post.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{post.author}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readingTime}
              </div>
            </div>
            
          </div>
        </section>

        {/* Article Body */}
        <article className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Professional Article Styling */}
            <div className="prose prose-lg max-w-none
              [&>*]:font-sans
              
              [&_h1]:text-4xl
              [&_h1]:font-bold
              [&_h1]:text-slate-900
              [&_h1]:mb-6
              [&_h1]:mt-12
              [&_h1]:leading-[1.2]
              [&_h1:first-child]:mt-0
              
              [&_h2]:text-3xl
              [&_h2]:font-bold
              [&_h2]:text-slate-900
              [&_h2]:mt-16
              [&_h2]:mb-6
              [&_h2]:leading-[1.3]
              [&_h2]:pb-3
              [&_h2]:border-b
              [&_h2]:border-slate-200
              
              [&_h3]:text-2xl
              [&_h3]:font-semibold
              [&_h3]:text-slate-900
              [&_h3]:mt-10
              [&_h3]:mb-4
              [&_h3]:leading-[1.4]
              
              [&_h4]:text-xl
              [&_h4]:font-semibold
              [&_h4]:text-slate-800
              [&_h4]:mt-8
              [&_h4]:mb-3
              
              [&_p]:text-slate-700
              [&_p]:text-lg
              [&_p]:leading-relaxed
              [&_p]:mb-5
              
              [&_p_strong]:text-slate-900
              [&_p_strong]:font-semibold
              
              [&_a]:text-blue-600
              [&_a]:font-medium
              [&_a]:no-underline
              [&_a:hover]:text-blue-700
              [&_a:hover]:underline
              
              [&_ul]:my-6
              [&_ul]:space-y-3
              [&_ul]:pl-0
              
              [&_ol]:my-6
              [&_ol]:space-y-3
              [&_ol]:pl-0
              
              [&_li]:text-slate-700
              [&_li]:text-lg
              [&_li]:leading-relaxed
              [&_li]:ml-6
              
              [&_ul_li]:list-disc
              [&_ol_li]:list-decimal
              
              [&_li::marker]:text-blue-500
              
              [&_code]:text-sm
              [&_code]:font-mono
              [&_code]:bg-slate-100
              [&_code]:text-slate-800
              [&_code]:px-1.5
              [&_code]:py-0.5
              [&_code]:rounded
              [&_code]:font-medium
              
              [&_pre]:bg-slate-900
              [&_pre]:text-slate-100
              [&_pre]:rounded-lg
              [&_pre]:p-4
              [&_pre]:my-6
              [&_pre]:overflow-x-auto
              [&_pre]:text-sm
              
              [&_blockquote]:border-l-4
              [&_blockquote]:border-blue-500
              [&_blockquote]:bg-blue-50
              [&_blockquote]:pl-4
              [&_blockquote]:pr-4
              [&_blockquote]:py-3
              [&_blockquote]:my-6
              [&_blockquote]:rounded-r
              [&_blockquote]:italic
              [&_blockquote]:text-slate-700
              
              [&_hr]:border-t
              [&_hr]:border-slate-300
              [&_hr]:my-12
              
              [&_img]:rounded-lg
              [&_img]:shadow-md
              [&_img]:my-8
              [&_img]:w-full
              
              [&_table]:w-full
              [&_table]:my-8
              [&_table]:border-collapse
              [&_table]:bg-white
              [&_table]:shadow-lg
              [&_table]:rounded-xl
              [&_table]:overflow-hidden
              [&_table]:border
              [&_table]:border-slate-200
              
              [&_thead]:bg-blue-600
              
              [&_th]:px-4
              [&_th]:py-5
              [&_th]:text-center
              [&_th]:text-sm
              [&_th]:font-bold
              [&_th]:text-white
              [&_th]:tracking-wide
              [&_th:first-child]:text-left
              [&_th:first-child]:pl-6
              [&_th:first-child]:uppercase
              
              [&_td]:px-4
              [&_td]:py-5
              [&_td]:text-center
              [&_td]:text-base
              [&_td]:text-slate-700
              [&_td]:border-b
              [&_td]:border-slate-100
              [&_td:first-child]:text-left
              [&_td:first-child]:pl-6
              [&_td:first-child]:font-semibold
              [&_td:first-child]:text-slate-900
              
              [&_tbody_tr:last-child_td]:border-b-0
              [&_tbody_tr:hover]:bg-blue-50
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
              [&_th_img]:p-1.5
              [&_th_img]:border
              [&_th_img]:border-blue-200
              
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
        <section className="py-8 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">TOPICS</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-3xl mx-auto px-4">
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
              <CardContent className="p-8 md:p-12 text-center text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Put These Tips Into Action
                </h3>
                <p className="text-lg text-blue-100 mb-8">
                  Start organizing your research with PageStash. Sign up for your free trial—10 clips/month included.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg" asChild>
                    <Link href="/auth/signup">Start Free Trial</Link>
                  </Button>
                  <Button 
                    size="lg" 
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all" 
                    asChild
                  >
                    <Link href="/dashboard">View Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="py-12">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="block">
                    <Card className="hover:shadow-lg transition-all group cursor-pointer h-full">
                      <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                        <img 
                          src={relatedPost.featuredImage || "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600&h=400&fit=crop&auto=format"}
                          alt={relatedPost.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    <CardContent className="p-6">
                      <Badge variant="secondary" className="mb-3 text-xs">
                        {getCategoryLabel(relatedPost.category)}
                      </Badge>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {relatedPost.description}
                      </p>
                      <div className="text-blue-600 font-medium group-hover:text-blue-700 flex items-center text-sm">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="pagestash-container py-12 px-4">
          <div className="text-center text-sm text-slate-500">
            &copy; 2026 PageStash. All rights reserved.
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}

