import { BlogPost } from '@/types/blog'

export const captureEvidenceFromWebOsint: BlogPost = {
  slug: 'capture-evidence-from-web',
  title: 'Capture Evidence From the Web: What Serious Researchers Actually Save',
  description:
    'High-intent guide to evidence-oriented capture: screenshots, HTML, metadata, and search—framed for analysts, journalists, and OSINT-style public-source work.',
  excerpt:
    'Evidence is not a URL. It is a dated snapshot you can retrieve, quote, and explain to someone who was not there.',
  author: 'PageStash Team',
  publishedAt: '2026-04-10T22:20:00Z',
  readingTime: 7,
  category: 'guides',
  tags: ['evidence', 'OSINT', 'investigation', 'archiving', 'PageStash'],
  featuredImage:
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# Capture Evidence From the Web

**Capture evidence from the web** is a different goal than **saving something to read later**. Evidence work means you may need to show **what was published**, **when you saw it**, and **in what context**—ethically and legally, using **appropriate** sources and approvals.

## Minimum useful bundle

- **Visual snapshot** of the page (layout and non-text cues).
- **Extracted text** for search and quoting (where technically reliable).
- **Stable metadata**: URL, title, capture time stored by your tool.
- **Your note**: why you saved it and how it relates to other clips.

## Habits that scale

- **Folder** or tag by **matter** / **project**, not only by topic.
- **Capture early** in volatile stories—corrections and takedowns happen fast.
- **Avoid** mixing personal browsing with case files; use **consistent** accounts or browsers if your policy requires it.

## PageStash

[PageStash](https://pagestash.app) combines **browser capture** with a **searchable workspace** and **Page Graphs** to relate sources—useful when your “evidence” is dozens of pages, not one screenshot.

**Disclaimer:** PageStash is a **productivity archive**, not legal chain-of-custody software. For **litigation**, follow counsel on **preservation** and **authentication**.
`,
}
