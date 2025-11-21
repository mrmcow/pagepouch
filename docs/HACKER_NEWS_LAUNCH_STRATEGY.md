# 🎯 Hacker News "Show HN" Launch Strategy

**Goal:** Get 100-300 test users within 24 hours  
**Difficulty:** Medium  
**Time Required:** 1 day of active monitoring

---

## ✅ Why HN Will Love PageStash

**Your advantages:**
- ✅ Technical product (browser extension + full-page capture)
- ✅ Solves real pain (link rot, lost research)
- ✅ Built by indie dev (HN loves this)
- ✅ Free tier available (low barrier to try)
- ✅ Privacy-focused (data ownership)
- ✅ Targets researchers/OSINT (HN demographic)

**You're a perfect fit for HN.**

---

## 🚀 The Winning Post

### Title Options (Test These):

**Option 1 - Technical Angle:**
```
Show HN: PageStash – Full-page web archival with knowledge graphs
```

**Option 2 - Problem-First (RECOMMENDED):**
```
Show HN: PageStash – Save web pages before they disappear (link rot solution)
```

**Option 3 - OSINT Angle:**
```
Show HN: PageStash – Web archival tool for researchers and OSINT investigators
```

**Use Option 2** - HN responds best to problem-first framing.

**Title rules:**
- Must start with "Show HN:"
- Keep under 80 characters
- Lead with benefit, not feature
- Avoid hype words ("revolutionary", "disrupting", "game-changer")
- Be specific about what it does

---

## 💬 Your First Comment (Post Immediately)

**Post this comment 30 seconds after submitting your post:**

```markdown
Hey HN! I built PageStash after losing important research sources to link rot.

What it does:
• One-click full-page capture (screenshot + text + metadata)
• Full-text search across all captures
• Knowledge graphs to visualize connections between sources
• Works offline, data stays yours
• Browser extension (Chrome/Firefox)

Technical stack:
• Next.js + TypeScript
• Supabase (Postgres + Storage)
• Full-page capture using DOM traversal
• Client-side text extraction for privacy
• Knowledge graph built with force-directed layout

Why I built it:
I'm a [your role] and kept losing sources mid-project. Websites change, get deleted, or go behind paywalls. Bookmarks die, Archive.org is slow and can't capture login-required pages, Pocket strips important page elements.

I needed something that:
1. Captures the COMPLETE page (not just text)
2. Works instantly (not days like Archive.org)
3. Lets me search across everything I've saved
4. Shows me connections between my sources

Free tier: 10 clips/month (no card required)
Pro: $12/mo for 1,000 clips + 5GB storage

Try it: https://www.pagestash.app

Three things I'd love feedback on:
1. Is the knowledge graph feature useful or just noise?
2. Should I add video/PDF capture next?
3. Is $12/mo reasonable for 1,000 clips?

Happy to answer questions about the tech, capture approach, or anything else!
```

**Why this works:**
- Starts with relatable problem
- Technical details (HN loves this)
- Humble tone ("I built this because...")
- Specific asks for feedback (drives engagement)
- Honest about pricing

---

## ⏰ Optimal Timing

### Best Days:
- **Tuesday** (BEST)
- **Wednesday** (GOOD)
- **Thursday** (GOOD)

### Best Times:
- **8:00-10:00 AM ET** (optimal)
- **2:00-4:00 PM ET** (backup)

### Avoid:
- ❌ Monday (busy, news-heavy)
- ❌ Friday (weekend mode)
- ❌ Weekends (low engagement)

### Pro Tip:
**Post at 8:37 AM ET** - Avoids the :00 rush when everyone posts at the top of the hour.

---

## 🎯 Response Strategy

### First Hour is CRITICAL

**You MUST:**
- ✅ Respond within 5 minutes to every comment
- ✅ Be online and monitoring constantly
- ✅ Share technical details when asked
- ✅ Acknowledge every piece of feedback
- ✅ Thank people who try it

**The algorithm rewards engagement.** Fast responses = more visibility.

---

## ✅ DO's

