import Link from 'next/link'
import { BlogPost } from '@/types/blog'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface RelatedArticlesProps {
  currentPostSlug: string
  allPosts: BlogPost[]
  maxResults?: number
}

export function RelatedArticles({ 
  currentPostSlug, 
  allPosts, 
  maxResults = 3 
}: RelatedArticlesProps) {
  // Find the current post to get its tags and category
  const currentPost = allPosts.find(post => post.slug === currentPostSlug)
  
  if (!currentPost) {
    return null
  }

  // Find related posts based on shared tags and category
  const relatedPosts = allPosts
    .filter(post => post.slug !== currentPostSlug)
    .map(post => {
      let score = 0
      
      // Same category = +3 points
      if (post.category === currentPost.category) {
        score += 3
      }
      
      // Shared tags = +1 point each
      const sharedTags = post.tags.filter(tag => currentPost.tags.includes(tag))
      score += sharedTags.length
      
      return { post, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ post }) => post)

  if (relatedPosts.length === 0) {
    // If no related posts, just show recent posts
    return (
      <section className="mt-16 pt-16 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">
          Recent Articles
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {allPosts
            .filter(post => post.slug !== currentPostSlug)
            .slice(0, maxResults)
            .map(post => (
              <RelatedArticleCard key={post.slug} post={post} />
            ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mt-16 pt-16 border-t border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">
        Related Articles
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {relatedPosts.map(post => (
          <RelatedArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}

function RelatedArticleCard({ post }: { post: BlogPost }) {
  return (
    <Link 
      href={`/blog/${post.slug}`}
      className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300"
    >
      {post.featuredImage && (
        <div className="mb-4 aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary" className="text-xs">
          {post.category}
        </Badge>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {post.readingTime} min read
        </span>
      </div>
      
      <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {post.title}
      </h3>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
        {post.excerpt}
      </p>
      
      <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
        Read more 
        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

