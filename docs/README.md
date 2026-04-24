# PageStash — Documentation Index

Four canonical documents at the root, organized tech docs in subfolders. Everything else has been deleted or consolidated.

---

## The four canonical documents

| Doc | What it is | When to use it |
|---|---|---|
| [`BLUEPRINT.md`](./BLUEPRINT.md) | **Active progress tracker.** Shipped, in-flight, blockers. Updated weekly. | "What's done? What's next? What's blocking us?" |
| [`PRD.md`](./PRD.md) | **Source of truth for the product.** Vision, audience, pricing, pillars, full backlog. | "What are we building and why? What's the spec?" |
| [`SEO_DRIVERS.md`](./SEO_DRIVERS.md) | **SEO + content strategy.** Keyword clusters, top-20 article queue, GEO playbook, distribution loops. | "What do I write next? What ranks?" |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | **Contributor onboarding.** Setup, branching, PR conventions. | "How do I work in this repo?" |

> Pricing, free-tier limits, and entitlement rules are defined **only** in `PRD.md` §6. If anything elsewhere disagrees, the PRD wins.

---

## Subfolder map

| Folder | Contents |
|---|---|
| [`operations/`](./operations/) | Stripe billing, Email/SMTP, Domain, Vercel, dev environment setup, install guide |
| [`engineering/`](./engineering/) | Architecture-level technical docs: caching, exports, knowledge graph, security audit, auth testing, clip URL capture |
| [`extension/`](./extension/) | Everything browser-extension: architecture, deployment, store submission hub, asset creation, screenshot guides, security, V2 release notes |
| [`design/`](./design/) | Brand system, brand quick reference, homepage visual system |
| [`legal/`](./legal/) | Privacy policy, Chrome Store listing copy, public product description |
| [`analytics/`](./analytics/) | GA4 setup, conversion tracking taxonomy, Search Console submission, analytics strategy |
| [`research/`](./research/) | Raw competitor research (Obsidian Web Clipper assessments) — synthesized into PRD/SEO_DRIVERS but kept for reference |
| [`email-templates/`](./email-templates/) | The actual HTML files used for Supabase auth emails |
| [`migrations/`](./migrations/) | SQL migration files referenced by `operations/STRIPE.md` |

---

## High-traffic pages

If you're new, read these in order:

1. [`BLUEPRINT.md`](./BLUEPRINT.md) — what we just shipped, what's in-flight (10 min)
2. [`PRD.md`](./PRD.md) — the product vision and the backlog (20 min)
3. [`SEO_DRIVERS.md`](./SEO_DRIVERS.md) — how we drive traffic (20 min)
4. [`operations/STRIPE.md`](./operations/STRIPE.md) — how billing works (10 min)
5. [`extension/SUBMISSION_INDEX.md`](./extension/SUBMISSION_INDEX.md) — how the extension ships (10 min)

---

## Operations — go-live & day-2 ops

- **Stripe** → [`operations/STRIPE.md`](./operations/STRIPE.md) (setup, go-live, webhooks, billing portal, comp grants, clip-limit enforcement)
- **Email** → [`operations/EMAIL.md`](./operations/EMAIL.md) (Supabase + SMTP, templates, deliverability, troubleshooting)
- **Domain** → [`operations/DOMAIN_SETUP.md`](./operations/DOMAIN_SETUP.md)
- **Vercel** → [`operations/VERCEL.md`](./operations/VERCEL.md)
- **Dev env** → [`operations/DEVELOPMENT_SETUP.md`](./operations/DEVELOPMENT_SETUP.md)
- **End-user install** → [`operations/INSTALLATION.md`](./operations/INSTALLATION.md) *(internal copy; the user-facing copy lives in `apps/extension/downloads/` and `apps/web/public/extension/downloads/` and is shipped in the install zip)*

## Engineering — implementation references

- **Architecture & caching** → [`engineering/CACHING.md`](./engineering/CACHING.md)
- **Knowledge graph** → [`engineering/KNOWLEDGE_GRAPH.md`](./engineering/KNOWLEDGE_GRAPH.md)
- **Exports** → [`engineering/EXPORTS.md`](./engineering/EXPORTS.md)
- **Clip URL capture** → [`engineering/CLIP_URL.md`](./engineering/CLIP_URL.md)
- **Security audit** → [`engineering/SECURITY_AUDIT.md`](./engineering/SECURITY_AUDIT.md)
- **Auth testing** → [`engineering/AUTH_TESTING.md`](./engineering/AUTH_TESTING.md)

## Extension — submission, deployment, QA

