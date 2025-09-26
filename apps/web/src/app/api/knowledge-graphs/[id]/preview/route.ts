import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const graphId = params.id
    let supabase
    let user

    // Check for Bearer token (extension) or use cookies (web app)
    const authHeader = request.headers.get('authorization')
    
    if (authHeader?.startsWith('Bearer ')) {
      // Extension authentication with Bearer token
      const token = authHeader.substring(7)
      
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
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      
      user = userData.user
    } else {
      // Web app authentication with cookies
      supabase = createClient()
      
      const { data: userData, error: authError } = await supabase.auth.getUser()
      
      if (authError || !userData.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = userData.user
    }

    const body = await request.json()
    const { preview_image } = body

    if (!preview_image) {
      return NextResponse.json({ error: 'Preview image is required' }, { status: 400 })
    }

    // Validate that the graph belongs to the user
    const { data: existingGraph, error: fetchError } = await supabase
      .from('knowledge_graphs')
      .select('id, user_id')
      .eq('id', graphId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGraph) {
      return NextResponse.json({ error: 'Graph not found' }, { status: 404 })
    }

    // Update the graph with the preview image
    const { data: updatedGraph, error: updateError } = await supabase
      .from('knowledge_graphs')
      .update({ 
        preview_image,
        updated_at: new Date().toISOString()
      })
      .eq('id', graphId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating graph preview:', updateError)
      return NextResponse.json({ error: 'Failed to update preview' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      graph: updatedGraph 
    })

  } catch (error) {
    console.error('Error in graph preview update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
