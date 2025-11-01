import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'
import { 
  getSubscriptionLimits, 
  getClipsRemaining, 
  hasReachedClipLimit 
} from '@/lib/subscription-limits'

export const runtime = 'nodejs'
export const maxDuration = 30 // 30 seconds for HTML/text capture

interface CaptureRequestBody {
  url: string
  folderId?: string
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Create Supabase client with the user's auth token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }
    
    console.log(`✅ Authenticated user: ${user.id}`)

    // Check user's subscription tier and current usage
    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const { data: usageData } = await supabase
      .from('user_usage')
      .select('clips_this_month')
      .eq('user_id', user.id)
      .single()

    const subscriptionTier = userProfile?.subscription_tier || 'free'
    const clipsThisMonth = usageData?.clips_this_month || 0

    // Pre-check limit (database trigger will enforce it atomically)
    if (hasReachedClipLimit(clipsThisMonth, subscriptionTier)) {
      const limits = getSubscriptionLimits(subscriptionTier)
      return NextResponse.json(
        { 
          error: `You have reached your monthly limit of ${limits.clipsPerMonth} clips. Upgrade to Pro for more clips.` 
        },
        { status: 429 }
      )
    }

    // Parse request body
    const body: CaptureRequestBody = await request.json()
    const { url, folderId } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let validatedUrl: URL
    try {
      validatedUrl = new URL(url)
      if (!['http:', 'https:'].includes(validatedUrl.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    console.log(`🌐 Capturing URL: ${url} for user: ${user.id}`)

    // Fetch the webpage HTML with browser-like headers
    let response: Response | undefined
    let attemptCount = 0
    const maxAttempts = 2
    
    while (attemptCount < maxAttempts) {
      attemptCount++
      
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      }
      
      // On retry, add Referer header (some sites require it)
      if (attemptCount > 1) {
        headers['Referer'] = validatedUrl.origin
        console.log(`🔄 Retry attempt ${attemptCount} with Referer header`)
      }
      
      response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(20000) // 20 second timeout
      })
      
      // If successful or not a 403, break out of retry loop
      if (response.ok || response.status !== 403) {
        break
      }
      
      // If we get 403 and have more attempts, continue
      if (attemptCount < maxAttempts) {
        console.log(`⚠️ Got 403, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 500)) // Brief delay
      }
    }

    if (!response) {
      throw new Error('Failed to fetch page: No response received')
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    console.log(`📄 Fetched HTML: ${html.length} bytes`)

    // Parse HTML with cheerio
    const $ = cheerio.load(html)

    // Extract title
    const title = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || validatedUrl.hostname

    // Extract text content
    $('script, style, noscript').remove()
    const text = $('body').text()
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()

    // Extract favicon
    let favicon = $('link[rel*="icon"]').attr('href') || ''
    if (favicon && !favicon.startsWith('http')) {
      favicon = new URL(favicon, url).href
    }
    if (!favicon) {
      favicon = `${validatedUrl.protocol}//${validatedUrl.hostname}/favicon.ico`
    }

    console.log(`📝 Extracted - Title: "${title}", Text: ${text.length} chars`)

    // Note: Clip URL captures HTML and text only
    // For screenshots, use the browser extension which captures full-page renders
    const screenshotUrl = null
    console.log('📝 Clip URL: HTML and text captured (use extension for screenshots)')

    // If no folder specified, use or create "Inbox" folder
    let targetFolderId = folderId
    if (!targetFolderId) {
      console.log('📁 No folder specified, checking for Inbox folder...')
      
      // Try to find existing Inbox folder
      const { data: existingFolder } = await supabase
        .from('folders')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Inbox')
        .single()
      
      if (existingFolder) {
        targetFolderId = existingFolder.id
        console.log('✅ Using existing Inbox folder:', targetFolderId)
      } else {
        // Create Inbox folder
        console.log('📁 Creating new Inbox folder...')
        const { data: newFolder, error: folderError } = await supabase
          .from('folders')
          .insert({
            user_id: user.id,
            name: 'Inbox',
            color: '#3b82f6' // Blue color for Inbox
          })
          .select('id')
          .single()
        
        if (folderError) {
          console.error('Failed to create Inbox folder:', folderError)
          // Continue without folder rather than failing
        } else {
          targetFolderId = newFolder.id
          console.log('✅ Created new Inbox folder:', targetFolderId)
        }
      }
    }

    // Create clip in database
    const { data: clip, error: insertError } = await supabase
      .from('clips')
      .insert({
        user_id: user.id,
        url: url,
        title: title || validatedUrl.hostname,
        html_content: html,
        text_content: text,
        screenshot_url: screenshotUrl,
        favicon_url: favicon,
        folder_id: targetFolderId || null,
        is_favorite: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      
      // Check if this is a clip limit violation from the database trigger
      if (insertError.code === '23514' || insertError.message?.includes('Clip limit reached')) {
        const limits = getSubscriptionLimits(subscriptionTier)
        return NextResponse.json(
          { error: insertError.message || `You have reached your monthly limit of ${limits.clipsPerMonth} clips. Upgrade to Pro for more clips.` },
          { status: 429 }
        )
      }
      
      throw new Error(`Failed to save clip: ${insertError.message}`)
    }

    console.log(`✅ Clip created successfully: ${clip.id}`)

    return NextResponse.json({
      success: true,
      clip: clip,
      message: 'Page captured successfully',
    })
  } catch (error: any) {
    console.error('❌ Capture error:', error)
    
    // Return user-friendly error messages
    let errorMessage = 'Failed to capture webpage'
    let statusCode = 500

    if (error.message?.includes('403')) {
      errorMessage = 'This website blocks automated access. Please use the browser extension to capture this page.'
      statusCode = 403
    } else if (error.message?.includes('timeout') || error.name === 'AbortError') {
      errorMessage = 'Page took too long to load. Please try again.'
      statusCode = 408
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
      errorMessage = 'Could not find the website. Please check the URL.'
      statusCode = 404
    } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ERR_CONNECTION')) {
      errorMessage = 'Could not connect to the website. Please try again later.'
      statusCode = 503
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
