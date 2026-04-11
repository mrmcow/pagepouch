import { BlogPost } from '@/types/blog'

export const onionSiteChangeDetectionAnalystWorkflow: BlogPost = {
  slug: 'onion-site-change-detection-analyst-workflow',
  title: 'Tracking Changes on .onion Sites: A Capture-and-Compare Workflow',
  description:
    'How OSINT analysts detect changes on Tor hidden services by capturing pages at intervals, comparing text, and mapping entity relationships with PageStash.',
  excerpt:
    'Hidden services change without notice. This capture-and-compare workflow helps analysts detect and document content changes on .onion sites over time.',
  author: 'PageStash Team',
  publishedAt: '2026-04-11T10:45:00Z',
  readingTime: 8,
  category: 'guides',
  tags: [
    'Tor',
    'OSINT',
    'dark-web',
    'Firefox',
    'investigation',
    'PageStash',
    'change-detection',
    'onion',
    'monitoring',
    'knowledge-graph',
  ],
  featuredImage:
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# Tracking Changes on .onion Sites: A Capture-and-Compare Workflow

Hidden services don't publish changelogs. Pages update silently—new listings appear, vendor profiles shift, contact details rotate, PGP keys get replaced. For **OSINT analysts monitoring .onion sites**, detecting these changes is often the entire point of the investigation. A new crypto wallet on a vendor page, a shifted product description, a removed forum post—each change carries intelligence value.

The problem is that no standard change-detection tool works on Tor. There's no RSS, no \`diff\` service, no Google cache. You need a **manual capture-and-compare workflow** that's disciplined enough to produce reliable results. Here's how to build one with PageStash.

## Why Change Detection Matters on the Dark Web

Changes on hidden services signal activity:

- **New wallet addresses** may indicate operational security rotation or new payment infrastructure
- **Modified listings** reveal pricing shifts, supply changes, or vendor strategy
- **Removed content** can signal takedown preparation, disputes, or law enforcement pressure
- **Updated PGP keys** may indicate a compromised identity or a new operator behind the same alias
- **New .onion mirrors** suggest infrastructure expansion or redundancy planning

Without systematic capture, these signals disappear. You can't compare what you didn't save.

## The Capture-and-Compare Workflow

### Phase 1: Establish Baselines

The first step is always a **baseline capture** of every page you intend to monitor. This is your reference point for all future comparisons.

For each target .onion page:

1. **Navigate** in Tor Browser and wait for full page load
2. **Capture with PageStash** — screenshot, HTML, and extracted text
3. **File into a dedicated monitoring folder** (e.g., "Vendor-X / Baseline")
4. **Tag with the capture date** and \`baseline\` tag
5. **Review entity extraction** — note what crypto wallets, emails, PGP keys, and .onion addresses are present

Your baseline captures define "what normal looks like" for each monitored page.

### Phase 2: Scheduled Recapture

Establish a capture cadence based on how frequently your targets change:

- **Daily** for active marketplace listings or fast-moving forums
- **Every 2-3 days** for vendor profiles and semi-static pages
- **Weekly** for infrastructure pages, mirrors, and announcement boards

On each capture cycle:

1. **Visit the same pages** in the same order (consistency helps you notice visual differences)
2. **Capture each page** into a folder that includes the date (e.g., "Vendor-X / 2026-04-11")
3. **Apply consistent tags** so captures from different dates are comparable

### Phase 3: Compare and Detect Changes

This is where PageStash's **full-text search** becomes your primary detection tool.

#### Text Comparison Method

1. **Search for specific strings** from the baseline capture — a wallet address, a product name, a price point
2. **If a search returns the baseline but not the latest capture**, the content has changed
3. **If a search returns the latest capture but not the baseline**, new content has been added

#### Visual Comparison

Open the **baseline screenshot** and the **latest screenshot** side by side. Look for:

- **Layout changes** — new sections, removed elements, restructured pages
- **Price changes** — different numbers in product listings
- **New contact methods** — additional Jabber IDs, Telegram handles, or encrypted email addresses
- **Status indicators** — "vacation mode," "verified vendor" badges, trust level changes

#### Entity Drift Analysis

Compare the **extracted entities** between captures:

- **Did a crypto wallet address change?** This is often a high-signal indicator
- **Did new .onion addresses appear?** The site may be advertising mirrors or affiliates
- **Did PGP fingerprints rotate?** Could indicate key compromise or operator change
- **Did social handles change?** New communication channels may signal operational shifts

### Phase 4: Map Relationships with the Knowledge Graph

As you accumulate captures over time, PageStash's **knowledge graph** connects entities across captures and reveals patterns:

- **Entity persistence** — which wallet addresses have remained consistent across months of captures?
- **Entity migration** — did a vendor's PGP key appear on a different marketplace?
- **Network mapping** — which .onion addresses share extracted entities, suggesting common operators?
- **Temporal patterns** — do certain changes correlate with external events (takedowns, arrests, market exits)?

The knowledge graph transforms isolated captures into a **connected intelligence picture**. Instead of reviewing captures one by one, you see how entities flow between pages and over time.

## Organizing Change Data for Analysis

### Folder Convention

Maintain a clear time-series structure:

\`\`\`
Investigation Name/
├── Target-A/
│   ├── Baseline/
│   ├── 2026-04-01/
│   ├── 2026-04-04/
│   ├── 2026-04-07/
│   └── 2026-04-11/
├── Target-B/
│   ├── Baseline/
│   └── ...
\`\`\`

### Tags for Change Tracking

Apply tags that flag what changed:

- \`no-change\` — captured, compared, nothing different
- \`content-changed\` — text or listings modified
- \`entity-changed\` — wallet, PGP key, or contact info rotated
- \`page-removed\` — URL returned error or blank page
- \`new-content\` — page has sections not present in baseline

### Export for Reporting

When you need to report on changes:

- **CSV export** — produces a structured timeline of all captures with timestamps, tags, and extracted entities. Filter in a spreadsheet to show only \`entity-changed\` or \`content-changed\` captures
- **JSON export** — full data structure for programmatic diffing or integration with other analysis tools
- **Markdown export** — formatted change reports suitable for briefings

## Scaling the Workflow

### Prioritize Your Targets

You can't capture every .onion page daily. Prioritize based on:

- **Intelligence value** — pages most likely to yield actionable changes
- **Volatility** — pages that change frequently deserve more frequent capture
- **Investigation relevance** — focus capture effort on active case targets

### Team Coordination

If multiple analysts monitor the same targets:

- **Shared folder structures** ensure captures go to the right place
- **Consistent tagging** means anyone can search and compare across the team's work
- **Export regularly** so analysis doesn't depend solely on PageStash workspace access

## Ethics and Legal Disclaimer

**Change detection on hidden services must be conducted within legal boundaries.**

- **Passive monitoring only** — capture what's publicly visible; don't probe, scan, or interact
- **Do not use change detection** to facilitate illegal activity or bypass access controls
- **Follow your organization's** research policies and obtain necessary approvals
- **Consult legal counsel** regarding the legality of systematic hidden service monitoring in your jurisdiction
- **Protect your data** — captured dark web content may be sensitive; follow appropriate data handling procedures

This workflow serves **legitimate OSINT research**: threat intelligence, academic study, journalism, and security analysis.

## Start Tracking Changes Today

PageStash gives analysts the tools to turn sporadic .onion browsing into **systematic change detection**: timestamped captures, full-text search for comparison, entity extraction for drift analysis, and knowledge graphs for relationship mapping.

[Get PageStash](https://pagestash.app) and build a capture-and-compare workflow that catches what manual browsing misses.
`,
}
