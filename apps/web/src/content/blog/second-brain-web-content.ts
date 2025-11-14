import { BlogPost } from '@/types/blog'

export const secondBrainWebContent: BlogPost = {
  slug: 'second-brain-web-content-management',
  title: 'Building a Second Brain for Web Content: Beyond Note-Taking Apps',
  description: 'Complete guide to managing web content in your PKM system. Learn how to capture, organize, and connect web sources with your notes and ideas.',
  excerpt: 'Learn how to integrate web content into your PKM system. A comprehensive guide for knowledge workers building their second brain.',
  author: 'PageStash Team',
  publishedAt: '2025-11-14',
  readingTime: 13,
  category: 'guides',
  tags: ['pkm', 'second-brain', 'knowledge-management', 'productivity', 'obsidian'],
  featuredImage: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=600&fit=crop&auto=format',
  featured: true,
  content: `
# Building a Second Brain for Web Content: Beyond Note-Taking Apps

**Your PKM system is perfect for your notes.**

**Obsidian for thinking. Notion for organizing. Roam for linking.**

**But what about the 500 web pages you've saved?** Articles. Documentation. Tutorials. Essays. Research papers. Blog posts.

**They're in browser bookmarks. Dead links. Chaos.**

Your note-taking app wasn't built for web content. This guide shows you how to properly integrate web sources into your second brain—with workflows from knowledge workers who've solved this.

---

## The Web Content Gap in PKM

### Your PKM System (Working Well):

✅ **Personal notes** → Obsidian/Notion/Roam  
✅ **Book highlights** → Readwise → PKM  
✅ **Article excerpts** → Manual copy/paste → PKM  

**These work because you're creating or importing structured text.**

---

### Web Content (Broken):

❌ **Full articles** (not just highlights)  
❌ **Technical documentation** (reference, not reading)  
❌ **Tutorials** (visual + text)  
❌ **GitHub repos** (code + docs)  
❌ **Twitter threads** (before deletion)  
❌ **Blog series** (10+ related posts)  
❌ **Industry reports** (PDFs on web)  
❌ **Tool comparisons** (researching before buying)  
❌ **Examples** (inspiration for your work)

**Browser bookmarks can't do what your PKM does:**
- No full-text search
- No connection to your notes
- No relationship mapping
- No offline access
- Links break

**The result:** Web content lives outside your second brain, disconnected from your thinking.

---

![Second Brain for Web Content](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop&auto=format)
*Integrate web content into your knowledge system, not separate from it*

---

## The Three-Layer PKM Stack

### Layer 1: Thinking (Note-Taking Apps)

**Tools:** Obsidian, Roam, Logseq, Notion

**Purpose:**
- Your thoughts and ideas
- Synthesis and connections
- Evergreen notes
- Personal knowledge graph

**Content type:** Text you write

---

### Layer 2: Reading (Read-It-Later Apps)

**Tools:** Pocket, Instapaper, Readwise Reader

**Purpose:**
- Article queue for reading
- Highlight capture
- Reading experience

**Content type:** Text you'll read once

---

### Layer 3: Reference (Web Archival)

**Tools:** PageStash, Zotero, DEVONthink

**Purpose:**
- Web content you'll reference repeatedly
- Documentation and tutorials
- Examples and inspiration
- Research sources

**Content type:** Pages you'll search/return to

**This is the missing layer most people skip.**

---

## Why Browser Bookmarks Fail Your Second Brain

### The Problems:

**1. Content Disappears**
- Links go dead (404 errors)
- Sites reorganize (URLs change)
- Paywalls added
- Pages deleted

**2. No Search**
- Can't search across bookmarked content
- Can't find that quote you remembered
- Ctrl+F only searches current page

**3. Zero Organization at Scale**
- 500 bookmarks in folders
- Duplicates across folders
- No tags across folder boundaries
- Can't see how 100 bookmarks relate

**4. No Connection to Your Notes**
- Bookmarks live in browser
- Notes live in Obsidian
- Never the twain shall meet

**5. No Offline Access**
- Travel without internet
- Site goes down
- Can't access your references

**The result:** Web content you saved remains invisible to your thinking.

---

![PKM System Integration](https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=1200&h=600&fit=crop&auto=format)
*Connect web sources to your notes and ideas*

---

## The Integrated PKM Workflow

### Phase 1: Capture (Inputs)

**When you encounter valuable web content:**

**Quick decision tree:**

**"Will I read this once and extract highlights?"**  
→ Read-it-later app (Pocket, Readwise)  
→ Highlights go to PKM

**"Will I reference this repeatedly?"**  
→ Web archival tool (PageStash, etc)  
→ Full page archived  
→ Searchable  
→ Connected to notes

**"Should I take notes on this right now?"**  
→ Direct to PKM  
→ Create note  
→ Link to relevant notes  
→ Add source link in note

**Most people skip the middle option.** They either read-it-later OR put everything in notes. Neither works for reference material.

---

### Phase 2: Organization (Structure)

**Three organizing principles for web content:**

**1. By Project/Area (Folders)**

\`\`\`
SecondBrain/
├── ActiveProjects/
│   ├── WebsiteRedesign/
│   ├── BookWriting/
│   └── CourseDevelopment/
├── AreasOfResponsibility/
│   ├── CareerDev/
│   ├── HealthResearch/
│   └── FinancialPlanning/
├── Resources/
│   ├── DesignInspiration/
│   ├── WritingTechniques/
│   └── ToolsDocumentation/
└── Archive/
    └── CompletedProjects/
\`\`\`

**This mirrors PARA method** (Projects, Areas, Resources, Archive)

---

**2. By Content Type (Tags)**

**Tag categories:**

**Source type:**
- tutorial
- documentation
- essay
- research
- example
- tool-comparison
- how-to

**Format:**
- article
- video-transcript
- github-repo
- twitter-thread
- technical-doc
- newsletter

**Status:**
- to-process
- processed
- referenced-in-notes
- key-resource

---

**3. By Concept/Theme (Links)**

**Connect web sources to your notes:**

- Each source links to related Obsidian notes
- Each Obsidian note links back to sources
- Graph view shows web sources → notes → ideas

**Example:**

**Web source:** CSS Grid tutorial  
**Links to notes:**
- \`[[Web Development MOC]]\`
- \`[[CSS Techniques]]\`  
- \`[[Layout Systems]]\`

**Now your CSS notes link to the tutorial.** When you need it, it's one click away.

---

![Web Content Organization](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=600&fit=crop&auto=format)
*Organize by project, tag by type, link to concepts*

---

## Advanced Technique: Knowledge Graph for Web Sources

### The Limitation of Folders:

**You've saved 300 web sources across 20 folders.**

**You know:**
- What's in each folder
- How many sources per topic

**You DON'T know:**
- How do these 20 design inspiration sources relate?
- Which 5 sources are most central to your learning?
- What patterns exist you haven't noticed?
- How do web sources cluster by theme?

**Folders and tags are one-dimensional views.**

---

### The Graph View Advantage:

**Visual representation of your web sources:**

**Nodes:** Individual web pages you've saved  
**Edges:** Relationships between them  
**Clusters:** Natural groupings by theme

**Auto-detected relationships:**
- Same domain (all CSS Tricks articles)
- Same author (Paul Graham essays)
- Topic similarity (all discuss async programming)
- Capture proximity (saved around same time)

**What this reveals:**

1. **Central sources** - Highly connected nodes = foundational resources you reference most
2. **Isolated sources** - Nodes with few connections = might be noise
3. **Topic clusters** - Natural groupings reveal your actual interests
4. **Unexpected connections** - Sources that relate in ways folders can't show

**Real example:** Knowledge worker with 250 saved articles. Graph revealed 30 articles about "systems thinking" that were scattered across 5 different project folders. Seeing them together, he realized systems thinking was a meta-skill underlying all his projects → became a core note in his PKM.

**You can't see this in folders.**

---

![Knowledge Graph PKM](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&auto=format)
*See how 300 web sources connect - patterns emerge that folders hide*

---

## Integration with Obsidian (Detailed Workflow)

### The Challenge:

**Obsidian is text-based (markdown).** Web content is HTML. How do you connect them?

**Three integration strategies:**

---

### Strategy 1: Link from Obsidian to Web Archive

**In your Obsidian note:**

\`\`\`markdown
# CSS Grid Layouts

## Key Concepts
- Grid template areas
- Fr units
- Auto-placement

## Sources
- [CSS Grid Complete Guide](pagestash://link/12345)
- [Grid by Example](pagestash://link/67890)
- [MDN Grid Documentation](pagestash://link/11223)

## My Notes
The fr unit is particularly useful for...
\`\`\`

**Your notes reference the full sources.** One click brings up the complete archived page.

---

### Strategy 2: Export Snippets to Obsidian

**When processing web content:**

1. Read/skim the archived page
2. Extract key quotes/concepts
3. Create Obsidian note with snippets
4. Link back to full source

**Example Obsidian note:**

\`\`\`markdown
# Progressive Enhancement Pattern
Source: [[Web Archive - Smashing Magazine Article]]

> "Start with basic HTML that works everywhere, 
> then enhance with CSS and JS for capable browsers"

This connects to [[Accessibility]] and [[Performance]]

My application: Use this for [[Project - Website Redesign]]
\`\`\`

**Best of both worlds:** Snippets in Obsidian (searchable, linkable), full source one click away.

---

### Strategy 3: Markdown Export from Web Archive

**For sources you'll reference heavily:**

1. Export web page as Markdown
2. Import to Obsidian
3. Add your notes/links
4. Keep web archive for visual reference

**When to use:**
- Tutorials you'll follow step-by-step
- Documentation you'll reference constantly
- Articles you'll quote extensively

**When NOT to use:**
- Everything (too manual)
- Visual content (loses formatting)

---

![Obsidian Integration](https://images.unsplash.com/photo-1565843248736-8c41f6e0f1e2?w=1200&h=600&fit=crop&auto=format)
*Bidirectional links between Obsidian notes and web archives*

---

## The Weekly Review Process

### Processing Web Content (30-60 min/week)

**Step 1: Inbox Zero (10 min)**

**Review everything captured this week:**
- Quick scan of each source
- Keep (relevant to projects/areas)
- Archive (interesting but not actionable)
- Delete (no longer relevant)

**Tag status:** \`to-process\` → \`processed\`

---

**Step 2: Deep Processing (20-30 min)**

**For sources tagged "to-process":**

1. **Read/skim** the full content
2. **Extract value:**
   - Create Obsidian note with key points
   - Add tags reflecting actual content (not assumed)
   - Link to related notes/concepts
3. **Update metadata:**
   - Add project/area
   - Tag content type
   - Status → \`processed\`

---

**Step 3: Connection Building (10-15 min)**

**Review this week's processed sources:**
- Which ones relate to each other?
- How do they connect to existing notes?
- Any patterns emerging?

**Use graph view** (if available):
- Look for new clusters
- Identify central sources
- Notice disconnected islands

**Update links** in Obsidian based on insights.

---

**Step 4: Prune & Archive (5 min)**

**Quick audit:**
- Sources you haven't accessed in 6+ months
- No longer relevant to active projects
- Move to Archive folder

**Keep system lean.** Your second brain should be active resources, not graveyard of old bookmarks.

---

## Use Case Workflows

### Use Case 1: Learning New Skill (JavaScript)

**Capture strategy:**

**Types of sources:**
- Official documentation (MDN)
- Tutorials (step-by-step guides)
- Example code (GitHub gists, CodePen)
- Concept explanations (blog posts)
- Best practices (industry standards)

**Organization:**

**Folder:** \`Learning/JavaScript\`

**Tags:**
- \`tutorial\`, \`documentation\`, \`example\`, \`concept\`
- \`beginner\`, \`intermediate\`, \`advanced\`
- \`async\`, \`dom\`, \`functions\`, etc (by topic)

**Integration with Obsidian:**

**Main MOC (Map of Content):**

\`\`\`markdown
# JavaScript Learning Path

## Fundamentals
- [[JS - Variables and Scope]]
- [[JS - Functions Deep Dive]]
- [[JS - Async Programming]]

## Each note links to archived tutorials/docs

## Resources by Level
Beginner: [link to PageStash folder]
Intermediate: [link to PageStash folder]
Advanced: [link to PageStash folder]
\`\`\`

**Workflow:**
1. Capture tutorials/docs as you find them
2. Work through tutorials (archived pages)
3. Create Obsidian notes on concepts
4. Link notes ↔ sources bidirectionally

---

### Use Case 2: Research Before Building

**Scenario:** Building new product feature

**Capture strategy:**

**Types of sources:**
- Competitor analysis (how others solve this)
- Design patterns (UI/UX examples)
- Technical approaches (implementation options)
- User research (what users want)

**Organization:**

**Folder:** \`Projects/Feature-X-Research\`

**Tags:**
- \`competitor\`, \`design\`, \`technical\`, \`user-research\`
- \`inspiration\`, \`how-to\`, \`case-study\`

**Weekly review:**
- Look for patterns across competitors
- Identify best practices
- Document technical tradeoffs
- Build decision matrix in Obsidian

**Decision note:**

\`\`\`markdown
# Feature X: Implementation Decision

## Options Researched
1. Approach A - [Source 1], [Source 2], [Source 3]
2. Approach B - [Source 4], [Source 5]
3. Approach C - [Source 6]

## Analysis
[Your thinking, referencing sources]

## Decision: Approach B
Reasoning: ...

## Implementation
Links to relevant technical docs archived
\`\`\`

**All sources are one click away in your decision documentation.**

---

### Use Case 3: Writing/Creating Content

**Scenario:** Writing an article/course/book

**Capture strategy:**

**Types of sources:**
- Research/evidence (credible sources to cite)
- Inspiration (examples of excellent writing)
- Counter-arguments (what others say)
- Data/statistics (to support claims)

**Organization:**

**Folder:** \`Projects/Article-Title/Research\`

**Tags:**
- \`cite\`, \`inspiration\`, \`data\`, \`counter-argument\`
- \`intro\`, \`section-1\`, \`section-2\`, etc (by section)

**Writing workflow:**

1. **Research phase:** Capture everything relevant
2. **Outline phase:** Create Obsidian outline with source links
3. **Writing phase:** Write in Obsidian, pull quotes from sources
4. **Citation phase:** Export source metadata for bibliography

**Example outline:**

\`\`\`markdown
# Article Outline

## Introduction
Claim: [Your claim]
Evidence: [Link to Source A], [Link to Source B]

## Section 1
Key point: ...
Supporting sources: [Links to 3 archived sources]

## Section 2
...
\`\`\`

**As you write, sources are right there.** No hunting through bookmarks.

---

![Content Creation Workflow](https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1200&h=600&fit=crop&auto=format)
*Research and sources integrated into your writing workflow*

---

## Tool Recommendations by PKM System

### For Obsidian Users:

**Primary:** PageStash (web archival + graph view)  
**Why:** Graph view matches Obsidian's philosophy, export to Markdown

**Integration:**
- Link from Obsidian notes to PageStash sources
- Export PageStash metadata as Markdown
- Use PageStash graph to inform Obsidian connections

---

### For Notion Users:

**Primary:** PageStash or Notion Web Clipper  
**Why:** Full-page capture, searchable database

**Integration:**
- Embed PageStash links in Notion databases
- Or use Notion's built-in web clipper for lighter needs
- PageStash if you need graph view + advanced search

---

### For Roam Users:

**Primary:** PageStash (web archival)  
**Why:** Roam handles notes, PageStash handles web content

**Integration:**
- Block references to web sources
- Bidirectional links between Roam pages and archived sources

---

### For Logseq Users:

**Primary:** PageStash  
**Why:** Similar to Roam integration

**Integration:**
- Daily notes reference web sources
- Namespace organization mirrors folders

---

### For Apple Notes / Bear / Craft Users:

**Primary:** PageStash (these apps have basic clipping only)  
**Why:** Need robust web archival since note apps are basic

**Integration:**
- Simple: Note with link to PageStash source
- Advanced: Export snippets to notes

---

## Advanced PKM Techniques

### Technique 1: Evergreen Notes from Web Sources

**The concept:** Distill web sources into timeless, atomic notes in your PKM

**Workflow:**

1. **Capture** web source (tutorial, article, research)
2. **Extract** core concepts (1-3 per source)
3. **Create** evergreen note per concept
4. **Link** evergreen note to source
5. **Connect** evergreen note to other notes

**Example:**

**Web source:** Long article on habits  
**Extracted concepts:**
- Implementation intentions
- Habit stacking  
- Environment design

**Evergreen notes created:**
- \`[[Implementation Intentions]]\`
- \`[[Habit Stacking]]\`
- \`[[Environment Design for Habits]]\`

**Each note:**
- Explains concept in your words
- Links to web source for details
- Connects to other relevant notes
- Is reusable across projects

**Now the web source → permanent knowledge.**

---

### Technique 2: Hub Notes with Curated Sources

**The concept:** Create MOC (Map of Content) notes that curate your best web sources on a topic

**Example hub note:**

\`\`\`markdown
# Async Programming MOC

## Core Concepts
- [[Promises]]
- [[Async-Await]]
- [[Error Handling in Async]]

## Best Learning Resources (Curated)
- [MDN Async Guide](link) - Official documentation
- [JavaScript.info Promises](link) - Visual explanations
- [Async Patterns](link) - Advanced patterns
- [Common Pitfalls](link) - What to avoid

## My Code Examples
- [[Project A - Async Implementation]]
- [[Pattern - Parallel Promises]]

## Questions to Explore
- How to handle race conditions?
- When to use async vs observables?
\`\`\`

**This hub note:**
- Organizes web sources thematically
- Connects to your notes
- Evolves as you learn
- Becomes your custom "textbook"

---

### Technique 3: Source Chaining

**The concept:** Link related web sources to show evolution of your thinking

**Example:**

**Source 1:** Introduction to concept (2020)  
→ Links to **Source 2:** Deeper dive (2022)  
→ Links to **Source 3:** Advanced application (2024)  
→ Links to **Your note:** Your implementation

**This creates learning trails.** When you revisit a topic, you see how your understanding evolved.

---

![PKM Graph View](https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=1200&h=600&fit=crop&auto=format)
*Your second brain should show how ideas connect across sources and notes*

---

## Common PKM Mistakes with Web Content

### Mistake 1: Treating Web Content Like Notes

**Why it fails:**
- Web content is external knowledge
- Notes are your processed thinking
- Mixing them dilutes your notes

**Fix:**
- Separate system for web archival
- Notes reference sources, don't replace them

---

### Mistake 2: Saving Everything

**Why it fails:**
- 1,000 unprocessed bookmarks
- Noise drowns signal
- Never find anything

**Fix:**
- Capture freely, process weekly
- Archive or delete if not actionable
- Keep system lean

---

### Mistake 3: No Connection to Notes

**Why it fails:**
- Sources and notes live in silos
- Can't leverage web content in your thinking
- Defeats purpose of second brain

**Fix:**
- Bidirectional links (notes ↔ sources)
- Process sources into notes
- Use graph to see connections

---

### Mistake 4: Copy/Paste Instead of Archive

**Why it fails:**
- Loses context (what site? when?)
- Loses formatting
- Can't return to original

**Fix:**
- Archive full page
- Extract to notes if needed
- Keep source link in note

---

### Mistake 5: No Review Process

**Why it fails:**
- Capture but never process
- Sources remain invisible
- Wasted effort capturing

**Fix:**
- Weekly review (30-60 min)
- Process into notes
- Prune and archive

---

## The 30-Day Implementation

### Week 1: System Setup (3-4 hours)

**Day 1-2: Choose web archival tool** (1-2 hours)
- Try PageStash free tier
- Test capturing workflow
- Integrate with your PKM

**Day 3-4: Migrate bookmarks** (1-2 hours)
- Export browser bookmarks
- Capture top 20-30 in archival tool
- Organize by project/area

**Day 5-7: Practice workflow** (30 min/day)
- Capture 5-10 sources daily
- Tag and organize
- Link to 2-3 existing notes

---

### Week 2-3: Active Use (Daily practice)

**Daily (10-15 min):**
- Capture web sources as you browse
- Quick organize (folder + tags)
- Link to relevant notes if obvious

**Weekly review (60 min):**
- Process new sources
- Create notes from key sources
- Update graph/connections

---

### Week 4: Advanced Integration (4-6 hours)

**Graph analysis** (2 hours)
- Review all captured sources in graph
- Identify clusters and patterns
- Create hub notes for major themes

**Deep linking** (2 hours)
- Review major notes in PKM
- Add links to relevant sources
- Create bidirectional references

**System refinement** (1-2 hours)
- Adjust folder structure based on usage
- Refine tag system
- Archive what's not working

---

## Tool Comparison for PKM Integration

| Tool | Best For | Graph View | Obsidian Integration | Cost |
|------|----------|------------|---------------------|------|
| **PageStash** | Modern PKM | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐☆ | \$12/mo |
| **DEVONthink** | Apple ecosystem | ⭐⭐⭐☆☆ | ⭐⭐☆☆☆ | \$99-199 |
| **Zotero** | Academic focus | ⭐☆☆☆☆ | ⭐⭐⭐☆☆ | Free |
| **Raindrop** | Visual bookmarks | ⭐⭐☆☆☆ | ⭐☆☆☆☆ | Free/\$3/mo |
| **Browser Bookmarks** | Basic needs | ☆☆☆☆☆ | ☆☆☆☆☆ | Free |

**For most PKM users:** PageStash + your note-taking app = complete system

---

## Real Knowledge Worker Workflows

### Case Study 1: Software Developer

**PKM Stack:**
- Obsidian (notes, code snippets)
- PageStash (documentation, tutorials)

**Organization:**
- Folders by language/framework
- Tags by concept (async, testing, architecture, etc)
- Links from project notes to relevant docs

**Workflow:**
- Captures docs/tutorials while researching
- Creates Obsidian notes when implementing
- Links implementation notes to source docs
- Graph shows which technologies connect

**Impact:** "I can find any tutorial I've ever used in 5 seconds. Game changer."

---

### Case Study 2: Writer/Creator

**PKM Stack:**
- Notion (content calendar, drafts)
- PageStash (research, inspiration)

**Organization:**
- Folders by content project
- Tags by theme and content type
- Notion databases link to source pages

**Workflow:**
- Research phase: Capture 50-100 sources
- Outline phase: Link sources to sections
- Writing phase: Pull quotes/data from sources
- Full-text search to find specific claims

**Impact:** "Cut research time in half. Sources are organized by article outline automatically."

---

### Case Study 3: Product Manager

**PKM Stack:**
- Obsidian (strategy, decisions)
- PageStash (competitor research, user feedback)

**Organization:**
- Folders by feature/initiative
- Tags by source type and theme
- Decision notes link to all research

**Workflow:**
- Continuous capture of competitor pages, feedback
- Weekly review to spot patterns
- Graph view reveals market trends
- Decision notes show research that informed choices

**Impact:** "Graph view showed me 20 competitors were solving the same problem similarly. That pattern informed our differentiation strategy."

---

## The Integration Payoff

**What happens when web content is properly integrated in your PKM:**

✅ **Research is traceable** - Every note cites sources, one click away

✅ **Patterns emerge** - Graph view reveals connections invisible in folders

✅ **Writing is faster** - Sources organized by outline, quotes searchable

✅ **Learning compounds** - Old sources inform new notes, ideas build on ideas

✅ **Nothing is lost** - Pages archived, searchable, linked

✅ **Your thinking is grounded** - External knowledge → processed notes → original ideas

**This is what a true second brain looks like.** Not just your thoughts. Your thoughts + the best external knowledge you've found, fully integrated.

---

## FAQ for PKM Enthusiasts

**Q: Why can't I just put everything in Obsidian?**

A: You can copy snippets, but not full pages. Full archival tool preserves complete content, lets you search across sources, and shows connections between sources (not just notes).

**Q: Isn't this just more tools to manage?**

A: Two tools (note-taking + web archival) is simpler than trying to force one tool to do both badly. Obsidian for notes, PageStash for sources = clean separation.

**Q: How is this different from Readwise?**

A: Readwise captures highlights (text you select). This captures full pages (reference material). Different use cases. Use both if you want.

**Q: Can I export everything if I change tools later?**

A: PageStash exports to Markdown and JSON. Your sources are portable. Obsidian is already text files. No lock-in.

**Q: Do I need the graph view?**

A: No, but it reveals patterns you miss with folders alone. Worth it for 100+ sources. Less critical for < 50 sources.

**Q: What about mobile access?**

A: PageStash web app works on mobile. Obsidian has mobile apps. Full workflow available anywhere.

---

## What Patterns Are Hiding in Your Sources?

**You've saved 300 articles, tutorials, and resources.**

**In browser folders, you see:** What's in each folder.

**In a knowledge graph, you see:**
- The 10 sources you reference most often (make those easier to access)
- The 5 concepts that appear everywhere (maybe they're more important than you thought)
- The connections between design, development, and marketing sources (cross-disciplinary insights)
- The sources you saved but never used (prune them)

**Your sources tell a story about what you're learning and building.**

**But folders can't show you that story. Graphs can.**

[Build your second brain for web content →](/auth/signup)

*Free tier: 10 pages. No card. See what patterns emerge.*

---

*Last updated: November 2025*
`
}

