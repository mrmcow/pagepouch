# 📤 PageStash Export Strategy - Research Niche

**Purpose:** Transform PageStash from capture tool → research workflow hub  
**Date:** November 21, 2025  
**Status:** Planning & Validation Phase

---

## 🎯 Core Problem We're Solving

### Current User Pain:

**Academic Researcher:**
```
Captures 50 papers → Needs to cite them → Must manually:
1. Copy each URL
2. Look up publication info
3. Format in APA style
4. Paste into Word doc
5. Repeat 50 times

Time wasted: 2-3 hours
Frustration level: HIGH
```

**OSINT Analyst:**
```
Captures 30 sources → Needs to write report → Must:
1. Screenshot each capture
2. Copy to PowerPoint
3. Add timestamps manually
4. Write source list
5. Organize chronologically

Time wasted: 1-2 hours
Frustration level: HIGH
```

**Market Researcher:**
```
Captures 15 competitor sites → Needs comparison table → Must:
1. Open each capture
2. Copy pricing/features
3. Build table in Excel
4. Take screenshots
5. Format presentation

Time wasted: 3-4 hours
Frustration level: HIGH
```

### Solution: Smart Bulk Export

**One click:**
```
Select clips → Choose format → Export → Done

Time saved: 90%
Delight level: HIGH
```

---

## 🔧 Export Feature Design

### Core UX Flow:

```
┌─────────────────────────────────────────┐
│  Folder: "Thesis Research" (47 clips)  │
├─────────────────────────────────────────┤
│  ☑ Select All                           │
│  ☐ Clip 1: Smith 2024 paper            │
│  ☐ Clip 2: Jones research               │
│  ☐ Clip 3: Company blog post            │
│  ...                                     │
├─────────────────────────────────────────┤
│  [🗑️ Delete] [📤 Export Selected]       │
└─────────────────────────────────────────┘

Click "Export Selected" →

┌─────────────────────────────────────────┐
│  Export 47 clips as:                    │
├─────────────────────────────────────────┤
│  📄 Document Formats                     │
│   ○ Markdown (.md)                       │
│   ○ PDF Report                           │
│   ○ Word Document (.docx)                │
│   ○ HTML Page                            │
│                                          │
│  📚 Citation Formats                     │
│   ○ Bibliography (APA/MLA/Chicago)       │
│   ○ BibTeX (LaTeX)                       │
│   ○ RIS (Reference Manager)              │
│                                          │
│  📊 Data Formats                         │
│   ○ CSV Spreadsheet                      │
│   ○ JSON (API format)                    │
│   ○ Excel Workbook                       │
│                                          │
│  🔗 Integrations                         │
│   ○ Send to Notion                       │
│   ○ Send to Zotero                       │
│   ○ Send to Obsidian                     │
│                                          │
│  [⚙️ Advanced Options ▼]                │
│                                          │
│  [Cancel] [Export]                       │
└─────────────────────────────────────────┘
```

---

## ✅ Use Case Validation

### Let's test if this is ACTUALLY useful...

---

### **Use Case 1: PhD Student Writing Literature Review**

**User:** Sarah, PhD candidate in Psychology  
**Task:** Writing Chapter 2 literature review (50 papers cited)

**Current Painful Flow:**
1. Opens PageStash
2. Opens each of 50 captures individually
3. Copies URL from each
4. Opens citation generator website
5. Pastes URL, generates citation
6. Copies citation to Word
7. Repeats 50 times
8. **Time: 3 hours**

**With Export Feature:**
1. Opens folder "Chapter 2 Literature"
2. Clicks "Select All" (50 clips)
3. Clicks "Export"
4. Selects "Bibliography → APA Format"
5. Gets file with 50 perfect citations
6. Copies to Word doc
7. **Time: 5 minutes**

**Validation:** ✅ **MASSIVELY USEFUL**
- Saves 2h 55min
- Eliminates citation errors
- Reduces cognitive load

**What format they need:**
```markdown
# References

Smith, J. (2024). *The Psychology of Digital Behavior*. 
    Journal of Modern Psychology, 45(3), 234-256. 
    https://example.com/smith2024

Jones, A. (2023). *Cognitive Load in Online Research*. 
    Behavioral Science Quarterly, 12(1), 45-67. 
    https://example.com/jones2023

[... 48 more ...]
```

