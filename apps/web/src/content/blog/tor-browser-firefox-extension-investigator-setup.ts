import { BlogPost } from '@/types/blog'

export const torBrowserFirefoxExtensionInvestigatorSetup: BlogPost = {
  slug: 'tor-browser-firefox-extension-investigator-setup',
  title: 'Setting Up Your Tor Browser Investigation Toolkit with PageStash',
  description:
    'Step-by-step guide to installing PageStash Firefox extension in Tor Browser for OSINT investigations, with folder setup and operational security tips.',
  excerpt:
    'Install PageStash in Tor Browser in minutes and configure a case-ready investigation workspace for capturing .onion pages.',
  author: 'PageStash Team',
  publishedAt: '2026-04-11T10:30:00Z',
  readingTime: 7,
  category: 'how-to',
  tags: [
    'Tor',
    'OSINT',
    'dark-web',
    'Firefox',
    'investigation',
    'PageStash',
    'setup',
    'browser-extension',
    'operational-security',
    'tutorial',
  ],
  featuredImage:
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# Setting Up Your Tor Browser Investigation Toolkit with PageStash

Tor Browser is built on Firefox ESR, which means **Firefox extensions work in Tor Browser**. For OSINT investigators who need to capture and archive .onion pages, this is the critical detail: you can install PageStash's Firefox extension directly in Tor Browser and get the same **screenshot, HTML, and full-text capture** workflow you'd use on the clearnet.

This guide walks through the complete setup—from installation to folder configuration to operational security considerations—so you're ready to capture from your first session.

## Prerequisites

Before you start:

- **Tor Browser** installed and updated to the latest version (download only from [torproject.org](https://www.torproject.org))
- A **PageStash account** (sign up at [pagestash.app](https://pagestash.app))
- Basic familiarity with Tor Browser's security settings

## Step 1: Install the PageStash Firefox Extension

Tor Browser supports Firefox Add-ons with some security restrictions. Here's the installation process:

1. **Open Tor Browser** and connect to the Tor network
2. **Navigate to the Firefox Add-ons page** for PageStash (available at addons.mozilla.org)
3. **Click "Add to Firefox"** and accept the permissions prompt
4. **Pin the extension** to your toolbar for quick access—right-click the extension icon and select "Pin to Toolbar"

The extension installs the same way it does in standard Firefox. No special configuration is needed for Tor compatibility.

### Verify the Installation

After installation, test by navigating to any clearnet page and clicking the PageStash icon. Confirm that:

- The capture dialog appears
- You can select a folder destination
- The capture completes and appears in your PageStash workspace

If that works, you're ready for .onion captures.

## Step 2: Configure Your Investigation Folders

A well-structured folder setup before your first investigation saves significant time. Here's a recommended hierarchy:

### For Single-Case Work

- **Case Name** (top-level folder)
  - **Targets** — individual .onion sites or personas being tracked
  - **Evidence** — key captures that form part of your findings
  - **Background** — contextual captures (forum posts, news articles, related clearnet pages)
  - **Infrastructure** — login pages, mirrors, technical indicators

### For Ongoing Monitoring

- **Dark Web Monitoring** (top-level)
  - **Marketplaces** — one sub-folder per marketplace
  - **Forums** — community and discussion captures
  - **Services** — specific hidden services being tracked
  - **Archive** — completed or inactive targets

### Tag Conventions

Establish tags before you start capturing:

- **Entity types**: \`crypto-wallet\`, \`email\`, \`pgp-key\`, \`onion-address\`, \`social-handle\`
- **Priority levels**: \`high-priority\`, \`routine\`, \`flagged\`
- **Status**: \`active\`, \`archived\`, \`takedown\`, \`offline\`
- **Content types**: \`listing\`, \`profile\`, \`forum-post\`, \`infrastructure\`

## Step 3: Your First .onion Capture

With the extension installed and folders configured:

1. **Navigate to a .onion address** in Tor Browser
2. **Wait for the page to fully load** — hidden services can be slow; let all content render
3. **Click the PageStash extension icon** in your toolbar
4. **Select the destination folder** from your pre-configured hierarchy
5. **Add relevant tags** that match your established conventions
6. **Confirm the capture**

PageStash captures three layers:

- **Full-page screenshot** — a visual record of exactly what you saw
- **HTML source** — the page structure and any embedded metadata
- **Extracted text** — all visible text, indexed for full-text search

The capture is **timestamped** automatically, recording exactly when you observed the content.

## Step 4: Review Entity Extraction

After each capture, PageStash's **entity extraction** automatically scans the captured content and identifies:

- **.onion addresses** referenced in the page
- **Bitcoin, Ethereum, Monero addresses** — wallet strings matching known formats
- **Email addresses** — both clearnet and encrypted providers
- **PGP fingerprints** — key identifiers for verification
- **Social handles** — Telegram usernames, Jabber IDs, Session contacts

These entities are immediately searchable across your entire workspace. As your capture database grows, entity extraction becomes increasingly valuable—surfacing connections you didn't know to look for.

## Operational Security Considerations

Running an extension in Tor Browser introduces considerations that pure Tor browsing doesn't have. Think through these:

### Network Behavior

- PageStash captures are **stored in your PageStash workspace**, which means data leaves the Tor circuit to reach PageStash's servers
- The **content of your captures** is transmitted, though not through Tor's exit nodes in the same way as browsing traffic
- Evaluate whether this fits your threat model—for many OSINT analysts, this is acceptable; for others, additional precautions may be warranted

### Browser Fingerprinting

- Installing any extension modifies your browser fingerprint relative to default Tor Browser
- For most OSINT research, this is an acceptable trade-off—you're capturing content, not trying to be invisible to the site you're visiting
- If fingerprint resistance is critical to your operation, evaluate whether extension installation aligns with your requirements

### Workspace Separation

- **Use separate PageStash folders** for different investigations—don't mix cases
- Consider **separate PageStash accounts** for compartmentalized operations if your security requirements demand it
- **Don't capture login pages** that contain your credentials

### Capture Hygiene

- **Don't capture pages that contain your own session tokens** or authentication state visible in the URL bar
- **Review captures** before sharing to ensure no personal operational data leaked into screenshots
- **Name captures descriptively** so you can identify them without opening each one

## Tips for Efficient Tor Browser Capture Sessions

### Batch Capture Strategy

Hidden services are slow compared to clearnet. Maximize your session:

- **Open multiple tabs** to target pages (let them load in parallel)
- **Capture systematically** from tab to tab rather than navigating back and forth
- **Pre-plan your capture list** before starting a Tor session

### Handling Slow or Failing Pages

- **If a page partially loads**, capture what you have—partial evidence beats no evidence
- **Retry failed loads** after a pause; Tor circuits can be unreliable
- **Note in your tags** if a capture is partial: \`partial-load\`, \`retry-needed\`

### Maintaining Context

- **Capture surrounding pages**, not just the target—a marketplace listing makes more sense alongside the vendor profile and category page
- **Capture at regular intervals** to track how content changes over time
- **Use PageStash's search** between captures to check if you've already archived a page

## Ethics and Legal Disclaimer

**Use this toolkit for lawful research only.**

- **Tor Browser is legal** in most jurisdictions; using it does not imply wrongdoing
- **Capturing publicly accessible pages** for research is generally permissible, but laws vary by jurisdiction
- **Never access content** that is illegal to view or possess
- **Follow your organization's** policies and obtain appropriate approvals before beginning dark web research
- **Consult legal counsel** if you have any doubt about the legality of your planned activities

This toolkit is designed for **journalists, academic researchers, threat intelligence analysts, and security professionals** conducting legitimate, lawful research.

## Get Started

PageStash's Firefox extension gives Tor Browser users a professional-grade capture workflow: **timestamped screenshots**, **searchable text**, **automatic entity extraction**, and **organized case folders**—with no additional infrastructure to set up.

[Install PageStash](https://pagestash.app) and configure your investigation workspace today.
`,
}
