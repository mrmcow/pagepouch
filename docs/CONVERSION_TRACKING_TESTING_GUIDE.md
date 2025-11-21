# 🧪 Conversion Tracking Testing Guide

**Quick guide to test and verify your enhanced conversion tracking**

---

## ⚡ Quick Test (5 minutes)

### Step 1: Enable GA4 Debug Mode
Open browser console on your homepage and run:
```javascript
window.gtag('config', 'YOUR_GA_MEASUREMENT_ID', { debug_mode: true });
```

### Step 2: Open GA4 DebugView
1. Go to [Google Analytics](https://analytics.google.com)
2. Select your PageStash property
3. Navigate to **Admin** → **DebugView**
4. Keep this tab open

### Step 3: Perform Test Actions

#### Test 1: Scroll Tracking
- [ ] Scroll to 25% of page → Should see `scroll_depth_25` event
- [ ] Scroll to 50% → Should see `scroll_depth_50` event
- [ ] Scroll to 75% → Should see `scroll_depth_75` event
- [ ] Scroll to bottom → Should see `scroll_depth_100` event

#### Test 2: Section Visibility
- [ ] Scroll slowly through homepage
- [ ] Stay on Hero section for 2+ seconds → Should see `section_viewed` (section_name: hero)
- [ ] Scroll to Pricing → Should see `section_viewed` (section_name: pricing)
- [ ] Scroll to FAQ → Should see `section_viewed` (section_name: faq)

#### Test 3: CTA Clicks
- [ ] Click "Sign In" button → Should see `cta_clicked` event with parameters:
  - `cta_id`: header_signin
  - `cta_text`: Sign In
  - `cta_location`: header
  - `scroll_depth`: current scroll %
  - `time_on_page`: seconds

- [ ] Click "Start Free" → Should see `cta_clicked` with appropriate params

#### Test 4: Exit Intent
- [ ] Move mouse quickly to top of browser (as if closing tab)
- [ ] Should see `exit_intent_detected` event with:
  - `page_section`: current section
  - `scroll_depth`: % scrolled
  - `time_on_page`: seconds

---

## 🔍 Detailed Testing Checklist

### Homepage Events

#### Page Load Events:
- [ ] `page_view` fires on page load
- [ ] User properties set (if logged in)

#### Scroll Events (automatic):
- [ ] `scroll_depth_25` fires at 25% scroll
- [ ] `scroll_depth_50` fires at 50% scroll
- [ ] `scroll_depth_75` fires at 75% scroll
- [ ] `scroll_depth_100` fires at bottom
- [ ] Events only fire once per page view

#### Section Visibility Events:
Test each section:
- [ ] Hero section: `section_viewed` (section_name: hero)
  - Includes `time_in_view`
  - Includes `scroll_percentage_when_viewed`
  - Includes `device_type`

- [ ] Pricing section: `section_viewed` (section_name: pricing)
- [ ] How It Works: `section_viewed` (section_name: how_it_works)
- [ ] Features: `section_viewed` (section_name: features)
- [ ] Preview Pane: `section_viewed` (section_name: preview_pane)
- [ ] Final CTA: `section_viewed` (section_name: final_cta)
- [ ] FAQ: `section_viewed` (section_name: faq)

#### CTA Click Events:
Test each CTA:
- [ ] Header "Sign In": `cta_clicked` (cta_id: header_signin)
- [ ] Header "Start Free": `cta_clicked` (cta_id: header_start_free)
- [ ] Hero Extension Selector: `extension_download_clicked` + `cta_clicked`
- [ ] Hero "Open Dashboard": `cta_clicked` (cta_id: hero_open_dashboard)
- [ ] Pricing "Start Free Trial": `cta_clicked` + extension download tracking
- [ ] Pricing "Upgrade to Pro": `cta_clicked` (cta_id: pricing_pro_upgrade)
- [ ] Final CTA Extension: `cta_clicked` (cta_id: final_cta_extension)
- [ ] Final CTA Dashboard: `cta_clicked` (cta_id: final_cta_dashboard)
- [ ] FAQ Contact Support: `cta_clicked` (cta_id: faq_contact_support)

#### All CTA clicks should include:
- [ ] `cta_id` (unique identifier)
- [ ] `cta_text` (button text)
- [ ] `cta_location` (section name)
- [ ] `scroll_depth` (percentage at click)
- [ ] `time_on_page` (seconds before click)

#### Hover Tracking (Test on CTAs):
- [ ] Hover over pricing card for >500ms
- [ ] Should see `element_hovered` event
- [ ] Includes `hover_duration` in ms
- [ ] Includes `element_type` and `element_id`

#### Exit Intent:
- [ ] Move mouse quickly toward browser top
- [ ] Should trigger `exit_intent_detected`
- [ ] Includes current section
- [ ] Includes scroll depth
- [ ] Includes time on page

---

## 📱 Mobile Testing

### Test on Mobile Device:

#### Access your site on mobile:
```
# If testing locally, use your computer's IP:
http://YOUR_IP_ADDRESS:3000
```

#### Mobile-specific tests:
- [ ] Scroll events fire on touch scroll
- [ ] Section visibility works on mobile
- [ ] CTA clicks tracked correctly
- [ ] `device_type` parameter = 'mobile'
- [ ] All events fire (no JavaScript errors)

#### Check in GA4:
- [ ] Filter by Device category = mobile
- [ ] Verify mobile events appear
- [ ] Compare mobile vs desktop behavior

---

## 🔧 Debugging Common Issues

### Issue: Events not appearing in DebugView

**Check 1: GA Measurement ID**
```javascript
// In browser console:
console.log(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
// Should output: G-XXXXXXXXXX
```

**Check 2: Script loading**
- Open DevTools → Network tab
- Filter: "gtag"
- Should see: `gtag/js?id=G-XXXXXXXXXX` loaded
- Status: 200 OK

**Check 3: Ad Blockers**
- Disable ad blocker (uBlock Origin, AdBlock Plus)
- Test in incognito mode
- Try different browser

**Check 4: Console Errors**
- Open DevTools → Console
- Look for any JavaScript errors
- If errors, check line numbers and fix

---

### Issue: Events fire but parameters missing

**Check event details in DebugView:**
- Click on event name
- Expand "Parameters" section
- Verify all expected parameters present

**If parameters missing:**
- Check browser console for errors
- Verify tracking function calls include all params
- Check that custom hooks are returning correct values

---

### Issue: Scroll events firing multiple times

**Expected behavior:** Each scroll milestone should fire only once per page load

**If firing multiple times:**
- Check that `milestones.current` ref is being used correctly
- Verify component isn't re-mounting (React Strict Mode can cause double firing in dev)
- In production, this should not happen

---

### Issue: Section visibility not working

**Check Intersection Observer support:**
```javascript
// In browser console:
console.log('IntersectionObserver' in window)
// Should output: true
```

**If false:** Browser too old, needs polyfill

**If true but not working:**
- Check that sections have `ref` attached
- Verify sections are large enough to intersect (>50% visible)
- Check threshold settings in hook

---

## 📊 Verify Data in GA4 Reports

### After 24-48 Hours:

#### Check Events Report:
1. Go to **Reports** → **Engagement** → **Events**
2. Should see new events:
   - `scroll_depth_25/50/75/100`
   - `section_viewed`
   - `cta_clicked`
   - `exit_intent_detected`
   - `element_hovered`

#### Check Event Parameters:
1. Click on an event (e.g., `cta_clicked`)
2. Click **View Details**
3. Verify parameters populated:
   - `cta_id`
   - `cta_location`
   - `scroll_depth`
   - `time_on_page`

#### Check Realtime Report:
1. Go to **Reports** → **Realtime**
2. Perform action on homepage (in another tab)
3. Within 30 seconds, event should appear in Realtime

---

## 🧪 Automated Testing (Optional)

### Using Playwright/Cypress:

```javascript
// Example Playwright test
test('scroll tracking works', async ({ page }) => {
  // Listen for gtag events
  let scrollEvents = []
  page.on('console', msg => {
    if (msg.text().includes('scroll_depth')) {
      scrollEvents.push(msg.text())
    }
  })
  
  // Visit homepage
  await page.goto('http://localhost:3000')
  
  // Scroll to 50%
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight * 0.5)
  })
  
  // Wait for event
  await page.waitForTimeout(1000)
  
  // Verify event fired
  expect(scrollEvents).toContain('scroll_depth_50')
})
```

---

## ✅ Testing Checklist Summary

### Pre-Deployment Tests (Development):
- [ ] All scroll events fire correctly
- [ ] All sections tracked
- [ ] All CTAs tracked with context
- [ ] Exit intent works
- [ ] No console errors
- [ ] GA4 DebugView shows events
- [ ] Mobile testing complete

### Post-Deployment Tests (Production):
- [ ] Smoke test: Load homepage, scroll, click CTA
- [ ] Check GA4 Realtime (events appear within 1 min)
- [ ] No JavaScript errors in console
- [ ] Monitor for 1 hour
- [ ] Check next day in Events report

### After 1 Week:
- [ ] Verify event counts look reasonable
- [ ] Check event parameters are populated
- [ ] No data gaps or anomalies
- [ ] Ready to set up custom reports

---

## 🎯 Success Criteria

### Your tracking is working if:
✅ All 9 event types fire correctly  
✅ Event parameters are populated  
✅ No JavaScript errors  
✅ Events appear in GA4 within 24 hours  
✅ Data is consistent across devices  
✅ No tracking gaps  

### Red Flags:
❌ Events fire but missing parameters  
❌ Events not appearing in GA4 reports  
❌ Console errors related to gtag  
❌ Events firing multiple times (except page reloads)  
❌ Mobile tracking not working  

---

## 📞 Need Help?

### Debug Checklist:
1. Check browser console for errors
2. Verify GA Measurement ID is set
3. Check Network tab for gtag.js loaded
4. Disable ad blockers
5. Test in incognito mode
6. Try different browser
7. Check GA4 DebugView
8. Wait 24 hours for data to appear in reports

### Still Having Issues?
- Review implementation in tracking hooks
- Check that refs are attached to sections
- Verify event names match between code and GA4
- Ensure GA4 property is not in demo mode

---

**Happy Testing!** 🚀

Once your tests pass, you're ready to deploy and start collecting actionable conversion data!