**Additional value:**
- Alphabetically sorted
- Properly formatted
- All metadata preserved
- Copy-paste ready

---

### **Use Case 2: OSINT Analyst Writing Intelligence Report**

**User:** Alex, threat intelligence analyst  
**Task:** Monthly threat report (30 sources)

**Current Painful Flow:**
1. Opens PageStash
2. Opens Word, starts typing
3. Goes back to PageStash for each source
4. Takes screenshot, copies to Word
5. Types URL manually
6. Adds timestamp manually
7. Tries to remember chronological order
8. **Time: 2 hours**

**With Export Feature:**
1. Opens folder "October Threats"
2. Selects all 30 clips
3. Clicks "Export → PDF Report"
4. Chooses template: "OSINT Investigation"
5. Reviews auto-generated report
6. Adds executive summary
7. **Time: 20 minutes**

**Validation:** ✅ **VERY USEFUL**
- Saves 1h 40min
- Chronological order automatic
- All screenshots included
- Professional format

**What format they need:**
```markdown
# Threat Intelligence Report: October 2024

## Executive Summary
[Their notes from folder]

## Timeline of Threats

### 2024-10-03 14:23 UTC
**Source:** darkweb-forum.onion/thread/12345
**Type:** Social Media
**Threat Level:** HIGH

[Full-page screenshot]

**Key Content:**
"New exploit targeting XYZ software..."

**Analysis Notes:**
Cross-referenced with known actor groups...

---

### 2024-10-05 09:15 UTC
[Next threat...]

## Summary Statistics
- Total sources: 30
- High threat: 8
- Medium threat: 15
- Low threat: 7

## Appendix: All Sources
[Complete list with timestamps]
```

**Additional value:**
- Timestamps in UTC
- Threat levels from tags
- Screenshots preserved
- Audit trail included

---

### **Use Case 3: Market Researcher Building Competitor Analysis**

**User:** Mike, product manager  
**Task:** Quarterly competitive analysis (12 competitors)

**Current Painful Flow:**
1. Captures 12 competitor pricing pages
2. Opens Excel
3. Manually types each company name
4. Types pricing for each plan
5. Takes screenshots separately
6. Pastes into PowerPoint
7. Builds comparison table by hand
8. **Time: 3 hours**

**With Export Feature:**
1. Opens folder "Q4 Competitors"
2. Selects 12 pricing page captures
3. Clicks "Export → CSV Spreadsheet"
4. Opens in Excel
5. Auto-generated comparison table
6. Adjusts formatting
7. **Time: 20 minutes**

**Validation:** ✅ **USEFUL** (with caveats)
- Saves 2h 40min
- Structure is automatic
- But: Requires AI to extract pricing

**What format they need:**
```csv
Company,URL,Captured Date,Starter Plan,Pro Plan,Enterprise Plan,Key Feature
Competitor A,https://...,2024-11-01,$49/mo,$99/mo,Custom,AI-powered
Competitor B,https://...,2024-11-02,$39/mo,$79/mo,$199/mo,Unlimited
Competitor C,https://...,2024-11-03,Free,$89/mo,Custom,API access
```

**Reality check:** ⚠️ **NEEDS AI EXTRACTION**
- Can't auto-detect pricing from screenshots
- Would need AI to parse page content
- Or: Provide structured template they fill

**Better approach:**
```csv
Company,URL,Captured Date,Screenshot,Your Notes
Competitor A,https://...,2024-11-01,capture-001.png,"Starter: $49, Pro: $99"
Competitor B,https://...,2024-11-02,capture-002.png,"Pricing increased 20%"
```

**This is realistic** - includes their notes, they do analysis.

---

### **Use Case 4: Content Creator Researching Article**

**User:** Emma, tech journalist  
**Task:** Writing article citing 15 sources

**Current Painful Flow:**
1. Captures 15 sources while researching
2. Writing article in Google Docs
3. Needs to insert quotes with citations
4. Opens each capture individually
5. Copies quote
6. Types citation manually
7. Hopes she didn't miss any
8. **Time: 1.5 hours of context switching**