- **Submission hub** → [`extension/SUBMISSION_INDEX.md`](./extension/SUBMISSION_INDEX.md)
- **Submission quickstart** → [`extension/SUBMISSION_QUICKSTART.md`](./extension/SUBMISSION_QUICKSTART.md) (3–5h, do-it-once)
- **Submission deep-guide** → [`extension/SUBMISSION_GUIDE.md`](./extension/SUBMISSION_GUIDE.md)
- **Submission checklist** → [`extension/SUBMISSION_CHECKLIST.md`](./extension/SUBMISSION_CHECKLIST.md)
- **Architecture** → [`extension/ARCHITECTURE.md`](./extension/ARCHITECTURE.md)
- **Deployment** → [`extension/DEPLOYMENT.md`](./extension/DEPLOYMENT.md)
- **Testing** → [`extension/TESTING.md`](./extension/TESTING.md), [`extension/SESSION_TESTING.md`](./extension/SESSION_TESTING.md)
- **Asset creation** → [`extension/ASSETS_CREATION.md`](./extension/ASSETS_CREATION.md), [`extension/SCREENSHOT_GUIDES_INDEX.md`](./extension/SCREENSHOT_GUIDES_INDEX.md)
- **Knowledge graph screenshots** → [`extension/KNOWLEDGE_GRAPH_SCREENSHOT_GUIDE.md`](./extension/KNOWLEDGE_GRAPH_SCREENSHOT_GUIDE.md)
- **Security update** → [`extension/SECURITY_UPDATE.md`](./extension/SECURITY_UPDATE.md)
- **V2 release notes** → [`extension/V2_RELEASE.md`](./extension/V2_RELEASE.md)
- **Firefox data-collection fix** → [`extension/FIREFOX_DATA_COLLECTION_FIX.md`](./extension/FIREFOX_DATA_COLLECTION_FIX.md)
- **UI/UX critiques** → [`extension/UI_CRITIQUE.md`](./extension/UI_CRITIQUE.md), [`extension/USABILITY_ASSESSMENT.md`](./extension/USABILITY_ASSESSMENT.md)

## Design — brand & visual system

- **Brand system** → [`design/BRAND.md`](./design/BRAND.md)
- **Brand quick reference** → [`design/BRAND_QUICK_REF.md`](./design/BRAND_QUICK_REF.md)
- **Homepage visual system** → [`design/HOMEPAGE_VISUAL.md`](./design/HOMEPAGE_VISUAL.md)

## Legal & store assets

- **Privacy policy** → [`legal/PRIVACY_POLICY.md`](./legal/PRIVACY_POLICY.md)
- **Chrome Store listing copy** → [`legal/CHROME_STORE_LISTING.md`](./legal/CHROME_STORE_LISTING.md)
- **Public product description** → [`legal/PRODUCT_DESCRIPTION.md`](./legal/PRODUCT_DESCRIPTION.md)

## Analytics

- **Conversion tracking** → [`analytics/CONVERSION_TRACKING.md`](./analytics/CONVERSION_TRACKING.md) ⭐
- **Quick start** → [`analytics/QUICK_START.md`](./analytics/QUICK_START.md)
- **Strategy** → [`analytics/STRATEGY.md`](./analytics/STRATEGY.md)
- **GA4 dashboard setup** → [`analytics/GA4_DASHBOARD_SETUP.md`](./analytics/GA4_DASHBOARD_SETUP.md)
- **Search Console** → [`analytics/SEARCH_CONSOLE.md`](./analytics/SEARCH_CONSOLE.md)

## Research (raw, kept for reference)

- **Obsidian Web Clipper — product assessment** → [`research/obsidian-web-clipper-product-assessment.md`](./research/obsidian-web-clipper-product-assessment.md) (synthesized into [PRD](./PRD.md) backlog and Obsidian-bridge feature)
- **Obsidian Web Clipper — SEO assessment** → [`research/obsidian-web-clipper-seo-assessment.md`](./research/obsidian-web-clipper-seo-assessment.md) (synthesized into [SEO_DRIVERS](./SEO_DRIVERS.md) Top 20 article queue and competitor pages)

---

## Conventions

- **`PRD.md` is the spec.** PRs that ship features should reference a backlog item in PRD by ID.
- **`BLUEPRINT.md` is the changelog.** When a PR ships, move the item from "in-flight" to "shipped" with a date.
- **`SEO_DRIVERS.md` is the editorial calendar.** When an article ships, check it off the Top-20 queue and add the URL.
- **One canonical doc per topic.** If you find yourself writing a second Stripe doc, edit `operations/STRIPE.md` instead.
- **Old `*_COMPLETE.md` / `*_SUMMARY.md` / `*_QUICK_START.md` patterns are banned.** Notes on what was just shipped go in `BLUEPRINT.md` "Shipped recently"; reference docs go in the relevant subfolder.

---

## What was here before

This index replaces a sprawl of 100+ markdown files across `docs/`. The full reorganization happened in April 2026:

- 3 canonical docs were authored (`BLUEPRINT.md`, `PRD.md`, `SEO_DRIVERS.md`)
- 6 tech subfolders were created
- ~57 superseded docs were deleted (their content was either captured in the canonical docs or merged into the subfolder docs)
- 2 raw research docs from `assessments/` moved to `research/`
- Top-level `Reviews1.md` and `Reviews2.md` (raw scraped competitor reviews) deleted after synthesis

If you need to recover something, `git log -- docs/` will surface what existed before.

*Last updated: April 2026*
