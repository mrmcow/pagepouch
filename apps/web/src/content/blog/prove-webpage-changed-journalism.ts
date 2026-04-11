import { BlogPost } from '@/types/blog'

export const proveWebpageChangedJournalism: BlogPost = {
  slug: 'how-journalists-prove-webpage-changed-after-publication',
  title: 'How Journalists Prove a Webpage Changed After Publication',
  description:
    'Statements get edited, claims get softened, pages get taken down. Learn the practical workflow journalists use to capture and prove web content changes over time.',
  excerpt:
    'The press release said one thing on Tuesday. By Friday, the wording had changed. If you did not archive the original, you cannot prove it.',
  author: 'PageStash Team',
  publishedAt: '2026-04-11T08:40:00Z',
  readingTime: 5,
  category: 'use-cases',
  tags: ['journalism', 'fact-checking', 'evidence', 'web-archiving', 'accountability', 'OSINT'],
  featuredImage:
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# How Journalists Prove a Webpage Changed After Publication

A company publishes a press release claiming their product "eliminates" a security vulnerability. You report on it. Three days later, the press release now says "mitigates." No correction notice, no edit log, no acknowledgment that the language changed.

If you did not capture the original, you have a problem.

**Web pages change silently.** Statements are softened, data points are removed, entire pages are taken down. For journalists and fact-checkers, proving what a page said on a specific date is not optional—it is the foundation of accountability reporting.

## Why this matters now more than ever

**Silent edits are routine.** Organizations update web content without marking changes. Press releases, policy pages, product claims, and executive statements all shift over time. Unlike print, there is no built-in paper trail.

**Source credibility depends on provenance.** When an editor asks "how do you know it said that?", a screenshot with a timestamp is stronger than your memory. A full-page capture with HTML is stronger still.

**Legal and ethical stakes are real.** Misquoting a source is a career risk. Proving you quoted accurately—from a timestamped capture of the original page—protects both your reporting and your reputation.

## The capture workflow

### Before you publish

When you reference any web source in your reporting:

1. **Capture the page** — full screenshot, HTML, and extracted text
2. **Note the capture time** — this is your "as of" timestamp
3. **Tag by story** — connect it to the piece you are working on
4. **Add a brief annotation** — "Source for lead quote" or "Pricing claim cited in paragraph 3"

This takes less than thirty seconds per source and creates a **verifiable record** of what you saw when you saw it.

### After publication — monitoring for changes

For high-stakes stories, check back on key source pages:

1. **Re-capture the same URL** at intervals (day after, week after, month after)
2. **Compare the new capture to the original** — look for changed wording, removed sections, updated data
3. **Document differences** in your notes

You now have a **before and after** archive. If the content changed, you can show exactly what changed and when you first noticed.

## What makes a strong evidence capture

A screenshot alone is better than nothing, but it can be dismissed as fabricated. A **full-page capture** is substantially harder to dispute because it includes:

| Element | Why it matters |
|---------|---------------|
| **Screenshot** | Visual proof of what the page looked like |
| **HTML source** | Machine-readable structure that confirms content was served by the actual domain |
| **Extracted text** | Searchable, quotable, and diffable |
| **Capture timestamp** | Establishes when you accessed the content |
| **URL** | Confirms the specific page address |

Together, these elements create a **multi-layer record** that is difficult to forge and easy to verify.

## Real scenarios

### Scenario 1: The softened claim

A pharmaceutical company's product page claims their drug is "proven effective in 95% of cases." After an adverse event report, the page changes to "shown to be effective in clinical trials." Your archived capture of the original wording supports your story about the messaging shift.

### Scenario 2: The disappeared statement

A political candidate's campaign site includes a policy position. After backlash, the entire page is removed. Your capture preserves the content—screenshot, text, and structure—even though the live URL now returns a 404.

### Scenario 3: The retroactive edit

A company blog post contains a factual error you reported on. They correct the error but add no correction notice. Your before-and-after captures document that the change happened silently, which itself becomes part of the story.

## Organizing your evidence archive

**By story or investigation:**

\`\`\`
Stories/
├── pharma-pricing-investigation/
│   ├── company-press-release-2026-04-01
│   ├── company-press-release-2026-04-08 (re-capture)
│   └── fda-response-page
├── campaign-finance-story/
└── tech-layoffs-series/
\`\`\`

**Tags for cross-referencing:**

- Source type: \`press-release\`, \`company-blog\`, \`government-page\`, \`social-media\`
- Status: \`original-capture\`, \`re-capture\`, \`changed\`, \`taken-down\`
- Verification: \`quoted-in-story\`, \`fact-checked\`, \`needs-review\`

## Get started

[PageStash](https://pagestash.app) captures any web page with a full screenshot, HTML, and searchable text—timestamped and organized for exactly this kind of evidence work. One click in your browser. The page is preserved.

[Try PageStash free →](/auth/signup)
`,
}
