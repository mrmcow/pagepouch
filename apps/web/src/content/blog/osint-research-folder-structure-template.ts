import { BlogPost } from '@/types/blog'

export const osintResearchFolderStructureTemplate: BlogPost = {
  slug: 'osint-research-folder-structure-template',
  title: 'Free OSINT Research Folder Structure (Template You Can Copy)',
  description:
    'Downloadable-style template for analysts: subjects, domains, evidence, and timelines—map it to PageStash folders and tags for a consistent case file.',
  excerpt:
    'Copy this folder skeleton into your workspace so captures stay navigable when a matter grows past fifty pages.',
  author: 'PageStash Team',
  publishedAt: '2026-04-10T21:25:00Z',
  readingTime: 6,
  category: 'guides',
  tags: ['OSINT', 'template', 'folders', 'analysts', 'PageStash'],
  featuredImage:
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# OSINT Research Folder Structure (Copy-Paste Template)

Use this **folder and tag skeleton** for **ethical, authorized** public-source research. Adapt names to your **organization’s** conventions.

## Top-level folders

\`\`\`
/subjects          — entities (people, orgs) under active review
/domains           — captures grouped by site or registrar theme
/evidence          — pages that may support or refute a claim
/timelines         — dated captures for narrative change tracking
/reference         — stable docs (methodology, law summaries you trust)
/archive           — closed matters (read-only habit)
\`\`\`

## Optional subfolders

- \`/subjects/acme-corp/pricing\`
- \`/subjects/acme-corp/leadership\`
- \`/evidence/claims/q2-guidance\`
- \`/timelines/2026-04/product-page\`

## Tag vocabulary (examples)

- \`claim:pricing\`, \`claim:security\`, \`confidence:high\`
- \`source:primary\`, \`source:secondary\`
- \`geo:EU\`, \`sector:fintech\`

## How PageStash maps to this

Create **folders** for the structure above; use **tags** for cross-cutting filters. **Page Graphs** help when the same **domain** appears across multiple **subjects**.

## “Download”

Copy the **tree** above into your runbook. If you want this as a **PDF checklist** later, we may ship a formal download—**for now**, this page **is** the canonical template.

[Use PageStash](https://pagestash.app) as the **capture engine** behind the structure.

## Compliance reminder

Only collect what you are **allowed** to collect. When in doubt, **ask** your **legal** or **security** team.
`,
}
