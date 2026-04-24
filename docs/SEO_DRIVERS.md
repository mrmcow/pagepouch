# PageStash — SEO & Content Drivers

> **Immediate fuel for writing new SEO and GEO-optimized articles.** Keyword clusters, search-intent map, content pillars, the article backlog, distribution playbooks, and the technical SEO worklist.
>
> For product roadmap, see [`PRD.md`](./PRD.md). For shipping status, see [`BLUEPRINT.md`](./BLUEPRINT.md). For the live published blog inventory, see `apps/web/src/content/blog/posts.ts`.

---

## 0. How to use this document

This is the **working backlog** for organic acquisition. It exists so a writer (or you, on a Sunday with two hours and a coffee) can pick a row, understand the angle, see what already exists, and ship.

**Workflow:**
1. Pick from §6 (Top 20 articles to write next), or filter §7 (full backlog) by cluster.
2. Cross-check §8 (already-published inventory) so you don't duplicate.
3. Use §9 (on-page SEO patterns) and §10 (FAQ snippet sources) as the writing template.
4. Push to publish, then loop §12 (distribution playbook) for the launch week.
5. Add net-new ideas straight to §7 — no decision-log entry needed.

---

## 1. Strategic positioning for content

Three positioning hooks anchor every piece. Pick at least one per article.

### Hook 1 — Web → Markdown (the wedge)

The Markdown / Obsidian / PKM-curious population is the fastest-growing acquisition surface and our content advantage. Reviews of competitor extensions show real install intent driven by *"someone influential talked about Markdown research"*. We answer the literal question they Google: *"what clipper do I use?"* — without forcing them to be Obsidian experts first.

**Recurring frame:** *"Capture in the browser. Think in the notes app. Export `.md` between them."*

**Source:** `docs/assessments/obsidian-web-clipper-reviews-seo-assessment.md`

### Hook 2 — Retrieval over capture (the moat)

Every competitor article will frame the problem as "I want to save the web". We reframe to "I want to **find** what I saved last month". This naturally surfaces our search, knowledge graph, and full-fidelity capture pillars — none of which our cheap-bookmark competitors have.

### Hook 3 — Evidence bundle (for verticals that pay)

For OSINT, threat intel, journalism, legal/compliance, and academic citation audiences: every clip is a defensible **evidence bundle** — full-page screenshot + extracted text + raw HTML + URL + timestamp. This is the same product narrative Hunchly charges $130/mo for.

---

## 2. Keyword clusters

Eight clusters. Each is a recurring pillar with primary terms, long-tail variants, intent type, and priority. P0 = work on now; P1 = work on this quarter; P2 = opportunistic.

### Cluster A — Markdown export & Obsidian-compatible workflows  *(P0, our strategic wedge)*

**Primary keywords:**
- `web clipper markdown`
- `save webpage as markdown`
- `export webpage markdown`
- `obsidian web clipper alternative`
- `markdown research workflow`
- `clip articles to markdown`

**Long-tail / variants:**
- `export chatgpt to markdown`
- `save chatgpt conversation as markdown`
- `clip web page to obsidian`
- `web research vault markdown`
- `pkm web capture markdown`
- `markdown first research stack`

**Intent:** informational + commercial-investigation. People are picking a tool.

---

### Cluster B — Web clipping head terms  *(P0, biggest funnel)*

**Primary:**
- `web clipping`
- `web clipping tool`
- `web clipper extension`
- `best web clippers 2026`
- `save web pages permanently`
- `archive webpage tool`
- `full page screenshot tool`
- `browser snapshot tool`

**Long-tail:**
- `best page clipper for research`
- `save webpage permanently offline`
- `how to save web pages for research`
- `web clipper for students`
- `chrome web clipper extension`
- `firefox web clipper extension`

**Intent:** informational at top, commercial deeper.

---

### Cluster C — Read-it-later & bookmark replacement  *(P0, displacement traffic)*

**Primary:**
- `pocket alternative`
- `instapaper alternative`
- `evernote web clipper alternative`
- `notion web clipper alternative`
- `raindrop alternative`

**Long-tail:**
- `pocket shutting down alternative`
- `read later vs permanent archive`
- `migrate pocket to pagestash`
- `bookmark manager that searches inside pages`
- `bookmarks vs web clipper`

**Intent:** commercial-investigation. They've already churned or are about to.

---

### Cluster D — Research / academic workflow  *(P0, high-ICP-fit)*

**Primary:**
- `research organization software`
- `organize online research`
- `web research tool`
- `academic research organization`
- `literature review tool`

**Long-tail:**
- `how to organize research articles`
- `research workflow tools for academics`
- `phd research organization tool`
- `gray literature management`
- `university research checklist`
- `journalist source management`

**Intent:** informational, very high LTV when converted.

---

### Cluster E — PKM / second brain / graphs  *(P1, content-pillar potential)*

