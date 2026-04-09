# PageStash — Product Blueprint & PRD 2026

> **Mission:** Make PageStash the most intuitive, beautiful, and reliable web archival tool on the market — the one researchers actually go back to.

---

## North Star

**"Save it once. Find it forever."**

Every decision flows from retrieval, not capture. Capture is already one click. The problem we solve is getting people back to what they saved, weeks later, instantly. That is the product's entire reason to exist.

---

## What This Document Is

This is the canonical product plan. It supersedes all previous roadmap docs. It covers:
- What we are and are not changing
- The exact improvements, in priority order
- Acceptance criteria for each item
- Success metrics we will track

This plan **does not break existing functionality**. Everything here is additive polish, cleanup, or UX improvement on top of what already works.

---

## Scope Constraints

### Will not change
- Free tier: **10 clips/month** — stays as-is
- Core tech stack: Next.js 14, Supabase, Stripe, Chrome MV3 extension
- Database schema (additive migrations only, never destructive)
- Pricing structure ($12/mo Pro) — evaluate after UX improvements ship

### Will change
- Console output (✅ done)
- Right-click protection (✅ done)
- Mobile toolbar layout (✅ done)
- Everything in the phases below

---

## Positioning

**Category:** Web archival tool
**ICP (Primary):** Knowledge workers who research as a core job function — journalists, analysts, product researchers, academics, founders. They save 10–50 pages/week and need to retrieve specific facts weeks later.
**ICP (Secondary):** Anyone who has said "I know I read something about this somewhere."

**Unique claim:** *The only web clipper that captures the full page exactly as you saw it, lets you search what's inside it, and shows you how everything connects.*

**What we are not:** A bookmarking app. A reading-later app. A browser sync tool.

---

## Competitive Positioning

| Competitor | Their Gap | Our Advantage |
|---|---|---|
| Raindrop.io | No content search, no archival fidelity | Full-text search inside captured HTML |
| Pocket / Instapaper | Pages go stale, no archival | Permanent capture with screenshot + HTML |
| Readwise Reader | Highlights-only, expensive, complex | Full page, simpler, one-click |
| Evernote Clipper | Bloated, slow, dated UI | Modern, fast, focused |
| Memex | Indie, janky UX | Polished, reliable, delightful |

**The gap we own:** Archival fidelity + content search + knowledge graph. Nobody else has all three with this UX simplicity.

---

## The Plan

Organized into four phases. Each phase can run independently — no phase blocks another.

---

### Phase 1 — Production Integrity
*Status: In progress | Goal: Ship-clean, professional-grade code*

#### P1.1 Console Logs ✅
Remove all `console.log` debug statements from client-side code. Server-side API routes may retain `console.error` for server logs. Done.

#### P1.2 Right-Click Protection ✅
Global `contextmenu` preventDefault via `GlobalProviders` client component in root layout. Done.

#### P1.3 Mobile Toolbar ✅
Dashboard search/filter toolbar split into two rows. Secondary controls scrollable horizontally on mobile. Done.

#### P1.4 Branding Drift
- [ ] Remove "PagePouch" from `docs/database-schema.sql` header
- [ ] Remove "PagePouch" from `packages/shared/package.json` description
- [ ] Grep the codebase for remaining "PagePouch" references and replace with "PageStash"
- **AC:** Zero occurrences of "PagePouch" in any user-visible or developer-visible file

#### P1.5 Trust Signal Audit
- [ ] Audit every claim on the marketing page: "10,000+ professionals", "2M+ pages archived", "SOC-2 Compliant"
- [ ] Either verify these with real data, replace with honest numbers, or remove them entirely
- [ ] Replace "SOC-2 Compliant" with something true and compelling (e.g. "Your data, encrypted at rest and in transit. Never sold.")
- **AC:** Every trust claim on the homepage is accurate and verifiable

#### P1.6 Debug Routes Audit
- [ ] Audit `/api/debug/user` and `/api/debug/usage` endpoints — these should be removed or locked behind an admin check before production
- **AC:** No unauthenticated debug endpoints in production

