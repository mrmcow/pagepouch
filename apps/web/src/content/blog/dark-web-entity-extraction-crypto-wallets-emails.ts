import { BlogPost } from '@/types/blog'

export const darkWebEntityExtractionCryptoWalletsEmails: BlogPost = {
  slug: 'dark-web-entity-extraction-crypto-wallets-emails',
  title:
    'Extracting Entities from Dark Web Pages: Crypto Wallets, Emails, and Handles',
  description:
    'How PageStash entity extraction identifies Bitcoin, Ethereum, Monero addresses, emails, PGP keys, and social handles from captured dark web pages for OSINT.',
  excerpt:
    'Automated entity extraction turns raw dark web captures into structured intelligence—crypto wallets, emails, onion addresses, and social handles indexed and searchable.',
  author: 'PageStash Team',
  publishedAt: '2026-04-11T11:00:00Z',
  readingTime: 8,
  category: 'use-cases',
  tags: [
    'Tor',
    'OSINT',
    'dark-web',
    'Firefox',
    'investigation',
    'PageStash',
    'entity-extraction',
    'crypto',
    'bitcoin',
    'knowledge-graph',
  ],
  featuredImage:
    'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# Extracting Entities from Dark Web Pages: Crypto Wallets, Emails, and Handles

A captured dark web page is a snapshot. Entity extraction turns that snapshot into **structured intelligence**. Instead of scrolling through archived marketplace listings and forum posts trying to spot wallet addresses and contact details, automated extraction pulls every identifiable entity out of the captured text and makes it searchable across your entire research database.

For **OSINT analysts** working with Tor hidden services, this is the difference between a folder of screenshots and a **queryable intelligence corpus**. Here's how PageStash's entity extraction works on dark web content, what it identifies, and how to use it for investigation and analysis.

## What Entity Extraction Captures

PageStash scans the **extracted text** from every captured page and identifies entities using pattern matching and format recognition. On dark web pages, the following entity types appear most frequently:

### Cryptocurrency Wallet Addresses

Dark web commerce runs on crypto. PageStash identifies:

- **Bitcoin (BTC)** — Legacy addresses (starting with \`1\`), SegWit (\`3\`), and native SegWit (\`bc1\`) formats
- **Ethereum (ETH)** — Addresses starting with \`0x\` followed by 40 hexadecimal characters
- **Monero (XMR)** — Long-form addresses starting with \`4\` (95 characters) and subaddresses starting with \`8\`

Crypto addresses are high-value entities. A single wallet address can connect multiple vendor aliases, marketplace accounts, or transaction flows. When the same BTC address appears across three different captured pages, that's a linkage that manual review might miss but search won't.

### Email Addresses

Despite the anonymity focus of the dark web, email addresses surface frequently:

- **Encrypted email providers** — ProtonMail, Tutanota, and similar privacy-focused services
- **Disposable addresses** — temporary mail services used for one-time communication
- **Clearnet addresses** — occasionally, operators make mistakes and use identifiable email services

Each email extracted becomes searchable. An analyst investigating a vendor can search for their known email across all captures to find other pages where it appears.

### .onion Addresses

Hidden service URLs are entities themselves. PageStash extracts:

- **.onion URLs** embedded in page content — links to mirrors, related services, vendor shops, or communication channels
- **v3 onion addresses** — the 56-character format used by current hidden services

Extracting .onion addresses from captured pages maps the **referral network** between hidden services. Which marketplaces link to which forums? Which vendor profiles reference external .onion shops? These connections build your understanding of the ecosystem.

### PGP Fingerprints and Key IDs

PGP is the verification standard on the dark web. PageStash identifies:

- **Full PGP fingerprints** — 40-character hexadecimal strings
- **Short key IDs** — 8 or 16 character identifiers
- **PGP public key blocks** — the full armored key text when posted on a page

PGP keys are strong identifiers. Unlike aliases that can be changed, a PGP key ties together every page where it appears. If a vendor claims a new identity but posts the same PGP key, entity search across your captures reveals the connection.

### Social Handles and Communication Channels

Dark web actors advertise contact methods. PageStash extracts:

- **Telegram usernames** — @handles and t.me links
- **Jabber/XMPP addresses** — the preferred real-time communication protocol on many platforms
- **Session IDs** — the decentralized messaging app increasingly used for encrypted communication
- **Wickr handles** — another encrypted messaging platform common in illicit communities

These handles are critical for mapping communication networks between actors across different platforms and marketplaces.

## How Entity Extraction Fits the OSINT Workflow

### Capture First, Analyze Later

The beauty of automated extraction is that you don't need to know what's important at capture time. Your workflow is:

1. **Capture pages** systematically during Tor Browser research sessions
2. **Entity extraction runs automatically** on each captured page's text content
3. **Later, search by entity** when a wallet address, email, or handle becomes relevant to your investigation

You might capture 200 marketplace pages over a month. Six weeks later, a wallet address surfaces in a separate investigation. Search PageStash for that address, and every page where it appeared is instantly available—with timestamps, screenshots, and context.

### Cross-Reference Across Captures

Entity extraction creates an **implicit database** across all your captures. The most valuable intelligence often comes from cross-referencing:

- **Same wallet, different marketplaces** — a vendor operating across platforms
- **Same PGP key, different aliases** — an actor using multiple identities
- **Same email, different roles** — someone who's both a vendor and a forum moderator
- **Same .onion address referenced from multiple sources** — a service with broad reach in the ecosystem

These connections emerge from search, not from memory. With hundreds of captures, no analyst can remember every entity on every page. Search makes it systematic.

### Feed the Knowledge Graph

Every extracted entity becomes a **node** in PageStash's knowledge graph. The graph connects:

- **Entities to clips** — which pages contain which entities
- **Entities to entities** — which entities co-occur on the same pages
- **Clips to clips** — which captures share common entities

For dark web research, the knowledge graph produces **network visualizations** that show how actors, infrastructure, and financial flows connect across your captured data. This is particularly valuable for:

- **Attribution analysis** — linking multiple personas to a common operator
- **Infrastructure mapping** — understanding how hidden services relate to each other
- **Financial tracing** — following crypto addresses across the ecosystem
- **Temporal analysis** — seeing how entity relationships change over time

## Building a Structured Intelligence Database

### From Raw Captures to Queryable Data

With consistent capture and entity extraction, your PageStash workspace evolves from a clip archive into a **structured intelligence database**:

- **Search by entity type** — find all captures containing Monero addresses, or all pages with Telegram handles
- **Filter by folder** — scope entity searches to a specific case or investigation
- **Filter by tag** — combine entity search with your tagging taxonomy for precise results
- **Sort by date** — trace when specific entities first appeared or last changed

### Export for External Analysis

PageStash's extracted entities export alongside capture metadata:

- **CSV export** includes columns for each entity type, making it straightforward to import into spreadsheet tools, link analysis platforms, or databases for further processing
- **JSON export** preserves the full entity data structure for programmatic analysis—feed it into custom scripts, Maltego, or other OSINT platforms
- **Markdown export** produces readable entity lists for reports and briefings

For advanced analysis, export your entity data and cross-reference with **blockchain explorers** (for wallet addresses), **PGP keyservers** (for key verification), or **OSINT databases** (for handle attribution).

## Maximizing Extraction Quality

### Capture Complete Pages

Entity extraction works on **captured text**. Ensure your captures include all page content:

- **Wait for full page load** before capturing — Tor hidden services can be slow
- **Scroll to trigger lazy-loaded content** if the page uses dynamic loading
- **Capture sub-pages** (vendor profiles, individual listings) separately for thorough coverage

### Consistent Capture Practices

- **Capture regularly** — entities you don't capture can't be extracted
- **Capture broadly** — the connection that breaks a case might come from a page that seemed unimportant at capture time
- **Tag captured pages** with relevant metadata so entity search results have context

## Ethics and Legal Disclaimer

**Entity extraction is a research and analysis tool. Use it responsibly.**

- **Extracted entities are intelligence leads**, not proof of wrongdoing — validate findings through proper channels
- **Do not use extracted data** to harass, dox, or target individuals
- **Follow your organization's** data handling policies for sensitive entity data
- **Cryptocurrency addresses and PGP keys** are pseudonymous, not anonymous — treat attribution conclusions with appropriate caution
- **Consult legal counsel** regarding the collection and retention of entity data from dark web sources in your jurisdiction

Entity extraction serves **lawful OSINT research**: threat intelligence, academic study, journalism, financial compliance, and security analysis.

## Turn Dark Web Captures into Structured Intelligence

PageStash's entity extraction transforms raw page captures into a **searchable, connected intelligence database**. Crypto wallets, emails, .onion addresses, PGP keys, and social handles—automatically identified, indexed, and linked through the knowledge graph.

[Get PageStash](https://pagestash.app) and start extracting structured intelligence from every dark web page you capture.
`,
}
