import { BlogPost } from '@/types/blog'

export const uxCompetitiveAuditCaptureCompare: BlogPost = {
  slug: 'ux-competitive-audit-capture-compare-design-patterns',
  title: 'UX Competitive Audit: Capture and Compare Design Patterns Across Products',
  description:
    'Run a structured UX competitive audit by capturing full web pages from competitors. Compare onboarding, navigation, and interaction patterns with a searchable design archive.',
  excerpt:
    'Stop taking 40 disconnected screenshots. A proper UX audit captures full pages with HTML so you can compare patterns, search by component, and present with evidence.',
  author: 'PageStash Team',
  publishedAt: '2026-04-11T09:10:00Z',
  readingTime: 5,
  category: 'use-cases',
  tags: ['UX', 'competitive-audit', 'design-research', 'design-patterns', 'product-design'],
  featuredImage:
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# UX Competitive Audit: Capture and Compare Design Patterns Across Products

A UX competitive audit is one of the highest-leverage activities a product designer can do before starting a new feature. But the typical process—screenshot a bunch of competitor pages, paste them into a slide deck, add some commentary—produces a deliverable that goes stale within weeks.

The competitors redesign. Your screenshots are orphaned. The next designer who inherits the project starts from zero.

Here is a workflow that produces a **living, searchable audit** instead of a disposable slide deck.

## The problem with screenshot-based audits

**No context.** A screenshot of a competitor's settings page does not show you the hover states, the mobile breakpoints, or the copy below the fold. You captured a frozen moment of one viewport.

**No searchability.** You took 80 screenshots and organized them into a Figma board. Six months later, you need the one showing how Stripe handles inline form validation. Good luck finding it by scrolling.

**No durability.** The competitor launched a redesign. Your audit references a version that no longer exists. You cannot verify your analysis, and you cannot show stakeholders what changed.

## The full-page capture approach

Instead of screenshots, capture **full pages** from each competitor. A full-page capture includes:

- **Screenshot** of the complete page (scrolled to full length)
- **HTML structure** so you can inspect component architecture, CSS patterns, and accessibility markup
- **Extracted text** so every label, heading, and call-to-action is searchable

This is the raw material for a proper audit.

## Structuring the audit

### Step 1: Define your audit dimensions

Before you start capturing, decide what you are comparing. Common dimensions for a UX audit:

| Dimension | What to capture |
|-----------|----------------|
| **Onboarding** | Signup flow, first-run experience, empty states, activation prompts |
| **Navigation** | Primary nav, mobile menu, breadcrumbs, command palette |
| **Core workflow** | The main task the product is built for—how many steps, what friction |
| **Settings and account** | Complexity, organization, billing |
| **Pricing page** | Tier structure, CTAs, comparison tables, FAQ |
| **Error handling** | 404 pages, form validation, permission errors, empty searches |

### Step 2: Capture systematically

For each competitor, capture the same set of pages. Use a consistent tagging system:

- **Competitor name:** \`stripe\`, \`linear\`, \`figma\`
- **Audit dimension:** \`onboarding\`, \`navigation\`, \`pricing\`
- **Component type:** \`form\`, \`modal\`, \`table\`, \`empty-state\`
- **Capture date:** the tag or the automatic timestamp

Consistency matters. When you compare across competitors, you want apples-to-apples coverage.

### Step 3: Analyze across competitors

With captures organized by dimension, you can now:

- **Search for a specific pattern** across all competitors. Query "password validation" and find every captured page that handles it.
- **Compare component approaches** side by side. How does each competitor structure their pricing table?
- **Inspect code-level differences.** Open the HTML to see if competitors use accessible markup, what frameworks underlie their UI, or how they handle responsive breakpoints.

### Step 4: Document findings

Your audit deliverable becomes a **reference document** with links to archived captures. Instead of embedded screenshots that go stale, you link to **living archives** that the team can explore.

\`\`\`markdown
## Onboarding: Signup Flow Comparison

### Stripe
- Steps: 3 (email → verify → business info)
- [Archived capture: signup step 1](link-to-capture)
- Notable: Progressive disclosure—only asks for business type after email verification

### Linear
- Steps: 2 (email → workspace setup)
- [Archived capture: signup](link-to-capture)
- Notable: Workspace creation is the first meaningful action; no separate "profile" step
\`\`\`

## Keeping the audit alive

The difference between a useful audit and a dead slide deck is **maintenance**. Set a quarterly cadence:

1. **Re-capture the same pages** from each competitor
2. **Compare to previous captures** — what changed?
3. **Update your analysis** — note design evolution, new patterns, removed features
4. **Tag re-captures** with the date so you build a temporal record

Over time, your audit becomes a **design evolution timeline** that shows how competitors iterate—invaluable for predicting where your market's UX standards are heading.

## Presenting audit findings

When presenting to stakeholders:

- **Link to archived captures** so anyone can explore the full page, not just a cropped screenshot
- **Quote specific copy** from the extracted text (searchable and verifiable)
- **Reference HTML structure** when arguing for accessibility or implementation complexity
- **Show temporal changes** if you have multi-date captures

This grounds your design recommendations in **evidence**, not opinion.

## Get started

[PageStash](https://pagestash.app) captures full web pages with screenshots, HTML, and searchable text—organized by folders and tags designed for structured research like competitive audits. Start building an audit that lasts.

[Try PageStash free →](/auth/signup)
`,
}
