# 📊 GA4 Dashboard Setup Guide - PageStash Conversion Tracking

**Purpose:** Step-by-step guide to set up GA4 custom reports and dashboards for conversion tracking

---

## 🎯 Overview

After deploying the enhanced conversion tracking, you need to configure GA4 to:
1. Mark key events as conversions
2. Create custom dimensions for segmentation
3. Build custom reports and explorations
4. Set up automated alerts

**Time Required:** ~30-45 minutes  
**Prerequisites:** GA4 property set up, enhanced tracking deployed

---

## Step 1: Mark Events as Conversions (5 min)

### Navigate to Events
1. Go to **Google Analytics** → **Admin** (gear icon)
2. In the **Property** column, click **Events**
3. You'll see a list of all events being tracked

### Mark These Events as Conversions:
Click the "Mark as conversion" toggle for:

✅ **Primary Conversions:**
- `signup_completed` - User completed signup
- `extension_download_clicked` - User clicked download extension
- `purchase` - User upgraded to Pro

✅ **Secondary Conversions (Optional):**
- `cta_clicked` - User clicked any CTA (to track engagement)
- `upgrade_modal_viewed` - User viewed upgrade modal (pipeline metric)

### Why Mark as Conversion?
- Enables conversion tracking in reports
- Creates conversion funnels automatically
- Allows conversion-based attribution
- Powers smart bidding if you run ads

---

## Step 2: Create Custom Dimensions (10 min)

### Navigate to Custom Definitions
1. Go to **Admin** → **Property** → **Custom definitions**
2. Click **Create custom dimensions**

### Create These Custom Dimensions:

#### Dimension 1: Section Name
- **Dimension name:** `Section Name`
- **Scope:** `Event`
- **Description:** `Homepage section that was viewed or interacted with`
- **Event parameter:** `section_name`
- Click **Save**

#### Dimension 2: CTA ID
- **Dimension name:** `CTA ID`
- **Scope:** `Event`
- **Description:** `Unique identifier for CTA button clicked`
- **Event parameter:** `cta_id`
- Click **Save**

#### Dimension 3: CTA Location
- **Dimension name:** `CTA Location`
- **Scope:** `Event`
- **Description:** `Page section where CTA was located`
- **Event parameter:** `cta_location`
- Click **Save**

#### Dimension 4: Scroll Depth at Action
- **Dimension name:** `Scroll Depth`
- **Scope:** `Event`
- **Description:** `Scroll percentage when action was taken`
- **Event parameter:** `scroll_depth`
- Click **Save**

#### Dimension 5: Device Type
- **Dimension name:** `Device Type`
- **Scope:** `Event`
- **Description:** `Mobile or Desktop`
- **Event parameter:** `device_type`
- Click **Save**

#### Dimension 6: Time on Page at Action
- **Dimension name:** `Time on Page`
- **Scope:** `Event`
- **Description:** `Seconds on page before action`
- **Event parameter:** `time_on_page`
- Click **Save**

---

## Step 3: Create Conversion Funnel Report (10 min)

### Create Funnel Exploration
1. Go to **Explore** (left sidebar)
2. Click **Blank** to create new exploration
3. Name it: `Homepage Conversion Funnel`

### Configure Funnel Steps:

**Step 1: Page View**
- Event name: `page_view`
- Filter: `page_location` contains `/`

**Step 2: Scrolled 25%**
- Event name: `scroll_depth_25`

**Step 3: Viewed Pricing Section**
- Event name: `section_viewed`
- Filter: `section_name` equals `pricing`

**Step 4: CTA Clicked**
- Event name: `cta_clicked`

**Step 5: Conversion**
- Event name: `signup_completed` OR `extension_download_clicked`

### Funnel Settings:
- **Funnel type:** Closed funnel (users must complete steps in order)
- **Step timeframe:** Within 1 session
- **Breakdown:** Device category (mobile vs desktop)

### Visualization:
- Choose **Funnel visualization** (default)
- Enable **Show elapsed time** between steps
- Enable **Show abandonment rate**

**Save** the exploration.

---

## Step 4: Create Section Performance Report (10 min)

### Create Free Form Exploration
1. Go to **Explore** → Click **Blank**
2. Name it: `Section Performance Dashboard`

### Add Dimensions:
- `Section Name` (custom dimension)
- `Device category`
- `First user source` (to see traffic source impact)

### Add Metrics:
- `Event count` (for `section_viewed`)
- `Active users`
- `Engaged sessions`
- `Conversions`

### Create Calculated Metrics:

