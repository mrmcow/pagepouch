import { BlogPost } from '@/types/blog'

export const managingRecruitmentArchives: BlogPost = {
  slug: 'managing-recruitment-archives',
  title: 'Managing Recruitment Archives: A System for Talent Teams',
  description: 'How to manage recruitment archives and candidate files so your talent team can resurface great people, track sourcing history, and stay organized across multiple roles.',
  excerpt: 'How to manage recruitment archives so you can resurface great candidates, track sourcing history, and stay organized across multiple roles.',
  author: 'PageStash Team',
  publishedAt: '2026-04-18',
  readingTime: 7,
  category: 'use-cases',
  tags: ['recruiting', 'recruitment-archives', 'file-management', 'talent-acquisition', 'hr'],
  featuredImage: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&h=600&fit=crop&auto=format',
  featured: false,
  content: `
# Managing Recruitment Archives: A System for Talent Teams

Most recruiting teams lose candidates they shouldn't. Not because the candidates stopped being good — because the recruiter's notes are in five different places and the profile they saved is either gone or out of date.

This guide covers what a functional recruitment archive looks like, how to build one, and how to manage candidate files so good people don't fall through the cracks.

---

## What a recruitment archive contains

A recruitment archive is a searchable record of every meaningful candidate you've engaged with — whether they applied, were sourced, referred, or found on LinkedIn during a background search.

Each record should contain:
- **Who:** Name, role, current employer, contact info
- **When:** Date of first contact, last touchpoint, follow-up timing
- **What you found:** A captured copy of their profile/portfolio as it looked when you found them
- **Your assessment:** Notes from conversations, interview feedback, concerns, strengths
- **Status:** Active pipeline / passive / timing issue / declined / hired elsewhere

This is different from an ATS (Applicant Tracking System). An ATS tracks formal applicants through a structured hiring process. A recruitment archive is your personal sourcing library — the people you've found and assessed before they enter a formal process, and the strong candidates who didn't make it this time but should be reconsidered.

---

## Why most teams don't have a functional archive (and what to do about it)

**Problem 1: Profiles change and disappear**

LinkedIn profiles update. Company websites change. Portfolios move. The URL you bookmarked 8 months ago either 404s or shows a completely different person now.

**Fix:** Capture the profile page at the time you find it, not just the URL. A web clipper like [PageStash](/auth/signup) saves the full page as it appears today.

**Problem 2: Notes live in too many places**

Interview notes in Google Docs, summary emails in Gmail, assessments in Slack DMs, ratings in Notion. When you need to resurface a candidate, you spend 20 minutes piecing together the history.

**Fix:** One canonical record per candidate. Notes attached directly to the captured profile.

**Problem 3: No searchable tagging**

Spreadsheets can hold data, but searching "senior engineers with distributed systems experience who weren't available in Q3 2025" is not a spreadsheet query.

**Fix:** Tags that you can filter and full-text search across profile content.

**Problem 4: Team handoffs break the chain**

Recruiter leaves. New recruiter starts. The institutional knowledge about candidates walks out with the old recruiter.

**Fix:** A shared, written, searchable archive that doesn't live in one person's head.

---

## Building the system

### Layer 1: Capture profiles on first encounter

The moment you find a candidate worth remembering, capture their profile with your notes. Don't wait until they apply.

With PageStash:
1. Open their profile (LinkedIn, personal site, GitHub, portfolio)
2. Click the extension icon
3. Add your notes: "Sourced for head of eng — strong distributed systems background. Open to remote. Not actively looking but said to check back in Q2." 
4. Tag: "engineering", "senior", "passive", "q2-followup"
5. Save

Takes 90 seconds. That record now persists regardless of what changes on LinkedIn.

### Layer 2: Organize with consistent tags

Agree on a tagging taxonomy with your team. Keep it simple:

**Role type:** "eng", "product", "design", "marketing", "ops", "sales"

**Seniority:** "ic", "senior", "staff", "manager", "director", "vp", "exec"

**Status:** "active", "passive", "timing", "declined", "hired-elsewhere", "do-not-contact"

**Follow-up:** "followup-q1-2026", "followup-q2-2026" etc.

Don't over-tag. Four or five tags per candidate is plenty.

### Layer 3: Regular reviews

**Weekly (5 min):** Add new candidates from active sourcing. Update status on anyone you've spoken to this week.

**Before every new role opens (30 min):** Search your archive before you post a job. Filter by relevant tags. You'll frequently have 2–5 strong candidates already in your system who can be your first outreach, before you even open the public search.

**Quarterly (1 hour):** Audit old records. Update profiles that have changed significantly. Remove people who asked to be removed or who are clearly no longer relevant. Tag new follow-up timing for promising passives.

---

## File management for candidate documents

Beyond profile captures, recruitment typically involves documents:

- CVs / resumes (PDF)
- Work samples (PDF, links)
- Reference contacts
- Offer letters and contracts (these go in the ATS or HRIS, not a personal archive)

For CV and work sample file management:
- Store in a naming-convention-consistent folder structure: "Candidates/[Role]/[Seniority]/[Name]-[Date].pdf"
- Link the file back to the candidate's PageStash record via your notes
- Don't keep multiple versions of the same CV — archive older ones clearly labeled "[Name]-CV-old-[date].pdf"

---

## For solo recruiters and agency teams

If you're a solo recruiter or a small agency, your archive is your competitive advantage. Your client doesn't have your network. Your institutional knowledge of the talent market is what they're paying for.

A structured archive means:
- Faster delivery: you're pulling from existing relationships, not starting from scratch
- Better quality: you know these candidates, you've assessed them before
- Resilient to staff changes: your knowledge is written down, not just in your head

---

## Tools comparison

| Tool | Capture full profile | Searchable notes | Tags | Team sharing | Cost |
|---|---|---|---|---|---|
| **PageStash** | ✅ | ✅ full-text | ✅ | ❌ (individual accounts) | Free / $10 mo |
| LinkedIn Saved | ❌ (link only) | ❌ | ❌ | ❌ | Free w/ LinkedIn |
| Notion | Manual entry | ✅ | ✅ | ✅ | Free / $8 mo |
| Airtable | Manual entry | ✅ | ✅ | ✅ | Free / $20 mo |
| ATS (Greenhouse, Lever) | ❌ | ✅ | ✅ | ✅ | $$$$ |

**Best combination:** PageStash for sourcing and personal candidate research archive + your ATS for formal pipeline management.

---

## FAQ

**What's the difference between a recruitment archive and an ATS?**
An ATS (Applicant Tracking System) manages formal applicants through a defined hiring process. A recruitment archive is your personal or team library of sourced candidates — people you've found and assessed who may or may not have formally applied. Both are necessary for a high-functioning recruiting operation.

**How long should we keep candidate records?**
This depends on your jurisdiction. GDPR (EU) and CCPA (California) have specific requirements. Common practice is 12–24 months for candidates who weren't hired. Consult your legal or HR team for compliance guidance.

**Can a small team share a candidate archive?**
PageStash is currently individual accounts. For team-shared archives, Notion or Airtable provide shared databases, though without full-page capture. A pragmatic approach: recruiters maintain individual PageStash archives and add key candidates to a shared Notion database for team visibility.

---

[Start building your searchable candidate archive — free →](/auth/signup)
`
}
