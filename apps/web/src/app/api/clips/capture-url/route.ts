import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max execution time

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

    // Configure Chromium for serverless environment (Vercel)
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Set font config to null to avoid brotli files error on Vercel
    if (isProduction) {
      await chromium.font('/tmp/chromium-fonts')
    }
    
    // Launch browser with serverless-compatible Chromium
    const browser = await puppeteer.launch({
      args: isProduction ? [
        ...chromium.args,
        '--disable-web-security',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials',
      ] : [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      defaultViewport: {
        width: 1280,
        height: 1024,
      },
      executablePath: isProduction 
        ? await chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin')
        : process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      headless: true, // Always headless for serverless
    })

    try {
      const page = await browser.newPage()
      
      // Set user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )

      // Navigate to page with timeout
      console.log(`📄 Loading page: ${url}`)
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000, // 30 second timeout
      })

      // Wait a bit for dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Get page title
      const title = await page.title()
      console.log(`📝 Page title: ${title}`)

      // Extract text content
      const text = await page.evaluate(() => {
        // Remove script, style, and noscript tags
        const clone = document.body.cloneNode(true) as HTMLElement
        clone.querySelectorAll('script, style, noscript').forEach(el => el.remove())
        
        // Get text content
        const text = clone.textContent || ''
        
        // Clean up whitespace
        return text
          .replace(/\s+/g, ' ')
          .replace(/\n+/g, '\n')
          .trim()
      })
      console.log(`📄 Extracted text length: ${text.length} characters`)

      // Get HTML content
      const html = await page.content()
      console.log(`📄 Extracted HTML length: ${html.length} characters`)

      // Get favicon
      const favicon = await page.evaluate(() => {
        const faviconLink = document.querySelector('link[rel*="icon"]') as HTMLLinkElement
        return faviconLink?.href || `${window.location.protocol}//${window.location.host}/favicon.ico`
      })

      // Take full-page screenshot
      console.log(`📸 Capturing screenshot...`)
      const screenshotBuffer = await page.screenshot({
        fullPage: true,
        type: 'jpeg',
        quality: 85,
      }) as Buffer

      // Convert screenshot to base64
      const screenshotBase64 = `data:image/jpeg;base64,${Buffer.from(screenshotBuffer).toString('base64')}`
      console.log(`📸 Screenshot captured: ${screenshotBuffer.length} bytes`)

      // Upload screenshot to Supabase Storage
      const timestamp = Date.now()
      const screenshotFileName = `${user.id}/${timestamp}.jpg`
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('clips')
        .upload(screenshotFileName, screenshotBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadError) {
        console.error('Screenshot upload error:', uploadError)
        throw new Error(`Failed to upload screenshot: ${uploadError.message}`)
      }

      // Get public URL for screenshot
      const { data: { publicUrl } } = supabase
        .storage
        .from('clips')
        .getPublicUrl(screenshotFileName)

      console.log(`✅ Screenshot uploaded: ${publicUrl}`)

      // Create clip in database
      const { data: clip, error: insertError } = await supabase
        .from('clips')
        .insert({
          user_id: user.id,
          url: url,
          title: title || new URL(url).hostname,
          html_content: html,
          text_content: text,
          screenshot_url: publicUrl,
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
    } finally {
      await browser.close()
    }
  } catch (error: any) {
    console.error('❌ Capture error:', error)
    
    // Return user-friendly error messages
    let errorMessage = 'Failed to capture webpage'
    let statusCode = 500

    if (error.message?.includes('timeout')) {
      errorMessage = 'Page took too long to load. Please try again.'
      statusCode = 408
    } else if (error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
      errorMessage = 'Could not find the website. Please check the URL.'
      statusCode = 404
    } else if (error.message?.includes('ERR_CONNECTION')) {
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

