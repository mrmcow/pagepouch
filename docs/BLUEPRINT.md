# PageStash — Blueprint

> **The living progress tracker.** What's shipped, what's in flight, what ships next, what blocks launch.
>
> For long-term vision, audience, pricing rationale, and the full feature backlog, see [`PRD.md`](./PRD.md).
> For SEO/content/keyword strategy and the article backlog, see [`SEO_DRIVERS.md`](./SEO_DRIVERS.md).

---

## North Star

**"Save it once. Find it forever."**

Every decision flows from **retrieval**, not capture. Capture is already one click. The product earns its place by getting people back to what they saved, weeks later, instantly.

---

## Where we are right now (April 2026)

| Area | State |
|---|---|
| **Web app** | Production on Vercel, custom domain, dark mode complete, dashboard polished |
| **Browser extension** | Chrome MV3 + Firefox shipping; submission packages built; live in stores |
| **Auth** | Supabase email + Google OAuth; magic link working in dev and prod |
| **Capture** | One-click clip to Inbox, full-page screenshot + HTML + extracted text + metadata |
| **Search** | Full-text search across captured content (Postgres FTS) — works |
| **Knowledge Graph** | Real data only (fake metrics removed), Same-Website / Same-Topic / Shared-Tags / Same-Session edges, "Similar Content" deferred |
| **Billing** | Stripe **live** mode wired; `$10/mo annual` and monthly Pro plans; checkout, webhook, customer portal all functional |
| **Free tier** | 10 clips / month, hard cap with upgrade prompt |
| **Blog** | ~150 posts wired in `apps/web/src/content/blog/posts.ts`, full SEO meta, Article + BreadcrumbList JSON-LD, sitemap, robots, dark mode |
| **Analytics** | GA4 wired, conversion tracking instrumented across CTAs, scroll/visibility/exit-intent tracking on homepage |

---

## What shipped in this cycle (recent, post-April-audit)

These were the most recent improvements before this blueprint was written.

### Polish & UX
- Dashboard sidebar density reduced; nav shrunk; sidebar now scrolls independently (`lg:overflow-y-auto`)
- "Upgrade to Pro" CTA promoted **above** Folders for free users so it lands above the fold
- `ExportUpgradeModal` and `KnowledgeGraphUpgradeModal` redesigned: single Radix close button, mobile-responsive (`max-h-[92vh]` + scrolling body), professional hero treatment, single-CTA pricing focus
- Pricing voice unified across surfaces — annual `$10/mo` only, no "or pay monthly" noise
- Homepage hero pricing copy: `$10/month · Billed annually · Save 17%`
- New homepage **"Portability"** section (`#exports`) showcasing `.md` / `.html` / `.csv` / `.json` + academic citations + "Start archiving — free" CTA
- Blog post detail page and listing fully dark-mode compliant (`dark:` variants across `prose`, tags, CTA, related articles, breadcrumbs)

### Billing reliability
- `useStripeCheckout` hook centralises the Pro upgrade flow (used by `UpgradeCard`, `ExportUpgradeModal`, `KnowledgeGraphUpgradeModal`); no more hardcoded fallback price IDs
- `/api/stripe/checkout` surfaces real Stripe error message in non-production for easier debugging
- `getOrCreateStripeCustomer` is now resilient to `No such customer` errors when switching Stripe modes (test ↔ live)
- Local `.env.local` for `apps/web/` set to live Stripe price IDs, secret key, and webhook secret (live mode used locally for end-to-end testing)

### Subscription correctness
- Identified and documented inconsistency: `subscription_period_end` not consistently set/respected for complimentary Pro grants
- Decision: **`subscription_tier` is the only effective gate** (no client-side period-date enforcement)
- Implemented `pg_cron` job (daily 02:10 UTC) that auto-downgrades complimentary Pro users (`stripe_subscription_id IS NULL` AND `subscription_period_end < now()`) back to free — eliminates manual overhead for time-boxed grants

### Strategic research
- `docs/assessments/obsidian-web-clipper-reviews-product-assessment.md` — competitor review synthesis → product backlog (folded into [`PRD.md`](./PRD.md))
- `docs/assessments/obsidian-web-clipper-reviews-seo-assessment.md` — competitor review synthesis → keyword clusters & article angles (folded into [`SEO_DRIVERS.md`](./SEO_DRIVERS.md))

---

## What's in flight (this sprint)