#### P1.7 Schema Documentation Sync
- [ ] Add `is_favorite` column and `knowledge_graphs` table to `docs/database-schema.sql`
- [ ] Document the race-condition fix migrations (v1/v2) inline in the schema file
- **AC:** Schema SQL file matches the actual production database

---

### Phase 2 — UX Refinements (No new features)
*Goal: Every existing interaction feels polished and intentional*

#### P2.1 Empty State Design
The dashboard empty state (new users, empty folders) should be inviting, not a blank void.

- [ ] Design and implement a proper empty state for first-time users: logo, single guiding sentence, "Install Extension" CTA
- [ ] Empty folder states: "This folder is empty — capture a page and drop it here"
- [ ] Empty search results: "No clips match your search — try different keywords"
- **AC:** No user ever sees a completely blank content area

#### P2.2 Extension Popup Review
- [ ] Audit the current popup UI: is it truly one-click or is there friction?
- [ ] The default save (to Inbox) should require zero interaction — one click = saved
- [ ] Folder/tag selection optional and accessible but not required
- [ ] Loading state should feel instant (<200ms visual feedback)
- **AC:** A page can be saved in under 2 seconds with one click

#### P2.3 Clip Card Mobile Polish
- [ ] On mobile (< 640px), clip cards should be full-width in list format by default (grid is harder to read on mobile)
- [ ] Tapping a card on mobile should open the clip viewer correctly without layout shifts
- [ ] The clip viewer modal should be full-screen on mobile
- **AC:** Full dashboard usability on iOS Safari and Android Chrome

#### P2.4 Authentication Flow
- [ ] Login page: if user arrives with an email from a password reset or invite, pre-fill the email field
- [ ] After signup, redirect to dashboard with a "Welcome" state (not just a cold dashboard)
- [ ] Error messages should be human-readable ("Your email or password is incorrect" not "Invalid credentials")
- **AC:** Auth flow feels smooth on first use, second use, and error states

#### P2.5 Keyboard Shortcuts
- [ ] `Cmd/Ctrl + K` — open search (focus the search bar)
- [ ] `Esc` — close clip viewer, close modals
- [ ] `←` / `→` — navigate between clips when viewer is open
- [ ] `F` — toggle favorite on focused clip
- [ ] Surface shortcuts in a help tooltip or footer note
- **AC:** Power users can navigate the dashboard without a mouse

#### P2.6 Onboarding First-Clip Moment
When a user has zero clips (first session only):
- [ ] Show a brief 3-step guide overlay: "Install → Capture → Find"
- [ ] "Install Extension" button links to download modal
- [ ] Dismissable, remembered in localStorage — never shown again after dismissed
- **AC:** New users understand what to do within 10 seconds of landing on the dashboard

---

### Phase 3 — Premium Feel
*Goal: Every pixel, interaction, and word conveys quality*

#### P3.1 Reader View Polish
The text tab in the clip viewer should feel like a premium reading experience.

- [ ] Serif or carefully chosen sans-serif font for article body text in reader view
- [ ] Comfortable line-height (1.7–1.8), max-width ~680px centered
- [ ] Clean metadata header: favicon, domain, capture date
- [ ] Highlight text → "Copy Quote" button appears (saves text to clipboard with attribution URL)
- **AC:** Reading a saved article in PageStash feels better than reading it on the original site

#### P3.2 Search Experience
- [ ] Search results should highlight the matching term within the clip title/excerpt
- [ ] As user types, show result count ("12 clips match")
- [ ] Clear search button is always visible when query is active
- [ ] Search should debounce at 200ms — no lag, no flicker
- **AC:** Finding a clip by keyword feels instant and satisfying

