import { BlogPost } from '@/types/blog'

export const zettelkastenWebResearchCapture: BlogPost = {
  slug: 'zettelkasten-for-web-research-capture-connect-retrieve',
  title: 'Zettelkasten for Web Research: Capture, Connect, Retrieve',
  description:
    'Apply the Zettelkasten method to web research. Learn how to capture web pages as source material, create atomic notes from them, and build a connected knowledge graph.',
  excerpt:
    'Niklas Luhmann never had to worry about link rot. You do. Here is how to combine Zettelkasten principles with web archiving so your sources survive.',
  author: 'PageStash Team',
  publishedAt: '2026-04-11T08:30:00Z',
  readingTime: 6,
  category: 'guides',
  tags: ['PKM', 'Zettelkasten', 'knowledge-management', 'research', 'web-clipping', 'second-brain'],
  featuredImage:
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# Zettelkasten for Web Research: Capture, Connect, Retrieve

The Zettelkasten method—atomic notes, unique identifiers, explicit links between ideas—has become the gold standard for personal knowledge management. Tools like Obsidian, Logseq, and Roam make it practical for digital note-takers.

But there is a gap in most Zettelkasten workflows: **what happens to the source material?**

You read an article, extract an insight, write an atomic note, and link it to three other notes. Excellent. Then the article gets updated, the URL breaks, or the paywall changes. Your note references a ghost. The **provenance** of your idea is lost.

This article adds a layer to the Zettelkasten workflow: **archiving the web sources** your notes are built on.

## The source preservation problem

Luhmann worked with books and journal articles—**stable, physical artifacts** that did not change after publication. Web sources are the opposite:

- **25% of web pages** linked in academic papers are inaccessible within six years
- News articles get silently corrected, retracted, or moved behind paywalls
- Blog posts are updated without version history
- Social media posts are deleted or edited

If your Zettelkasten references a URL, you are building knowledge on a foundation that may not be there next year. A **web archive** replaces that fragile link with a **permanent, searchable capture** of what the page said when you read it.

## The adapted workflow

### Traditional Zettelkasten flow

1. Encounter source → 2. Read and think → 3. Write atomic note → 4. Link to existing notes → 5. Add bibliographic reference

### Web-adapted Zettelkasten flow

1. Encounter web source → **1b. Capture the full page** → 2. Read and think → 3. Write atomic note → 4. Link to existing notes → 5. Reference the **archived capture** (not just the URL)

Step 1b is the addition. It takes ten seconds and ensures the source persists regardless of what happens to the live URL.

## Connecting captures to notes

Your atomic notes live in your Zettelkasten tool (Obsidian, Logseq, Roam, or even plain text files). Your web captures live in a web archive. The bridge between them is **consistent referencing**.

**In your atomic note:**

\`\`\`markdown
# Onboarding friction reduces activation by 20-30%

Source: ProductLed Growth Report 2026
Archived: [PageStash capture] — captured 2026-04-10
Tags: #onboarding #activation #product-led-growth

Insight: The report quantifies what most PMs intuit—each
additional onboarding step compounds drop-off. The 20-30%
range aligns with Mixpanel's 2025 benchmarks.

Links: [[Activation metrics]], [[Onboarding design patterns]]
\`\`\`

The archived link means you can always return to **exactly what the page said** when you formed this idea—even if the original report is later gated, updated, or taken down.

## Why this matters for knowledge compounding

The power of a Zettelkasten is **emergence over time**. Notes written today connect to notes written months ago, and new patterns surface from the graph. But this only works if you can **trust your sources**.

When a connection between two notes traces back to a web page that no longer exists, you cannot verify the foundation. You cannot check whether your interpretation was faithful to the original. You cannot cite it in a paper, a report, or a presentation with confidence.

**Archived sources make your Zettelkasten auditable.** Every claim can be traced back to a timestamped, full-fidelity capture.

## Tags that bridge both systems

Use a shared vocabulary between your Zettelkasten and your web archive:

- **Project tags:** \`#thesis-chapter-3\`, \`#competitor-audit-q2\`, \`#blog-series\`
- **Topic tags:** \`#behavioral-economics\`, \`#ux-patterns\`, \`#climate-policy\`
- **Source type tags:** \`#primary-source\`, \`#opinion\`, \`#data\`, \`#case-study\`

When you search your web archive for \`#thesis-chapter-3\`, you get every source page you captured for that section. When you search your Zettelkasten for the same tag, you get your atomic notes. Together, they form a **complete research trail**.

## Knowledge graphs as Zettelkasten visualization

If your web archive includes a **knowledge graph** feature, the connections between captured pages can mirror and extend your Zettelkasten's link structure:

- Pages from the **same domain** cluster together, revealing which sources you rely on most
- Pages sharing **tags** show topic density
- Pages captured in the **same session** suggest research threads

This is not a replacement for the Zettelkasten's note-level graph—it is a **source-level graph** that complements it.

## Getting started

1. **Keep your Zettelkasten tool** for notes, outlines, and your own thinking.
2. **Add a web archive** for the external pages your notes reference.
3. **Capture before you read** — make it the first step, not an afterthought.
4. **Link consistently** — every atomic note that references a web source includes a link to the archived capture.
5. **Review quarterly** — scan your archive for sources you never turned into notes. They may hold ideas you missed.

[PageStash](https://pagestash.app) captures full web pages with screenshot, HTML, and searchable text—a durable source layer beneath your Zettelkasten. Install the extension and start preserving the foundations of your knowledge.

[Try PageStash free →](/auth/signup)
`,
}