**Primary:**
- `personal knowledge management`
- `second brain`
- `zettelkasten`
- `building a second brain`
- `knowledge graph`

**Long-tail:**
- `second brain for web content`
- `zettelkasten for web research`
- `para method for web content`
- `knowledge graph for research`
- `notion obsidian pagestash stack`

**Intent:** informational, top-of-funnel education.

---

### Cluster F — OSINT / threat intel / evidence  *(P1, niche but high-value)*

**Primary:**
- `osint web archival tools`
- `threat intelligence tools`
- `web evidence preservation`
- `chain of custody web evidence`
- `corporate investigation tools`

**Long-tail:**
- `hunchly alternative`
- `soc analyst workflow web capture`
- `legal admissibility of web evidence`
- `dark web osint tools`
- `tor osint capture`
- `threat actor tracking web pages`

**Intent:** commercial. Niche but enterprise-budget.

---

### Cluster G — Productivity / tabs / overload  *(P1, top-of-funnel viral)*

**Primary:**
- `information overload`
- `tab hoarding`
- `too many open tabs`

**Long-tail:**
- `how to stop hoarding tabs`
- `gtd for web content`
- `from 50 tabs to zero`
- `5-minute research capture`
- `digital decluttering web`

**Intent:** informational, viral / shareable.

---

### Cluster H — AI / answer engines / GEO  *(P1, growing fast — see §11)*

**Primary:**
- `save chatgpt conversations`
- `archive ai chat`
- `chatgpt research workflow`
- `perplexity citations`
- `ai search source archive`

**Long-tail:**
- `save claude conversations`
- `chatgpt to obsidian`
- `rag ready web research`
- `llm ingest web pages`
- `json export for llm`

**Intent:** informational + technical. New surface; less competitive.

---

## 3. Content pillars (hub-and-spoke)

Six pillars. Each is a hub page surrounded by 5–15 spoke articles. Hubs are tier-A SEO real estate. Internal-link from every spoke back to its hub and to the homepage Portability section.

| # | Pillar | Hub URL pattern | Status | Source clusters |
|---|---|---|---|---|
| 1 | **Web clipping & permanent capture** | `/learn/web-clipping` | partly published; needs explicit hub page | B + D |
| 2 | **Markdown research stacks (with or without Obsidian)** | `/learn/markdown-workflows` *or* `/learn/obsidian` | new; **build first** | A + E + H |
| 3 | **Research organisation for journalists, academics, analysts** | `/learn/research-workflows` | partly published; needs hub | D + G |
| 4 | **Knowledge graph for connected research** | `/learn/knowledge-graphs` | needs hub + product centerpiece | E + Pillar-3 product |
| 5 | **OSINT / threat intel / web evidence** | `/learn/osint` *or* `/learn/web-evidence` | partly published (long-form posts exist); needs hub | F |
| 6 | **AI archive: ChatGPT / Claude / Perplexity research** | `/learn/ai-research` | new; large GEO opportunity | H |

---

## 4. Differentiation phrases (use in titles, H1s, meta descriptions, opening paragraphs)

These are vocabulary patterns drawn straight from competitor reviews and high-converting hooks.

- **"Tab hell"** → PageStash as *capture, then close the tab.*
- **"Readable Markdown"** with honesty about hard sites
- **"Bulk export"** / **"one-click download"** (Pro signal)
- **"Evidence bundle"** (URL + time + screenshot + text + HTML) for OSINT / legal / academic
- **"Capture in the browser, think in the notes app"** (Markdown wedge frame)
- **"Save it once. Find it forever."** (north star)
- **"Read-it-later vs permanent archive"** (displacement frame)
- **"From clipping to insight"** (Knowledge Graph frame)
- **"You don't own what you can't export"** (data ownership / portability)

---

## 5. Top 20 articles to write next  *(ROI-ordered)*

Mix of evergreen pillars, comparison/competitor pieces, and Markdown / Obsidian / GEO pieces. **Pick from the top** when you sit down to write.

