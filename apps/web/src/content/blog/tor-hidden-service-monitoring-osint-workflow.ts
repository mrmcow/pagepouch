import { BlogPost } from '@/types/blog'

export const torHiddenServiceMonitoringOsintWorkflow: BlogPost = {
  slug: 'tor-hidden-service-monitoring-osint-workflow',
  title: 'How to Monitor Tor Hidden Services for OSINT Research',
  description:
    'Learn how OSINT analysts monitor Tor hidden services using PageStash to capture, timestamp, and build searchable databases of .onion site observations.',
  excerpt:
    'A practitioner workflow for capturing volatile .onion pages, extracting entities, and building a structured dark web observation database.',
  author: 'PageStash Team',
  publishedAt: '2026-04-11T10:00:00Z',
  readingTime: 8,
  category: 'guides',
  tags: [
    'Tor',
    'OSINT',
    'dark-web',
    'Firefox',
    'investigation',
    'PageStash',
    'hidden-services',
    'onion',
    'web-archiving',
    'entity-extraction',
  ],
  featuredImage:
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# How to Monitor Tor Hidden Services for OSINT Research

Tor hidden services are ephemeral by design. Pages go offline without warning, content rotates, and entire .onion domains vanish overnight. For **OSINT analysts** tracking threat infrastructure, illicit marketplaces, or extremist forums, the challenge is straightforward: capture what you see **before it disappears**, and make it searchable later.

This guide covers a practical workflow for **monitoring Tor hidden services** using PageStash's Firefox extension inside Tor Browser—turning volatile dark web observations into a structured, searchable intelligence database.

## Why Hidden Service Monitoring Requires Dedicated Tooling

Standard web archival tools assume persistent URLs and stable DNS. Hidden services break both assumptions:

- **.onion addresses** rotate frequently—operators spin up new domains and abandon old ones
- **Page content changes** without versioning, caching headers, or sitemaps
- **Uptime is unpredictable**—services may be accessible for hours, then offline for days
- **No public crawl index** exists—the Wayback Machine cannot reach .onion sites

If you visit a hidden service and don't capture it, that observation may be gone permanently. Your browser history won't help when you need to recall exact wording, pricing, or contact details six months into an investigation.

## The Capture Workflow

### 1. Set Up Your Case Structure

Before you start browsing, create a **folder hierarchy** in PageStash that mirrors your investigation:

- **Case-level folder** (e.g., "Operation Darknet Market Q2-2026")
- **Sub-folders by target** (e.g., vendor aliases, service categories, infrastructure nodes)
- **Tags** for cross-cutting themes: \`crypto-payments\`, \`vendor-comms\`, \`pgp-keys\`, \`infrastructure\`

This structure pays dividends when you have hundreds of captures and need to pull everything related to a specific entity.

### 2. Capture Each Page Systematically

With PageStash installed in Tor Browser, your capture workflow for each .onion page is:

- **Navigate** to the target hidden service
- **Click the PageStash extension** to capture screenshot, HTML, and extracted text
- **Assign to the correct folder** and apply relevant tags
- **Move to the next page**—captures are timestamped automatically

Each capture preserves exactly what you saw: the **full-page screenshot** as visual evidence, the **raw HTML** for structural analysis, and **searchable text** for later retrieval. The timestamp establishes when you observed the content.

### 3. Let Entity Extraction Do the Heavy Lifting

This is where manual note-taking becomes unsustainable, and automated extraction becomes critical. PageStash's **entity extraction** automatically identifies and indexes:

- **Onion addresses** (.onion URLs embedded in page content)
- **Bitcoin, Ethereum, and Monero wallet addresses**
- **Email addresses** (clearnet and encrypted mail services)
- **PGP fingerprints** and key IDs
- **Social handles** (Telegram, Jabber/XMPP, Session IDs)

Every entity extracted from a capture becomes searchable across your entire workspace. When the same Bitcoin address appears on three different hidden services, you'll find the connection through search—not through memory.

### 4. Build the Knowledge Graph

As captures accumulate, PageStash's **knowledge graph** maps relationships between entities across clips. You start seeing patterns:

- A **crypto wallet** that appears across multiple marketplace listings
- An **email address** shared between a forum profile and a vendor page
- **Onion addresses** that share infrastructure indicators
- **PGP keys** reused across identities

The graph doesn't replace analysis—it surfaces connections that would take hours to find manually across hundreds of captured pages.

## Building a Searchable Observation Database

After weeks or months of monitoring, your PageStash workspace becomes a **structured intelligence database**:

- **Full-text search** across all captured hidden service content—find every mention of a wallet address, alias, or product name
- **Filter by folder** to scope searches to a specific case or target
- **Filter by tag** to pull all captures related to a particular theme
- **Sort by date** to reconstruct timelines of when content appeared or changed
- **Export to CSV or JSON** for integration with other analysis tools or reporting pipelines

### Export for Reporting and Collaboration

When you need to produce deliverables:

- **CSV export** gives you structured rows of captures with metadata, timestamps, and extracted entities—ready for spreadsheet analysis or database import
- **JSON export** preserves the full data structure for programmatic analysis
- **Markdown export** produces formatted reports suitable for briefings
- **HTML export** creates self-contained archives for stakeholders who need visual context

## Operational Considerations

### Capture Discipline

Establish a **consistent capture cadence**. For active investigations, that might mean daily captures of key pages. For broader monitoring, weekly sweeps. Document your methodology—what you captured, when, and what your selection criteria were.

### Data Hygiene

Tag consistently from day one. A tag taxonomy that makes sense with 20 captures will save you from chaos at 2,000 captures. Use naming conventions your team agrees on.

### Timestamp Integrity

PageStash timestamps each capture at the moment of creation. For sensitive investigations, note your Tor circuit details separately if attribution of network path matters to your analysis.

## Ethics and Legal Disclaimer

**This workflow is for lawful research only.** Monitoring hidden services raises significant legal and ethical considerations:

- **Do not interact** with illegal marketplaces as a buyer, seller, or participant
- **Do not access** content that is illegal to view in your jurisdiction (e.g., CSAM)
- **Follow your organization's** policies, IRB protocols, or legal counsel guidance
- **Passive observation** of publicly accessible pages is generally distinct from participation—but jurisdiction matters, and you should confirm with legal counsel
- **Document your methodology** in case your research is ever subject to review

OSINT work on Tor is a tool for **journalism, academic research, threat intelligence, and security awareness**. Use it responsibly.

## Start Building Your Dark Web Intelligence Database

PageStash gives OSINT analysts the capture-and-organize workflow that hidden service research demands: **timestamped evidence**, **automatic entity extraction**, **knowledge graphs**, and **structured export**—all running inside Tor Browser through a standard Firefox extension.

[Get started with PageStash](https://pagestash.app) and turn volatile dark web observations into a searchable, defensible research archive.
`,
}
