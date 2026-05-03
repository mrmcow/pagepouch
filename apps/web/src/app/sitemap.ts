import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { SITE_URL } from '@/lib/site-url'

/**
 * Sitemap scope (Google Search Console):
 * - Lists every public URL we want crawlers to discover: homepage, marketing landers,
 *   blog index, legal/docs, auth entry points, and one row per blog post from `getAllPosts()`.
 * - Sitemaps aid discovery; they do not guarantee indexing or rankings. Strong pages,
 *   clear canonicals (`SITE_URL` in `lib/site-url.ts`), internal links, and `robots.ts`
 *   matter more than `priority` / `changeFrequency` (Google largely treats those as hints).
 * - Keep authenticated surfaces (e.g. `/dashboard`, `/knowledge-graph`) out of here —
 *   they are disallowed in `robots.ts` and should not be submitted as index targets.
 */

// Pillar + intent-cluster posts: slightly higher `priority` hint (optional for Google).
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
  // Intent cluster 2026 (all 30) — commercial / research-intent articles
  'how-to-archive-webpage-before-changes-disappears-2026',
  'best-tools-save-webpages-research-2026',
  'save-webpage-with-notes-metadata-context-2026',
  'webpage-archiving-vs-bookmarking-researchers-2026',
  'bookmark-manager-alternatives-serious-research-2026',
  'organize-online-research-without-losing-sources-2026',
  'research-workflow-analysts-browser-tabs-2026',
  'build-digital-research-archive-2026',
  'best-research-tools-analysts-2026',
  'turn-web-research-into-better-reports-2026',
  'best-osint-tools-capture-organize-web-evidence-2026',
  'osint-analysts-save-sources-investigations-2026',
  'preserve-web-evidence-without-screenshots-only-2026',
  'osint-workflow-collect-review-tag-report-2026',
  'screenshots-not-enough-online-investigations-2026',
  'best-tools-threat-intelligence-analysts-tracking-sources-2026',
  'threat-intelligence-teams-track-web-sources-2026',
  'save-forums-blogs-pages-threat-research-2026',
  'research-tools-journalists-online-sources-2026',
  'journalists-archive-web-sources-before-change-2026',
  'best-tools-investigative-researchers-2026',
  'source-library-investigations-workflow-2026',
  'save-online-sources-compliance-audit-trails-2026',
  'web-capture-tools-legal-compliance-research-teams-2026',
  'capture-webpages-client-reports-consulting-2026',
  'browser-bookmarks-broken-research-workflows-2026',
  'stop-losing-useful-links-during-research-2026',
  'best-tools-personal-web-archive-2026',
  'save-webpages-later-without-losing-context-2026',
  'pagestash-vs-bookmarks-vs-read-later-apps-2026',
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
      url: `${SITE_URL}/archive-webpage`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.92,
    },
    {
      url: `${SITE_URL}/osint-tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.92,
    },
    {
      url: `${SITE_URL}/osint-tools-uk`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/osint-tools-us`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/research-workflow`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.92,
    },
    {
      url: `${SITE_URL}/research-tools-for-journalists`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/save-webpage-as-pdf-alternative`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/bookmark-manager-alternative`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.72,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.45,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.45,
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

