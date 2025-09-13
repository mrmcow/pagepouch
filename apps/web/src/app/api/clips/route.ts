import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { CreateClipRequestSchema } from '@pagepouch/shared'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
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

    let dbQuery = supabase
      .from('clips')
      .select(`
        id,
        url,
        title,
        screenshot_url,
        html_content,
        text_content,
        favicon_url,
        notes,
        created_at,
        updated_at,
        folder_id,
        is_favorite
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (folderId) {
      dbQuery = dbQuery.eq('folder_id', folderId)
    }

    if (query) {
      // Use full-text search function
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

      return NextResponse.json({ clips: data || [] })
    }

    const { data, error } = await dbQuery

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clips' },
        { status: 500 }
      )
    }

    return NextResponse.json({ clips: data || [] })
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
      console.log('Using Bearer token authentication for extension')
      
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
      // Web app authentication with cookies
      console.log('Using cookie authentication for web app')
      supabase = createClient()
      
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
    
    console.log('Authenticated user:', user.email)

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

    // Insert clip into database
    const { data, error } = await supabase
      .from('clips')
      .insert({
        user_id: user.id,
        url,
        title,
        screenshot_url,
        html_content,
        text_content,
        favicon_url,
        folder_id,
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save clip' },
        { status: 500 }
      )
    }

    return NextResponse.json({ clip: data }, { status: 201 })
  } catch (error) {
    console.error('Create clip error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
