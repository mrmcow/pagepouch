import { BlogPost } from '@/types/blog'

export const archiveCandidateProfilesRecruiting: BlogPost = {
  slug: 'archive-candidate-profiles-future-job-openings',
  title: 'How to Archive Candidate Profiles for Future Job Openings',
  description: 'The practical recruiter\'s guide to archiving candidate profiles so you can resurface great people when the right role opens. Tools, folder structure, and privacy considerations.',
  excerpt: 'Practical guide to archiving candidate profiles — tools, folder structure, and how to surface great people when the right role opens.',
  author: 'PageStash Team',
  publishedAt: '2026-04-18',
  readingTime: 8,
  category: 'use-cases',
  tags: ['recruiting', 'talent-management', 'candidate-profiles', 'hr', 'research-organization'],
  featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# How to Archive Candidate Profiles for Future Job Openings

You interviewed a strong candidate last quarter. They weren't the right fit for the role at the time, but they were impressive. Six months later, you have a new opening that would be perfect for them.

Can you find them?

For most recruiters, the honest answer is no. The profile is somewhere in LinkedIn, the notes are in a doc they can't locate, and the context from the original conversation has faded.

This guide shows you how to build a candidate archive that works — so you can surface the right person six months or two years later.

---

## Why browser bookmarks and LinkedIn saved profiles fail

**LinkedIn saved profiles:** LinkedIn removes profiles, candidates update details, your "saved" list becomes a graveyard of changed URLs and outdated information. You can't add your own notes. You can't search across everything you've saved.

**Browser bookmarks:** No notes, no tags, no search. Clicking through 200 bookmarks to find someone is not a system.

**Spreadsheets:** Better, but text-only. No preserved page content. No ability to search *inside* a profile. Manual entry is slow and error-prone.

**What works:** A tool that captures and preserves the profile page as it looked when you found the candidate, with your notes attached, searchable.

---

## The right tool for candidate archiving

A web clipper built for research gives you:
- **Full-page capture** — saves the profile as it appears today, even if LinkedIn updates the layout or the person changes it later
- **Your notes attached** — add context: "Strong eng manager background, preferred remote, said they'd be open to head of product roles"
- **Searchable** — search across all archived profiles by skill, role, company, or any text on the page
- **Organized** — folders by role type, level, or pipeline stage

**[PageStash](/auth/signup)** does all of this. One-click browser extension captures any web page — LinkedIn profiles, personal sites, portfolio pages, GitHub profiles, Twitter/X bios — with full content preservation and your annotations.

---

## Setting up your candidate archive: folder structure

You don't need a complex system. Here's a simple structure that scales:

### By role type (recommended starting point)


    Candidates/
    ├── Engineering/
    │   ├── Senior/
    │   └── IC/
    ├── Product/
    ├── Design/
    ├── Marketing/
    ├── Sales/
    └── Operations/


### By pipeline status (use tags, not folders)

Tag each candidate with:
- "strong-pipeline" — top candidates to resurface first
- "timing-issue" — great candidate, wrong time
- "passive" — not looking but worth a warm ping
- "declined" — said no; note why
- "hired-elsewhere" — hired by a competitor

### By when to follow up

Tags like "follow-up-q1-2026", "follow-up-q3-2026" let you filter by when to re-engage.

---

## What to capture for each candidate

**Minimum viable record:**
- LinkedIn profile page (full capture, not just the URL)
- Your notes on the interview / initial call: strengths, concerns, what they're looking for
- Role they applied for / were sourced for
- Date of capture

**Enhanced record:**
- GitHub profile or portfolio (separate clip)
- Their published work — articles, talks, case studies (clips from the web)
- Company they work at now (clip the company's About / team page)
- The specific job opening they were assessed for (clip the job description)

The goal: when you re-open this candidate six months later, you have the full context in one place without needing to reconstruct it.

---

## The capture workflow

### For active candidates

1. Open their LinkedIn profile (or personal site, GitHub, etc.)
2. Click the PageStash extension icon
3. Add notes in the Notes field: interview summary, strengths, context, follow-up timing
4. Tag appropriately ("engineering", "senior", "strong-pipeline", etc.)
5. Save

Takes 90 seconds per candidate.

### For passive sourcing

1. You're browsing LinkedIn, GitHub, or a conference speaker list
2. See a profile that's interesting for a future role
3. One-click clip with a single note: "Potential head of design — watch for when we scale the team"
4. Tag: "passive", "design", "vp-level"

You've made a note that will survive your next browser session, LinkedIn's UI changes, and the candidate updating their profile.

---

## Searching your archive

Six months later, you have a backend engineering role. Open PageStash and search:

- ""distributed systems"" → finds everyone whose profile mentioned this
- Tag filter: "engineering" + "strong-pipeline" → top candidates for this cluster
- Keyword search: ""Go"" or ""Kubernetes"" → surfaces mentions from profile text

This is the part bookmarks can't do. Full-text search across the *content* of saved profiles, not just titles.

---

## Privacy and compliance considerations

**Important:** Candidate data retention laws vary by jurisdiction. GDPR (EU), CCPA (California), and other privacy frameworks impose obligations on how long you retain candidate data and whether candidates have the right to request deletion.

**Practical guidance:**
- Keep candidate archives in a private, access-controlled tool (not a shared folder or public bookmark list)
- Respect candidates' preferences — if someone asks not to be contacted, remove them from your archive
- Review your retention policy annually — most organizations retain candidate records for 12–24 months after an application, depending on jurisdiction
- This article is not legal advice. Consult your HR or legal team for jurisdiction-specific guidance.

PageStash data is private to your account. No one else sees your candidate archive.

---

## Managing your archive long-term

**Monthly (10 min):** Add the "follow-up-q[X]-[year]" tag to anyone you want to resurface in the coming quarter. Review anyone tagged for this month.

**Quarterly (30 min):** Audit the "strong-pipeline" folder. Have they changed companies or roles? Re-clip their updated profile with a note. Remove people who are clearly no longer relevant.

**Before each new hire:** Before opening a job, search your archive for candidates in the relevant role type. You'll frequently find 2–3 people worth reaching out to before you even post the job description.

---

## FAQ

**What's the best tool for archiving candidate profiles?**
For archiving the full page content with searchable notes, a web clipper like PageStash. For structured candidate tracking with team workflows, an ATS (Applicant Tracking System) like Lever, Greenhouse, or Ashby. The two complement each other: PageStash for personal sourcing and research archives, ATS for the formal hiring process.

**Can I clip LinkedIn profiles?**
Yes. PageStash captures the visible content of any web page you're viewing. Just navigate to the profile and click the extension icon. Note: if a profile is behind a connection paywall you can't see, you can't capture it.

**How long should I keep candidate archives?**
This depends on your jurisdiction and organization's HR policy. Common practice is 12–24 months. Review with your legal or HR team.

---

[Build your searchable candidate archive — start free →](/auth/signup)
`
}