**With Export Feature:**
1. Opens folder "Article: Web Scraping Ethics"
2. Selects 15 clips
3. Clicks "Export → Markdown with Quotes"
4. Gets document with all quotes + citations
5. Copy-pastes relevant ones into article
6. **Time: 15 minutes**

**Validation:** ✅ **VERY USEFUL**
- Saves 1h 15min
- All quotes in one place
- Citations automatic
- Easy to scan and select

**What format they need:**
```markdown
# Research: Web Scraping Ethics

## Source 1: Legal Expert Opinion
**URL:** https://legaltech.com/scraping-laws
**Date:** 2024-10-15
**Author:** Jane Smith, Tech Lawyer

### Key Quotes:
> "Web scraping occupies a legal gray area..."

> "The CFAA applies when authentication is bypassed..."

**Citation:** Smith, J. (2024). "Web Scraping Laws Explained." 
LegalTech. https://legaltech.com/scraping-laws

---

## Source 2: Industry Perspective
[...]
```

**Additional value:**
- All quotes extracted
- Context preserved
- Easy to cite
- Source verification simple

---

## 🎯 Validated Export Formats (Build These)

Based on use case validation:

### **Tier 1 (Must Build - High Impact, Real Demand):**

| Format | Use Case | Validation | Priority |
|--------|----------|------------|----------|
| **Bibliography (APA/MLA/Chicago)** | Academic citations | ✅ Massive time saver | **P0** |
| **PDF Report (with template)** | OSINT/investigation reports | ✅ Professional output | **P0** |
| **Markdown (with backlinks)** | Obsidian/Roam users | ✅ Workflow integration | **P0** |
| **CSV (with metadata)** | Data analysis, tracking | ✅ Simple, useful | **P1** |

### **Tier 2 (Should Build - Medium Demand, Good Value):**

| Format | Use Case | Validation | Priority |
|--------|----------|------------|----------|
| **BibTeX** | LaTeX academics | ✅ Niche but loyal users | **P1** |
| **Word Document (.docx)** | Corporate users | ✅ Standard format | **P1** |
| **RIS (Reference Manager)** | Mendeley/Zotero users | ✅ Standard format | **P2** |
| **JSON** | Developers, API users | ✅ Flexibility | **P2** |

### **Tier 3 (Maybe Build - Lower Demand or Complex):**

| Format | Use Case | Validation | Priority |
|--------|----------|------------|----------|
| **PowerPoint** | Presentations | ⚠️ Complex, manual better? | **P3** |
| **Excel** | Advanced analysis | ⚠️ CSV sufficient? | **P3** |
| **HTML** | Web publishing | ⚠️ Markdown → HTML easy | **P3** |

---

## 🔨 Technical Implementation

### Export Engine Architecture:

```typescript
// Core export interface
interface ExportRequest {
  clips: Clip[]
  format: ExportFormat
  options: ExportOptions
}

enum ExportFormat {
  BIBLIOGRAPHY_APA = 'bibliography_apa',
  BIBLIOGRAPHY_MLA = 'bibliography_mla',
  BIBLIOGRAPHY_CHICAGO = 'bibliography_chicago',
  MARKDOWN = 'markdown',
  PDF_REPORT = 'pdf_report',
  CSV = 'csv',
  JSON = 'json',
  BIBTEX = 'bibtex',
  RIS = 'ris',
  DOCX = 'docx',
}

interface ExportOptions {
  includeScreenshots?: boolean
  includeNotes?: boolean
  sortBy?: 'date' | 'title' | 'alphabetical'
  template?: string // For reports
  groupBy?: 'date' | 'tag' | 'source'
}
```

### Export Flow:

```typescript
async function exportClips(request: ExportRequest): Promise<File> {
  // 1. Gather data
  const clips = await fetchClips(request.clips)
  const metadata = await extractMetadata(clips)
  
  // 2. Format data
  const formatted = await formatForExport(
    clips, 
    metadata, 
    request.format,
    request.options
  )
  
  // 3. Generate file
  const file = await generateFile(formatted, request.format)
  
  // 4. Return download
  return file
}
```

---

## 📋 Export Templates (Actual Implementations)