**Be humble:**
- "Still early, lots to improve"
- "Great point, I'll add that to the roadmap"
- "You're right, [competitor] does that better"

**Be technical:**
- Share architecture diagrams
- Explain implementation details
- Discuss trade-offs you made
- Link to technical blog posts

**Be honest:**
- Acknowledge limitations
- Share what's not working yet
- Admit when someone has a better approach
- Don't oversell

**Be grateful:**
- "Thanks for trying it!"
- "Great feedback, exactly what I needed"
- "This is incredibly helpful"

---

## ❌ DON'Ts

**Never:**
- ❌ Be defensive about criticism
- ❌ Argue with commenters
- ❌ Use marketing speak
- ❌ Oversell or hype
- ❌ Ignore tough questions
- ❌ Compare yourself to competitors negatively
- ❌ Ask for upvotes (against HN rules)

---

## 💪 Prepare These Answers

### Q: "Why not just use Archive.org?"

**A:** "Archive.org is great for public archival, but:
1. Can't capture login-required pages
2. Takes days to archive (not instant)
3. Sites can request removal
4. No search across YOUR specific captures
5. No organization tools

PageStash is for personal research archival where you need instant capture, full control, and powerful search/organization."

---

### Q: "How is this different from Pocket/Instapaper?"

**A:** "Pocket/Instapaper are 'read-it-later' tools that strip page formatting and elements. They're great for articles but terrible for research.

PageStash captures:
- Full visual page (screenshot)
- Complete HTML/DOM
- All metadata
- Preserves exact layout

Think 'local Archive.org' with search, not 'article reader.' Different use case entirely."

---

### Q: "What about Evernote Web Clipper?"

**A:** "Evernote is note-taking first, web capture second. It's also $15/mo minimum and doesn't have:
- Knowledge graphs
- Full-page visual capture
- Purpose-built search for web content
- Focused on researchers/OSINT

Different tool, different audience. Evernote for notes + web, PageStash for serious web archival."

---

### Q: "Privacy concerns - what do you do with the data?"

**A:** "Nothing. You own all your data:
- Encrypted in transit and at rest
- Stored in your account (Supabase)
- Can export everything anytime (JSON/Markdown)
- Can delete your account completely
- No tracking or selling data
- Self-hosted version on roadmap [if true]

Free tier exists specifically so you can test with zero risk."

---

### Q: "This seems expensive for a web clipper"

**A:** "Fair point. Breakdown:
- Storage costs: ~$3/user/month for 5GB
- Processing: ~$2/user/month
- Infrastructure: ~$1/user/month
- Margins: ~$6/user/month

I'm a solo dev keeping costs low. Happy to discuss if $12 feels high. What would you consider reasonable for 1,000 full-page captures/month?"

[Then actually listen to feedback - might adjust pricing]

---

### Q: "Why not just use wget/curl?"

**A:** "Totally valid for technical users! wget/curl are great for static HTML.

PageStash is for:
- Non-technical researchers
- JavaScript-rendered pages (SPAs)
- Point-and-click capture
- Built-in search across captures
- Knowledge graphs
- Browser extension (capture while browsing)

Different tool for different audience. If you're comfortable with command line, wget is awesome."

---

### Q: "How does the capture work technically?"

**A:** "Great question! Here's the approach:

1. Extension injects content script into page
2. Captures full-page screenshot using viewport scrolling
3. Extracts complete DOM tree + computed styles
4. Pulls all text content for search indexing
5. Saves metadata (URL, timestamp, title, etc)
6. Uploads to Supabase Storage (encrypted)
7. Indexes text in Postgres for full-text search

Challenges:
- Lazy-loaded images (solved with scroll-and-wait)
- Dynamic content (capture after JS execution)
- Large pages (chunked upload)

Happy to share more details or write a technical deep dive!"

---

### Q: "Is this open source?"

**A (if yes):** "Yes! Here's the repo: [link]. Would love contributions, especially around [feature]."

**A (if no):** "Not yet, but planning to open-source the capture engine. Want to clean up the code first and make sure the business model works. Interested in which parts would be most valuable to open-source?"

