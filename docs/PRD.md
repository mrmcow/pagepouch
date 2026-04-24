# PageStash — Product Requirements Document

> **The product's source of truth.** Vision, who we serve, what we sell, what we ship.
>
> For week-to-week progress, see [`BLUEPRINT.md`](./BLUEPRINT.md).
> For keyword strategy and the article backlog that drives traffic into this product, see [`SEO_DRIVERS.md`](./SEO_DRIVERS.md).

---

## 1. North star

**"Save it once. Find it forever."**

The problem we exist to solve is **retrieval**, not capture. Capture is already one click on every web clipper that has ever existed. The wedge is what happens four weeks later when someone needs the thing they read.

---

## 2. Category & one-line claim

**Category:** Web archival tool with knowledge graph for researchers.

**One-line claim:** *The only web clipper that captures the full page exactly as you saw it, lets you search what's inside it, and shows you how everything connects — and exports cleanly to the tools you already use.*

We are **not** a bookmarking app, a reading-later app, or a browser sync tool. We are not Obsidian or a notes app — we are the **always-on capture and archive layer** that *feeds* notes apps via clean `.md` and structured exports.

---

## 3. Audience (ICP)

### Primary ICP — The retrieval-anxious researcher

Knowledge workers who research as a core job function. They save 10–50 web pages per week and need to retrieve specific facts weeks or months later.

- Journalists and investigative reporters
- Analysts (market, competitive, intel, OSINT, threat intel)
- Academic researchers, PhDs, grad students
- Founders and product researchers
- Consultants doing client deep-dives
- Compliance, legal, and corporate investigators (web evidence preservation)

**What unites them:** they have all said *"I know I read something about this somewhere."* They are willing to pay to never say that again.

### Secondary ICP — The "Markdown / PKM-curious"

A growing population that arrived via public Markdown / second-brain culture (Obsidian, Notion, Roam, Logseq, AI-research-stack discourse). They are **not** all Obsidian power users — many are exploring. They want a **credible web → `.md`** capture path that doesn't require running a desktop app.

This audience is documented in `apps/web/src/content/blog/` posts targeting Obsidian, Zettelkasten, second brain, and the Markdown export workflow, and in the assessment document `docs/assessments/obsidian-web-clipper-reviews-product-assessment.md`.

### Tertiary ICP — Anyone who reads the web for work

Broad knowledge workers who don't self-identify as researchers but accumulate hundreds of valuable pages a year. They convert at lower rates but expand the addressable market and feed referrals.

---

## 4. Competitive positioning

| Competitor | What they're for | Their gap | Our angle |
|---|---|---|---|
| **Raindrop.io** | Visual bookmarking | No content search, no archival fidelity, screenshots not durable | Full-text search **inside** captured HTML; permanent capture |
| **Pocket / Instapaper** | Read later | Pages go stale, no archive, weak search, ownership unclear | Permanent capture + screenshot + HTML; bulk export `.md`/`json` you own |
| **Evernote Web Clipper** | General productivity | Bloated, slow, dated UI, $14.99/mo | Modern, fast, focused, $10/mo |
| **Readwise Reader** | Highlights & reading | Highlights-only model, expensive, complex | Full page + structure; simpler; highlights are an export, not the product |
| **Notion / OneNote Web Clipper** | Notes-app capture | Tied to that notes app; capture is incidental | Capture is the **product**; export to **any** notes app |
| **Memex** | Indie research | Janky UX, niche, sync friction | Polished, reliable, cloud-first |
| **Obsidian Web Clipper** | Vault-native Markdown | Requires Obsidian configured locally; vault errors; HTML→MD fidelity issues; OS/browser quirks; steep template learning curve | Cloud capture **always succeeds**; export `.md` to Obsidian (or anywhere) as a workflow, not a coupling |
| **Hunchly** | OSINT case management | Expensive, niche-only, no general-purpose UX | Same evidentiary capture quality at an indie price; broader audience |
| **Archive.org / Webrecorder** | Public web archival | Not personal, no organisation, no search-your-own | Personal, organised, instantly searchable archive |

