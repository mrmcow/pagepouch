import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { CreateClipRequestSchema } from '@pagestash/shared'
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

// NOTE: Entity-extraction helpers are imported dynamically inside POST() only.
// They pull in jsdom (~10MB) + @mozilla/readability — loading those at module
// init forced every cold start (including GET list calls) to hydrate the heavy
// deps, which could crash the serverless function on memory limits and bring
// the entire /api/clips endpoint down.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// POST may run entity extraction (jsdom + readability + compromise). Give it room.
export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 503 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const folderId = searchParams.get('folder_id')
    const query = searchParams.get('q')

    // Light select — never send html_content or text_content in list responses.
    // Full content is fetched on demand via GET /api/clips/[id] when a clip is opened.
    // Note: omit `entities` here so list loads even if the DB migration has not been applied yet.
    // Full clip detail (GET /api/clips/[id]) includes entities when the column exists.
    const listSelect = `
      id,
      url,
      title,
      screenshot_url,
      favicon_url,
      notes,
      created_at,
      updated_at,
      folder_id,
      is_favorite
    `

    if (query) {
      // Server-side full-text search via Postgres tsvector index
      const { data, error } = await supabase.rpc('search_clips', {
        search_query: query,
        user_uuid: user.id,
        folder_uuid: folderId || null,
        limit_count: limit,
        offset_count: offset,
      })

      if (error) {
        console.error('Search error:', error)
        return NextResponse.json(
          { error: 'Search failed' },
          { status: 500 }
        )
      }

      // Strip heavy content fields from RPC results too
      const lightData = (data || []).map(({ html_content, text_content, ...clip }: any) => clip)
      return NextResponse.json({ clips: lightData, total: lightData.length })
    }

    let dbQuery = supabase
      .from('clips')
      .select(listSelect)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    let countQuery = supabase
      .from('clips')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (folderId) {
      dbQuery = dbQuery.eq('folder_id', folderId)
      countQuery = countQuery.eq('folder_id', folderId)
    }

    // Run data and count in parallel — one round trip each
    const [{ data, error }, { count, error: countError }] = await Promise.all([
      dbQuery,
      countQuery,
    ])

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clips' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      clips: data || [], 
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0)
    })
  } catch (error) {
    console.error('Get clips error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for Bearer token (from extension) or use cookies (from web app)
    const authHeader = request.headers.get('authorization')
    let supabase
    let user
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extension authentication with Bearer token
      const token = authHeader.substring(7)
      
      // Create a client with the Bearer token
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      )
      
      // Verify the token and get user
      const { data: userData, error: authError } = await supabase.auth.getUser()
      
      if (authError || !userData.user) {
        console.error('Bearer token auth error:', authError)
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      
      user = userData.user
    } else {
      supabase = createClient()
      if (!supabase) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 503 })
      }

      const { data: userData, error: authError } = await supabase.auth.getUser()
      
      if (authError || !userData.user) {
        console.error('Cookie auth error:', authError)
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = userData.user
    }

    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle()

    if (userError) {
      console.error('Error fetching user profile:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    const subscriptionTier = userProfile?.subscription_tier || 'free'
    const clipsThisMonth = await ensureUsageRow(supabase, user.id)

    // Pre-check limit (for better UX), but database trigger will enforce it atomically
    // This prevents unnecessary processing of screenshots for over-limit requests
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

    const body = await request.json()
    
    // Validate request body
    const validationResult = CreateClipRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { url, title, screenshot_data, html_content, text_content, favicon_url, folder_id, notes } = validationResult.data

    // Dynamic imports — keep jsdom + readability + compromise out of the GET cold path.
    // Title sanitization is small and deterministic; if the import itself fails we still
    // want to save the raw title rather than crashing the entire save.
    type ExtractEntitiesFn = (text: string, url?: string, html?: string) => Promise<unknown>
    let safeTitle = title
    let extractEntitiesServerFn: ExtractEntitiesFn | null = null
    try {
      const [{ sanitizeClipTitle }, entityModule] = await Promise.all([
        import('@/lib/entities/repairFusedText'),
        import('@/lib/entities/extractEntitiesServer'),
      ])
      safeTitle = sanitizeClipTitle(title)
      extractEntitiesServerFn = entityModule.extractEntitiesServer as unknown as ExtractEntitiesFn
    } catch (importError) {
      console.error('[clips POST] entity stack import failed; saving without enrichment', importError)
    }

    let screenshot_url = null

    // Upload screenshot if provided
    if (screenshot_data) {
      try {
        // Convert base64 to blob
        const base64Data = screenshot_data.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(fileName, buffer, {
            contentType: 'image/png',
            upsert: false,
          })

        if (uploadError) {
          console.error('Screenshot upload error:', uploadError)
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('screenshots')
            .getPublicUrl(uploadData.path)
          
          screenshot_url = publicUrl
        }
      } catch (uploadError) {
        console.error('Screenshot processing error:', uploadError)
        // Continue without screenshot if upload fails
      }
    }

    // Extract entities from content. Entity extraction is an enrichment, NOT a
    // requirement — it must never block a save. jsdom/readability/compromise can
    // throw on weird HTML, run out of memory, or simply not be installed.
    let entities: unknown = null
    if (extractEntitiesServerFn) {
      try {
        const entityText = [text_content || '', safeTitle || '', url || ''].join('\n')
        entities = await extractEntitiesServerFn(entityText, url, html_content || undefined)
      } catch (entityError) {
        console.error('[clips POST] entity extraction failed; saving without entities', entityError)
        entities = null
      }
    }

    // Build the insert payload. We try with `entities` first and fall back
    // automatically if the column doesn't exist in the deployed schema (PGRST204).
    // This makes the route resilient to environments where the
    // docs/migrations/add_entities_column.sql migration has not yet been applied.
    const baseInsert = {
      user_id: user.id,
      url,
      title: safeTitle,
      screenshot_url,
      html_content,
      text_content,
      favicon_url,
      folder_id,
      notes,
    }

    let data: any = null
    let error: any = null

    {
      const first = await supabase
        .from('clips')
        .insert({ ...baseInsert, entities })
        .select()
        .single()
      data = first.data
      error = first.error
    }

    // PostgREST returns code 'PGRST204' when a referenced column doesn't exist
    // in the schema cache. If `entities` is the offender, retry without it so
    // the save still succeeds while we surface a clear server log.
    if (
      error &&
      (error.code === 'PGRST204' || /entities/i.test(error.message || '')) &&
      /entities/i.test((error.message || '') + ' ' + (error.details || ''))
    ) {
      console.warn(
        '[clips POST] `entities` column missing in production database — retrying insert without it. ' +
        'Apply docs/migrations/add_entities_column.sql in the Supabase SQL editor to enable entity extraction.'
      )
      const retry = await supabase
        .from('clips')
        .insert(baseInsert)
        .select()
        .single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('[clips POST] database insert error', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      // Check if this is a clip limit violation from the database trigger
      // Error code 23514 is check_violation, and message will contain "Clip limit reached"
      if (error.code === '23514' || error.message?.includes('Clip limit reached')) {
        const limits = getSubscriptionLimits(subscriptionTier)
        return NextResponse.json(
          { 
            error: 'Clip limit reached',
            message: error.message || `You have reached your monthly limit of ${limits.clipsPerMonth} clips.`,
            clips_limit: limits.clipsPerMonth,
            clips_this_month: clipsThisMonth,
            subscription_tier: subscriptionTier,
            days_until_reset: getDaysUntilReset(),
            reset_date: getNextResetDate(),
          },
          { status: 429 }
        )
      }

      // Surface the underlying database error code so the client (extension toast,
      // browser devtools) can show something more useful than "Failed to save clip".
      // This is safe to expose: it's a schema-level error code, not user data.
      return NextResponse.json(
        {
          error: 'Failed to save clip',
          db_error_code: error.code || null,
          db_error_message: error.message || null,
        },
        { status: 500 }
      )
    }

    const newClipsThisMonth = await incrementUsage(supabase, user.id)
    const limits = getSubscriptionLimits(subscriptionTier)

    return NextResponse.json({ 
      clip: data,
      usage: {
        clips_this_month: newClipsThisMonth,
        clips_limit: limits.clipsPerMonth,
        clips_remaining: getClipsRemaining(newClipsThisMonth, subscriptionTier),
        subscription_tier: subscriptionTier,
        warning_level: getUsageWarningLevel(newClipsThisMonth, subscriptionTier)
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create clip error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