| Item | Owner | Status | Notes |
|---|---|---|---|
| Documentation consolidation | core | **doing now** | This blueprint + PRD + SEO_DRIVERS replace 100+ scattered markdown docs |
| Markdown / Obsidian narrative push | content | next | First 5 articles from the SEO_DRIVERS top-20 list, plus Portability section already shipped |
| Mobile clip viewer height fix | frontend | open | Use `100dvh` instead of `100vh` so iOS Safari renders full-screen |
| Default to list view < 640px | frontend | open | Single CSS breakpoint change |
| Reader view typography | frontend | open | Swap to `font-serif leading-relaxed max-w-[68ch] mx-auto` for text content |

---

## What ships next (priority order)

This is the next-up queue. These items are pulled from the PRD backlog and rank-ordered by impact for the next 4–6 weeks.

### Knowledge Graph — make it habit-forming
*Source: April 2026 audit*

1. **Remove `generateContentConnections` from default `'all'` view** — these low-quality edges crowd the canvas. Only run when explicitly selected.
2. **Reduce default edge density** — Same-Website only on first paint; users opt in to Same-Topic / Shared-Tags / Same-Session via filter pills.
3. **Insight banner** — auto-generate 1–2 lines above the canvas: *"Your most-used source: nytimes.com (8 clips)"*. Gives the graph a "so what?" moment.
4. **Persist graph state in localStorage** keyed by `graphId` — zoom, pan, selected node, search query, results panel toggle. ~30 lines, large UX impact.
5. **Force-directed / collision-avoiding layout** so labels stop overlapping at 20+ nodes.

### Habit & retention
*Source: April 2026 audit + competitor review themes*

6. **"On this day" / "Saved 3 months ago" rediscovery module** on the dashboard. ~2-hour build, daily reason to return.
7. **Weekly research digest email** — *"You saved 12 pages this week. Here's a recap."* ~4-hour build, direct retention lever.
8. **Make the "47 pages this month" usage stat more prominent and celebratory at milestones** (10 / 50 / 100 / 500).

### Capture & export differentiation
*Source: Obsidian product assessment*

9. **Folder autocomplete + keyboard-first folder picker** in extension popup (most-requested ergonomic improvement from competitor reviews).
10. **"Default folder per tag/rule"** — lightweight automation without a full template language.
11. **Bulk multi-select export from dashboard** — already partially exists, surface it more obviously.
12. **Export fidelity golden-file tests** for `.md` exports of: long articles, ChatGPT/Claude threads, math-heavy pages, image-heavy news, old Reddit. *Trust is earned in regression tests.*
13. **Obsidian import "happy path" doc + optional 90-second video** — capture → bulk export → drop into vault. Explicit landing-page line: *"Works great alongside Obsidian: capture here, export `.md` to your vault."*

### Conversion
*Source: PRODUCT_BLUEPRINT_2026 P4*

14. **"Share a Clip" public link** — read-only public URL with "Save your own clips with PageStash" footer CTA. Viral loop, ~1-day build.
15. **Pricing page clarity** — Free → Pro value delta crystal clear. Pro features called out with screenshots.
16. **Knowledge Graph as homepage centrepiece** — animated SVG or screenshot above the fold or in the features grid (not buried).

### Trust & legitimacy
*Source: PRODUCT_BLUEPRINT_2026 P1.5 + Production Readiness*

17. **Audit and verify or remove every trust claim** on the homepage — "10,000+ professionals", "2M+ pages archived", "SOC-2 Compliant". Replace with honest, verifiable copy or remove.
18. **Privacy & data legal pass** — Privacy Policy and Terms of Service reviewed by counsel before any paid acquisition push.

---

## Launch blockers (must-fix before paid acquisition or PR)

These are pulled from the production-readiness checklist and updated to reflect current state. Anything ✅ here is already done.

### Security
- ✅ RLS policies enabled on all tables
- ✅ No secrets in git; `env.example` uses placeholders
- ✅ Bearer-token auth for extension; cookie auth for web
- ✅ Stripe webhook signature validation active
- ✅ Console.log statements removed from client production code
- [ ] **API rate limiting** (Upstash or Vercel Edge Middleware) — 100 req/min per IP for `/api`, 10 req/min for auth
- [ ] Lock or remove unauthenticated debug endpoints (`/api/debug/user`, `/api/debug/usage`)
- [ ] Add CSP headers in `next.config.js`