**The gap we own:** **archival fidelity + full-text content search + knowledge graph + first-class `.md`/structured export.** Nobody else has all four with this UX simplicity.

---

## 5. Product pillars

The product is built and marketed around four pillars. Every shipped feature should serve at least one. Anything that doesn't is scope creep.

### Pillar 1 — Capture that just works
- One-click save with zero configuration required
- Defaults to Inbox; folder/tag/note are optional
- Full-page screenshot + complete HTML + extracted text + metadata, every time
- The same capture works on hostile sites — when DOM extraction fails, the **evidence bundle** (screenshot + URL + timestamp + raw HTML) still saves
- Mobile, desktop, Chrome, Firefox

### Pillar 2 — Retrieval that feels instant
- Full-text search across captured HTML and notes (Postgres FTS today, Meilisearch when scale demands)
- Folder/tag/favorite organisation
- Filter by date, source, type
- Keyboard-first navigation (Cmd/Ctrl+K, ←/→, F to favourite, Esc)
- Reader view that's nicer than the original site

### Pillar 3 — Connections that surface insight
- Knowledge graph showing same-website / same-topic / shared-tags / same-session relationships
- Real connections only (no fake "importance %" or arbitrary confidence scores)
- Insight banners — *"Your most-used source: nytimes.com (8 clips)"*
- Persistent state per graph (zoom, pan, selection)
- Pro feature

### Pillar 4 — Portability you own
- `.md` (Markdown), `.html`, `.csv`, `.json` exports
- Academic citations (APA, MLA, Chicago) for **web captures** (we do not replace Zotero/Mendeley for PDFs)
- Bulk export from dashboard
- Notes, highlights, and metadata included in every export
- Pro feature

---

## 6. Pricing & monetization

**Single source of truth — supersedes `MONETIZATION_PLAN.md`, `Marketing-pricing-ideas.md`, and `REQUIREMENTS.md`.**

| Tier | Price | Limit | Features |
|---|---|---|---|
| **Free** | $0 | 10 clips/month | Capture, folders, tags, full-text search, dashboard, dark mode |
| **Pro** | **$10/mo billed annually** ($120/yr) **or** $12/mo billed monthly | Unlimited clips | Everything in Free **plus** Knowledge Graph, all exports (`.md`/`.html`/`.csv`/`.json`/citations), bulk operations, priority support |

### Why these numbers

- **$10/mo annual** anchors below Evernote ($14.99) and at parity with Readwise tier pricing while above Raindrop ($5) — signals "serious tool" without barrier
- **Annual primary, monthly secondary** improves cash flow, reduces churn, and removes "or pay monthly?" decision friction at the upgrade moment
- **10 clips free** is intentionally generous enough to feel the retrieval value but tight enough that any committed weekly user hits the limit
- **One Pro tier, not three** — the user's job is "get unlimited + the good stuff", not pick from a menu

### Effective entitlement gating

`subscription_tier` is the **only** gate that controls feature access. `subscription_period_end` is informational and **not** enforced at request time. A `pg_cron` job runs daily at 02:10 UTC to downgrade complimentary Pro grants (`stripe_subscription_id IS NULL` AND `subscription_period_end < now()`) — see [`BLUEPRINT.md`](./BLUEPRINT.md) decision log.

### Future pricing (not committed)

- **Team / collaborative** plan — shared folders, role-based permissions, $20–30/seat/mo. Triggered by demand from compliance / legal / consulting prospects.
- **Enterprise** — SSO, audit logs, export API, custom pricing. Triggered by inbound from research orgs / think tanks.

These do **not** ship in the current cycle and should not appear in marketing.

---

## 7. Scope: what we will and will not change