| # | Working title | Cluster | Pillar | Type | Why this one |
|---|---|---|---|---|---|
| 1 | **Best Web Clipping Tools 2026 — annual update** | B | 1 | Listicle / refresh | Highest-volume head term; refresh existing mega-post yearly to retain rank |
| 2 | **PageStash vs Obsidian Web Clipper: Complementary Workflows** | A | 2 | vs / comparison | Direct trust play; lifts the Markdown wedge; tasteful "use both" framing |
| 3 | **Web Clipper to Markdown: when MD works and when to use screenshot + HTML** | A | 2 | How-to + honest limits | Owns the `web clipper markdown` term while addressing competitor pain (HTML→MD fidelity) |
| 4 | **How to Save ChatGPT / Claude Threads for Research (Markdown export, math, limits)** | H + A | 6 | How-to + technical | GEO-relevant + Markdown-relevant; growing search volume; surfaces honest LaTeX caveat |
| 5 | **Read-It-Later vs Permanent Archive: Why "saved" isn't "owned" until you can export `.md`** | C + A | 3 | Manifesto / displacement | Pocket / Instapaper churn traffic; ownership frame |
| 6 | **How to Save Web Pages Permanently — definitive guide + tool matrix** | B | 1 | Pillar | Defines the category; high search intent; tool-comparison surface |
| 7 | **Mendeley/Zotero for PDFs, PageStash for Web — one workflow** | D + F | 3 | How-to + integration | Resolves "are you replacing Zotero?" objection cleanly; academic-credible |
| 8 | **OSINT Web Archiving: PageStash vs Hunchly** | F | 5 | vs / comparison | High-intent niche; Hunchly's $130/mo is the price anchor we want |
| 9 | **Build a "Research Session": clip many tabs, organise, bulk export** | G + A | 1 + 2 | How-to (Pro) | Showcases bulk export and tab-hell language; converts free → Pro |
| 10 | **Citations and Web Archives for Papers: link rot and evidence trails** | D + F | 3 | Evergreen academic | Resolves "do you do citations?" + link-rot frame; cites APA/MLA/Chicago |
| 11 | **Best Chrome / Firefox Extensions for Researchers** | B + D | 1 + 3 | Listicle | Broad search + naturally lists PageStash; Firefox-vs-Chrome long-tail bonus |
| 12 | **Competitive Intelligence: capture competitor pages before they change** | F + D | 5 | Use-case | Founders + analysts + agencies; link-rot moat in concrete language |
| 13 | **Zettelkasten for Web Research** | E + A | 4 | Pillar | Stable PKM search volume; pairs well with Markdown wedge |
| 14 | **Second Brain for Web: Notion, Obsidian, and a Web Layer** | E + A | 4 | Pillar | "PageStash is the web layer" message; PKM stack frame |
| 15 | **JSON and CSV Exports for Research Pipelines and LLM/RAG** | H + A | 6 | Technical | GEO + developer surface; differentiates from bookmark competitors |
| 16 | **When Markdown Clipping Fails (SPAs, paywalls, social) — and what to use instead** | A + B | 2 | Honest / troubleshooting | Wins trust with skeptics; converts via the evidence-bundle frame |
| 17 | **Lawyers / Compliance: Web Evidence 101** | F | 5 | Top-of-funnel vertical | Shorter feeder for the long-form legal post that already exists |
| 18 | **Grad School Literature Review: Web + Gray Literature** | D | 3 | How-to vertical | PhD intent; exists tangentially but not dedicated |
| 19 | **PageStash vs Raindrop vs Pocket — the three-way picker** | C + B | 1 | vs / comparison | Captures bookmarker-shoppers in one piece |
| 20 | **Markdown Research Stacks (Karpathy-adjacent, ethical framing)** | A + E | 2 | Pillar | The audience exists; tasteful framing wins discovery without name-bait risk |

---

## 6. Article backlog (full)

Ideas pulled from every SEO source doc. **Cross-check `apps/web/src/content/blog/posts.ts`** before writing — many slugs already exist.

### Evergreen guides — capture, archiving, organisation (Cluster B + D)

- What is web clipping? *(definition page, snippet target)*
- 5 research organisation methods that actually work
- Digital filing cabinet — how to organise saved web content
- Why bookmarks fail at 1,000+ pages
- From chaos to clarity: organising 1,000+ saved pages
- How to save web pages for research
- How to organise research articles
- How to archive web content permanently
- Build a digital research library
- Tag and categorise web content effectively
- 10 research organisation mistakes (and how to avoid them)
- 80/20 rule for research content
- Browser extension vs web app — when to use which
- Keyboard shortcuts for power researchers
- Mobile research workflows

### Comparisons / "alternative" / "vs" (Cluster B + C)

- PageStash vs Pocket
- PageStash vs Instapaper
- PageStash vs Evernote
- PageStash vs Notion
- PageStash vs OneNote
- PageStash vs Raindrop
- PageStash vs Memex
- PageStash vs Obsidian Web Clipper *(top-20)*
- PageStash vs Hunchly *(top-20)*
- PageStash vs Wallabag
- PageStash vs Diigo / Hypothesis
- PageStash vs Readwise Reader
- PageStash vs Roam Research
- PageStash vs Zotero (when to use both, not "vs")
- PageStash vs Mendeley (same)
- Best web clipping tools 2026 *(top-20)*
- Best Pocket alternatives for research
- Web clippers comparison matrix
- Free vs paid web capture
- Migrate from Pocket to PageStash
- Migrate from Evernote to PageStash
- Import bookmarks to PageStash

### Markdown / Obsidian / AI archive (Cluster A + H — strategic priority)