**Metric 1: Section View Rate**
```
Event count (section_viewed) / Event count (page_view)
```

**Metric 2: Section Conversion Rate**
```
Conversions / Event count (section_viewed)
```

### Configure Table:
- **Rows:** Section Name
- **Values:** All metrics above
- **Breakdowns:** Device category

**Save** the exploration.

---

## Step 5: Create CTA Performance Comparison (5 min)

### Create Free Form Exploration
1. Go to **Explore** → Click **Blank**
2. Name it: `CTA Performance Comparison`

### Add Dimensions:
- `CTA ID` (custom dimension)
- `CTA Location` (custom dimension)

### Add Metrics:
- `Event count` (for `cta_clicked`)
- `Conversions`
- `Active users`

### Create Calculated Metrics:

**Metric: CTA Conversion Rate**
```
Conversions / Event count (cta_clicked)
```

### Configure Table:
- **Rows:** CTA ID
- **Values:** Event count, Conversions, CTA Conversion Rate
- **Sort by:** Conversions (descending)

**Add Filter:** Event name = `cta_clicked`

**Save** the exploration.

---

## Step 6: Create Path Exploration (5 min)

### Create Path Exploration
1. Go to **Explore** → Click **Path exploration** template
2. Name it: `User Conversion Paths`

### Configure:
- **Starting point:** `page_view` event
- **Step type:** Event name
- **Max steps:** 5 steps
- **Node limit:** Top 10 paths

### Ending point (optional):
- `signup_completed` OR `extension_download_clicked`

This will show you all the common paths users take from landing to conversion.

**Save** the exploration.

---

## Step 7: Set Up Real-Time Monitoring

### Create Real-Time Report
1. Go to **Reports** → **Realtime**
2. Click **Customize report** (pencil icon top right)
3. Add these cards:

**Card 1: Active Users by Page**
- Dimension: `Page path and screen class`
- Metric: `Active users`

**Card 2: Top Conversion Events**
- Dimension: `Event name`
- Metric: `Event count`
- Filter: Event is conversion = Yes

**Card 3: Latest Conversions**
- Show conversion timeline (last 30 minutes)

**Save** the customized real-time report.

---

## Step 8: Create Looker Studio Dashboard (Optional, Advanced)

### Why Looker Studio?
- More visual and shareable than GA4 explorations
- Auto-refresh for live dashboards
- Can combine multiple data sources
- Better for executive/team reporting

