REQUIREMENTS

PageStash

Implementation Plan 

Perfect — here’s a flat backlog you can drop directly into a project board (Linear / Jira / Notion / Cursor). I’ve expanded each epic into tasks with acceptance criteria so they’re dev-ready. I’ve also grouped by Frontend (FE), Backend (BE), and Extension (EXT).

⸻

🗂 Dev-Ready Backlog

⸻

Epic 1 – Browser Extension (Capture Engine)

Task 1.1 – Add toolbar button (EXT)
	•	Acceptance: User sees extension icon in toolbar. Clicking triggers save flow.

Task 1.2 – Capture screenshot (EXT)
	•	Use chrome.tabs.captureVisibleTab.
	•	Acceptance: Captured image stored in memory before upload.

Task 1.3 – Capture full page scroll (EXT)
	•	Implement scroll stitching.
	•	Acceptance: Long pages result in complete screenshot.

Task 1.4 – Extract page HTML/text (EXT)
	•	Grab document.documentElement.outerHTML.
	•	Parse readable text (strip scripts).
	•	Acceptance: Saved object contains both raw HTML + plain text.

Task 1.5 – Collect metadata (EXT)
	•	Gather URL, title, timestamp, favicon.
	•	Acceptance: Each saved clip includes metadata automatically.

Task 1.6 – Minimal popup UI (EXT/FE)
	•	Fields: Folder select (dropdown), Tags (chips), Note (textarea).
	•	Acceptance: User can edit before saving OR ignore (defaults to Inbox).

⸻

Epic 2 – Cloud Sync & Storage

Task 2.1 – Create clips table (BE)
	•	Fields: id, user_id, url, title, timestamp, folder_id, screenshot_path, html_path.
	•	Acceptance: Schema deployed in Supabase.

Task 2.2 – Create folders + tags tables (BE)
	•	Folders: id, user_id, name.
	•	Tags: id, user_id, name.
	•	Join table: clip_id, tag_id.
	•	Acceptance: User can own multiple folders/tags.

Task 2.3 – API endpoint for saving clips (BE)
	•	REST endpoint: POST /clips.
	•	Handles screenshot upload + metadata.
	•	Acceptance: Extension can POST successfully.

Task 2.4 – Integrate Supabase Storage for screenshots (BE)
	•	Acceptance: Screenshot accessible via signed URL.

⸻

Epic 3 – Web App: Library View

Task 3.1 – Library grid view (FE)
	•	Card per clip: screenshot, title, URL.
	•	Acceptance: User can scroll and see all their clips.

Task 3.2 – Clip detail page (FE)
	•	Shows screenshot, metadata, raw text, notes, tags.
	•	Editable tags/notes.
	•	Acceptance: User can view/edit details.

Task 3.3 – Folder sidebar navigation (FE)
	•	List folders on left.
	•	Clicking shows only that folder’s clips.
	•	Acceptance: Folder filtering works.

Task 3.4 – Drag/drop organization (FE)
	•	Move clips between folders.
	•	Acceptance: Drag to folder updates DB.

⸻

Epic 4 – Search & Retrieval

Task 4.1 – Implement Postgres full-text search (BE)
	•	Add tsvector column on clips (scraped text).
	•	Acceptance: Query returns matching clips.

Task 4.2 – Search bar in UI (FE)
	•	Typing keyword shows results instantly.
	•	Acceptance: Partial matches appear live.

Task 4.3 – Filter by tags/folders (FE)
	•	Tag chips above results.
	•	Acceptance: Clicking tag filters down.

⸻

Epic 5 – Authentication & Accounts

Task 5.1 – Supabase Auth integration (BE/FE)
	•	Support Google + email sign-in.
	•	Acceptance: User can register/login seamlessly.

Task 5.2 – Auth in extension (EXT)
	•	Shared token from web app.
	•	Acceptance: Extension identifies correct user.

⸻

Epic 6 – User Delight & Minimalism

Task 6.1 – Remember last folder/tags (EXT)
	•	Store local preference.
	•	Acceptance: Next clip pre-fills last choice.

Task 6.2 – UI polish & animations (FE)
	•	Tailwind + shadcn + Framer Motion.
	•	Acceptance: Smooth transitions; app feels joyful.

⸻

Epic 7 – Launch Readiness

Task 7.1 – Free tier quota (BE)
	•	Limit: 100 clips/month.
	•	Acceptance: Quota enforced; banner appears when exceeded.

Task 7.2 – Stripe integration for Pro (BE/FE)
	•	$5–7/month plan.
	•	Acceptance: Upgrade flow works; user’s quota removed.

Task 7.3 – Landing page (FE)
	•	Hero section: “Save the web in one click.”
	•	CTA: Install extension.
	•	Acceptance: Page deployed on Vercel with branding.

⸻

✅ Acceptance Criteria Principles
	•	Every feature works with one click or less friction.
	•	Defaults → Inbox folder if user skips.
	•	UI must favor screenshot preview (primary anchor).
	•	Web + extension must stay in sync without manual refresh.

⸻

👉 This is essentially a dev-ready backlog. You can break each task down further with time estimates (e.g., “2 points” or “half-day”).

Would you like me to map this into a timeline (2–4 week MVP sprints) so you can see the order of execution?

Great idea — let’s turn this into something concrete. I’ll break it down into vision, requirements, competitor scan, and implementation approach so you have a foundation for planning and execution.

⸻

🎯 Vision

You want to create a browser extension + web app that allows users (especially threat intelligence analysts) to:
	•	Clip the web (screenshot + HTML scrape of a page).
	•	Organize clips into folders with tags, notes, and comments.
	•	Search & retrieve later with full-text search across scraped content.
	•	Keep it fun, light, and frictionless — a utility people use daily without overthinking.

