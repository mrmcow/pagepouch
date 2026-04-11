// Supabase client for browser extension
// SECURITY NOTE: Extension does NOT include Supabase credentials
// All authentication and data operations go through the web app's API

// Firefox compatibility layer
const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;

// Get the API base URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://pagestash.app'
  : 'http://localhost:3000'

// Extension-specific auth helpers
export class ExtensionAuth {
  static async signIn(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        return { data: null, error: { message: result.error } }
      }

      if (result.session) {
        await extensionAPI.storage.local.set({
          authToken: result.session.access_token,
          refreshToken: result.session.refresh_token,
          userEmail: result.user?.email,
          userId: result.user?.id,
        })
      }

      return { 
        data: { 
          session: result.session, 
          user: result.user 
        }, 
        error: null 
      }
    } catch (err: any) {
      return { 
        data: null, 
        error: { message: err.message || 'Network error' } 
      }
    }
  }

  static async signUp(email: string, password: string, fullName?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      })

      const result = await response.json()

      if (!response.ok) {
        return { data: null, error: { message: result.error } }
      }

      if (result.session) {
        await extensionAPI.storage.local.set({
          authToken: result.session.access_token,
          refreshToken: result.session.refresh_token,
          userEmail: result.user?.email,
          userId: result.user?.id,
        })
      }

      return { 
        data: { 
          session: result.session, 
          user: result.user 
        }, 
        error: null 
      }
    } catch (err: any) {
      return { 
        data: null, 
        error: { message: err.message || 'Network error' } 
      }
    }
  }

  static async signOut() {
    await extensionAPI.storage.local.remove([
      'authToken',
      'refreshToken',
      'userEmail',
      'userId',
    ])
    return { error: null }
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

      if (!stored.authToken) {
        return false
      }

      // Validate token with a lightweight API call
      try {
        const res = await fetch(`${API_BASE_URL}/api/usage`, {
          headers: { 'Authorization': `Bearer ${stored.authToken}` },
        })
        if (res.status === 401 && stored.refreshToken) {
          const refreshResult = await this.refreshSession()
          return !refreshResult.error
        }
        return res.ok
      } catch {
        // Network error — trust the stored token and let real calls handle failures
        return true
      }
    } catch (err) {
      await this.signOut()
      return false
    }
  }

  static async getSession() {
    // Get session from local storage
    return new Promise<{token: string | null, userId: string | null}>((resolve) => {
      extensionAPI.storage.local.get(['authToken', 'userId'], (result) => {
        resolve({
          token: result.authToken || null,
          userId: result.userId || null,
        })
      })
    })
  }

  static async refreshSession(): Promise<{ data: any; error: Error | null }> {
    try {
      const stored = await new Promise<{ refreshToken: string | null }>((resolve) => {
        extensionAPI.storage.local.get(['refreshToken'], (result) => {
          resolve({ refreshToken: result.refreshToken || null })
        })
      })

      if (!stored.refreshToken) {
        await this.signOut()
        return { data: null, error: new Error('No refresh token available') }
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: stored.refreshToken }),
      })

      const result = await response.json()

      if (!response.ok || !result.session) {
        await this.signOut()
        return { data: null, error: new Error(result.error || 'Session expired — please sign in again') }
      }

      await extensionAPI.storage.local.set({
        authToken: result.session.access_token,
        refreshToken: result.session.refresh_token,
        userEmail: result.user?.email,
        userId: result.user?.id,
      })

      return { data: { session: result.session, user: result.user }, error: null }
    } catch (err: any) {
      await this.signOut()
      return { data: null, error: new Error(err.message || 'Session refresh failed') }
    }
  }
}

// API helpers for extension
export class ExtensionAPI {
  // Get the correct API base URL based on environment
  private static getApiBaseUrl(): string {
    // In production, use the deployed web app URL
    // In development, use localhost
    return API_BASE_URL
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

    if (response.status === 401) {
      const refreshResult = await ExtensionAuth.refreshSession()

      if (refreshResult.error) {
        throw new Error('Session expired — please sign in again')
      }

      const { token: newToken } = await ExtensionAuth.getSession()

      if (!newToken) {
        throw new Error('Session expired — please sign in again')
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

    const response = await this.authenticatedFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clipData),
    })

    if (!response.ok) {
      const errorText = await response.text();
      
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || 'Failed to save clip' };
      }
      
      throw new Error(error.error || 'Failed to save clip')
    }

    return response.json();
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