### Quick Setup:
1. Go to [Looker Studio](https://lookerstudio.google.com)
2. Click **Create** → **Report**
3. Add data source: **Google Analytics 4** → Select your property
4. Click **Add to report**

### Dashboard Layout:

**Page 1: Overview**
- **Scorecard:** Total Signups (today, this week, this month)
- **Scorecard:** Total Extension Downloads
- **Line Chart:** Daily signups trend (last 30 days)
- **Pie Chart:** Traffic sources
- **Bar Chart:** Top converting CTAs

**Page 2: Conversion Funnel**
- **Funnel Chart:** Landing → Scroll → View → Click → Convert
- **Table:** Funnel drop-off rates by device
- **Bar Chart:** Avg time at each funnel step

**Page 3: Section Performance**
- **Heatmap-style Table:** Section views by device type
- **Bar Chart:** Avg time in view per section
- **Table:** Section-to-conversion rate

**Page 4: CTA Performance**
- **Table:** All CTAs with click rate and conversion rate
- **Bar Chart:** CTA clicks by location
- **Scatter Plot:** Time on page vs CTA click (to find optimal timing)

### Share Dashboard:
- Click **Share** → Add team emails
- Set to **View only** or **Edit** permission
- Enable **Email delivery** for weekly reports (optional)

---

## Step 9: Set Up Automated Alerts (5 min)

### Create Custom Alerts
1. Go to **Admin** → **Property** → **Custom alerts**
2. Click **Create alert**

### Alert 1: Conversion Rate Drop
- **Alert name:** Conversion Rate Drop Alert
- **Metric:** Conversions
- **Condition:** Decreases by more than 30%
- **Comparison period:** Previous day
- **Frequency:** Daily
- **Recipients:** Your email

### Alert 2: Traffic Spike
- **Alert name:** Traffic Spike Alert
- **Metric:** Active users
- **Condition:** Increases by more than 100%
- **Comparison period:** Previous hour
- **Frequency:** Hourly
- **Recipients:** Your email

### Alert 3: Zero Conversions
- **Alert name:** Zero Conversions Alert
- **Metric:** Conversions
- **Condition:** Equals 0
- **Comparison period:** Last 24 hours
- **Frequency:** Daily
- **Recipients:** Your email

---

## Step 10: Testing & Validation (5 min)

### Test Your Setup:

1. **Visit your homepage** in incognito mode
2. **Scroll through the page** (trigger scroll events)
3. **View different sections** (trigger section_viewed)
4. **Click a CTA** (trigger cta_clicked)
5. **Go to GA4 → Reports → Realtime**
6. You should see:
   - Your active session
   - Events firing (scroll_depth_25, section_viewed, cta_clicked)
   - Custom dimensions populated

### Debug Mode:
To enable detailed testing:
```javascript
// Add to browser console on your homepage:
gtag('config', 'GA_MEASUREMENT_ID', { debug_mode: true });
```

Then go to **Admin** → **DebugView** to see events in real-time with full details.

---

## 📈 What to Monitor Daily (First 2 Weeks)

### Week 1: Data Collection
- [ ] Check that all events are firing correctly
- [ ] Verify custom dimensions are populated
- [ ] Ensure conversions are being tracked
- [ ] Fix any tracking gaps

### Week 2: Initial Analysis
- [ ] Review funnel drop-off points
- [ ] Identify worst-performing CTAs
- [ ] Compare mobile vs desktop behavior
- [ ] Analyze section engagement

### Ongoing (Daily 5-min Check)
- [ ] Check daily signups/downloads (vs yesterday)
- [ ] Review top traffic sources
- [ ] Monitor conversion funnel completion rate
- [ ] Check for any alerts

---

## 🎯 Key Metrics to Track

### North Star Metrics (Primary KPIs)
1. **Overall Conversion Rate:** Conversions / Page Views (target: 3-5%)
2. **Funnel Completion Rate:** % who complete full funnel (target: 10-15%)
3. **Avg Time to Convert:** Seconds from landing → conversion (track trend)

### Secondary Metrics
4. **Scroll Depth (Avg):** Average scroll percentage (target: >60%)
5. **Section View Rate:** % who view each section (pricing target: >70%)
6. **CTA Click Rate:** CTA clicks / Page views (target: >5%)
7. **Bounce Rate:** % who leave without scrolling (target: <50%)

### Segment By:
- Device (Mobile vs Desktop)
- Traffic Source (Organic, Direct, Referral, Social)
- Browser (Chrome, Firefox, Safari, Edge)
- Time of Day (to find optimal conversion times)

---

## 🚀 Next Steps

### After 1 Week of Data:
1. Identify #1 drop-off point in funnel
2. A/B test solution to biggest friction point
3. Optimize worst-performing CTAs
4. Double down on best traffic sources

### After 1 Month of Data:
1. Build cohort analysis (signups by week)
2. Calculate LTV by traffic source
3. Set up retargeting audiences in Google Ads
4. Create lookalike audiences for growth

### Advanced Analytics (Optional):
1. Implement heatmapping (Hotjar, Clarity)
2. Set up session recordings (watch real user behavior)
3. Run user surveys (exit intent popup)
4. A/B testing framework (Optimizely, VWO)

---

## 📚 Resources

### GA4 Documentation
- [Funnel Exploration Guide](https://support.google.com/analytics/answer/9327974)
- [Path Exploration Guide](https://support.google.com/analytics/answer/9317498)
- [Custom Dimensions Guide](https://support.google.com/analytics/answer/10075209)

### Looker Studio
- [Looker Studio Templates](https://lookerstudio.google.com/gallery)
- [GA4 Connector Guide](https://support.google.com/looker-studio/answer/9171315)

### Analysis Frameworks
- [Pirate Metrics (AARRR)](https://www.productplan.com/glossary/aarrr-framework/)
- [Conversion Funnel Analysis](https://www.optimizely.com/optimization-glossary/conversion-funnel/)

---

## ✅ Checklist

- [ ] Mark key events as conversions in GA4
- [ ] Create 6 custom dimensions
- [ ] Build conversion funnel exploration
- [ ] Create section performance report
- [ ] Create CTA performance comparison
- [ ] Set up path exploration
- [ ] Configure real-time monitoring
- [ ] (Optional) Build Looker Studio dashboard
- [ ] Set up 3 automated alerts
- [ ] Test tracking with DebugView
- [ ] Monitor data for 1 week before making changes

---

**You're now ready to get complete conversion visibility! 🎉**

Once you have 1-2 weeks of data, you'll have actionable insights to optimize your homepage and increase conversions.

Questions? Refer to `CONVERSION_TRACKING_STRATEGY.md` for detailed implementation notes.