### Infrastructure
- ✅ Vercel deployment, custom domain, SSL
- ✅ Production env vars set on Vercel
- ✅ Supabase production backups enabled
- [ ] Set up staging environment

### Monitoring
- [ ] **Sentry** (or equivalent) for both web app and extension
- [ ] Uptime monitoring (UptimeRobot / Pingdom) for homepage, `/api/health`, auth
- [ ] Error rate dashboard

### SEO
- ✅ Sitemap, robots, canonicals, Article + BreadcrumbList JSON-LD shipped
- ✅ FAQ schema on homepage
- [ ] **`og-image.png` (1200×630)** — still flagged missing in multiple SEO audit docs (critical for social sharing)
- [ ] Lighthouse / Core Web Vitals pass

### Legal
- ✅ Privacy Policy drafted, GDPR account-deletion implemented
- [ ] **Legal review** of Privacy Policy + Terms of Service
- [ ] Terms of Service acceptance checkbox on signup
- [ ] Cookie consent banner for EU traffic

### Email
- ✅ Supabase email confirmations + magic link working
- [ ] All transactional templates QA'd in major email clients (Gmail, Apple Mail, Outlook web)
- [ ] `support@pagestash.app` mailbox set up and forwarded

### Extension store
- ✅ Chrome Web Store: live
- ✅ Firefox Add-ons: live
- [ ] Refresh store screenshots after the recent dashboard polish

---

## Active blog publishing

~150 blog posts are live (see `apps/web/src/content/blog/posts.ts`). The full backlog of next articles, keyword clusters, and content pillars is in [`SEO_DRIVERS.md`](./SEO_DRIVERS.md).

**Top of the next-15-articles queue** (from SEO_DRIVERS):
1. Best Web Clipping Tools 2026 — yearly refresh of the existing mega-post
2. PageStash vs Obsidian Web Clipper: Complementary Workflows
3. Web Clipper to Markdown: when MD works and when to use screenshot + HTML
4. How to save ChatGPT / Claude threads for research (export, math, limits)
5. Read-it-later vs permanent archive: ownership and export

---

## Decision log

Material decisions made in this cycle, with one-line rationale.

| Date | Decision | Rationale |
|---|---|---|
| 2026-04 | Single Pro plan voice: **`$10/mo` billed annually** | Anchors against competitor monthly prices ($12 Evernote, $5 Raindrop); annual improves cash flow; removes "or pay monthly" decision friction |
| 2026-04 | `subscription_tier` is the only entitlement gate (period dates are informational) | Avoids divergence between client checks and enforcement; cron job handles auto-expiry |
| 2026-04 | Use **live Stripe** locally during development | Allows end-to-end testing of upgrade flow against the same prices used in prod; risk mitigated with `stripe listen` for webhooks |
| 2026-04 | Centralise checkout in `useStripeCheckout` hook; **no hardcoded fallback price IDs** | A stale fallback (e.g. one-time price) silently sends invalid request and surfaces as opaque 500. Failing loudly is better |
| 2026-04 | Pin `getOrCreateStripeCustomer` to retry-and-recreate on missing customer | Test-mode customer IDs in DB don't exist in live mode; resilient retrieval avoids 500s after mode switch |
| 2026-04 | Auto-expire complimentary Pro via `pg_cron` (daily 02:10 UTC) | Eliminates manual overhead for time-boxed grants; only affects users without `stripe_subscription_id` |
| 2026-04 | Defer "Similar Content" graph edges to a future explicit view mode | Naïve word-overlap creates too many false connections to be trustworthy in default view |
| 2026-04 | Documentation consolidation: 4 canonical docs (BLUEPRINT, PRD, SEO_DRIVERS, subfolder tech docs) | 100+ scattered files with conflicting pricing/limits/positioning was creating drift |
| 2026-04 | Promote Markdown / Obsidian narrative as a primary acquisition wedge | Competitor review analysis (`assessments/obsidian-web-clipper-reviews-*`) showed real install intent driven by Markdown-first PKM culture |

---

## Cadence & ownership

- **This doc** is updated weekly during active sprints, monthly otherwise.
- **PRD changes** (vision, audience, pricing, anything load-bearing) require an entry in the decision log above.
- **SEO_DRIVERS** is the working backlog for content; new article ideas go straight into its backlog table without needing a decision-log entry.

*Last updated: April 2026*
