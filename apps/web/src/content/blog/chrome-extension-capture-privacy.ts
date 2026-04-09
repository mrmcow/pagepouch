import { BlogPost } from '@/types/blog'

export const chromeExtensionCapturePrivacy: BlogPost = {
  slug: 'browser-extension-web-capture-privacy-basics',
  title: 'Browser Extension Web Capture: Privacy Basics for Researchers (2026)',
  description: 'What happens when a clipper saves a page? A plain-language guide to choosing tools that match your threat model.',
  excerpt: 'Not all clippers are equal. Here is how to think about privacy when you archive the web.',
  author: 'PageStash Team',
  publishedAt: '2026-03-14',
  readingTime: 6,
  category: 'guides',
  tags: ['privacy', 'Chrome', 'browser-extension', 'security', 'research'],
  featuredImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# Browser Extension Web Capture: Privacy Basics for Researchers (2026)

**Web clippers** run close to your browsing. A sane privacy review asks: **what is sent**, **where it lives**, and **who can read it**.

## Questions to ask any vendor

- Is content **encrypted in transit and at rest**?
- Can you **export** or **delete** your data?
- Is the product **clear** about whether humans train on your clips?

## Threat models

- **Individual researcher**: care about **account security** and **clean capture** of only what you intend.
- **Sensitive work**: pair archival tools with **policy**—do not clip **secrets** or **personal data** you should not store.

## PageStash positioning

PageStash focuses on **your research library**: capture **full page + screenshot**, **search** your own corpus, and use **knowledge graphs** for exploration—without positioning itself as a bookmark toy.

[Review PageStash and sign up →](/auth/signup)

## Habit

**Clip deliberately**—the best privacy control is **not archiving** what should never leave the browser.
`,
}
