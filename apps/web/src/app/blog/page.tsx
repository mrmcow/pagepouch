'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogoWithText } from '@/components/ui/logo'
import { Search, Calendar, Clock, ArrowRight, Tag } from 'lucide-react'
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
              <LogoWithText size={40} clickable={false} />
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
        {/* Hero Section - Premium */}
        <section className="relative pt-32 pb-16 bg-white dark:bg-slate-950 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent blur-[160px]" />
            <div className="absolute bottom-[-100px] -left-24 w-[480px] h-[480px] bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-transparent blur-[150px]" />
          </div>

          <div className="pagestash-container px-4 sm:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
                Web Capture Blog
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 font-light">
                Learn how to save, organize, and leverage web content for better research outcomes
              </p>
              
              {/* Search Bar - Modern */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter - Premium */}
        <section className="py-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="pagestash-container px-4 sm:px-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={`whitespace-nowrap rounded-full ${selectedCategory === 'all' ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900' : 'border-slate-200 dark:border-slate-700'}`}
              >
                All Articles
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full ${selectedCategory === category ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  {getCategoryLabel(category)}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post - Premium */}
        {selectedCategory === 'all' && searchQuery === '' && featuredPost && (
          <section className="py-12 bg-white dark:bg-slate-950">
            <div className="pagestash-container px-4 sm:px-6">
              <div className="mb-6">
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">Featured</Badge>
              </div>
              <Link href={`/blog/${featuredPost.slug}`} className="block">
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-white/10 cursor-pointer group rounded-3xl">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-video md:aspect-auto bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&h=600&fit=crop&auto=format"
                        alt={featuredPost.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-8 dark:bg-slate-900">
                      <Badge className="mb-4 rounded-full">{getCategoryLabel(featuredPost.category)}</Badge>
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg font-light">
                        {featuredPost.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(featuredPost.publishedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredPost.readingTime}
                        </div>
                      </div>
                      <div className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </div>
          </section>
        )}

        {/* Blog Posts Grid - Premium */}
        <section className="py-12 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="pagestash-container px-4 sm:px-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-300 text-lg">No articles found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedCategory === 'all' ? 'All Articles' : getCategoryLabel(selectedCategory)}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Showing {visiblePosts.length} of {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visiblePosts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
                      <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900">
                        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                          <img 
                            src={post.featuredImage || "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600&h=400&fit=crop&auto=format"}
                            alt={post.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs rounded-full">
                              {getCategoryLabel(post.category)}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-white">
                            {post.title}
                          </CardTitle>
                          <CardDescription className="mt-2 dark:text-slate-400">
                            {post.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(post.publishedAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.readingTime}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs rounded-full dark:border-slate-700">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center">
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMorePosts && (
                  <div className="flex justify-center mt-12">
                    <Button
                      onClick={handleLoadMore}
                      size="lg"
                      variant="outline"
                      className="font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all rounded-full px-8"
                    >
                      Load More Articles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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

