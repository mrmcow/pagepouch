import { BlogPost, BlogListItem, BlogCategory } from '@/types/blog'
import { allPosts } from '@/content/blog/posts'

export function getAllPosts(): BlogListItem[] {
  return allPosts
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map(post => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      category: post.category,
      tags: post.tags,
      featuredImage: post.featuredImage,
    }))
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find(post => post.slug === slug)
}

export function getPostsByCategory(category: BlogCategory): BlogListItem[] {
  return getAllPosts().filter(post => post.category === category)
}

export function getPostsByTag(tag: string): BlogListItem[] {
  return getAllPosts().filter(post => post.tags.includes(tag))
}

export function getRelatedPosts(slug: string, limit: number = 3): BlogListItem[] {
  const currentPost = getPostBySlug(slug)
  if (!currentPost) return []

  const allPosts = getAllPosts().filter(post => post.slug !== slug)
  
  // Score posts by relevance
  const scoredPosts = allPosts.map(post => {
    let score = 0
    
    // Same category = high relevance
    if (post.category === currentPost.category) score += 10
    
    // Shared tags
    const sharedTags = post.tags.filter(tag => currentPost.tags.includes(tag))
    score += sharedTags.length * 5
    
    return { post, score }
  })
  
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post)
}

export function getAllTags(): string[] {
  const tags = new Set<string>()
  allPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
}

export function getAllCategories(): BlogCategory[] {
  return [
    'productivity',
    'use-cases',
    'comparisons',
    'guides'
  ]
}

export function getCategoryLabel(category: BlogCategory): string {
  const labels: Record<BlogCategory, string> = {
    'productivity': 'Productivity',
    'use-cases': 'Use Cases',
    'comparisons': 'Comparisons',
    'guides': 'Guides',
    'how-to': 'How-To'
  }
  return labels[category] || category
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

