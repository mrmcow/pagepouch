import { BlogPost } from '@/types/blog'

export const pagestashTorBrowserResearchOsint: BlogPost = {
  slug: 'pagestash-tor-browser-osint-research',
  title: 'PageStash on Tor Browser: Private Web Capture for OSINT-Style Research',
  description:
    'Use PageStash in Tor Browser to capture pages on the Tor network with the same screenshot, HTML, and searchable archive workflow—ethical, legal, public-source research only.',
  excerpt:
    'Tor users can install PageStash like Firefox and preserve volatile pages in a private workspace. Here is how that fits serious, lawful research.',
  author: 'PageStash Team',
  publishedAt: '2026-04-10T23:00:00Z',
  readingTime: 5,
  category: 'guides',
  tags: ['Tor', 'Firefox', 'OSINT', 'privacy', 'web-archiving', 'PageStash', 'research'],
  featuredImage:
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# PageStash on Tor Browser: Private Web Capture for OSINT-Style Research

If you do **open-source research** where **privacy and jurisdiction** matter, you may already work in **Tor Browser**. PageStash runs there the same way it runs in Firefox: install the extension, capture the page, and store **screenshot**, **HTML**, and **searchable text** in your workspace.

This article explains the fit—not a guide to accessing illegal content. **Stay within the law**, respect site terms, and use Tor for **legitimate** research (journalism, security awareness, academic work, compliance) where enhanced privacy is appropriate.

## Why researchers pair Tor with archival capture

- **Volatile sources** can change or vanish; a **timestamped capture** preserves what you saw.
- **Tor** reduces certain fingerprinting and network-level correlation for sensitive desk work.
- **PageStash** gives you **full-text search** and **folders** so captures do not disappear into a folder of PDFs.

## What you actually capture

Each clip can include **visual proof** (screenshot), **structure** (HTML where the page allows), and **extracted text** for search—useful when you need to **revisit wording** later without relying on a live URL.

## Ethics and scope

- Use **public** information and **documented** workflows your organization approves.
- Do not use any tool to harass, stalk, or violate law.
- When in doubt, get **legal** or **compliance** sign-off before retaining third-party pages.

## Try PageStash

[Get PageStash](https://pagestash.app) for Firefox-compatible browsers, including **Tor Browser** when you need that environment for your research stack.
`,
}