### **Template 1: Academic Bibliography**

**Input:** 50 clips with URLs  
**Output:** Formatted bibliography

```typescript
function exportBibliography(
  clips: Clip[], 
  style: 'APA' | 'MLA' | 'Chicago'
): string {
  const citations = clips.map(clip => {
    // Extract metadata
    const metadata = extractCitationMetadata(clip)
    
    // Format based on style
    return formatCitation(metadata, style)
  })
  
  // Sort alphabetically by author last name
  citations.sort((a, b) => a.author.localeCompare(b.author))
  
  return citations.join('\n\n')
}

function extractCitationMetadata(clip: Clip) {
  return {
    author: clip.metadata.author || 'Author Unknown',
    year: clip.metadata.publishedDate?.getFullYear() || clip.capturedAt.getFullYear(),
    title: clip.metadata.title || clip.url,
    url: clip.url,
    accessDate: clip.capturedAt,
    publisher: clip.metadata.siteName || new URL(clip.url).hostname,
  }
}

function formatCitation(metadata: CitationMetadata, style: CitationStyle) {
  switch(style) {
    case 'APA':
      return `${metadata.author} (${metadata.year}). ${metadata.title}. ${metadata.publisher}. ${metadata.url}`
    case 'MLA':
      return `${metadata.author}. "${metadata.title}." ${metadata.publisher}, ${metadata.year}, ${metadata.url}.`
    case 'Chicago':
      return `${metadata.author}. "${metadata.title}." ${metadata.publisher}. ${metadata.year}. ${metadata.url}.`
  }
}
```

**Example Output (APA):**
```
Johnson, M. (2024). The Future of Web Archival. TechResearch. 
    https://techresearch.com/archival-future

Smith, J. (2023). Digital Preservation Methods. Academic Press. 
    https://press.edu/preservation

Williams, A. (2024). OSINT Techniques for Investigators. Security Today. 
    https://securitytoday.com/osint-techniques
```

---

### **Template 2: OSINT Investigation Report**

**Input:** 30 clips in chronological order  
**Output:** Professional PDF report

```typescript
function exportOSINTReport(clips: Clip[], options: ReportOptions): PDFDocument {
  const report = {
    title: options.title || 'Investigation Report',
    date: new Date(),
    analyst: options.analyst || 'Analyst',
    
    executiveSummary: options.summary || '',
    
    timeline: clips.sort((a, b) => 
      a.capturedAt.getTime() - b.capturedAt.getTime()
    ).map(clip => ({
      timestamp: clip.capturedAt,
      url: clip.url,
      screenshot: clip.screenshotUrl,
      notes: clip.notes,
      tags: clip.tags,
    })),
    
    statistics: {
      totalSources: clips.length,
      dateRange: {
        start: clips[0].capturedAt,
        end: clips[clips.length - 1].capturedAt,
      },
      sourceTypes: countByType(clips),
    },
    
    appendix: clips.map(clip => ({
      title: clip.metadata.title,
      url: clip.url,
      captured: clip.capturedAt,
      fullText: clip.extractedText,
    })),
  }
  
  return generatePDF(report, 'osint-template')
}
```

**Example Output Structure:**
```markdown
# OSINT Investigation Report

**Subject:** Threat Actor Analysis  
**Date Range:** Oct 1 - Nov 1, 2024  
**Analyst:** Alex Thompson  
**Classification:** CONFIDENTIAL

## Executive Summary
[User-provided summary from folder description]

## Timeline of Activity

### 2024-10-01 14:23:00 UTC
**Source:** forum.example.com/thread/12345  
**Type:** Forum Post  
**Threat Level:** HIGH (tagged)

[Full-page screenshot]

**Content Summary:**
User "threat_actor_123" posted regarding new exploit...

**Analyst Notes:**
Cross-referenced with known TTPs. Matches previous campaigns...

---

[29 more entries...]

## Statistical Analysis
- Total Sources: 30
- Date Range: 31 days
- Source Types:
  - Forums: 12
  - Social Media: 8
  - Paste Sites: 6
  - Dark Web: 4

- Threat Levels:
  - HIGH: 8
  - MEDIUM: 15
  - LOW: 7

## Key Findings
1. Increased activity on Oct 15-17
2. New infrastructure identified
3. Coordination between 3 known actors

## Recommendations
1. Monitor identified infrastructure
2. Update blocking rules
3. Notify affected parties

## Appendix A: Complete Source List
[All 30 sources with full metadata]

## Appendix B: Technical Details
[Extracted text, URLs, timestamps]
```