---

### Q: "What about legal/copyright issues?"

**A:** "PageStash is for personal research use - like taking notes or screenshots. Same legal standing as bookmarking or printing for personal use.

Not intended for:
- Redistribution of copyrighted content
- Violating terms of service
- Commercial scraping

Users are responsible for their own compliance with site terms. We're a tool, like a browser's 'Save Page' feature."

---

## 🔥 Boost Engagement

### Ask for Specific Feedback

**In your first comment, include:**
```
Three things I'd love feedback on:
1. Is the knowledge graph feature useful or just noise?
2. Should I add video/PDF capture next?
3. Is $12/mo reasonable for 1,000 clips?
```

**Why this works:** People LOVE giving feedback. Specific questions drive comments.

### Share Technical Details

**When asked, share:**
- Architecture diagrams
- Code snippets
- Technical blog posts
- GitHub repo (if open source)
- Performance benchmarks

**HN loves technical deep dives.**

### Acknowledge Competitors

**Be honest about competition:**
- "Yes, [Tool X] does [feature] better than us"
- "We're focusing on [use case] that [competitor] doesn't cover well"
- "Planning to add [feature] that [competitor] has"

**Honesty = credibility on HN.**

---

## 📊 Success Metrics

### Points (Visibility):
- **10-50 points:** Small but engaged audience
- **50-100 points:** Good visibility, worth it
- **100-200 points:** Front page material
- **200-300 points:** Top 5, excellent launch
- **300+ points:** Top 3, jackpot

### User Acquisition:
- **Top 3 (300+ points):** 500-2,000 signups
- **Front page (100-200):** 200-500 signups
- **Good visibility (50-100):** 100-200 signups
- **Modest (10-50):** 50-100 signups

### Engagement:
- Comments are more valuable than points
- 1 engaged user > 10 drive-by visitors
- Quality feedback > quantity of signups

---

## ⚡ Pre-Launch Checklist

### 24 Hours Before:

**Technical:**
- [ ] Homepage loads in < 2 seconds
- [ ] Signup flow works perfectly (test 5x)
- [ ] Extension download works (both Chrome & Firefox)
- [ ] Test with 100+ concurrent users (loader.io)
- [ ] Error tracking enabled (Sentry, LogRocket)
- [ ] Analytics tracking configured (GA4)
- [ ] Rate limiting configured (prevent abuse)
- [ ] Database connection pooling optimized
- [ ] CDN configured for static assets

**Content:**
- [ ] Demo video ready (30-60 seconds, optional)
- [ ] Screenshots for first comment
- [ ] Architecture diagram (if technical angle)
- [ ] FAQ page updated
- [ ] Privacy policy visible
- [ ] Terms of service visible

**Monitoring:**
- [ ] Server monitoring dashboard ready
- [ ] Error alerting configured
- [ ] Database performance monitoring
- [ ] Real-time analytics dashboard

**Team:**
- [ ] You're available for 6+ hours
- [ ] Calendar cleared (no meetings)
- [ ] Phone notifications on
- [ ] Laptop fully charged

---

## 🎬 Launch Day Timeline

### 8:00 AM ET - Final Prep
- [ ] Test site one more time
- [ ] Clear cache, test signup flow
- [ ] Open HN submit page: https://news.ycombinator.com/submit
- [ ] Have first comment ready in a doc

### 8:37 AM ET - POST
- [ ] Submit to HN with your chosen title
- [ ] URL: https://www.pagestash.app
- [ ] Immediately post first comment (within 30 seconds)

### 8:40 AM - 10:00 AM - CRITICAL WINDOW
- [ ] Respond to EVERY comment within 5 minutes
- [ ] Monitor server load/errors
- [ ] Fix any issues immediately
- [ ] Be technical, humble, and grateful

### 10:00 AM - Assess Momentum
- **If 20+ points:** Keep engaging, you're trending
- **If 10-20 points:** Still engage, could pick up
- **If <10 points:** Consider deleting and reposting tomorrow with different angle