#### P3.3 Micro-interactions
- [ ] Favorite toggle: heart/star animates with a subtle scale-up + color pop
- [ ] Clip save from extension: brief success state in popup ("✓ Saved to Inbox")
- [ ] Delete confirmation: replace `window.confirm()` with an in-UI confirmation (slide-in or modal)
- [ ] Folder color picker: show swatches inline, not a native color input
- **AC:** No interaction uses a browser-native alert, confirm, or prompt dialog

#### P3.4 Pro Upgrade Flow
The current upgrade buttons in the sidebar are plain `<button>` elements with inline `alert()` on error. This needs polish.

- [ ] Replace raw upgrade buttons with proper upgrade card component
- [ ] Show Pro feature preview when free user tries to access Knowledge Graph (teaser screenshot/animation)
- [ ] After upgrade: celebratory moment, Pro badge shows in nav, feature unlocks immediately
- [ ] If Stripe checkout fails: show a friendly in-app error, not `alert('Upgrade failed. Check console.')`
- **AC:** The upgrade journey feels as premium as the product itself

#### P3.5 Dark Mode
The codebase has `dark:` Tailwind variants throughout. Dark mode is partially implemented but not shipped.

- [ ] Verify all components render correctly in dark mode
- [ ] Add a dark/light mode toggle in the dashboard header (sun/moon icon)
- [ ] Persist preference in localStorage
- [ ] System preference detection as default
- **AC:** Dark mode is complete, pixel-perfect, and user-controllable

#### P3.6 Clip Viewer Navigation Polish
- [ ] Previous/next navigation should animate the clip in (slide or fade)
- [ ] Show clip position context: "6 of 247 clips"
- [ ] Keyboard nav (← →) should work without focusing any specific element
- **AC:** Browsing through clips feels like flipping through a premium portfolio

---

### Phase 4 — Conversion & Growth
*Goal: More people understand the value and convert to Pro — without being annoying*

#### P4.1 Marketing Page — Messaging Reset
Current headline: "Capture the web like a pro." — generic.

- [ ] New primary headline: **"Your research, permanently."** or **"Save it. Search it. Connect it."**
- [ ] New sub-headline addresses the real pain: *"Stop losing the article you read last week. PageStash archives every page exactly as you saw it — and lets you search what's inside it."*
- [ ] Remove inflated trust metrics (10,000+ users, 2M+ pages, SOC-2) — replace with honest, compelling copy
- [ ] Add Knowledge Graph as a visual centrepiece in the features section (animated SVG or screenshot)
- **AC:** A visitor understands what PageStash does and why it's different within 5 seconds

#### P4.2 Knowledge Graph Marketing
The Knowledge Graph is the sharpest competitive moat and it's invisible on the marketing page.

- [ ] Add a dedicated "Connections" feature block on the homepage with a real screenshot or animated preview
- [ ] Headline: "See how your research connects" — not just "Knowledge Graph"
- [ ] Show it in the dashboard mockup on the homepage
- **AC:** Every homepage visitor is aware that PageStash can map connections between clips

#### P4.3 "Share a Clip" Public Link
Viral/referral loop: let users share a read-only version of a clip.

- [ ] One-click "Share" button on a clip → generates a public, shareable URL
- [ ] Shared view shows the clip content with a "Save your own clips with PageStash" footer CTA
- [ ] No auth required to view a shared clip
- **AC:** Sharing a clip is one click and generates a working public URL

#### P4.4 Extension Store Optimization
- [ ] Update Chrome Web Store description, screenshots, and keywords based on current positioning
- [ ] Add "new user" onboarding screenshots showing the full flow
- [ ] Review and respond to any existing reviews
- **AC:** Extension store listing reflects current product, not MVP state

#### P4.5 Pricing Page Clarity
- [ ] The pricing section should make the Free → Pro value delta crystal clear
- [ ] Pro features listed with specific callouts: Knowledge Graph, Export, Priority Support
- [ ] Annual pricing option visible (if available via Stripe)
- **AC:** A Pro user knows exactly what they're paying for; no confusion about what's included

---

## What Success Looks Like

