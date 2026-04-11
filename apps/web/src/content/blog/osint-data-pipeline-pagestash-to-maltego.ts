import { BlogPost } from '@/types/blog'

export const osintDataPipelinePagestashToMaltego: BlogPost = {
  slug: 'osint-data-pipeline-pagestash-to-maltego',
  title: 'Building an OSINT Data Pipeline: From Web Capture to Maltego',
  description:
    'From web pages to Maltego: capture with PageStash, export entities as CSV/JSON, feed Maltego, i2, or SpiderFoot—structured data from unstructured HTML.',
  excerpt:
    'Design a capture-extract-export pipeline so Maltego and similar platforms get clean entities from real web sources.',
  author: 'PageStash Team',
  publishedAt: '2026-04-11T11:30:00Z',
  readingTime: 7,
  category: 'guides',
  tags: ['OSINT', 'Maltego', 'data-pipeline', 'entity-extraction', 'intelligence', 'PageStash'],
  featuredImage:
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
## The problem: Maltego wants entities; the web gives prose

**Maltego**, **IBM i2**, **SpiderFoot**, and similar platforms excel at **relating** **entities**—domains, persons, organizations, infrastructure. The **open web** rarely arrives that way. Analysts lose time **manually** copying **handles** and **addresses** out of articles, forum threads, and paste-style pages.

A solid **OSINT data pipeline** fixes the handoff: **capture** the source, **extract** machine-friendly fields, **export** in formats your tools ingest, and **retain** a **citation** back to the original clip.

## Layer 1: Capture with provenance

Use **PageStash** as the **ingestion layer**. The **Chrome** and **Firefox** extensions save **full-page context** (HTML and screenshot) so you are not working from memory when a page changes.

For each clip, enforce a minimum metadata habit:

- **Case or project tag** (consistent naming for exports later).
- **Source type** (news, forum, corporate, paste, social web view).
- **Notes** for **why** the clip exists—future you will not remember.

## Layer 2: Entity extraction without bespoke parsers

**PageStash** runs **entity extraction** across saved content: **email addresses**, **IP addresses**, **cryptocurrency addresses**, **social handles**, **organization-like strings**, **people-like strings**, and **dates**. That is the bridge from **unstructured HTML** to **rows and columns** your graph or SOAR-adjacent workflows can use.

You still **validate** extractions—regex and NER-style signals produce **false positives**. The win is **coverage**: you see **candidates** tied to a **specific capture**, not a loose sticky note.

## Layer 3: Export shapes that tools accept

**PageStash** exports to **CSV**, **JSON**, **Markdown**, and **HTML** with **entity data** included. In practice:

- **CSV** lands fastest in **spreadsheets** and simple **Maltego** transforms that read tabular input.
- **JSON** fits **custom loaders**, **SOAR playbooks**, and **ETL** scripts where you need nested fields.
- **Markdown** helps **human-readable** case files in **Obsidian** or **Notion** while still listing entities.

Map columns or keys to the **entity types** your graph platform expects (Domain, Email, BTC Address, etc.). Keep a **source URL** or **clip ID** column—**provenance** is non-negotiable for **intelligence** and **compliance** reviews.

**Concrete CSV habits:**

- One row per **entity occurrence** if you need **granular** source linkage, or one row per **entity** with a **semicolon-separated** source list if your tool prefers **deduped** nodes.
- Include **entity_type**, **value**, **source_url**, **captured_at**, **case_tag** at minimum.
- Normalize **handles** (\`@user\` vs bare user) **before** import so transforms do not **fork** duplicates.

## Maltego, i2, SpiderFoot: same pipe, different spigots

**Maltego** often ingests **CSV** through transforms or **copy-paste** **entities** from spreadsheets. **IBM i2** analysts frequently load **tabular** **feeds** produced by **ETL** from exports. **SpiderFoot** and similar **automation** tools accept **JSON** or **CSV** **indicators** for **correlation** jobs.

You are not locked into one destination: **PageStash** is the **shared upstream** so **Maltego** sessions and **spreadsheet** QA use the **same** **extracted** values tied to the **same** clips.

## QA before you run expensive transforms

- **Spot-check** ten random **entities** against the **source clip**.
- **Deduplicate** obvious **scanner noise** (banner **IPs**, **CDN** hosts) if your case does not need them.
- **Version** your export file name (\`caseA_entities_2026-04-11.json\`) so **reports** cite the **correct** extract.

## When unstructured pages are “messy”

**Forums**, **chat web clients**, and **infinite-scroll** feeds clip **cleanest** after you **stabilize** the DOM: pause **animations**, **expand** **“read more”** blocks where policy allows, and **scroll** until **relevant** replies load. The **pipeline** still works—the **quality** of **extraction** tracks **what** landed in **HTML**.

## Operational metrics for teams

Track **time-to-export** from **first clip** to **Maltego-ready** CSV. If **bottleneck** is **tagging**, tighten **tag** **rules**. If **bottleneck** is **false positives**, add a **human** **review** **gate** before **import**. **PageStash** shortens **capture** and **extraction**; **process** still wins **investigations**.

## Layer 4: Graph thinking inside PageStash first

Before you push everything to Maltego, use **PageStash** knowledge-graph views to see **co-occurrence**: which **entities** repeatedly appear in the **same clips** or **tag clusters**. That **prunes noise** and tells you which pivots deserve **transform** time.

## Closing the loop after Maltego

When a **transform** surfaces a **new** **domain** or **alias**, **clip** the **public** page that **confirms** or **denies** it and **merge** that **capture** back into **PageStash**. The **pipeline** is **round-trip**: **web → extract → graph tool → web → archive**. Without **re-ingestion**, **graph** findings **float** **unattached** to **sources** your **team** can **audit**.

## Ethics and responsibility

Collect and process **only** data you may lawfully handle. Do not use pipelines to **amplify** harassment, **doxing**, or **unauthorized** access. **Document** purpose, **minimize** retention of sensitive **PII**, and align with **organizational policy** and **jurisdiction**.

## Takeaway

**PageStash** is the **database** between **the browser** and **Maltego-class tools**: **capture** web truth, **extract** entities, **export** structured feeds, **graph** early to focus pivots. That is how teams scale **OSINT** without sacrificing **traceability**. Treat every **export** as a **reproducible** **slice** of your **archive**, not a **one-off** spreadsheet you **cannot** tie back to **source** pages.

**Wire up your pipeline**—clip your next high-signal page, review extracted entities, and export a **JSON** or **CSV** slice for your graph platform. **[Get started with PageStash →](/auth/signup)**
`,
}
