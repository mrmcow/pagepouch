import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data, error } = await supabase
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
        folder_id
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Clip not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ clip: data })
  } catch (error) {
    console.error('Get clip error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    
    // Only allow updating specific fields
    const allowedFields = ['title', 'notes', 'folder_id']
    const updates: any = {}
    
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('clips')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update clip' },
        { status: 500 }
      )
    }

    return NextResponse.json({ clip: data })
  } catch (error) {
    console.error('Update clip error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // First get the clip to check if it exists and get screenshot URL for cleanup
    const { data: clip, error: fetchError } = await supabase
      .from('clips')
      .select('screenshot_url')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Clip not found' },
        { status: 404 }
      )
    }

    // Delete the clip from database
    const { error: deleteError } = await supabase
      .from('clips')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete clip' },
        { status: 500 }
      )
    }

    // TODO: Delete screenshot from storage if needed
    // if (clip.screenshot_url) {
    //   // Extract file path from URL and delete from storage
    // }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete clip error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