- Web clipper to Markdown — when MD works and when not *(top-20)*
- Save ChatGPT / Claude threads for research *(top-20)*
- Read-it-later vs permanent archive *(top-20)*
- arXiv → notes — citations, PDFs, web captures *(top-20)*
- Markdown research stacks (Karpathy-adjacent ethical framing) *(top-20)*
- Bulk research sessions — clip 20 tabs without tab hell *(top-20)*
- When Markdown clipping fails *(top-20)*
- Where highlights live in PageStash vs browser-only clippers
- JSON + CSV export for research pipelines and LLM ingest *(top-20)*
- Old Reddit / new Reddit clipping — what breaks and how PageStash handles it
- Firefox vs Chrome web clipper — feature parity checklist
- Offline reading vs cloud archive — honest positioning
- "Use with Obsidian" hub page
- Notion + Obsidian + PageStash — the stack
- Markdown front-matter for clipped articles — what we emit

### Research workflows / academic / journalism (Cluster D)

- Journalist's guide to managing web sources
- Academic researchers + literature reviews
- Market research for analysts
- Content creator research workflow
- UX researcher competitive analysis
- Legal research workflow
- Investment research workflow
- Building a competitive intelligence system
- Literature review workflow end-to-end
- Content pipeline (idea → publish)
- Due diligence research with web captures
- Trend analysis from saved content
- Collaborative research with web captures
- Team knowledge base setup
- Research handoffs — how to brief a colleague

### PKM / second brain (Cluster E)

- PKM getting started — for the web-curious
- GTD for web content
- Zettelkasten for web research *(top-20)*
- Second Brain: Web Edition *(top-20)*
- PARA method for web content
- Knowledge graphs — connecting your research
- Page graphs — what we connect and why
- Advanced tagging strategies
- Cross-referencing web content

### Productivity / tabs / overload (Cluster G)

- Stop tab hoarding
- 5-minute research capture habit
- Batch processing web research
- Reducing context switching with capture-then-close
- 50 open tabs to zero — a workflow
- Information overload productivity system

### OSINT / threat intel / web evidence (Cluster F)

- Threat intelligence SOC workflow with web clipping *(published — refresh)*
- Web evidence preservation legal standards *(published — refresh)*
- OSINT web archival tools *(published — refresh)*
- Hunchly alternative for OSINT *(top-20)*
- Dark web / Tor capture
- Chain of custody for web evidence
- Lawyers / compliance: web evidence 101 *(top-20)*
- Corporate investigator's tool stack
- OSINT data pipeline — PageStash to Maltego *(published)*

### AI / answer engines / GEO (Cluster H — see §11)

- Save ChatGPT / Claude threads for research *(top-20, dual-cluster)*
- AI search source footprint *(published — refresh & expand)*
- Web research workflow diagram for AI/SEO *(published)*
- How AI cites archived sources (GSC)
- OSINT research agent workflow with PageStash + AI *(published)*
- RAG-ready exports — JSON + Markdown patterns
- Save Perplexity answers as Markdown
- Save Bing AI / Copilot conversations

---

## 7. Already-published blog inventory

**Source of truth:** `apps/web/src/content/blog/posts.ts` (~150 entries).

This file imports each post from a `.ts` module under `apps/web/src/content/blog/`. Each module exports `slug`, `title`, `description`, `excerpt`, `category`, `tags`, `featured`, and the full markdown content.

**Always check `posts.ts` before writing** — many of the working titles in §6 already have a slug. If a post exists, your job is **refresh / expand / update the year**, not duplicate.

### Notable already-shipped slugs to know about

- `threat-intelligence-soc-workflow-web-clipping`
- `best-page-clippers-2025-browser-extensions-compared`
- `web-evidence-preservation-legal-standards-corporate-investigators`
- `osint-web-archival-tools-investigators`
- `literature-review-web-sources-management`
- `second-brain-web-content-management`
- `information-overload-productivity-system`
- `content-research-workflow-creators`
- `how-to-save-web-pages-for-research`
- `what-is-web-clipping`
- `pagestash-vs-pocket`
- `pagestash-vs-obsidian-web-clipper`
- `obsidian-web-clipping-workflow`
- `zettelkasten-web-research-capture`
- `gsc-notion-obsidian-pagestash-stack`
- `pkm-getting-started`
- `pkm-lightweight-web-layer`
- `stop-tab-hoarding`
- `ai-search-source-footprint`
- `web-research-workflow-diagram-ai-seo`
- `gsc-ai-cite-archived-sources`
- `osint-research-agent-workflow-ai-pagestash`
- `osint-data-pipeline-pagestash-to-maltego`

`docs/BLOG_IMPLEMENTATION_STATUS.md` claimed "Articles 2–4 pending" — that's stale. The actual content folder is far ahead of that doc.

---

## 8. On-page SEO patterns (template)

Repeat these patterns in every article. They are derived from what's been shipped successfully and from competitor SERP analysis.

**Title / H1**
- Include the primary keyword and the year for time-sensitive pieces
- Promise specificity (`comparison`, `guide`, `7 ways`, `2026`, `step-by-step`)
- Avoid keyword stuffing

