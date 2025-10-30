// Supabase client for browser extension
import { createClient } from '@supabase/supabase-js'

// Firefox compatibility layer
const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;

// SECURITY: These values must be provided via environment variables at build time
// Never hardcode production credentials in source code
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Extension-specific auth helpers
export class ExtensionAuth {
  static async signIn(email: string, password: string) {
    console.log('🔐 ExtensionAuth.signIn called for:', email);
    console.log('🔐 Supabase URL:', supabaseUrl);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('🔐 Supabase signIn response:', { 
      hasData: !!data, 
      hasSession: !!data.session,
      hasUser: !!data.user,
      hasError: !!error,
      errorMessage: error?.message 
    });

    if (data.session) {
      console.log('🔐 Storing session in chrome storage');
      // Store session in extension storage
      await extensionAPI.storage.local.set({
        authToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        userEmail: data.user?.email,
        userId: data.user?.id,
      })
    }

    return { data, error }
  }

  static async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (data.session) {
      // Store session in extension storage
      await extensionAPI.storage.local.set({
        authToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        userEmail: data.user?.email,
        userId: data.user?.id,
      })
    }

    return { data, error }
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    
    // Clear extension storage
    await extensionAPI.storage.local.remove([
      'authToken',
      'refreshToken',
      'userEmail',
      'userId',
    ])

    return { error }
  }

  static async restoreSession(): Promise<boolean> {
    try {
      const stored = await new Promise<{
        authToken: string | null
        refreshToken: string | null
        userId: string | null
        userEmail: string | null
      }>((resolve) => {
        extensionAPI.storage.local.get(
          ['authToken', 'refreshToken', 'userId', 'userEmail'], 
          (result) => {
            resolve({
              authToken: result.authToken || null,
              refreshToken: result.refreshToken || null,
              userId: result.userId || null,
              userEmail: result.userEmail || null,
            })
          }
        )
      })

      // No stored session
      if (!stored.authToken || !stored.refreshToken) {
        console.log('🔐 No stored session found')
        return false
      }

      console.log('🔐 Restoring session for user:', stored.userEmail)

      // Restore session in Supabase client
      const { data, error } = await supabase.auth.setSession({
        access_token: stored.authToken,
        refresh_token: stored.refreshToken,
      })

      if (error) {
        console.error('🔐 Failed to restore session:', error.message)
        // Clear invalid tokens
        await this.signOut()
        return false
      }

      // Session restored successfully
      if (data.session) {
        console.log('🔐 Session restored successfully')
        
        // Update stored tokens if they were refreshed
        await extensionAPI.storage.local.set({
          authToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          userEmail: data.user?.email,
          userId: data.user?.id,
        })
        return true
      }

      return false
    } catch (err) {
      console.error('🔐 Session restoration error:', err)
      await this.signOut()
      return false
    }
  }

  static async getSession() {
    // First try to get from Supabase client (if session is active)
    const { data } = await supabase.auth.getSession()
    
    if (data.session) {
      return {
        token: data.session.access_token,
        userId: data.session.user.id,
      }
    }

    // Fallback to storage (shouldn't happen if restoreSession is called)
    return new Promise<{token: string | null, userId: string | null}>((resolve) => {
      extensionAPI.storage.local.get(['authToken', 'userId'], (result) => {
        resolve({
          token: result.authToken || null,
          userId: result.userId || null,
        })
      })
    })
  }

  static async refreshSession() {
    const { refreshToken } = await new Promise<{refreshToken: string | null}>((resolve) => {
      extensionAPI.storage.local.get(['refreshToken'], (result) => {
        resolve({ refreshToken: result.refreshToken || null })
      })
    })

    if (!refreshToken) {
      return { data: null, error: new Error('No refresh token') }
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    })

    if (data.session) {
      // Update stored tokens
      await extensionAPI.storage.local.set({
        authToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      })
    }

    return { data, error }
  }
}

// API helpers for extension
export class ExtensionAPI {
  // Get the correct API base URL based on environment
  private static getApiBaseUrl(): string {
    // In production, use the deployed web app URL
    // In development, use localhost
    return process.env.NODE_ENV === 'production' 
      ? 'https://pagestash-web.vercel.app'
      : 'http://localhost:3000'
  }

  // Helper method to make authenticated requests with automatic retry
  private static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Ensure session is valid before API call
    await ExtensionAuth.restoreSession()
    
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

    // Handle 401 - token might have expired mid-request
    if (response.status === 401) {
      console.log('Token expired, refreshing and retrying...');
      await ExtensionAuth.refreshSession();
      
      // Retry with new token
      const { token: newToken } = await ExtensionAuth.getSession();
      
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

  static async saveClip(clipData: {
    url: string
    title: string
    screenshot_data?: string
    html_content?: string
    text_content?: string
    favicon_url?: string
    folder_id?: string
    notes?: string
  }) {
    const apiUrl = `${this.getApiBaseUrl()}/api/clips`
    console.log('Saving clip to API endpoint:', apiUrl);

    const response = await this.authenticatedFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clipData),
    })

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || 'Failed to save clip' };
      }
      
      throw new Error(error.error || 'Failed to save clip')
    }

    const result = await response.json();
    console.log('Clip saved successfully:', result);
    return result;
  }

  static async getClips(params?: {
    limit?: number
    offset?: number
    folder_id?: string
    q?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    if (params?.folder_id) searchParams.set('folder_id', params.folder_id)
    if (params?.q) searchParams.set('q', params.q)

    const response = await this.authenticatedFetch(
      `${this.getApiBaseUrl()}/api/clips?${searchParams}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch clips')
    }

    return response.json()
  }

  static async getFolders() {
    const response = await this.authenticatedFetch(
      `${this.getApiBaseUrl()}/api/folders`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch folders')
    }

    return response.json()
  }

  static async getUsage() {
    const response = await this.authenticatedFetch(
      `${this.getApiBaseUrl()}/api/usage`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch usage data')
    }

    return response.json()
  }

  static async createFolder(folderData: { name: string; color?: string }) {
    const response = await this.authenticatedFetch(
      `${this.getApiBaseUrl()}/api/folders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(folderData),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create folder')
    }

    const result = await response.json()
    return result.folder
  }
}