### 10:00 AM - 4:00 PM - Sustained Engagement
- [ ] Continue responding to comments
- [ ] Share on Twitter if trending: "On HN front page!"
- [ ] Monitor signups and conversion
- [ ] Note feature requests
- [ ] Thank people who share screenshots

### 4:00 PM - 8:00 PM - Wind Down
- [ ] Continue responding (slower is OK now)
- [ ] Start drafting follow-up emails
- [ ] Analyze what's working/not working
- [ ] Document bugs to fix

### End of Day - Debrief
- [ ] Total points/comments
- [ ] Total signups
- [ ] Conversion rate
- [ ] Top feedback themes
- [ ] Bugs found
- [ ] Action items for tomorrow

---

## 🚨 Handling Negative Comments

### Expect These:

**"Why not just use [competitor]?"**
→ Acknowledge + explain your niche

**"This seems overpriced"**
→ Share cost breakdown + ask what's fair

**"Privacy concerns?"**
→ Explain encryption, data ownership, export

**"Just use wget/curl"**
→ Acknowledge for technical users, explain your audience

**"Looks like vaporware"**
→ Share GitHub, technical blog, or demo video

**"Yet another [category] tool"**
→ Explain what's unique about your approach

### How to Respond:

**DON'T:**
- Get defensive
- Argue
- Dismiss the concern
- Be sarcastic

**DO:**
- Thank them for the feedback
- Acknowledge their point
- Explain your reasoning
- Ask clarifying questions
- Offer to discuss further

**Example:**
```
That's a fair point about wget. You're right that it's more powerful 
for technical users. PageStash targets non-technical researchers who 
need point-and-click capture + search. Different audience, different 
tool. Appreciate the feedback!
```

---

## 💡 Pro Tips

### Title Optimization:
- Include "Show HN:" (required)
- Keep under 80 characters (HN truncates)
- Lead with benefit, not feature
- Avoid hype words ("revolutionary", "amazing")
- Be specific about what it does
- Test 2-3 variations before posting

### Controversial Angles That Work:
- "I spent 6 months building what [BigCo] should have built"
- "Why [popular tool] fails at [use case] and what I built instead"
- "I rebuilt [tool] because I couldn't afford the $99/mo plan"
- "[Industry] is broken - here's my attempt to fix it"

**Your angle:**
"I built this after losing research to link rot - bookmarks die, Archive.org is slow"

### Engagement Hacks:
- Ask specific questions (drives comments)
- Share technical details (HN loves architecture)
- Be vulnerable ("here's what's not working yet")
- Acknowledge competitors honestly
- Thank everyone who tries it

### Algorithm Boost:
- Early upvotes matter most (first 30 min)
- Comments boost visibility
- Fast responses keep thread hot
- Sustained engagement over 2-4 hours = front page

---

## 📱 Backup Plans

### If Your Post Flops (<10 points in 2 hours):

**Option 1: Delete and Repost Tomorrow**
- Different title angle
- Different time slot
- Learn from comments

**Option 2: Switch to Technical Deep Dive**
- Write blog post: "How I Built Full-Page Web Archival"
- Submit blog post instead of product
- Link to product in first comment

**Option 3: Wait 1 Week**
- Build something cool to showcase
- Post "Show HN: I added [feature] to [product]"
- HN loves iteration stories

### If You Get Massive Traffic (Server Overload):

**Immediate:**
- Put up maintenance page with signup form
- Capture emails: "We're scaling! Enter email for access"
- Post update in HN thread: "Scaling issues, working on it"

**Within 1 hour:**
- Scale database connections
- Enable CDN caching
- Add rate limiting
- Upgrade server resources

**HN users are understanding of scaling issues** - just communicate openly.

---

## 🎯 Your Action Plan

### Today:
- [ ] Read this guide fully
- [ ] Test your site thoroughly
- [ ] Write your first comment
- [ ] Prepare FAQ answers
- [ ] Set up monitoring

### Tomorrow (Tuesday) 8:37 AM ET:
- [ ] Post to HN
- [ ] Drop first comment immediately
- [ ] Respond to everything for 6 hours
- [ ] Monitor and fix issues

