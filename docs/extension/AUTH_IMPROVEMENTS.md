# Chrome Extension Authentication Improvements

## Overview
This document outlines the technical debt in the extension's authentication system and provides actionable improvements.

## Current Issues

### 1. Token Refresh Not Implemented (Critical)
- **Location**: `apps/extension/src/utils/supabase.ts` line 173-178
- **Impact**: When tokens expire (~1 hour), users silently fall back to local storage
- **Severity**: HIGH - Causes data not to sync to cloud

### 2. Silent Fallback with Misleading Messages
- **Location**: `apps/extension/src/background/index.ts` line 432-449
- **Impact**: Users think data will sync later, but it won't if auth failed
- **Severity**: HIGH - Poor user experience and data loss perception

### 3. No Error Type Differentiation
- **Impact**: Network errors, auth errors, and API errors all look the same
- **Severity**: MEDIUM - Hard to debug issues

### 4. No Proactive Token Validation
- **Impact**: Extension doesn't check token expiration before making API calls
- **Severity**: MEDIUM - Unnecessary failed requests

## Recommended Solutions

### Solution 1: Implement Token Refresh (Must Have)

```typescript
// In ExtensionAuth class
static async refreshSession() {
  try {
    const stored = await new Promise<{ refreshToken: string | null }>((resolve) => {
      extensionAPI.storage.local.get(['refreshToken'], (result) => {
        resolve({ refreshToken: result.refreshToken || null })
      })
    })
    
    if (!stored.refreshToken) {
      return { data: null, error: new Error('No refresh token available') }
    }
    
    // Call the API to refresh the token
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: stored.refreshToken }),
    })
    
    if (!response.ok) {
      // Refresh token is invalid/expired - clear auth and force re-login
      await this.signOut()
      return { data: null, error: new Error('Refresh token expired - please sign in again') }
    }
    
    const result = await response.json()
    
    // Store new tokens
    if (result.session) {
      await extensionAPI.storage.local.set({
        authToken: result.session.access_token,
        refreshToken: result.session.refresh_token,
      })
      
      return { data: { session: result.session }, error: null }
    }
    
    return { data: null, error: new Error('Failed to refresh session') }
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Token refresh failed') }
  }
}

// Add token expiration tracking
static async storeSessionWithExpiry(session: any) {
  const expiresAt = Date.now() + (session.expires_in * 1000) // Convert to milliseconds
  
  await extensionAPI.storage.local.set({
    authToken: session.access_token,
    refreshToken: session.refresh_token,
    tokenExpiresAt: expiresAt,
  })
}

// Check if token is expired or about to expire (within 5 minutes)
static async isTokenExpiringSoon(): Promise<boolean> {
  const stored = await new Promise<{ tokenExpiresAt: number | null }>((resolve) => {
    extensionAPI.storage.local.get(['tokenExpiresAt'], (result) => {
      resolve({ tokenExpiresAt: result.tokenExpiresAt || null })
    })
  })
  
  if (!stored.tokenExpiresAt) {
    return true // No expiry info means we should refresh
  }
  
  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000)
  return stored.tokenExpiresAt < fiveMinutesFromNow
}
```

### Solution 2: Better Error Handling with User Feedback

```typescript
// In background/index.ts - handlePageCapture function
if (token) {
  try {
    // Check if token is expiring soon and refresh if needed
    const isExpiring = await ExtensionAuth.isTokenExpiringSoon()
    if (isExpiring) {
      console.log('Token expiring soon, refreshing...')
      const refreshResult = await ExtensionAuth.refreshSession()
      
      if (refreshResult.error) {
        // Token refresh failed - notify user to re-login
        extensionAPI.runtime.sendMessage({
          type: 'CAPTURE_PROGRESS',
          payload: { 
            status: 'error', 
            message: 'Session expired. Please sign in again.',
            requiresAuth: true
          }
        } as ExtensionMessage)
        return
      }
    }
    
    // Save to Supabase
    const saveResult = await ExtensionAPI.saveClip(clipData)
    console.log('Clip saved to Supabase successfully')
    
    extensionAPI.runtime.sendMessage({
      type: 'CAPTURE_PROGRESS',
      payload: { 
        status: 'complete', 
        message: 'Capture saved to cloud!',
        usage: saveResult.usage
      }
    } as ExtensionMessage)
    
  } catch (error) {
    console.error('Failed to save to Supabase:', error)
    
    // Differentiate error types
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    let userMessage = 'Capture saved locally'
    let shouldSync = true
    
    if (errorMessage.includes('401') || errorMessage.includes('authentication') || errorMessage.includes('token')) {
      userMessage = 'Session expired. Saved locally - please sign in to sync'
      shouldSync = false
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      userMessage = 'Network error. Saved locally - will sync when online'
      shouldSync = true
    } else if (errorMessage.includes('limit')) {
      userMessage = 'Usage limit reached. Saved locally - upgrade to sync'
      shouldSync = false
    } else {
      userMessage = 'Save failed. Saved locally - will retry'
      shouldSync = true
    }
    
    // Fallback to local storage
    await saveClipLocally(clipData)
    
    // Send appropriate message
    extensionAPI.runtime.sendMessage({
      type: 'CAPTURE_PROGRESS',
      payload: { 
        status: 'complete', 
        message: userMessage,
        isLocal: true,
        willSync: shouldSync
      }
    } as ExtensionMessage)
  }
}
```