---

### **Template 3: Research Notes (Markdown)**

**Input:** 25 clips with notes  
**Output:** Interconnected markdown files

```typescript
function exportMarkdown(clips: Clip[], options: MarkdownOptions): MarkdownExport {
  return clips.map(clip => {
    const filename = slugify(clip.metadata.title) + '.md'
    const content = generateMarkdownContent(clip, clips, options)
    
    return { filename, content }
  })
}

function generateMarkdownContent(clip: Clip, allClips: Clip[], options: MarkdownOptions) {
  const relatedClips = findRelatedClips(clip, allClips)
  
  return `---
title: ${clip.metadata.title}
url: ${clip.url}
captured: ${clip.capturedAt.toISOString()}
tags: ${clip.tags.join(', ')}
---

# ${clip.metadata.title}

**Source:** ${clip.url}  
**Captured:** ${formatDate(clip.capturedAt)}

## Screenshot

![${clip.metadata.title}](./screenshots/${clip.id}.png)

## My Notes

${clip.notes || 'No notes added.'}

## Key Quotes

${extractQuotes(clip.extractedText)}

## Metadata

- **Author:** ${clip.metadata.author || 'Unknown'}
- **Published:** ${clip.metadata.publishedDate || 'Unknown'}
- **Domain:** ${new URL(clip.url).hostname}
- **Capture ID:** ${clip.id}

## Related Captures

${relatedClips.map(related => 
  `- [[${related.metadata.title}]] - ${related.tags.find(t => clip.tags.includes(t))}`
).join('\n')}

## Tags

${clip.tags.map(tag => `#${tag}`).join(' ')}
`
}
```

**Example Output:**
```markdown
---
title: "The Future of Web Archival"
url: https://techresearch.com/web-archival-2024
captured: 2024-11-01T14:30:00Z
tags: web-archival, research, technology
---

# The Future of Web Archival

**Source:** https://techresearch.com/web-archival-2024  
**Captured:** November 1, 2024

## Screenshot

![The Future of Web Archival](./screenshots/clip-abc123.png)

## My Notes

Excellent overview of current challenges in web preservation.
Key point: Link rot affecting 30% of citations in academic papers.

## Key Quotes

> "Web content decays at an alarming rate - studies show 30% 
> of links in academic papers become broken within 3 years."

> "Modern archival tools must balance completeness with usability.
> Full-page capture preserves context but requires more storage."

## Metadata

- **Author:** Dr. Jane Smith
- **Published:** October 15, 2024
- **Domain:** techresearch.com
- **Capture ID:** abc123-def456

## Related Captures

- [[Digital Preservation Methods]] - web-archival
- [[Link Rot Statistics]] - research
- [[Academic Citation Tools]] - technology

## Tags

#web-archival #research #technology
```

---

## 🎨 UI/UX Implementation

### Export Button Placement:

**Option 1: Folder-level Export**
```
┌─────────────────────────────────────────┐
│  📁 Thesis Research (47 clips)          │
│  [Edit] [Share] [📤 Export Folder]      │
├─────────────────────────────────────────┤
│  [Grid View] [List View]                │
│  ☑ Select All (47 clips)                │
└─────────────────────────────────────────┘
```

**Option 2: Bulk Actions Bar**
```
┌─────────────────────────────────────────┐
│  📁 Thesis Research                      │
├─────────────────────────────────────────┤
│  ☑ 12 clips selected                    │
│  [🗑️ Delete] [🏷️ Tag] [📤 Export] [✖️]  │
└─────────────────────────────────────────┘
```

**Option 3: Right-click Context Menu**
```
Right-click on clip(s) →
┌─────────────────────────────────┐
│  Open                           │
│  Edit                           │
│  ───────────────────────────    │
│  📤 Export                    ▶  │  → [Format submenu]
│  🏷️  Add Tags                   │
│  📁 Move to Folder              │
│  🗑️  Delete                     │
└─────────────────────────────────┘
```

