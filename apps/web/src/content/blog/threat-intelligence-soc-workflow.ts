import { BlogPost } from '@/types/blog'

export const threatIntelligenceSocWorkflow: BlogPost = {
  slug: 'threat-intelligence-soc-workflow-web-clipping',
  title: 'Web Clipping for Threat Intelligence: Complete Workflow for SOC Analysts',
  description: 'Comprehensive guide to web capture and evidence preservation for SOC analysts and threat intelligence professionals. Learn proven workflows for tracking threats, preserving evidence, and building attribution cases.',
  excerpt: 'Essential web capture workflows for SOC analysts and threat intelligence teams. Learn how to preserve digital evidence, track APT campaigns, and build attribution cases with professional-grade tools.',
  author: 'PageStash Team',
  publishedAt: '2025-11-21',
  readingTime: 16,
  category: 'guides',
  tags: ['threat-intelligence', 'soc', 'cybersecurity', 'osint', 'security-operations'],
  featuredImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop&auto=format',
  featured: true,
  content: `
# Web Clipping for Threat Intelligence: Complete Workflow for SOC Analysts

**The malicious site just went offline. The threat actor deleted their profile. The C2 infrastructure vanished.**

For SOC analysts and threat intelligence professionals, this isn't just frustrating—**it's a critical intelligence failure.**

When you're tracking APT campaigns, monitoring threat actor forums, or investigating malware infrastructure, **evidence disappears fast**. Command and control servers get taken down. Phishing sites rotate hourly. Threat actors scrub their digital footprints the moment they suspect surveillance.

**Traditional methods fail:**
- ❌ Screenshots alone lack searchable text and metadata
- ❌ Bookmarks become dead links within hours
- ❌ Manual documentation is incomplete and time-consuming
- ❌ Browser history isn't evidence-grade

**The result:** Lost intelligence, incomplete attribution, gaps in your timeline.

This comprehensive guide covers **professional web capture workflows** specifically designed for threat intelligence operations, with real-world techniques from SOC analysts, threat hunters, and security researchers.

---

## Why SOC Analysts Need Specialized Web Capture

### The Threat Intelligence Challenge

**Traditional bookmarking and screenshots aren't built for threat intel work.**

When investigating a potential APT campaign, you might need to capture:
- 50+ compromised websites before takedown
- Threat actor profiles across multiple forums
- Malware distribution infrastructure
- C2 server panels and admin interfaces
- Darkweb marketplace listings
- Paste site dumps of stolen credentials
- Social engineering lure pages
- Exploit kit landing pages

**Each capture needs:**
1. **Timestamped evidence** - Prove exactly when you observed the threat
2. **Complete preservation** - Full HTML, screenshots, metadata
3. **Searchable archive** - Find IOCs across thousands of captures
4. **Connection mapping** - Link related infrastructure and actors
5. **Export capability** - Generate reports and share intelligence

### What Makes Threat Intel Different

**Compared to general research, threat intelligence requires:**

**Speed:**
- Threats evolve hourly, not daily
- Infrastructure gets taken down mid-investigation
- Immediate capture is critical

**Scale:**
- Track 100+ indicators simultaneously
- Monitor multiple campaigns
- Archive thousands of threat-related pages

**Evidence Quality:**
- Timestamped for attribution
- Chain of custody for legal action
- Exportable for threat reports
- Shareable with law enforcement

**Analysis Depth:**
- Search across all captured content for IOCs
- Map infrastructure relationships
- Track threat actor evolution
- Build attribution cases

---

## Core Requirements for Threat Intel Web Capture

### Minimum Viable Capture

**Every threat-related page you capture should include:**

✅ **Full-page screenshot** (visual proof of what you saw)  
✅ **Complete HTML source** (searchable, analyzable content)  
✅ **HTTP headers** (server info, redirects, cookies)  
✅ **Timestamp** (exact capture time, timezone)  
✅ **URL and metadata** (domain, IP if available, SSL cert info)  
✅ **Your notes** (context, relevance, initial assessment)

### Advanced Capture Features

**For professional SOC operations, you also need:**

✅ **IOC extraction** - Automatically identify IPs, domains, hashes, emails  
✅ **Relationship mapping** - Visualize connections between captures  
✅ **Tag taxonomy** - Organize by campaign, TTP, threat actor  
✅ **Full-text search** - Find any IOC across your entire archive  
✅ **Export options** - STIX, JSON, Markdown for threat reports  
✅ **Team collaboration** - Share captures with analysts  
✅ **Integration APIs** - Connect to your SIEM/TIP

---

## 🛡️ Tool Comparison for SOC & Threat Intelligence

**Which tool is right for your security operations?**

| Tool | **Capture Quality** | **Search & IOC** | **Analysis** | **Team Features** | **Price** | **Best For** |
|------|:------------------:|:---------------:|:------------:|:----------------:|:---------:|-------------|
| ![PageStash](/icons/icon-48.png)<br/>**PageStash Pro** | ⭐⭐⭐⭐⭐<br/>Complete | ⭐⭐⭐⭐⭐<br/>Excellent | ⭐⭐⭐⭐⭐<br/>Graphs | ⭐⭐⭐⭐☆<br/>Good | **$12/mo** | **SOC analysts, threat hunters** |
| **Hunchly** | ⭐⭐⭐⭐⭐<br/>Complete | ⭐⭐⭐⭐☆<br/>Very Good | ⭐⭐⭐☆☆<br/>Basic | ⭐⭐☆☆☆<br/>Limited | $130/yr | Law enforcement investigations |
| **WebRecorder** | ⭐⭐⭐⭐☆<br/>Good (WARC) | ⭐⭐☆☆☆<br/>Manual only | ⭐⭐☆☆☆<br/>None | ⭐☆☆☆☆<br/>None | Free | Technical users, archivists |
| **Archive.org** | ⭐⭐⭐☆☆<br/>Basic | ⭐⭐☆☆☆<br/>Limited | ⭐☆☆☆☆<br/>None | ⭐☆☆☆☆<br/>None | Free | Public reference only |
| **Manual Screenshots** | ⭐⭐☆☆☆<br/>Incomplete | ⭐☆☆☆☆<br/>No search | ⭐☆☆☆☆<br/>None | ⭐☆☆☆☆<br/>None | Free | ❌ **Not recommended** |

**🏆 For SOC Teams: PageStash Pro** - Only tool with knowledge graphs for infrastructure mapping + full-text IOC search + team collaboration.

**⚖️ For Law Enforcement: Hunchly** - Established court precedent, automatic capture, forensic focus.

### Deep Dive: PageStash for SOC Operations

**Why security teams choose PageStash:**

**1. Complete Evidence Capture**
- Full-page screenshots (handle infinite scroll, dynamic content)
- Complete HTML/text extraction (searchable, analyzable)
- Preserves all page elements (CSS, JavaScript artifacts)
- Automatic timestamping (UTC + timezone recorded)
- Metadata preservation (URL, domain, capture method)

**2. Knowledge Graphs for Threat Attribution**

This is where PageStash excels for threat intelligence:

- **Visualize infrastructure connections** - See how 50 malicious domains relate
- **Auto-detect patterns** - Same registrar, same IP ranges, same hosting
- **Map threat actor networks** - Connect profiles across platforms
- **Build attribution chains** - Link campaigns to specific actors
- **Spot infrastructure clusters** - Identify coordinated operations

**Example:** Capture 80 phishing domains. Knowledge graph reveals 15 share the same SSL certificate issuer and 12 use the same bullet-proof hosting provider → Strong attribution signal.

**3. Powerful Search & IOC Extraction**
- Full-text search across unlimited captures
- Find IP addresses, domains, file hashes instantly
- Search for specific TTPs or malware families
- Filter by date range, tag, or campaign
- Export search results for reporting

**4. SOC Team Collaboration**
- Shared folders by campaign or threat actor
- Collaborative tagging (MITRE ATT&CK, Diamond Model)
- Evidence handoffs with full context
- Team-wide search across all captures
- Access controls and audit logs

**5. Export for Threat Intelligence**
- **Markdown** - For threat reports and documentation
- **JSON** - For SIEM/TIP integration
- **PDF** - For sharing with stakeholders
- **STIX format** (roadmap) - For threat sharing platforms

**Pricing for SOC Teams:**
- Free tier: 10 captures/month (test workflows)
- Pro: $12/analyst/month (1,000 captures, 5GB storage)
- Enterprise: Custom pricing (SSO, advanced integrations)

**Limitations (be aware):**
- ❌ Not designed for automated bulk capture (yet)
- ❌ No built-in SIEM integration (use API + custom)
- ❌ STIX export coming but not available yet
- ⚠️ Pro plan required for serious SOC work

---

![Threat Intelligence Dashboard](https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=600&fit=crop&auto=format)
*Organize threat intelligence by campaign, visualize infrastructure connections, search across thousands of captures*

---

## Professional Threat Intel Workflows

### Workflow 1: APT Campaign Investigation

**Scenario:** Suspected APT group targeting your industry with spear-phishing

**Intelligence Requirements:**
- Identify phishing infrastructure
- Map infrastructure relationships
- Attribute to known threat actor
- Extract IOCs for defensive measures
- Document timeline for reporting

**Phase 1: Initial Discovery (Day 1)**

**When you identify the first malicious email:**

1. **Capture the phishing page immediately**
   - Full page screenshot
   - HTML source (look for unique artifacts)
   - HTTP headers (server fingerprinting)
   - Tag: \`APT-Campaign-2025-11\`, \`phishing\`, \`initial-vector\`

2. **Capture related infrastructure**
   - Domain WHOIS (before it gets privacy-protected)
   - DNS records page (from your threat intel platform)
   - SSL certificate details
   - Any redirect chains

3. **Document in your notes**
   - How you discovered this
   - Initial assessment
   - Related alerts/detections

**Time investment:** 5-10 minutes per malicious domain  
**Payoff:** Complete evidence even if infrastructure disappears

---

**Phase 2: Infrastructure Enumeration (Days 1-3)**

**Pivot to find related infrastructure:**

1. **Search for infrastructure patterns**
   - Same IP range → Capture all related domains
   - Same registrar email → Find sibling domains
   - Same SSL cert → Identify infrastructure cluster
   - Similar page content → Identify campaign variants

2. **Capture everything you find**
   - Every related phishing page
   - Any landing pages
   - Payload delivery infrastructure
   - C2 infrastructure (if identified)
   - Tag each by relationship: \`same-ip\`, \`same-registrar\`, \`related-content\`

3. **Monitor for changes**
   - Re-capture active infrastructure daily
   - Track domain rotations
   - Document infrastructure evolution

**Use knowledge graphs to visualize:**
- 40+ captured domains
- Graph shows 15 share same ASN
- 8 share same SSL certificate
- 5 redirect to common C2 domain

**Result:** Clear infrastructure map reveals coordinated campaign.

---

**Phase 3: Attribution Analysis (Days 3-7)**

**Build attribution case:**

1. **Search across all captures for TTPs**
   - PageStash full-text search: "MITRE ATT&CK techniques"
   - Look for unique artifacts (language, code style)
   - Identify operational patterns (timing, targeting)

2. **Compare to known threat actor profiles**
   - Search your archive for similar campaigns
   - Cross-reference with open-source reporting
   - Capture any public attributions for comparison

3. **Map threat actor presence**
   - Capture forum posts (if publicly accessible)
   - Archive dark web marketplace activity
   - Screenshot social media artifacts
   - Tag all with: \`attribution\`, \`[threat-actor-name]\`

4. **Use knowledge graph to show connections**
   - Link infrastructure to previous campaigns
   - Show evolution of threat actor TTPs
   - Identify strong attribution signals

**Output:** Attribution report with visual evidence chain.

---

**Phase 4: Defensive Measures & Reporting (Days 7-14)**

**Extract actionable intelligence:**

1. **IOC extraction from captures**
   - Search across all captures for domains
   - Extract all IPs, URLs, file hashes
   - Export to your SIEM/TIP (JSON format)

2. **Create comprehensive threat report**
   - Export key captures as evidence
   - Include timeline from capture timestamps
   - Use knowledge graph as visual aid
   - Document attribution chain

3. **Share with community**
   - Sanitized IOCs to ISACs
   - Capture screenshots for presentations
   - Threat report with proper sourcing

**Real-World Example:**

*SOC team tracks spear-phishing campaign. Captures 63 malicious domains over 2 weeks. Knowledge graph reveals infrastructure cluster. Search across captures finds unique JavaScript artifact. Cross-reference with open-source intel attributes to APT29. Export 150+ IOCs to block list. Campaign disrupted.*

---

### Workflow 2: Darkweb Marketplace Monitoring

**Scenario:** Threat actor selling stolen credentials from your organization

**Intelligence Requirements:**
- Preserve evidence of listing
- Capture seller profile before deletion
- Document pricing and claims
- Track seller network
- Evidence for law enforcement

**Immediate Capture (Hour 1):**

1. **The marketplace listing**
   - Full screenshot (proof of what was offered)
   - Complete HTML (searchable text)
   - Timestamp (critical for legal timeline)
   - Note: Price, claims, file formats, sample data shown
   - Tag: \`data-breach\`, \`marketplace\`, \`credentials\`, \`urgent\`

2. **Seller profile & history**
   - Seller's complete profile page
   - Reputation/feedback from buyers
   - Previous listings (if visible)
   - Any contact information or personas
   - Tag: \`[seller-username]\`, \`threat-actor\`

3. **Related marketplace pages**
   - Other listings from same seller
   - Similar offerings (related breaches?)
   - Marketplace rules/terms (context)

**Critical:** Darkweb content can disappear in minutes. Capture immediately.

---

**Ongoing Monitoring (Days 1-30):**

1. **Daily re-capture of active listing**
   - Track price changes
   - Monitor buyer interactions
   - Document any updates to listing
   - Tag each capture with date: \`day-1\`, \`day-2\`, etc.

2. **Network mapping**
   - Search for seller on other marketplaces
   - Capture any related profiles
   - Use knowledge graph to map seller network
   - Identify potential aliases

3. **Communication preservation**
   - If seller posts in forums, capture those
   - Screenshot any public discussions
   - Preserve any victim confirmations

**Knowledge Graph Use:**
- Map seller to 4 marketplace profiles
- Link to 12 previous breach listings
- Connect to forum posts discussing attack methodology
- Identify pattern: Seller operates on 3-month cycle

**Output:** Complete evidence package for incident response and law enforcement.

---

### Workflow 3: Malware Distribution Infrastructure

**Scenario:** New malware family targeting your vertical

**Intelligence Requirements:**
- Map distribution infrastructure
- Identify exploit kits in use
- Track C2 infrastructure
- Extract IOCs for detection
- Monitor campaign evolution

**Phase 1: Initial Infection Vector (Day 1)**

**When malware sample is identified:**

1. **Capture the delivery mechanism**
   - Malicious landing page (if still active)
   - Exploit kit panel (if observable)
   - Social engineering lures
   - Download pages
   - Tag: \`malware-distribution\`, \`[malware-family]\`, \`initial-access\`

2. **Infrastructure reconnaissance**
   - Capture WHOIS for distribution domains
   - DNS records and IP information
   - SSL certificates
   - Server headers (infrastructure fingerprinting)

3. **Preserve artifacts**
   - Any exposed admin panels (common mistake by operators)
   - Error messages revealing infrastructure
   - JavaScript/code artifacts for attribution

---

**Phase 2: C2 Infrastructure Mapping (Days 1-7)**

1. **C2 domain/IP capture**
   - Any accessible C2 interfaces
   - Check-in pages (if observable)
   - Associated infrastructure
   - Tag: \`c2-infrastructure\`, \`[malware-family]\`

2. **Infrastructure clustering**
   - Search for related IP ranges
   - Identify shared infrastructure
   - Capture all related domains
   - Map hosting providers

3. **Use knowledge graphs**
   - Visualize distribution → C2 relationships
   - Identify infrastructure reuse patterns
   - Spot new domains in same clusters

**Real Example:**

*Malware analysis reveals 8 C2 domains. PageStash captures show 6 share same IP range. Knowledge graph reveals 15 additional domains in same ASN. Proactive blocking of entire netblock disrupts campaign.*

---

**Phase 3: Campaign Evolution Tracking (Days 7-30)**

1. **Monitor for infrastructure changes**
   - Re-capture C2 domains weekly
   - Track domain rotations
   - Document infrastructure evolution
   - Tag versions: \`infrastructure-v1\`, \`infrastructure-v2\`

2. **Search for similar campaigns**
   - Full-text search across historical captures
   - Find previous campaigns with similar TTPs
   - Identify infrastructure reuse
   - Build timeline of threat actor operations

3. **Attribution development**
   - Link to known threat actors
   - Cross-reference with public reporting
   - Document unique artifacts
   - Build evidence for attribution

---

![SOC Infrastructure Mapping](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&auto=format)
*Map malware distribution infrastructure, identify C2 clusters, track campaign evolution*

---

## Advanced Techniques for Threat Intelligence

### Technique 1: Coordinated Campaign Detection

**The Challenge:**
Sophisticated threat actors distribute operations across dozens of domains and infrastructure providers to avoid detection and takedown.

**Traditional Approach:**
Analysts manually track each domain in spreadsheets. Relationships between infrastructure are difficult to spot. Coordinated campaigns go undetected.

**PageStash Technique:**

1. **Aggressive capture during active campaign**
   - Capture every suspicious domain you identify
   - Tag by potential campaign identifier
   - Don't worry about false positives yet

2. **Use knowledge graph to reveal patterns**
   - Load all captures into graph view
   - Auto-detection finds common elements:
     - Same registrar email
     - Same IP ranges or ASNs
     - Same SSL certificate issuer
     - Similar page structures
     - Same timing patterns

3. **Refine based on patterns**
   - Graph clustering reveals coordinated groups
   - Filter out unrelated captures
   - Focus on confirmed campaign infrastructure

4. **Search across campaign captures for IOCs**
   - Full-text search finds all IPs, domains, hashes
   - Export comprehensive IOC list
   - Feed to detection infrastructure

**Real-World Success Story:**

*Security researcher investigating phishing campaign captures 120 suspicious domains. Knowledge graph reveals 45 form tight cluster (same registrar, similar registration dates, shared IP ranges). Full-text search across those 45 finds unique tracking pixel pattern. Pattern becomes detection signature. Campaign attribution confirmed.*

**Time Savings:** Manual analysis would take 40+ hours. Knowledge graph reveals pattern in 20 minutes.

---

### Technique 2: Threat Actor Profile Evolution Tracking

**The Challenge:**
Threat actors evolve their tactics, rebrand, or create new personas. Tracking attribution across persona changes is difficult.

**Traditional Approach:**
Analysts maintain manual notes. When threat actor changes persona, connection is lost. Attribution starts from scratch.

**PageStash Technique:**

1. **Comprehensive capture of threat actor presence**
   - Every forum post
   - All marketplace listings
   - Social media artifacts
   - Any interviews or public statements
   - Tag: \`[actor-persona-1]\`

2. **Capture new persona separately**
   - When new persona emerges, treat as separate threat
   - Capture all activity
   - Tag: \`[actor-persona-2]\`

3. **Search for connection signals**
   - Full-text search across both personas for unique phrases
   - Look for shared TTPs, code artifacts, operational patterns
   - Check for timing correlations (persona-1 goes dark when persona-2 emerges)

4. **Use knowledge graph to show connections**
   - Link personas when strong evidence emerges
   - Visual timeline shows persona evolution
   - Build attribution case

**Example Indicators:**
- Unique phrases: "as I've said before..." (but on new persona)
- Code artifacts: Same script obfuscation technique
- Operational security mistakes: Same timezone, same typos
- Infrastructure reuse: Slight overlap in tools/services

**Real Attribution Case:**

*Threat actor "DarkOverlord" disappears from forums. New actor "CryptoKing" emerges 3 months later. PageStash search finds both use phrase "quantum-resistant encryption" (uncommon term). Both list products in same format. Knowledge graph shows overlapping infrastructure usage. High-confidence attribution links personas.*

---

### Technique 3: Infrastructure Prediction

**The Challenge:**
Threat actors register infrastructure in bulk, then use it over time. If you can identify their registration patterns, you can predict future infrastructure.

**Traditional Approach:**
Reactive blocking only. Wait for infrastructure to be used maliciously, then block.

**PageStash Predictive Technique:**

1. **Historical infrastructure capture**
   - Capture all known malicious infrastructure for a threat actor
   - Include WHOIS, DNS, SSL certs
   - Tag: \`[threat-actor]\`, \`infrastructure\`, \`confirmed-malicious\`

2. **Pattern extraction**
   - Search across all captures for patterns:
     - Preferred registrars
     - Domain generation algorithms (DGAs)
     - Naming conventions
     - Registration timing (bulk registrations)
     - IP range preferences

3. **Proactive discovery**
   - Search domain registration databases for similar patterns
   - Identify potential threat infrastructure before it's weaponized
   - Capture and monitor suspicious domains
   - Tag: \`predicted-infrastructure\`, \`monitor\`

4. **Validation and early blocking**
   - When predicted domain becomes active, capture immediately
   - If validates as malicious, you had early warning
   - Add to blocklist before attacks launch

**Real Example:**

*APT group consistently registers domains using pattern: [common-word]-[common-word]-[number].com. Security team searches for 200 domains matching pattern. PageStash captures and monitors. 3 months later, 15 domains go live with phishing campaigns. Team had 3-month early warning and blocked proactively.*

---

### Technique 4: Vendor Intelligence & Supply Chain Risk

**The Challenge:**
Third-party vendors get compromised. Supply chain attacks spread malware through trusted relationships.

**Traditional Approach:**
React after compromise is public. No early warning signals.

**PageStash Monitoring Technique:**

1. **Baseline vendor presence**
   - Capture official vendor pages
   - Archive product download pages
   - Preserve SSL certificate information
   - Capture code signing certificate details
   - Tag: \`vendor-[name]\`, \`baseline\`, \`legitimate\`

2. **Regular monitoring captures**
   - Weekly re-capture of vendor pages
   - Look for unexpected changes
   - Monitor download links/hashes
   - Check SSL certificate changes
   - Tag each capture with date

3. **Anomaly detection via comparison**
   - Search across captures for changes
   - PageStash search: specific file hashes, domains, infrastructure
   - Identify suspicious modifications
   - Flag for investigation

4. **Incident documentation**
   - When compromise confirmed, you have timestamped evidence
   - Timeline shows when compromise occurred
   - Evidence of what changed
   - Attribution if indicators present

**Supply Chain Case Study:**

*Security team captures SolarWinds product page weekly as part of vendor monitoring. December 2020 capture shows unexpected change in download file hash. Investigation reveals Sunburst backdoor. Timestamped captures provide evidence of when compromise occurred. Early detection limits damage.*

**Lesson:** Regular baseline captures + search across versions = Early warning system.

---

![Threat Actor Attribution](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop&auto=format)
*Build attribution cases by mapping threat actor infrastructure, track persona evolution, predict future campaigns*

---

## Integration with SOC Workflows

### Integration Point 1: SIEM & Log Correlation

**The Challenge:**
SIEM shows IOC detection, but analysts lack context about the threat.

**PageStash Integration:**

1. **Capture threat context at discovery**
   - When new IOC identified, immediately capture source
   - Tag with IOC type: \`ioc-domain\`, \`ioc-ip\`, \`ioc-hash\`

2. **Link captures to SIEM alerts**
   - Include PageStash capture ID in SIEM case notes
   - Or use API to automatically link (custom integration)

3. **During investigation, search PageStash first**
   - Analyst sees alert in SIEM
   - Searches PageStash for IOC
   - Finds all related captures with full context
   - Speeds investigation from hours to minutes

**Workflow:**
\`\`\`
SIEM Alert: Suspicious domain contacted
  ↓
Analyst searches PageStash for domain
  ↓
Finds: Phishing page captured 2 weeks ago
  ↓
Plus: 20 related infrastructure captures
  ↓
Plus: Attribution to known threat actor
  ↓
Investigation complete in 5 minutes (vs. 2 hours manual)
\`\`\`

---

### Integration Point 2: Threat Intel Platform (TIP)

**The Challenge:**
TIP contains IOCs but lacks visual context and source preservation.

**PageStash + TIP Workflow:**

1. **Capture threat intelligence sources**
   - When adding IOC to TIP, capture the source page
   - Tag with TIP case ID or reference
   - Include link back to PageStash capture

2. **Export enriched intelligence**
   - PageStash export (JSON) includes full HTML and metadata
   - Import to TIP with context
   - Or maintain PageStash as visual evidence layer

3. **Bidirectional search**
   - TIP query finds IOCs
   - PageStash search finds visual context for those IOCs
   - Analysts get complete picture

**Example Integration:**
\`\`\`json
{
  "ioc": "malicious-domain.com",
  "type": "domain",
  "confidence": "high",
  "source": "pagestash-capture-id-12345",
  "visual_evidence": "https://app.pagestash.io/clip/12345",
  "captured_at": "2025-11-21T14:30:00Z",
  "tags": ["phishing", "apt29", "campaign-alpha"]
}
\`\`\`

---

### Integration Point 3: Incident Response Platform

**The Challenge:**
IR platform tracks incidents, but evidence is scattered across tools.

**PageStash IR Workflow:**

1. **Create folder per incident**
   - IR-2025-023: [Incident Description]
   - All related captures go here

2. **Tag captures by incident phase**
   - \`initial-access\`
   - \`lateral-movement\`
   - \`data-exfiltration\`
   - \`c2-communication\`

3. **Export evidence package for IR report**
   - Markdown export includes all captures
   - Timeline based on capture timestamps
   - Visual evidence embedded
   - IOC list automatically generated

4. **Link to IR platform**
   - Include PageStash folder URL in IR case
   - Or export and attach to case

**Result:** Complete visual evidence trail for entire incident.

---

### Integration Point 4: Collaboration with External Teams

**The Challenge:**
Sharing threat intelligence with ISACs, law enforcement, or partner organizations requires sanitization and proper packaging.

**PageStash Sharing Workflow:**

1. **Organize captures for sharing**
   - Create "Shareable" folder
   - Remove any internal/sensitive captures
   - Ensure only sanitized captures included

2. **Export with proper context**
   - Markdown export for readability
   - JSON export for machine processing
   - Include metadata and timestamps
   - Document capture methodology

3. **Share with attribution**
   - Export preserves PageStash timestamps (credibility)
   - Metadata shows capture source
   - Recipients can verify authenticity

4. **Maintain separate internal analysis**
   - Keep detailed analysis in separate folder
   - Share only actionable intelligence
   - Protect sensitive sources/methods

---

## Evidence Standards for SOC Operations

### What Makes Threat Intelligence Evidence "Good"

**Admissibility isn't just for courtrooms** - even internal escalations need credibility.

**Good threat intelligence evidence includes:**

1. **Timestamp** (when threat was observed)
2. **Complete capture** (screenshot + HTML + metadata)
3. **Context** (how discovered, why relevant)
4. **Chain of custody** (who captured, who analyzed)
5. **Methodology** (what tools used, any limitations)

### PageStash Evidence Features

**Automatic:**
- ✅ Timestamp (UTC + timezone)
- ✅ Complete capture (screenshot + HTML + text)
- ✅ Metadata (URL, domain, HTTP headers)
- ✅ Immutable storage (captures can't be edited)

**Manual (you must add):**
- ⚠️ Context notes (why you captured this)
- ⚠️ Tags (organization and categorization)
- ⚠️ Chain of custody (document who accessed)
- ⚠️ Methodology (in your IR documentation)

### When You Might Need Forensic-Grade Evidence

**For most SOC work:** PageStash evidence quality is sufficient
- Internal escalations
- Threat reports
- IOC sharing
- Attribution analysis

**For law enforcement cases:** Consider Hunchly
- Criminal prosecution expected
- Need established courtroom precedent
- Expert witness testimony required
- Defense attorneys will challenge everything

**PageStash vs. Hunchly decision:**
- Stakes < $1M: PageStash ($12/mo)
- Stakes > $1M or criminal case: Hunchly ($130/yr)
- Most SOC teams: Use both (PageStash for daily work, Hunchly for critical cases)

---

## Team Workflows for Security Operations Centers

### SOC Team Structure & Responsibilities

**Tier 1 Analysts: Front-line Capture**
- Capture initial threat indicators during triage
- Tag with basic classification
- Create incident folders
- Hand off to Tier 2 with captures included

**Tier 2 Analysts: Deep Investigation**
- Expand capture scope
- Perform infrastructure enumeration
- Use knowledge graphs for analysis
- Search across historical captures
- Export evidence for escalation

**Threat Intelligence Team: Strategic Analysis**
- Maintain threat actor profiles
- Track campaign evolution
- Build attribution cases
- Create comprehensive threat reports
- Share intelligence externally

**Incident Response: Evidence Packaging**
- Compile capture evidence for IR reports
- Export timeline of incident
- Create evidence packages for management
- Coordinate with legal if needed

---

### SOC Daily Workflow with PageStash

**Morning (Shift Start):**
1. Review overnight alerts in SIEM
2. For each new IOC, search PageStash
3. If not found, capture source and add to archive
4. Tag with current date for tracking

**During Shift (Ongoing):**
1. Any suspicious domain/URL → Capture immediately
2. Phishing reports → Capture phishing pages before takedown
3. Malware alerts → Capture related infrastructure
4. Threat intel reports → Capture mentioned IOCs for archive

**Evening (Shift End):**
1. Review day's captures
2. Ensure proper tagging
3. Update team on significant findings
4. Export any urgent IOCs to blocklist

**Weekly (Team Meeting):**
1. Review knowledge graphs for patterns
2. Identify coordinated campaigns
3. Update threat actor profiles
4. Plan proactive hunting based on patterns

---

### Creating a SOC Knowledge Base

**PageStash as institutional memory:**

**1. Threat Actor Profiles**
- Folder per tracked actor
- All observed infrastructure
- TTPs and techniques
- Attribution evidence
- Evolution over time

**2. Campaign Archives**
- Folder per major campaign
- Infrastructure clusters
- IOC repositories
- Timeline of events
- Attribution analysis

**3. Technique Library**
- Examples of specific TTPs
- Malware families
- Exploit kits
- Social engineering lures
- Organized by MITRE ATT&CK

**4. Vendor Baselines**
- Legitimate vendor pages
- Product downloads
- SSL certificates
- For supply chain monitoring

**Result:** New analysts onboard faster, institutional knowledge preserved.

---

![SOC Team Collaboration](https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=600&fit=crop&auto=format)
*Enable SOC team collaboration with shared folders, collaborative tagging, and team-wide search*

---

## Common Mistakes in Threat Intel Capture

### Mistake 1: "I'll Capture It Later"

**Why this fails catastrophically:**

Threat infrastructure is ephemeral by design:
- Phishing domains: Average lifespan 24-48 hours
- Malware C2: Rotates every few days
- Darkweb markets: Can disappear overnight
- Exploit kits: Constantly shifting infrastructure

**Real consequences:**
- Threat actor realizes they're being watched → Scrubs everything
- Hosting provider takedown → Evidence vanishes
- Domain expires → Link dead
- Law enforcement action → Infrastructure seized before you capture

**The fix:**
**Capture immediately, organize later.**

Set this rule: Any URL mentioned in an alert or investigation gets captured within 15 minutes. No exceptions.

---

### Mistake 2: Screenshot Only (No HTML Source)

**Why screenshots alone fail:**

❌ **Can't search** - That IP address is in a screenshot somewhere... but where?  
❌ **Can't extract IOCs** - Manual retyping prone to errors  
❌ **Can't verify** - Is this screenshot authentic or Photoshopped?  
❌ **Can't analyze code** - Need HTML source for artifact analysis  
❌ **Limited evidence** - Opposing experts will challenge screenshot-only evidence

**The fix:**
Always capture both:
- Screenshot (visual proof)
- HTML source (searchable, analyzable)
- Metadata (timestamp, headers, context)

PageStash does this automatically. Manual screenshots don't.

---

### Mistake 3: No Tagging Taxonomy

**What happens:**

Month 1: Captures go into one big folder  
Month 3: 500 captures, no organization  
Month 6: "I know we captured that domain... somewhere..."  
Result: Evidence exists but can't be found when needed

**The fix:**

**Define tagging taxonomy from Day 1:**

**By threat type:**
- \`phishing\`
- \`malware\`
- \`c2-infrastructure\`
- \`data-breach\`
- \`ransomware\`

**By campaign:**
- \`campaign-2025-11-apt29\`
- \`campaign-emotet-wave-3\`

**By confidence:**
- \`confirmed-malicious\`
- \`suspicious\`
- \`investigating\`

**By MITRE ATT&CK:**
- \`T1566-phishing\`
- \`T1071-c2-web\`

**By threat actor:**
- \`apt29\`
- \`lazarus-group\`
- \`unknown-actor-alpha\`

**Pro tip:** Use hierarchical tags: \`threat-actor:apt29\`, \`ttp:T1566\`, \`campaign:2025-11\`

---

### Mistake 4: Not Using Knowledge Graphs

**What analysts miss:**

You capture 100 suspicious domains over 3 months. Manual analysis in folders:
- You see each domain individually
- Relationships are invisible
- Coordinated campaigns go undetected
- Attribution signals missed

**With knowledge graphs:**
- Visualize all 100 at once
- Auto-detect shared infrastructure
- Spot clusters instantly
- "Aha!" moments happen

**Real example:**

*SOC team captured 87 phishing domains. Folders showed nothing special. Loaded into knowledge graph → 23 formed tight cluster (same registrar, same IP range, same day registered). Cluster analysis revealed coordinated campaign. Search across those 23 found unique malware sample. Campaign attribution complete.*

**The fix:**
Use knowledge graph view weekly. Review all recent captures. Look for clusters.

---

### Mistake 5: No Export/Backup Strategy

**Nightmare scenario:**

Your PageStash account gets locked (payment issue, technical problem, etc.)  
OR: PageStash goes out of business (any SaaS can fail)  
OR: Ransomware hits and you need offline evidence  
Result: All your threat intelligence inaccessible at the worst possible time

**The fix:**

**Weekly exports of critical evidence:**

1. Export high-value captures (JSON format)
2. Store in secure, backed-up location
3. Keep offline copies of critical cases
4. Document where backups are stored

**For active investigations:**
- Export evidence package immediately
- Don't rely solely on cloud storage
- Keep local copies until case closed

**For long-term archive:**
- Monthly full export
- Store in multiple locations
- Include metadata and timestamps

---

### Mistake 6: Capturing Without Context

**What happens:**

You capture a suspicious page. Three months later:
- Why did I capture this?
- What case was this related to?
- How did I find it?
- Is this confirmed malicious or just suspicious?

Result: Evidence is useless without context.

**The fix:**

**Add context notes immediately:**

Required fields:
- **Why captured:** "Suspicious domain from phishing email to CEO"
- **How found:** "Alert from email gateway, user reported"
- **Initial assessment:** "Likely credential harvesting, mimics Office 365"
- **Related to:** "Incident IR-2025-023"
- **Confidence:** "High - confirmed malicious via sandbox"

**Template:**
\`\`\`
SOURCE: [How you found this]
RELEVANCE: [Why this matters]
CONFIDENCE: [Malicious/Suspicious/Unknown]
RELATED: [Case ID or related captures]
NEXT STEPS: [What to do with this]
\`\`\`

Takes 30 seconds. Saves hours later.

---

## Getting Started: 30-Day SOC Implementation

### Week 1: Setup & Policy (8 hours)

**Day 1-2: Tool Deployment**
- Deploy PageStash browser extension to all analysts
- Create team account with appropriate plan
- Set up folder structure:
  - \`/Active-Investigations\`
  - \`/Threat-Actors\`
  - \`/Campaigns\`
  - \`/IOC-Archive\`
  - \`/Vendor-Monitoring\`
- Create tag taxonomy document
- Configure access controls

**Day 3-4: Training**
- 2-hour training session for all analysts:
  - Capture workflow
  - Tagging standards
  - Knowledge graph basics
  - Search techniques
  - Export for reporting
- Create quick reference guide
- Designate PageStash champion per shift

**Day 5: Integration Planning**
- Document integration points with SIEM
- Plan API connections (if needed)
- Create evidence export templates
- Update incident response playbooks

---

### Week 2-3: Pilot Program (Active Use)

**Week 2: Capture Everything**
- Every analyst captures all threat-related URLs
- Don't worry about perfect organization yet
- Focus on building capture habit
- Tag minimally (threat type + date)

**Daily standup question:**
"What did you capture yesterday?"

**Metrics to track:**
- Number of captures per analyst
- Response time (alert → capture)
- Tagging compliance

**Week 3: Analysis & Refinement**
- Review all captures as team
- Identify gaps in coverage
- Refine tagging taxonomy
- Practice knowledge graph analysis
- Export sample evidence packages

**Team exercise:**
"Load last 2 weeks of captures into knowledge graph. What patterns do you see?"

---

### Week 4: Full Operational Deployment

**By Day 30:**
- ✅ All analysts capturing consistently
- ✅ Tagging taxonomy followed
- ✅ Knowledge graphs reviewed weekly
- ✅ Evidence exports standardized
- ✅ Integration with SIEM documented
- ✅ Incident response updated

**Success metrics:**
- 90%+ of alerts have associated captures
- Average capture time < 15 minutes from discovery
- All investigations have evidence folders
- At least 1 attribution case improved by knowledge graphs

**Review meeting:**
- What worked well?
- What needs improvement?
- How has this changed workflows?
- What additional training needed?

---

## ROI Analysis for Security Teams

### Cost of NOT Having Proper Threat Intelligence Capture

**Scenario 1: Lost Attribution**
- Investigation stalls because infrastructure disappeared
- Can't attribute to known threat actor
- Can't predict next move
- **Cost:** 40 analyst hours wasted + ongoing exposure

**Scenario 2: Duplicate Investigation**
- Same threat investigated 6 months apart
- No institutional memory
- Re-do entire infrastructure enumeration
- **Cost:** 80 hours + missed prevention opportunity

**Scenario 3: Incomplete Evidence**
- Threat intel for executives requires visuals
- Screenshot-only evidence lacks credibility
- Report delayed while recreating analysis
- **Cost:** Reputational damage + delayed response

**Scenario 4: Missed Pattern**
- 3 separate campaigns, all related
- Analysts don't see connection (siloed in folders)
- Coordinated attack goes undetected
- **Cost:** Major incident that could have been prevented

**Total annual cost of poor capture:** $200K - $500K (for 10-person SOC)

---

### Cost of PageStash for SOC Team

**For 10-person SOC:**

**Software:**
- 10 analysts × $12/month = $120/month = $1,440/year

**Implementation:**
- Training: 20 hours × $75/hour = $1,500 (one-time)
- Policy development: 8 hours × $100/hour = $800 (one-time)

**Total Year 1:** ~$3,740  
**Ongoing annual:** $1,440

---

### ROI Calculation

**Savings from proper threat intelligence capture:**

**Time savings:**
- Infrastructure searches: 10 hours/week saved = $39K/year
- Duplicate investigations eliminated: 80 hours/year = $6K/year
- Report generation faster: 5 hours/week = $19.5K/year

**Prevention value:**
- One incident prevented by pattern detection: $50K - $500K
- Faster attribution enables proactive blocking: $20K - $100K
- Better evidence for escalations: Priceless

**Conservative ROI:** 15x - 50x  
**Realistic ROI:** 100x+ (if prevents one major incident)

**Break-even:** Within first month if saves 30 analyst hours

---

## Conclusion: Modern Threats Require Modern Intelligence

**The threat landscape has changed:**

✅ Adversaries are faster (infrastructure rotates hourly)  
✅ Attacks are coordinated (campaigns span 100+ domains)  
✅ Attribution is critical (nation-state vs. criminal matters)  
✅ Evidence must be defensible (legal proceedings increasing)

**Traditional methods can't keep up:**

❌ Bookmarks become dead links  
❌ Screenshots lack searchability  
❌ Manual tracking doesn't scale  
❌ Folder organization hides patterns

**Professional SOC teams need professional tools:**

✅ **Complete capture** (screenshot + HTML + metadata + timestamp)  
✅ **Powerful search** (find any IOC across thousands of captures)  
✅ **Knowledge graphs** (visualize infrastructure relationships)  
✅ **Team collaboration** (shared intelligence across shifts)  
✅ **Evidence export** (reports, SIEM integration, law enforcement packages)

---

## Tool Recommendations by SOC Size

### Small SOC (1-3 analysts):
→ **PageStash Pro** ($12/analyst/month)
- Covers all essential needs
- Knowledge graphs provide force multiplier
- Affordable for small budget
- Scales as team grows

### Medium SOC (4-10 analysts):
→ **PageStash Pro** for daily work  
→ **+ Hunchly** for critical investigations
- PageStash for volume (most captures)
- Hunchly when need forensic-grade
- Best of both worlds

### Large SOC (10+ analysts):
→ **PageStash Enterprise**
- SSO integration
- Advanced API access
- Custom integrations with SIEM/TIP
- Dedicated support
- Volume pricing

### Law Enforcement:
→ **Hunchly** (purpose-built for LE)
- Established in courtrooms
- Automatic capture
- Forensically sound
- Worth the higher cost

---

## Get Started Today

### 30-Day Risk-Free Test

**Try PageStash with your SOC team:**

1. **Week 1:** Deploy to 2-3 analysts (pilot group)
2. **Week 2:** Capture on active investigations
3. **Week 3:** Try knowledge graph analysis
4. **Week 4:** Evaluate impact

**Most SOC teams realize within 2 weeks:** The time saved finding evidence pays for the tool 10x over.

**Free tier available:** 10 captures/month per analyst (perfect for pilot)

[Start SOC Team Trial - No Card Required] →

---

## Frequently Asked Questions

**Q: Can PageStash capture Tor/darkweb sites?**

A: Yes - PageStash captures any page your browser can access, including Tor hidden services. If you can see it in your browser, PageStash can capture it.

**Q: What about OPSEC? Does PageStash alert threat actors?**

A: PageStash operates as a normal browser extension. It doesn't inject any tracking or make suspicious requests. To threat actors, your capture looks like a normal page view.

For highest OPSEC: Use dedicated investigation VM, route through VPN/Tor, and practice normal OPSEC procedures.

**Q: How long are captures stored?**

A: Pro plan: Indefinitely (unless you delete). Free tier: Indefinitely up to storage limits. Always export critical evidence for redundancy.

**Q: Can multiple analysts work on the same investigation?**

A: Yes - shared folders allow team collaboration. Multiple analysts can capture to the same folder, tag collaboratively, and search across all team captures.

**Q: Does this integrate with our TIP/SIEM?**

A: API access available (Pro/Enterprise). Export formats: JSON (machine-readable), Markdown (reports), PDF (sharing). Direct SIEM integration via API (custom development required).

STIX export on roadmap but not available yet.

**Q: What if PageStash goes out of business?**

A: Always export critical evidence (JSON format with full HTML). Don't rely solely on any cloud service. Best practice: Monthly exports to offline storage.

**Q: Is this better than Hunchly?**

A: Different use cases:
- PageStash: Better for daily SOC work, knowledge graphs, team collaboration ($12/mo)
- Hunchly: Better for law enforcement, established in court, automatic capture ($130/yr)
- Many teams use both

**Q: Can we self-host for air-gapped networks?**

A: Not currently. Self-hosted version on enterprise roadmap. For air-gapped SOCs, consider Hunchly (desktop app) or custom tooling.

**Q: How do I train my team on this?**

A: We provide:
- Documentation and guides
- Video tutorials
- Best practices from other SOC teams
- Email support
- Enterprise: On-site training available

**Q: What about compliance? (GDPR, SOC 2, etc.)**

A: PageStash stores data encrypted at rest and in transit. Access controls and audit logs available. For specific compliance requirements (HIPAA, FedRAMP), contact enterprise team.

**Q: Can I export for court cases?**

A: Yes - exports include timestamps and metadata. However, admissibility depends on your documentation and methodology, not the tool alone. For criminal cases, consider Hunchly (more established in courtrooms) or engage digital forensics expert.

---

## What Patterns Will You Discover?

**The difference between good threat intelligence and great threat intelligence isn't just capturing evidence—it's seeing how the pieces connect.**

Most SOC teams miss attribution signals because they're buried in folders and spreadsheets. When you can visualize 100+ malicious domains as a knowledge graph, **the invisible becomes obvious.**

Coordinated campaigns. Infrastructure clusters. Threat actor patterns. Attribution chains.

**They were always there. Your tools just couldn't show you.**

---

## Start Building Better Threat Intelligence

**Next active investigation:** Capture it properly.

**30-day challenge:**
1. Install PageStash browser extension
2. Capture every threat-related URL for next 30 days
3. After 30 days, load knowledge graph
4. See what patterns emerge

**Most security teams realize:** That one prevented incident pays for the tool 1000x over.

[Start Free Trial - 10 Captures, No Card Required] →

---

*Last updated: November 2025*

*Written by security practitioners, for security practitioners. PageStash is used by SOC teams, threat intelligence analysts, and security researchers worldwide.*
`
}