### Will not change
- Free tier of 10 clips/month
- Core stack: Next.js 14, Supabase, Stripe, Chrome MV3 + Firefox WebExtension
- Database schema (additive migrations only — never destructive)
- The single Pro tier at $10/mo annual

### Will change
- UX, polish, mobile responsiveness — continuous
- Knowledge Graph quality, layout, insights — active
- Export fidelity for `.md` and other formats — active
- Marketing site messaging and visual treatment — continuous
- Onboarding for new users — active

### Will not build (this cycle)
- A full in-extension template programming environment (we are not Obsidian Web Clipper)
- Local-vault bidirectional sync
- Reference manager (we are not Zotero — citations export is for **web captures only**)
- Team/enterprise features (deferred until external demand drives them)

---

## 8. Backlog

The full backlog. Items are tagged with priority and pillar. The next-up subset for this sprint lives in [`BLUEPRINT.md`](./BLUEPRINT.md) "What ships next".

### P0 — Trust & launch readiness

- [ ] Audit and verify or remove every trust claim on the homepage (`10,000+ professionals`, `2M+ pages archived`, `SOC-2 Compliant`) — replace with honest, verifiable copy
- [ ] Remove or auth-gate `/api/debug/user` and `/api/debug/usage`
- [ ] Add API rate limiting (Upstash or Vercel Edge Middleware)
- [ ] CSP headers in `next.config.js`
- [ ] Sentry (or equivalent) error tracking in web app + extension
- [ ] Legal review of Privacy Policy and Terms of Service
- [ ] Terms of Service acceptance checkbox on signup
- [ ] Cookie consent banner for EU traffic
- [ ] Remove all remaining "PagePouch" references from `docs/database-schema.sql` header, `packages/shared/package.json`, and code grep
- [ ] Sync `docs/database-schema.sql` with actual production schema (`is_favorite` column, `knowledge_graphs` table, race-condition fix migrations)

### P1 — Knowledge Graph: make it habit-forming
*(From April 2026 audit — Pillar 3)*

