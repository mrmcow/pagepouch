// Supabase client for browser extension
import { createClient } from '@supabase/supabase-js'

// Firefox compatibility layer
const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;

const supabaseUrl = process.env.SUPABASE_URL || 'https://gwvsltgmjreructvbpzg.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dnNsdGdtanJlcnVjdHZicHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MjY2OTksImV4cCI6MjA3MzMwMjY5OX0.hdq5nlxw5v-zRZ2ZwogvDGzDC3eGZ9u13W0KBfQqeHs'

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

  static async getSession() {
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
      ? 'https://pagepouch-web.vercel.app'
      : 'http://localhost:3000'
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
    const { token } = await ExtensionAuth.getSession()
    
    if (!token) {
      throw new Error('Not authenticated')
    }

    const apiUrl = `${this.getApiBaseUrl()}/api/clips`
    console.log('Saving clip to API with token:', token ? 'present' : 'missing');
    console.log('API endpoint:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(clipData),
    })

    console.log('API response status:', response.status);
    console.log('API response headers:', Object.fromEntries(response.headers.entries()));

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
    const { token } = await ExtensionAuth.getSession()
    
    if (!token) {
      throw new Error('Not authenticated')
    }

    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    if (params?.folder_id) searchParams.set('folder_id', params.folder_id)
    if (params?.q) searchParams.set('q', params.q)

    const response = await fetch(`${this.getApiBaseUrl()}/api/clips?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch clips')
    }

    return response.json()
  }

  static async getFolders() {
    const { token } = await ExtensionAuth.getSession()
    
    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${this.getApiBaseUrl()}/api/folders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch folders')
    }

    return response.json()
  }
}
