# Google Search Ads — $100 Acquisition Experiment

> **Goal:** Validate which keyword clusters convert free signups. Not to scale — tight structure + conversion tracking is everything.
>
> For keyword cluster definitions, see [`SEO_DRIVERS.md`](./SEO_DRIVERS.md). For product positioning, see [`PRD.md`](./PRD.md).

---

## TL;DR

$100 at ~$1.25 avg CPC = ~80 clicks. With a 20–25% free-signup rate, that's **16–20 new users**. The goal is to validate which keyword clusters actually convert before earning organic rank.

---

## Why Search Ads > anything else at this budget

- You only pay for people who searched with intent — no wasted impressions on disinterested scroll-bys
- Competitor displacement queries ("pocket alternative") have extremely high commercial intent — these people are already in buying mode
- GSC shows 386 impressions on "best web research tools" with 0 clicks — paid ads can test whether the audience converts before you earn organic rank

---

## Campaign Structure

**Campaign name:** PageStash — Acquisition Test  
**Total budget:** $100  
**Daily budget:** $7/day (~2 weeks)  
**Geo:** US, UK, Canada, Australia (English-speaking, highest LTV)  
**Devices:** All — bid **-20% on mobile** (extension install is a desktop action)  
**Match type:** **Phrase match only** — broad match will burn through $100 in 2 days  
**Bid strategy:** Manual CPC for first 7 days; switch to Target CPA once 10+ conversions logged

---

## Ad Group 1 — Competitor Displacement (~$60)

These people are actively churning from a competitor. Highest intent you can buy.

| Keyword | Est. CPC | Why |
|---|---|---|
| `"pocket alternative"` | $1.50 | Pocket shutting down — extremely high intent right now |
| `"instapaper alternative"` | $1.00 | Loyal read-later audience |
| `"evernote web clipper alternative"` | $1.75 | Evernote rage-churners, high LTV |
| `"raindrop alternative"` | $0.90 | Bookmark manager churners |
| `"readwise reader alternative"` | $0.80 | PKM-savvy, ideal ICP |

### Ad copy

> **Headline 1:** Pocket Alternative for Research  
> **Headline 2:** Save Full Pages + Export Markdown  
> **Headline 3:** Free to Try · Works with Obsidian  
> **Description:** Archive the full page — screenshot, text, HTML. Export .md to Obsidian or any notes app. 10 free clips, no card needed.

**Destination URL:** `https://www.pagestash.app/?utm_source=google&utm_medium=cpc&utm_campaign=acquisition&utm_content=competitor`

---

## Ad Group 2 — Extension Install Intent (~$40)

People explicitly looking for a browser extension, not a web app.

| Keyword | Est. CPC | Why |
|---|---|---|
| `"web clipper extension"` | $1.00 | Direct category match |
| `"chrome web clipper"` | $0.75 | High volume, cheap |
| `"save web pages permanently"` | $1.25 | Exact product promise |
| `"web clipping tool"` | $1.00 | Category buyer |
| `"save webpage as markdown"` | $0.60 | Strategic wedge — very qualified |

### Ad copy

> **Headline 1:** Web Clipper Chrome Extension  
> **Headline 2:** One-Click Capture · Screenshot + Text  
> **Headline 3:** Export .md · Works Offline · Free  
> **Description:** Save the full page — not just the link. Full-page screenshot, text, raw HTML. Exports to Markdown for Obsidian. Install in 2 minutes.

**Destination URL:** `https://www.pagestash.app/?utm_source=google&utm_medium=cpc&utm_campaign=acquisition&utm_content=extension`

---

## Pre-launch checklist (do this before spending a dollar)

- [ ] Create Google Ads account and link to GA4
- [ ] Set up conversion action: `signup_complete` on `/auth/register` success page
- [ ] Create 1 campaign, 2 ad groups as above
- [ ] Add all negative keywords (see below) before enabling
- [ ] Set daily budget: $7/day, phrase match only, manual CPC
- [ ] Set device bid adjustment: -20% mobile
- [ ] Confirm UTM parameters on all destination URLs
- [ ] Submit landing page URL to Google Ads preview tool — verify load speed

### Negative keywords (add immediately)

```
free, crack, torrent, jobs, salary, stock, minecraft, game, reddit, youtube,
notion, template, download, pdf, how to, tutorial, course, learn
```

> **Note:** Remove `-notion` if you later add an Obsidian/Notion comparison ad group.

---

## How to read results after $100

| Signal | What it means | Action |
|---|---|---|
| CPC > $3 | Keyword too competitive for this budget | Pause it |
| CTR < 2% | Ad copy not matching intent | Rewrite Headline 1 |
| Signup rate < 10% of clicks | Landing page mismatch or free tier friction | A/B test homepage hero |
| Ad Group 1 outperforms Ad Group 2 | Double down on competitor displacement | Reallocate budget in round 2 |
| `"save webpage as markdown"` converts > 25% | This is your scalable wedge | Invest heavily here in round 2 |

---

## Round 2 (if round 1 breaks even or better)

Take the top 2 converting keywords, raise daily budget to $15/day, and add a third ad group:

**Ad Group 3 — Obsidian / PKM Wedge**

| Keyword | Est. CPC |
|---|---|
| `"obsidian web clipper"` | $0.70 |
| `"clip web page to obsidian"` | $0.60 |
| `"web clipper markdown"` | $0.65 |
| `"pkm web clipper"` | $0.55 |

These are Cluster A from `SEO_DRIVERS.md` — the strategic wedge. Paid ads here compound with organic content ranking on the same terms.

---

## Measurement

Track these in GA4 / Google Ads after the experiment ends:

| Metric | Target |
|---|---|
| Cost per signup (CPS) | < $6 |
| Signup → 7-day retention | > 40% |
| Signup → Pro conversion (30 days) | > 5% |
| Best-performing keyword | Carry into round 2 |
| Worst-performing keyword | Add to negative list |

---

*Created: April 2026*  
*Budget: $100 pilot*  
*Owner: @mrmcow*
