import { BlogPost } from '@/types/blog'

export const archiveSocialMediaPostsEvidence: BlogPost = {
  slug: 'how-to-archive-social-media-posts-before-they-disappear',
  title: 'How to Archive Social Media Posts Before They Disappear',
  description:
    'Social media posts get deleted, edited, and taken down. Learn how journalists, OSINT analysts, and researchers capture social media evidence with timestamped web archives.',
  excerpt:
    'A tweet gets deleted. A LinkedIn post is edited. An Instagram story expires. If you did not capture it, it never happened. Here is how to fix that.',
  author: 'PageStash Team',
  publishedAt: '2026-04-11T08:20:00Z',
  readingTime: 6,
  category: 'guides',
  tags: ['OSINT', 'journalism', 'social-media', 'evidence', 'archiving', 'web-capture'],
  featuredImage:
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# How to Archive Social Media Posts Before They Disappear

A CEO tweets something inflammatory and deletes it within the hour. A government agency edits a Facebook post after public backlash. A product company quietly removes a claim from their LinkedIn page.

If you are a **journalist**, **OSINT analyst**, **legal professional**, or **researcher**, the original version of that post is your evidence. Once it is gone from the platform, it is gone—unless you archived it.

## Why social media archiving matters

**Posts are volatile by design.** Platforms give authors full control to delete, edit, or restrict visibility at any time. Stories and ephemeral content have built-in expiration. Even "permanent" posts disappear when accounts are suspended or deactivated.

**Edits leave no public trail.** Most platforms do not show edit history to viewers. A statement can be softened, a claim can be removed, and there is no visible record that it ever said something different.

**Platform exports are incomplete.** Requesting your own data archive from a platform gives you *your* posts, not someone else's. For third-party content, you need your own capture.

## What to capture and when

### Capture immediately when you see

- **Statements from public figures** — politicians, executives, spokespeople
- **Claims about products or services** — pricing, features, guarantees
- **Threats, harassment, or policy violations** — evidence for reports or legal proceedings
- **Breaking news posts** — first-hand accounts that may be retracted
- **Hiring posts or job listings** — useful for market intelligence and recruitment research

### What a good capture includes

A screenshot alone is easy to dispute. A **full-page capture** with screenshot, HTML, and extracted text is substantially more credible because it preserves:

- **Visual context** — the post as it appeared, including surrounding UI elements, timestamps, and engagement metrics
- **Text content** — searchable and quotable, not locked inside an image
- **Page structure** — the HTML confirms the content was served by the platform, not fabricated in an image editor
- **Capture timestamp** — when *you* saved it, separate from when the post was published

## Platform-specific considerations

### X / Twitter

Public tweets render well as full-page captures. Capture the individual tweet URL (click the timestamp to get the permalink) rather than the feed view. This isolates the post with its metadata.

### LinkedIn

LinkedIn pages require login for most content. Use the browser extension while logged in to capture the post in its authenticated context. Public company pages and some posts are accessible without login.

### Facebook and Instagram

Public posts and pages can be captured directly. Authenticated content requires capturing while logged in. Stories and reels have limited capture windows—archive them during the availability period.

### Reddit

Reddit threads are publicly accessible and capture cleanly. Archive the full thread URL including the comment you need, not just the subreddit listing.

## Building a social media evidence workflow

**Step 1: Capture the post** using a browser extension that saves screenshot + HTML + text. One click, no configuration.

**Step 2: Tag by investigation or project.** Use tags like the subject's name, the platform, and the topic. Example: \`ceo-smith\`, \`twitter\`, \`product-claims\`.

**Step 3: Add a brief note** with context—why you captured this, what it relates to.

**Step 4: Organize by case or project** in folders. A folder per investigation keeps evidence grouped.

**Step 5: Retrieve by searching** the extracted text when you need to find a specific quote or claim later.

## Legal and ethical considerations

- **Capture public content.** Archiving publicly visible posts is standard practice in journalism, legal discovery, and open-source research.
- **Respect private content.** Do not capture content from private accounts or restricted groups without proper authorization.
- **Note the distinction between archiving and surveillance.** Saving a public post for evidence or reporting is different from systematic monitoring of individuals. Stay within your organization's policies and applicable law.
- **Timestamps support credibility.** A capture with a clear timestamp is stronger evidence than a screenshot with no metadata.

## Why the Wayback Machine is not enough for social media

The Internet Archive's Wayback Machine is excellent for static web pages. It is **unreliable for social media** because:

- Most social media pages are **dynamically rendered** and resist automated crawling
- Crawl frequency is **unpredictable** — a post may be deleted before it is ever archived
- Authenticated content is **not captured** at all
- You cannot **trigger a capture on demand** with the reliability you need for evidence

For social media, **you are your own archivist**. If you see it and it matters, capture it yourself.

## Get started

[PageStash](https://pagestash.app) captures any page you can see in your browser—screenshot, HTML, and searchable text—with timestamps and organization built in. Install the extension and start archiving the social media evidence that matters to your work.

[Try PageStash free →](/auth/signup)
`,
}
