import { BlogPost } from '@/types/blog'

export const phdSourcePreservation: BlogPost = {
  slug: 'phd-student-web-source-preservation',
  title: 'PhD Students: Preserving Web Sources for Literature Reviews and Chapters',
  description: 'Grey literature, blogs, and agency PDFs vanish. A practical approach to clipping and organizing web sources alongside your reference manager.',
  excerpt: 'Your reference manager handles DOIs; the open web needs its own preservation layer.',
  author: 'PageStash Team',
  publishedAt: '2026-03-28',
  readingTime: 6,
  category: 'use-cases',
  tags: ['PhD', 'academic-research', 'literature-review', 'web-archiving', 'students'],
  featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# PhD Students: Preserving Web Sources for Literature Reviews and Chapters

Doctoral work draws on **journals** *and* **grey literature**: agency reports, working papers on the web, practitioner blogs, and datasets described on project sites. Those URLs are **high-churn**.

## What Zotero (etc.) does vs what it misses

Reference managers excel at **citable metadata** for stable publications. They are weaker when:

- The “publication” is a **web page** that may move
- You need the **exact wording** of a policy paragraph six months later
- You want to **search** across informal sources like you search PDFs

## Add a web archive layer

1. When a web source influences a claim, **clip the page**.
2. Keep **your PDFs in Zotero** and **your web captures in PageStash**—linked by habit (paste URL in notes, or consistent naming).
3. Use **full-text search** to recover quotes when drafting.

## Ethics reminder

Clip what you have **lawful access** to. Archiving is for **your research workspace**, not for redistributing paywalled content.

[Try PageStash for web sources →](/auth/signup)
`,
}