| Metric | Baseline | 90-day Target |
|---|---|---|
| Console errors in production | None | None (maintained) |
| Mobile usability score (Lighthouse) | Measure | ≥ 90 |
| Time-to-first-clip (new user) | Unknown | < 3 minutes |
| Free → Pro conversion rate | Unknown | Establish baseline |
| Dashboard session length | Unknown | Establish baseline |
| NPS (survey 30-day users) | Unknown | Establish and track |

---

## Execution Order

Do not start a phase until all items in the previous phase are complete. Within a phase, items can run in parallel.

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
(2 weeks)  (2 weeks)  (3 weeks)  (ongoing)
```

**Phase 1** is pre-conditions: nothing looks or feels premium if the foundation leaks.
**Phase 2** is usability: no friction in any existing flow.
**Phase 3** is delight: the experience users talk about.
**Phase 4** is growth: when the product is ready to be shown to the world.

---

## Principles

1. **Existing users first.** No change ships that degrades any existing workflow.
2. **No vanity complexity.** If a feature doesn't serve retrieval or make capture simpler, it doesn't ship in this cycle.
3. **One job per screen.** Every page/view has exactly one primary action.
4. **Words matter.** Every error message, empty state, and CTA gets reviewed for tone and clarity.
5. **Measure before you optimize.** Baseline metrics before Phase 4.

---

## April 2026 Audit — Dashboard & Page Graphs

*Written after shipping Phase 1–3 improvements. This is an honest assessment of what works, what is fake, and what needs to be done before we can confidently market this product.*

---

### Dashboard — Current State

**What works well**
- Clip card redesign is clean, fast, and genuinely premium
- Dark mode is now complete and consistent
- Search with full-text inside clip content — this is the core feature and it works
- Folder/tag organisation — reliable
- Skeleton loading was improved — no more long flash before content
- Keyboard shortcuts (Cmd+K, Esc, ←→, F) — implemented
- Parallel data loading — eliminated sequential round trips on startup
- Right-click protection and console cleanup — done

**What still needs work**
- Mobile: clip viewer modal is not truly full-screen on iOS Safari — needs `100dvh` not `100vh`
- List view on mobile: still shows grid by default — should default to list under 640px
- Empty state after search returns zero results is plain text — needs a real empty state component
- Clip viewer reader mode font: currently `font-sans`, should use a proper reading font (serif or Georgia) for the text tab
- Export clips: the multi-select export flow exists but the UX is not obvious — users won't discover it
- "Clip URL" manual capture: works but has no feedback state after saving

**Priority next actions for dashboard**
1. `viewport height` fix for mobile clip viewer (`h-[100dvh]` instead of `h-screen`)
2. Default to list view on mobile (< 640px) — single CSS breakpoint change
3. Reader view: swap to `font-serif leading-relaxed max-w-[68ch] mx-auto` for text content
4. Subtle "press /" to search hint in the empty search bar

---

### Page Graphs — Honest Audit

#### What is genuinely real and useful

| Connection type | Data source | Reliability | Value |
|---|---|---|---|
| **Same Website** | URL hostname match | High — 100% accurate | High — shows your source patterns |
| **Same Topic** | Folder membership | High — 100% accurate | High — your own organisation reflected back |
| **Shared Tags** | Tag string match | High — when tags are used | Medium — depends on user tagging discipline |
| **Same Session** | Created within 24h | Medium — time is a proxy | Medium — shows research sessions |
| **Similar Content** | Naive word overlap (top-50 words) | Low — produces false positives | Low until improved |

#### What was fake and has been removed
- **Importance %** in node tooltip: was `Math.random() * 0.5 + 0.3`. Removed. Replaced with actual connection count.
- **"Source Links"** filter label: was misleading. The edges it described were domain→clip relationships, not inter-clip citations. Renamed to "Same Website".
- **"Similar Content"** filter: removed from the quick filter bar. The algorithm (Jaccard word overlap) produces too many spurious connections to be trustworthy at this stage.
- **Confidence scores** on edges and nodes: all were hardcoded arbitrary numbers (0.9, 0.8, 0.7). Not meaningful.
- **"Verified" badge** on nodes: always false for user clips. Removed.

#### What the graph does well right now
1. The canvas render is fast — 23 nodes, 123 edges renders instantly client-side
2. Clicking a node shows which clips share that domain/topic — that is genuinely useful for research pattern recognition
3. The Knowledge Explorer panel gives a readable list of clips per entity
4. Clicking "View Clip" from the panel opens the full ClipViewer inline — seamless
5. The "By Website" view immediately shows which sources a user relies on most

#### What makes the graph NOT yet habit-forming
1. **No persistent state**: close the graph, reopen it — everything resets (zoom, selected node, search)
2. **Too many edges in "All Connections" view**: 123 connections on 23 nodes is visually overwhelming and makes it hard to read. The default should show only the strongest, clearest connections — not all of them.
3. **Node labels overlap at scale**: with 20+ nodes the labels collide. Needs force-directed layout or label collision detection.
4. **No "so what?" moment**: a user sees circles connected by lines but doesn't know what action to take. The graph needs a clear insight surface — e.g. "You've read 8 articles from nytimes.com" with a CTA to see them.
5. **"Similar Content" still runs silently**: even though we removed it from the filter bar, the `generateContentConnections` function still runs in `viewMode === 'all'` and adds edges. These edges are the source of many false connections in the default view.
6. **Export and Share buttons**: Export downloads a JSON blob. Share copies the URL. Neither is useful to an actual user. They are UI debt.

---

### Immediate Priorities (next sprint)

**P0 — Fix "Similar Content" running in background**
The `generateContentConnections` call in `convertToEnhancedGraphData` runs whenever `viewMode === 'all'`. It creates a large number of low-quality edges that crowd the default view. Remove it from the `'all'` view. Only run it when explicitly selected by a future "Content" view mode.

**P1 — Reduce default edge density**
In `'all'` view, only show "Same Website" (domain→clip) edges by default. This gives a clean, readable starting state. Users can add "Same Topic", "Shared Tags", and "Same Session" manually via the filter pills. This transforms the graph from "overwhelming" to "clear at a glance".

**P2 — Add an insight banner**
Above the graph canvas, render 1–2 auto-generated insights from the data:
- "Your most-used source: nytimes.com (8 clips)"
- "Most connected topic: Inbox (14 clips)"
This gives users an immediate "so what?" and makes the graph feel intelligent.

**P3 — Persist graph state in localStorage**
Save `zoom`, `panOffset`, `selectedNodeId`, `searchQuery`, and `showResultsList` to localStorage keyed by `graphId`. When reopening a graph, restore this state. This is a 30-line change with massive impact on the "returning user" experience.

**P4 — "Similar Content" rethink**
The current word-overlap algorithm is too crude. Before re-enabling it:
- Run it server-side on clip creation, store the similarity score in the DB
- Only surface edges with similarity > 0.5
- Label them explicitly as "May be related" not a hard connection

---

### Habit Formation — What We're Missing

The product captures well. The gap is the **return visit**. Users save pages but don't come back to search them because there's no pull.

The three things that create daily-use habits in tools like this:

1. **Serendipitous rediscovery** — show users something they saved and forgot. A "On this day" or "You saved this 3 months ago" module on the dashboard would take 2 hours to build and create daily reasons to open the app.

2. **Progress signal** — users need to feel the collection growing. A subtle "You've saved 47 pages this month" stat in the sidebar (already in the Usage card) should be more prominent and celebratory at milestones.

3. **Friction-free retrieval** — the search works. The problem is users don't search because they don't remember they have the content. An email digest ("Your weekly research summary — 12 pages saved this week") is a 4-hour build and a direct driver of retention. Add to Phase 4.

---

*Last updated: April 2026*
*Owner: PageStash team*
*Review cadence: Weekly during phases 1–3, monthly during phase 4*
