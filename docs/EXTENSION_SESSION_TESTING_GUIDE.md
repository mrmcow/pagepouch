# 🧪 Chrome Extension - Session Persistence Testing Guide

**Date:** October 30, 2025  
**Version:** v1.1.0 with Session Persistence Fix  
**Status:** Ready for Testing  

---

## 📋 What Was Fixed

### Critical Changes Implemented:

1. **✅ Session Restoration on Popup Open**
   - Added `ExtensionAuth.restoreSession()` method
   - Popup now calls `restoreSession()` on mount
   - Supabase session is properly initialized with stored tokens

2. **✅ Background Session Monitor**
   - Monitors session every 5 minutes
   - Proactively refreshes tokens before expiration (10min threshold)
   - Restores session on browser startup

3. **✅ Automatic Token Refresh Before API Calls**
   - All API methods now use `authenticatedFetch()` helper
   - Automatically retries with refreshed token on 401 errors
   - No more "Not authenticated" errors mid-session

4. **✅ Logger Utility Created**
   - Production-ready logging (silent in production)
   - Development mode shows detailed logs
   - Specialized loggers for auth, API, and capture

---

## 🎯 Testing Checklist

### ✅ Phase 1: Basic Authentication Flow

**Test 1.1: Fresh Login**
```
1. Open Chrome DevTools (F12) on popup
2. Clear extension storage:
   - DevTools > Application > Storage > Extension > Local Storage > Clear All
3. Click extension icon
4. Sign in with valid credentials
5. ✅ PASS: User is logged in, folders load, usage shows
```

**Expected Logs:**
```
🔐 Checking authentication status...
🔐 No stored session found
🔐 No valid session, showing auth
🔐 ExtensionAuth.signIn called for: [email]
🔐 Storing session in chrome storage
```

**Test 1.2: Sign Up Flow**
```
1. Click "Sign Up" tab
2. Enter new email + password
3. Submit form
4. ✅ PASS: User is registered, UI shows authenticated state
```

---

### ✅ Phase 2: Session Persistence (CRITICAL)

**Test 2.1: Close and Reopen Popup**
```
1. User is logged in
2. Close popup (click outside)
3. Wait 2 seconds
4. Click extension icon again
5. ✅ PASS: User still logged in, NO login prompt
```

**Expected Logs:**
```
🔐 Checking authentication status...
🔐 Restoring session for user: [email]
🔐 Session restored successfully
🔐 Current user: [email]
```

**🚨 FAIL if:** Login prompt shows again

**Test 2.2: Browser Restart**
```
1. User is logged in
2. Close Chrome completely (Cmd+Q on Mac)
3. Wait 5 seconds
4. Reopen Chrome
5. Click extension icon
6. ✅ PASS: User still logged in
```

**Expected Logs:**
```
Extension startup - restoring session
🔐 Session monitor started
🔐 Checking authentication status...
🔐 Restoring session for user: [email]
🔐 Session restored successfully
```

**🚨 FAIL if:** Login prompt shows

**Test 2.3: Multiple Tabs**
```
1. User is logged in
2. Open extension popup in Tab 1
3. Close popup
4. Switch to Tab 2
5. Open extension popup in Tab 2
6. ✅ PASS: User still logged in
```

**Test 2.4: Computer Restart**
```
1. User is logged in
2. Restart computer
3. Open Chrome
4. Click extension icon
5. ✅ PASS: User still logged in
```

---

### ✅ Phase 3: Token Expiration & Refresh

**Test 3.1: Simulated Token Expiration**
```
1. User is logged in
2. Open Chrome DevTools > Application > Storage
3. Edit `authToken` in chrome.storage.local
4. Set to an invalid/expired token
5. Click "Capture Page"
6. ✅ PASS: Token refreshes automatically, capture succeeds
```

**Expected Logs:**
```
🔐 Restoring session for user: [email]
Token expired, refreshing and retrying...
🔄 Refreshing session proactively
API response status: 200
Clip saved successfully
```

**🚨 FAIL if:** "Not authenticated" error shown

**Test 3.2: Long Session (1+ Hour)**
```
1. User logs in
2. Leave extension open for 1+ hour
3. Trigger a capture
4. ✅ PASS: Token refreshes automatically, no re-login needed
```

**Background logs should show:**
```
🔄 Refreshing session proactively (expires in [X] seconds)
```

---

### ✅ Phase 4: Capture Functionality

**Test 4.1: Capture After Fresh Login**
```
1. Login
2. Navigate to any website (e.g. wikipedia.org)
3. Click "Capture Page"
4. ✅ PASS: Screenshot captured, clip saved, success message shown
```

**Test 4.2: Capture After Popup Reopen**
```
1. User logged in
2. Close popup
3. Reopen popup
4. Immediately click "Capture Page"
5. ✅ PASS: Capture works without re-login
```

**Test 4.3: Capture in Different Folders**
```
1. Login
2. Select folder from dropdown
3. Capture page
4. ✅ PASS: Clip saved to selected folder
```

