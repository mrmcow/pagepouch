import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'
import { 
  getSubscriptionLimits, 
  getClipsRemaining, 
  getUsageWarningLevel,
  hasReachedClipLimit,
  getDaysUntilReset,
  getNextResetDate,
  ensureUsageRow,
  incrementUsage
} from '@/lib/subscription-limits'
import { extractEntitiesServer } from '@/lib/entities/extractEntitiesServer'
import { sanitizeClipTitle } from '@/lib/entities/repairFusedText'

export const runtime = 'nodejs'
export const maxDuration = 60

interface CaptureRequestBody {
  url: string
  folderId?: string
}

async function takeScreenshot(url: string): Promise<Buffer | null> {
  let browser: any = null
  try {
    const puppeteer = await import('puppeteer-core')
    const chromium = await import('@sparticuz/chromium-min')

    const isLocal = process.env.NODE_ENV === 'development'

    let executablePath: string
    if (isLocal) {
      const possiblePaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
      ]
      const fs = await import('fs')
      executablePath = possiblePaths.find(p => fs.existsSync(p)) || ''
      if (!executablePath) {
        console.warn('No local Chrome found, skipping screenshot')
        return null
      }
    } else {
      executablePath = await chromium.default.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v147.0.0/chromium-v147.0.0-pack.x64.tar'
      )
    }

    browser = await puppeteer.default.launch({
      args: isLocal
        ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        : chromium.default.args,
      executablePath,
      headless: true,
      defaultViewport: { width: 1280, height: 960 },
    })

    const page = await browser.newPage()

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 })

    await new Promise(r => setTimeout(r, 2000))

    const bodyHeight = await page.evaluate(() => document.body.scrollHeight)
    const maxHeight = 12000
    const useFullPage = bodyHeight <= maxHeight

    if (!useFullPage) {
      await page.setViewport({ width: 1280, height: 960 })
    }

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: useFullPage,
      captureBeyondViewport: useFullPage,
    })

    const buf = Buffer.from(screenshot)
    console.log(`📸 Screenshot captured: ${buf.length} bytes, fullPage=${useFullPage}, bodyHeight=${bodyHeight}px`)
    return buf
  } catch (err) {
    console.error('Screenshot capture failed:', err)
    return null
  } finally {
    if (browser) {
      try { await browser.close() } catch { /* ignore */ }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }
    
    console.log(`✅ Authenticated user: ${user.id}`)

    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle()

    const subscriptionTier = userProfile?.subscription_tier || 'free'
    const clipsThisMonth = await ensureUsageRow(supabase, user.id)

    if (hasReachedClipLimit(clipsThisMonth, subscriptionTier)) {
      const limits = getSubscriptionLimits(subscriptionTier)
      return NextResponse.json(
        { 
          error: 'Clip limit reached',
          message: `You have reached your monthly limit of ${limits.clipsPerMonth} clips.`,
          clips_limit: limits.clipsPerMonth,
          clips_this_month: clipsThisMonth,
          subscription_tier: subscriptionTier,
          days_until_reset: getDaysUntilReset(),
          reset_date: getNextResetDate(),
        },
        { status: 429 }
      )
    }

    const body: CaptureRequestBody = await request.json()
    const { url, folderId } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

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

    // Run HTML fetch and headless screenshot in parallel
    const htmlFetchPromise = (async () => {
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
        
        if (attemptCount > 1) {
          headers['Referer'] = validatedUrl.origin
          console.log(`🔄 Retry attempt ${attemptCount} with Referer header`)
        }
        
        response = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(20000)
        })
        
        if (response.ok || response.status !== 403) break
        
        if (attemptCount < maxAttempts) {
          console.log(`⚠️ Got 403, retrying...`)
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      if (!response) throw new Error('Failed to fetch page: No response received')
      if (!response.ok) throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`)

      return response.text()
    })()

    const screenshotPromise = takeScreenshot(url)

    const [html, screenshotBuffer] = await Promise.all([htmlFetchPromise, screenshotPromise])

    console.log(`📄 Fetched HTML: ${html.length} bytes`)

    const $ = cheerio.load(html)

    const rawTitle =
      $('title').text().trim() || $('meta[property="og:title"]').attr('content') || validatedUrl.hostname
    const title = sanitizeClipTitle(rawTitle) || validatedUrl.hostname

    $('script, style, noscript').remove()
    const text = $('body').text()
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()

    let favicon = $('link[rel*="icon"]').attr('href') || ''
    if (favicon && !favicon.startsWith('http')) {
      favicon = new URL(favicon, url).href
    }
    if (!favicon) {
      favicon = `${validatedUrl.protocol}//${validatedUrl.hostname}/favicon.ico`
    }

    console.log(`📝 Extracted - Title: "${title}", Text: ${text.length} chars`)

    // Upload screenshot to Supabase Storage if captured
    let screenshotUrl: string | null = null
    if (screenshotBuffer) {
      try {
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(fileName, screenshotBuffer, {
            contentType: 'image/png',
            upsert: false,
          })

        if (uploadError) {
          console.error('Screenshot upload error:', uploadError)
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('screenshots')
            .getPublicUrl(uploadData.path)
          screenshotUrl = publicUrl
          console.log(`📸 Screenshot uploaded: ${screenshotUrl}`)
        }
      } catch (uploadError) {
        console.error('Screenshot upload failed:', uploadError)
      }
    }

    let targetFolderId = folderId
    if (!targetFolderId) {
      const { data: existingFolder } = await supabase
        .from('folders')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Inbox')
        .single()
      
      if (existingFolder) {
        targetFolderId = existingFolder.id
      } else {
        const { data: newFolder, error: folderError } = await supabase
          .from('folders')
          .insert({
            user_id: user.id,
            name: 'Inbox',
            color: '#3b82f6'
          })
          .select('id')
          .single()
        
        if (!folderError && newFolder) {
          targetFolderId = newFolder.id
        }
      }
    }

    // Extract entities from captured content
    const entityText = [text || '', title || validatedUrl.hostname, url].join('\n')
    const entities = await extractEntitiesServer(entityText, url, html || undefined)

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
        entities,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      
      if (insertError.code === '23514' || insertError.message?.includes('Clip limit reached')) {
        const limits = getSubscriptionLimits(subscriptionTier)
        return NextResponse.json(
          { 
            error: 'Clip limit reached',
            message: insertError.message || `You have reached your monthly limit of ${limits.clipsPerMonth} clips.`,
            clips_limit: limits.clipsPerMonth,
            clips_this_month: clipsThisMonth,
            subscription_tier: subscriptionTier,
            days_until_reset: getDaysUntilReset(),
            reset_date: getNextResetDate(),
          },
          { status: 429 }
        )
      }
      
      throw new Error(`Failed to save clip: ${insertError.message}`)
    }

    console.log(`✅ Clip created: ${clip.id} (screenshot: ${screenshotUrl ? 'yes' : 'no'})`)

    const newClipsThisMonth = await incrementUsage(supabase, user.id)
    const limits = getSubscriptionLimits(subscriptionTier)

    return NextResponse.json({
      success: true,
      clip: clip,
      message: screenshotUrl
        ? 'Page captured with screenshot'
        : 'Page captured (screenshot unavailable)',
      usage: {
        clips_this_month: newClipsThisMonth,
        clips_limit: limits.clipsPerMonth,
        clips_remaining: getClipsRemaining(newClipsThisMonth, subscriptionTier),
        subscription_tier: subscriptionTier,
        warning_level: getUsageWarningLevel(newClipsThisMonth, subscriptionTier),
      },
    })
  } catch (error: any) {
    console.error('❌ Capture error:', error)
    
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