### After Launch:
- [ ] Email everyone who signed up
- [ ] Thank people on Twitter
- [ ] Write follow-up HN post in 1 week: "What I learned"
- [ ] Implement top feedback

---

## 📈 Post-Launch Actions

### Immediately After Launch:

**First 100 Signups:**
- [ ] Send welcome email within 1 hour
- [ ] Include: Quick start guide + ask for feedback
- [ ] Track: Who activates (installs extension)

**Track These Metrics:**
- Signups from HN (UTM: source=hackernews)
- Activation rate (installed extension)
- First capture rate (actually used it)
- Conversion to paid (free → pro)
- Churn after 7 days

### First Week:

**Monday:**
- [ ] Send feedback survey to HN signups
- [ ] Compile feature requests from HN comments
- [ ] Fix critical bugs found

**Wednesday:**
- [ ] Email HN users with updates: "Here's what we fixed"
- [ ] Share metrics: "100 of you signed up, here's what we learned"

**Friday:**
- [ ] Write blog post: "What I Learned from Show HN"
- [ ] Post to HN again (allowed after 7 days)
- [ ] Thank everyone on Twitter

---

## ✅ Success Checklist

**You nailed the HN launch if:**

- [ ] 50+ points (good visibility)
- [ ] 30+ comments (engaged audience)
- [ ] 100+ signups (real traction)
- [ ] 10+ people shared feedback
- [ ] 5+ people said "this solves my problem!"
- [ ] Got featured in someone's newsletter
- [ ] Other builders reached out to collaborate
- [ ] Made front page (even briefly)

**Even a "modest" HN launch is valuable:**
- Quality feedback from technical users
- Bug reports from real usage
- Validation of your idea
- Connections with potential users/advisors
- Practice pitching your product

---

## 🚀 Expected Outcomes

### Conservative (50 points):
- 100-150 signups
- 20-30 activated users
- 5-10 paying customers (over time)
- Valuable feedback
- ✅ Worth it

### Good (100-200 points):
- 200-400 signups
- 50-100 activated users
- 10-20 paying customers
- Front page visibility
- ✅✅ Great launch

### Excellent (200-300+ points):
- 500-1,000 signups
- 150-300 activated users
- 20-50 paying customers
- Top 3 visibility
- Press mentions
- ✅✅✅ Home run

---

## 📚 Resources

**HN Guidelines:**
- https://news.ycombinator.com/newsguidelines.html

**Submit Page:**
- https://news.ycombinator.com/submit

**Your Post URL Format:**
- Title: Show HN: PageStash – [chosen angle]
- URL: https://www.pagestash.app

**Track Your Post:**
- https://news.ycombinator.com/newest (see your submission)
- https://hnrankings.info/ (track position)

---

## ❓ FAQ

**Q: Can I ask friends to upvote?**
A: No. HN detects and penalizes voting rings. Let it grow organically.

**Q: Should I post in other communities too?**
A: Wait 24 hours. Don't dilute your focus. HN first, then others.

**Q: What if I get harsh criticism?**
A: Stay humble. Some HN users are harsh but often right. Learn from it.

**Q: Can I post again if it doesn't work?**
A: Yes, but wait 24 hours and change your angle.

**Q: Should I offer HN discount?**
A: Not necessary. Maybe say "HN gets early access to [feature]" instead.

---

## 🎯 TL;DR - Do This

1. **Post Tuesday 8:37 AM ET**
2. **Title:** "Show HN: PageStash – Save web pages before they disappear (link rot solution)"
3. **First comment:** Technical details + humble story + ask for feedback
4. **Respond to EVERYTHING in first 6 hours**
5. **Be technical, honest, and humble**

**Expected Result:** 100-300 signups, valuable feedback, quality users.

---

**Good luck with your launch! 🚀**

You've built something valuable. HN will appreciate the technical depth and problem-solving approach. Stay humble, be responsive, and you'll do great.

---

*Document created: November 21, 2025*  
*Launch date: [Your chosen date]*