---

### ✅ Phase 5: Error Handling

**Test 5.1: Invalid Credentials**
```
1. Enter wrong password
2. Click "Sign In"
3. ✅ PASS: Error message shown, no crash
```

**Test 5.2: Offline Mode**
```
1. User logged in (with valid session stored)
2. Turn off WiFi
3. Click extension icon
4. ✅ PASS: UI loads, shows cached folders
5. Click "Capture Page"
6. ✅ PASS: Error shown, but app doesn't crash
```

**Test 5.3: API Timeout**
```
1. User logged in
2. Slow network connection
3. Capture page
4. ✅ PASS: Loading indicator shown, eventual timeout error
```

---

### ✅ Phase 6: Sign Out

**Test 6.1: Sign Out**
```
1. User logged in
2. Click "Sign Out"
3. ✅ PASS: Login prompt shown
4. Reopen popup
5. ✅ PASS: Still logged out, login prompt shown
```

**Expected Logs:**
```
Signing out...
🔐 No stored session found
```

---

## 🔍 How to Monitor Logs

### Chrome DevTools:

1. **Popup Logs:**
   ```
   Right-click extension icon > Inspect popup
   Console tab will show all popup logs
   ```

2. **Background Script Logs:**
   ```
   chrome://extensions/ > "Inspect views: background page"
   Console tab will show background logs
   ```

3. **Content Script Logs:**
   ```
   Open DevTools on any webpage (F12)
   Console tab will show content script logs
   ```

### What to Look For:

✅ **Good Signs:**
- `🔐 Session restored successfully`
- `Clip saved successfully`
- `🔄 Refreshing session proactively`

🚨 **Bad Signs:**
- `Failed to restore session`
- `Not authenticated`
- `Token expired` without automatic refresh
- Login prompt appears after browser restart

---

## 🐛 Known Issues & Workarounds

### Issue: Session not persisting

**Symptoms:** User forced to re-login after closing popup

**Debug Steps:**
1. Check if tokens are stored:
   ```javascript
   chrome.storage.local.get(['authToken', 'refreshToken'], console.log)
   ```
2. Check console for errors during `restoreSession()`
3. Verify Supabase credentials are set in environment variables

**Workaround:** Clear storage and re-login

### Issue: Token refresh fails

**Symptoms:** 401 errors on API calls

**Debug Steps:**
1. Check if `refreshToken` exists in storage
2. Look for "refreshing session" logs
3. Verify API endpoint is correct

**Workaround:** Sign out and back in

---

## 📊 Success Criteria

### Must Pass ALL of These:

- [ ] ✅ User stays logged in after closing popup
- [ ] ✅ User stays logged in after browser restart
- [ ] ✅ User stays logged in after computer restart
- [ ] ✅ Captures work immediately after reopening popup
- [ ] ✅ Token refreshes automatically before expiration
- [ ] ✅ 401 errors retry with refreshed token
- [ ] ✅ Multiple tabs work correctly
- [ ] ✅ No console errors in production build

### Performance Benchmarks:

- [ ] ✅ Popup opens in < 1 second
- [ ] ✅ Session restoration takes < 500ms
- [ ] ✅ Token refresh takes < 2 seconds
- [ ] ✅ No memory leaks after 1 hour

---

## 🚀 Testing Timeline

### Day 1: Core Functionality
- ✅ Tests 1.1 - 2.4 (Auth & Persistence)
- 🎯 Goal: 100% pass rate

### Day 2: Edge Cases
- ✅ Tests 3.1 - 4.3 (Token Refresh & Captures)
- 🎯 Goal: 100% pass rate

### Day 3: Error Handling
- ✅ Tests 5.1 - 6.1 (Errors & Sign Out)
- 🎯 Goal: Graceful error handling

### Day 4: Soak Testing
- ✅ Long-running session (4+ hours)
- ✅ Multiple browser restarts
- ✅ High-volume captures (20+ clips)

---

## 📝 Bug Report Template

If you find issues, report using this format:

```
**Test:** [Test number, e.g., 2.2]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Logs:** [Paste console logs]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
**Browser:** Chrome [version]
**OS:** [macOS/Windows/Linux]
```

---

## ✅ Sign-Off

### Manual Testing Completed:
- [ ] Phase 1: Basic Auth
- [ ] Phase 2: Session Persistence
- [ ] Phase 3: Token Refresh
- [ ] Phase 4: Captures
- [ ] Phase 5: Error Handling
- [ ] Phase 6: Sign Out

### Ready for Production:
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Logs clean in production mode

**Tested By:** ________________  
**Date:** ________________  
**Sign-Off:** ________________  

---

## 🎯 Next Steps After Testing

1. If all tests pass → **Deploy to Chrome Web Store**
2. If tests fail → **Document bugs, fix, rebuild, retest**
3. Monitor user feedback for 48 hours after release
4. Plan follow-up improvements based on real usage

---

**Happy Testing! 🚀**

