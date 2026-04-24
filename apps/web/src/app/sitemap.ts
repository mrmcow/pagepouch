import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

// Canonical domain — no www, consistent with NEXT_PUBLIC_APP_URL in Vercel env.
// If the env var is set (production), use it; otherwise fall back to the canonical apex domain.
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://pagestash.app').replace(/\/$/, '')

// Slugs for pillar articles that have elevated priority — these are the highest-value
// SEO targets based on GSC impression data and cluster analysis in docs/SEO_DRIVERS.md.
const HIGH_PRIORITY_SLUGS = new Set([
  'best-web-research-tools-2026-reference-guide',
  'what-is-personal-knowledge-management',
  'best-clipping-tool-organizing-research',
  'how-to-create-pkm-system',
  'build-personal-knowledge-management-system',
  'pkm-systems-compared-2026',
  'research-organization-tools-2026',
  'best-workspace-capturing-organizing-research-sources-2026',
  'how-to-preserve-web-pages',
  'best-tools-organizing-research-publications-2026',
  'knowledge-organization-tools-researchers-2026',
  'best-web-research-tools-students-2026',
  'internet-archive-vs-personal-web-stash',
  'archive-candidate-profiles-future-job-openings',
  'pagestash-vs-obsidian-web-clipper',
  'pagestash-vs-pocket',
  'second-brain-web',
  'zettelkasten-web-research-capture',
  'osint-web-archival-tools',
])

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  const blogUrls = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: HIGH_PRIORITY_SLUGS.has(post.slug) ? 0.85 : 0.7,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  return [...staticPages, ...blogUrls]
}

