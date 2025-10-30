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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="pagepouch-container">
          <div className="px-4 py-4 flex items-center justify-between">
            <Link href="/">
              <LogoWithText size={40} clickable={false} />
            </Link>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="font-medium" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button size="sm" className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" asChild>
                <Link href="/auth/signup">Start Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="pagepouch-container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Web Capture Blog
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Learn how to save, organize, and leverage web content for better research outcomes
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-6 border-b border-slate-200 bg-white">
          <div className="pagepouch-container px-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="whitespace-nowrap"
              >
                All Articles
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {getCategoryLabel(category)}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {selectedCategory === 'all' && searchQuery === '' && featuredPost && (
          <section className="py-12 bg-white">
            <div className="pagepouch-container px-4">
              <div className="mb-4">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Featured</Badge>
              </div>
              <Link href={`/blog/${featuredPost.slug}`} className="block">
                <Card className="overflow-hidden hover:shadow-xl transition-all border-2 border-blue-100 cursor-pointer group">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-video md:aspect-auto bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&h=600&fit=crop&auto=format"
                        alt={featuredPost.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-8">
                      <Badge className="mb-4">{getCategoryLabel(featuredPost.category)}</Badge>
                      <h2 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-slate-600 mb-6 text-lg">
                        {featuredPost.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(featuredPost.publishedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredPost.readingTime}
                        </div>
                      </div>
                      <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700">
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

        {/* Blog Posts Grid */}
        <section className="py-12">
          <div className="pagepouch-container px-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">No articles found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
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
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedCategory === 'all' ? 'All Articles' : getCategoryLabel(selectedCategory)}
                  </h2>
                  <p className="text-slate-600 mt-2">
                    Showing {visiblePosts.length} of {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visiblePosts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
                      <Card className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer h-full">
                        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                          <img 
                            src={post.featuredImage || "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600&h=400&fit=crop&auto=format"}
                            alt={post.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryLabel(post.category)}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                            {post.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {post.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
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
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-blue-600 font-medium group-hover:text-blue-700 flex items-center">
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
                      className="font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
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

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="pagepouch-container px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Research Workflow?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Start capturing and organizing web content like a pro. Sign up for your free trial—50 clips included.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
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
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="pagepouch-container py-12 px-4">
          <div className="text-center text-sm text-slate-500">
            &copy; 2025 PagePouch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