**Meta description**
- 150–160 chars
- Lead with the one-sentence value
- Use one of the §4 differentiation phrases

**Opening paragraph**
- Restate the question the searcher actually asked, in plain words
- Promise the answer
- Use one differentiation phrase

**Schema**
- `Article` JSON-LD (already auto-applied via `apps/web/src/app/blog/[slug]/page.tsx`)
- `BreadcrumbList` JSON-LD (already shipping)
- `FAQPage` JSON-LD when the post has a real FAQ block (most should)
- For comparisons, consider `SoftwareApplication` JSON-LD with `aggregateRating` (only if you have real reviews; do not fabricate)

**Body structure**
- H2 sections every 250–400 words
- Short paragraphs (2–4 sentences)
- One comparison table per long-form piece — they get featured-snippet love
- One image with descriptive alt and a real caption (no Unsplash placeholders for evergreen pieces)
- "Last verified: Month Year" line on every comparison piece — protects trust as competitor pricing changes

**Internal links**
- Every spoke links to its hub
- Every spoke links to the homepage Portability section (`/#exports`)
- Every spoke links to 2–3 related spokes
- Every spoke ends with a CTA: *"Try capture + export `.md` — install the extension"* + signup link

**External links**
- Cite competitor docs / store listings when stating their features
- Cite first-party sources (academic papers, industry reports) where claims need backup
- Avoid stale specifics on competitor versions — they churn

---

## 9. FAQ snippet sources (steal these as Q&A blocks)

Pulled from real objections and questions that appear in competitor reviews. Each is a high-snippet-potential FAQ entry. Use directly inside the FAQPage JSON-LD on relevant pieces.

- **What is a Markdown web clipper?**
- **Can I export PageStash clips to Obsidian?**
- **Does PageStash work without Obsidian?**
- **How do I save a ChatGPT conversation as Markdown?**
- **Why are images missing in my Markdown export?**
- **Can I clip multiple tabs at once?**
- **How does PageStash handle social-media sites like Facebook or X?**
- **Where do my highlights live? Are they backed up?**
- **What's the difference between PageStash and Pocket / Instapaper?**
- **What's the difference between PageStash and Obsidian Web Clipper?**
- **Is PageStash a Zotero / Mendeley replacement?**
- **What happens to my clips if I cancel Pro?**
- **Can I bulk export everything I've ever saved?**
- **Does PageStash work offline?**
- **Is PageStash open source?** *(answer must reflect §13 in PRD)*

---

## 10. Distribution playbook (per launch)

For every article you publish, run this loop in the first 7 days. It compounds.

### Day 0 — Publish
- [ ] Article published with proper meta, schema, breadcrumbs, internal links
- [ ] Tweet / X thread teasing the angle (not a "we published" announcement)
- [ ] LinkedIn post for B2B-flavoured pieces (legal, OSINT, research)
- [ ] Submit URL to Google Search Console for indexing

### Day 1 — Reddit (one subreddit per day max — do not flood)
Per `REDDIT_ORGANIC_STRATEGY.md` cadence rules:
- Vary copy per subreddit; reply within 2 hours; no cross-post same day
- Tier-1 subs: r/SideProject, r/InternetIsBeautiful, r/productivity, r/Entrepreneur, r/SaaS
- Tier-2 subs: r/GradSchool, r/PhD, r/PKM, r/ObsidianMD, r/Notion, r/selfhosted, r/degoogle
- Tier-3 subs: r/AskAcademia, r/Journalism, r/LawSchool, r/DataHoarder, r/privacy
- Match piece → subreddit (Markdown / Obsidian piece → r/ObsidianMD + r/PKM)

### Day 2 — Hacker News (high-bar pieces only)
- Title pattern: problem-first / data-led — *"The hidden cost of link rot in academic citations"* beats *"Show HN: PageStash"*
- Submit Tue–Thu, 8:37am ET (per `HACKER_NEWS_LAUNCH_STRATEGY.md`)
- Be ready in the comments — first comment from you with stack/pricing + 3 questions invites discussion
- Pre-prep answers re Archive.org, Pocket, Evernote, privacy, price, wget, legal admissibility, **open-source posture** (see PRD §13)

### Day 3–5 — Long tail
- Dev.to / Hashnode crosspost (technical pieces — JSON / CSV / RAG / engineering)
- Quora answer linking back (only on questions that exist organically)
- HARO / Featured pitches when topic matches a journalist query
- AlternativeTo, SaaSHub, Product Hunt Ship listing updates if relevant

### Day 7 — Measure
- Check rankings in GSC for the target keyword cluster
- Check time-on-page, scroll depth, signup attribution
- Decide: refresh in 30 days (good) / boost (great) / archive (bad)

---

## 11. GEO — Generative Engine Optimization

Search is bifurcating. We need to rank in **answer engines** (ChatGPT, Perplexity, Claude, Google AI Overview, Bing Copilot) as well as classic Google. This section is the working playbook because nothing in the legacy SEO docs codified it.

