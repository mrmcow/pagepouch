import { BlogPost } from '@/types/blog'

export const obsidianWebClippingWorkflow: BlogPost = {
  slug: 'web-clipping-for-obsidian-users-full-page-capture',
  title: 'Web Clipping for Obsidian Users: Full-Page Capture Without Bloating Your Vault',
  description:
    'Obsidian is for thinking. Web archives are for evidence. Learn a workflow that keeps your vault clean while preserving full web pages with screenshots and search.',
  excerpt:
    'Your Obsidian vault should hold your thoughts, not 200 MB of raw HTML. Here is how to split the work between a notes tool and a web archive.',
  author: 'PageStash Team',
  publishedAt: '2026-04-11T08:10:00Z',
  readingTime: 5,
  category: 'guides',
  tags: ['Obsidian', 'PKM', 'web-clipping', 'local-first', 'research', 'second-brain'],
  featuredImage:
    'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# Web Clipping for Obsidian Users: Full-Page Capture Without Bloating Your Vault

If you use **Obsidian**, you value **local-first ownership**, plain-text durability, and a vault you control. That philosophy breaks down the moment you start pasting raw HTML into markdown files.

The Obsidian Web Clipper converts pages to markdown. The result is often **stripped of layout, images, interactive elements, and the visual context** that made the page worth saving. Your vault gains a wall of reformatted text. The original page—the one you actually read—is gone.

There is a cleaner split: **let Obsidian hold your thinking** and let a dedicated web archive hold the **evidence**.

## The vault-bloat problem

Clipping full web pages into Obsidian creates several issues:

- **File size.** A single HTML-to-markdown conversion can produce a 50 KB note. Fifty of those per week and your vault grows by 130 MB per year—before images.
- **Broken rendering.** Complex layouts, tables, embedded media, and interactive elements do not survive markdown conversion. You save a skeleton.
- **Search noise.** When your vault mixes original notes with clipped web content, graph view becomes a tangle and search results dilute your own thinking with someone else's copy.
- **No visual proof.** Markdown strips the screenshot. If the original page changes or disappears, you have reformatted text with no evidence of what the page actually looked like.

## Split responsibilities cleanly

| Responsibility | Tool |
|---------------|------|
| Your synthesis, outlines, and atomic notes | **Obsidian** |
| Full-fidelity web captures (screenshot + HTML + text) | **Web archive** (PageStash) |
| Linking the two | **A URL in your Obsidian note pointing to the archived clip** |

The connection between them is a single line in your Obsidian note:

\`\`\`markdown
Source: [Archived page](https://pagestash.app/dashboard) — captured 2026-04-10
\`\`\`

Your note stays **lightweight**. The archived page stays **complete**. When you need the original, you follow the link. When you need your analysis, you stay in the vault.

## A practical workflow

**Step 1: Capture the page.** When you find a web page worth keeping, capture it with the PageStash extension. Screenshot, HTML, extracted text—all stored and searchable.

**Step 2: Write your note in Obsidian.** Open your vault and create a note with your own thinking: what matters about this page, how it connects to your project, what questions it raises.

**Step 3: Link back.** Paste the source URL (or the PageStash clip URL) at the top of your Obsidian note. Tag both the note and the clip with the same project or topic label so you can cross-reference.

**Step 4: Retrieve from either side.** Need the original page? Search PageStash by phrase, tag, or domain. Need your analysis? Search Obsidian. The two systems complement without duplicating.

## What you preserve that markdown clipping loses

| What | Obsidian Web Clipper | Full-page archive |
|------|---------------------|-------------------|
| Visual layout and design | ❌ Stripped | ✅ Screenshot |
| Interactive elements | ❌ Lost | ✅ HTML preserved |
| Images and media | ⚠️ Often broken links | ✅ Captured in screenshot |
| Searchable text | ✅ Markdown text | ✅ Extracted full text |
| Proof of what page showed | ❌ No visual record | ✅ Timestamped screenshot |
| Vault cleanliness | ❌ Bloats vault | ✅ Stored externally |

## For the local-first purist

A fair objection: "I chose Obsidian because I own my data. Why would I send web captures to a cloud service?"

Two responses:

1. **Your notes are still local.** The web archive holds external pages you do not author. Your vault remains yours, on your disk, in plain text.
2. **You can export.** PageStash lets you download screenshots and text. If you ever want a local backup of your archived pages, you can pull them down.

The local-first principle is about **owning your thinking**. Web pages are someone else's content—archiving them in a purpose-built tool does not compromise your vault's integrity.

## Tags that bridge both systems

Use a consistent tagging vocabulary across Obsidian and your web archive:

- Project names: \`#thesis\`, \`#competitor-audit\`, \`#product-launch\`
- Content types: \`#reference\`, \`#inspiration\`, \`#evidence\`
- Status: \`#to-process\`, \`#cited\`, \`#archived\`

When tags match across both tools, you can search either one and find related material in the other.

## Get started

[PageStash](https://pagestash.app) captures full pages with screenshots, HTML, and searchable text—the perfect complement to an Obsidian vault that stays lean and focused on your own ideas.

[Try PageStash free →](/auth/signup)
`,
}
