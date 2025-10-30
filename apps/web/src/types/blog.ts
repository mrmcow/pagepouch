export interface BlogPost {
  slug: string
  title: string
  description: string
  content: string
  excerpt: string
  author: string
  publishedAt: string
  readingTime: number
  category: BlogCategory
  tags: string[]
  featuredImage: string
  featured: boolean
}

export type BlogCategory = 
  | 'productivity'
  | 'use-cases'
  | 'comparisons'
  | 'guides'
  | 'how-to'

export interface BlogListItem {
  slug: string
  title: string
  description: string
  publishedAt: string
  readingTime: number
  category: BlogCategory
  tags: string[]
  featuredImage: string
}