### The GEO checklist (apply to every new pillar piece)

- [ ] **Entity-first FAQ** — the page answers "What is X?" in one paragraph that an LLM can cite verbatim
- [ ] **`FAQPage` and `Article` JSON-LD** with explicit `headline`, `author`, `datePublished`, `dateModified`
- [ ] **`SoftwareApplication` schema** on PageStash-feature pages for product mentions
- [ ] **`sameAs`** links to `org.pagestash`, social profiles, GitHub — entity disambiguation
- [ ] **"Last verified: Month Year"** line on every comparison page — answer engines prefer fresh evidence
- [ ] **Comparison tables with real data** — answer engines extract these literally; sloppy or stale tables hurt
- [ ] **Self-contained definition paragraph** at the top of every page (don't make the LLM hop to another page to define your term)
- [ ] **Reference quality** — cite primary sources where possible; LLMs are increasingly using citation count as a quality signal
- [ ] **One canonical URL** — `pagestash.app` vs `www.pagestash.app` must resolve consistently (PRD §13 open question)

### GEO-relevant article patterns

Articles that lean into GEO surface area (highest priority within Cluster H):

- **Definition pages** — "What is a Markdown web clipper?" / "What is a knowledge graph?"
- **How-to pages with explicit numbered steps** — answer engines extract step lists
- **Comparison pages with structured tables** — "PageStash vs X" feeds AI Overviews directly
- **"Best X for Y" listicles with explicit criteria** — extracted into AI summaries
- **Troubleshooting / "why is X happening"** — the long tail of question-shaped queries

### Submission targets

- Google Search Console — sitemap submitted, AI Overview eligibility implicit
- Bing Webmaster Tools — submitted; Bing Copilot inherits from Bing
- Perplexity — no submission portal, but indexing crawls openly. Robots.txt should allow `Perplexity-User`
- ChatGPT search — crawl is via `OAI-SearchBot`. Robots.txt should allow it

### Action

- [ ] Verify `apps/web/src/app/robots.ts` allows `OAI-SearchBot`, `Perplexity-User`, `ChatGPT-User`, `ClaudeBot`, `Google-Extended`
- [ ] Audit existing pillar pages against the GEO checklist; backfill missing schema
- [ ] Add a "GEO checklist" pre-publish gate to the article workflow

---

## 12. Backlink targets & sequencing

From `BACKLINK_ACTION_PLAN.md`, `TARGETED_BACKLINK_STRATEGY.md`, and `BACKLINK_OUTREACH_TEMPLATES.md`. Use templates from those source docs (still in the repo until consolidation).

### Week 1 — quick wins (low-effort, high-yield)
- AlternativeTo
- SaaSHub
- Product Hunt Ship
- Slant
- Beta List
- Capterra / G2 / GetApp / SoftwareAdvice / StackShare
- theresanaiforthat / ToolFinder / Startup Stash / tools.design / SourceForge

### Week 2 — community submissions
- Hacker News (per §10 playbook)
- r/SideProject (already in Reddit cadence)
- Tools and Toys
- Launching Next / BetaPage / Startup Buffer

### Tier 1 — relationship-driven
- ResearchGate, Academia.edu, Zotero/Mendeley communities
- Dev.to, Hashnode (technical articles)
- GitHub Awesome Lists — `awesome-research`, `awesome-productivity`, `awesome-knowledge-management`, `awesome-browser-extensions`
- **University library outreach** — 50–100 schools (template in `BACKLINK_OUTREACH_TEMPLATES.md`)
- Student Beans / GitHub Education / UNiDAYS (if student plan ever ships)
- HARO / Featured pitches

### Tier 2 — guest content
- Lifehacker / MakeUseOf / Sweet Setup
- PKM / productivity blogs (Forte Labs, Anne-Laure Le Cunff, etc.)
- OSINT-specific blogs (Bellingcat methodology blog, OSINT Combine)

---

## 13. Technical SEO — done vs outstanding

### Shipped
- Sitemap, robots, HTTPS, mobile-friendly
- Clean URLs (`/blog/[slug]`)
- `generateMetadata` per blog post (title, description, OG, Twitter, canonical)
- `Article` JSON-LD per post
- `BreadcrumbList` JSON-LD with on-page breadcrumbs
- `FAQPage` JSON-LD on homepage
- Homepage title/description tuned for "web clipping" / "save web pages permanently"
- Related articles component
- Dark mode for blog (recently shipped)
- GSC + Bing Webmaster Tools verified

### Outstanding (P0)
- [ ] **`og-image.png` (1200×630)** — still flagged missing in legacy SEO notes (archived: `docs/archive/IMMEDIATE_SEO_CHANGES_SUMMARY.md`). Critical for social sharing
- [ ] Lighthouse / Core Web Vitals pass on homepage and `/blog`
- [ ] Domain canonicalisation — pick `pagestash.app` or `www.pagestash.app` and 301 the other (PRD §13)
- [ ] Robots.txt: explicitly allow GEO crawlers (§11)

### Outstanding (P1)
- [ ] Image optimisation pass on blog featured images (currently many Unsplash URLs)
- [ ] FAQ schema on every long-form pillar page (not just homepage)
- [ ] Code splitting for blog routes if Lighthouse shows JS payload issues
- [ ] Internal-linking audit — every spoke linking to its hub and to the homepage Portability section

---

## 14. Conflicts to resolve in marketing copy

Drift across legacy docs. Use the values in this row, not the legacy ones.

| Topic | Use this | Don't use |
|---|---|---|
| **Pricing** | $10/mo annual, $12/mo monthly | $4/mo, $40/yr (old MONETIZATION_PLAN) |
| **Free tier limit** | 10 clips/month | 50, 100 (legacy REQUIREMENTS, MONETIZATION_PLAN) |
| **Pro clip limit** | Unlimited | "1,000 clips" (old MONETIZATION_PLAN) |
| **Trust claims** | Honest, verifiable copy | "10,000+ professionals", "2M+ pages archived", "SOC-2 Compliant" — until verified or removed (PRD P0) |
| **Domain** | Pick one + redirect (PRD §13) | mixing `pagestash.app` and `www.pagestash.app` |
| **Open-source posture** | Closed source (current state) | "open-source web clipper" framing in old `TARGETED_BACKLINK` Show HN draft |
| **Citation positioning** | "Citations for **web captures**, not a Zotero replacement" | "Only tool with academic citations + OSINT templates + knowledge graph" (overbroad) |
| **Knowledge Graph features** | Real connections only — Same-Website / Same-Topic / Shared-Tags / Same-Session | Importance %, confidence scores, "Verified" badges (all removed per April 2026 audit) |

---

## 15. Live GSC Query Data (April 2026 snapshot)

These are our actual Google Search Console impressions. High impressions + 0 clicks = we're ranking but not winning the click. The fix is targeted, high-quality articles that match the exact query intent. The article backlog in §5–6 is ordered to address these first.

| Query | Impressions | Clicks | Priority | Status |
|---|---|---|---|---|
| `best web research tools organized reference 2026` | 386 | 0 | **P0** | ➜ new article written |
| `what is the best e clipping tool for organizing research?` | 114 | 0 | P0 | ➜ new article written |
| `what is the best clipper for organizing business research?` | 102 | 0 | P0 | covered by e-clipping article |
| `personal knowledge management` | 76 | 0 | P0 | ➜ new pillar article written |
| `how do i archive candidate profiles for future openings?` | 61 | 0 | P0 | ➜ new article written |
| `research storage organization solutions tools` | 45 | 0 | P1 | existing article; needs refresh |
| `how to create a pkm system` | 41 | 0 | P0 | ➜ new step-by-step written |
| `research storage organization solutions tools methods` | 35 | 0 | P1 | covered above |
| `what is the best clipping app for organizing research?` | 24 | 0 | P0 | ➜ new article written |
| `best workspace for capturing and organizing sources research 2026` | 22 | 0 | P0 | ➜ new article written |
| `research organization tools` | 17 | 0 | P0 | ➜ new deeper guide written |
| `best clipping app for organizing research` | 15 | 0 | P0 | covered above |
| `internet archive cached pages stash` | 15 | 0 | P0 | ➜ new article written |
| `what is the best tool for fast organized web research and reference` | 13 | 0 | P0 | ➜ new article written |
| `best workspace tools for capturing and organizing sources research notes 2026` | 12 | 0 | P1 | covered by workspace article |
| `best workspace tools for capturing and organizing sources research 2026` | 9 | 0 | P1 | covered above |
| `managing recruitment archives` | 9 | 0 | P0 | ➜ new article written |
| `workspace for capturing and organizing sources` | 8 | 0 | P1 | covered above |
| `best e clipping tool for organizing research` | 8 | 0 | P1 | covered above |
| `best tools for organizing and tracking research publications 2025 2026` | 7 | 0 | P0 | ➜ new article written |
| `clip from web page` | 7 | 0 | P0 | ➜ new article written |
| `how to manage candidate files` | 6 | 0 | P0 | covered by recruiting article |
| `stash pages` | 5 | 0 | P1 | existing gsc-stash-pages-meaning |
| `personal knowledge management system` | 5 | 0 | P0 | ➜ covered by new PKM pillar |
| `top research websites 2026` | 3 | 0 | P1 | covered by web research tools article |
| `competitor analysis tools ux design` | 3 | 0 | P0 | ➜ new article written |
| `saved pages` / `saved internet pages` / `saved websites` | 2–2 | 0 | P1 | ➜ new article written |
| `pkm system` / `pkm systems` / `what is a pkms system` | 2–1 | 0 | P0 | ➜ new PKM pillar covers these |
| `what is personal knowledge management` | 2 | 0 | P0 | ➜ covered by new PKM pillar |
| `pocket web clipper` | 1 | 0 | P1 | ➜ new article written |
| `preserve web pages` | 1 | 0 | P0 | ➜ new article written |
| `best knowledge organization tools for researchers 2026` | 1 | 0 | P0 | ➜ new article written |
| `best web research tools for students` | 1 | 0 | P1 | ➜ new article written |
| `file management for recruiters` | 1 | 0 | P1 | covered by recruiting article |
| `how to build a personal knowledge management system` | 1 | 0 | P0 | ➜ covered by PKM pillar |

**Key insight:** We have 386+ impressions on "best web research tools organized reference 2026" but 0 clicks. This one article, if it gets even 2% CTR, is 7–8 visits/day from a single optimised title + meta description. Priority is matching query intent exactly — that means "organized reference guide" framing, a clean comparison table, and a compelling meta description that promises the table.

**Brand confusion cluster:** `pagestart`, `pagewash`, `pagesta`, `webstash`, `uptash`, `jastash`, `lolarchiver` — these are searchers who can't remember our name but know roughly what we do. Fix: (a) make `gsc-pagestash-what-is` and `gsc-pagestash-vs-similar-names` rank above the fold for these, (b) the [PageStash — what is it?](/blog/gsc-pagestash-what-is) article handles this directly.

---

## 16. Measurement

Track these monthly. Add to your GA4 / GSC dashboard.

### Cluster-level rankings (GSC)
- `web clipper markdown` — Cluster A
- `obsidian web clipper alternative` — Cluster A
- `export chatgpt to markdown` — Cluster A + H
- `best web clipping tools 2026` — Cluster B
- `pocket alternative` — Cluster C
- `evernote web clipper alternative` — Cluster C
- `how to organize research articles` — Cluster D
- `second brain` — Cluster E
- `osint web archival tools` — Cluster F
- `save chatgpt conversations` — Cluster H

**Goal:** top-3 rank on at least 2 cluster-A keywords within 90 days.

### Article-level KPIs
- Organic page views per post
- Time on page (target ≥ 4 min for pillar pieces)
- Scroll depth (target ≥ 60% for pillar pieces)
- Signup attribution (last-touch via GA4)

### Cluster-level acquisition
- First-touch survey on signup: *"How did you hear about PageStash?"* — surfaces Karpathy / Twitter / blog hypotheses
- UTM parameters on every distribution post

### Backlink growth
- Total referring domains (Ahrefs / Moz)
- DR-weighted backlinks
- Mentions in AI search results — periodic spot-checks on ChatGPT / Perplexity for our cluster terms

---

## 17. Quarterly refresh cadence

- **Monthly** — review cluster rankings, refresh any pillar piece that lost rank, write 2–4 new articles from §5 / §6
- **Quarterly** — re-audit competitor pricing tables across all comparison pieces; re-export Chrome Web Store reviews and re-run the obsidian assessment if material new themes emerge; revisit §11 GEO checklist as answer engines evolve
- **Annually** — refresh the "Best web clipping tools 2026" piece into the next year's edition; re-baseline keyword volumes; re-verify all "Last verified" dates

---

*Last updated: April 2026*
*This document supersedes: `SEO_STRATEGY.md`, `SEO_IMPROVEMENT_STRATEGY.md`, `SEO_IMPLEMENTATION_COMPLETE.md`, `SEO_IMMEDIATE_ACTIONS.md`, `SEO_DO_THIS_TODAY.md`, `SEO_CHANGES_COMPLETED.md`, `docs/archive/IMMEDIATE_SEO_CHANGES_SUMMARY.md`, `CRITICAL_ITEM_COMPLETED.md`, `CONTENT_STRATEGY_SEO_PLAN.md`, `EXPORT_STRATEGY_RESEARCH_NICHE.md`, `EXPORT_FEATURE_USE_CASES_MARKETING.md`, `BACKLINK_ACTION_PLAN.md`, `BACKLINK_QUICK_START_CHECKLIST.md`, `TARGETED_BACKLINK_STRATEGY.md`, `BACKLINK_OUTREACH_TEMPLATES.md`, `REDDIT_*` (×5), `HACKER_NEWS_LAUNCH_STRATEGY.md`, `HN_FEEDBACK_COMPETITOR_ANALYSIS.md`, `COMPETITOR_ANALYSIS.md`, `COMPETITOR_ANALYSIS_HUNCHLY.md`, `docs/archive/BLOG_POSTS_CREATED.md`, `BLOG_IMPLEMENTATION_STATUS.md`, `NEW_BLOG_POSTS_SUMMARY.md`, `PRODUCTIVITY_POSTS_SUMMARY.md`, `GOOGLE_SEARCH_CONSOLE_SUBMISSION.md`, and the two `docs/assessments/obsidian-web-clipper-reviews-*.md` files.*
