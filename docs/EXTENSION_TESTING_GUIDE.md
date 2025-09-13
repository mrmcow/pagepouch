# 🧪 **PagePouch Extension - Full Functionality Testing Guide**

## 🎯 **Testing Objectives**

Ensure the PagePouch extension works flawlessly with:
- ✅ **Authentication** - Sign up, sign in, sign out
- ✅ **Capture functionality** - Full page and visible area screenshots
- ✅ **Supabase integration** - Clips saved to database and storage
- ✅ **Web app sync** - Captures appear in dashboard
- ✅ **Navigation** - Seamless flow between extension and web app

## 🔧 **Pre-Testing Setup**

### **1. Reload Extension**
```bash
# Go to chrome://extensions/
# Find PagePouch extension
# Click the reload button (🔄)
```

### **2. Verify Web App is Running**
```bash
# Check that web app is running on http://localhost:3002
# If not, start it:
cd /Users/michaelcouch/DEV/pagepouch
npm run dev
```

### **3. Check Supabase Connection**
- Ensure `.env.local` exists in `apps/web/` with your Supabase credentials
- Verify database schema is deployed in Supabase dashboard

## 📋 **Testing Checklist**

### **Phase 1: Extension UI & Layout** ✅
- [ ] **Popup opens properly** - No blank screen
- [ ] **Layout fits correctly** - No text cutoff on right side
- [ ] **Logo displays** - Beautiful PagePouch logo in header
- [ ] **Current tab info** - Shows page title, URL, and favicon
- [ ] **Capture buttons visible** - "Capture Full Page" and "Capture Visible Area"
- [ ] **Auth section present** - Sign in prompt or user info

### **Phase 2: Authentication Flow**
- [ ] **Sign Up Process**
  - [ ] Click "Sign In / Sign Up" button
  - [ ] Toggle to "Need an account? Sign Up"
  - [ ] Enter email and password
  - [ ] Click "Create Account"
  - [ ] Success: Shows "Welcome back!" with email
  - [ ] Badge shows "0 clips" initially

- [ ] **Sign In Process**
  - [ ] Sign out first (if signed in)
  - [ ] Click "Sign In / Sign Up"
  - [ ] Enter existing credentials
  - [ ] Click "Sign In"
  - [ ] Success: Shows user email and clip count

- [ ] **Sign Out Process**
  - [ ] Click "Sign Out" button
  - [ ] Returns to sign in prompt
  - [ ] No user data visible

### **Phase 3: Capture Functionality**
- [ ] **Visible Area Capture**
  - [ ] Navigate to any webpage
  - [ ] Open PagePouch extension
  - [ ] Click "📱 Capture Visible Area"
  - [ ] Progress indicator appears
  - [ ] Success message shows
  - [ ] Clip count increases

- [ ] **Full Page Capture**
  - [ ] Navigate to a long webpage (with scrolling)
  - [ ] Open PagePouch extension
  - [ ] Click "📄 Capture Full Page"
  - [ ] Progress shows scrolling/stitching
  - [ ] Success message appears
  - [ ] Clip count increases

### **Phase 4: Supabase Integration**
- [ ] **Database Storage**
  - [ ] Go to Supabase dashboard → Table Editor
  - [ ] Check `clips` table for new entries
  - [ ] Verify clip metadata (title, URL, timestamp)
  - [ ] Confirm `user_id` matches authenticated user

- [ ] **File Storage**
  - [ ] Go to Supabase dashboard → Storage
  - [ ] Check `screenshots` bucket
  - [ ] Verify image files are uploaded
  - [ ] Images should be viewable

### **Phase 5: Web App Sync**
- [ ] **Dashboard Navigation**
  - [ ] In extension, click "🌐 Open Web App"
  - [ ] New tab opens to `http://localhost:3002/dashboard`
  - [ ] User is already authenticated
  - [ ] Dashboard loads without login prompt

- [ ] **Clip Display**
  - [ ] Captured clips appear in dashboard
  - [ ] Thumbnails are visible
  - [ ] Metadata is correct (title, URL, date)
  - [ ] Click on clip to view full image

- [ ] **Real-time Sync**
  - [ ] Capture new clip in extension
  - [ ] Refresh dashboard
  - [ ] New clip appears immediately

## 🚨 **Common Issues & Solutions**

### **Authentication Problems**
- **Blank popup**: Reload extension
- **Sign up fails**: Check Supabase auth settings
- **"Already registered"**: Use sign in instead

### **Capture Issues**
- **No progress shown**: Check Chrome permissions
- **Capture fails**: Verify activeTab permission
- **Images not saving**: Check Supabase storage policies

### **Sync Problems**
- **Clips not in dashboard**: Check database policies
- **Wrong user data**: Clear extension storage and re-authenticate
- **Web app login required**: Check session persistence

## 🔍 **Debug Tools**

### **Extension Console**
```bash
# Right-click PagePouch icon → "Inspect popup"
# Check Console tab for errors
# Look for authentication and capture logs
```

### **Background Script Console**
```bash
# Go to chrome://extensions/
# Click "Inspect views: background page" under PagePouch
# Check for background script errors
```

### **Network Tab**
```bash
# In popup inspector, check Network tab
# Verify Supabase API calls are successful
# Look for 200 status codes on auth and storage requests
```

## ✅ **Success Criteria**

The extension is **fully functional** when:

1. **🎨 UI is perfect** - No layout issues, professional appearance
2. **🔐 Auth works flawlessly** - Sign up, sign in, sign out all work
3. **📸 Captures save to Supabase** - Both visible and full page
4. **🔄 Real-time sync** - Extension ↔ Web app data consistency
5. **🌐 Navigation flows** - Seamless experience between platforms
6. **📊 Data persistence** - Clips survive browser restarts
7. **⚡ Performance** - Fast, responsive, no errors

## 🚀 **Next Steps After Testing**

Once all tests pass:
- [ ] **Polish any rough edges** found during testing
- [ ] **Add advanced features** (tags, folders, search)
- [ ] **Prepare for Chrome Web Store** submission
- [ ] **Create user documentation** and tutorials
- [ ] **Set up analytics** to track usage

---

**Ready to test? Start with Phase 1 and work through each section systematically!** 🧪✨