- [ ] Stop running `generateContentConnections` in default `'all'` view
- [ ] Default to Same-Website edges only on first paint; opt-in for Same-Topic / Shared-Tags / Same-Session via filter pills
- [ ] Insight banner above the canvas — auto-generate 1–2 lines (`"Your most-used source: nytimes.com (8 clips)"`)
- [ ] Persist graph state in localStorage by `graphId` — zoom, pan, selected node, search, results panel toggle
- [ ] Force-directed or label-collision-avoiding layout for 20+ nodes
- [ ] Remove or rebuild "Export" and "Share" buttons in the graph (currently UI debt — JSON blob and URL copy aren't user-facing valuable)
- [ ] Defer "Similar Content" until the algorithm is server-side, similarity-scored, and labeled as `"May be related"`

### P1 — Capture & export differentiation
*(From Obsidian product assessment — Pillars 1 & 4)*

- [ ] Folder autocomplete + keyboard-first folder picker in extension popup
- [ ] "Default folder per tag/rule" — lightweight automation
- [ ] Saved destinations as first-class UI ("Research", "Inbox", "Read later") — not buried in settings
- [ ] Bulk multi-select export from dashboard — surface more obviously
- [ ] Export fidelity golden-file tests for `.md`: long articles, ChatGPT/Claude threads, math-heavy pages, image-heavy news, old Reddit
- [ ] Documented Obsidian "happy path" — capture → bulk export → drop into vault
- [ ] Stable highlight model stored server-side with the clip; export includes highlight spans

### P1 — Habit & retention
*(From April 2026 audit "habit formation" section)*

- [ ] "On this day" / "Saved 3 months ago" rediscovery module on dashboard
- [ ] Weekly digest email — *"You saved 12 pages this week"*
- [ ] Promote the existing usage stat in the sidebar — celebratory at milestones (10 / 50 / 100 / 500)

### P1 — Conversion
*(From PRODUCT_BLUEPRINT_2026 P4)*

- [ ] "Share a Clip" public link — read-only public URL with footer CTA, no auth required to view
- [ ] Pricing page — make Free → Pro value delta crystal clear with screenshots
- [ ] Knowledge Graph as homepage centrepiece (animated SVG or screenshot, prominently placed)
- [ ] Refresh Chrome / Firefox store screenshots after recent dashboard polish
- [ ] Marketing page headline reset — current "Capture the web like a pro" is generic; test *"Your research, permanently"* or *"Save it. Search it. Connect it."*

### P2 — UX refinements

- [ ] Mobile clip viewer modal: use `100dvh` not `100vh` for true full-screen on iOS Safari
- [ ] Default to list view on mobile (< 640px)
- [ ] Reader view typography: `font-serif leading-relaxed max-w-[68ch] mx-auto` for text content
- [ ] Empty states — first-time user dashboard, empty folder, empty search results — never a blank content area
- [ ] Onboarding overlay on zero-clip dashboard — *"Install → Capture → Find"*, dismissable, remembered
- [ ] Auth flow: pre-fill email when user arrives from password reset / invite; "Welcome" state after signup
- [ ] All confirmation dialogs — replace `window.confirm()` with in-UI confirmation
- [ ] Folder color picker — swatches inline, not native color input
- [ ] "Copy Quote" button on highlighted text in reader view (saves text + attribution URL)

### P2 — Search experience

- [ ] Highlight matching term in result title/excerpt
- [ ] Live result count as user types
- [ ] Always-visible clear-search button when query is active
- [ ] 200ms debounce on search input
- [ ] Subtle "press /" hint in empty search bar

### P3 — Knowledge graph: research intelligence
*(From `KNOWLEDGE_GRAPH_ROADMAP.md` Phase 4 — only after P1 graph items ship)*

- [ ] HTML metadata extraction (author, publish_date, OG tags, Schema.org) for richer connections
- [ ] Named entity recognition for cross-clip entity connections
- [ ] Path highlighting between two selected nodes
- [ ] Subgraph extraction
- [ ] Research analytics dashboard — source diversity, research depth, coverage gaps

### P3 — "Template marketplace lite"

- [ ] Curated **site profiles** (arxiv, GitHub README, docs sites) maintained by PageStash — not user-programmable everything

### P4 — Future / opportunistic

- [ ] Team workspace creation, shared folders, permissions
- [ ] Real-time collaboration features
- [ ] Optional **RAG-ready export packs** — chunked `.md`, manifest JSON, stable IDs (hinted in obsidian assessment but only if proven demand)
- [ ] Browser automation workflows
- [ ] Desktop app

---

## 9. Anti-goals

We have explicitly chosen **not** to do these things. If a request lands here, push back.

- **Rebuild Obsidian's full template/interpreter DSL** in the extension. We ship sensible defaults + a small number of high-quality presets.
- **Promise "works perfectly on every social site"** without evidence bundles. Some sites are hostile to automation. The honest pitch is: when DOM extraction fails, the evidence bundle (screenshot + URL + time + HTML) still saves.
- **Local vault bidirectional sync.** It changes the security model and the support surface dramatically.
- **A full reference manager** for PDFs and books. We export web-capture citations. Zotero / Mendeley remain the right tools for PDF-heavy research workflows; we are complementary to them, not a replacement.
- **A multi-tier pricing menu.** One free, one Pro. Choosing is a friction tax.
- **Inflated trust metrics on the marketing page** (e.g. "10,000+ users", "SOC-2 Compliant" without certification). We ship honest, verifiable copy or we don't ship it.

---

## 10. Tech architecture (one-page reference)

For deep technical references, see the subfolder docs:
- `docs/extension/` — extension architecture, submission, store assets
- `docs/operations/` — Stripe billing, email setup, domain, Vercel
- `docs/engineering/` — clip URL handling, dashboard caching, knowledge graph internals, security audit, auth
- `docs/design/` — brand and design system
- `docs/legal/` — privacy policy, store listings, descriptions
- `docs/analytics/` — GA4, conversion tracking strategy, dashboard

### Stack
- **Extension:** TypeScript + Manifest V3 (Chrome, Edge, Firefox)
- **Web:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Radix
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Search:** Postgres FTS (will migrate to Meilisearch when scale demands)
- **Billing:** Stripe (live mode in production and dev)
- **Analytics:** Google Analytics 4
- **Hosting:** Vercel (web), Supabase (backend), Chrome Web Store + Firefox Add-ons (extension)

### Data model (essentials)
```
users (id, email, subscription_tier, subscription_status,
       stripe_customer_id, stripe_subscription_id,
       subscription_period_start, subscription_period_end,
       subscription_cancel_at_period_end)

clips (id, user_id, url, title, screenshot_url, html_content,
       text_content, is_favorite, created_at)

folders (id, user_id, name, color, parent_id)
tags (id, user_id, name, color)
clip_tags (clip_id, tag_id)
clip_folders (clip_id, folder_id)

knowledge_graphs (id, user_id, name, config_json, created_at)

user_usage (user_id, period_start, clips_created)
```

---

## 11. Success metrics

| Metric | Why it matters | Baseline | 90-day target |
|---|---|---|---|
| Time-to-first-clip (new user) | Activation | unknown | < 3 min |
| % of new users completing first **export** within 7 days | Pro-pillar activation | unknown | establish baseline, then push |
| Free → Pro conversion rate | Monetisation health | unknown | establish baseline |
| 7-day retention | Habit formation | unknown | establish baseline |
| 30-day retention | Habit formation | unknown | establish baseline |
| Bulk export usage | Pro-feature stickiness | unknown | correlate with retention |
| Mobile usability score (Lighthouse) | Mobile-first audiences | unknown | ≥ 90 |
| Console errors in production | Code health | 0 | maintain 0 |
| Organic traffic to `web clipper markdown` / `obsidian alternative` cluster | Acquisition signal | low | top-3 ranking on 2+ terms |
| NPS (30-day users) | Product health | unknown | establish, target ≥ 30 |

---

## 12. Principles

These guide every product decision. When two priorities collide, the one closer to the top wins.

1. **Existing users first.** No change ships that degrades any existing workflow.
2. **Retrieval, not capture.** If a feature doesn't make retrieval better or capture simpler, it doesn't ship in this cycle.
3. **One job per screen.** Every page/view has exactly one primary action.
4. **Honest claims only.** Every error message, empty state, CTA, and trust signal is reviewed for tone and accuracy.
5. **Sensible defaults beat infinite configurability.** Opinion is a feature. Templates are a trap.
6. **Measure before you optimise.** Baseline before chasing growth. Don't celebrate vanity metrics.
7. **Export is a product pillar, not an afterthought.** A user who can't take their data with them doesn't trust you with it in the first place.

---

## 13. Open questions

- **Karpathy / public-figure attribution in marketing copy.** The competitor review analysis showed real install intent driven by Karpathy mentions, but we should not quote private advice or imply endorsement. Decision: target the *job* (Markdown-first research stack) and the *category* (PKM-curious), not the person.
- **Extension open-source posture.** Old HN launch docs implied a `Show HN: open-source` framing. Current position: extension is not open source (yet). Resolve before any HN submission.
- **Domain canonicalisation.** Mixed use of `pagestash.app` vs `www.pagestash.app` across docs and outreach. Pick one, redirect the other, update all marketing copy.

---

*Last updated: April 2026*
*This document supersedes: `REQUIREMENTS.md`, `IMPLEMENTATION_PLAN.md`, `MONETIZATION_PLAN.md`, `Marketing-pricing-ideas.md`, `KNOWLEDGE_GRAPH_ROADMAP.md`, `NEXT_STEPS_ROADMAP.md`, and the `PRODUCT_BLUEPRINT_2026.md` plan/north-star sections.*