### Solution 3: Improved authenticatedFetch with Better Retry Logic

```typescript
// In ExtensionAPI class
private static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Check if token needs refresh before making request
  const isExpiring = await ExtensionAuth.isTokenExpiringSoon()
  if (isExpiring) {
    console.log('Token expiring soon, refreshing proactively...')
    const refreshResult = await ExtensionAuth.refreshSession()
    
    if (refreshResult.error) {
      throw new Error('Authentication expired - please sign in again')
    }
  }
  
  const { token } = await ExtensionAuth.getSession()
  
  if (!token) {
    throw new Error('Not authenticated')
  }

  // Make first request
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  })

  // Handle 401 - token expired during request
  if (response.status === 401) {
    console.log('Received 401, attempting token refresh...')
    const refreshResult = await ExtensionAuth.refreshSession()
    
    if (refreshResult.error) {
      // Could not refresh - user needs to sign in
      throw new Error('Authentication expired - please sign in again')
    }
    
    // Retry with new token
    const { token: newToken } = await ExtensionAuth.getSession()
    
    if (!newToken) {
      throw new Error('Authentication failed after refresh')
    }
    
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`,
      },
    })
  }

  return response
}
```

### Solution 4: Add Auth Refresh API Endpoint

Create a new API endpoint at `apps/web/src/app/api/auth/refresh/route.ts`:

```typescript
import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json()

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    })

    if (error) {
      console.error('Token refresh error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Solution 5: Update Sign In/Sign Up to Track Expiry

Modify the `signIn` and `signUp` methods to use the new `storeSessionWithExpiry`:

```typescript
// Replace the storage.set calls with:
if (result.session) {
  await this.storeSessionWithExpiry(result.session)
  await extensionAPI.storage.local.set({
    userEmail: result.user?.email,
    userId: result.user?.id,
  })
}
```

## Implementation Priority

1. **Phase 1 (Critical - Do First)**:
   - Add auth refresh API endpoint
   - Implement token refresh in extension
   - Add token expiry tracking

2. **Phase 2 (Important)**:
   - Improve error handling with specific messages
   - Add proactive token refresh before API calls
   - Update authenticatedFetch retry logic

3. **Phase 3 (Nice to Have)**:
   - Add visual indicator in popup when auth is expired
   - Add background sync retry with exponential backoff
   - Add telemetry to track how often tokens expire

## Testing Checklist

- [ ] Test token refresh when token expires
- [ ] Test token refresh failure (invalid refresh token)
- [ ] Test saving clip when token is about to expire
- [ ] Test saving clip when offline (should show network error)
- [ ] Test saving clip when at usage limit
- [ ] Test saving clip when refresh token is expired
- [ ] Test that local clips sync after re-authentication
- [ ] Test multiple rapid captures with expiring token

## Migration Notes

- Existing users will need to sign in again (their old tokens don't have expiry tracking)
- Consider showing a notification on first load after update: "Please sign in again for improved reliability"
- Old local clips should still sync when user signs in

## Estimated Impact

- **Development Time**: 4-6 hours
- **Testing Time**: 2-3 hours
- **User Impact**: HIGH - Will significantly improve reliability and user trust
- **Risk**: MEDIUM - Requires careful testing of auth flow

## Additional Considerations

### Background Sync Improvements

Consider implementing a background sync service that periodically tries to sync local clips:

```typescript
// Add to background/index.ts
chrome.alarms.create('syncLocalClips', { periodInMinutes: 30 })

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncLocalClips') {
    const { token } = await ExtensionAuth.getSession()
    if (token) {
      await syncLocalClips()
    }
  }
})
```

### User Education

Add a settings page or help section that explains:
- How cloud sync works
- What happens when offline
- How to check sync status
- How to manually trigger sync

## Conclusion

These improvements will transform the extension from a prototype with silent failures to a production-ready tool with proper authentication handling. The key is implementing token refresh and providing clear, actionable feedback to users when things go wrong.

