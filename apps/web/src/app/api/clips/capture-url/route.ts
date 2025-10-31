import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import * as cheerio from 'cheerio'

export const runtime = 'nodejs'
export const maxDuration = 30 // 30 seconds max execution time

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
    
    // Create Supabase client and verify user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
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
    const response = await fetch(url, {
      headers: {
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
      },
      signal: AbortSignal.timeout(20000) // 20 second timeout
    })

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

    // For now, we'll skip screenshot - can add later with a service like ScreenshotAPI
    // Or implement with playwright-aws-lambda in the future
    const screenshotUrl = null

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
        folder_id: folderId || null,
        is_favorite: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
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
