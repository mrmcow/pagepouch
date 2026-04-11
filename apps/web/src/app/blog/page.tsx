'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogoWithText } from '@/components/ui/logo'
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react'
import { getAllPosts, getAllCategories, getCategoryLabel, formatDate } from '@/lib/blog'
import { BlogCategory } from '@/types/blog'

const INITIAL_POSTS_COUNT = 9
const LOAD_MORE_COUNT = 6

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all')
  const [visiblePostsCount, setVisiblePostsCount] = useState(INITIAL_POSTS_COUNT)
  
  const allPosts = getAllPosts()
  const categories = getAllCategories()
  
  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })
  
  const visiblePosts = filteredPosts.slice(0, visiblePostsCount)
  const hasMorePosts = filteredPosts.length > visiblePostsCount
  
  const handleLoadMore = () => {
    setVisiblePostsCount(prev => prev + LOAD_MORE_COUNT)
  }
  
  // Reset visible count when filters change
  React.useEffect(() => {
    setVisiblePostsCount(INITIAL_POSTS_COUNT)
  }, [searchQuery, selectedCategory])
  
  const featuredPost = allPosts[0]

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      {/* Header - Premium */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10">
        <div className="pagestash-container px-4 sm:px-6">
          <div className="py-4 flex items-center justify-between">
            <Link href="/">
              <LogoWithText
                size={40}
                clickable={false}
                textClassName="!text-slate-900 dark:!text-white"
              />
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-full" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button size="sm" className="font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-md hover:shadow-lg transition-all px-6 h-10 rounded-full" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero + Filters — unified header */}
        <section className="relative pt-28 pb-10 bg-white dark:bg-slate-950 overflow-hidden border-b border-slate-200 dark:border-white/10">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-gradient-to-br from-blue-500/15 via-cyan-500/8 to-transparent blur-[130px]" />
          </div>

          <div className="pagestash-container px-4 sm:px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Eyebrow label */}
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500 mb-4">From the PageStash team</p>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-3">
                    Research &amp; Productivity
                  </h1>
                  <p className="text-lg text-slate-500 dark:text-slate-400 font-light max-w-xl">
                    Guides, comparisons, and workflows for researchers who take their tools seriously.
                  </p>
                </div>

                {/* Inline search */}
                <div className="relative w-full sm:w-64 flex-shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Search articles…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 text-sm rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Category pills — part of the header */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                  >
                    {getCategoryLabel(category)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post — editorial strip */}
        {selectedCategory === 'all' && searchQuery === '' && featuredPost && (
          <section className="py-10 bg-white dark:bg-slate-950">
            <div className="pagestash-container px-4 sm:px-6">
              <Link href={`/blog/${featuredPost.slug}`} className="block group">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 p-8 sm:p-12 hover:shadow-2xl transition-shadow duration-300">
                  {/* Subtle gradient orb */}
                  <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-500/20 to-transparent blur-[80px] pointer-events-none" />

                  <div className="relative max-w-3xl">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wide">
                        Featured
                      </span>
                      <span className="text-slate-400 text-xs">{getCategoryLabel(featuredPost.category)}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                    <p className="text-slate-300 text-base sm:text-lg font-light mb-6 max-w-2xl leading-relaxed">
                      {featuredPost.description}
                    </p>
                    <div className="flex items-center gap-5 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(featuredPost.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {featuredPost.readingTime}
                      </span>
                      <span className="inline-flex items-center text-blue-400 font-semibold group-hover:text-blue-300 ml-auto">
                        Read Article
                        <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Articles Grid */}
        <section className="py-12 bg-white dark:bg-slate-950">
          <div className="pagestash-container px-4 sm:px-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-4">No articles match your search.</p>
                <button
                  className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {/* Count line */}
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                  {selectedCategory !== 'all' ? ` in ${getCategoryLabel(selectedCategory)}` : ''}
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-white/10 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                  {visiblePosts.map((post, i) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
                      <article className={`group bg-white dark:bg-slate-950 p-7 h-full flex flex-col hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                        {/* Category + read time row */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                            {getCategoryLabel(post.category)}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readingTime}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-3">
                          {post.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1 mb-5">
                          {post.description}
                        </p>

                        {/* Footer row */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 flex items-center gap-1">
                            Read
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {/* Load More */}
                {hasMorePosts && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={handleLoadMore}
                      className="px-8 py-3 rounded-full border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      Load more articles
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section - Premium */}
        <section className="relative py-24 bg-slate-900 dark:bg-slate-950 overflow-hidden">
          {/* Subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-600/10" />
          <div className="pagestash-container px-4 sm:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                Ready to Transform Your Research Workflow?
              </h2>
              <p className="text-xl text-slate-300 mb-10 font-light">
                Start capturing and organizing web content like a pro. Sign up for your free trial—10 clips/month included.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="h-14 px-8 font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-xl shadow-lg" asChild>
                  <Link href="/auth/signup">Start Free Trial</Link>
                </Button>
                <Button 
                  size="lg" 
                  className="h-14 px-8 font-semibold bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all rounded-xl" 
                  asChild
                >
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Premium */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950">
        <div className="pagestash-container py-12 px-4 sm:px-6">
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            &copy; 2026 PageStash. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