The differentiator: ridiculously simple UX that prioritizes capturing over configuration, with a brand that feels neutral and playful rather than corporate or security-heavy.

⸻

📋 Core Requirements

Browser Extension
	•	Capture features:
	•	Full-page screenshot.
	•	Raw HTML scrape + text extraction.
	•	Metadata capture: URL, title, timestamp, favicon.
	•	Interaction:
	•	One-click “Clip this page.”
	•	Quick option to add tags/notes before saving.
	•	Select folder destination.

Web App
	•	Content management:
	•	Folder + tagging system.
	•	Notes/comments on saved pages.
	•	Preview: screenshot on top, text underneath.
	•	Search:
	•	Full-text search across scraped content.
	•	Filter by tags/folders.
	•	Collaboration (later stage):
	•	Optional sharing with team members.
	•	Threaded comments.

Backend
	•	Storage:
	•	Cloud DB (Supabase, Firebase, or cheap Postgres).
	•	Blob storage for screenshots (Supabase storage or S3).
	•	Indexing:
	•	Lightweight full-text search (Postgres tsvector, Meilisearch, or Elastic if needed later).
	•	APIs:
	•	REST or GraphQL endpoint to sync clips.

⸻

🕵 Competitor Scan

Some existing players in this space include:
	•	Evernote Web Clipper – Full-featured, but bloated. Targeted at general productivity.
	•	Raindrop.io – Polished bookmarking with screenshots, tags, and folders. Great UI, but more general-purpose.
	•	Memex – Focused on researchers/analysts; strong search across saved pages. Pricing: ~$5–10/mo.
	•	Walling.app / Milanote – More like visual workspaces with clipping.
	•	Pocket – Reading later, less about screenshots/scraping.

Your angle:
Instead of broad productivity, focus narrowly on analysts:
	•	Speed of capture.
	•	Trustworthy archiving of what was seen at a point in time (important for threat intel).
	•	Ridiculous simplicity in tagging and organizing.

⸻

💵 Pricing Landscape
	•	Raindrop: $3/mo (personal) → $28/yr.
	•	Memex: ~$5–10/mo.
	•	Evernote: freemium, $10+/mo.
	•	Pocket: freemium, $5/mo premium.

👉 For MVP: Free tier (limited storage) + Pro ($5–7/mo) is standard and sustainable. Analysts will pay if you offer reliability, search, and permanence.

⸻

⚙️ Implementation Approach

Phase 1 – MVP (2–4 weeks)
	•	Build browser extension (Chrome/Edge/Brave/Firefox).
	•	Implement screenshot capture (using chrome.tabs.captureVisibleTab or headless backend capture for full-page).
	•	Scrape page HTML + text (using document.documentElement.outerHTML).
	•	Save to Supabase (DB + storage).
	•	Simple web app to browse/search saved clips.
	•	Tagging + folder assignment on capture.

Phase 2 – Enhancements
	•	Full-text search across all stored HTML.
	•	Notes/comments UI.
	•	Better screenshot rendering (full page, scroll stitching).
	•	Multi-user accounts.

Phase 3 – Analyst Features
	•	Team folders, collaborative notes.
	•	Export clips (PDF, CSV, JSON).
	•	Threat intel integrations (STIX/TAXII feeds, API hooks).

⸻

🏗 Tech Stack (fast + cheap)
	•	Extension: JavaScript/TypeScript, Manifest V3.
	•	Web app: Next.js + Supabase.
	•	Storage: Supabase (DB + storage).
	•	Search: Supabase full-text (later Meilisearch if needed).
	•	Auth: Supabase Auth (social logins, email).
	•	Infra: Deploy frontend on Vercel (free tier), backend lives in Supabase.


Names for Erin app 

Perfect — let’s get extremely crisp on requirements and then explore brand naming across a few different creative directions. I’ll treat this like a proper product kickoff so you have something that could turn into a spec + backlog.

⸻

📋 Requirements Specification

🎯 Core Objective

A browser extension + web app that allows analysts and knowledge workers to:
	•	Capture full-page screenshots + HTML/text content of any webpage.
	•	Organize clips into folders/tags with optional notes.
	•	Retrieve clips via powerful but simple search.

The guiding principles:
	•	Ridiculous simplicity → one-click clipping, zero friction.
	•	Delightful branding → fun, neutral, approachable.
	•	Reliability → always capture what the analyst saw at the moment.

⸻

🖥 Browser Extension (MVP)
	•	One-click capture button (toolbar).
	•	Capture types:
	•	Full-page screenshot.
	•	Page HTML/text scrape.
	•	Auto-collect metadata: URL, title, timestamp, favicon.
	•	Save flow:
	•	Default save → “Inbox” folder.
	•	Optional quick add: folder, tags, note.
	•	Sync to web app via Supabase API.

⸻

🌐 Web App (MVP)
	•	Authentication: Supabase Auth (email, Google).
	•	Content Library:
	•	View saved clips (screenshot preview + metadata).
	•	Organize into folders.
	•	Add/edit tags and notes.
	•	Search:
	•	Full-text search across page text.
	•	Filter by tags/folders.
	•	UI style:
	•	Minimal, card/grid view.
	•	Screenshots as anchors.

⸻

🔧 Backend
	•	Database: Supabase Postgres (users, clips, tags, folders).
	•	Storage: Supabase Storage (screenshots).
	•	Search: Postgres FTS for MVP.
	•	API: REST endpoints exposed to extension and web app.

⸻

🚀 Future Roadmap
	•	Multi-user/team sharing.
	•	Annotation/markup on saved screenshots.
	•	Export formats (PDF/CSV/JSON).
	•	Integration with threat intel formats (STIX/TAXII).
	•	Browser automation workflows (later).