**Recommendation:** Use **Options 1 + 2 + 3**
- Folder export for "export everything"
- Bulk actions for selected subset
- Right-click for quick access

---

### Export Modal Design:

```
┌──────────────────────────────────────────────┐
│  Export 12 Clips                          [✖] │
├──────────────────────────────────────────────┤
│                                              │
│  📄 Document Formats                         │
│  ┌──────────────────────────────────────┐   │
│  │ ○ Bibliography                       │   │
│  │   APA / MLA / Chicago                │   │
│  │                                      │   │
│  │ ○ Markdown                           │   │
│  │   With backlinks and screenshots     │   │
│  │                                      │   │
│  │ ○ PDF Report                         │   │
│  │   Choose template ▼                  │   │
│  │   ├─ OSINT Investigation             │   │
│  │   ├─ Literature Review               │   │
│  │   └─ General Report                  │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  📊 Data Formats                             │
│  ┌──────────────────────────────────────┐   │
│  │ ○ CSV Spreadsheet                    │   │
│  │ ○ JSON (API format)                  │   │
│  │ ○ BibTeX (LaTeX)                     │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  🔗 Send to...                               │
│  ┌──────────────────────────────────────┐   │
│  │ ○ Notion                             │   │
│  │ ○ Zotero                             │   │
│  │ ○ Obsidian                           │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ⚙️ Options                                  │
│  ☑ Include screenshots                      │
│  ☑ Include my notes                         │
│  ☑ Include captured date                    │
│  ☐ Group by tags                            │
│                                              │
│  [Preview] [Cancel] [Export]                │
└──────────────────────────────────────────────┘
```

---

### Progress Indicator:

```
┌──────────────────────────────────────────────┐
│  Exporting 47 clips...                       │
├──────────────────────────────────────────────┤
│                                              │
│  ████████████████████░░░░░░░░░ 65%          │
│                                              │
│  Processing clip 31 of 47                   │
│  "The Future of Web Archival"               │
│                                              │
│  [Cancel Export]                             │
└──────────────────────────────────────────────┘
```

---

## 📊 Analytics & Validation

### Track These Metrics:

**Usage Metrics:**
```typescript
interface ExportMetrics {
  totalExports: number
  exportsByFormat: {
    [format: string]: number
  }
  averageClipsPerExport: number
  mostPopularFormat: ExportFormat
  timeToFirstExport: number // days after signup
  userRetentionWithExport: number // % vs without
}
```

**Success Criteria (After 1 Month):**
- [ ] 40%+ of active users export at least once
- [ ] Bibliography is #1 most used format
- [ ] Users who export have 2x retention rate
- [ ] NPS increase of +10 points from exporters
- [ ] Feature requests for more formats

**Failure Signals:**
- ⚠️ <10% of users try export
- ⚠️ High abandonment in export modal
- ⚠️ More "cancel" than "complete" exports
- ⚠️ No retention difference vs non-exporters

---

## 🚀 Implementation Roadmap

### **Week 1-2: MVP (Core Formats)**

**Goal:** Ship basic export functionality

**Build:**
- [ ] Selection UI (checkboxes on clips)
- [ ] Export button (folder-level + bulk actions)
- [ ] Export modal (format picker)
- [ ] Basic formats:
  - [ ] Markdown
  - [ ] CSV
  - [ ] Bibliography (APA only)

**Test:**
- [ ] Export 1 clip
- [ ] Export 10 clips
- [ ] Export 100 clips
- [ ] File downloads correctly
- [ ] Format is valid

**Ship:**
- Deploy to production
- Announce to users
- Collect feedback

---

### **Week 3-4: Citations (Academic Focus)**

**Goal:** Make academics love us

**Build:**
- [ ] Metadata extraction improved
- [ ] APA, MLA, Chicago formatters
- [ ] Alphabetical sorting
- [ ] Handle edge cases (no author, no date)
- [ ] Citation preview in modal

**Test:**
- [ ] Validate against citation guides
- [ ] Test with real academic papers
- [ ] Check formatting edge cases

**Ship:**
- Email academic users
- Post in r/GradSchool
- Collect examples

---

### **Week 5-6: Report Templates**

**Goal:** Enable OSINT/research reports

**Build:**
- [ ] PDF generation engine
- [ ] Report templates:
  - [ ] OSINT Investigation
  - [ ] Literature Review
  - [ ] General Report
- [ ] Screenshot embedding
- [ ] Chronological ordering

**Test:**
- [ ] Generate 50-page report
- [ ] Verify PDF quality
- [ ] Check all screenshots load
- [ ] Test printing

**Ship:**
- Email OSINT users
- Share on Twitter
- Add examples to site

---

### **Month 2: Integrations**

**Goal:** Fit into existing workflows

**Build:**
- [ ] Notion OAuth + API
- [ ] "Send to Notion" button
- [ ] Database template creation
- [ ] Bidirectional sync

**Test:**
- [ ] Connect Notion account
- [ ] Send single clip
- [ ] Send folder
- [ ] Verify formatting

**Ship:**
- Blog post about integration
- Video tutorial
- Notion template gallery

---

### **Month 3: Polish & Expansion**

**Goal:** Cover more use cases

**Build:**
- [ ] More formats:
  - [ ] BibTeX
  - [ ] RIS
  - [ ] Word (.docx)
- [ ] Advanced options:
  - [ ] Group by tags
  - [ ] Custom sorting
  - [ ] Template customization
- [ ] Bulk operations improvements

**Test:**
- [ ] User testing sessions
- [ ] Edge case handling
- [ ] Performance with 1000 clips

**Ship:**
- Feature complete
- Documentation
- User guide

---

## 💡 Quick Win: Implement This Week

### **Minimal Viable Export (3-5 days)**

**Scope:**
1. ✅ Checkbox to select clips
2. ✅ "Export Selected" button
3. ✅ Simple modal with 3 options:
   - Markdown
   - CSV
   - Bibliography (APA)
4. ✅ Generate file, trigger download

**Code Structure:**
```typescript
// components/ExportModal.tsx
export function ExportModal({ 
  clips, 
  onClose 
}: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('markdown')
  const [loading, setLoading] = useState(false)
  
  const handleExport = async () => {
    setLoading(true)
    try {
      const file = await exportClips({
        clips,
        format,
        options: {
          includeScreenshots: true,
          includeNotes: true,
        }
      })
      downloadFile(file)
      onClose()
    } catch (error) {
      showError('Export failed')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Modal>
      <h2>Export {clips.length} clips</h2>
      
      <RadioGroup value={format} onChange={setFormat}>
        <Radio value="markdown">Markdown</Radio>
        <Radio value="csv">CSV Spreadsheet</Radio>
        <Radio value="bibliography_apa">Bibliography (APA)</Radio>
      </RadioGroup>
      
      <Button onClick={handleExport} loading={loading}>
        Export
      </Button>
    </Modal>
  )
}
```

**Deliverable:**
- Users can export clips
- Works with 1-100 clips
- 3 useful formats
- Professional output

**Timeline:** Ship by end of week

---

## 🎯 TL;DR - Export Strategy

### **The Problem:**
Researchers waste 2-4 hours manually formatting captures for reports/papers/analysis.

### **The Solution:**
Select clips → Choose format → Export → Done (5 minutes)

### **Build Priority:**

**Week 1-2:** Basic export (Markdown, CSV, APA)  
**Week 3-4:** All citation formats (MLA, Chicago)  
**Week 5-6:** Report templates (PDF)  
**Month 2:** Notion integration  
**Month 3:** Polish + more formats

### **Success = When Users Say:**
"PageStash saves me hours every week on citations and reports."

### **Validation:**
✅ PhD students need bibliography export (VALIDATED)  
✅ OSINT analysts need timeline reports (VALIDATED)  
⚠️ Market researchers need comparison tables (NEEDS AI - v2)  
✅ Content creators need quote compilation (VALIDATED)

### **Quick Win:**
Ship basic export THIS WEEK. Get feedback. Iterate.

---

**Ready to build? Start with the MVP - 3 formats, selection UI, download button.** 🚀

---

*Last Updated: November 21, 2025*  
*Status: Ready for Implementation*

